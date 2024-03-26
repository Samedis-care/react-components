import React from "react";
import { BasicFormPageRendererProps } from "./BasicFormPage";
import { CrudFormProps } from "../CRUD";
export declare const BackActionButton: import("@emotion/styled").StyledComponent<Pick<import("../../standalone/UIKit/ActionButton").ActionButtonProps, keyof import("../../standalone/UIKit/ActionButton").ActionButtonProps> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export type DefaultFormPageButtonsClassKey = "backButton";
export type DefaultFormPageButtonsProps = BasicFormPageRendererProps<CrudFormProps | undefined>;
declare const _default: React.MemoExoticComponent<(inProps: DefaultFormPageButtonsProps) => React.JSX.Element>;
export default _default;
