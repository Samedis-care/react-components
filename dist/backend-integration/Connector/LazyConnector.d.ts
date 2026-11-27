import { AdvancedDeleteRequest, ModelFieldName, ModelGetResponse, ModelUnknown } from "../../backend-integration/Model/Model";
import type { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import Connector, { ResponseMeta } from "./Connector";
import ApiConnector from "./ApiConnector";
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
     *          else: index no longer lists it, and read rejects for it.
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
export type QueueErrorFactory = (failures: QueuedWriteFailure[]) => Error | undefined;
type QueueChangeHandler = (queue: QueuedFunction[]) => void;
export declare enum IndexEnhancementLevel {
    /**
     * Pass though index call to backend
     */
    None = 0,
    /**
     * Pass though index call to backend, append new records to the result and lay the
     * fields of queued updates over the rows they change
     */
    Basic = 1
}
/**
 * Forwards all read calls (index, read) to the real connector directly but queues all writing calls (create, update, delete) which can be fired at once
 * @remarks Does not support relations, enhances read/index calls with locally updated data.
 *          With fakeReads, reads do not reach the real connector at all.
 */
declare class LazyConnector extends Connector {
    realConnector: ApiConnector;
    /**
     * Serve reads from the queue alone, without asking the backend
     * @remarks For a collection whose parent record is not saved yet, so the backend has
     *          nothing under it (and the real connector's endpoint names no parent):
     *          index lists only the queued creates and updates, and read rejects for any
     *          other record. useLazyCrudConnector sets it for a new record and clears it
     *          when the save sends the queue.
     */
    fakeReads: boolean;
    indexEnhancement: IndexEnhancementLevel;
    private queue;
    private onQueueChange?;
    private queueListeners;
    private queueErrorFactory;
    private readonly FAKE_ID_PREFIX;
    private fakeIdCounter;
    private fakeIdMapping;
    private fakeIdMappingRev;
    constructor(connector: ApiConnector, fakeReads: boolean, onQueueChange?: QueueChangeHandler);
    create(data: Record<string, unknown>, model: ModelUnknown | undefined): ModelGetResponse<ModelUnknown>;
    delete(id: string, model: ModelUnknown | undefined): void;
    index(params: Partial<IDataGridLoadDataParameters> | undefined, model: ModelUnknown | undefined): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    /**
     * Reads a record as it will be once the queue is worked
     * @param id The record id — potentially a fake one, see getQueuedOperation
     * @param model The model performing the request
     * @returns A record whose create is queued: what the queue will create. A record with a
     *          queued update: the backend's record with the update's fields laid over it
     *          (with fakeReads the update alone, as index lists it). Any other record: the
     *          backend's; with fakeReads a rejection ("Record not found"), as index lists
     *          no record of the backend then, and the backend is not asked. A record from
     *          the backend carries the id index lists it by, which for a record created
     *          through this connector stays its fake id after the queue was worked,
     *          whichever of its ids it was read by.
     *          A fake id whose create was dropped before the queue was worked (the record
     *          was removed again, or its create undone) rejects as not found as well: the
     *          backend cannot have that record, so it is not asked.
     *          A record whose delete is queued: a rejection ("data has been deleted"), as
     *          index no longer lists it; the backend is not asked.
     * @remarks Every failure is a rejection of the returned promise, never a synchronous
     *          throw, so a caller can handle it on the promise alone.
     */
    read(id: string, model: ModelUnknown | undefined): Promise<ModelGetResponse<ModelUnknown>> | ModelGetResponse<ModelUnknown>;
    /**
     * Reads a record from the backend, as index lists it
     * @param id The record's id as mapId gives it: the id the backend knows it by, or a
     *           fake id that maps to no real id
     * @param model The model performing the request
     * @param update The fields of a queued update of the record, laid over it
     * @returns The record under the id index lists it by: its fake id, if it was created
     *          through this connector. A fake id that maps to no real id rejects as not
     *          found without asking the backend: its create was dropped before it was sent,
     *          so the backend cannot have the record.
     */
    private readFromBackend;
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
    update(data: Record<ModelFieldName, unknown>, model: ModelUnknown | undefined): Promise<ModelGetResponse<ModelUnknown>> | ModelGetResponse<ModelUnknown>;
    deleteMultiple(ids: string[], model?: ModelUnknown): void;
    handleAdvancedDelete: (req: AdvancedDeleteRequest, model?: ModelUnknown) => void;
    /**
     * The write operation queued for a record, if any
     * @param id The record id — potentially a fake one. A queue only exists before
     *           workQueue has run, and a record created client side has no real id until
     *           then, so a caller holding an id from this side of a submit may have either.
     * @remarks Lets a caller tell a record that only exists in the queue from one that
     *          is already on the server, which reads alone cannot: index and read serve
     *          queued records as if they had been written.
     */
    getQueuedOperation(id: string): QueuedOperation | null;
    /**
     * Drops the queued write operation for a record, undoing it
     * @param id The record id — potentially a fake one, see getQueuedOperation
     * @returns Was anything dropped?
     * @remarks A delete covering several records keeps the request for the ones that
     *          were not cancelled. Has no effect once workQueue has run.
     */
    cancelQueuedOperation(id: string): boolean;
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
    getQueuedDeleteRecords(): Record<string, unknown>[];
    addQueueChangeListener(listener: QueueChangeHandler): () => void;
    private onAfterOperation;
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
    setQueueErrorFactory(factory: QueueErrorFactory): () => void;
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
    workQueue: () => Promise<void>;
    /**
     * Maps a potentially fake ID to a real ID
     * @param id The ID
     * @remarks Only works after workQueue has been called
     */
    mapId(id: string): string;
    /**
     * Maps a potentially real ID to a fake ID
     * @param id The ID
     */
    unmapId(id: string): string;
    /**
     * Is the work queue empty?
     */
    isQueueEmpty(): boolean;
    /**
     * Set a new queue change handler
     * @param newHandler The new handler
     */
    setQueueChangeHandler(newHandler: null | QueueChangeHandler): void;
}
export default LazyConnector;
