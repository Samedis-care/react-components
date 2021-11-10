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
	useState,
} from "react";
import { shallowCompare } from "../../utils";
import { FormContext, ValidationError } from "../Form";

export interface UseCrudSelectParams<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends BaseSelectorData
> {
	/**
	 * The backend connector used as CRUD interface
	 */
	connector: Connector<KeyT, VisibilityT, CustomT>;
	/**
	 * Callback for serializing data before passing it to the backend connector
	 * @param data The selector data to serialize
	 * @returns Data to be passed to the backend connector, id may be null or data.value
	 */
	serialize: (
		data: DataT
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
	 */
	deserializeModel: (
		data: Record<string, unknown>
	) => Promise<Omit<DataT, "value">> | Omit<DataT, "value">;
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
	validate?: (data: DataT[]) => ValidationError;
	/**
	 * The field to apply the validations for
	 * @remarks for Form Engine
	 * @see validate
	 */
	field?: string;
}

export interface UseCrudSelectResult<
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	KeyT extends ModelFieldName,
	DataT extends BaseSelectorData
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

const useCrudSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends BaseSelectorData
>(
	params: UseCrudSelectParams<KeyT, VisibilityT, CustomT, DataT>,
	ref: ForwardedRef<CrudSelectDispatch<DataT>>
): UseCrudSelectResult<KeyT, DataT> => {
	const {
		connector,
		serialize,
		deserialize,
		deserializeModel,
		onChange,
		initialSelected,
		validate,
		field,
	} = params;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [selected, setSelected] = useState<DataT[]>([]);
	const [initialRawData, setInitialRawData] = useState<
		Record<string, unknown>[]
	>([]);

	useImperativeHandle<CrudSelectDispatch<DataT>, CrudSelectDispatch<DataT>>(
		ref,
		() => ({
			addToSelection: async (entry) => {
				const existing = selected.find(
					(selEntry) => selEntry.value === entry.value
				);
				if (existing) return;

				const modelRecord = (await connector.create(await serialize(entry)))[0];
				entry = {
					...(await deserializeModel(modelRecord)),
					value: entry.value,
				} as DataT;

				const finalSelected = [...selected, entry];

				// reflect changes
				setInitialRawData((oldRawData) => [...oldRawData, modelRecord]);
				setSelected(finalSelected);

				// fire events
				if (onChange) onChange(finalSelected);
			},
		})
	);

	const handleSelect = useCallback(
		async (_, newSelected: DataT[]) => {
			// find new entries
			const newEntries = newSelected.filter(
				(entry) => !selected.find((selEntry) => selEntry.value === entry.value)
			);
			// remove new entries from array
			newSelected = newSelected.filter((entry) =>
				selected.find((selEntry) => selEntry.value === entry.value)
			);

			const changedEntries = newSelected.filter((entry) => {
				const oldEntry = selected.find(
					(selEntry) => selEntry.value === entry.value
				);
				if (!oldEntry) return false;
				return !shallowCompare(
					entry as Record<string, unknown>,
					oldEntry as Record<string, unknown>
				);
			});
			const deletedEntries = selected.filter(
				(entry) =>
					!newSelected.find((selEntry) => selEntry.value === entry.value)
			);

			// call backend
			const createPromise = Promise.all(
				newEntries
					.map((entry) => serialize(entry))
					.map(async (serializedEntry) =>
						connector.create(await serializedEntry)
					)
			);
			const updatePromise = Promise.all(
				changedEntries
					.map((entry) => serialize(entry))
					.map(async (serializedEntry) =>
						connector.update(await serializedEntry)
					)
			);
			const deletePromise = Promise.all(
				deletedEntries
					.map((entry) => serialize(entry))
					.map(async (serializedEntry) =>
						connector.delete(
							((await serializedEntry) as Record<"id", string>).id
						)
					)
			);

			try {
				// wait for response
				const created = (await createPromise).map((e) => e[0]);
				await updatePromise;
				await deletePromise;

				// create final values
				const finalSelected = [
					...newSelected,
					...(await Promise.all(created.map((entry) => deserialize(entry)))),
				];

				// reflect changes
				setInitialRawData((oldRawData) => [...oldRawData, ...created]);
				setSelected(finalSelected);

				// fire events
				if (onChange) onChange(finalSelected);
			} catch (e) {
				setError(e as Error);
			}
		},
		[connector, deserialize, onChange, selected, serialize]
	);

	const modelToSelectorData = useCallback(
		async (data: Record<string, unknown>): Promise<DataT> =>
			initialRawData.includes(data)
				? deserialize(data)
				: ({
						...(await deserializeModel(data)),
						value: "to-create-" + Math.random().toString(),
				  } as DataT),
		[deserialize, deserializeModel, initialRawData]
	);

	// initial load
	useEffect(() => {
		void (async () => {
			setLoading(true);

			if (initialSelected) {
				await handleSelect(undefined, initialSelected);
				setLoading(false);
				return;
			}

			try {
				const currentlySelected = await connector.index({
					page: 1,
					rows: Number.MAX_SAFE_INTEGER,
				});

				const initialSelected = await Promise.all(
					currentlySelected[0].map((record) => deserialize(record))
				);

				setInitialRawData(currentlySelected[0]);
				setSelected(initialSelected);

				if (onChange) onChange(initialSelected);
			} catch (e) {
				setLoadError(e as Error);
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// validations
	const formCtx = useContext(FormContext);
	useEffect(() => {
		if (!formCtx || !validate || !field) {
			if (validate && process.env.NODE_ENV === "development") {
				const reasons = [];
				if (!formCtx)
					reasons.push(
						"Form context not present, validate only works inside of Components-Care Form Engine"
					);
				if (!field)
					reasons.push(
						"Field prop not passed. This is required to register the validation handler with the Form Engine. This value has to be unique to the form"
					);
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] [useCrudSelect] Crud Select has been given validate function, but can't be activated due to the following reasons",
					reasons
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
