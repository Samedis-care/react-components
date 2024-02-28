import React, { ForwardedRef, RefAttributes, useContext } from "react";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { Loader, MultiSelectorData } from "../../standalone";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { BackendMultiSelect } from "./index";
import useCrudSelect, {
	CrudSelectDispatch,
	UseCrudSelectParams,
	UseCrudSelectResult,
} from "./useCrudSelect";
import { DialogContextProvider } from "../../framework";

export interface CrudMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData,
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
}

export const CrudSelectContext = React.createContext<
	UseCrudSelectResult<ModelFieldName, MultiSelectorData> | undefined
>(undefined);
export const useCrudSelectContext = (): UseCrudSelectResult<
	ModelFieldName,
	MultiSelectorData
> => {
	const ctx = useContext(CrudSelectContext);
	if (!ctx) throw new Error("CrudSelectContext not set");
	return ctx;
};

const CrudMultiSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData,
>(
	props: CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT> &
		RefAttributes<CrudSelectDispatch<DataT>>,
	ref: ForwardedRef<CrudSelectDispatch<DataT>>,
) => {
	const { errorComponent: ErrorComponent } = props;

	const crudSelect = useCrudSelect(props, ref);
	const {
		loading,
		error,
		loadError,
		selected,
		initialRawData,
		handleSelect,
		modelToSelectorData,
	} = crudSelect;

	if (loading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	return (
		<CrudSelectContext.Provider
			value={
				crudSelect as unknown as UseCrudSelectResult<
					ModelFieldName,
					MultiSelectorData
				>
			}
		>
			<DialogContextProvider
			// for creating dialogs inside end adornment of selector with access to selector data
			>
				{error && <ErrorComponent error={error} />}
				<BackendMultiSelect
					{...props}
					selected={selected.map((entry) => entry.value)}
					onSelect={handleSelect}
					modelToSelectorData={modelToSelectorData}
					initialData={initialRawData}
				/>
			</DialogContextProvider>
		</CrudSelectContext.Provider>
	);
};

export default React.memo(
	React.forwardRef(CrudMultiSelect),
) as typeof CrudMultiSelect;
