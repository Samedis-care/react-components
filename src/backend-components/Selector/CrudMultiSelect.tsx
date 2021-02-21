import React, { useCallback, useEffect, useState } from "react";
import {
	Connector,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { Loader, MultiSelectorData } from "../../standalone";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { BackendMultiSelect } from "./index";
import { shallowCompare } from "../../utils";

export interface CrudMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
> extends Omit<
		BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>,
		"modelToSelectorData" | "initialData" | "selected" | "onSelect"
	> {
	/**
	 * The backend connector used as CRUD interface
	 */
	connector: Connector<string, PageVisibility, unknown>;
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
	/**
	 * Callback for serializing data before passing it to the backend connector
	 * @param data The selector data to serialize
	 * @returns Data to be passed to the backend connector, id may be null or data.value
	 */
	serialize: (
		data: DataT
	) => Promise<Record<string, unknown>> | Record<string, unknown>;
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
		data: Record<KeyT, unknown>
	) => Promise<Omit<DataT, "value">> | Omit<DataT, "value">;
}

const CrudMultiSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
>(
	props: CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>
) => {
	const {
		connector,
		errorComponent: ErrorComponent,
		serialize,
		deserialize,
		deserializeModel,
	} = props;
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
						connector.delete((await serializedEntry).id as string)
					)
			);

			try {
				// wait for response
				const created = (await createPromise).map((e) => e[0]);
				await updatePromise;
				await deletePromise;

				// reflect changes
				setInitialRawData((oldRawData) => [...oldRawData, ...created]);
				setSelected(
					newSelected.concat(
						await Promise.all(created.map((entry) => deserialize(entry)))
					)
				);
			} catch (e) {
				setError(e);
			}
		},
		[connector, deserialize, selected, serialize]
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

	if (loading) return <Loader />;
	if (loadError) return <span>{loadError}</span>;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<BackendMultiSelect
				{...props}
				selected={selected.map((entry) => entry.value)}
				onSelect={handleSelect}
				modelToSelectorData={async (
					data: Record<KeyT, unknown>
				): Promise<DataT> =>
					initialRawData.includes(data)
						? deserialize(data)
						: ({
								...(await deserializeModel(data)),
								value: "to-create-" + Math.random().toString(),
						  } as DataT)
				}
				initialData={initialRawData}
			/>
		</>
	);
};

export default React.memo(CrudMultiSelect) as typeof CrudMultiSelect;