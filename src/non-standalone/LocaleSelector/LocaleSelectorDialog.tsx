import React, {
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import {
	Dialog,
	DialogContent,
	styled,
	useMediaQuery,
	useTheme,
	useThemeProps,
} from "@mui/material";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { DialogTitle, showErrorDialog } from "../Dialog";
import Loader from "../../standalone/Loader";
import ccI18n from "../../i18n";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
import useRefState from "../../utils/useRefState";

const LocaleSelectorDialogContent = React.lazy(
	() => import("./LocaleSelectorDialogContent"),
);

const StyledDialog = styled(Dialog, {
	name: "CcLocaleSelectorDialog",
	slot: "root",
})({});
// the visible box: MUI's Dialog paper renders as this element (Paper's `component`), so it
// keeps MUI's paper styles and gets these, the theme's `paper` overrides and `classes.paper`.
// MUI's styles come after these: below sm, its full-screen paper keeps the screen's width,
// also when a theme sets another width here
const PaperSlot = styled("div", {
	name: "CcLocaleSelectorDialog",
	slot: "paper",
})({
	width: 400,
});
const StyledDialogTitle = styled(DialogTitle, {
	name: "CcLocaleSelectorDialog",
	slot: "title",
})({});
const StyledDialogContent = styled(DialogContent, {
	name: "CcLocaleSelectorDialog",
	slot: "contentWrapper",
})({
	paddingLeft: 0,
	paddingRight: 0,
});
const StyledLocaleSelectorDialogContent = styled(LocaleSelectorDialogContent, {
	name: "CcLocaleSelectorDialog",
	slot: "content",
})(({ theme }) => ({
	// full screen: the list fills the height below the search box
	[theme.breakpoints.down("sm")]: {
		height: "100%",
		flexDirection: "column",
		flexWrap: "nowrap",
	},
}));

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
export type LocaleSelectorDialogClassKey =
	"root" | "paper" | "title" | "contentWrapper" | "content";

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
	 * or once a picked locale is applied (after `onChange`). It gets no arguments;
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

/**
 * Whether every namespace loaded so far has its texts for the locale or its
 * language, i.e. the UI can show the locale without falling back to English
 */
const hasTexts = (locale: string) => {
	const codes = [locale, locale.split("-")[0]];
	return ([] as string[])
		.concat(ccI18n.options.ns ?? [])
		.every((ns) => codes.some((code) => ccI18n.hasResourceBundle(code, ns)));
};

/**
 * Dialog that switches the Components-Care UI language (`ComponentsCareI18n`).
 *
 * @usage `showLocaleSelectorDialog(pushDialog, { supportedLocales: ["de", "en"] })`,
 * with `pushDialog` from `useDialogContext()`, resolves to the picked locale, or
 * `null` when the dialog is dismissed. `pushDialog(<LocaleSelectorDialog
 * supportedLocales={["de", "en"]} />)` shows it too; it then closes itself.
 * Rendered without `pushDialog`, e.g. `{open && <LocaleSelectorDialog
 * supportedLocales={["de", "en"]} onClose={() => setOpen(false)} />}`, it is open
 * while it is rendered and closes through `onClose`. Either way it needs the
 * Framework (or a `DialogContextProvider`) around it: it shows errors with
 * `showErrorDialog`.
 *
 * Below the theme's `sm` breakpoint it is full screen, from `sm` up 400px wide (the
 * `paper` slot); names that don't fit their column wrap.
 *
 * Rows: one per country and each of its official languages that Components-Care
 * ships (`de-AT`, `en-IN`, …), restricted to `supportedLocales`. Rows whose locale
 * (or else whose language) is in the browser's `navigator.languages` come first, in
 * the order of that list, then the rest by number of speakers. The row of the
 * current locale stays in its place and is marked: MUI's selected tint, a check at
 * its end and `aria-current="true"` (a locale without a region, e.g. `"de"`, marks
 * the row of its most likely region, `de-DE`). The dialog opens with the list
 * scrolled to that row, in the list's middle, as MUI's Select opens its menu at the
 * selected option; a row in view at the top leaves the list as it is. Keyboard focus
 * stays on the dialog, the list only scrolls. A search box filters the rows by their
 * names and locale code, ignoring case; every change of the query shows the matches
 * from the top of the list.
 *
 * The list renders only the rows in view. When the row with keyboard focus is
 * scrolled away (the wheel, a swipe, or the arrow, page, Home and End keys, which
 * scroll the list), the list itself takes focus and shows a focus ring: the keys
 * keep scrolling it, Tab goes on to the rows and Shift+Tab back to the search box.
 * Scrolled back to that row, the row gets focus back, unless focus moved elsewhere
 * meanwhile.
 *
 * Picking a row calls `ComponentsCareI18n.changeLanguage("<lang>-<COUNTRY>")`
 * (regional: the country also decides date and number formats). While the language
 * loads, the rows are disabled (the picked row keeps keyboard focus and its tab
 * stop, marked `aria-disabled`), and the close button, Escape and a backdrop click
 * are ignored. Once it is applied, the dialog calls `onChange` with the locale and
 * closes. A language whose texts fail to load is not applied: an error dialog shows,
 * the previous language stays, and the dialog stays open. The i18next language
 * detector stores the choice in `localStorage.i18nextLng`.
 *
 * `onChange` (and the promise of `showLocaleSelectorDialog`) reports a pick in this
 * dialog, e.g. to save it to the user's profile. `ComponentsCareI18n`'s
 * `languageChanged` event reports every language change, also the detection at
 * start-up and any other `changeLanguage` call: keep your own i18next instance in
 * sync with that. Inside the Framework, `CCI18nProvider` already loads and sets the
 * moment locale and `<html lang>`.
 *
 * @remarks `ComponentsCareI18n` leads the UI language, and your app's own i18next
 * instance follows it. To change the language from code (e.g. to the language of
 * the user's profile after login), call `ComponentsCareI18n.changeLanguage`, never
 * only your own instance's `changeLanguage`: that leaves the Components-Care widgets,
 * moment and `<html lang>` in the old language. Add something like this to your app
 * entry point, so your instance follows:
 * ```ts
 * // Components-Care i18n locale sync
 * ComponentsCareI18n.on("languageChanged", () => {
 *   void i18n.changeLanguage(getCurrentLocale(ComponentsCareI18n));
 * });
 * ```
 */
const LocaleSelectorDialog = (inProps: LocaleSelectorDialogProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcLocaleSelectorDialog",
	});
	const { className, classes, onChange, onClose, ...contentProps } = props;
	// not useCloseThisDialog, which throws: rendered without pushDialog, the dialog closes
	// through onClose
	const pushedClose = useContext(PushedDialogCloseContext);
	const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
	const [pushDialog] = useDialogContext();
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	// false once the dialog is gone: a pick that finishes loading after the dialog was
	// removed neither closes nor reports anything
	const mounted = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	// a picked language loads. The ref part guards against a dismissal or a second pick
	// landing before the re-render that disables the rows
	const {
		get: getSwitching,
		set: setSwitching,
		state: switching,
	} = useRefState<boolean>(false);
	// closes this dialog, and only this one, also when a dialog was pushed after it
	const close = useCallback(() => {
		if (!mounted.current) return;
		closeThisDialog?.();
		onCloseRef.current?.();
	}, [closeThisDialog]);
	// the close button, Escape and a backdrop click: ignored while a picked language loads,
	// so the dialog closes once the language is applied, or stays for the error
	const dismiss = useCallback(() => {
		if (getSwitching()) return;
		close();
	}, [close, getSwitching]);
	const handleSwitch = useCallback(
		async (locale: string) => {
			if (getSwitching()) return;
			// the instance itself: the hook's i18n is a snapshot of the render
			const previousLang = ccI18n.language;
			setSwitching(true);
			try {
				await ccI18n.changeLanguage(locale);
				// i18next applies a language whose texts failed to load (offline, or
				// chunks gone after a deploy) and never retries the load: switch back
				if (ccI18n.language === locale && !hasTexts(locale)) {
					if (previousLang) await ccI18n.changeLanguage(previousLang);
					throw new Error(
						ccI18n.t("non-standalone.language-switcher.load-error"),
					);
				}
				if (!mounted.current) return;
				onChangeRef.current?.(locale);
				close();
			} catch (e) {
				await showErrorDialog(pushDialog, e);
			} finally {
				if (mounted.current) setSwitching(false);
			}
		},
		[close, getSwitching, pushDialog, setSwitching],
	);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), {
		noSsr: true,
	});
	const paperClassName = classes?.paper;
	const slotProps = useMemo(
		() => ({ paper: { component: PaperSlot, className: paperClassName } }),
		[paperClassName],
	);

	const { t } = useCCTranslations();

	return (
		<StyledDialog
			open={true}
			fullScreen={fullScreen}
			onClose={dismiss}
			className={combineClassNames([className, classes?.root])}
			slotProps={slotProps}
		>
			<StyledDialogTitle onClose={dismiss} className={classes?.title}>
				{t("non-standalone.language-switcher.title")}
			</StyledDialogTitle>
			<StyledDialogContent className={classes?.contentWrapper}>
				<Suspense fallback={<Loader />}>
					<StyledLocaleSelectorDialogContent
						{...contentProps}
						className={classes?.content}
						switching={switching}
						handleSwitch={handleSwitch}
					/>
				</Suspense>
			</StyledDialogContent>
		</StyledDialog>
	);
};

export default React.memo(LocaleSelectorDialog);
