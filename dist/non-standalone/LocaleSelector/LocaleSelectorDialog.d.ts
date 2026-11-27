import React from "react";
/**
 * Slots of {@link LocaleSelectorDialog}, for the `classes` prop and for the theme's
 * `components.CcLocaleSelectorDialog.styleOverrides`:
 * - `root`: the MUI Dialog root (the full-screen Modal container, the element
 *   `className` lands on, not the visible box)
 * - `paper`: the visible box, MUI's Dialog paper (`.MuiDialog-paper`, the element with
 *   role `dialog`). 400px wide from the `sm` breakpoint up; change the width here, e.g.
 *   `styleOverrides: { paper: { width: 600 } }`. Below `sm` it is full screen, whatever
 *   width is set here. MUI's paper styles come after this slot's, as on every MUI
 *   Dialog, including the theme's `MuiDialog.styleOverrides.paper`
 * - `title`: the DialogTitle (the dialog's `h2`)
 * - `contentWrapper`: the MUI DialogContent (no side padding)
 * - `content`: the Grid that holds the search box and the list
 *
 * The list, its no-match message and the rows are styled through the theme only:
 * `components.CcLocaleSelectorDialogContent` and `components.CcLocaleSelectorEntry`.
 */
export type LocaleSelectorDialogClassKey = "root" | "paper" | "title" | "contentWrapper" | "content";
/**
 * The props {@link LocaleSelectorDialog} passes on to its content
 */
export interface LocaleSelectorDialogCommonProps {
    /**
     * The locales the dialog offers: the languages your app has translations for,
     * e.g. `["fr", "ru", "de", "en", "nl"]`. Required, because Components-Care ships
     * languages your app may lack: picking one switches only the Components-Care
     * widgets, your app's own texts fall back (to English, say), and your app's
     * language detector stores that fallback in `localStorage.i18nextLng`, so the
     * pick is lost on the next page load.
     *
     * Each entry is either
     * - a language, e.g. `"de"`: every country where it is an official language
     *   (Germany, Austria, Switzerland, … 11 rows), or
     * - a `language-COUNTRY` locale, e.g. `"de-AT"`: that one row.
     *
     * Entries are compared ignoring case, and `_` reads as `-`: `"de-at"`, `"de_AT"`
     * and `"DE-AT"` all mean `de-AT`, `"DE"` means `de`. Only the languages
     * Components-Care ships translations for (`assets/data/supported-languages.json`:
     * ru, fr, de, it, es, uz, en, nl) and the official country/language pairs of
     * `assets/data/country-languages.json` can appear, so `"pt"` or `"en-DE"` add
     * nothing. Entries that match nothing are dropped silently; when nothing matches
     * at all, the list is empty. The order of the entries is not used (see
     * {@link LocaleSelectorDialog} for the row order). A readonly array (`as const`)
     * works too.
     *
     * `[]` offers nothing, and so does a missing value (e.g. from JavaScript).
     */
    supportedLocales: readonly string[];
}
/**
 * Props of {@link LocaleSelectorDialog} (theme `defaultProps` take a `Partial` of
 * them)
 */
export interface LocaleSelectorDialogProps extends LocaleSelectorDialogCommonProps {
    /**
     * Called with the picked locale once `ComponentsCareI18n` has applied it, right
     * before the dialog closes (and calls `onClose`). The locale is the picked row's
     * `"<lang>-<COUNTRY>"`, e.g. `"de-AT"`. Also called when the current locale is
     * picked again.
     *
     * Not called when the dialog is dismissed, nor when the picked language fails to
     * load (an error dialog shows, and the dialog stays open). Once the dialog is gone
     * it is not called anymore, also not when a locale picked before finishes loading.
     * The latest `onChange` is called. Default: none.
     */
    onChange?: (locale: string) => void;
    /**
     * Called when the dialog closes: by its close button, Escape or a backdrop click,
     * or once a picked locale is applied (after `onChange`). Escape in the search box
     * clears its query first; the next Escape closes the dialog. It gets no arguments;
     * `onChange` tells which locale was picked. While a picked language loads, the
     * close button, Escape and a backdrop click are ignored.
     * - Shown with `pushDialog`, the dialog closes itself, then calls it.
     * - Rendered without `pushDialog`, the dialog is open while it is rendered, and
     *   `onClose` has to stop rendering it.
     *
     * Once the dialog is gone it is not called anymore, also not when a locale picked
     * before finishes loading (removing the dialog does not stop the switch). The
     * latest `onClose` is called. Default: none.
     */
    onClose?: () => void;
    /**
     * Class name of the dialog root: the full-screen MUI Modal container
     * (`.MuiDialog-root`), the same element as `classes.root`, not the visible box
     * (that is `classes.paper`)
     */
    className?: string;
    /**
     * Class names per slot, see {@link LocaleSelectorDialogClassKey}
     */
    classes?: Partial<Record<LocaleSelectorDialogClassKey, string>>;
}
declare const _default: React.MemoExoticComponent<(inProps: LocaleSelectorDialogProps) => React.JSX.Element>;
export default _default;
