import React from "react";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { BaseSelectorData, Loader, MultiSelectorData } from "../../standalone";
import { BackendMultiSelectWithTags } from "./index";
import { BackendMultiSelectWithTagsProps } from "./BackendMultiSelectWithTags";
import useCrudSelect, { UseCrudSelectParams } from "./useCrudSelect";

export interface CrudMultiSelectWithGroupsProps<
	GroupKeyT extends ModelFieldName,
	DataKeyT extends ModelFieldName,
	GroupVisibilityT extends PageVisibility,
	DataVisibilityT extends PageVisibility,
	GroupCustomT,
	DataCustomT,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData
> extends Omit<
			BackendMultiSelectWithTagsProps<
				GroupKeyT,
				DataKeyT,
				GroupVisibilityT,
				DataVisibilityT,
				GroupCustomT,
				DataCustomT,
				GroupDataT,
				DataDataT
			>,
			"selected" | "onChange" | "convData" | "initialData" | "getIdOfData"
		>,
		UseCrudSelectParams<DataKeyT, DataVisibilityT, DataCustomT, DataDataT> {
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
	/**
	 * Get ID of data
	 */
	getIdOfData: NonNullable<
		BackendMultiSelectWithTagsProps<
			GroupKeyT,
			DataKeyT,
			GroupVisibilityT,
			DataVisibilityT,
			GroupCustomT,
			DataCustomT,
			GroupDataT,
			DataDataT
		>["getIdOfData"]
	>;
}

const CrudMultiSelectWithGroups = <
	GroupKeyT extends ModelFieldName,
	DataKeyT extends ModelFieldName,
	GroupVisibilityT extends PageVisibility,
	DataVisibilityT extends PageVisibility,
	GroupCustomT,
	DataCustomT,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData
>(
	props: CrudMultiSelectWithGroupsProps<
		GroupKeyT,
		DataKeyT,
		GroupVisibilityT,
		DataVisibilityT,
		GroupCustomT,
		DataCustomT,
		GroupDataT,
		DataDataT
	>
) => {
	const { errorComponent: ErrorComponent } = props;

	const {
		loading,
		error,
		loadError,
		selected,
		initialRawData,
		handleSelect,
		modelToSelectorData,
	} = useCrudSelect(props);

	if (loading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<BackendMultiSelectWithTags<
				GroupKeyT,
				DataKeyT,
				GroupVisibilityT,
				DataVisibilityT,
				GroupCustomT,
				DataCustomT,
				GroupDataT,
				DataDataT
			>
				{...props}
				selected={selected.map((entry) => entry.value)}
				onChange={handleSelect}
				convData={modelToSelectorData}
				initialData={initialRawData}
			/>
		</>
	);
};

export default React.memo(
	CrudMultiSelectWithGroups
) as typeof CrudMultiSelectWithGroups;
