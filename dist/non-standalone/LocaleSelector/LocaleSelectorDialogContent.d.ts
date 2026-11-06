import React from "react";
import { LocaleSelectorDialogCommonProps } from "./LocaleSelectorDialog";
export interface LocaleSelectorDialogContentProps extends LocaleSelectorDialogCommonProps {
    /**
     * Called once the picked language is loaded and applied. Not called when its
     * texts fail to load or `changeLanguage` rejects: an error dialog shows
     * instead, and the previous language stays. The dialog passes a function that
     * closes it, and only it, and does nothing once it is closed.
     */
    close: () => void;
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
export type LocaleSelectorDialogContentClassKey = "localeList" | "noLocalesMessage";
declare const _default: React.MemoExoticComponent<(inProps: LocaleSelectorDialogContentProps) => React.JSX.Element>;
export default _default;
