import { useCallback, useEffect, useRef } from "react";
import DefaultConnector from "../../backend-integration/Connector/DefaultConnector";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { useFormContext } from "./Form";

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
	getConnector?: (
		initialEndpoint: string,
		extraParams: ExtraT | undefined,
	) => ApiConnector;
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

export const extractLazyCrudConnectorParams = <
	ExtraT,
	T extends UseLazyCrudConnectorParams<ExtraT>,
>(
	data: T,
): [
	UseLazyCrudConnectorParams<ExtraT>,
	Omit<T, keyof UseLazyCrudConnectorParams<ExtraT>>,
] => {
	const {
		getEndpoint,
		initialId,
		getConnector,
		configureConnector,
		onParentIdChange,
		extraParams,
		field,
		...otherProps
	} = data;
	const params: UseLazyCrudConnectorParams<ExtraT> = {
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

const useLazyCrudConnector = <ExtraT = undefined>(
	params: UseLazyCrudConnectorParams<ExtraT>,
): UseLazyCrudConnectorResult => {
	// when updating params, also update extractLazyCrudConnectorParams
	const {
		getEndpoint,
		initialId,
		getConnector: getConnectorOverride,
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
	} = useFormContext<ModelUnknown>();

	const getEndpointWrap = useCallback(
		(currentId: string) => {
			if (onParentIdChange) onParentIdChange(currentId);
			return getEndpoint(currentId);
		},
		[onParentIdChange, getEndpoint],
	);

	const getConnector = (getConnectorOverride ?? DefaultConnector.getApi) as
		| ((
				initialEndpoint: string,
				extraParams: ExtraT | undefined,
		  ) => ApiConnector)
		| null;
	if (!getConnector) throw new Error("No default connector set");

	const getConnectorWrap = useCallback(
		(endpoint: string, extraParams: ExtraT | undefined) => {
			const connector = getConnector(endpoint, extraParams);
			if (configureConnector) configureConnector(connector);
			return connector;
		},
		[getConnector, configureConnector],
	);

	const uploadConnector = useRef<LazyConnector>(
		getCustomState<LazyConnector>(field) ??
			((): LazyConnector => {
				return new LazyConnector(
					getConnectorWrap(getEndpointWrap(initialId ?? "null"), extraParams),
					initialId === null,
					(queue) => {
						setCustomFieldDirty(field, queue.length !== 0);
					},
				);
			})(),
	);
	// we need to update thee QueueChangeHandler if params changed
	useEffect(() => {
		uploadConnector.current.setQueueChangeHandler((queue) => {
			setCustomFieldDirty(field, queue.length !== 0);
		});
	}, [setCustomFieldDirty, field]);

	// set post submit handler for lazy connector
	useEffect(() => {
		const connector = uploadConnector.current;
		setCustomState<LazyConnector>(field, () => connector);

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

	// mark not dirty when unmounted and onlySubmitMounted
	useEffect(() => {
		if (!onlySubmitMounted) return;
		return () => {
			setCustomFieldDirty(field, false);
		};
	}, [field, onlySubmitMounted, setCustomFieldDirty]);

	return { connector: uploadConnector.current };
};

export default useLazyCrudConnector;
