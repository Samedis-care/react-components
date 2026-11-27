import React from "react";
import { LocaleSelectorDialogContentProps, LocaleSelectorEntryData } from "./LocaleSelectorDialogContent";
export interface LocaleSelectorEntryProps extends Omit<LocaleSelectorDialogContentProps, "handleSwitch" | "switching" | "supportedLocales"> {
    locale: LocaleSelectorEntryData;
    currentLanguage: string;
    handleSwitch: (lang: string) => void;
    disabled: boolean;
    /**
     * Whether the row stays focusable while it is `disabled`: it keeps keyboard
     * focus and, as the `active` row, its tab stop, says it is disabled with
     * `aria-disabled`, and ignores Enter, Space and clicks. It keeps the look of an
     * enabled row, so that its focus ring keeps its contrast. The list sets it on
     * the row picked last, while that language loads. Default: `false`
     */
    focusableWhenDisabled?: boolean;
    /**
     * Whether the row is the list's active row, its one tab stop
     * (`tabindex="0"`; the other rows have `tabindex="-1"` and are reached with
     * the arrow, page, Home and End keys). A disabled row is no tab stop, unless
     * it is `focusableWhenDisabled`. Default: `false`
     */
    active?: boolean;
    /**
     * The row's 1-based position among the rows the search leaves, its
     * `aria-posinset` (the list renders only the rows in view). The list sets
     * it. Default: none (no `aria-posinset`)
     */
    position?: number;
    /**
     * The number of rows the search leaves, the row's `aria-setsize`. The list
     * sets it. Default: none (no `aria-setsize`)
     */
    count?: number;
}
/**
 * Theme `styleOverrides` slots of `CcLocaleSelectorEntry`:
 * - `root`: the row, an option of the list's listbox (a ListItemButton with
 *   `role="option"`). The row of the current locale has MUI's `Mui-selected`
 *   class and `aria-selected="true"`
 * - `container`: the flex box of flag and names
 * - `flag`: the flag
 * - `textContainer`: the grid of the names (country column, language column)
 * - `text`: each name; its `title` holds the full text. The names in the row's
 *   own language (shown when it isn't the UI language) carry its `lang`
 * - `language`: the cell of the language name in the UI language; in the row of
 *   the current locale it also holds the check
 * - `currentIcon`: the check of the current locale's row, at the row's end
 */
export type LocaleSelectorEntryClassKey = "root" | "container" | "flag" | "textContainer" | "text" | "language" | "currentIcon";
declare const LocaleSelectorEntry: (inProps: LocaleSelectorEntryProps) => React.ReactElement;
export default LocaleSelectorEntry;
