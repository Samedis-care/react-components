import { useEffect, useRef, useState } from "react";
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
	CustomT
> {
	/**
	 * The custom field name (must not be in model)
	 */
	field: string;
	/**
	 * The backend endpoint to use
	 */
	getEndpoint: (id: string) => string;
	/**
	 * Creates an instance of the underlying connector
	 * @param initialEndpoint The initial endpoint to use
	 */
	getConnector: (
		initialEndpoint: string
	) => ApiConnector<KeyT, VisibilityT, CustomT>;
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
	CustomT
>(
	params: UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT>
): UseLazyCrudConnectorResult<KeyT, VisibilityT, CustomT> => {
	const { getEndpoint, initialId, getConnector, field } = params;
	const {
		setPostSubmitHandler,
		removePostSubmitHandler,
		setCustomFieldDirty,
		getCustomState,
		setCustomState,
		onlySubmitMounted,
	} = useFormContext();
	const [dirty, setDirty] = useState(false);
	const uploadConnector = useRef<LazyConnector<KeyT, VisibilityT, CustomT>>(
		getCustomState<LazyConnector<KeyT, VisibilityT, CustomT>>(field) ??
			new LazyConnector<KeyT, VisibilityT, CustomT>(
				getConnector(getEndpoint(initialId ?? "null")),
				initialId === null,
				(queue) => setDirty(queue.length !== 0)
			)
	);

	// set post submit handler for lazy connector
	useEffect(() => {
		const connector = uploadConnector.current;
		setCustomState<LazyConnector<KeyT, VisibilityT, CustomT>>(
			field,
			() => connector
		);

		const submitHandler = async (id: string) => {
			// update API endpoint and disable fakeReads, then send requests
			connector.realConnector.setApiEndpoint(getEndpoint(id));
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
