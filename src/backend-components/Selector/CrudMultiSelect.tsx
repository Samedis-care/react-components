import React, {
	ForwardedRef,
	forwardRef,
	RefAttributes,
	useContext,
} from "react";
import { ModelRecord, ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { MultiSelectorData } from "../../standalone";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "./BackendMultiSelect";
import useCrudSelect, {
	CrudSelectDispatch,
	UseCrudSelectParams,
	UseCrudSelectResult,
} from "./useCrudSelect";
import DialogContextProvider from "../../framework/DialogContextProvider";
import CrudSelectLoadState from "./CrudSelectLoadState";

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

	// until the selection is loaded nothing can be picked or removed, and the components
	// inside the field, which work on the selection, are not rendered
	const locked = loading || !!loadError;

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
				<div aria-busy={loading}>
					<BackendMultiSelect
						{...props}
						disabled={props.disabled || locked}
						endAdornment={locked ? undefined : props.endAdornment}
						endAdornmentLeft={locked ? undefined : props.endAdornmentLeft}
						selected={selected.map((entry) => entry.value)}
						onSelect={handleSelect}
						modelToSelectorData={modelToSelectorData}
						// the connector's records seed the selected cache: modelToSelectorData tells them apart
						initialData={initialRawData as ModelRecord<M>[]}
					/>
				</div>
				<CrudSelectLoadState
					loading={loading}
					loadError={loadError}
					label={props.label}
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
