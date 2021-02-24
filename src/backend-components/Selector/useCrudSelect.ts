import {
	Connector,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import { BaseSelectorData } from "../../standalone";
import { useCallback, useEffect, useState } from "react";
import { shallowCompare } from "../../utils";

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
	) => Promise<Partial<Record<KeyT, unknown>>> | Partial<Record<KeyT, unknown>>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data The data from the backend connector (index function)
	 * @returns The selector data which can be used by the control
	 */
	deserialize: (data: Record<KeyT, unknown>) => Promise<DataT> | DataT;
	/**
	 * Callback for deserializing data from the model
	 * @param data The data from the backend connector (index function)
	 * @returns The selector data which can be used by the control
	 */
	deserializeModel: (
		data: Record<KeyT, unknown>
	) => Promise<Omit<DataT, "value">> | Omit<DataT, "value">;
	/**
	 * Selection change event
	 * @param selected The new selection
	 */
	onChange?: (selected: DataT[]) => void;
}

export interface UseCrudSelectResult<
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
	initialRawData: Record<KeyT, unknown>[];
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
	modelToSelectorData: (data: Record<KeyT, unknown>) => Promise<DataT>;
}

const useCrudSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends BaseSelectorData
>(
	params: UseCrudSelectParams<KeyT, VisibilityT, CustomT, DataT>
): UseCrudSelectResult<KeyT, DataT> => {
	const {
		connector,
		serialize,
		deserialize,
		deserializeModel,
		onChange,
	} = params;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [selected, setSelected] = useState<DataT[]>([]);
	const [initialRawData, setInitialRawData] = useState<Record<KeyT, unknown>[]>(
		[]
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
				setError(e);
			}
		},
		[connector, deserialize, onChange, selected, serialize]
	);

	const modelToSelectorData = useCallback(
		async (data: Record<KeyT, unknown>): Promise<DataT> =>
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
			try {
				const currentlySelected = await connector.index({
					page: 1,
					rows: Number.MAX_SAFE_INTEGER,
				});

				setInitialRawData(currentlySelected[0]);
				setSelected(
					await Promise.all(
						currentlySelected[0].map((record) => deserialize(record))
					)
				);
			} catch (e) {
				setLoadError(e);
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
