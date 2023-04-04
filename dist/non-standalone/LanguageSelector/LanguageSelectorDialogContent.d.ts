import React from "react";
import { LocaleSelectorDialogProps } from "./LanguageSelectorDialog";
export interface LanguageSelectorDialogContentProps extends LocaleSelectorDialogProps {
    close: () => void;
}
export interface LanguageSelectorEntryData {
    locale: string;
    language_short: string;
    country_short: string;
    country: string;
    language: string;
    native_country: string;
    native_language: string;
}
declare const _default: React.MemoExoticComponent<(props: LanguageSelectorDialogContentProps) => JSX.Element>;
export default _default;
