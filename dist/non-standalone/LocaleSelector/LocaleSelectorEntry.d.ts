import React from "react";
import { LocaleSelectorDialogContentProps, LocaleSelectorEntryData } from "./LocaleSelectorDialogContent";
export interface LocaleSelectorEntryProps extends Omit<LocaleSelectorDialogContentProps, "handleSwitch" | "switching" | "supportedLocales"> {
    locale: LocaleSelectorEntryData;
    currentLanguage: string;
    handleSwitch: (lang: string) => void;
    disabled: boolean;
}
/**
 * Theme `styleOverrides` slots of `CcLocaleSelectorEntry`:
 * - `root`: the row button (a ListItemButton). The row of the current locale has
 *   MUI's `Mui-selected` class
 * - `container`: the flex box of flag and names
 * - `flag`: the flag
 * - `textContainer`: the grid of the names (country column, language column)
 * - `text`: each name; its `title` holds the full text
 * - `language`: the cell of the language name in the UI language; in the row of
 *   the current locale it also holds the check
 * - `currentIcon`: the check of the current locale's row, at the row's end
 */
export type LocaleSelectorEntryClassKey = "root" | "container" | "flag" | "textContainer" | "text" | "language" | "currentIcon";
declare const LocaleSelectorEntry: (inProps: LocaleSelectorEntryProps) => React.ReactElement;
export default LocaleSelectorEntry;
