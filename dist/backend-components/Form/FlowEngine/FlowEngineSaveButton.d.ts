import React from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
/**
 * Props of FlowEngineSaveButton: ActionButton's, with an optional label
 */
export interface FlowEngineSaveButtonProps extends Omit<ActionButtonProps, "children"> {
    /**
     * The label
     * @default the translated "Save" (common.buttons.save)
     */
    children?: ActionButtonProps["children"];
}
declare const _default: React.MemoExoticComponent<(props: FlowEngineSaveButtonProps) => React.JSX.Element>;
export default _default;
