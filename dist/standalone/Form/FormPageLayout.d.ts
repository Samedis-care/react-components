import { Theme } from "@material-ui/core";
import React from "react";
import { Styles } from "@material-ui/core/styles/withStyles";
export interface FormPageLayoutProps {
    body: React.ReactNode;
    footer: React.ReactNode;
    other?: React.ReactNode;
}
declare const useStyles: (props?: any) => import("@material-ui/styles/withStyles/withStyles").ClassNameMap<"body" | "footer" | "wrapper" | "box">;
export declare type FormPageLayoutClassKey = keyof ReturnType<typeof useStyles>;
export declare type FormPageLayoutTheme = Partial<Styles<Theme, FormPageLayoutProps, FormPageLayoutClassKey>>;
declare const _default: React.MemoExoticComponent<(props: FormPageLayoutProps) => JSX.Element>;
export default _default;
