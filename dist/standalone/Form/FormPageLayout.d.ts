import { Theme } from "@mui/material";
import React from "react";
import { Styles } from "@mui/styles";
export interface FormPageLayoutProps {
    body: React.ReactNode;
    footer: React.ReactNode;
    other?: React.ReactNode;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"body" | "footer" | "wrapper" | "box">;
export declare type FormPageLayoutClassKey = keyof ReturnType<typeof useStyles>;
export declare type FormPageLayoutTheme = Partial<Styles<Theme, FormPageLayoutProps, FormPageLayoutClassKey>>;
declare const _default: React.MemoExoticComponent<(props: FormPageLayoutProps) => JSX.Element>;
export default _default;
