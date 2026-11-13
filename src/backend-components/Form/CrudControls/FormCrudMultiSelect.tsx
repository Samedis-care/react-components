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
import { FORM_SUBMITTING_READ_ONLY_REASON, useFormContextLite } from "../Form";
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
	 * Disables the control: the search field is disabled, the entries have no remove button,
	 * and nothing queues a write, neither the ref's addToSelection nor an end adornment's
	 * handleSelect. The Form never disables the control, see readOnly.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Shows the control read-only: the label and the entries, without search field, end
	 * adornments or remove buttons, and nothing queues a write. While the Form is read-only
	 * the control is read-only whatever this says. A save in progress is the exception: it
	 * leaves the control as it is, the focus and the text typed into the search field
	 * included, and only blocks picks and removals while it runs (blockWrites).
	 * @default false
	 */
	readOnly?: boolean;
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
	const { readOnly, readOnlyReasons, errorComponent } =
		useFormContextLite<ModelUnknown>();
	// a save makes the Form read-only too, but changing the field then would take the user's
	// focus and typed search away: while it runs, the field only takes no picks or removals
	const readOnlyBesidesSaving = Object.keys(readOnlyReasons).some(
		(reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON,
	);

	// the caller's props first: the Form's state wins, so an explicit falsy readOnly or
	// blockWrites cannot unlock the control in a read-only or saving form
	return (
		<CrudMultiSelect
			{...otherProps}
			connector={connector}
			errorComponent={errorComponent}
			readOnly={otherProps.readOnly || readOnlyBesidesSaving}
			blockWrites={otherProps.blockWrites || readOnly}
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
