import { useCallback, useEffect, useRef } from "react";
import DefaultConnector from "../../backend-integration/Connector/DefaultConnector";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { useFormContext } from "./Form";
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
	 *          function, a later one is never called.
	 */
	getEndpoint: (id: string) => string;
	/**
	 * Called with the parent record's id whenever getEndpoint is: when the connector is
	 * built and on every save
	 * @param id The parent record id
	 * @remarks Read once, when the connector is built; a later one is never called.
	 */
	onParentIdChange?: (id: string) => void;
	/**
	 * Creates the real connector, which the reads go through and the save sends the queue
	 * through
	 * @param initialEndpoint getEndpoint(initialId), getEndpoint("null") for a new record
	 * @param extraParams The extraParams param
	 * @default DefaultConnector.getApi (set by setDefaultConnectorAPI); with neither, building
	 *          the connector throws "No default connector set"
	 * @remarks Read once, when the connector is built; a later one is never called.
	 */
	getConnector?: (
		initialEndpoint: string,
		extraParams: ExtraT | undefined,
	) => ApiConnector;
	/**
	 * Called with the connector getConnector (or the default factory) created, right after
	 * it was created, e.g. to set request options
	 * @param connector The connector which was created by getConnector
	 * @remarks Read once, when the connector is built; a later one is never called.
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

export const extractLazyCrudConnectorParams = <
	ExtraT,
	T extends UseLazyCrudConnectorParams<ExtraT>,
>(
	data: T,
): [
	UseLazyCrudConnectorParams<ExtraT>,
	DistributiveOmit<T, keyof UseLazyCrudConnectorParams<ExtraT>>,
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
	// the props a union keeps apart stay apart: only the connector params are left out
	return [
		params,
		otherProps as DistributiveOmit<T, keyof UseLazyCrudConnectorParams<ExtraT>>,
	];
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
	public readonly getParentEndpoint: (id: string) => string;

	constructor(
		connector: ApiConnector,
		fakeReads: boolean,
		onQueueChange: ConstructorParameters<typeof LazyConnector>[2],
		getParentEndpoint: (id: string) => string,
	) {
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
const buildConnector = <ExtraT>(
	params: UseLazyCrudConnectorParams<ExtraT>,
	onQueueChange: ConstructorParameters<typeof LazyConnector>[2],
): FormLazyConnector => {
	const {
		getEndpoint,
		initialId,
		configureConnector,
		onParentIdChange,
		extraParams,
	} = params;
	const getConnector = (params.getConnector ?? DefaultConnector.getApi) as
		| ((
				initialEndpoint: string,
				extraParams: ExtraT | undefined,
		  ) => ApiConnector)
		| null;
	if (!getConnector) throw new Error("No default connector set");

	const getParentEndpoint = (id: string) => {
		if (onParentIdChange) onParentIdChange(id);
		return getEndpoint(id);
	};
	const connector = getConnector(
		getParentEndpoint(initialId ?? "null"),
		extraParams,
	);
	if (configureConnector) configureConnector(connector);
	return new FormLazyConnector(
		connector,
		initialId === null,
		onQueueChange,
		getParentEndpoint,
	);
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
const useLazyCrudConnector = <ExtraT = undefined>(
	params: UseLazyCrudConnectorParams<ExtraT>,
): UseLazyCrudConnectorResult => {
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

	// when updating params, also update extractLazyCrudConnectorParams
	// the params are read once: field when the control mounts, the others when the
	// connector is built (see UseLazyCrudConnectorParams)
	const field = useRef(params.field).current;
	const uploadConnector = useRef<FormLazyConnector | null>(null);
	if (!uploadConnector.current) {
		uploadConnector.current =
			getCustomState<FormLazyConnector>(field) ??
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
	const savedWhenUnmounted = useCallback(
		() =>
			!onlySubmitMountedRef.current ||
			(staged.current && !connector.isQueueEmpty()),
		[connector],
	);
	// the connector's queue change handler belongs to the mounted control: it keeps the
	// Form's dirty flag and the staged state. The dependencies are pinned or stable, so this
	// runs when the control mounts and unmounts, not when onlySubmitMounted changes.
	useEffect(() => {
		connector.setQueueChangeHandler((queue) => {
			if (queue.length === 0) staged.current = false;
			setCustomFieldDirty(field, queue.length !== 0);
		});
		// a queue kept from an earlier mount is listed again, and the next save sends it
		setCustomFieldDirty(field, !connector.isQueueEmpty());
		return () => {
			// a queue the save leaves out does not keep the Form dirty either
			if (!savedWhenUnmounted()) setCustomFieldDirty(field, false);
		};
	}, [connector, setCustomFieldDirty, field, savedWhenUnmounted]);

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

	// set post submit handler for lazy connector
	useEffect(() => {
		setCustomState<LazyConnector>(field, () => connector);

		const submitHandler = async (id: string) => {
			// update API endpoint and disable fakeReads, then send requests
			connector.realConnector.setApiEndpoint(connector.getParentEndpoint(id));
			connector.fakeReads = false;
			return connector.workQueue();
		};
		setPostSubmitHandler(field, submitHandler);
		return () => {
			if (!savedWhenUnmounted()) removePostSubmitHandler(field);
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
