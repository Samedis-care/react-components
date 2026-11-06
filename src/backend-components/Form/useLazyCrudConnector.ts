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
		setPreSubmitHandler,
		removePreSubmitHandler,
		onlySubmitMounted,
		flowEngine,
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
			if (queue.length === 0) staged.current = false;
			setCustomFieldDirty(field, queue.length !== 0);
		});
		// a queue kept from an earlier mount is listed again, and the next save sends it
		setCustomFieldDirty(field, !connector.isQueueEmpty());
	}, [setCustomFieldDirty, field]);

	// in flow mode every submit stages the values of the mounted fields (goToStage makes one
	// before it changes the stage), and with them the queue of a mounted lazy control
	useEffect(() => {
		if (!flowEngine) return;
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
	const savedWhenUnmounted = useCallback(
		() => staged.current && !uploadConnector.current.isQueueEmpty(),
		[],
	);

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
			if (onlySubmitMounted && !savedWhenUnmounted()) {
				removePostSubmitHandler(field);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setPostSubmitHandler, onlySubmitMounted, savedWhenUnmounted]);

	// mark not dirty when unmounted and onlySubmitMounted
	useEffect(() => {
		if (!onlySubmitMounted) return;
		return () => {
			if (savedWhenUnmounted()) return;
			setCustomFieldDirty(field, false);
		};
	}, [field, onlySubmitMounted, setCustomFieldDirty, savedWhenUnmounted]);

	return { connector: uploadConnector.current };
};

export default useLazyCrudConnector;
