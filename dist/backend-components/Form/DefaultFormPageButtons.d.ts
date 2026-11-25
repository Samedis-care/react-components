import React from "react";
import type { BasicFormPageRendererProps, EnhancedCustomProps } from "./BasicFormPage";
import type { CrudFormProps } from "../CRUD";
import ActionButton from "../../standalone/UIKit/ActionButton";
import type { DefaultFormPageProps } from "./DefaultFormPage";
/**
 * Class BackActionButton sets when it gets no `color`. While the button is enabled, it paints it
 * in MUI's grey for a contained button without a palette color (`grey[300]` in the light palette,
 * `grey[800]` in the dark one) with the palette's contrast text for that grey; a disabled one
 * (e.g. during a save) looks like every disabled ActionButton, like Save next to it. Restyle it
 * through `CcDefaultFormPageButtons.styleOverrides.backButton` with the selector
 * `&.${BackButtonDefaultColorClass}:not(.Mui-disabled)`, which keeps that disabled look, and set
 * `color` together with `backgroundColor` there, or the text keeps the contrast color of the grey.
 */
export declare const BackButtonDefaultColorClass = "CcDefaultFormPageButtons-backButtonDefaultColor";
/**
 * ActionButton styled as the secondary "back" action of a form footer: no shadow, no border, and
 * grey (BackButtonDefaultColorClass) unless a `color` is given; disabled, it looks like any
 * disabled ActionButton. Takes ActionButton's props.
 */
export declare const BackActionButton: typeof ActionButton;
export type DefaultFormPageButtonsClassKey = "backButton";
export type DefaultFormPageButtonsProps = BasicFormPageRendererProps<EnhancedCustomProps<CrudFormProps> | undefined> & Pick<DefaultFormPageProps, "extraButtons" | "textButtonSave" | "textButtonBack">;
declare const _default: React.MemoExoticComponent<(inProps: DefaultFormPageButtonsProps) => React.JSX.Element>;
export default _default;
