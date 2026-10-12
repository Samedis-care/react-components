import React, {
	ForwardedRef,
	forwardRef,
	RefAttributes,
	useContext,
} from "react";
import { ModelRecord, ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { Loader, MultiSelectorData } from "../../standalone";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "./BackendMultiSelect";
import useCrudSelect, {
	CrudSelectDispatch,
	UseCrudSelectParams,
	UseCrudSelectResult,
} from "./useCrudSelect";
import DialogContextProvider from "../../framework/DialogContextProvider";

export interface CrudMultiSelectProps<
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>
	extends
		Omit<
			BackendMultiSelectProps<M, DataT>,
			| "modelToSelectorData"
			| "initialData"
			| "selected"
			| "onSelect"
			| "getIdOfData"
		>,
		UseCrudSelectParams<M, DataT> {
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
}

export const CrudSelectContext = React.createContext<
	UseCrudSelectResult<ModelUnknown, MultiSelectorData> | undefined
>(undefined);
export const useCrudSelectContext = (): UseCrudSelectResult<
	ModelUnknown,
	MultiSelectorData
> => {
	const ctx = useContext(CrudSelectContext);
	if (!ctx) throw new Error("CrudSelectContext not set");
	return ctx;
};

const CrudMultiSelect = <
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>(
	props: CrudMultiSelectProps<M, DataT> &
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
					ModelUnknown,
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
					// the connector's records seed the selected cache: modelToSelectorData tells them apart
					initialData={initialRawData as ModelRecord<M>[]}
				/>
			</DialogContextProvider>
		</CrudSelectContext.Provider>
	);
};

const ForwardedCrudMultiSelect = forwardRef(CrudMultiSelect) as <
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>(
	props: CrudMultiSelectProps<M, DataT> &
		RefAttributes<CrudSelectDispatch<DataT>>,
) => React.ReactElement;

const MemoizedCrudMultiSelect = React.memo(
	ForwardedCrudMultiSelect,
) as typeof ForwardedCrudMultiSelect;

export default MemoizedCrudMultiSelect;
