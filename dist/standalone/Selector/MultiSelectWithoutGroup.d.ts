import React from "react";
import { BaseSelectorProps, MultiSelectorData } from "../../standalone/Selector";
export interface MultiSelectWithoutGroupProps<DataT extends MultiSelectorData> extends Omit<BaseSelectorProps<DataT>, "onSelect" | "selected" | "classes" | "onLoad"> {
    /**
     * Extended selection change handler
     * @param data The selected data entry/entries
     */
    onSelect?: (value: DataT[]) => void;
    /**
     * Custom styles
     */
    classes?: Partial<keyof ReturnType<typeof useStyles>>;
    /**
     * The currently selected values
     */
    selected: DataT[];
    /**
     * State of the switch control
     */
    switchValue?: boolean;
    /**
     * Set value for switch position
     * @param checked The value of switch input
     */
    setSwitchValue?: (checked: boolean) => void;
    /**
     * Search callback which is called to load available data entries
     * @param query The search string
     * @param switchValue The value of the switch or false if switch is disabled
     */
    loadDataOptions: (query: string, switchValue: boolean) => DataT[] | Promise<DataT[]>;
    /**
     * Optional callback for customizing the unique identifier of data
     * @param data The data struct
     * @returns A unique ID extracted from data
     * @default returns data.value
     */
    getIdOfData?: (data: DataT) => string;
    /**
     * Comparison function for client side sorting
     */
    sortCompareFn?: (value1: DataT, value2: DataT) => number;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"switch" | "outlined" | "labelWithSwitch" | "searchLabel">;
declare const _default: <DataT extends MultiSelectorData>(props: MultiSelectWithoutGroupProps<DataT>) => React.JSX.Element;
export default _default;
