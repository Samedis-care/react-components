import React, { ReactNode } from "react";
import { InputProps, Theme } from "@mui/material";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
import { Styles } from "@mui/styles";
import { AutocompleteProps, AutocompleteClassKey } from "@mui/material/Autocomplete";
export interface BaseSelectorData {
    /**
     * A unique value
     */
    value: string;
    /**
     * The label to show the user
     * If [string, React.ReactNode] => string is used for search and won't be shown to use. ReactNode will be shown to user
     */
    label: string | [string, React.ReactNode];
    /**
     * The group of this item
     */
    group?: string;
    /**
     * An optional icon or img src
     */
    icon?: React.ReactNode | string;
    /**
     * Should the entry be ignored?
     */
    ignore?: boolean;
    /**
     * Should this entry be hidden from selection?
     */
    hidden?: boolean;
    /**
     * Should the entry be disabled?
     */
    isDisabled?: boolean;
    /**
     * Should the entry be marked selected
     */
    selected?: boolean;
    /**
     * Is this an add new button? (used for special handling in the renderer)
     */
    isAddNewButton?: boolean;
    /**
     * Is this entry a divider?
     * Label and value won't be used. isDisabled will be forced to true
     */
    isDivider?: boolean;
    /**
     * Is this entry a small label?
     * Label will be displayed, value won't be used. isDisabled will be forced to true
     */
    isSmallLabel?: boolean;
    /**
     * CSS styles for options
     */
    className?: string;
}
export declare const getStringLabel: (data: BaseSelectorData | string) => string;
export declare const getReactLabel: (data: BaseSelectorData) => React.ReactNode;
export declare const modifyReactLabel: <DataT extends BaseSelectorData>(data: DataT, cb: (prev: React.ReactNode) => React.ReactNode) => DataT;
export interface SelectorLruOptions<DataT extends BaseSelectorData> {
    /**
     * The max amount of LRU cache entries
     */
    count: number;
    /**
     * The function to load the data associated with a LRU cache entry
     * @param id The ID of the data (value in DataT)
     * @remarks The return value is not cached
     */
    loadData: (id: string) => Promise<DataT> | DataT;
    /**
     * The LRU storage key
     */
    storageKey: string;
    /**
     * Do not load selector items if no search query is present
     */
    forceQuery: boolean;
}
/**
 * A callback used to get an label value for a specific input (search) value
 */
declare type SelectorLabelCallback = (obj: {
    inputValue: string;
}) => string | null;
export interface BaseSelectorProps<DataT extends BaseSelectorData> extends TextFieldWithHelpProps {
    /**
     * Refresh token used to force refreshing data.
     */
    refreshToken?: string;
    /**
     * Data load function
     * @param search The user search input
     * @param switchValue The value of switch input
     */
    onLoad: (search: string, switchValue: boolean) => DataT[] | Promise<DataT[]>;
    /**
     * Callback for autocomplete change
     */
    onSelect: (selected: DataT | null) => void;
    /**
     * The textfield type of input
     */
    variant?: "outlined" | "standard";
    /**
     * The label of the selector
     */
    label?: string;
    /**
     * Disable autocomplete control
     */
    disabled?: boolean;
    /**
     * String used for the Autocomplete component
     */
    autocompleteId?: string;
    /**
     * String used to set placeholder of the Autocomplete component
     */
    placeholder?: string;
    /**
     * Handler for the "Add new" button
     * Add new button only shows if this is set.
     * @returns The newly created data entry which will be selected or null if user cancelled
     */
    onAddNew?: () => DataT | null | Promise<DataT | null>;
    /**
     * Label for the "Add new" button
     */
    addNewLabel?: string;
    /**
     * The currently selected values
     */
    selected: DataT | null;
    /**
     * Enables icons in the list renderers
     */
    enableIcons?: boolean;
    /**
     * Size of the icons (if enableIcons) in px
     */
    iconSize?: number;
    /**
     * Label which is shown if there is no data
     */
    noOptionsText?: string | SelectorLabelCallback;
    /**
     * Label which is shown while loading data
     */
    loadingText?: string | SelectorLabelCallback;
    /**
     * Label which is shown if forceQuery == true and nothing has been typed
     */
    startTypingToSearchText?: string | SelectorLabelCallback;
    /**
     * Label which is shown for close icon button while popup is opened
     */
    closeText?: string;
    /**
     * Label which is shown for open icon button while popup is closed
     */
    openText?: string;
    /**
     * Label which is shown for the clear selected icon
     */
    clearText?: string;
    /**
     * Is the selector clearable?
     */
    disableClearable?: boolean;
    /**
     * Disable search?
     */
    disableSearch?: boolean;
    /**
     * Enable grouping
     */
    grouped?: boolean;
    /**
     * Label used if no group is set
     */
    noGroupLabel?: string;
    /**
     * Disable group sorting
     */
    disableGroupSorting?: boolean;
    /**
     * Group sorting algorithm
     * @see Array.sort
     */
    groupSorter?: (a: DataT, b: DataT) => number;
    /**
     * Custom styles to be used for selector
     */
    classes?: AutocompleteProps<unknown, undefined, undefined, undefined>["classes"];
    /**
     * Display switch control?
     */
    displaySwitch?: boolean;
    /**
     * Default value for switch position
     */
    defaultSwitchValue?: boolean;
    /**
     * Label for switch control (only used if displaySwitch is truthy)
     */
    switchLabel?: React.ReactNode;
    /**
     * Last recently used (LRU) cache options
     * LRU shows the user the previous items he selected when no search term is entered
     */
    lru?: SelectorLruOptions<DataT>;
    /**
     * Enable freeSolo
     */
    freeSolo?: boolean;
    /**
     * Icon when no item is selected
     */
    startAdornment?: InputProps["startAdornment"];
    /**
     * Icon to show on the right of the selector
     * @remarks Must be IconButton with padding: 2px; margin-right: -2px applied to it
     */
    endAdornment?: InputProps["endAdornment"];
    /**
     * Like endAdornment, but on the left side of the drop-down arrow
     * @see endAdornment
     */
    endAdornmentLeft?: InputProps["endAdornment"];
    /**
     * Optional callback for customizing the unique identifier of data
     * @param data The data struct
     * @returns A unique ID extracted from data
     * @default returns data.value
     */
    getIdOfData?: (data: DataT) => string;
    /**
     * Ids to filter from options
     */
    filterIds?: string[] | undefined;
}
export declare type SelectorThemeExpert = {
    base?: Partial<Styles<Theme, BaseSelectorProps<BaseSelectorData>, AutocompleteClassKey>>;
    extensions?: Partial<Styles<Theme, BaseSelectorProps<BaseSelectorData>, SelectorCustomStylesClassKey>>;
};
declare const useCustomStylesBase: (props: Pick<BaseSelectorProps<BaseSelectorData>, "label" | "iconSize">) => import("@mui/styles").ClassNameMap<"label" | "switch" | "selected" | "icon" | "wrapper" | "divider" | "smallLabel" | "labelWithSwitch" | "infoBtn" | "textFieldStandard" | "listItem" | "lruListItem">;
export declare type SelectorCustomStylesClassKey = keyof ReturnType<typeof useCustomStylesBase>;
export interface BaseSelectorContextType {
    addToLru: (...ids: string[]) => void;
}
export declare const BaseSelectorContext: React.Context<BaseSelectorContextType | null>;
declare const _default: <DataT extends BaseSelectorData>(props: BaseSelectorProps<DataT>) => JSX.Element;
export default _default;
