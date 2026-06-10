import React from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
export interface FlowEngineSaveButtonProps extends Omit<ActionButtonProps, "children"> {
    children?: ActionButtonProps["children"];
}
declare const _default: React.MemoExoticComponent<(props: FlowEngineSaveButtonProps) => React.JSX.Element>;
export default _default;
