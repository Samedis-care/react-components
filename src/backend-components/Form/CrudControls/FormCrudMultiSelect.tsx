import React, { ForwardedRef, RefAttributes } from "react";
import {
	ModelFieldName,
	PageVisibility,
} from "../../../backend-integration/Model/Model";
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

export interface SamedisCrudMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
> extends Omit<
			CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>,
			"errorComponent" | "connector" | "field"
		>,
		UseLazyCrudConnectorParams<
			KeyT,
			VisibilityT,
			CustomT,
			Record<string, unknown>
		> {}

const FormCrudMultiSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
>(
	props: SamedisCrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT> &
		RefAttributes<CrudSelectDispatch<DataT>>,
	ref: ForwardedRef<CrudSelectDispatch<DataT>>
) => {
	const [connectorParams, otherProps] = extractLazyCrudConnectorParams<
		KeyT,
		VisibilityT,
		CustomT,
		Record<string, unknown>,
		typeof props
	>(props);
	const { connector } = useLazyCrudConnector<
		KeyT,
		VisibilityT,
		CustomT,
		Record<string, unknown>
	>(connectorParams);
	const { readOnly, errorComponent } = useFormContextLite();

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

export default React.memo(
	React.forwardRef(FormCrudMultiSelect)
) as typeof FormCrudMultiSelect;
