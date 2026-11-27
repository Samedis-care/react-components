import { Connector, ModelRecord, ModelUnknown } from "../../backend-integration";
import { BaseSelectorData } from "../../standalone";
import { ForwardedRef } from "react";
import { ValidationResult } from "../Form";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
export interface UseCrudSelectParams<M extends ModelUnknown, DataT extends BaseSelectorData> {
    /**
     * The backend connector used as CRUD interface
     * @remarks A LazyConnector queues the writes until its queue is sent (a Form's save). If
     *          the backend refuses a write of the queue while the control is mounted, the
     *          queue rejects with a PartialApplyError that names it by the entry's label, as
     *          a refused write is named in `error` with any other connector.
     */
    connector: Connector;
    /**
     * Callback for serializing data before passing it to the backend connector
     * @param data The selector data to serialize
     * @returns Data to be passed to the backend connector, id may be null or data.value
     * @remarks Must stay pure: it runs for additions, updates and removals at
     *   backend (POST/PUT/DELETE) time, and on every change for each entry that stays
     *   selected, to tell whether it changed. Do NOT trigger UI side effects (dialogs,
     *   prompts) here — use {@link prepareNewEntry} to collect extra data on add.
     *
     *   What it returns decides whether an entry is updated: an entry handed to
     *   `handleSelect` is written only when its result differs, compared as JSON, from the
     *   result for the listed entry. A new but equal object, array or Date is no change.
     *   A field it leaves out (`label`, `titleTooltip`, `onClick`, …) never causes a
     *   write; a change of a field it returns does, also of a render field such as `label`.
     */
    serialize: (data: DataT) => Promise<Partial<Record<string, unknown>>> | Partial<Record<string, unknown>>;
    /**
     * Callback for deserializing data after getting it from the backend connector
     * @param data The data from the backend connector (index function, or the record a
     *   create returned)
     * @returns The selector data which can be used by the control
     * @remarks If it fails for the record of a create, the row exists anyway: it is
     *   listed as the entry that was created, with the row's `id` as `value` (so
     *   `serialize` has to read a kept entry's row id from `value`), and the failure is
     *   reported in `error` as a PartialApplyError failure with the action `read`.
     */
    deserialize: (data: Record<string, unknown>) => Promise<DataT> | DataT;
    /**
     * Callback for deserializing data from the model
     * @param data The data from the backend connector (index function)
     * @returns The selector data which can be used by the control
     * @remarks Must stay pure: it runs once per search result during option load.
     *   Do NOT trigger UI side effects (dialogs, prompts) here — they would fire
     *   for every dropdown option. Use {@link prepareNewEntry} to collect extra
     *   data on add.
     */
    deserializeModel: (data: ModelRecord<M>) => Promise<Omit<DataT, "value">> | Omit<DataT, "value">;
    /**
     * Called once per newly-added entry, before it is serialized/created.
     * Use it to collect extra join-record data (e.g. via a dialog) or to
     * augment the entry. Resolve `null` to cancel the addition cleanly
     * (the entry is NOT added and NO error is raised). Thrown errors still
     * surface via the error component (genuine failures only).
     * Runs only for additions — never for updates, removals, or option load.
     * @param entry The entry that is about to be added
     * @returns The (possibly augmented) entry to create, or `null` to cancel
     */
    prepareNewEntry?: (entry: DataT) => Promise<DataT | null> | DataT | null;
    /**
     * Selection change event
     * @param selected The new selection
     */
    onChange?: (selected: DataT[]) => void;
    /**
     * Validation callback for integration with form engine
     * @param data The currently selected data
     * @returns object Validation errors (Key => Values)
     * @remarks Only works with FormEngine. Requires field to be set
     */
    validate?: (data: DataT[]) => ValidationResult;
    /**
     * The field to apply the validations for
     * @remarks for Form Engine
     * @see validate
     */
    field?: string;
    /**
     * Get ID of data
     */
    getIdOfData: NonNullable<BackendMultiSelectProps<M, DataT>["getIdOfData"]>;
    /**
     * Is the control disabled? A disabled control writes nothing: handleSelect ignores
     * every change and addToSelection rejects, also when an end adornment or the caller's
     * ref calls them
     * @default false
     */
    disabled?: boolean;
    /**
     * Writes nothing while true, as if disabled (handleSelect ignores every change and
     * addToSelection rejects), but leaves the control as it is: the search field stays
     * enabled and keeps its focus and typed text, and the entries keep their remove
     * buttons. For a short time in which the selection must not change, such as the save
     * of the Form a FormCrudMultiSelect is in.
     * @default false
     */
    blockWrites?: boolean;
}
export interface UseCrudSelectResult<M extends ModelUnknown, DataT extends BaseSelectorData> {
    /**
     * Fetching initial data?
     */
    loading: boolean;
    /**
     * Error while updating data
     */
    error: Error | null;
    /**
     * Error while fetching initial data
     */
    loadError: Error | null;
    /**
     * Currently selected entries
     */
    selected: DataT[];
    /**
     * The values of the selected entries whose create is queued and not sent yet
     * @remarks Only with a LazyConnector, whose writes wait for the Form's save (empty
     *          otherwise). An entry's queued write is looked up by its `value`, the record's
     *          id.
     */
    added: string[];
    /**
     * The entries removed from the selection whose delete is queued and not sent yet, in the
     * order they were removed; not part of `selected`
     * @remarks Only with a LazyConnector (empty otherwise). They include the removals queued
     *          while the control was unmounted before. An entry leaves the list when its
     *          delete is sent, and is selected again by handleSelect with the entry added,
     *          which cancels the delete instead of creating the record again.
     */
    removed: DataT[];
    /**
     * Does the LazyConnector hold writes of this control that are not sent yet (picks,
     * removals or changes)? Always false with another connector, which writes at once.
     */
    pendingChanges: boolean;
    /**
     * Is a change of the selection being written: has the connector not answered one of its
     * creates, updates or deletes yet? Meanwhile CrudMultiSelect and
     * CrudMultiSelectWithGroups mark the field busy (`aria-busy`) and say "Saving…" under it,
     * and the change is not listed yet: a pick is listed, a removed entry leaves the list,
     * once its write has settled.
     * @remarks A change waiting for the one before it, or for `prepareNewEntry`, is not being
     *          written yet. A LazyConnector only queues the writes (see `pendingChanges`), so
     *          with one it is true only while `serialize` and `deserialize` run.
     */
    writing: boolean;
    /**
     * The records the connector listed or created (raw data), including those of `removed`
     */
    initialRawData: Record<string, unknown>[];
    /**
     * Selection handler
     * @param ids The new selected entry ids
     * @param newSelected The new selected entries. A listed entry whose id is in `ids` but
     *        that is missing here stays as it is, in its place: BackendMultiSelect reports
     *        an entry that is still loading by its id only.
     * @returns Resolves once the change is applied, after the changes made before it
     * @remarks Ignores the change while the control is disabled. The change is the
     *          difference between `selected` of the render this handler comes from and
     *          `newSelected`: it creates the entries that are not listed yet, deletes the
     *          listed ones that are left out, and updates a listed entry only when
     *          `serialize` returns something else for it than for the listed entry. An entry
     *          of `removed` added back is restored: its queued delete is cancelled, nothing
     *          is created.
     *
     *          The changes, and `addToSelection` with them, are applied one after another in
     *          the order they were made: a change waits until the writes of the ones before
     *          it have settled, then applies only its own difference to the selection they
     *          left, so a change made in a render before they settled does not undo them.
     *          Its deleted entries leave the selection, its updated ones are replaced in
     *          their place, and its created and restored ones are added at the end; a refused
     *          removal or update leaves the entry as and where it is. Left out of a change,
     *          as the same gesture reported again (a second click on a remove button, a pick
     *          made before the field lists the first one): the removal of an entry that a
     *          change before is deleting or has deleted, the pick of a record (by
     *          `getIdOfData`) that a change before is creating or has linked, and an update a
     *          change before has written. A change that writes nothing leaves `error` as it
     *          is, and one whose turn comes while the control is disabled, or once it has
     *          unmounted, writes nothing.
     */
    handleSelect: (ids: string[], newSelected: DataT[]) => Promise<void>;
    /**
     * Does the control write nothing right now (disabled, read-only, or blockWrites)? An end
     * adornment that picks or removes entries locks itself while it is: handleSelect
     * ignores its changes meanwhile
     * @see UseCrudSelectParams.disabled
     * @see UseCrudSelectParams.blockWrites
     */
    disabled: boolean;
    /**
     * Makes the entry for a record of the searched model, as the field does for a pick: its
     * `deserializeModel` result with the value `"to-create-" + getIdOfData(entry)`. A record
     * the connector listed or created (in `initialRawData`) gives its listed entry instead.
     * @param data The record
     * @remarks An end adornment that picks records itself makes the new entries it hands
     *          handleSelect with this, so that they are what a pick in the field is, value
     *          included, which `serialize` leaves out of the create.
     */
    modelToSelectorData: (data: ModelRecord<M>) => Promise<DataT>;
}
export interface CrudSelectDispatch<DataT extends BaseSelectorData> {
    /**
     * Adds the entry to the list of selected records
     * @param entry The entry to insert
     * @returns Resolves once the entry is selected. Rejects with the error of the create
     *   if it failed. Rejects with a PartialApplyError whose failure has the action
     *   `read` if `deserialize` failed after the create went through: the entry is
     *   selected then, as it was passed in, with the row's `id` as `value`. Rejects without
     *   a write if the control is disabled when the entry's turn comes, or has unmounted.
     * @remarks The entry's turn comes once the selection has loaded and the changes made
     *          before the call (handleSelect, addToSelection) are applied; nothing is created
     *          if a selected entry has its `getIdOfData` then. Does not update existing
     *          record
     */
    addToSelection: (entry: DataT) => Promise<void>;
}
declare const useCrudSelect: <M extends ModelUnknown, DataT extends BaseSelectorData>(params: UseCrudSelectParams<M, DataT>, ref: ForwardedRef<CrudSelectDispatch<DataT>>) => UseCrudSelectResult<M, DataT>;
export default useCrudSelect;
