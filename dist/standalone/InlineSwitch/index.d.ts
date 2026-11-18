import React from "react";
export interface InlineSwitchProps {
    /**
     * Value for switch position. While true, the root has the class
     * `CcInlineSwitch-checked`.
     */
    value: boolean;
    /**
     * Set value for switch position
     * @param checked The value of switch input
     */
    onChange?: (checked: boolean) => void;
    /**
     * Display switch control? While true, the root has the class
     * `CcInlineSwitch-visible`.
     */
    visible: boolean;
    /**
     * Label for switch control (only used if visible is truthy)
     */
    label?: React.ReactNode;
    /**
     * Disables the switch: it cannot be focused or toggled, also not through
     * its label, `onChange` is not called, and switch and label are greyed out.
     * While true, the root and the switch wrapper have the class
     * `CcInlineSwitch-disabled`.
     * @default false
     */
    disabled?: boolean;
    children?: React.ReactElement;
    /**
     * custom styles
     */
    className?: string;
    /**
     * Class names per slot: `root` (the outer div, combined with `className`),
     * `switchWrapper` (the wrapper of switch and label) and `switch` (the
     * switch's root, MUI's `.MuiSwitch-root`)
     */
    classes?: Partial<Record<InlineSwitchClassKey, string>>;
}
/**
 * Keys of the theme's `components.CcInlineSwitch.styleOverrides`, also the
 * keys of the `classes` prop:
 * - `root`: the outer `<div>`
 * - `switchWrapper`: the wrapper of switch and label
 * - `switch`: the switch's root (MUI's `.MuiSwitch-root`)
 *
 * No slot receives an `ownerState`, and the theme has no `variants` for
 * InlineSwitch: a function override is called with the theme. The props are
 * state classes on the root instead: `CcInlineSwitch-checked` while `value`
 * is true, `CcInlineSwitch-visible` while `visible` is true and
 * `CcInlineSwitch-disabled` while `disabled` is true (the switch wrapper has
 * that one too). A theme styles a state with a selector in the root's
 * override, e.g. `root: { "&.CcInlineSwitch-checked": { … } }`.
 */
export type InlineSwitchClassKey = "switch" | "root" | "switchWrapper";
declare const InlineSwitch: (inProps: InlineSwitchProps) => React.JSX.Element;
declare const _default: typeof InlineSwitch;
export default _default;
