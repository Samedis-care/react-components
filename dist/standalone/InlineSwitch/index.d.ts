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
     * custom styles
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<InlineSwitchClassKey, string>>;
}
export type InlineSwitchClassKey = "switch" | "root" | "switchWrapper";
declare const InlineSwitch: (inProps: InlineSwitchProps) => React.JSX.Element;
declare const _default: typeof InlineSwitch;
export default _default;
