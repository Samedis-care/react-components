import React from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
export interface FlowEngineBackButtonProps extends Omit<ActionButtonProps, "onClick" | "children"> {
    /**
     * The label, required: the button leaves the whole flow (it calls the Form's goBack), not
     * only the current stage, and whether that reads as "Cancel" or "Back" depends on the
     * stage. In a step of a wizard, next to "Next", "Back" reads as "previous step", so such
     * a stage says "Cancel"; a final form opened from a list may say "Back".
     */
    children: ActionButtonProps["children"];
}
export declare const useShouldRenderFlowEngineBackButton: () => boolean | undefined;
declare const _default: React.MemoExoticComponent<(props: FlowEngineBackButtonProps) => React.JSX.Element>;
export default _default;
