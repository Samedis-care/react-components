import {
	Connector,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import { BaseSelectorData } from "../../standalone";
import {
	ForwardedRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import shallowCompare from "../../utils/shallowCompare";
import { FormContext, ValidationResult } from "../Form";
import { BackendMultiSelectProps } from "./BackendMultiSelect";

export interface UseCrudSelectParams<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends BaseSelectorData,
> {
	/**
	 * The backend connector used as CRUD interface
	 */
	connector: Connector<KeyT, VisibilityT, CustomT>;
	/**
	 * Callback for serializing data before passing it to the backend connector
	 * @param data The selector data to serialize
	 * @returns Data to be passed to the backend connector, id may be null or data.value
	 * @remarks Must stay pure: it runs for additions, updates and removals at
	 *   backend (POST/PUT/DELETE) time. Do NOT trigger UI side effects (dialogs,
	 *   prompts) here — use {@link prepareNewEntry} to collect extra data on add.
	 */
	serialize: (
		data: DataT,
	) =>
		| Promise<Partial<Record<string, unknown>>>
		| Partial<Record<string, unknown>>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data The data from the backend connector (index function)
	 * @returns The selector data which can be used by the control
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
		data: Record<string, unknown>,
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
	 * The initial selection (override). If set backend isn't consulted for data
	 */
	initialSelected?: DataT[];
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
	getIdOfData: NonNullable<
		BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>["getIdOfData"]
	>;
}

export interface UseCrudSelectResult<
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	KeyT extends ModelFieldName,
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
	 * Currently selected entries (raw data)
	 */
	initialRawData: Record<string, unknown>[];
	/**
	 * Selection handler
	 * @param ids The new selected entry ids
	 * @param newSelected The new selected entries
	 */
	handleSelect: (ids: string[], newSelected: DataT[]) => Promise<void>;
	/**
	 * Conversion function for model data to selection data (handles special case when data comes from CRUD controller)
	 * @param data The model data
	 */
	modelToSelectorData: (data: Record<string, unknown>) => Promise<DataT>;
}

export interface CrudSelectDispatch<DataT extends BaseSelectorData> {
	/**
	 * Adds the entry to the list of selected records
	 * @param entry The entry to insert
	 * @remarks Does not update existing record
	 */
	addToSelection: (entry: DataT) => Promise<void>;
}

let ticketCounter = 0;
const nextTicket = () => {
	ticketCounter = (ticketCounter + 1) % Number.MAX_SAFE_INTEGER;
	return ticketCounter;
};

const useCrudSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends BaseSelectorData,
>(
	params: UseCrudSelectParams<KeyT, VisibilityT, CustomT, DataT>,
	ref: ForwardedRef<CrudSelectDispatch<DataT>>,
): UseCrudSelectResult<KeyT, DataT> => {
	const {
		connector,
		serialize,
		deserialize,
		deserializeModel,
		prepareNewEntry,
		onChange,
		initialSelected,
		validate,
		field,
		getIdOfData,
	} = params;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [selected, setSelected] = useState<DataT[]>([]);
	const currentSelected = useRef<DataT[]>([]); // current state of selected, always set this and then use setSelected(currentSelected.current)
	const [initialRawData, setInitialRawData] = useState<
		Record<string, unknown>[]
	>([]);
	// async processing of add to selection
	const addToSelectionResults = useRef<
		Record<string, [resolve: () => void, reject: (err: Error) => void]>
	>({});
	const addToSelectionInputs = useRef<Record<string, DataT>>({});
	const [addToSelectionQueue, setAddToSelectionQueue] = useState<string[]>([]);

	useImperativeHandle<CrudSelectDispatch<DataT>, CrudSelectDispatch<DataT>>(
		ref,
		() => ({
			addToSelection: async (entry) => {
				// create ticket and add for async processing
				const ticket = nextTicket().toString(16) + ":" + Date.now().toString();
				const result = new Promise<void>((resolve, reject) => {
					addToSelectionResults.current[ticket] = [resolve, reject];
				});
				addToSelectionInputs.current[ticket] = entry;
				setAddToSelectionQueue((prev) => [...prev, ticket]);
				return result;
			},
		}),
	);

	// async processing of add to selection
	const fetchingAddSelection = useRef(false);
	useEffect(() => {
		if (loading) return;
		if (addToSelectionQueue.length === 0) return;
		if (fetchingAddSelection.current) return; // don't run this code twice
		fetchingAddSelection.current = true;
		const ticket = addToSelectionQueue[0];
		let entry = addToSelectionInputs.current[ticket];
		// if entry is undefined here we already started working on this, thus just wait and keep retrying
		if (entry === undefined) {
			// this happens when fetchingAddSelection is set to false before selection queue is updated (removed first entry) in finally handler of async code
			// this usually happens when addToSelection keeps getting called
			fetchingAddSelection.current = false; // allow retry
			return;
		}
		delete addToSelectionInputs.current[ticket];
		const [resolve, reject] = addToSelectionResults.current[ticket];
		delete addToSelectionResults.current[ticket];
		(async () => {
			if (loadError) throw new Error("CrudSelect loading failed");
			const existing = currentSelected.current.find(
				(selEntry) => getIdOfData(selEntry) === getIdOfData(entry),
			);
			if (existing) return;

			const modelRecord = (await connector.create(await serialize(entry)))[0];
			entry = {
				...(await deserialize(modelRecord)),
			};
			// store record in cache
			setInitialRawData((oldRawData) => [...oldRawData, modelRecord]);

			currentSelected.current = [...currentSelected.current, entry];
			setSelected(currentSelected.current);
		})()
			.then(resolve)
			.catch(reject)
			.finally(() => {
				fetchingAddSelection.current = false;
				// state update re-triggers useEffect
				setAddToSelectionQueue((prev) =>
					prev.filter((queueTicket) => queueTicket !== ticket),
				);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, addToSelectionQueue]);

	const handleSelect = useCallback(
		async (_ids: string[], newSelected: DataT[]) => {
			// find new entries
			const newEntries = newSelected.filter(
				(entry) => !selected.find((selEntry) => selEntry.value === entry.value),
			);
			// remove new entries from array
			newSelected = newSelected.filter((entry) =>
				selected.find((selEntry) => selEntry.value === entry.value),
			);

			const changedEntries = newSelected.filter((entry) => {
				const oldEntry = selected.find(
					(selEntry) => selEntry.value === entry.value,
				);
				if (!oldEntry) return false;
				// remove all base selector data and multi selector data render options
				// this way we only update when the data actually changed
				const normalize = (record: DataT) =>
					Object.assign({}, record as Record<string, unknown>, {
						label: null,
						icon: null,
						onClick: null,
						canUnselect: null,
						noDelete: null,
						isDisabled: null,
						selected: null,
						hidden: null,
						ignore: null,
						group: null,
						isAddNewButton: null,
						isDivider: null,
						isSmallLabel: null,
						className: null,
					});
				return !shallowCompare(normalize(entry), normalize(oldEntry));
			});
			const deletedEntries = selected.filter(
				(entry) =>
					!newSelected.find((selEntry) => selEntry.value === entry.value),
			);

			// call backend (updates/removals are independent of prepareNewEntry, fire eagerly)
			const updatePromise = Promise.all(
				changedEntries
					.map((entry) => serialize(entry))
					.map(async (serializedEntry) =>
						connector.update(await serializedEntry),
					),
			);
			const deletePromise = Promise.all(
				deletedEntries
					.map((entry) => serialize(entry))
					.map(async (serializedEntry) =>
						connector.delete(
							((await serializedEntry) as Record<"id", string>).id,
						),
					),
			);

			try {
				// prepare new entries (collect extra join-record data / allow cancel).
				// run sequentially so simultaneous adds don't stack dialogs.
				let entriesToCreate = newEntries;
				if (prepareNewEntry) {
					entriesToCreate = [];
					for (const entry of newEntries) {
						const prepared = await prepareNewEntry(entry);
						// null/undefined => cancel this addition cleanly (no create, no error)
						if (prepared == null) continue;
						entriesToCreate.push(prepared);
					}
				}

				// wait for response
				const created = (
					await Promise.all(
						entriesToCreate
							.map((entry) => serialize(entry))
							.map(async (serializedEntry) =>
								connector.create(await serializedEntry),
							),
					)
				).map((e) => e[0]);
				await updatePromise;
				await deletePromise;

				// create final values
				const finalSelected = [
					...newSelected,
					...(await Promise.all(
						created.map((entry) => Promise.resolve(deserialize(entry))),
					)),
				];

				// reflect changes
				setInitialRawData((oldRawData) => [...oldRawData, ...created]);
				currentSelected.current = finalSelected;
				setSelected(currentSelected.current);
			} catch (e) {
				setError(e as Error);
			}
		},
		[connector, deserialize, prepareNewEntry, selected, serialize],
	);

	const modelToSelectorData = useCallback(
		async (data: Record<string, unknown>): Promise<DataT> => {
			if (initialRawData.includes(data)) return deserialize(data);
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

	// initial load
	useEffect(() => {
		void (async () => {
			setLoading(true);

			if (initialSelected) {
				await handleSelect(
					initialSelected.map((entry) => entry.value),
					initialSelected,
				);
				setLoading(false);
				return;
			}

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

				setInitialRawData(currentlySelected[0]);
				currentSelected.current = initialSelected;
				setSelected(currentSelected.current);
			} catch (e) {
				setLoadError(e as Error);
			} finally {
				setLoading(false);
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
		initialRawData,
		handleSelect,
		modelToSelectorData,
	};
};

export default useCrudSelect;
