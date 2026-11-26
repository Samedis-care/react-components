import {
	AdvancedDeleteRequest,
	ModelFieldName,
	ModelGetResponse,
	ModelUnknown,
} from "../../backend-integration/Model/Model";
import type { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import Connector, { ResponseMeta } from "./Connector";
import ApiConnector from "./ApiConnector";
import last from "../../utils/last";

interface QueuedFunction {
	type: "create" | "update" | "delete";
	/**
	 * The record's id as mapId gives it: the real id once the backend has one, the fake id
	 * of a record whose create is still queued; null for an advanced delete
	 * @remarks Every lookup maps the id it is given before comparing, and index and read
	 *          map the ids of the records they hand out: a caller keeps the fake id of a
	 *          record created through this connector after the queue was worked.
	 */
	id: string | null;
	func: () => unknown;
	result: ModelGetResponse<ModelUnknown> | null;
	/**
	 * For a delete: the ids it covers
	 * @remarks Separate from id, which joins them for display, so that a single id can
	 *          be looked up and cancelled without parsing it back apart
	 */
	deleteIds?: string[];
	/**
	 * For a delete: the records it last hid from an index call
	 * @remarks Filled by index, read through getQueuedDeleteRecords. A caller which shows
	 *          a queued delete as pending and undoable cannot get the record anywhere
	 *          else: index no longer lists it, and read throws for it.
	 */
	deletedRecords?: Record<string, unknown>[];
	/**
	 * For a delete covering more than one id: re-creates the request for a subset of them
	 * @remarks Closes over the model, which the queue does not otherwise retain, so that
	 *          cancelling one id can keep the request for the others. Never called with
	 *          an empty list — an entry with nothing left to delete is dropped instead.
	 */
	rebuildDelete?: (ids: string[]) => () => unknown;
}

/**
 * A queued write operation's kind
 */
export type QueuedOperation = QueuedFunction["type"];

/**
 * A queued create or update the backend refused when workQueue sent it
 */
export interface QueuedWriteFailure {
	/**
	 * The record's id as index and read hand it out: the fake id of a record whose create
	 * was refused, and of a record created through this connector by an earlier workQueue
	 */
	id: string;
	/**
	 * The write that was refused
	 */
	operation: "create" | "update";
	/**
	 * Why it was refused, as the real connector rejected
	 */
	error: Error;
}

/**
 * Makes the error workQueue rejects with when the backend refused writes, e.g. one that
 * names the records the way the control listing them does
 * @param failures The refused writes, in the order they were queued
 * @returns The error, or undefined to reject as without a factory
 * @see LazyConnector.setQueueErrorFactory
 */
export type QueueErrorFactory = (
	failures: QueuedWriteFailure[],
) => Error | undefined;

type QueueChangeHandler = (queue: QueuedFunction[]) => void;

export enum IndexEnhancementLevel {
	/**
	 * Pass though index call to backend
	 */
	None,
	/**
	 * Pass though index call to backend, append new records to the result and lay the
	 * fields of queued updates over the rows they change
	 */
	Basic,
}

/**
 * Forwards all read calls (index, read) to the real connector directly but queues all writing calls (create, update, delete) which can be fired at once
 * @remarks Does not support relations, enhances read/index calls with locally updated data
 */
class LazyConnector extends Connector {
	public realConnector: ApiConnector;
	public fakeReads: boolean;
	public indexEnhancement = IndexEnhancementLevel.Basic;
	private queue: QueuedFunction[] = [];
	private onQueueChange?: QueueChangeHandler;
	private queueListeners = new Set<QueueChangeHandler>();
	private queueErrorFactory: QueueErrorFactory | null = null;
	// backend emulation
	private readonly FAKE_ID_PREFIX = "fake-id-";
	private fakeIdCounter = 0;
	private fakeIdMapping: Record<string, string> = {};
	private fakeIdMappingRev: Record<string, string> = {}; // reverse map

	constructor(
		connector: ApiConnector,
		fakeReads: boolean,
		onQueueChange?: QueueChangeHandler,
	) {
		super();

		this.onQueueChange = onQueueChange;
		this.realConnector = connector;
		this.fakeReads = fakeReads;
		if (this.realConnector.deleteAdvanced) {
			this.deleteAdvanced = this.handleAdvancedDelete;
		}
	}

	create(
		data: Record<string, unknown>,
		model: ModelUnknown | undefined,
	): ModelGetResponse<ModelUnknown> {
		const fakeId = `${this.FAKE_ID_PREFIX}${this.fakeIdCounter++}`;
		const returnData: ModelGetResponse<ModelUnknown> = [
			{
				...data,
				id: fakeId,
			},
			{},
		];

		this.queue.push({
			type: "create",
			id: fakeId,
			func: this.realConnector.create.bind(this.realConnector, data, model),
			result: returnData,
		});

		this.onAfterOperation();

		return returnData;
	}

	delete(id: string, model: ModelUnknown | undefined): void {
		id = this.mapId(id);

		this.queue = this.queue.filter((entry) => !entry.id || entry.id !== id);

		if (id.startsWith(this.FAKE_ID_PREFIX)) {
			this.onAfterOperation();
			return;
		}

		this.queue.push({
			type: "delete",
			id: id,
			func: this.realConnector.delete.bind(this.realConnector, id, model),
			result: null,
			deleteIds: [id],
			// no rebuildDelete: cancelling the only id it covers drops the whole entry
		});

		this.onAfterOperation();
	}

	async index(
		params: Partial<IDataGridLoadDataParameters> | undefined,
		model: ModelUnknown | undefined,
	): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]> {
		let result: [Record<string, unknown>[], ResponseMeta, unknown?] = [
			[],
			{ totalRows: 0, filteredRows: 0 },
		];

		if (!this.fakeReads) {
			result = await this.realConnector.index(params, model);
		}

		if (this.indexEnhancement === IndexEnhancementLevel.None) return result;

		// map real ids to fake ids for consistency
		result[0] = result[0].map((entry) => ({
			...entry,
			id: this.unmapId((entry as Record<"id", string>).id),
		}));
		// ...which the queue compares in their mapped form, see QueuedFunction.id
		const queueIdOf = (record: Record<string, unknown>) =>
			this.mapId((record as Record<"id", string>).id);

		// enhance result with local data
		this.queue.forEach((entry) => {
			if (entry.type === "create") {
				result[0].push((entry.result as ModelGetResponse<ModelUnknown>)[0]);
				if (result[1].filteredRows) ++result[1].filteredRows;
				++result[1].totalRows;
			} else if (entry.type === "update") {
				const update = (entry.result as ModelGetResponse<ModelUnknown>)[0];
				// an update may carry only the fields it changes, so it is laid over the row
				// the backend lists, which keeps the row's other fields, its place in the list
				// and the id index hands out
				const updated = result[0].findIndex(
					(backendRecord) => queueIdOf(backendRecord) === entry.id,
				);
				if (updated === -1) {
					// a row the backend does not list (with fakeReads it lists none) has
					// nothing to lay the update over
					result[0].push(update);
				} else {
					const backendRecord = result[0][updated];
					result[0][updated] = {
						...backendRecord,
						...update,
						id: backendRecord.id,
					};
				}
			} else if (entry.type === "delete") {
				// deleteMultiple queues every id it was given as one entry
				const deletedIds = entry.deleteIds;
				if (!deletedIds) return;
				const hidden = result[0].filter((backendRecord) =>
					deletedIds.includes(queueIdOf(backendRecord)),
				);
				result[0] = result[0].filter(
					(backendRecord) => !deletedIds.includes(queueIdOf(backendRecord)),
				);
				// the delete has not been sent yet, so the backend still hands these out
				// on every index call. Keeping them is what lets a control which unmounted
				// and came back show the removal as pending, rather than as gone.
				if (hidden.length) entry.deletedRecords = hidden;
				// the counts are what a grid pages on, so they follow the rows out
				if (result[1].filteredRows) result[1].filteredRows -= hidden.length;
				result[1].totalRows -= hidden.length;
			}
		});
		return result;
	}

	/**
	 * Reads a record as it will be once the queue is worked
	 * @param id The record id — potentially a fake one, see getQueuedOperation
	 * @param model The model performing the request
	 * @returns A record whose create is queued: what the queue will create. A record with a
	 *          queued update: the backend's record with the update's fields laid over it
	 *          (with fakeReads the update alone, as index lists it). Any other record: the
	 *          backend's. A record from the backend carries the id index lists it by, which
	 *          for a record created through this connector stays its fake id after the
	 *          queue was worked, whichever of its ids it was read by.
	 * @throws {Error} The record's delete is queued
	 */
	read(
		id: string,
		model: ModelUnknown | undefined,
	): Promise<ModelGetResponse<ModelUnknown>> | ModelGetResponse<ModelUnknown> {
		id = this.mapId(id);
		const localData = last(
			this.queue.filter(
				(entry) => entry.id === id || (entry.deleteIds?.includes(id) ?? false),
			),
		);
		if (!localData) return this.readFromBackend(id, model);
		const queued = localData.result;
		if (!queued) throw new Error("data has been deleted");
		if (localData.type === "create" || this.fakeReads) return queued;
		// an update may carry only the fields it changes
		return this.readFromBackend(id, model, queued[0]);
	}

	/**
	 * Reads a record from the backend, as index lists it
	 * @param id The record's id as the backend knows it
	 * @param model The model performing the request
	 * @param update The fields of a queued update of the record, laid over it
	 * @returns The record under the id index lists it by: its fake id, if it was created
	 *          through this connector
	 */
	private async readFromBackend(
		id: string,
		model: ModelUnknown | undefined,
		update?: Record<string, unknown>,
	): Promise<ModelGetResponse<ModelUnknown>> {
		const [backendRecord, ...rest] = await this.realConnector.read(id, model);
		return [
			{
				...backendRecord,
				...update,
				id: this.unmapId((backendRecord as Record<"id", string>).id),
			},
			...rest,
		];
	}

	/**
	 * Queues an update of a record
	 * @param data The record's data, including its id as index hands it out (a fake one for
	 *             a record created through this connector)
	 * @param model The model performing the request
	 * @returns The record as the queue will write it: the whole record for an update of a
	 *          queued create, otherwise the fields given so far. Until the queue is worked,
	 *          index and read lay it over the record the backend has, so the fields it does
	 *          not carry keep the backend's values.
	 * @remarks A record which already has a create or an update queued keeps that one
	 *          request, which then carries this data over the data queued before: what the
	 *          two requests would have written one after the other. An update of a queued
	 *          create is still sent as the create, under the fake id the create handed out.
	 */
	update(
		data: Record<ModelFieldName, unknown>,
		model: ModelUnknown | undefined,
	): Promise<ModelGetResponse<ModelUnknown>> | ModelGetResponse<ModelUnknown> {
		const queueId = this.mapId(data.id as string);
		const previousQueueEntry = this.queue.find(
			(entry) =>
				(entry.type === "create" || entry.type === "update") &&
				entry.id === queueId,
		);
		const record = { ...previousQueueEntry?.result?.[0], ...data };
		const { id, ...fields } = record;
		const result: ModelGetResponse<ModelUnknown> = [record, {}];
		const func =
			previousQueueEntry?.type === "create"
				? this.realConnector.create.bind(this.realConnector, fields, model)
				: () =>
						this.realConnector.update(
							{ ...fields, id: this.mapId(id as string) },
							model,
						);

		if (previousQueueEntry) {
			previousQueueEntry.func = func;
			previousQueueEntry.result = result;
		} else {
			this.queue.push({
				type: "update",
				id: queueId,
				func,
				result,
			});
		}

		this.onAfterOperation();

		return result;
	}

	deleteMultiple(ids: string[], model?: ModelUnknown): void {
		ids = ids.map((id) => this.mapId(id));
		this.queue = this.queue.filter(
			(entry) => !entry.id || !ids.includes(entry.id),
		);
		ids = ids.filter(
			(id) =>
				!id.startsWith(this.FAKE_ID_PREFIX) ||
				this.queue.find((entry) => entry.id === id),
		);
		if (ids.length === 0) {
			this.onAfterOperation();
			return;
		}
		const rebuildDelete = (remaining: string[]) =>
			this.realConnector.deleteMultiple.bind(
				this.realConnector,
				remaining,
				model,
			);
		this.queue.push({
			type: "delete",
			id: ids.join(","),
			func: rebuildDelete(ids),
			result: null,
			deleteIds: ids,
			rebuildDelete,
		});
		this.onAfterOperation();
	}

	handleAdvancedDelete = (
		req: AdvancedDeleteRequest,
		model?: ModelUnknown,
	): void => {
		const deleteAdvanced = this.realConnector.deleteAdvanced;
		if (!deleteAdvanced) throw new Error("deleteAdvanced got undefined!");
		// the ids as the queue and the backend know them, in a copy: the caller's request
		// keeps naming the records the way the caller does
		const ids = req[1].map((id) => this.mapId(id));
		req = req.length === 2 ? [req[0], ids] : [req[0], ids, req[2]];
		// optimize queue if filter is not active
		if (req.length === 2) {
			const [invert] = req;
			this.queue = this.queue.filter((entry) => {
				if (!entry.id) return true;
				const included = req[1].includes(entry.id);
				return invert ? included : !included;
			});
			req[1] = req[1].filter(
				(id) =>
					!id.startsWith(this.FAKE_ID_PREFIX) ||
					this.queue.find((entry) => entry.id === id),
			);
			if (!invert && req[1].length === 0) {
				this.onAfterOperation();
				return;
			}
		}
		/**
		 * The request with its ids as the backend knows them, keeping its length so a
		 * connector can tell a request without a filter from one with
		 */
		const mapRequest = (
			request: AdvancedDeleteRequest,
		): AdvancedDeleteRequest =>
			request.length === 2
				? [request[0], request[1].map((id) => this.mapId(id))]
				: [request[0], request[1].map((id) => this.mapId(id)), request[2]];
		const queuedRequest = req;
		this.queue.push({
			type: "delete",
			id: null,
			// a record created in this batch has no server id when its delete is queued,
			// so the ids are mapped again when the request is sent, as update does
			func: () =>
				deleteAdvanced.call(
					this.realConnector,
					mapRequest(queuedRequest),
					model,
				),
			result: null,
		});
		this.onAfterOperation();
	};

	/**
	 * The write operation queued for a record, if any
	 * @param id The record id — potentially a fake one. A queue only exists before
	 *           workQueue has run, and a record created client side has no real id until
	 *           then, so a caller holding an id from this side of a submit may have either.
	 * @remarks Lets a caller tell a record that only exists in the queue from one that
	 *          is already on the server, which reads alone cannot: index and read serve
	 *          queued records as if they had been written.
	 */
	public getQueuedOperation(id: string): QueuedOperation | null {
		// the queue stores mapped ids throughout, so mapping the id being looked up is all
		// it takes to match — including across batches, where the caller still holds the
		// fake id of a record the backend now knows by a real one
		const mapped = this.mapId(id);
		const entry = this.queue.findLast(
			(entry) =>
				entry.id === mapped || (entry.deleteIds?.includes(mapped) ?? false),
		);
		return entry ? entry.type : null;
	}

	/**
	 * Drops the queued write operation for a record, undoing it
	 * @param id The record id — potentially a fake one, see getQueuedOperation
	 * @returns Was anything dropped?
	 * @remarks A delete covering several records keeps the request for the ones that
	 *          were not cancelled. Has no effect once workQueue has run.
	 */
	public cancelQueuedOperation(id: string): boolean {
		const mapped = this.mapId(id);
		let cancelled = false;
		this.queue = this.queue.flatMap((entry) => {
			const matchesEntry = entry.id === mapped;
			const matchesDelete = entry.deleteIds?.includes(mapped) ?? false;
			if (!matchesEntry && !matchesDelete) return [entry];
			cancelled = true;
			if (entry.deleteIds) {
				const remaining = entry.deleteIds.filter(
					(deleteId) => deleteId !== mapped,
				);
				// nothing left to delete, or a single id entry that cannot be narrowed
				if (remaining.length === 0 || !entry.rebuildDelete) return [];
				return [
					{
						...entry,
						id: remaining.join(","),
						deleteIds: remaining,
						// the cancelled record is no longer pending removal, so it stops
						// being remembered as one (index remembers it under the id the
						// caller holds, the queue under the mapped one)
						deletedRecords: entry.deletedRecords?.filter((record) =>
							remaining.includes(
								this.mapId((record as Record<"id", string>).id),
							),
						),
						func: entry.rebuildDelete(remaining),
					},
				];
			}
			return [];
		});
		if (cancelled) this.onAfterOperation();
		return cancelled;
	}

	/**
	 * Subscribes to every change of the queue, including it being emptied by workQueue
	 * @param listener Called with the new queue
	 * @returns Unsubscribe
	 * @remarks Separate from setQueueChangeHandler, which is a single slot owned by
	 *          useLazyCrudConnector. Anything rendering from the queue needs this: the
	 *          queue is not React state, so without it a component keeps showing the
	 *          pending state of writes that have since been sent.
	 */
	/**
	 * The records index hid because their delete is queued
	 * @returns The records as the backend handed them out, in no particular order
	 * @remarks For a control which lists these as pending removals — see
	 *          `CrudFileUpload`. A record is remembered from the index call which hid it
	 *          and forgotten when the entry leaves the queue, so working the queue or
	 *          cancelling the delete drops it without anything else having to.
	 */
	public getQueuedDeleteRecords(): Record<string, unknown>[] {
		return this.queue.flatMap((entry) => entry.deletedRecords ?? []);
	}

	public addQueueChangeListener(listener: QueueChangeHandler): () => void {
		this.queueListeners.add(listener);
		return () => {
			this.queueListeners.delete(listener);
		};
	}

	private onAfterOperation() {
		if (this.onQueueChange) this.onQueueChange(this.queue);
		this.queueListeners.forEach((listener) => listener(this.queue));
	}

	/**
	 * Lets the control that lists the records make the error workQueue rejects with when
	 * the backend refused writes
	 * @param factory Makes the error of the refused writes, see QueueErrorFactory
	 * @returns Removes this factory again; a factory set after it stays
	 * @remarks One factory at a time: a later one replaces it. CrudMultiSelect,
	 *          CrudMultiSelectWithGroups, CrudFileUpload and CrudMultiImage set one while
	 *          they are mounted, which names each refused write in a PartialApplyError: by
	 *          its entry's label, or by its file's or image's name.
	 */
	public setQueueErrorFactory(factory: QueueErrorFactory): () => void {
		this.queueErrorFactory = factory;
		return () => {
			if (this.queueErrorFactory === factory) this.queueErrorFactory = null;
		};
	}

	/**
	 * Sends the queued writes to the real connector, in the order they were queued
	 * @returns Resolves once every write went through. Rejects if the backend refused a
	 *          create or update: with what the factory of setQueueErrorFactory makes of
	 *          the refused writes, otherwise with the refusal itself, or for several with
	 *          an AggregateError of them whose message joins theirs with "; ".
	 * @remarks
	 * - A refused create or update stays queued and does not stop the others: the creates
	 *   and updates queued after it are sent. The deletes queued after it are not: a
	 *   delete may be the second half of a replacement (a file uploaded again under its
	 *   name), which must not go while its replacement is not stored. They stay queued and
	 *   go once the writes before them went through.
	 * - A refused delete is dropped, as the record may be gone already.
	 * - What was sent leaves the queue, so a retry does not write it again. A write queued
	 *   while this runs stays queued.
	 * - The queue listeners hear of the queue once, when this is done, also when it rejects.
	 */
	public workQueue = async (): Promise<void> => {
		const sent = new Set<QueuedFunction>();
		const refused: QueuedWriteFailure[] = [];
		try {
			for (const entry of [...this.queue]) {
				// a delete waits for the writes queued before it, see above
				if (entry.type === "delete" && refused.length > 0) continue;
				try {
					const res: unknown = await entry.func();
					if (entry.type === "create") {
						const realId = (
							res as [Record<"id", string>, Record<never, unknown>]
						)[0].id;
						this.fakeIdMapping[entry.id as string] = realId;
						this.fakeIdMappingRev[realId] = entry.id as string;
					}
				} catch (e) {
					if (entry.type !== "delete") {
						refused.push({
							id: this.unmapId(entry.id as string),
							operation: entry.type,
							error: e as Error,
						});
						continue;
					}
					// a refused delete is dropped: the record may be gone already
				}
				sent.add(entry);
			}
		} finally {
			// What has been sent leaves the queue even when something after it threw, so
			// that a caller which fixes the problem and submits again does not write the
			// same records a second time. A refused write stays queued, and so does
			// anything queued while this was running.
			this.queue = this.queue.filter((entry) => !sent.has(entry));
			this.onAfterOperation();
		}
		if (refused.length === 0) return;
		const errors = refused.map((failure) => failure.error);
		throw (
			this.queueErrorFactory?.(refused) ??
			(errors.length === 1
				? errors[0]
				: new AggregateError(
						errors,
						errors
							.map((error) =>
								error instanceof Error ? error.message : String(error),
							)
							.join("; "),
					))
		);
	};

	/**
	 * Maps a potentially fake ID to a real ID
	 * @param id The ID
	 * @remarks Only works after workQueue has been called
	 */
	public mapId(id: string): string {
		return this.fakeIdMapping[id] ?? id;
	}

	/**
	 * Maps a potentially real ID to a fake ID
	 * @param id The ID
	 */
	public unmapId(id: string): string {
		return this.fakeIdMappingRev[id] ?? id;
	}

	/**
	 * Is the work queue empty?
	 */
	public isQueueEmpty(): boolean {
		return this.queue.length === 0;
	}

	/**
	 * Set a new queue change handler
	 * @param newHandler The new handler
	 */
	public setQueueChangeHandler(newHandler: null | QueueChangeHandler): void {
		this.onQueueChange = newHandler ?? undefined;
	}
}

export default LazyConnector;
