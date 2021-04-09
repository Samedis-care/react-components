import {
	AdvancedDeleteRequest,
	Connector,
	Model,
	ModelData,
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
	ResponseMeta,
} from "../..";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";

interface QueuedFunction {
	type: "create" | "update" | "delete";
	id: string | null; // fake id if created client side, otherwise real id or null if delete advanced
	func: () => unknown;
}

type QueueChangeHandler = (queue: QueuedFunction[]) => void;

/**
 * Forwards all read calls (index, read) to the real connector directly but queues all writing calls (create, update, delete) which can be fired at once
 * @remarks Does not support relations
 */
class LazyConnector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Connector<KeyT, VisibilityT, CustomT> {
	public realConnector: Connector<KeyT, VisibilityT, CustomT>;
	public fakeReads: boolean;
	private queue: QueuedFunction[] = [];
	private onQueueChange?: QueueChangeHandler;
	// backend emulation
	private readonly FAKE_ID_PREFIX = "fake-id-";
	private fakeIdCounter = 0;
	private fakeIdMapping: Record<string, string> = {};

	constructor(
		connector: Connector<KeyT, VisibilityT, CustomT>,
		fakeReads: boolean,
		onQueueChange?: QueueChangeHandler
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
		model: Model<KeyT, VisibilityT, CustomT> | undefined
	): ModelGetResponse<KeyT> {
		const fakeId = `${this.FAKE_ID_PREFIX}${this.fakeIdCounter++}`;

		this.queue.push({
			type: "create",
			id: fakeId,
			func: this.realConnector.create.bind(this.realConnector, data, model),
		});

		this.onAfterOperation();

		const returnData = {
			...data,
			["id" as KeyT]: fakeId,
		} as Record<KeyT, unknown>;

		return [returnData, {}];
	}

	delete(
		id: string,
		model: Model<KeyT, VisibilityT, CustomT> | undefined
	): void {
		this.queue = this.queue.filter((entry) => !entry.id || entry.id !== id);

		if (id in this.fakeIdMapping) {
			id = this.fakeIdMapping[id];
		}

		if (id.startsWith(this.FAKE_ID_PREFIX)) {
			this.onAfterOperation();
			return;
		}

		this.queue.push({
			type: "delete",
			id: id,
			func: this.realConnector.delete.bind(this.realConnector, id, model),
		});

		this.onAfterOperation();
	}

	async index(
		params: Partial<IDataGridLoadDataParameters> | undefined,
		model: Model<KeyT, VisibilityT, CustomT> | undefined
	): Promise<[Record<KeyT, unknown>[], ResponseMeta]> {
		if (this.fakeReads) {
			const fakeMeta: ResponseMeta = { totalRows: 0, filteredRows: 0 };
			const fakeData: Record<KeyT, unknown>[] = [];
			return [fakeData, fakeMeta];
		}

		return this.realConnector.index(params, model);
	}

	read(
		id: string,
		model: Model<KeyT, VisibilityT, CustomT> | undefined
	): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT> {
		return this.realConnector.read(id, model);
	}

	update(
		data: Record<ModelFieldName, unknown>,
		model: Model<KeyT, VisibilityT, CustomT> | undefined
	): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT> {
		const previousQueueEntry = this.queue.find(
			(entry) =>
				(entry.type === "create" || entry.type === "update") &&
				entry.id === (data.id as string)
		);
		const { id, ...otherData } = data;

		const updateFunc = () =>
			this.realConnector.update(
				{ ...otherData, id: this.fakeIdMapping[id as string] ?? id },
				model
			);

		if (previousQueueEntry) {
			if (previousQueueEntry.type === "update") {
				previousQueueEntry.func = () => updateFunc;
			} else if (previousQueueEntry.type === "create") {
				previousQueueEntry.func = this.realConnector.create.bind(
					this.realConnector,
					otherData,
					model
				);
			}
		} else {
			this.queue.push({
				type: "update",
				id: data.id as string,
				func: updateFunc,
			});
		}

		this.onAfterOperation();

		return [data as ModelData<KeyT>, {}];
	}

	deleteMultiple(
		ids: string[],
		model?: Model<KeyT, VisibilityT, CustomT>
	): void {
		this.queue = this.queue.filter(
			(entry) => !entry.id || !ids.includes(entry.id)
		);
		ids = ids.map((id) =>
			id in this.fakeIdMapping ? this.fakeIdMapping[id] : id
		);
		ids = ids.filter(
			(id) =>
				!id.startsWith(this.FAKE_ID_PREFIX) ||
				this.queue.find((entry) => entry.id === id)
		);
		if (ids.length === 0) {
			this.onAfterOperation();
			return;
		}
		this.queue.push({
			type: "delete",
			id: ids.join(","),
			func: this.realConnector.deleteMultiple.bind(
				this.realConnector,
				ids,
				model
			),
		});
		this.onAfterOperation();
	}

	handleAdvancedDelete = (
		req: AdvancedDeleteRequest,
		model?: Model<KeyT, VisibilityT, CustomT>
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
					this.queue.find((entry) => entry.id === id)
			);
			req[1] = req[1].filter(
				(id) =>
					!id.startsWith(this.FAKE_ID_PREFIX) ||
					this.queue.find((entry) => entry.id === id)
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
				model
			),
		});
		this.onAfterOperation();
	};

	private onAfterOperation() {
		if (this.onQueueChange) this.onQueueChange(this.queue);
	}

	public workQueue = async (): Promise<void> => {
		for (const entry of this.queue) {
			try {
				const res: unknown = await entry.func();
				if (entry.type === "create") {
					this.fakeIdMapping[entry.id as string] = (res as [
						Record<"id", string>,
						Record<never, unknown>
					])[0].id;
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
}

export default LazyConnector;
