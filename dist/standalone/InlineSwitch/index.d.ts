import React from "react";
/**
 * Props of {@link InlineSwitch}. Theme defaults go in
 * `theme.components.CcInlineSwitch.defaultProps`.
 */
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
     * Label for switch control (only used if visible is truthy). It is also the
     * switch's accessible name; without a label, name the switch with `aria-label`
     * or `aria-labelledby`.
     */
    label?: React.ReactNode;
    /**
     * Accessible name of the switch, replacing the text of `label` as its name. Use it
     * for a switch without `label`; with a visible label, this text should contain the
     * label's words (WCAG 2.5.3 Label in Name).
     * @default none
     */
    "aria-label"?: string;
    /**
     * Ids (space separated) of the elements that name the switch, replacing the text
     * of `label` as its name. It wins over `aria-label`.
     * @default none
     */
    "aria-labelledby"?: string;
    /**
     * Ids (space separated) of the elements that describe the switch, such as its help
     * text or an error message; they become its accessible description.
     * @default none
     */
    "aria-describedby"?: string;
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
    /**
     * Attributes for the switch's slots, as on MUI's `Switch`. `input` is the
     * `<input role="switch">`: `id` and `name` give it its form identity, and it takes
     * any other input attribute. It can override `checked`, `disabled` and `role`; the
     * `aria-label`, `aria-labelledby` and `aria-describedby` props above win over it,
     * replacing its own values, and `aria-describedby` is appended to its own.
     * @default none
     */
    slotProps?: {
        input?: React.InputHTMLAttributes<HTMLInputElement>;
    };
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
/**
 * A container with an optional compact switch (35x16) and its label, floated
 * at the top right of `children`. `BaseSelector` renders every selector field
 * inside one (its `displaySwitch`/`switchLabel`), and `MultiSelectWithoutGroup`
 * one around its chips, mostly with `visible={false}`.
 *
 * The switch is controlled: pass `value` and `onChange`. The root has a 15px
 * top margin (`styled(InlineSwitch)` or `styleOverrides.root` can change it).
 */
declare const _default: typeof InlineSwitch;
export default _default;
