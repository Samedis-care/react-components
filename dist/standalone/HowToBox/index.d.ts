import React from "react";
import { ClassNameMap } from "@mui/styles/withStyles";
import { TFunction } from "i18next";
export interface HowToBoxProps {
    /**
     * Box title label
     */
    titleLabel?: React.ReactNode;
    /**
     * How to entries
     */
    labels: string[] | React.ReactNodeArray | string | React.ReactNode | undefined;
    /**
     * Custom CSS styles
     */
    classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
}
declare const useStyles: (props?: any) => ClassNameMap<"groupBox">;
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
export declare const HowToBoxTranslate: (props: HowToBoxTranslateProps) => JSX.Element;
declare const _default: React.MemoExoticComponent<(props: HowToBoxProps) => JSX.Element>;
export default _default;