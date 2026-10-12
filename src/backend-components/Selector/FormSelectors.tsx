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
import { ModelUnknown } from "../../backend-integration";

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
		const { getFieldValues } = useFormContextLite<ModelUnknown>();
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

export type FormBackendSingleSelectProps<M extends ModelUnknown> =
	WithSelectorFormContextProps<BackendSingleSelectProps<M>, BaseSelectorData>;
export const FormBackendSingleSelect = <M extends ModelUnknown>(
	props: FormBackendSingleSelectProps<M>,
) => WithSelectorFormContext(BackendSingleSelect<M>)(props);

export type FormBackendMultiSelectProps<
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
> = WithSelectorFormContextProps<BackendMultiSelectProps<M, DataT>, DataT>;
export const FormBackendMultiSelect = <
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>(
	props: FormBackendMultiSelectProps<M, DataT>,
) => WithSelectorFormContext(BackendMultiSelect<M, DataT>)(props);
