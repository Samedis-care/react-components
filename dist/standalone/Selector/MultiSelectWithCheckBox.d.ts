import React, { CSSProperties } from "react";
import { SelectProps, Theme, SelectClassKey } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/styles/withStyles";
import { Styles } from "@material-ui/core/styles/withStyles";
import { MultiSelectorData } from "./MultiSelect";
export interface MultiSelectWithCheckBoxProps extends SelectProps {
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
declare const useStyles: (props?: any) => ClassNameMap<"checkboxStyle">;
export declare type MultiSelectWithCheckBoxThemeExpert = Partial<Styles<Theme, SelectProps, SelectClassKey>>;
declare const _default: React.MemoExoticComponent<(props: MultiSelectWithCheckBoxProps) => JSX.Element>;
export default _default;
