import React, { ForwardedRef, RefAttributes } from "react";
import { ModelRecord, ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { BaseSelectorData, Loader, MultiSelectorData } from "../../standalone";
import BackendMultiSelectWithTags, {
	BackendMultiSelectWithTagsProps,
} from "./BackendMultiSelectWithTags";
import useCrudSelect, {
	CrudSelectDispatch,
	UseCrudSelectParams,
} from "./useCrudSelect";

export interface CrudMultiSelectWithGroupsProps<
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
>
	extends
		Omit<
			BackendMultiSelectWithTagsProps<
				GroupModelT,
				DataModelT,
				GroupDataT,
				DataDataT
			>,
			"selected" | "onChange" | "convData" | "initialData" | "getIdOfData"
		>,
		UseCrudSelectParams<DataModelT, DataDataT> {
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
	/**
	 * Get ID of data
	 */
	getIdOfData: NonNullable<
		BackendMultiSelectWithTagsProps<
			GroupModelT,
			DataModelT,
			GroupDataT,
			DataDataT
		>["getIdOfData"]
	>;
}

const CrudMultiSelectWithGroups = <
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
>(
	props: CrudMultiSelectWithGroupsProps<
		GroupModelT,
		DataModelT,
		GroupDataT,
		DataDataT
	> &
		RefAttributes<CrudSelectDispatch<DataDataT>>,
	ref: ForwardedRef<CrudSelectDispatch<DataDataT>>,
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
	} = useCrudSelect(props, ref);

	if (loading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<BackendMultiSelectWithTags<
				GroupModelT,
				DataModelT,
				GroupDataT,
				DataDataT
			>
				{...props}
				selected={selected.map((entry) => entry.value)}
				onChange={handleSelect}
				convData={modelToSelectorData}
				// the connector's records seed the selected cache: modelToSelectorData tells them apart
				initialData={initialRawData as ModelRecord<DataModelT>[]}
			/>
		</>
	);
};

const ForwardedCrudMultiSelectWithGroups = React.forwardRef(
	CrudMultiSelectWithGroups,
) as <
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
>(
	props: CrudMultiSelectWithGroupsProps<
		GroupModelT,
		DataModelT,
		GroupDataT,
		DataDataT
	> &
		RefAttributes<CrudSelectDispatch<DataDataT>>,
) => React.ReactElement;

export default React.memo(
	ForwardedCrudMultiSelectWithGroups,
) as typeof ForwardedCrudMultiSelectWithGroups;
