import React from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
export interface FlowEngineBackButtonProps extends Omit<ActionButtonProps, "onClick" | "children"> {
    children?: ActionButtonProps["children"];
}
declare const _default: React.MemoExoticComponent<(props: FlowEngineBackButtonProps) => React.JSX.Element>;
export default _default;
