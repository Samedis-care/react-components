import React from "react";
import type { RowComponentProps } from "react-window";
import type { LocaleSelectorEntryData } from "./LocaleSelectorDialogContent";
/**
 * What the locale list passes to each of its rows (react-window's `rowProps`)
 */
export interface LocaleSelectorRowData {
    /**
     * The rows the search leaves, in list order
     */
    entries: LocaleSelectorEntryData[];
    /**
     * The current UI language without region, e.g. `"de"`
     */
    currentLanguage: string;
    /**
     * Called with the row's locale (`"<lang>-<COUNTRY>"`) when a row is activated
     */
    handleSwitch: (locale: string) => void;
    /**
     * Whether the rows are disabled: a picked language loads
     */
    disabled: boolean;
    /**
     * The locale of the row activated last, or `null`: while the rows are
     * disabled, it keeps keyboard focus and its tab stop
     */
    activated: string | null;
    /**
     * The locale of the list's active row, its one tab stop, or `null` while the
     * list shows no rows
     */
    activeKey: string | null;
}
/**
 * One row of the locale list, react-window's `rowComponent`. It is defined once
 * for the module and gets everything through `rowProps`: react-window keeps its
 * rows by the component's identity, so a component created during render would
 * replace every row with a new node, and focus with it, each time it changes.
 * react-window memoizes it itself (shallowly, by its props).
 *
 * The row's element only places the row; the option inside it (the entry's
 * button) carries the row's role, position and number of rows, so that the
 * listbox owns its options directly.
 */
declare const LocaleSelectorRow: (props: RowComponentProps<LocaleSelectorRowData>) => React.JSX.Element;
export default LocaleSelectorRow;
