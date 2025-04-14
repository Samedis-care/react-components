import React, { useCallback } from "react";
import {
	BaseSelectorData,
	BaseSelectorProps,
	MultiSelectorData,
} from "../../standalone";
import { useFormContextLite } from "../Form";
import BackendSingleSelect, {
	BackendSingleSelectProps,
} from "./BackendSingleSelect";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "./BackendMultiSelect";
import { ModelFieldName, PageVisibility } from "../../backend-integration";

interface WithoutFormContext<DataT extends BaseSelectorData> {
	onAddNew?: BaseSelectorProps<DataT, false>["onAddNew"];
}

interface WithFormContext<DataT extends BaseSelectorData> {
	onAddNew?: (
		data: Record<string, unknown>,
	) => ReturnType<NonNullable<BaseSelectorProps<DataT, false>["onAddNew"]>>;
}

export type WithSelectorFormContextProps<
	PropsT,
	DataT extends BaseSelectorData,
> = Omit<PropsT, keyof WithoutFormContext<DataT>> & WithFormContext<DataT>;

const WithSelectorFormContext = <
	DataT extends BaseSelectorData,
	PropsT extends WithoutFormContext<DataT>,
>(
	SelectorComponent: React.ComponentType<PropsT>,
) =>
	function WithSelectorFormContext(
		props: WithSelectorFormContextProps<PropsT, DataT>,
	) {
		const { onAddNew } = props;
		const { getFieldValues } = useFormContextLite();
		const handleAddNew: WithFormContext<DataT>["onAddNew"] =
			useCallback((): ReturnType<
				NonNullable<WithoutFormContext<DataT>["onAddNew"]>
			> => {
				if (!onAddNew) return null;
				return onAddNew(getFieldValues());
			}, [getFieldValues, onAddNew]);

		const patchedProps: PropsT = {
			...props,
			onAddNew: onAddNew ? handleAddNew : undefined,
		} as PropsT;

		return <SelectorComponent {...patchedProps} />;
	};

export type FormBackendSingleSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
> = WithSelectorFormContextProps<
	BackendSingleSelectProps<KeyT, VisibilityT, CustomT>,
	BaseSelectorData
>;
export const FormBackendSingleSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
>(
	props: FormBackendSingleSelectProps<KeyT, VisibilityT, CustomT>,
) =>
	WithSelectorFormContext(BackendSingleSelect<KeyT, VisibilityT, CustomT>)(
		props,
	);

export type FormBackendMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData,
> = WithSelectorFormContextProps<
	BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>,
	DataT
>;
export const FormBackendMultiSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData,
>(
	props: FormBackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>,
) =>
	WithSelectorFormContext(
		BackendMultiSelect<KeyT, VisibilityT, CustomT, DataT>,
	)(props);
