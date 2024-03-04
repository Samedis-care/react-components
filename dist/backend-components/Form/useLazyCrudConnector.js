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
const useLazyCrudConnector = (params) => {
    // when updating params, also update extractLazyCrudConnectorParams
    const { getEndpoint, initialId, getConnector: getConnectorOverride, configureConnector, onParentIdChange, extraParams, field, } = params;
    const { setPostSubmitHandler, removePostSubmitHandler, setCustomFieldDirty, getCustomState, setCustomState, onlySubmitMounted, } = useFormContext();
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
    // we need to update thee QueueChangeHandler if params changed
    useEffect(() => {
        uploadConnector.current.setQueueChangeHandler((queue) => {
            setCustomFieldDirty(field, queue.length !== 0);
        });
    }, [setCustomFieldDirty, field]);
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
            if (onlySubmitMounted) {
                removePostSubmitHandler(field);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPostSubmitHandler, onlySubmitMounted]);
    // mark not dirty when unmounted and onlySubmitMounted
    useEffect(() => {
        if (!onlySubmitMounted)
            return;
        return () => {
            setCustomFieldDirty(field, false);
        };
    }, [field, onlySubmitMounted, setCustomFieldDirty]);
    return { connector: uploadConnector.current };
};
export default useLazyCrudConnector;
