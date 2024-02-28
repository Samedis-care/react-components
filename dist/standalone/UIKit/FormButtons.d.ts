import React from "react";
import { CSSProperties } from "@mui/styles";
export interface FormButtonTheme {
    buttonWrapper?: {
        float?: CSSProperties["float"];
        margin?: CSSProperties["margin"];
        style?: CSSProperties;
        firstChild?: {
            style?: CSSProperties;
        };
        lastChild?: {
            style?: CSSProperties;
        };
    };
    container?: {
        float?: CSSProperties["float"];
        width?: CSSProperties["width"];
        padding?: CSSProperties["padding"];
        margin?: CSSProperties["margin"];
        border?: CSSProperties["border"];
        borderRadius?: CSSProperties["borderRadius"];
        backgroundColor?: CSSProperties["backgroundColor"];
        backgroundColorOpacity?: number;
        style?: CSSProperties;
    };
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"container" | "buttonWrapper">;
export interface FormButtonsProps {
    /**
     * Action buttons (used on form)
     */
    children: React.ReactNode | React.ReactNode[];
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const _default: React.MemoExoticComponent<(props: FormButtonsProps) => React.JSX.Element>;
export default _default;
