import React from "react";
import { TFunction } from "i18next";
export interface HowToBoxProps {
    /**
     * Box title label
     */
    titleLabel?: React.ReactNode;
    /**
     * How to entries. An array renders one list item per element; any other
     * value renders as a single item.
     *
     * Entries that React renders as nothing (`undefined`, `null`, `""`, `false`
     * and `true`) are skipped, so a conditional step (`[a, isAdmin && b, c]`)
     * or an empty string in a translated array leaves no empty bullet. `0` is
     * an entry and shows "0", as React renders it. An element is always an
     * entry, even if its component renders nothing.
     *
     * Without entries the box renders nothing, not even its frame and title:
     * a skipped value, an empty array and an array of skipped values hide it.
     *
     * A line break `"\n"` in an entry starts a new line inside the same item,
     * which is the only way to break a line in a translated string. Other runs
     * of white space collapse to one space, as in normal text.
     */
    labels: string[] | React.ReactNode[] | string | React.ReactNode | undefined;
    className?: string;
    /**
     * Custom CSS styles
     */
    classes?: Partial<Record<HowToBoxClassKey, string>>;
}
/**
 * Keys of the theme's `components.CcHowToBox.styleOverrides`, also the keys
 * of the `classes` prop:
 * - `root`: the GroupBox `<fieldset>` frame
 * - `ul`: the list
 * - `li`: each entry
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. To style a box by its props, use theme `variants`, which apply to
 * the frame and reach the list and its entries through nested selectors.
 */
export type HowToBoxClassKey = "root" | "ul" | "li";
export interface HowToBoxTranslateProps extends Omit<HowToBoxProps, "titleLabel" | "labels"> {
    /**
     * The i18n t function
     */
    t: TFunction;
    /**
     * i18n key passed to t function
     */
    titleLabel?: string;
    /**
     * i18n key passed to t function, used in combination with return object to obtain array of strings.
     * Empty strings in that array are skipped, and a key that holds an empty array renders nothing,
     * like the `labels` of HowToBox.
     *
     * A key that holds an object gives one entry per value, in the object's key order, so a keyed
     * list (`"steps": { "download": "…", "upload": "…" }`) works like an array. Only strings and
     * numbers become entries: a group nested inside the array or object is skipped, so a key that
     * names the parent of a group (`"import"` instead of `"import.steps"`) shows only the parent's
     * own strings. A key that holds a string is one entry, and a missing key shows the key itself.
     */
    labels: string;
}
/**
 * i18n version of HowToBox
 * @param props The props
 * @see HowToBox
 */
export declare const HowToBoxTranslate: (props: HowToBoxTranslateProps) => React.JSX.Element;
/**
 * Instructions in a frame: a {@link GroupBox} titled "How it works" (or
 * `titleLabel`) around a bulleted list with one item per entry of `labels`.
 *
 * Theme: `components.CcHowToBox.defaultProps` ({@link HowToBoxProps}),
 * `styleOverrides` per {@link HowToBoxClassKey} slot, and `variants`, which
 * apply to the frame. A variant's `props` match `titleLabel` and `labels` as
 * HowToBox gets them, after the theme's default props; from
 * {@link HowToBoxTranslate} these are the translated title and entries. A
 * `props` function gets these props directly: there is no `ownerState`. A
 * variant reaches the list and its entries through nested selectors.
 *
 * @example
 * // a theme that sets the entries of boxes with their own title in bold
 * createTheme({ components: { CcHowToBox: { variants: [{
 *   props: ({ titleLabel }) => titleLabel != null,
 *   style: { "& li": { fontWeight: "bold" } },
 * }] } } });
 */
declare const _default: React.MemoExoticComponent<(inProps: HowToBoxProps) => React.JSX.Element>;
export default _default;
