import { useCallback, useEffect, useRef, useState } from "react";
import {
	LazyConnector,
	ModelFieldName,
	PageVisibility,
	useFormContext,
} from "../..";
import { ApiConnector } from "../../backend-integration";

export interface UseLazyCrudConnectorParams<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	ExtraT = undefined
> {
	/**
	 * The custom field name (must not be in model)
	 */
	field: string;
	/**
	 * Extra parameters to be passed to the getEndpoint function
	 */
	extraParams: ExtraT;
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
	 */
	getConnector: (
		initialEndpoint: string,
		extraParams: ExtraT
	) => ApiConnector<KeyT, VisibilityT, CustomT>;
	/**
	 * Callback to configure the connector after it got created by getConnector
	 * @param connector The connector which was created by getConnector
	 */
	configureConnector?: (
		connector: ApiConnector<KeyT, VisibilityT, CustomT>
	) => void;
	/**
	 * The initial ID to use for getEndpoint
	 */
	initialId: string | null;
}

export interface UseLazyCrudConnectorResult<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	connector: LazyConnector<KeyT, VisibilityT, CustomT>;
}

const useLazyCrudConnector = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	ExtraT = undefined
>(
	params: UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, ExtraT>
): UseLazyCrudConnectorResult<KeyT, VisibilityT, CustomT> => {
	const {
		getEndpoint,
		initialId,
		getConnector,
		configureConnector,
		onParentIdChange,
		extraParams,
		field,
	} = params;
	const {
		setPostSubmitHandler,
		removePostSubmitHandler,
		setCustomFieldDirty,
		getCustomState,
		setCustomState,
		onlySubmitMounted,
	} = useFormContext();

	const getEndpointWrap = useCallback(
		(currentId: string) => {
			if (onParentIdChange) onParentIdChange(currentId);
			return getEndpoint(currentId);
		},
		[onParentIdChange, getEndpoint]
	);

	const getConnectorWrap = useCallback(
		(endpoint: string, extraParams: ExtraT) => {
			const connector = getConnector(endpoint, extraParams);
			if (configureConnector) configureConnector(connector);
			return connector;
		},
		[getConnector, configureConnector]
	);

	const [dirty, setDirty] = useState(false);
	const uploadConnector = useRef<LazyConnector<KeyT, VisibilityT, CustomT>>(
		getCustomState<LazyConnector<KeyT, VisibilityT, CustomT>>(field) ??
			((): LazyConnector<KeyT, VisibilityT, CustomT> => {
				return new LazyConnector<KeyT, VisibilityT, CustomT>(
					getConnectorWrap(getEndpointWrap(initialId ?? "null"), extraParams),
					initialId === null,
					(queue) => setDirty(queue.length !== 0)
				);
			})()
	);
	// when remounting, we need to update the onQueueChange callback in lazy connector, otherwise the bound setDirty function will update an unmounted component
	useEffect(() => {
		uploadConnector.current.setQueueChangeHandler((queue) =>
			setDirty(queue.length !== 0)
		);
	}, []);

	// set post submit handler for lazy connector
	useEffect(() => {
		const connector = uploadConnector.current;
		setCustomState<LazyConnector<KeyT, VisibilityT, CustomT>>(
			field,
			() => connector
		);

		const submitHandler = async (id: string) => {
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

	// manage dirty state
	useEffect(() => {
		setCustomFieldDirty(field, dirty);
		if (!onlySubmitMounted) return;
		return () => {
			setCustomFieldDirty(field, false);
		};
	}, [field, dirty, onlySubmitMounted, setCustomFieldDirty]);

	return { connector: uploadConnector.current };
};

export default useLazyCrudConnector;
