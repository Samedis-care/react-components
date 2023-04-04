import React from "react";
import { TypographyProps } from "@material-ui/core";
export interface CenteredTypographyProps extends Omit<TypographyProps, "classes"> {
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
    /**
     * Sub classes to apply
     */
    subClasses?: {
        typography?: TypographyProps["classes"];
    };
}
declare const useStyles: (props?: any) => import("@material-ui/styles").ClassNameMap<"innerWrapper" | "outerWrapper">;
declare const _default: React.MemoExoticComponent<(props: CenteredTypographyProps) => JSX.Element>;
export default _default;
