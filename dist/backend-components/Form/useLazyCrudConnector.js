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
 * Gives a Crud* control (FormCrudMultiSelect, FormCrudFileUpload, FormCrudMultiImage, …) a
 * LazyConnector bound to the current Form: reads go to getEndpoint(initialId), writes are
 * queued and sent to getEndpoint(savedId) after the Form saved its record
 * @param params See UseLazyCrudConnectorParams
 * @returns The connector, one per Form, field and record
 * @remarks
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
    // when updating params, also update extractLazyCrudConnectorParams
    const { getEndpoint, initialId, getConnector: getConnectorOverride, configureConnector, onParentIdChange, extraParams, field, } = params;
    const { setPostSubmitHandler, removePostSubmitHandler, setCustomFieldDirty, getCustomState, setCustomState, setPreSubmitHandler, removePreSubmitHandler, onlySubmitMounted, flowEngine, } = useFormContext();
    const getEndpointWrap = useCallback((currentId) => {
        if (onParentIdChange)
            onParentIdChange(currentId);
        return getEndpoint(currentId);
    }, [onParentIdChange, getEndpoint]);
    const getConnector = (getConnectorOverride ?? DefaultConnector.getApi);
    if (!getConnector)
        throw new Error("No default connector set");
    const getConnectorWrap = useCallback((endpoint, extraParams) => {
        const connector = getConnector(endpoint, extraParams);
        if (configureConnector)
            configureConnector(connector);
        return connector;
    }, [getConnector, configureConnector]);
    const uploadConnector = useRef(getCustomState(field) ??
        (() => {
            return new LazyConnector(getConnectorWrap(getEndpointWrap(initialId ?? "null"), extraParams), initialId === null, (queue) => {
                setCustomFieldDirty(field, queue.length !== 0);
            });
        })());
    /**
     * Has a flow form's submit staged the queue since the control mounted?
     * @remarks Set by the submit (the pre-submit handler below), cleared once the queue is
     *          empty (sent or undone)
     */
    const staged = useRef(false);
    // we need to update thee QueueChangeHandler if params changed
    useEffect(() => {
        const connector = uploadConnector.current;
        connector.setQueueChangeHandler((queue) => {
            if (queue.length === 0)
                staged.current = false;
            setCustomFieldDirty(field, queue.length !== 0);
        });
        // a queue kept from an earlier mount is listed again, and the next save sends it
        setCustomFieldDirty(field, !connector.isQueueEmpty());
    }, [setCustomFieldDirty, field]);
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
    const savedWhenUnmounted = useCallback(() => staged.current && !uploadConnector.current.isQueueEmpty(), []);
    // set post submit handler for lazy connector
    useEffect(() => {
        const connector = uploadConnector.current;
        setCustomState(field, () => connector);
        const submitHandler = async (id) => {
            // update API endpoint and disable fakeReads, then send requests
            connector.realConnector.setApiEndpoint(getEndpointWrap(id));
            connector.fakeReads = false;
            return connector.workQueue();
        };
        setPostSubmitHandler(field, submitHandler);
        return () => {
            if (onlySubmitMounted && !savedWhenUnmounted()) {
                removePostSubmitHandler(field);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPostSubmitHandler, onlySubmitMounted, savedWhenUnmounted]);
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
    return { connector: uploadConnector.current };
};
export default useLazyCrudConnector;
