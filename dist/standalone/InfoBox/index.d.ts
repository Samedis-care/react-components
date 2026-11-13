import React from "react";
import { AccordionProps } from "@mui/material";
import { TypographyVariant } from "@mui/material/styles";
export interface InfoBoxSummaryOwnerState {
    status?: "info" | "warning" | "success" | "error";
    alwaysExpanded: boolean;
}
export type InfoBoxClassKey = "root" | "summary" | "summaryRoot" | "iconButton" | "heading" | "details" | "detailsText";
export interface InfoBoxProps {
    /**
     * Title of the info box
     */
    heading: string;
    /**
     * Controlled expanded state, like MUI Accordion's `expanded`: `true`
     * shows the message, `false` shows only the header. The box shows this
     * value and follows every change of it. A click on the header does not
     * change it by itself: it calls `onChange` with the requested state, so
     * pass that back (`onChange={(_, next) => setOpen(next)}`) to let the
     * user toggle the box.
     *
     * Leave it unset (`undefined`) for a box the user toggles on its own,
     * starting at `defaultExpanded`. Decide at mount: switching between set
     * and unset later logs a MUI error in development; a value set later is
     * ignored, and removing the value closes the box.
     * While `alwaysExpanded` is `true` the box is open whatever this says.
     */
    expanded?: boolean;
    /**
     * Initial expanded state of a box without `expanded` (uncontrolled), like
     * MUI Accordion's `defaultExpanded`: `true` shows the message, `false`
     * only the header, until the user toggles it. Read once at mount: a later
     * change is ignored and logs a MUI error in development. Ignored while
     * `expanded` is set.
     * @default false
     */
    defaultExpanded?: boolean;
    /**
     * `true` keeps the box open: the message is shown and the user cannot
     * collapse it. `false` is the same as not set: the box shows `expanded`,
     * or, without it, the user opens and closes it starting at
     * `defaultExpanded`, so a condition can be passed directly
     * (`alwaysExpanded={isLocked}`). A change after mount takes effect: once
     * it is no longer `true`, the box shows `expanded`, or, without it, the
     * state the user last toggled to (initially `defaultExpanded`), and the
     * user can toggle it again.
     * @default false
     */
    alwaysExpanded?: boolean;
    /**
     * The message inside the info box
     */
    message: React.ReactNode;
    /**
     * Called when the user toggles the header (a click, or Enter or Space on
     * it), with the requested expanded state. Not called when `expanded`
     * changes. With `expanded` set, the box changes only once that new state
     * is passed back into `expanded`.
     * @param event The click event
     * @param expanded The requested expanded state: `true` to open the box
     */
    onChange?: AccordionProps["onChange"];
    /**
     * typography variant to use for heading
     * @default "caption"
     */
    headingVariant?: TypographyVariant;
    /**
     * custom class name to apply to root
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<InfoBoxClassKey, string>>;
    /**
     * For which status InfoBox used
     */
    status?: "info" | "warning" | "success" | "error";
}
declare const _default: React.MemoExoticComponent<(inProps: InfoBoxProps) => React.JSX.Element>;
export default _default;
