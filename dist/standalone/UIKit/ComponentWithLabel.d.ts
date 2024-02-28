import React from "react";
import { FormControlLabelProps, TypographyProps } from "@mui/material";
import { CSSProperties } from "@mui/styles";
export interface ComponentWithLabelProps extends Omit<FormControlLabelProps, "label"> {
    /**
     * The text of the label
     */
    labelText: string;
    /**
     * Label variant
     */
    labelVariant?: TypographyProps["variant"];
    /**
     * Label location
     */
    labelDisplay?: TypographyProps["display"];
    /**
     * Label alignment
     */
    labelAlign?: TypographyProps["align"];
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
export interface ComponentWithLabelTheme {
    whiteSpace?: CSSProperties["whiteSpace"];
    padding?: CSSProperties["padding"];
    margin?: CSSProperties["margin"];
    border?: CSSProperties["border"];
    borderRadius?: CSSProperties["borderRadius"];
    backgroundColor?: CSSProperties["backgroundColor"];
    color?: CSSProperties["color"];
    fontSize?: CSSProperties["fontSize"];
    fontWeight?: CSSProperties["fontWeight"];
    style?: CSSProperties;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"label">;
declare const _default: React.MemoExoticComponent<(props: ComponentWithLabelProps | FormControlLabelProps) => React.JSX.Element>;
export default _default;
