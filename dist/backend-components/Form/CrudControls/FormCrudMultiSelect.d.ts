import React, { RefAttributes } from "react";
import { ModelUnknown } from "../../../backend-integration/Model/Model";
import { CrudMultiSelectProps } from "../../Selector/CrudMultiSelect";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
import { MultiSelectorData } from "../../../standalone";
import { CrudSelectDispatch } from "../../Selector/useCrudSelect";
export interface FormCrudMultiSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> extends Omit<CrudMultiSelectProps<M, DataT>, "errorComponent" | "connector" | "field">, UseLazyCrudConnectorParams<Record<string, unknown>> {
    /**
     * Locks the control: the search field is disabled, the entries have no remove button,
     * and nothing queues a write, neither the ref's addToSelection nor an end adornment's
     * handleSelect. While the Form is read-only (which includes a save in progress) the
     * control is locked whatever this says: `disabled` can only add to that.
     * @default false
     */
    disabled?: boolean;
}
export declare const ForwardedCrudMultiSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(props: FormCrudMultiSelectProps<M, DataT> & RefAttributes<CrudSelectDispatch<DataT>>) => React.ReactElement;
declare const _default: typeof ForwardedCrudMultiSelect;
export default _default;
