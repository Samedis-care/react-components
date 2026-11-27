import {
	Connector,
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration";
import { BaseSelectorData } from "../../standalone";
import {
	ForwardedRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import toComparisonJson from "../../utils/toComparisonJson";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { FormContext, ValidationResult } from "../Form";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import PartialApplyError, {
	PartialApplyFailure,
} from "../Form/PartialApplyError";

export interface UseCrudSelectParams<
	M extends ModelUnknown,
	DataT extends BaseSelectorData,
> {
	/**
	 * The backend connector used as CRUD interface
	 * @remarks A LazyConnector queues the writes until its queue is sent (a Form's save). If
	 *          the backend refuses a write of the queue while the control is mounted, the
	 *          queue rejects with a PartialApplyError that names it by the entry's label, as
	 *          a refused write is named in `error` with any other connector.
	 */
	connector: Connector;
	/**
	 * Callback for serializing data before passing it to the backend connector
	 * @param data The selector data to serialize
	 * @returns Data to be passed to the backend connector, id may be null or data.value
	 * @remarks Must stay pure: it runs for additions, updates and removals at
	 *   backend (POST/PUT/DELETE) time, and on every change for each entry that stays
	 *   selected, to tell whether it changed. Do NOT trigger UI side effects (dialogs,
	 *   prompts) here — use {@link prepareNewEntry} to collect extra data on add.
	 *
	 *   What it returns decides whether an entry is updated: an entry handed to
	 *   `handleSelect` is written only when its result differs, compared as JSON, from the
	 *   result for the listed entry. A new but equal object, array or Date is no change.
	 *   A field it leaves out (`label`, `titleTooltip`, `onClick`, …) never causes a
	 *   write; a change of a field it returns does, also of a render field such as `label`.
	 */
	serialize: (
		data: DataT,
	) =>
		| Promise<Partial<Record<string, unknown>>>
		| Partial<Record<string, unknown>>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data The data from the backend connector (index function, or the record a
	 *   create returned)
	 * @returns The selector data which can be used by the control
	 * @remarks If it fails for the record of a create, the row exists anyway: it is
	 *   listed as the entry that was created, with the row's `id` as `value` (so
	 *   `serialize` has to read a kept entry's row id from `value`), and the failure is
	 *   reported in `error` as a PartialApplyError failure with the action `read`.
	 */
	deserialize: (data: Record<string, unknown>) => Promise<DataT> | DataT;
	/**
	 * Callback for deserializing data from the model
	 * @param data The data from the backend connector (index function)
	 * @returns The selector data which can be used by the control
	 * @remarks Must stay pure: it runs once per search result during option load.
	 *   Do NOT trigger UI side effects (dialogs, prompts) here — they would fire
	 *   for every dropdown option. Use {@link prepareNewEntry} to collect extra
	 *   data on add.
	 */
	deserializeModel: (
		data: ModelRecord<M>,
	) => Promise<Omit<DataT, "value">> | Omit<DataT, "value">;
	/**
	 * Called once per newly-added entry, before it is serialized/created.
	 * Use it to collect extra join-record data (e.g. via a dialog) or to
	 * augment the entry. Resolve `null` to cancel the addition cleanly
	 * (the entry is NOT added and NO error is raised). Thrown errors still
	 * surface via the error component (genuine failures only).
	 * Runs only for additions — never for updates, removals, or option load.
	 * @param entry The entry that is about to be added
	 * @returns The (possibly augmented) entry to create, or `null` to cancel
	 */
	prepareNewEntry?: (entry: DataT) => Promise<DataT | null> | DataT | null;
	/**
	 * Selection change event
	 * @param selected The new selection
	 */
	onChange?: (selected: DataT[]) => void;
	/**
	 * Validation callback for integration with form engine
	 * @param data The currently selected data
	 * @returns object Validation errors (Key => Values)
	 * @remarks Only works with FormEngine. Requires field to be set
	 */
	validate?: (data: DataT[]) => ValidationResult;
	/**
	 * The field to apply the validations for
	 * @remarks for Form Engine
	 * @see validate
	 */
	field?: string;
	/**
	 * Get ID of data
	 */
	getIdOfData: NonNullable<BackendMultiSelectProps<M, DataT>["getIdOfData"]>;
	/**
	 * Is the control disabled? A disabled control writes nothing: handleSelect ignores
	 * every change and addToSelection rejects, also when an end adornment or the caller's
	 * ref calls them
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Writes nothing while true, as if disabled (handleSelect ignores every change and
	 * addToSelection rejects), but leaves the control as it is: the search field stays
	 * enabled and keeps its focus and typed text, and the entries keep their remove
	 * buttons. For a short time in which the selection must not change, such as the save
	 * of the Form a FormCrudMultiSelect is in.
	 * @default false
	 */
	blockWrites?: boolean;
}

export interface UseCrudSelectResult<
	M extends ModelUnknown,
	DataT extends BaseSelectorData,
> {
	/**
	 * Fetching initial data?
	 */
	loading: boolean;
	/**
	 * Error while updating data
	 */
	error: Error | null;
	/**
	 * Error while fetching initial data
	 */
	loadError: Error | null;
	/**
	 * Currently selected entries
	 */
	selected: DataT[];
	/**
	 * The values of the selected entries whose create is queued and not sent yet
	 * @remarks Only with a LazyConnector, whose writes wait for the Form's save (empty
	 *          otherwise). An entry's queued write is looked up by its `value`, the record's
	 *          id.
	 */
	added: string[];
	/**
	 * The entries removed from the selection whose delete is queued and not sent yet, in the
	 * order they were removed; not part of `selected`
	 * @remarks Only with a LazyConnector (empty otherwise). They include the removals queued
	 *          while the control was unmounted before. An entry leaves the list when its
	 *          delete is sent, and is selected again by handleSelect with the entry added,
	 *          which cancels the delete instead of creating the record again.
	 */
	removed: DataT[];
	/**
	 * Does the LazyConnector hold writes of this control that are not sent yet (picks,
	 * removals or changes)? Always false with another connector, which writes at once.
	 */
	pendingChanges: boolean;
	/**
	 * The records the connector listed or created (raw data), including those of `removed`
	 */
	initialRawData: Record<string, unknown>[];
	/**
	 * Selection handler
	 * @param ids The new selected entry ids
	 * @param newSelected The new selected entries. A listed entry whose id is in `ids` but
	 *        that is missing here stays as it is, in its place: BackendMultiSelect reports
	 *        an entry that is still loading by its id only.
	 * @returns Resolves once the change is applied, after the changes made before it
	 * @remarks Ignores the change while the control is disabled. The change is the
	 *          difference between `selected` of the render this handler comes from and
	 *          `newSelected`: it creates the entries that are not listed yet, deletes the
	 *          listed ones that are left out, and updates a listed entry only when
	 *          `serialize` returns something else for it than for the listed entry. An entry
	 *          of `removed` added back is restored: its queued delete is cancelled, nothing
	 *          is created.
	 *
	 *          The changes, and `addToSelection` with them, are applied one after another in
	 *          the order they were made: a change waits until the writes of the ones before
	 *          it have settled, then applies only its own difference to the selection they
	 *          left, so a change made in a render before they settled does not undo them.
	 *          Its deleted entries leave the selection, its updated ones are replaced in
	 *          their place, and its created and restored ones are added at the end; a refused
	 *          removal or update leaves the entry as and where it is. Left out of a change,
	 *          as the same gesture reported again (a second click on a remove button, a pick
	 *          made before the field lists the first one): the removal of an entry that a
	 *          change before is deleting or has deleted, the pick of a record (by
	 *          `getIdOfData`) that a change before is creating or has linked, and an update a
	 *          change before has written. A change that writes nothing leaves `error` as it
	 *          is, and one whose turn comes while the control is disabled, or once it has
	 *          unmounted, writes nothing.
	 */
	handleSelect: (ids: string[], newSelected: DataT[]) => Promise<void>;
	/**
	 * Does the control write nothing right now (disabled, read-only, or blockWrites)? An end
	 * adornment that picks or removes entries locks itself while it is: handleSelect
	 * ignores its changes meanwhile
	 * @see UseCrudSelectParams.disabled
	 * @see UseCrudSelectParams.blockWrites
	 */
	disabled: boolean;
	/**
	 * Makes the entry for a record of the searched model, as the field does for a pick: its
	 * `deserializeModel` result with the value `"to-create-" + getIdOfData(entry)`. A record
	 * the connector listed or created (in `initialRawData`) gives its listed entry instead.
	 * @param data The record
	 * @remarks An end adornment that picks records itself makes the new entries it hands
	 *          handleSelect with this, so that they are what a pick in the field is, value
	 *          included, which `serialize` leaves out of the create.
	 */
	modelToSelectorData: (data: ModelRecord<M>) => Promise<DataT>;
}

export interface CrudSelectDispatch<DataT extends BaseSelectorData> {
	/**
	 * Adds the entry to the list of selected records
	 * @param entry The entry to insert
	 * @returns Resolves once the entry is selected. Rejects with the error of the create
	 *   if it failed. Rejects with a PartialApplyError whose failure has the action
	 *   `read` if `deserialize` failed after the create went through: the entry is
	 *   selected then, as it was passed in, with the row's `id` as `value`. Rejects without
	 *   a write if the control is disabled when the entry's turn comes, or has unmounted.
	 * @remarks The entry's turn comes once the selection has loaded and the changes made
	 *          before the call (handleSelect, addToSelection) are applied; nothing is created
	 *          if a selected entry has its `getIdOfData` then. Does not update existing
	 *          record
	 */
	addToSelection: (entry: DataT) => Promise<void>;
}

// the entry as the field names it, for the message of a write that failed
const labelOf = (entry: BaseSelectorData): string =>
	typeof entry.label === "string" ? entry.label : entry.label[0];

const toPartialApplyError = <DataT extends BaseSelectorData>(
	failures: PartialApplyFailure<DataT>[],
) =>
	new PartialApplyError(
		failures
			.map((failure) => `${labelOf(failure.entry)}: ${failure.error.message}`)
			.join("; "),
		failures,
	);

interface CreatedEntry<DataT extends BaseSelectorData> {
	/**
	 * The row the connector created
	 */
	record: Record<string, unknown>;
	/**
	 * The entry listed for it
	 */
	entry: DataT;
	/**
	 * Why `deserialize` failed: the entry is then the one sent, under the row's id
	 */
	readError?: Error;
}

/**
 * Creates the row of a new entry. Rejects only when nothing was created: once the row
 * exists it is listed, so it can be removed and is not created a second time.
 */
const createEntry = async <DataT extends BaseSelectorData>(
	connector: Connector,
	serialize: UseCrudSelectParams<ModelUnknown, DataT>["serialize"],
	deserialize: UseCrudSelectParams<ModelUnknown, DataT>["deserialize"],
	entry: DataT,
): Promise<CreatedEntry<DataT>> => {
	const record = (await connector.create(await serialize(entry)))[0];
	try {
		return { record, entry: await deserialize(record) };
	} catch (e) {
		return {
			record,
			entry: { ...entry, value: (record as Record<"id", string>).id },
			readError: e as Error,
		};
	}
};

const noop = () => undefined;

/**
 * Queues a change of the selection behind the changes queued before it
 * @param queue The queue: settles once the last change queued so far has
 * @param change The change, started once the changes before it have settled
 * @returns What the change returns. One that rejects does not stop the ones after it.
 */
const queueChange = <T>(
	queue: { current: Promise<void> | null },
	change: () => Promise<T>,
): Promise<T> => {
	const run = (queue.current ?? Promise.resolve()).then(change);
	queue.current = run.then(noop, noop);
	return run;
};

const useCrudSelect = <M extends ModelUnknown, DataT extends BaseSelectorData>(
	params: UseCrudSelectParams<M, DataT>,
	ref: ForwardedRef<CrudSelectDispatch<DataT>>,
): UseCrudSelectResult<M, DataT> => {
	const {
		connector,
		serialize,
		deserialize,
		deserializeModel,
		prepareNewEntry,
		onChange,
		validate,
		field,
		getIdOfData,
	} = params;
	const disabled = !!params.disabled || !!params.blockWrites;
	// read when a write would start, so a change queued or a handleSelect kept from an
	// earlier render does not write after the control was disabled
	const disabledRef = useRef(disabled);
	disabledRef.current = disabled;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [selected, setSelected] = useState<DataT[]>([]);
	// Only a queued write is pending: a LazyConnector sends it when the Form saves, any other
	// connector has written it by the time it returns.
	const lazyConnector = connector instanceof LazyConnector ? connector : null;
	// what a change works with once its turn comes: the connector and callbacks of the latest
	// render, not those of the render it was made in
	const latest = useRef({
		connector,
		lazyConnector,
		serialize,
		deserialize,
		prepareNewEntry,
		getIdOfData,
	});
	latest.current = {
		connector,
		lazyConnector,
		serialize,
		deserialize,
		prepareNewEntry,
		getIdOfData,
	};
	const [removed, setRemoved] = useState<DataT[]>([]);
	// The queue is not React state: this counts its changes, so that what is read from it
	// is read again. A removal that left the queue was sent, or cancelled by a restore,
	// which selects the entry again: either way it is no longer listed as removed.
	const [queueVersion, setQueueVersion] = useState(0);
	useEffect(() => {
		if (!lazyConnector) return;
		return lazyConnector.addQueueChangeListener(() => {
			setQueueVersion((version) => version + 1);
			setRemoved((prev) => {
				const next = prev.filter(
					(entry) => lazyConnector.getQueuedOperation(entry.value) === "delete",
				);
				return next.length === prev.length ? prev : next;
			});
		});
	}, [lazyConnector]);
	const added = useMemo(
		() =>
			lazyConnector
				? selected
						.filter(
							(entry) =>
								lazyConnector.getQueuedOperation(entry.value) === "create",
						)
						.map((entry) => entry.value)
				: [],
		// queueVersion: the queue changed
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[lazyConnector, selected, queueVersion],
	);
	const pendingChanges = !!lazyConnector && !lazyConnector.isQueueEmpty();
	// the selection as the changes applied so far left it, ahead of the render that shows it:
	// always set this and then use setSelected(currentSelected.current)
	const currentSelected = useRef<DataT[]>([]);
	// A write the LazyConnector's queue sends later (a Form's save) and the backend refuses
	// is named like a write through any other connector: by the label of the entry it was
	// for, in a PartialApplyError. The entry is found by its value, the record's id; if one
	// is not listed, the connector's own error stays.
	useEffect(() => {
		if (!lazyConnector) return;
		return lazyConnector.setQueueErrorFactory((failures) => {
			const entries = failures.map((failure) =>
				currentSelected.current.find((entry) => entry.value === failure.id),
			);
			if (!entries.every((entry) => entry !== undefined)) return undefined;
			return toPartialApplyError(
				failures.map((failure, index) => ({
					entry: entries[index],
					action: failure.operation,
					error: failure.error,
				})),
			);
		});
	}, [lazyConnector]);
	const [initialRawData, setInitialRawData] = useState<
		Record<string, unknown>[]
	>([]);
	// the entries listed for created rows whose deserialize failed, by row: the field
	// shows these instead of deserializing the row again
	const readFallbacks = useRef(new WeakMap<Record<string, unknown>, DataT>());

	// The changes of the selection (handleSelect, addToSelection) are applied one after
	// another, in the order they were made, once the selection has loaded: each waits until
	// the writes of the ones before it have settled, and changes the selection they left.
	const openChanges = useRef<() => void>(noop);
	const changeQueue = useRef<Promise<void> | null>(null);
	changeQueue.current ??= new Promise<void>((resolve) => {
		openChanges.current = resolve;
	});
	const loadFailed = useRef(false);
	// a change whose turn comes once the control has unmounted writes nothing
	const mounted = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	// What the changes made and not applied yet are going to write: a later change leaves it
	// out, as it is the same gesture reported again (a second click on a remove button, a
	// pick reported before the field lists the first one). Removals by the entry's value,
	// picks by getIdOfData.
	const removing = useRef(new Set<string>());
	const picking = useRef(new Set<string>());

	useImperativeHandle<CrudSelectDispatch<DataT>, CrudSelectDispatch<DataT>>(
		ref,
		() => ({
			addToSelection: (entry) =>
				queueChange(changeQueue, async () => {
					if (!mounted.current) throw new Error("CrudSelect was unmounted");
					if (loadFailed.current) throw new Error("CrudSelect loading failed");
					if (disabledRef.current) throw new Error("CrudSelect is disabled");
					const { connector, serialize, deserialize, getIdOfData } =
						latest.current;
					const id = getIdOfData(entry);
					if (
						currentSelected.current.some(
							(selEntry) => getIdOfData(selEntry) === id,
						)
					)
						return;

					const created = await createEntry(
						connector,
						serialize,
						deserialize,
						entry,
					);
					if (created.readError)
						readFallbacks.current.set(created.record, created.entry);
					// store record in cache
					setInitialRawData((oldRawData) => [...oldRawData, created.record]);

					currentSelected.current = [...currentSelected.current, created.entry];
					setSelected(currentSelected.current);
					if (created.readError)
						throw toPartialApplyError([
							{
								entry: created.entry,
								action: "read",
								error: created.readError,
							},
						]);
				}),
		}),
		[],
	);

	const handleSelect = useCallback(
		async (ids: string[], reported: DataT[]) => {
			if (disabledRef.current) return;
			const { getIdOfData } = latest.current;
			// The change is the difference between the selection the field lists, the one of
			// this render, and the one it reports. Only that difference is applied, to the
			// selection as the changes before it leave it: one reported from a render that
			// predates them does not undo them.
			const listed = selected;
			const listedEntry = (entry: DataT) =>
				listed.find((selEntry) => selEntry.value === entry.value);
			// an id reported without its entry (still loading in the field) keeps its entry
			const kept = listed.filter(
				(entry) =>
					ids.includes(entry.value) &&
					!reported.some((other) => other.value === entry.value),
			);
			const newSelected = [...reported, ...kept];
			// find new entries: one whose removal is still queued is restored, not created
			const isQueuedRemoval = (entry: DataT) =>
				latest.current.lazyConnector?.getQueuedOperation(entry.value) ===
				"delete";
			const addedEntries = newSelected.filter((entry) => !listedEntry(entry));
			const restoredEntries = addedEntries.filter(isQueuedRemoval);
			// a pick of a record that a change before is creating is that pick reported again
			const newEntries = addedEntries.filter(
				(entry) =>
					!isQueuedRemoval(entry) && !picking.current.has(getIdOfData(entry)),
			);
			// the same for a removal of an entry that a change before is deleting
			const deletedEntries = listed.filter(
				(entry) =>
					!newSelected.some((selEntry) => selEntry.value === entry.value) &&
					!removing.current.has(entry.value),
			);
			const keptEntries = newSelected.filter(listedEntry);
			const pickedIds = newEntries.map(getIdOfData);
			pickedIds.forEach((id) => picking.current.add(id));
			deletedEntries.forEach((entry) => removing.current.add(entry.value));

			const applyChange = async () => {
				const {
					connector,
					lazyConnector,
					serialize,
					deserialize,
					prepareNewEntry,
					getIdOfData,
				} = latest.current;
				const current = currentSelected.current;
				const currentEntry = (entry: DataT) =>
					current.find((selEntry) => selEntry.value === entry.value);
				// What the changes before did meanwhile: an entry they deleted is gone, and a
				// record they linked is a pick reported from a render before they settled.
				const toDelete = deletedEntries.filter(currentEntry);
				const linkedMeanwhile = new Set(
					current
						.filter((entry) => !listedEntry(entry))
						.map((entry) => getIdOfData(entry)),
				);
				const toCreate = newEntries.filter(
					(entry) => !linkedMeanwhile.has(getIdOfData(entry)),
				);
				const toRestore = restoredEntries.filter(
					(entry) => !currentEntry(entry),
				);

				// An entry is updated only when what it would send differs from what the listed
				// entry sends. The field hands back copies of the listed entries (BackendMultiSelect
				// deserializes the rows itself), so neither a deserialize that builds a new object,
				// array or Date per call nor a field serialize leaves out (label, titleTooltip,
				// freeSolo, onClick, …) may turn an untouched entry into a write. A serialize that
				// fails counts as a change, so the update reports it. What a change before wrote
				// meanwhile is not written again.
				const differs = async (oldEntry: DataT, entry: DataT) => {
					if (oldEntry === entry) return false;
					try {
						const [oldData, newData] = await Promise.all([
							serialize(oldEntry),
							serialize(entry),
						]);
						return toComparisonJson(oldData) !== toComparisonJson(newData);
					} catch {
						return true;
					}
				};
				const updateCandidates = keptEntries.filter(currentEntry);
				const changed = await Promise.all(
					updateCandidates.map(async (entry) => {
						const before = listedEntry(entry);
						const now = currentEntry(entry);
						if (!before || !now) return false;
						return (
							(await differs(before, entry)) &&
							(now === before || (await differs(now, entry)))
						);
					}),
				);
				const changedEntries = updateCandidates.filter(
					(_entry, index) => changed[index],
				);

				// Every write settles on its own, rather than the first failure taking the
				// rest with it: the backend keeps what went through either way, so the
				// selection has to as well. Otherwise a record which was created is not
				// shown, and picking it again creates it a second time.
				const failures: PartialApplyFailure<DataT>[] = [];
				const settle = async <T>(
					action: PartialApplyFailure<DataT>["action"],
					entries: DataT[],
					write: (entry: DataT) => Promise<T>,
				): Promise<PromiseSettledResult<T>[]> => {
					const results = await Promise.allSettled(entries.map(write));
					results.forEach((result, index) => {
						if (result.status === "rejected")
							failures.push({
								entry: entries[index],
								action,
								error: result.reason as Error,
							});
					});
					return results;
				};

				// call backend (updates/removals are independent of prepareNewEntry, fire eagerly)
				const updatePromise = settle("update", changedEntries, async (entry) =>
					connector.update(await serialize(entry)),
				);
				const deletePromise = settle("delete", toDelete, async (entry) =>
					connector.delete(
						((await serialize(entry)) as Record<"id", string>).id,
					),
				);

				// prepare new entries (collect extra join-record data / allow cancel).
				// run sequentially so simultaneous adds don't stack dialogs.
				const entriesToCreate: DataT[] = [];
				for (const entry of toCreate) {
					if (!prepareNewEntry) {
						entriesToCreate.push(entry);
						continue;
					}
					try {
						const prepared = await prepareNewEntry(entry);
						// null/undefined => cancel this addition cleanly (no create, no error)
						if (prepared == null) continue;
						entriesToCreate.push(prepared);
					} catch (e) {
						failures.push({ entry, action: "create", error: e as Error });
					}
				}

				// wait for response
				const created = (
					await settle("create", entriesToCreate, (entry) =>
						createEntry(connector, serialize, deserialize, entry),
					)
				)
					.filter((result) => result.status === "fulfilled")
					.map((result) => result.value);
				created.forEach(({ record, entry, readError }) => {
					if (!readError) return;
					readFallbacks.current.set(record, entry);
					failures.push({ entry, action: "read", error: readError });
				});
				const updated = await updatePromise;
				const deleted = await deletePromise;
				// a removal the LazyConnector queued is listed until it is sent or restored
				const queuedRemovals = toDelete.filter(
					(entry, index) =>
						deleted[index].status === "fulfilled" && isQueuedRemoval(entry),
				);
				// Cancelled here, next to the state updates below, so that the entry leaves
				// `removed` (the queue listener) in the render it is selected again. A delete the
				// Form sent meanwhile cannot be cancelled: that entry stays removed.
				const restored = toRestore.filter(
					(entry) => lazyConnector?.cancelQueuedOperation(entry.value) ?? false,
				);

				// Apply the difference: a deleted entry leaves the selection, an updated one is
				// replaced in its place, and the restored and created ones are added at the end.
				// A refused removal or update leaves the entry as and where it is. A kept entry
				// that was not written takes what the field reported for it, unless a change
				// before replaced it meanwhile.
				const deletedValues = new Set(
					toDelete
						.filter((_entry, index) => deleted[index].status === "fulfilled")
						.map((entry) => entry.value),
				);
				const replacementOf = (entry: DataT): DataT => {
					const reportedEntry = keptEntries.find(
						(other) => other.value === entry.value,
					);
					if (!reportedEntry) return entry;
					const index = changedEntries.indexOf(reportedEntry);
					if (index !== -1)
						return updated[index].status === "fulfilled"
							? reportedEntry
							: entry;
					return entry === listedEntry(entry) ? reportedEntry : entry;
				};
				const merged = currentSelected.current
					.filter((entry) => !deletedValues.has(entry.value))
					.map(replacementOf);
				const finalSelected = [
					...merged,
					...restored,
					...created.map(({ entry }) => entry),
				];

				// reflect changes
				if (created.length > 0)
					setInitialRawData((oldRawData) => [
						...oldRawData,
						...created.map(({ record }) => record),
					]);
				if (
					finalSelected.length !== currentSelected.current.length ||
					finalSelected.some(
						(entry, index) => entry !== currentSelected.current[index],
					)
				) {
					currentSelected.current = finalSelected;
					setSelected(currentSelected.current);
				}
				if (queuedRemovals.length > 0)
					setRemoved((prev) => [...prev, ...queuedRemovals]);
				// the outcome of a change that wrote or tried to: one that went through clears
				// the error of a change before, one with nothing to write leaves it
				const wrote =
					toDelete.length +
						changedEntries.length +
						entriesToCreate.length +
						toRestore.length >
					0;
				if (wrote || failures.length > 0)
					setError(failures.length > 0 ? toPartialApplyError(failures) : null);
			};

			await queueChange(changeQueue, async () => {
				try {
					// a change whose turn comes while the control is disabled, or once it has
					// unmounted, writes nothing
					if (!mounted.current || disabledRef.current) return;
					await applyChange();
				} finally {
					pickedIds.forEach((id) => picking.current.delete(id));
					deletedEntries.forEach((entry) =>
						removing.current.delete(entry.value),
					);
				}
			});
		},
		[selected],
	);

	const modelToSelectorData = useCallback(
		async (data: ModelRecord<M>): Promise<DataT> => {
			if (initialRawData.includes(data))
				return readFallbacks.current.get(data) ?? deserialize(data);
			const deserialized = (await deserializeModel(data)) as DataT;
			// Use a stable value derived from the record id (not Math.random()),
			// so rebuilds of not-yet-persisted entries keep the same value.
			// Otherwise handleSelect (which classifies new/changed/deleted by
			// value) would reclassify all surviving entries as new on any
			// selection change, re-running prepareNewEntry for each.
			return {
				...deserialized,
				value: "to-create-" + getIdOfData(deserialized),
			};
		},
		[deserialize, deserializeModel, getIdOfData, initialRawData],
	);

	// initial load: the selection is the connector's rows, and loading it writes nothing
	useEffect(() => {
		void (async () => {
			setLoading(true);

			try {
				const currentlySelected = await connector.index({
					page: 1,
					rows: Number.MAX_SAFE_INTEGER,
				});

				const initialSelected = await Promise.all(
					currentlySelected[0].map((record) =>
						Promise.resolve(deserialize(record)),
					),
				);
				// A removal queued before the control was last unmounted (a language
				// switch, a route change) is still pending: index hides it, and hands it back
				// here. A queued pick is in the index result already.
				const removedRecords = lazyConnector?.getQueuedDeleteRecords() ?? [];
				const removedEntries = await Promise.all(
					removedRecords.map((record) => Promise.resolve(deserialize(record))),
				);

				// the removed records too: a restored entry is listed from its record
				setInitialRawData([...currentlySelected[0], ...removedRecords]);
				currentSelected.current = initialSelected;
				setSelected(currentSelected.current);
				setRemoved(removedEntries);
			} catch (e) {
				// the field says that the load failed; the error's message is technical
				// eslint-disable-next-line no-console
				console.warn(
					"[Components-Care] [CrudSelect] Could not load the selected entries:",
					e,
				);
				loadFailed.current = true;
				setLoadError(e as Error);
			} finally {
				setLoading(false);
				openChanges.current();
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// on change event
	useEffect(() => {
		if (onChange) onChange(selected);
	}, [onChange, selected]);

	// validations
	const formCtx = useContext(FormContext);
	useEffect(() => {
		if (!formCtx || !validate || !field) {
			if (validate && process.env.NODE_ENV === "development") {
				const reasons = [];
				if (!formCtx)
					reasons.push(
						"Form context not present, validate only works inside of Components-Care Form Engine",
					);
				if (!field)
					reasons.push(
						"Field prop not passed. This is required to register the validation handler with the Form Engine. This value has to be unique to the form",
					);
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] [useCrudSelect] Crud Select has been given validate function, but can't be activated due to the following reasons",
					reasons,
				);
			}
			return;
		}

		const {
			setCustomValidationHandler,
			removeCustomValidationHandler,
			onlyValidateMounted,
		} = formCtx;

		setCustomValidationHandler(field, () => validate(selected));

		return () => {
			if (onlyValidateMounted) removeCustomValidationHandler(field);
		};
	});

	return {
		loading,
		error,
		loadError,
		selected,
		added,
		removed,
		pendingChanges,
		initialRawData,
		handleSelect,
		modelToSelectorData,
		disabled,
	};
};

export default useCrudSelect;
