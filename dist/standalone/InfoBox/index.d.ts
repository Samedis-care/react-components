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
     * Initial expanded state, read once at mount: `true` shows the message,
     * `false` shows only the header until the user opens it. Later changes
     * are ignored. While `alwaysExpanded` is `true` the box is open whatever
     * this says.
     */
    expanded: boolean;
    /**
     * `true` keeps the box open: the message is shown and the user cannot
     * collapse it. `false` is the same as not set: the box starts as
     * `expanded` says and the user opens and closes it, so a condition can be
     * passed directly (`alwaysExpanded={isLocked}`). A change after mount
     * takes effect: once it is no longer `true`, the box shows the state the
     * user last toggled to (initially `expanded`), and the user can toggle it
     * again.
     * @default false
     */
    alwaysExpanded?: boolean;
    /**
     * The message inside the info box
     */
    message: React.ReactNode;
    /**
     * Change event fired upon expansion/retraction of the info box
     * @param event The change event
     * @param expanded The new expanded state
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
