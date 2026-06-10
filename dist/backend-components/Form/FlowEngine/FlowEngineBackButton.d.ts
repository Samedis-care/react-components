import React from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
export interface FlowEngineBackButtonProps extends Omit<ActionButtonProps, "onClick" | "children"> {
    children?: ActionButtonProps["children"];
}
export declare const useShouldRenderFlowEngineBackButton: () => boolean | undefined;
declare const _default: React.MemoExoticComponent<(props: FlowEngineBackButtonProps) => React.JSX.Element>;
export default _default;
