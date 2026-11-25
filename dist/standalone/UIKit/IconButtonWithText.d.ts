import React from "react";
import { IconButtonProps, TypographyProps } from "@mui/material";
/**
 * Props of {@link IconButtonWithText}
 */
export interface IconButtonWithTextProps {
    /**
     * Props of the IconButton. An `aria-label` or `aria-labelledby` here
     * replaces the name taken from `text`, and the caption is then read as
     * text of its own.
     */
    IconButtonProps?: Omit<IconButtonProps, "children" | "onClick">;
    /**
     * Props of the caption Typography, which defaults to variant "caption" and
     * color "textSecondary"
     */
    TypographyProps?: Omit<TypographyProps, "children" | "onClick">;
    /**
     * Caption below the button, already translated: a string or any other node
     * (no interactive content). It names the button (`aria-labelledby`) and is
     * hidden from screen readers itself, so they read it once, as the button's
     * name.
     */
    text: TypographyProps["children"];
    /**
     * The icon inside the IconButton
     */
    icon: IconButtonProps["children"];
    /**
     * Called with the click event by the button, and also by a click on the
     * caption (mouse only: the caption is not focusable)
     */
    onClick?: IconButtonProps["onClick"];
}
declare const _default: React.MemoExoticComponent<(props: IconButtonWithTextProps) => React.JSX.Element>;
export default _default;
