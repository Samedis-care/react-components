import React from "react";
import { BaseSelectorProps, MultiSelectorData } from "../../standalone";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
export type BackendMultipleSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> = Omit<BackendMultiSelectProps<M, DataT>, "classes"> & Pick<BaseSelectorProps<DataT, true>, "classes">;
/**
 * Themable subset of BackendMultipleSelectProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (model, selection, callbacks)
 */
export type BackendMultipleSelectThemeProps = Omit<BackendMultipleSelectProps<ModelUnknown, MultiSelectorData>, "model" | "modelFetch" | "modelToSelectorData" | "selected" | "onSelect" | "initialData" | "lru">;
/**
 * Backend connected BaseSelector with multiple=true
 * @constructor
 */
declare const BackendMultipleSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(inProps: BackendMultipleSelectProps<M, DataT>) => React.JSX.Element;
declare const _default: typeof BackendMultipleSelect;
export default _default;
