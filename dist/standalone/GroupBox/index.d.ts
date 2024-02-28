import React from "react";
import { Styles } from "@mui/styles";
import { Theme } from "@mui/material";
declare const useStylesBase: (props?: any) => import("@mui/styles").ClassNameMap<"legend" | "smallLabel" | "fieldSetRoot">;
export type GroupBoxClassKey = keyof ReturnType<typeof useStylesBase>;
export type GroupBoxTheme = Partial<Styles<Theme, GroupBoxProps, GroupBoxClassKey>>;
declare const useStyles: (props: GroupBoxProps) => ReturnType<typeof useStylesBase>;
export interface GroupBoxProps {
    /**
     * The HTML id of the fieldset
     */
    id?: string;
    /**
     * The label of the box
     */
    label: React.ReactNode;
    /**
     * The label type of the box
     */
    smallLabel?: boolean;
    /**
     * Box contents
     */
    children?: React.ReactNode;
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const _default: React.MemoExoticComponent<(props: GroupBoxProps) => React.JSX.Element>;
export default _default;
