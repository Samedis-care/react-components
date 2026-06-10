import React from "react";
import { LocaleSelectorDialogCommonProps } from "./LocaleSelectorDialog";
export interface LocaleSelectorDialogContentProps extends LocaleSelectorDialogCommonProps {
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
