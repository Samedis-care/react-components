import { useCallback, useEffect, useRef } from "react";
import DefaultConnector from "../../backend-integration/Connector/DefaultConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { useFormContext } from "./Form";
export const extractLazyCrudConnectorParams = (data) => {
    const { getEndpoint, initialId, getConnector, configureConnector, onParentIdChange, extraParams, field, ...otherProps } = data;
    const params = {
        getEndpoint,
        initialId,
        getConnector,
        configureConnector,
        onParentIdChange,
        extraParams,
        field,
    };
    return [params, otherProps];
};
/**
 * The connector the hook keeps in the Form's custom state under `field`
 * @remarks Keeps the getEndpoint and onParentIdChange it was built with, so that every save
 *          sends the queue where the reads go, also from a control that mounted again
 */
class FormLazyConnector extends LazyConnector {
    /**
     * Calls onParentIdChange with a parent record id, then returns getEndpoint(id), as the
     * connector was built with
     */
    getParentEndpoint;
    constructor(connector, fakeReads, onQueueChange, getParentEndpoint) {
        super(connector, fakeReads, onQueueChange);
        this.getParentEndpoint = getParentEndpoint;
    }
}
/**
 * Builds the connector of a field from the params of its first render
 * @param params The hook's params
 * @param onQueueChange Called with the queue whenever it changes
 * @throws "No default connector set" without params.getConnector and a default API connector
 */
const buildConnector = (params, onQueueChange) => {
    const { getEndpoint, initialId, configureConnector, onParentIdChange, extraParams, } = params;
    const getConnector = (params.getConnector ?? DefaultConnector.getApi);
    if (!getConnector)
        throw new Error("No default connector set");
    const getParentEndpoint = (id) => {
        if (onParentIdChange)
            onParentIdChange(id);
        return getEndpoint(id);
    };
    const connector = getConnector(getParentEndpoint(initialId ?? "null"), extraParams);
    if (configureConnector)
        configureConnector(connector);
    return new FormLazyConnector(connector, initialId === null, onQueueChange, getParentEndpoint);
};
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
 * - Flow mode with onlySubmitMounted: a submit, such as the one goToStage makes before it
 *   changes the stage, stages the queue of every mounted control, like the values of the
 *   mounted fields. The queue stays staged until it is empty (sent or undone). A control
 *   that unmounts with a staged queue, as it does when its stage is left, keeps the Form
 *   dirty, and the next submit to the server sends the queue with the record. A control
 *   hidden within its stage, with nothing staged since it mounted, follows
 *   onlySubmitMounted.
 */
const useLazyCrudConnector = (params) => {
    const { setPostSubmitHandler, removePostSubmitHandler, setCustomFieldDirty, getCustomState, setCustomState, setPreSubmitHandler, removePreSubmitHandler, onlySubmitMounted, flowEngine, } = useFormContext();
    // when updating params, also update extractLazyCrudConnectorParams
    // the params are read once: field when the control mounts, the others when the
    // connector is built (see UseLazyCrudConnectorParams)
    const field = useRef(params.field).current;
    const uploadConnector = useRef(null);
    if (!uploadConnector.current) {
        uploadConnector.current =
            getCustomState(field) ??
                buildConnector(params, (queue) => {
                    setCustomFieldDirty(field, queue.length !== 0);
                });
    }
    const connector = uploadConnector.current;
    /**
     * Has a flow form's submit staged the queue since the control mounted?
     * @remarks Set by the submit (the pre-submit handler below), cleared once the queue is
     *          empty (sent or undone)
     */
    const staged = useRef(false);
    // the connector's queue change handler belongs to the mounted control: it keeps the
    // Form's dirty flag and the staged state
    useEffect(() => {
        connector.setQueueChangeHandler((queue) => {
            if (queue.length === 0)
                staged.current = false;
            setCustomFieldDirty(field, queue.length !== 0);
        });
        // a queue kept from an earlier mount is listed again, and the next save sends it
        setCustomFieldDirty(field, !connector.isQueueEmpty());
    }, [connector, setCustomFieldDirty, field]);
    // in flow mode every submit stages the values of the mounted fields (goToStage makes one
    // before it changes the stage), and with them the queue of a mounted lazy control
    useEffect(() => {
        if (!flowEngine)
            return;
        setPreSubmitHandler(field, () => {
            staged.current = true;
        });
        return () => {
            removePreSubmitHandler(field);
        };
    }, [flowEngine, field, setPreSubmitHandler, removePreSubmitHandler]);
    /**
     * Does an unmount with onlySubmitMounted leave the queue to be saved anyway?
     * @remarks Only a staged one: a stage that is left was submitted first, a control hidden
     *          within its stage was not
     */
    const savedWhenUnmounted = useCallback(() => staged.current && !connector.isQueueEmpty(), [connector]);
    // set post submit handler for lazy connector
    useEffect(() => {
        setCustomState(field, () => connector);
        const submitHandler = async (id) => {
            // update API endpoint and disable fakeReads, then send requests
            connector.realConnector.setApiEndpoint(connector.getParentEndpoint(id));
            connector.fakeReads = false;
            return connector.workQueue();
        };
        setPostSubmitHandler(field, submitHandler);
        return () => {
            if (onlySubmitMounted && !savedWhenUnmounted()) {
                removePostSubmitHandler(field);
            }
        };
    }, [
        connector,
        field,
        setCustomState,
        setPostSubmitHandler,
        removePostSubmitHandler,
        onlySubmitMounted,
        savedWhenUnmounted,
    ]);
    // mark not dirty when unmounted and onlySubmitMounted
    useEffect(() => {
        if (!onlySubmitMounted)
            return;
        return () => {
            if (savedWhenUnmounted())
                return;
            setCustomFieldDirty(field, false);
        };
    }, [field, onlySubmitMounted, setCustomFieldDirty, savedWhenUnmounted]);
    return { connector };
};
export default useLazyCrudConnector;
