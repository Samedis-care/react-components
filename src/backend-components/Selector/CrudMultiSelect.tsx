import React, { ForwardedRef, RefAttributes } from "react";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { Loader, MultiSelectorData } from "../../standalone";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { BackendMultiSelect } from "./index";
import useCrudSelect, {
	CrudSelectDispatch,
	UseCrudSelectParams,
} from "./useCrudSelect";

export interface CrudMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
> extends Omit<
			BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>,
			| "modelToSelectorData"
			| "initialData"
			| "selected"
			| "onSelect"
			| "getIdOfData"
		>,
		UseCrudSelectParams<KeyT, VisibilityT, CustomT, DataT> {
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
	/**
	 * Get ID of data
	 */
	getIdOfData: NonNullable<
		BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>["getIdOfData"]
	>;
}

const CrudMultiSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
>(
	props: CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT> &
		RefAttributes<CrudSelectDispatch<DataT>>,
	ref: ForwardedRef<CrudSelectDispatch<DataT>>
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
			<BackendMultiSelect
				{...props}
				selected={selected.map((entry) => entry.value)}
				onSelect={handleSelect}
				modelToSelectorData={modelToSelectorData}
				initialData={initialRawData}
			/>
		</>
	);
};

export default React.memo(
	React.forwardRef(CrudMultiSelect)
) as typeof CrudMultiSelect;
