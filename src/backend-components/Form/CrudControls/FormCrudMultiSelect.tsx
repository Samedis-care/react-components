import React, { ForwardedRef, RefAttributes } from "react";
import { ModelUnknown } from "../../../backend-integration/Model/Model";
import CrudMultiSelect, {
	CrudMultiSelectProps,
} from "../../Selector/CrudMultiSelect";
import useLazyCrudConnector, {
	extractLazyCrudConnectorParams,
	UseLazyCrudConnectorParams,
} from "../useLazyCrudConnector";
import { MultiSelectorData } from "../../../standalone";
import { useFormContextLite } from "../Form";
import { CrudSelectDispatch } from "../../Selector/useCrudSelect";

export interface FormCrudMultiSelectProps<
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>
	extends
		Omit<
			CrudMultiSelectProps<M, DataT>,
			"errorComponent" | "connector" | "field"
		>,
		UseLazyCrudConnectorParams<Record<string, unknown>> {}

const FormCrudMultiSelect = <
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>(
	props: FormCrudMultiSelectProps<M, DataT> &
		RefAttributes<CrudSelectDispatch<DataT>>,
	ref: ForwardedRef<CrudSelectDispatch<DataT>>,
) => {
	const [connectorParams, otherProps] = extractLazyCrudConnectorParams<
		Record<string, unknown>,
		typeof props
	>(props);
	const { connector } =
		useLazyCrudConnector<Record<string, unknown>>(connectorParams);
	const { readOnly, errorComponent } = useFormContextLite<ModelUnknown>();

	return (
		<CrudMultiSelect
			connector={connector}
			errorComponent={errorComponent}
			disabled={props.disabled || readOnly}
			field={connectorParams.field}
			ref={ref}
			{...otherProps}
		/>
	);
};

export const ForwardedCrudMultiSelect = React.forwardRef(
	FormCrudMultiSelect,
) as <M extends ModelUnknown, DataT extends MultiSelectorData>(
	props: FormCrudMultiSelectProps<M, DataT> &
		RefAttributes<CrudSelectDispatch<DataT>>,
) => React.ReactElement;

export default React.memo(
	ForwardedCrudMultiSelect,
) as typeof ForwardedCrudMultiSelect;
