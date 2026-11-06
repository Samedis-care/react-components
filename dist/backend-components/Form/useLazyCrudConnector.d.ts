import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
export interface UseLazyCrudConnectorParams<ExtraT = undefined> {
    /**
     * The custom field name (must not be in model)
     */
    field: string;
    /**
     * Extra parameters to be passed to the getEndpoint function
     */
    extraParams?: ExtraT;
    /**
     * The backend endpoint to use
     */
    getEndpoint: (id: string) => string;
    /**
     * Callback for parent record id changes
     * @param id The parent record id
     */
    onParentIdChange?: (id: string) => void;
    /**
     * Creates an instance of the underlying connector
     * @param initialEndpoint The initial endpoint to use
     * @default defaults to DefaultConnector.api; will throw if not provided and this prop is not provided
     */
    getConnector?: (initialEndpoint: string, extraParams: ExtraT | undefined) => ApiConnector;
    /**
     * Callback to configure the connector after it got created by getConnector
     * @param connector The connector which was created by getConnector
     */
    configureConnector?: (connector: ApiConnector) => void;
    /**
     * The initial ID to use for getEndpoint
     */
    initialId: string | null;
}
export interface UseLazyCrudConnectorResult {
    connector: LazyConnector;
}
export declare const extractLazyCrudConnectorParams: <ExtraT, T extends UseLazyCrudConnectorParams<ExtraT>>(data: T) => [UseLazyCrudConnectorParams<ExtraT>, Omit<T, keyof UseLazyCrudConnectorParams<ExtraT>>];
/**
 * Gives a Crud* control (FormCrudMultiSelect, FormCrudFileUpload, FormCrudMultiImage, …) a
 * LazyConnector bound to the current Form: reads go to getEndpoint(initialId), writes are
 * queued and sent to getEndpoint(savedId) after the Form saved its record
 * @param params See UseLazyCrudConnectorParams
 * @returns The connector, one per Form and field for the Form's lifetime
 * @remarks
 * - While the queue holds writes the Form is dirty (a custom dirty flag named `field`).
 * - The connector, queue included, is kept in the Form's custom state under `field`, so a
 *   control that unmounts and mounts again gets its queue back, and the Form is dirty again.
 * - Without onlySubmitMounted an unmounted control's queue keeps the Form dirty and is sent
 *   by the next save.
 * - With onlySubmitMounted an unmounted control's queue is neither sent nor counted as
 *   dirty, like the value of an unmounted model field, until the control mounts again.
 * - Flow mode with onlySubmitMounted: a submit, such as the one goToStage makes before it
 *   changes the stage, stages the queue of every mounted control, like the values of the
 *   mounted fields. The queue stays staged until it is empty (sent or undone). A control
 *   that unmounts with a staged queue, as it does when its stage is left, keeps the Form
 *   dirty, and the next submit to the server sends the queue with the record. A control
 *   hidden within its stage, with nothing staged since it mounted, follows
 *   onlySubmitMounted.
 */
declare const useLazyCrudConnector: <ExtraT = undefined>(params: UseLazyCrudConnectorParams<ExtraT>) => UseLazyCrudConnectorResult;
export default useLazyCrudConnector;
