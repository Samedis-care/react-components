import { Connector, ModelRecord, ModelUnknown } from "../../backend-integration";
import { BaseSelectorData } from "../../standalone";
import { ForwardedRef } from "react";
import { ValidationResult } from "../Form";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
export interface UseCrudSelectParams<M extends ModelUnknown, DataT extends BaseSelectorData> {
    /**
     * The backend connector used as CRUD interface
     */
    connector: Connector;
    /**
     * Callback for serializing data before passing it to the backend connector
     * @param data The selector data to serialize
     * @returns Data to be passed to the backend connector, id may be null or data.value
     * @remarks Must stay pure: it runs for additions, updates and removals at
     *   backend (POST/PUT/DELETE) time. Do NOT trigger UI side effects (dialogs,
     *   prompts) here — use {@link prepareNewEntry} to collect extra data on add.
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
     * The initial selection (override). If set backend isn't consulted for data
     */
    initialSelected?: DataT[];
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
     * Currently selected entries (raw data)
     */
    initialRawData: Record<string, unknown>[];
    /**
     * Selection handler
     * @param ids The new selected entry ids
     * @param newSelected The new selected entries. A listed entry whose id is in `ids` but
     *        that is missing here stays as it is, in its place: BackendMultiSelect reports
     *        an entry that is still loading by its id only.
     * @remarks Ignores the change while the control is disabled
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
     * Conversion function for model data to selection data (handles special case when data comes from CRUD controller)
     * @param data The model data
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
     *   a write if the control is disabled when the entry's turn comes.
     * @remarks Does not update existing record
     */
    addToSelection: (entry: DataT) => Promise<void>;
}
declare const useCrudSelect: <M extends ModelUnknown, DataT extends BaseSelectorData>(params: UseCrudSelectParams<M, DataT>, ref: ForwardedRef<CrudSelectDispatch<DataT>>) => UseCrudSelectResult<M, DataT>;
export default useCrudSelect;
