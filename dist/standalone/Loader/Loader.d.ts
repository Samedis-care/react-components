import React from "react";
import { TypographyProps } from "@mui/material";
export interface LoaderProps {
    /**
     * Optional status message to show
     */
    text?: string;
    /**
     * Typography variant of `text`: any variant MUI's `Typography` takes,
     * including `"inherit"` and the variants a theme adds through
     * `TypographyPropsVariantOverrides`. Ignored without `text`.
     * @default "h6"
     */
    typographyVariant?: TypographyProps["variant"];
}
/**
 * Theme style slots of {@link Loader}
 * (`components.CcLoader.styleOverrides.<slot>`):
 * - `root`: the outermost box, 100% of the parent's width and height, a flex
 *   column that centers `innerWrapper` vertically. Theme
 *   `components.CcLoader.variants` apply to it. They match the Loader's `text`
 *   and `typographyVariant` after theme `defaultProps`, with
 *   `typographyVariant` `"h6"` when it is not set.
 * - `innerWrapper`: the box holding text and spinner, as tall as they are
 * - `outerProgressWrapper`: the 70px tall box below the text
 * - `innerProgressWrapper`: the box that centers the spinner
 * - `progress`: the MUI `CircularProgress`
 */
export type LoaderClassKey = "root" | "innerWrapper" | "outerProgressWrapper" | "innerProgressWrapper" | "progress";
/**
 * Indeterminate loading indicator: a MUI `CircularProgress` with an optional
 * status `text` above it, centered in its parent.
 *
 * Layout: in a parent with a definite height (a fixed height, or a box that a
 * flex or grid layout stretches) it fills the parent and centers text and
 * spinner in it. In a parent of automatic height it is as tall as its
 * content: 70px for the spinner, plus the text.
 *
 * Theme: `components.CcLoader.defaultProps` ({@link LoaderProps}),
 * `components.CcLoader.styleOverrides` per {@link LoaderClassKey} slot, and
 * `components.CcLoader.variants`, which apply to the `root` slot.
 */
declare const _default: React.MemoExoticComponent<(inProps: LoaderProps) => React.JSX.Element>;
export default _default;
