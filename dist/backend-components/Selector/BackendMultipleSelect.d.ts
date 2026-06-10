import React from "react";
import { BaseSelectorProps, MultiSelectorData } from "../../standalone";
import { ModelFieldName, PageVisibility } from "../../backend-integration/Model/Model";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
export type BackendMultipleSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> = Omit<BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, "classes"> & Pick<BaseSelectorProps<DataT, true>, "classes">;
/**
 * Backend connected BaseSelector with multiple=true
 * @constructor
 */
declare const BackendMultipleSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: BackendMultipleSelectProps<KeyT, VisibilityT, CustomT, DataT>) => React.JSX.Element;
declare const _default: typeof BackendMultipleSelect;
export default _default;
