import React from "react";
export interface InlineSwitchProps {
    /**
     * Value for switch position
     */
    value: boolean;
    /**
     * Set value for switch position
     * @param checked The value of switch input
     */
    onChange?: (checked: boolean) => void;
    /**
     * Display switch control?
     */
    visible: boolean;
    /**
     * Label for switch control (only used if visible is truthy)
     */
    label?: React.ReactNode;
    children?: React.ReactElement;
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const useStyles: (props?: any) => import("@material-ui/styles").ClassNameMap<"switch" | "labelWithSwitch">;
declare const _default: (props: InlineSwitchProps) => JSX.Element;
export default _default;
