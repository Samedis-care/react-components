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
     */
    labels: string;
}
/**
 * i18n version of HowToBox
 * @param props The props
 * @see HowToBox
 */
export declare const HowToBoxTranslate: (props: HowToBoxTranslateProps) => React.JSX.Element;
declare const _default: React.MemoExoticComponent<(inProps: HowToBoxProps) => React.JSX.Element>;
export default _default;
