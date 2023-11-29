import React from "react";
import { LanguageSelectorDialogContentProps, LanguageSelectorEntryData } from "./LanguageSelectorDialogContent";
export interface LanguageSelectorEntryProps extends Omit<LanguageSelectorDialogContentProps, "close"> {
    locale: LanguageSelectorEntryData;
    currentLanguage: string;
    handleSwitch: (lang: string) => void;
    disabled: boolean;
}
declare const LanguageSelectorEntry: (props: LanguageSelectorEntryProps) => React.ReactElement;
export default LanguageSelectorEntry;
