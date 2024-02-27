/// <reference types="react" />
import { SelectClassKey, SelectProps, Theme } from "@mui/material";
import { ClassNameMap } from "@mui/styles/withStyles";
import { CSSProperties, Styles } from "@mui/styles";
import { MultiSelectorData } from "./MultiSelect";
export interface MultiSelectWithCheckBoxProps extends SelectProps<string[], "outlined"> {
    /**
     * Selector options
     */
    options: MultiSelectorData[];
    /**
     * Selected values
     */
    values: string[];
    /**
     * Custom styles
     */
    classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles> | SelectClassKey>>;
}
export interface MultiSelectWithCheckBoxTheme {
    checkboxStyle?: CSSProperties;
    itemSelectedStyle?: CSSProperties;
    itemSelectedHoverStyle?: CSSProperties;
    itemTextPrimaryStyle?: CSSProperties;
    inputStyle?: CSSProperties;
    inputRootStyle?: CSSProperties;
    inputFocusStyle?: CSSProperties;
    selectStyle?: MultiSelectWithCheckBoxThemeExpert;
}
declare const useStyles: (props?: any) => ClassNameMap<"label" | "checkboxStyle">;
export declare type MultiSelectWithCheckBoxThemeExpert = Partial<Styles<Theme, SelectProps<string[]>, SelectClassKey>>;
declare const _default: (props: MultiSelectWithCheckBoxProps) => JSX.Element;
export default _default;
