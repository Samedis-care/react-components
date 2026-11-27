import { useCallback, useEffect, useRef } from "react";
import DefaultConnector from "../../backend-integration/Connector/DefaultConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { useFormContextLite } from "./Form";
/**
 * Splits a wrapper component's props into the params of useLazyCrudConnector and the rest
 * @param data The props
 * @returns The hook's params (every key, absent ones undefined) and every other prop
 */
export const extractLazyCrudConnectorParams = (data) => {
    const { getEndpoint, initialId, getConnector, configureConnector, onParentIdChange, onQueueSent, extraParams, field, ...otherProps } = data;
    const params = {
        getEndpoint,
        initialId,
        getConnector,
        configureConnector,
        onParentIdChange,
        onQueueSent,
        extraParams,
        field,
    };
    // the props a union keeps apart stay apart: only the connector params are left out
    return [
        params,
        otherProps,
    ];
};
/**
 * The connector the hook keeps in the Form's custom state under `field`
 * @remarks Keeps the getEndpoint and onParentIdChange it was built with, so that every save
 *          sends the queue where the reads go, also from a control that mounted again
 */
class FormLazyConnector extends LazyConnector {
    getEndpoint;
    onParentIdChange;
    /**
     * The parent record id the connector was built for, until onParentIdChange got it; null
     * for a new record, whose id comes with the save
     */
    unreportedParentId;
    /**
     * @remarks Built without a queue change handler: the control that mounts with the
     *          connector sets it (setQueueChangeHandler), and counts what was queued before
     */
    constructor(connector, fakeReads, getEndpoint, onParentIdChange, parentId) {
        super(connector, fakeReads);
        this.getEndpoint = getEndpoint;
        this.onParentIdChange = onParentIdChange;
        this.unreportedParentId = parentId;
    }
    /**
     * Calls onParentIdChange with a parent record id, then returns getEndpoint(id), as the
     * connector was built with
     */
    getParentEndpoint(id) {
        this.unreportedParentId = null;
        if (this.onParentIdChange)
            this.onParentIdChange(id);
        return this.getEndpoint(id);
    }
    /**
     * Calls onParentIdChange with the parent record id the connector was built for, unless
     * it got an id already or the record is new
     * @remarks Called by the effects of the control that mounts with the connector, so the
     *          callback runs once per connector and never during render
     */
    reportParentId() {
        const id = this.unreportedParentId;
        if (id === null)
            return;
        this.unreportedParentId = null;
        if (this.onParentIdChange)
            this.onParentIdChange(id);
    }
}
/**
 * Builds the connector of a field from the params of its first render
 * @param params The hook's params
 * @throws "No default connector set" without params.getConnector and a default API connector
 * @remarks Runs during render: it calls getEndpoint, getConnector and configureConnector,
 *          but not onParentIdChange (see FormLazyConnector.reportParentId)
 */
const buildConnector = (params) => {
    const { getEndpoint, initialId, configureConnector, onParentIdChange, extraParams, } = params;
    const getConnector = params.getConnector ?? DefaultConnector.getApi;
    if (!getConnector)
        throw new Error("No default connector set");
    const connector = getConnector(getEndpoint(initialId ?? "null"), extraParams);
    if (configureConnector)
        configureConnector(connector);
    return new FormLazyConnector(connector, initialId === null, getEndpoint, onParentIdChange, initialId);
};
/**
 * Gives a Crud* control (FormCrudMultiSelect, FormCrudFileUpload, FormCrudMultiImage, …) a
 * LazyConnector bound to the current Form: reads go to getEndpoint(initialId), writes are
 * queued and sent to getEndpoint(savedId) after the Form saved its record
 * @param params See UseLazyCrudConnectorParams
 * @returns The connector, one per Form, field and record
 * @throws Outside a Form ("Form Context (Lite) not set. Not using form engine?"), and
 *         without params.getConnector and a default API connector ("No default connector
 *         set"), both while the control renders. A component that also renders outside a
 *         Form reads `useContext(FormContextLite)` and renders a child that calls this hook
 *         only inside one, rather than catching the error: a hook call in a try block breaks
 *         the rules of hooks.
 * @remarks
 * - Reads the Form's lite context (useFormContextLite), not the full one: through this hook
 *   the control renders again when the Form's state changes (dirty, read-only, submitting,
 *   …), not when one of its values does.
 * - The params are read once (see UseLazyCrudConnectorParams): a later getEndpoint,
 *   onParentIdChange, extraParams, getConnector, configureConnector or field changes
 *   neither the reads nor the save. Another collection takes another field and a new
 *   mount of the control, e.g. `key={field}`. onQueueSent is read from the latest render.
 * - getEndpoint, getConnector and configureConnector run while the control renders, so they
 *   must not set state; onParentIdChange runs after the control mounted and on every save.
 * - While the queue holds writes the Form is dirty (a custom dirty flag named `field`).
 * - A record created through the connector keeps its client-side id (`fake-id-N`) for the
 *   connector's life: the control's deserialize gets it as `id` until the save, and after
 *   it, from the connector's index. Derive nothing but the entry's own id from `id` there,
 *   and read other ids from the fields serialize returns. The connector's mapId gives the
 *   server's id once the save sent the queue (see onQueueSent).
 * - The save sends the queue after the record was saved (LazyConnector.workQueue), then
 *   calls onQueueSent. A create or update the backend refuses does not stop it: the creates
 *   and updates queued after it are sent, the deletes queued after it stay queued until it
 *   went through. The refused writes stay queued, so the Form stays dirty, onQueueSent is
 *   not called, and the submit rejects although the record was saved, with an error that
 *   names them: CrudMultiSelect and CrudMultiSelectWithGroups name each by its entry's
 *   label, CrudFileUpload and CrudMultiImage by its file's or image's name (a
 *   PartialApplyError each); with a control that sets no error factory it is the backend's
 *   refusal, or an AggregateError of several.
 * - A Form given another record (id or model) starts over: the control mounts again with a
 *   new connector for that record, and a queue left for the previous record is dropped,
 *   unsent, also when the new record's page does not show the control.
 * - The connector, queue included, is kept in the Form's custom state under `field`, so a
 *   control that unmounts and mounts again gets its queue back, and the Form is dirty again.
 * - Without onlySubmitMounted an unmounted control's queue keeps the Form dirty and is sent
 *   by the next save, also when the page hides the control because the record no longer
 *   needs the collection.
 * - With onlySubmitMounted an unmounted control's queue is neither sent nor counted as
 *   dirty, like the value of an unmounted model field, until the control mounts again. To
 *   keep the changes of a control the page hides out of the save, give the Form
 *   onlySubmitMounted.
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
const useLazyCrudConnector = (params) => {
    const { setPostSubmitHandler, removePostSubmitHandler, setCustomFieldDirty, getCustomState, setCustomState, setPreSubmitHandler, removePreSubmitHandler, onlySubmitMounted, flowEngine, } = useFormContextLite();
    // when updating params, also update extractLazyCrudConnectorParams
    // the params are read once: field when the control mounts, the others when the
    // connector is built (see UseLazyCrudConnectorParams)
    const field = useRef(params.field).current;
    const uploadConnector = useRef(null);
    if (!uploadConnector.current) {
        uploadConnector.current =
            getCustomState(field) ?? buildConnector(params);
    }
    const connector = uploadConnector.current;
    // read from the latest render, unlike the params the connector is built from
    const onQueueSent = useRef(params.onQueueSent);
    onQueueSent.current = params.onQueueSent;
    // the parent id the connector was built for goes to onParentIdChange once the control
    // mounted, not while it renders: a state update there would update another component
    // during render. Once per connector, also when StrictMode runs the effect again.
    useEffect(() => {
        connector.reportParentId();
    }, [connector]);
    /**
     * Has a flow form's submit staged the queue since the control mounted?
     * @remarks Set by the submit (the pre-submit handler below), cleared once the queue is
     *          empty (sent or undone)
     */
    const staged = useRef(false);
    /**
     * The Form's onlySubmitMounted as of the control's latest render
     * @remarks Read when the control unmounts, not when it changes: while the control is
     *          mounted its queue counts whatever the value, and the value the Form has when
     *          the control unmounts decides what becomes of the queue
     */
    const onlySubmitMountedRef = useRef(onlySubmitMounted);
    onlySubmitMountedRef.current = onlySubmitMounted;
    /**
     * Does an unmount leave the queue to be saved, and counted as dirty?
     * @remarks Without onlySubmitMounted always. With it only a staged one: a stage that is
     *          left was submitted first, a control hidden within its stage was not
     */
    const savedWhenUnmounted = useCallback(() => !onlySubmitMountedRef.current ||
        (staged.current && !connector.isQueueEmpty()), [connector]);
    // the connector's queue change handler belongs to the mounted control, and only this sets
    // it: it keeps the Form's dirty flag and the staged state. The dependencies are pinned or
    // stable, so this runs when the control mounts and unmounts, not when onlySubmitMounted
    // changes.
    useEffect(() => {
        connector.setQueueChangeHandler((queue) => {
            if (queue.length === 0)
                staged.current = false;
            setCustomFieldDirty(field, queue.length !== 0);
        });
        // what is queued already counts: a queue kept from an earlier mount, which is listed
        // again and sent by the next save, and the writes of a child's mount effect, which
        // runs before this one
        setCustomFieldDirty(field, !connector.isQueueEmpty());
        return () => {
            // a queue the save leaves out does not keep the Form dirty either
            if (!savedWhenUnmounted())
                setCustomFieldDirty(field, false);
        };
    }, [connector, setCustomFieldDirty, field, savedWhenUnmounted]);
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
    // set post submit handler for lazy connector
    useEffect(() => {
        setCustomState(field, () => connector);
        const submitHandler = async (id) => {
            // update API endpoint and disable fakeReads, then send requests
            connector.realConnector.setApiEndpoint(connector.getParentEndpoint(id));
            connector.fakeReads = false;
            await connector.workQueue();
            await onQueueSent.current?.(id, connector);
        };
        setPostSubmitHandler(field, submitHandler);
        return () => {
            if (!savedWhenUnmounted())
                removePostSubmitHandler(field);
        };
    }, [
        connector,
        field,
        setCustomState,
        setPostSubmitHandler,
        removePostSubmitHandler,
        savedWhenUnmounted,
    ]);
    return { connector };
};
export default useLazyCrudConnector;
