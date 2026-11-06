import React from "react";
import type { BasicFormPageRendererProps, EnhancedCustomProps } from "./BasicFormPage";
import type { CrudFormProps } from "../CRUD";
import ActionButton from "../../standalone/UIKit/ActionButton";
import type { DefaultFormPageProps } from "./DefaultFormPage";
/**
 * Class BackActionButton sets when it gets no `color`. It paints the button in MUI's grey for a
 * contained button without a palette color (`grey[300]` in the light palette, `grey[800]` in the
 * dark one) with the palette's contrast text for that grey. Restyle it through
 * `CcDefaultFormPageButtons.styleOverrides.backButton`, and set `color` together with
 * `backgroundColor` there, or the text keeps the contrast color of the grey.
 */
export declare const BackButtonDefaultColorClass = "CcDefaultFormPageButtons-backButtonDefaultColor";
/**
 * ActionButton styled as the secondary "back" action of a form footer: no shadow, no border, and
 * grey (BackButtonDefaultColorClass) unless a `color` is given. Takes ActionButton's props.
 */
export declare const BackActionButton: typeof ActionButton;
export type DefaultFormPageButtonsClassKey = "backButton";
export type DefaultFormPageButtonsProps = BasicFormPageRendererProps<EnhancedCustomProps<CrudFormProps> | undefined> & Pick<DefaultFormPageProps, "extraButtons" | "textButtonSave" | "textButtonBack">;
declare const _default: React.MemoExoticComponent<(inProps: DefaultFormPageButtonsProps) => React.JSX.Element>;
export default _default;
