import { useCallback, useEffect, useRef } from "react";
import DefaultConnector from "../../backend-integration/Connector/DefaultConnector";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { useFormContext } from "./Form";
import { DistributiveOmit } from "../../utils/distributiveOmit";

/**
 * Params of useLazyCrudConnector, which FormCrudMultiSelect, FormCrudFileUpload,
 * FormCrudMultiImage and app wrappers take as props (extractLazyCrudConnectorParams splits
 * them off)
 * @typeParam ExtraT What extraParams holds: a record, as the default API connector factory
 *            takes it, or undefined
 * @remarks The params are read once, except onQueueSent: field when the control mounts, the
 *          others when the connector is built, which is the first time a control with this
 *          field renders in its Form. The connector then lives as long as the Form (a Form
 *          given another record starts over), and its reads and every save use what it was
 *          built with, also when a param changes later or the control mounts again with other
 *          ones. Another collection takes another field name and a new mount of the control,
 *          e.g. `key={field}`.
 *
 *          getEndpoint, getConnector and configureConnector build the connector while the
 *          control renders, so they must not set state or start work that needs cleaning up.
 *          A render React discards before it commits builds a connector that is never used:
 *          React 18's StrictMode discards the first render of every mount in development,
 *          so these run twice there. onParentIdChange is never called during render: it
 *          gets the id once the control that built the connector has mounted.
 */
export interface UseLazyCrudConnectorParams<
	ExtraT extends Record<string, unknown> | undefined = undefined,
> {
	/**
	 * The control's name in the Form: the Form keeps the control's connector (its custom
	 * state, `getCustomState<LazyConnector>(field)`), its post-submit handler and its custom
	 * dirty flag under it. Unique within the Form, and not a model field.
	 * @remarks Read when the control mounts; a later value is ignored. A control that
	 *          mounts again under the same name gets that name's connector back, queue
	 *          included, built from the params of the first mount.
	 *
	 *          Two controls with one name in a Form mix up their collections: one that mounts
	 *          while the other is mounted gets the other's connector and lists its
	 *          collection, and two that mount together share the dirty flag while the save
	 *          sends only the queue of the one that mounted last.
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
	 *
	 *          For a new record the connector is built for getEndpoint("null"), e.g.
	 *          `v1/orgs/null/roles`, but its list is never requested there: until the save,
	 *          the control lists what was queued, and the save points the connector at
	 *          getEndpoint(savedId) before it sends anything.
	 */
	getEndpoint: (id: string) => string;
	/**
	 * Called with the parent record's id once it is known: initialId once the control that
	 * built the connector has mounted (not for a new record, whose id comes with the save),
	 * and the saved record's id on every save, right before getEndpoint gets it and before
	 * the queue is sent. Never during render, so it may set state.
	 * @param id The parent record id
	 * @remarks Read once, when the connector is built; a later one is never called. Called
	 *          with initialId once per connector: not again when the control mounts again
	 *          under its field, nor when StrictMode runs its effects again. To act once the
	 *          save sent the queue, use onQueueSent.
	 */
	onParentIdChange?: (id: string) => void;
	/**
	 * Called by every save once the control's queue was sent, also when nothing was queued,
	 * e.g. to store a record's primary image under the server's id of a picked one
	 * @param id The saved record's id
	 * @param connector The control's connector: its mapId gives the server's id of a record
	 *        created through it
	 * @returns The save waits for it: the Form's "dirty" event and onSubmit come after it,
	 *          and a rejection fails the submit, although the record and the queue are saved
	 * @remarks Not called while the backend refuses a write of the queue (the submit
	 *          rejects with that refusal), and called by the next save that gets it through.
	 *          Read from the control's latest render, also from a control that mounts again
	 *          under its field; a control that unmounted with its queue left to the save
	 *          (without onlySubmitMounted) has the save call the one of its last render.
	 */
	onQueueSent?: (id: string, connector: LazyConnector) => Promise<void> | void;
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
	getConnector?: (
		initialEndpoint: string,
		extraParams: ExtraT | undefined,
	) => ApiConnector;
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

/**
 * What useLazyCrudConnector returns
 */
export interface UseLazyCrudConnectorResult {
	/**
	 * The connector to give the Crud* control: one per Form, field and record, the same
	 * instance on every render and for a control that mounts again under its field
	 * @remarks A record created through it has a client-side id (`fake-id-N`) and keeps it
	 *          for the connector's life, also after the save: index and read hand it out
	 *          under that id, and a deserialize of the control gets it as `id`. mapId gives
	 *          the server's id once the save sent the queue.
	 */
	connector: LazyConnector;
}

/**
 * Splits a wrapper component's props into the params of useLazyCrudConnector and the rest
 * @param data The props
 * @returns The hook's params (every key, absent ones undefined) and every other prop
 */
export const extractLazyCrudConnectorParams = <
	ExtraT extends Record<string, unknown> | undefined,
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
		onQueueSent,
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
		onQueueSent,
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
	private readonly getEndpoint: (id: string) => string;
	private readonly onParentIdChange: ((id: string) => void) | undefined;
	/**
	 * The parent record id the connector was built for, until onParentIdChange got it; null
	 * for a new record, whose id comes with the save
	 */
	private unreportedParentId: string | null;

	/**
	 * @remarks Built without a queue change handler: the control that mounts with the
	 *          connector sets it (setQueueChangeHandler), and counts what was queued before
	 */
	constructor(
		connector: ApiConnector,
		fakeReads: boolean,
		getEndpoint: (id: string) => string,
		onParentIdChange: ((id: string) => void) | undefined,
		parentId: string | null,
	) {
		super(connector, fakeReads);
		this.getEndpoint = getEndpoint;
		this.onParentIdChange = onParentIdChange;
		this.unreportedParentId = parentId;
	}

	/**
	 * Calls onParentIdChange with a parent record id, then returns getEndpoint(id), as the
	 * connector was built with
	 */
	public getParentEndpoint(id: string): string {
		this.unreportedParentId = null;
		if (this.onParentIdChange) this.onParentIdChange(id);
		return this.getEndpoint(id);
	}

	/**
	 * Calls onParentIdChange with the parent record id the connector was built for, unless
	 * it got an id already or the record is new
	 * @remarks Called by the effects of the control that mounts with the connector, so the
	 *          callback runs once per connector and never during render
	 */
	public reportParentId(): void {
		const id = this.unreportedParentId;
		if (id === null) return;
		this.unreportedParentId = null;
		if (this.onParentIdChange) this.onParentIdChange(id);
	}
}

/**
 * Builds the connector of a field from the params of its first render
 * @param params The hook's params
 * @throws "No default connector set" without params.getConnector and a default API connector
 * @remarks Runs during render: it calls getEndpoint, getConnector and configureConnector,
 *          but not onParentIdChange (see FormLazyConnector.reportParentId)
 */
const buildConnector = <ExtraT extends Record<string, unknown> | undefined>(
	params: UseLazyCrudConnectorParams<ExtraT>,
): FormLazyConnector => {
	const {
		getEndpoint,
		initialId,
		configureConnector,
		onParentIdChange,
		extraParams,
	} = params;
	const getConnector = params.getConnector ?? DefaultConnector.getApi;
	if (!getConnector) throw new Error("No default connector set");

	const connector = getConnector(getEndpoint(initialId ?? "null"), extraParams);
	if (configureConnector) configureConnector(connector);
	return new FormLazyConnector(
		connector,
		initialId === null,
		getEndpoint,
		onParentIdChange,
		initialId,
	);
};

/**
 * Gives a Crud* control (FormCrudMultiSelect, FormCrudFileUpload, FormCrudMultiImage, …) a
 * LazyConnector bound to the current Form: reads go to getEndpoint(initialId), writes are
 * queued and sent to getEndpoint(savedId) after the Form saved its record
 * @param params See UseLazyCrudConnectorParams
 * @returns The connector, one per Form, field and record
 * @throws Outside a Form ("Form Context not set. Not using form engine?"), and without
 *         params.getConnector and a default API connector ("No default connector set"),
 *         both while the control renders. A component that also renders outside a Form
 *         reads `useContext(FormContext)` and renders a child that calls this hook only
 *         inside one, rather than catching the error: a hook call in a try block breaks
 *         the rules of hooks.
 * @remarks
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
const useLazyCrudConnector = <
	ExtraT extends Record<string, unknown> | undefined = undefined,
>(
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
			getCustomState<FormLazyConnector>(field) ?? buildConnector(params);
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
	const savedWhenUnmounted = useCallback(
		() =>
			!onlySubmitMountedRef.current ||
			(staged.current && !connector.isQueueEmpty()),
		[connector],
	);
	// the connector's queue change handler belongs to the mounted control, and only this sets
	// it: it keeps the Form's dirty flag and the staged state. The dependencies are pinned or
	// stable, so this runs when the control mounts and unmounts, not when onlySubmitMounted
	// changes.
	useEffect(() => {
		connector.setQueueChangeHandler((queue) => {
			if (queue.length === 0) staged.current = false;
			setCustomFieldDirty(field, queue.length !== 0);
		});
		// what is queued already counts: a queue kept from an earlier mount, which is listed
		// again and sent by the next save, and the writes of a child's mount effect, which
		// runs before this one
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
			await connector.workQueue();
			await onQueueSent.current?.(id, connector);
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
