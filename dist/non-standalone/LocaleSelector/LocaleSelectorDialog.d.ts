import React from "react";
/**
 * Slots of {@link LocaleSelectorDialog}, for the `classes` prop and for the theme's
 * `components.CcLocaleSelectorDialog.styleOverrides`:
 * - `root`: the MUI Dialog root (the full-screen Modal container, the element
 *   `className` lands on, not the visible box; reach that with `& .MuiPaper-root`,
 *   which is 400px wide from the `sm` breakpoint up)
 * - `title`: the DialogTitle (the dialog's `h2`)
 * - `contentWrapper`: the MUI DialogContent (no side padding)
 * - `content`: the Grid that holds the search box and the list
 *
 * The list, its no-match message and the rows are styled through the theme only:
 * `components.CcLocaleSelectorDialogContent` and `components.CcLocaleSelectorEntry`.
 */
export type LocaleSelectorDialogClassKey = "root" | "title" | "contentWrapper" | "content";
/**
 * The props {@link LocaleSelectorDialog} passes on to its content
 */
export interface LocaleSelectorDialogCommonProps {
    /**
     * Restricts the locales the dialog offers. Each entry is either
     * - a language, e.g. `"de"`: every country where it is an official language
     *   (Germany, Austria, Switzerland, … 11 rows), or
     * - a `language-COUNTRY` locale, e.g. `"de-AT"`: that one row.
     *
     * Entries are compared exactly and case-sensitively (`"de-de"` and `"de_DE"`
     * match nothing). Only the languages Components-Care ships translations for
     * (`assets/data/supported-languages.json`: ru, fr, de, it, es, uz, en, nl) and the
     * official country/language pairs of `assets/data/country-languages.json` can
     * appear, so `"pt"` or `"en-DE"` add nothing. Entries that match nothing are
     * dropped silently; when nothing matches at all, the list is empty. The order of
     * the entries is not used (see {@link LocaleSelectorDialog} for the row order).
     *
     * Default (undefined): every country of every Components-Care language (261
     * rows), including languages your app may not have translations for, so pass
     * your app's languages. `[]` offers nothing. To set it once for the whole app,
     * use the theme: `components.CcLocaleSelectorDialog.defaultProps.supportedLocales`.
     * That is the theme where the dialog renders: for a pushed dialog the one around
     * the `DialogContextProvider` (the Framework's), not one around the `pushDialog`
     * call.
     */
    supportedLocales?: string[];
}
/**
 * Props of {@link LocaleSelectorDialog} (theme `defaultProps` take a `Partial` of
 * them)
 */
export interface LocaleSelectorDialogProps extends LocaleSelectorDialogCommonProps {
    /**
     * Called when the dialog closes: by its close button, Escape or a backdrop click,
     * or once a picked locale is applied. It gets no arguments and does not say
     * whether or which locale was picked.
     * - Shown with `pushDialog`, the dialog closes itself, then calls it.
     * - Rendered without `pushDialog`, the dialog is open while it is rendered, and
     *   `onClose` has to stop rendering it.
     *
     * Once the dialog is gone it is not called anymore, also not when a locale picked
     * before finishes loading (closing the dialog does not stop the switch). The
     * latest `onClose` is called. Default: none.
     */
    onClose?: () => void;
    /**
     * Class name of the dialog root: the full-screen MUI Modal container
     * (`.MuiDialog-root`), the same element as `classes.root`, not the visible box
     */
    className?: string;
    /**
     * Class names per slot, see {@link LocaleSelectorDialogClassKey}
     */
    classes?: Partial<Record<LocaleSelectorDialogClassKey, string>>;
}
declare const _default: React.MemoExoticComponent<(inProps: LocaleSelectorDialogProps) => React.JSX.Element>;
export default _default;
