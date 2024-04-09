import React from "react";
import { LocaleSelectorDialogContentProps, LocaleSelectorEntryData } from "./LocaleSelectorDialogContent";
export interface LocaleSelectorEntryProps extends Omit<LocaleSelectorDialogContentProps, "close"> {
    locale: LocaleSelectorEntryData;
    currentLanguage: string;
    handleSwitch: (lang: string) => void;
    disabled: boolean;
}
export type LocaleSelectorEntryClassKey = "root" | "container" | "imageWrapper" | "image";
declare const LocaleSelectorEntry: (inProps: LocaleSelectorEntryProps) => React.ReactElement;
export default LocaleSelectorEntry;
