import React from "react";
import { AccordionProps } from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";
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
     * Is the info box expanded by default
     */
    expanded: boolean;
    /**
     * Is the InfoBox force expanded or force collapsed?
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
    headingVariant?: Variant;
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
