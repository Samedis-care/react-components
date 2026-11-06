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
		UseLazyCrudConnectorParams<Record<string, unknown>> {
	/**
	 * Locks the control: the search field is disabled, the entries have no remove button,
	 * and nothing queues a write, neither the ref's addToSelection nor an end adornment's
	 * handleSelect. While the Form is read-only (which includes a save in progress) the
	 * control is locked whatever this says: `disabled` can only add to that.
	 * @default false
	 */
	disabled?: boolean;
}

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

	// the caller's props first: the Form's state wins, so an explicit falsy disabled
	// cannot unlock the control in a read-only form
	return (
		<CrudMultiSelect
			{...otherProps}
			connector={connector}
			errorComponent={errorComponent}
			disabled={otherProps.disabled || readOnly}
			field={connectorParams.field}
			ref={ref}
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
