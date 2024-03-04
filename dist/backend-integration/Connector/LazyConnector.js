import Connector from "./Connector";
import last from "../../utils/last";
export var IndexEnhancementLevel;
(function (IndexEnhancementLevel) {
    /**
     * Pass though index call to backend
     */
    IndexEnhancementLevel[IndexEnhancementLevel["None"] = 0] = "None";
    /**
     * Pass though index call to backend, append new records and changed records in result
     */
    IndexEnhancementLevel[IndexEnhancementLevel["Basic"] = 1] = "Basic";
})(IndexEnhancementLevel || (IndexEnhancementLevel = {}));
/**
 * Forwards all read calls (index, read) to the real connector directly but queues all writing calls (create, update, delete) which can be fired at once
 * @remarks Does not support relations, enhances read/index calls with locally updated data
 */
class LazyConnector extends Connector {
    realConnector;
    fakeReads;
    indexEnhancement = IndexEnhancementLevel.Basic;
    queue = [];
    onQueueChange;
    // backend emulation
    FAKE_ID_PREFIX = "fake-id-";
    fakeIdCounter = 0;
    fakeIdMapping = {};
    fakeIdMappingRev = {}; // reverse map
    constructor(connector, fakeReads, onQueueChange) {
        super();
        this.onQueueChange = onQueueChange;
        this.realConnector = connector;
        this.fakeReads = fakeReads;
        if (this.realConnector.deleteAdvanced) {
            this.deleteAdvanced = this.handleAdvancedDelete;
        }
    }
    create(data, model) {
        const fakeId = `${this.FAKE_ID_PREFIX}${this.fakeIdCounter++}`;
        const returnData = [
            {
                ...data,
                ["id"]: fakeId,
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
    delete(id, model) {
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
        });
        this.onAfterOperation();
    }
    async index(params, model) {
        let result = [
            [],
            { totalRows: 0, filteredRows: 0 },
        ];
        if (!this.fakeReads) {
            result = await this.realConnector.index(params, model);
        }
        if (this.indexEnhancement === IndexEnhancementLevel.None)
            return result;
        // map real ids to fake ids for consistency
        result[0] = result[0].map((entry) => ({
            ...entry,
            id: this.unmapId(entry.id),
        }));
        // enhance result with local data
        this.queue.forEach((entry) => {
            if (entry.type === "create") {
                result[0].push(entry.result[0]);
                if (result[1].filteredRows)
                    ++result[1].filteredRows;
                ++result[1].totalRows;
            }
            else if (entry.type === "update") {
                result[0] = result[0]
                    .filter((backendRecord) => backendRecord.id !== entry.id)
                    .concat(entry.result[0]);
            }
            else if (entry.type === "delete") {
                const { id: entryId } = entry;
                if (!entryId)
                    return;
                result[0].filter((backendRecord) => backendRecord.id !== entry.id &&
                    !entryId
                        .split(",")
                        .includes(backendRecord.id));
            }
        });
        return result;
    }
    read(id, model) {
        const localData = last(this.queue.filter((entry) => entry.id === id || entry.id?.split(",").includes(id)));
        if (localData) {
            if (localData.result) {
                return localData.result;
            }
            else {
                throw new Error("data has been deleted");
            }
        }
        return this.realConnector.read(this.mapId(id), model);
    }
    update(data, model) {
        const previousQueueEntry = this.queue.find((entry) => (entry.type === "create" || entry.type === "update") &&
            entry.id === data.id);
        const { id, ...otherData } = data;
        const updateFunc = () => this.realConnector.update({ ...otherData, id: this.mapId(id) }, model);
        if (previousQueueEntry) {
            if (previousQueueEntry.type === "update") {
                previousQueueEntry.func = () => updateFunc;
            }
            else if (previousQueueEntry.type === "create") {
                previousQueueEntry.func = this.realConnector.create.bind(this.realConnector, otherData, model);
            }
        }
        else {
            this.queue.push({
                type: "update",
                id: data.id,
                func: updateFunc,
                result: [data, {}],
            });
        }
        this.onAfterOperation();
        return [data, {}];
    }
    deleteMultiple(ids, model) {
        this.queue = this.queue.filter((entry) => !entry.id || !ids.includes(entry.id));
        ids = ids.map((id) => this.mapId(id));
        ids = ids.filter((id) => !id.startsWith(this.FAKE_ID_PREFIX) ||
            this.queue.find((entry) => entry.id === id));
        if (ids.length === 0) {
            this.onAfterOperation();
            return;
        }
        this.queue.push({
            type: "delete",
            id: ids.join(","),
            func: this.realConnector.deleteMultiple.bind(this.realConnector, ids, model),
            result: null,
        });
        this.onAfterOperation();
    }
    handleAdvancedDelete = (req, model) => {
        if (!this.realConnector.deleteAdvanced)
            throw new Error("deleteAdvanced got undefined!");
        // optimize queue if filter is not active
        if (req.length === 2) {
            const [invert] = req;
            this.queue = this.queue.filter((entry) => {
                if (!entry.id)
                    return true;
                const included = req[1].includes(entry.id);
                return invert ? included : !included;
            });
            req[1] = req[1].filter((id) => !id.startsWith(this.FAKE_ID_PREFIX) ||
                this.queue.find((entry) => entry.id === id));
            req[1] = req[1].filter((id) => !id.startsWith(this.FAKE_ID_PREFIX) ||
                this.queue.find((entry) => entry.id === id));
            if (!invert && req[1].length === 0) {
                this.onAfterOperation();
                return;
            }
        }
        this.queue.push({
            type: "delete",
            id: null,
            func: this.realConnector.deleteAdvanced.bind(this.realConnector, req, model),
            result: null,
        });
        this.onAfterOperation();
    };
    onAfterOperation() {
        if (this.onQueueChange)
            this.onQueueChange(this.queue);
    }
    workQueue = async () => {
        for (const entry of this.queue) {
            try {
                const res = await entry.func();
                if (entry.type === "create") {
                    const realId = res[0].id;
                    this.fakeIdMapping[entry.id] = realId;
                    this.fakeIdMappingRev[realId] = entry.id;
                }
            }
            catch (e) {
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
    mapId(id) {
        return this.fakeIdMapping[id] ?? id;
    }
    /**
     * Maps a potentially real ID to a fake ID
     * @param id The ID
     */
    unmapId(id) {
        return this.fakeIdMappingRev[id] ?? id;
    }
    /**
     * Is the work queue empty?
     */
    isQueueEmpty() {
        return this.queue.length === 0;
    }
    /**
     * Set a new queue change handler
     * @param newHandler The new handler
     */
    setQueueChangeHandler(newHandler) {
        this.onQueueChange = newHandler ?? undefined;
    }
}
export default LazyConnector;
