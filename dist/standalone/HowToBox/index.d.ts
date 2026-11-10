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
     * Without entries the box renders nothing, not even its frame and title:
     * `undefined`, `null`, `""`, `false` and an empty array hide it.
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
     * A key that holds an empty array renders nothing, like an empty `labels` array of HowToBox.
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
