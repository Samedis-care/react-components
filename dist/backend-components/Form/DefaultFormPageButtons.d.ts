import React from "react";
import { BasicFormPageRendererProps, EnhancedCustomProps } from "./BasicFormPage";
import { CrudFormProps } from "../CRUD";
import { DefaultFormPageProps } from "./DefaultFormPage";
export declare const BackActionButton: import("@emotion/styled").StyledComponent<Pick<import("../../standalone/UIKit/ActionButton").ActionButtonProps, keyof import("../../standalone/UIKit/ActionButton").ActionButtonProps> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export type DefaultFormPageButtonsClassKey = "backButton";
export type DefaultFormPageButtonsProps = BasicFormPageRendererProps<EnhancedCustomProps<CrudFormProps> | undefined> & Pick<DefaultFormPageProps, "extraButtons" | "textButtonSave" | "textButtonBack">;
declare const _default: React.MemoExoticComponent<(inProps: DefaultFormPageButtonsProps) => React.JSX.Element>;
export default _default;
