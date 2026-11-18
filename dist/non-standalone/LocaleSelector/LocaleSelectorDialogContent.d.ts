import React from "react";
import { LocaleSelectorDialogCommonProps } from "./LocaleSelectorDialog";
export interface LocaleSelectorDialogContentProps extends LocaleSelectorDialogCommonProps {
    /**
     * Called with the row's locale (`"<lang>-<COUNTRY>"`) when a row is picked. The
     * dialog switches the language, reports the pick and closes.
     */
    handleSwitch: (locale: string) => void;
    /**
     * Whether a picked language loads: the rows are disabled, and a loader covers
     * the list
     */
    switching: boolean;
    className?: string;
}
export interface LocaleSelectorEntryData {
    locale: string;
    language_short: string;
    country_short: string;
    country: string;
    language: string;
    native_country: string;
    native_language: string;
}
/**
 * Theme style slots of LocaleSelectorDialogContent
 * (`components.CcLocaleSelectorDialogContent.styleOverrides.<slot>`):
 * - `localeList`: the area below the search box that holds the rows
 * - `noLocalesMessage`: the message that replaces the rows when none match
 * - `searchStatus`: the visually hidden status region (`role="status"`) that
 *   states the number of rows, or that none match the search
 */
export type LocaleSelectorDialogContentClassKey = "localeList" | "noLocalesMessage" | "searchStatus";
declare const _default: React.MemoExoticComponent<(inProps: LocaleSelectorDialogContentProps) => React.JSX.Element>;
export default _default;
