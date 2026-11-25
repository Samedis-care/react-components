import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";
/**
 * Params of useLazyCrudConnector, which FormCrudMultiSelect, FormCrudFileUpload,
 * FormCrudMultiImage and app wrappers take as props (extractLazyCrudConnectorParams splits
 * them off)
 * @remarks The params are read once: field when the control mounts, the others when the
 *          connector is built, which is the first time a control with this field renders in
 *          its Form. The connector then lives as long as the Form (a Form given another
 *          record starts over), and its reads and every save use what it was built with,
 *          also when a param changes later or the control mounts again with other ones.
 *          Another collection takes another field name and a new mount of the control,
 *          e.g. `key={field}`.
 *
 *          getEndpoint, getConnector and configureConnector build the connector while the
 *          control renders, so they must not set state or start work that needs cleaning up.
 *          A render React discards before it commits builds a connector that is never used:
 *          React 18's StrictMode discards the first render of every mount in development,
 *          so these run twice there. onParentIdChange is never called during render: it
 *          gets the id once the control that built the connector has mounted.
 */
export interface UseLazyCrudConnectorParams<ExtraT = undefined> {
    /**
     * The control's name in the Form: the Form keeps the control's connector (its custom
     * state), its post-submit handler and its custom dirty flag under it. Unique within the
     * Form, and not a model field.
     * @remarks Read when the control mounts; a later value is ignored. A control that
     *          mounts again under the same name gets that name's connector back, queue
     *          included, built from the params of the first mount.
     */
    field: string;
    /**
     * Handed to getConnector (or to the default API connector factory) as its second
     * argument when the connector is built
     * @remarks Read once, when the connector is built; a later value is ignored.
     */
    extraParams?: ExtraT;
    /**
     * Builds the endpoint of the collection for a parent record id
     * @param id The parent record's id: initialId when the connector is built (the string
     *        "null" for a new record), the saved record's id on every save
     * @returns The endpoint, e.g. `v1/orgs/${id}/roles`
     * @remarks Read once, when the connector is built: its reads and every save use this
     *          function, a later one is never called. Called during render when the
     *          connector is built, so it must not set state.
     */
    getEndpoint: (id: string) => string;
    /**
     * Called with the parent record's id: initialId (the string "null" for a new record)
     * once the control that built the connector has mounted, and the saved record's id on
     * every save, right before getEndpoint gets it. Never during render, so it may set state.
     * @param id The parent record id
     * @remarks Read once, when the connector is built; a later one is never called. Called
     *          with initialId once per connector: not again when the control mounts again
     *          under its field, nor when StrictMode runs its effects again.
     */
    onParentIdChange?: (id: string) => void;
    /**
     * Creates the real connector, which the reads go through and the save sends the queue
     * through
     * @param initialEndpoint getEndpoint(initialId), getEndpoint("null") for a new record
     * @param extraParams The extraParams param
     * @default DefaultConnector.getApi (set by setDefaultConnectorAPI); with neither, building
     *          the connector throws "No default connector set"
     * @remarks Read once, when the connector is built; a later one is never called. Called
     *          during render, so it must not set state; it runs again for a render React
     *          discards (see UseLazyCrudConnectorParams).
     */
    getConnector?: (initialEndpoint: string, extraParams: ExtraT | undefined) => ApiConnector;
    /**
     * Called with the connector getConnector (or the default factory) created, right after
     * it was created, e.g. to set request options
     * @param connector The connector which was created by getConnector
     * @remarks Read once, when the connector is built; a later one is never called. Called
     *          during render, so it must not set state; it runs again for a render React
     *          discards (see UseLazyCrudConnectorParams).
     */
    configureConnector?: (connector: ApiConnector) => void;
    /**
     * The parent record's id: the Form's id (useFormContextLite().id), null for a new record
     * @remarks Read when the connector is built. A Form given another record mounts its page
     *          again, and the control builds a new connector for that record.
     */
    initialId: string | null;
}
export interface UseLazyCrudConnectorResult {
    connector: LazyConnector;
}
export declare const extractLazyCrudConnectorParams: <ExtraT, T extends UseLazyCrudConnectorParams<ExtraT>>(data: T) => [UseLazyCrudConnectorParams<ExtraT>, DistributiveOmit<T, keyof UseLazyCrudConnectorParams<ExtraT>>];
/**
 * Gives a Crud* control (FormCrudMultiSelect, FormCrudFileUpload, FormCrudMultiImage, …) a
 * LazyConnector bound to the current Form: reads go to getEndpoint(initialId), writes are
 * queued and sent to getEndpoint(savedId) after the Form saved its record
 * @param params See UseLazyCrudConnectorParams
 * @returns The connector, one per Form, field and record
 * @remarks
 * - The params are read once (see UseLazyCrudConnectorParams): a later getEndpoint,
 *   onParentIdChange, extraParams, getConnector, configureConnector or field changes
 *   neither the reads nor the save. Another collection takes another field and a new
 *   mount of the control, e.g. `key={field}`.
 * - getEndpoint, getConnector and configureConnector run while the control renders, so they
 *   must not set state; onParentIdChange runs after the control mounted and on every save.
 * - While the queue holds writes the Form is dirty (a custom dirty flag named `field`).
 * - A Form given another record (id or model) starts over: the control mounts again with a
 *   new connector for that record, and a queue left for the previous record is dropped,
 *   unsent, also when the new record's page does not show the control.
 * - The connector, queue included, is kept in the Form's custom state under `field`, so a
 *   control that unmounts and mounts again gets its queue back, and the Form is dirty again.
 * - Without onlySubmitMounted an unmounted control's queue keeps the Form dirty and is sent
 *   by the next save.
 * - With onlySubmitMounted an unmounted control's queue is neither sent nor counted as
 *   dirty, like the value of an unmounted model field, until the control mounts again.
 * - What counts is the onlySubmitMounted the Form has when the control unmounts. A mounted
 *   control's queue keeps the Form dirty and is sent by the next save, also when the Form's
 *   onlySubmitMounted changes meanwhile (its prop, or a flow stage config).
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
