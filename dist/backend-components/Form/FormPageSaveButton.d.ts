import React from "react";
import { ActionButtonProps } from "../../standalone/UIKit/ActionButton";
/**
 * Props of FormPageSaveButton: ActionButton's, with an optional label
 */
export interface FormPageSaveButtonProps extends Omit<ActionButtonProps, "children"> {
    /**
     * The label
     * @default the translated "Save" (common.buttons.save)
     */
    children?: ActionButtonProps["children"];
    /**
     * Makes the button unavailable: it is marked `aria-disabled="true"` instead of the
     * native `disabled`, looks disabled (MUI's `Mui-disabled` class), and neither a click
     * nor Enter or Space calls `onClick`. It stays in the tab order, so a Save that a save
     * makes unavailable keeps the keyboard focus.
     * @default false
     */
    disabled?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: FormPageSaveButtonProps) => React.JSX.Element>;
export default _default;
