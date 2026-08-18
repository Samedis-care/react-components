import React from "react";
import { BaseSelectorProps, MultiSelectorData } from "../../standalone";
import { ModelFieldName, PageVisibility } from "../../backend-integration/Model/Model";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
export type BackendMultipleSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> = Omit<BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, "classes"> & Pick<BaseSelectorProps<DataT, true>, "classes">;
/**
 * Themable subset of BackendMultipleSelectProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (model, selection, callbacks)
 */
export type BackendMultipleSelectThemeProps = Omit<BackendMultipleSelectProps<ModelFieldName, PageVisibility, unknown, MultiSelectorData>, "model" | "modelFetch" | "modelToSelectorData" | "selected" | "onSelect" | "initialData" | "lru">;
/**
 * Backend connected BaseSelector with multiple=true
 * @constructor
 */
declare const BackendMultipleSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(inProps: BackendMultipleSelectProps<KeyT, VisibilityT, CustomT, DataT>) => React.JSX.Element;
declare const _default: typeof BackendMultipleSelect;
export default _default;
