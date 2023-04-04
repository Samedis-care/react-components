import React from "react";
import { AccordionProps } from "@material-ui/core";
export declare const useStyles: (props?: any) => import("@material-ui/styles").ClassNameMap<"root" | "rounded" | "noShadow" | "panelDetails" | "alwaysExpanded" | "iconButton" | "accordionPrimary" | "accordionWarning" | "accordionSuccess" | "accordionError">;
interface InfoBoxProps {
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
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
    /**
     * For which status InfoBox used
     */
    status?: "info" | "warning" | "success" | "error";
}
declare const _default: React.MemoExoticComponent<(props: InfoBoxProps) => JSX.Element>;
export default _default;
