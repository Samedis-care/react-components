import React, {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Box,
	Grid,
	InputAdornment,
	styled,
	useThemeProps,
} from "@mui/material";
import { List, useDynamicRowHeight, useListRef } from "react-window";
import supportedLanguages from "../../assets/data/supported-languages.json";
import countryLanguages from "../../assets/data/country-languages.json";
import LocaleSelectorRow, { LocaleSelectorRowData } from "./LocaleSelectorRow";
import { Search as SearchIcon } from "@mui/icons-material";
import useCCTranslations, {
	useCCLocaleSwitcherTranslations,
} from "../../utils/useCCTranslations";
import useCurrentLocale, {
	useCurrentLanguage,
} from "../../utils/useCurrentLocale";
import sortByLocaleRelevance from "../../utils/sortByLocaleRelevance";
import TextFieldWithHelp from "../../standalone/UIKit/TextFieldWithHelp";
import { LocaleSelectorDialogCommonProps } from "./LocaleSelectorDialog";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useListFocusKeeper, {
	ListFocusKeeperContext,
} from "./useListFocusKeeper";
import visuallyHidden from "../../utils/internal/visuallyHidden";
import rowLocaleOf from "./rowLocaleOf";
import searchKey from "../../utils/internal/searchKey";

export interface LocaleSelectorDialogContentProps extends LocaleSelectorDialogCommonProps {
	/**
	 * Called with the row's locale (`"<lang>-<COUNTRY>"`) when a row is picked. The
	 * dialog switches the language, reports the pick and closes.
	 */
	handleSwitch: (locale: string) => void;
	/**
	 * Whether a picked language loads: the rows are disabled, the arrow, page,
	 * Home and End keys move nowhere, and a loader covers the list. The row
	 * picked last keeps keyboard focus and stays the list's tab stop
	 * (`aria-disabled`)
	 */
	switching: boolean;
	className?: string;
}

export interface LocaleSelectorEntryData {
	locale: string;
	language_short: string;
	country_short: string;
	country: string;
	language: string;
	native_country: string;
	native_language: string;
}

interface LocaleSelectorEntryFilterData extends LocaleSelectorEntryData {
	/**
	 * The locale in lower case, as `rowLocaleOf` gives the current one
	 */
	locale_lower: string;
	/**
	 * The locale and the four names as the search compares them (`searchKey`)
	 */
	search_keys: string[];
}

const LocaleList = styled(Grid, {
	name: "CcLocaleSelectorDialogContent",
	slot: "localeList",
})(({ theme }) => ({
	height: "calc(75vh - 128px)",
	width: "100%",
	// the dialog is full screen below sm: fill it
	[theme.breakpoints.down("sm")]: {
		height: "auto",
		flex: "1 1 auto",
		minHeight: 70,
	},
	// the list holds keyboard focus while the focused row is scrolled out of the
	// rendered range; inside its edges, because the dialog content clips its sides
	'& [role="listbox"]:focus-visible': {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
	},
}));

const NoLocalesMessage = styled("div", {
	name: "CcLocaleSelectorDialogContent",
	slot: "noLocalesMessage",
})({
	textAlign: "center",
	width: "100%",
});

// states the number of rows the search leaves, or that none match (a live
// region must exist before its text changes, so it is always rendered)
const SearchStatus = styled("div", {
	name: "CcLocaleSelectorDialogContent",
	slot: "searchStatus",
})(visuallyHidden);

/**
 * Theme style slots of LocaleSelectorDialogContent
 * (`components.CcLocaleSelectorDialogContent.styleOverrides.<slot>`):
 * - `localeList`: the area below the search box that holds the rows. It also
 *   draws the list's keyboard focus ring (`& [role="listbox"]:focus-visible`),
 *   shown while the list holds focus for a row that is scrolled out of view
 * - `noLocalesMessage`: the message that replaces the rows when none match
 * - `searchStatus`: the visually hidden status region (`role="status"`) that
 *   states the number of rows, or that none match the search
 */
export type LocaleSelectorDialogContentClassKey =
	"localeList" | "noLocalesMessage" | "searchStatus";

/**
 * A locale or language as `supportedLocales` entries are compared: lower case, with
 * `_` read as `-` (language tags ignore case; `de_DE` is the POSIX spelling)
 */
const normalizeLocale = (locale: string) =>
	locale.replace(/_/g, "-").toLowerCase();

/**
 * A range of rows, as react-window reports it (indexes, both included)
 */
interface RowRange {
	startIndex: number;
	stopIndex: number;
}

/**
 * Whether the element has focus from the keyboard (or from a script after a
 * keyboard action), not from a click
 */
const isFocusVisible = (element: HTMLElement) => {
	try {
		return element.matches(":focus-visible");
	} catch {
		// a browser without :focus-visible
		return true;
	}
};

const SearchInputProps = {
	startAdornment: (
		<InputAdornment position={"start"}>
			<SearchIcon />
		</InputAdornment>
	),
};

const LocaleSelectorDialogContent = (
	inProps: LocaleSelectorDialogContentProps,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcLocaleSelectorDialogContent",
	});
	const {
		supportedLocales: appSupportedLocales,
		className,
		handleSwitch,
		switching,
	} = props;

	const [filter, setFilter] = useState("");
	// the query as the search compares it: without the blanks around it, in lower
	// case, without accents and with one kind of apostrophe
	const query = searchKey(filter);
	const { t } = useCCTranslations();
	const { t: tLocale } = useCCLocaleSwitcherTranslations();
	const currentLang = useCurrentLanguage();
	const currentLocale = useCurrentLocale();
	const listRef = useListRef(null);
	// true once the list was scrolled to the current row, or the user searched before
	const openedAtCurrentRow = useRef(false);

	const supportedLangs = supportedLanguages;
	const countryLanguageMapping = countryLanguages as Record<string, string[]>;

	// the entries of supportedLocales as the rows' locales and languages are compared;
	// none at all (a JavaScript caller) offers nothing, as [] does
	const supported = useMemo(
		() => new Set((appSupportedLocales ?? []).map(normalizeLocale)),
		[appSupportedLocales],
	);
	const data: LocaleSelectorEntryFilterData[] = useMemo(
		() =>
			Object.entries(countryLanguageMapping)
				.map(
					([country, langs]) =>
						[
							country,
							langs.filter((lang) => supportedLangs.includes(lang)),
						] as [string, string[]],
				)
				.map(([country, langs]) => langs.map((lang) => lang + "-" + country))
				.flat()
				.filter(
					(locale) =>
						supported.has(locale.toLowerCase()) ||
						supported.has(locale.split("-")[0]),
				)
				.map((locale) => ({
					locale: locale,
					language_short: locale.split("-")[0],
					country_short: locale.split("-")[1],
					country: tLocale(locale + ".country"),
					language: tLocale(locale + ".language"),
					native_country: tLocale(locale + ".native_country"),
					native_language: tLocale(locale + ".native_language"),
				}))
				.map((entry) => ({
					...entry,
					locale_lower: entry.locale.toLowerCase(),
					search_keys: [
						entry.locale,
						entry.country,
						entry.language,
						entry.native_country,
						entry.native_language,
					].map(searchKey),
				}))
				.sort((a, b) => sortByLocaleRelevance(a.locale, b.locale)),
		[countryLanguageMapping, supported, supportedLangs, tLocale],
	);

	const filteredData = useMemo(
		() =>
			data.filter((entry) =>
				entry.search_keys.some((key) => key.includes(query)),
			),
		[data, query],
	);

	const currentRow = useMemo(() => rowLocaleOf(currentLocale), [currentLocale]);
	// the locale of the list's active row, its one tab stop (a roving tabindex):
	// the row focused last; when the dialog opens, the current locale's row; after
	// a search (null), the first row. A locale the rows lack means the first row
	const [activeKey, setActiveKey] = useState<string | null>(
		() =>
			data.find((entry) => entry.locale_lower === currentRow)?.locale ?? null,
	);
	const activeIndex = useMemo(
		() =>
			Math.max(
				0,
				filteredData.findIndex((entry) => entry.locale === activeKey),
			),
		[filteredData, activeKey],
	);

	const handleFilterChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			setFilter(evt.target.value);
			// a changed query shows its matches from the top, wherever the list was
			// scrolled (to the current row on open, or by the user), and the first
			// match is the list's tab stop
			openedAtCurrentRow.current = true;
			setActiveKey(null);
			listRef.current?.scrollToRow({ index: 0, align: "start" });
		},
		[listRef],
	);

	// the row activated last: while the language it picked loads, it keeps
	// keyboard focus and its tab stop, the other rows are disabled
	const [activated, setActivated] = useState<string | null>(null);
	const handleRowSwitch = useCallback(
		(locale: string) => {
			setActivated(locale);
			// a click in a browser that doesn't focus what is clicked (Safari)
			setActiveKey(locale);
			handleSwitch(locale);
		},
		[handleSwitch],
	);
	// the rows get all they show through rowProps: react-window re-renders them
	// when one changes, and keeps their nodes
	const rowProps = useMemo<LocaleSelectorRowData>(
		() => ({
			entries: filteredData,
			currentLanguage: currentLang,
			handleSwitch: handleRowSwitch,
			disabled: switching,
			activated,
			activeKey: filteredData[activeIndex]?.locale ?? null,
		}),
		[
			filteredData,
			currentLang,
			handleRowSwitch,
			switching,
			activated,
			activeIndex,
		],
	);

	// names wrap, so each row is as tall as its text: react-window measures the
	// rendered rows (70px until then). It caches the heights by index, so the
	// cache starts over when other rows or other names fill the list
	const rowHeightKey = useMemo(
		() => currentLang + ":" + filteredData.map((e) => e.locale).join(","),
		[currentLang, filteredData],
	);
	const rowHeight = useDynamicRowHeight({
		defaultRowHeight: 70,
		key: rowHeightKey,
	});

	// the dialog opens with the list scrolled to the current locale's row, as MUI's
	// Select opens its menu at the selected option; focus stays where it is. It
	// waits for the list's height, so that a row already in view at the top leaves
	// the list as it is
	const [listSized, setListSized] = useState(false);
	const handleListResize = useCallback((size: { height: number }) => {
		if (size.height > 0) setListSized(true);
	}, []);
	useLayoutEffect(() => {
		if (!listSized || openedAtCurrentRow.current) return;
		openedAtCurrentRow.current = true;
		const index = filteredData.findIndex(
			(entry) => entry.locale_lower === currentRow,
		);
		// "smart": not at all while the row is in view, else to the list's middle
		if (index > 0) listRef.current?.scrollToRow({ index, align: "smart" });
	}, [listSized, filteredData, currentRow, listRef]);

	// react-window renders only the rows in view: keyboard focus waits on the list
	// while the focused row is scrolled away, and goes back to it once it is there
	const getListElement = useCallback(
		() => listRef.current?.element ?? null,
		[listRef],
	);
	const {
		keeper: focusKeeper,
		onFocus: keepFocus,
		onBlur: handleListBlur,
		focusRow,
		rowKeyOf,
	} = useListFocusKeeper(getListElement);

	// the rows react-window renders (with the overscan) and the ones in view
	const [renderedRows, setRenderedRows] = useState<RowRange | null>(null);
	const visibleRows = useRef<RowRange>({ startIndex: 0, stopIndex: 0 });
	const handleRowsRendered = useCallback((visible: RowRange, all: RowRange) => {
		visibleRows.current = visible;
		setRenderedRows((prev) =>
			prev?.startIndex === all.startIndex && prev.stopIndex === all.stopIndex
				? prev
				: all,
		);
	}, []);
	// the active row is the tab stop while it is rendered; while it is scrolled
	// away, the list is, and passes focus on to it
	const activeRendered =
		renderedRows !== null &&
		activeIndex >= renderedRows.startIndex &&
		activeIndex <= renderedRows.stopIndex;

	/**
	 * Makes a row the active one, scrolls it into view and focuses it, at once
	 * or once it is rendered
	 */
	const moveTo = useCallback(
		(index: number, align: "auto" | "smart") => {
			const entry = filteredData[index];
			if (!entry) return;
			setActiveKey(entry.locale);
			listRef.current?.scrollToRow({ index, align });
			focusRow(entry.locale);
		},
		[filteredData, listRef, focusRow],
	);

	const handleListFocus = useCallback(
		(evt: React.FocusEvent<HTMLElement>) => {
			keepFocus(evt);
			// a focused row is the active one, whatever focused it (a click, the
			// keys, the focus keeper)
			const key = rowKeyOf(evt.target);
			if (key !== null) {
				setActiveKey(key);
				return;
			}
			if (evt.target !== evt.currentTarget) return;
			// the list itself, the tab stop while the active row is scrolled away,
			// was reached with Tab or Shift+Tab: the active row takes focus, as in a
			// listbox. Not when the focus keeper or a window that gets focus back
			// focuses it (nothing was focused before), nor for a click on its empty
			// part or its scrollbar (no keyboard focus)
			const from = evt.relatedTarget;
			if (!(from instanceof Node) || evt.currentTarget.contains(from)) return;
			if (!isFocusVisible(evt.currentTarget)) return;
			moveTo(activeIndex, "smart");
		},
		[keepFocus, rowKeyOf, moveTo, activeIndex],
	);

	// the listbox keys of the WAI-ARIA Authoring Practices; Enter and Space pick
	// the focused row (the row's own button behaviour)
	const handleListKeyDown = useCallback(
		(evt: React.KeyboardEvent<HTMLElement>) => {
			if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;
			const last = filteredData.length - 1;
			// the rows in view, less one, so a row of the last page stays in view
			const page = Math.max(
				1,
				visibleRows.current.stopIndex - visibleRows.current.startIndex,
			);
			let index: number;
			switch (evt.key) {
				case "ArrowDown":
					index = activeIndex + 1;
					break;
				case "ArrowUp":
					index = activeIndex - 1;
					break;
				case "PageDown":
					index = activeIndex + page;
					break;
				case "PageUp":
					index = activeIndex - page;
					break;
				case "Home":
					index = 0;
					break;
				case "End":
					index = last;
					break;
				default:
					return;
			}
			// the keys move between the rows, they don't scroll the list
			evt.preventDefault();
			// while a picked language loads, the picked row keeps focus
			if (switching || last < 0) return;
			moveTo(Math.min(Math.max(index, 0), last), "auto");
		},
		[filteredData, activeIndex, switching, moveTo],
	);

	const searchLabel = t("standalone.data-grid.header.search");
	const searchSlotProps = useMemo(
		() => ({
			input: SearchInputProps,
			htmlInput: { "aria-label": searchLabel },
		}),
		[searchLabel],
	);

	return (
		<Grid container className={className}>
			<Grid size={12}>
				<Box sx={{ px: 2, pb: 1 }}>
					<TextFieldWithHelp
						value={filter}
						onChange={handleFilterChange}
						fullWidth
						placeholder={searchLabel}
						slotProps={searchSlotProps}
					/>
					<SearchStatus role={"status"}>
						{filteredData.length === 0
							? t("non-standalone.language-switcher.no-locales")
							: t("non-standalone.language-switcher.results", {
									COUNT: filteredData.length,
								})}
					</SearchStatus>
				</Box>
			</Grid>
			<LocaleList size={12}>
				<FormLoaderOverlay visible={switching} />
				{filteredData.length === 0 ? (
					<NoLocalesMessage>
						{t("non-standalone.language-switcher.no-locales")}
					</NoLocalesMessage>
				) : (
					<ListFocusKeeperContext.Provider value={focusKeeper}>
						<List
							listRef={listRef}
							role={"listbox"}
							aria-label={t("non-standalone.language-switcher.title")}
							// focusable for the focus keeper; the tab stop only while the
							// active row is scrolled away
							tabIndex={activeRendered ? -1 : 0}
							onFocus={handleListFocus}
							onBlur={handleListBlur}
							onKeyDown={handleListKeyDown}
							onResize={handleListResize}
							onRowsRendered={handleRowsRendered}
							overscanCount={2}
							rowCount={filteredData.length}
							rowHeight={rowHeight}
							rowComponent={LocaleSelectorRow}
							rowProps={rowProps}
						/>
					</ListFocusKeeperContext.Provider>
				)}
			</LocaleList>
		</Grid>
	);
};

export default React.memo(LocaleSelectorDialogContent);
