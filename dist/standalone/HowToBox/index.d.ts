import React from "react";
import { TFunction } from "i18next";
export interface HowToBoxProps {
    /**
     * Box title label
     */
    titleLabel?: React.ReactNode;
    /**
     * How to entries
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
     * i18n key passed to t function, used in combination with return object to obtain array of strings
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
