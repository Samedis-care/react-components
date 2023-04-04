import React from "react";
import { LanguageSelectorDialogContentProps, LanguageSelectorEntryData } from "./LanguageSelectorDialogContent";
export interface LanguageSelectorEntryProps extends LanguageSelectorDialogContentProps {
    locale: LanguageSelectorEntryData;
    currentLanguage: string;
}
declare const LanguageSelectorEntry: (props: LanguageSelectorEntryProps) => React.ReactElement;
export default LanguageSelectorEntry;
