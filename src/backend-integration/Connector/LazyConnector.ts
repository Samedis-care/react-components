import Model, {
	AdvancedDeleteRequest,
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import type { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import Connector, { ResponseMeta } from "./Connector";
import ApiConnector from "./ApiConnector";
import last from "../../utils/last";

interface QueuedFunction {
	type: "create" | "update" | "delete";
	id: string | null; // fake id if created client side, otherwise real id or null if delete advanced
	func: () => unknown;
	result: ModelGetResponse<string> | null;
	/**
	 * For a delete: the ids it covers
	 * @remarks Separate from id, which joins them for display, so that a single id can
	 *          be looked up and cancelled without parsing it back apart
	 */
	deleteIds?: string[];
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

type QueueChangeHandler = (queue: QueuedFunction[]) => void;

export enum IndexEnhancementLevel {
	/**
	 * Pass though index call to backend
	 */
	None,
	/**
	 * Pass though index call to backend, append new records and changed records in result
	 */
	Basic,
}

/**
 * Forwards all read calls (index, read) to the real connector directly but queues all writing calls (create, update, delete) which can be fired at once
 * @remarks Does not support relations, enhances read/index calls with locally updated data
 */
class LazyConnector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
> extends Connector<KeyT, VisibilityT, CustomT> {
	public realConnector: ApiConnector<KeyT, VisibilityT, CustomT>;
	public fakeReads: boolean;
	public indexEnhancement = IndexEnhancementLevel.Basic;
	private queue: QueuedFunction[] = [];
	private onQueueChange?: QueueChangeHandler;
	private queueListeners = new Set<QueueChangeHandler>();
	// backend emulation
	private readonly FAKE_ID_PREFIX = "fake-id-";
	private fakeIdCounter = 0;
	private fakeIdMapping: Record<string, string> = {};
	private fakeIdMappingRev: Record<string, string> = {}; // reverse map

	constructor(
		connector: ApiConnector<KeyT, VisibilityT, CustomT>,
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
		model: Model<KeyT, VisibilityT, CustomT> | undefined,
	): ModelGetResponse<KeyT> {
		const fakeId = `${this.FAKE_ID_PREFIX}${this.fakeIdCounter++}`;
		const returnData: ModelGetResponse<KeyT> = [
			{
				...data,
				["id" as KeyT]: fakeId,
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

	delete(
		id: string,
		model: Model<KeyT, VisibilityT, CustomT> | undefined,
	): void {
		this.queue = this.queue.filter((entry) => !entry.id || entry.id !== id);

		id = this.mapId(id);

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
		model: Model<KeyT, VisibilityT, CustomT> | undefined,
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

		// enhance result with local data
		this.queue.forEach((entry) => {
			if (entry.type === "create") {
				result[0].push((entry.result as ModelGetResponse<KeyT>)[0]);
				if (result[1].filteredRows) ++result[1].filteredRows;
				++result[1].totalRows;
			} else if (entry.type === "update") {
				result[0] = result[0]
					.filter(
						(backendRecord) =>
							(backendRecord as Record<"id", string>).id !== entry.id,
					)
					.concat((entry.result as ModelGetResponse<KeyT>)[0]);
			} else if (entry.type === "delete") {
				const { id: entryId } = entry;
				if (!entryId) return;
				result[0].filter(
					(backendRecord) =>
						(backendRecord as Record<"id", string>).id !== entry.id &&
						!entryId
							.split(",")
							.includes((backendRecord as Record<"id", string>).id),
				);
			}
		});
		return result;
	}

	read(
		id: string,
		model: Model<KeyT, VisibilityT, CustomT> | undefined,
	): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT> {
		const localData = last(
			this.queue.filter(
				(entry) => entry.id === id || entry.id?.split(",").includes(id),
			),
		);
		if (localData) {
			if (localData.result) {
				return localData.result;
			} else {
				throw new Error("data has been deleted");
			}
		}
		return this.realConnector.read(this.mapId(id), model);
	}

	update(
		data: Record<ModelFieldName, unknown>,
		model: Model<KeyT, VisibilityT, CustomT> | undefined,
	): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT> {
		const previousQueueEntry = this.queue.find(
			(entry) =>
				(entry.type === "create" || entry.type === "update") &&
				entry.id === (data.id as string),
		);
		const { id, ...otherData } = data;

		const updateFunc = () =>
			this.realConnector.update(
				{ ...otherData, id: this.mapId(id as string) },
				model,
			);

		if (previousQueueEntry) {
			if (previousQueueEntry.type === "update") {
				previousQueueEntry.func = () => updateFunc;
			} else if (previousQueueEntry.type === "create") {
				previousQueueEntry.func = this.realConnector.create.bind(
					this.realConnector,
					otherData,
					model,
				);
			}
		} else {
			this.queue.push({
				type: "update",
				id: data.id as string,
				func: updateFunc,
				result: [data, {}],
			});
		}

		this.onAfterOperation();

		return [data, {}];
	}

	deleteMultiple(
		ids: string[],
		model?: Model<KeyT, VisibilityT, CustomT>,
	): void {
		this.queue = this.queue.filter(
			(entry) => !entry.id || !ids.includes(entry.id),
		);
		ids = ids.map((id) => this.mapId(id));
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
		model?: Model<KeyT, VisibilityT, CustomT>,
	): void => {
		if (!this.realConnector.deleteAdvanced)
			throw new Error("deleteAdvanced got undefined!");
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
		this.queue.push({
			type: "delete",
			id: null,
			func: this.realConnector.deleteAdvanced.bind(
				this.realConnector,
				req,
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

	public workQueue = async (): Promise<void> => {
		for (const entry of this.queue) {
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
				// we ignore failed deletes
				if (entry.type !== "delete") {
					throw e;
				}
			}
		}
		this.queue = [];
		this.onAfterOperation();
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
