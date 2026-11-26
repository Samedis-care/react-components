import React, {
	Suspense,
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
import {
	List,
	RowComponentProps,
	useDynamicRowHeight,
	useListRef,
} from "react-window";
import supportedLanguages from "../../assets/data/supported-languages.json";
import countryLanguages from "../../assets/data/country-languages.json";
import LocaleSelectorEntry from "./LocaleSelectorEntry";
import { Search as SearchIcon } from "@mui/icons-material";
import useCCTranslations, {
	useCCLocaleSwitcherTranslations,
} from "../../utils/useCCTranslations";
import useCurrentLocale, {
	useCurrentLanguage,
} from "../../utils/useCurrentLocale";
import sortByLocaleRelevance from "../../utils/sortByLocaleRelevance";
import TextFieldWithHelp from "../../standalone/UIKit/TextFieldWithHelp";
import Loader from "../../standalone/Loader";
import { LocaleSelectorDialogCommonProps } from "./LocaleSelectorDialog";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useListFocusKeeper, {
	ListFocusKeeperContext,
} from "./useListFocusKeeper";
import visuallyHidden from "../../utils/internal/visuallyHidden";
import rowLocaleOf from "./rowLocaleOf";

export interface LocaleSelectorDialogContentProps extends LocaleSelectorDialogCommonProps {
	/**
	 * Called with the row's locale (`"<lang>-<COUNTRY>"`) when a row is picked. The
	 * dialog switches the language, reports the pick and closes.
	 */
	handleSwitch: (locale: string) => void;
	/**
	 * Whether a picked language loads: the rows are disabled, and a loader covers
	 * the list
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
	locale_lower: string;
	country_lower: string;
	language_lower: string;
	native_country_lower: string;
	native_language_lower: string;
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
	'& [role="list"]:focus-visible': {
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
 *   draws the list's keyboard focus ring (`& [role="list"]:focus-visible`), shown
 *   while the list holds focus for a row that is scrolled out of view
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
	const lowercaseFilter = filter.toLowerCase();
	const { t } = useCCTranslations();
	const { t: tLocale } = useCCLocaleSwitcherTranslations();
	const currentLang = useCurrentLanguage();
	const currentLocale = useCurrentLocale();
	const listRef = useListRef(null);
	// true once the list was scrolled to the current row, or the user searched before
	const openedAtCurrentRow = useRef(false);
	const handleFilterChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			setFilter(evt.target.value);
			// a changed query shows its matches from the top, wherever the list was
			// scrolled (to the current row on open, or by the user)
			openedAtCurrentRow.current = true;
			listRef.current?.scrollToRow({ index: 0, align: "start" });
		},
		[listRef],
	);

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
					country_lower: entry.country.toLowerCase(),
					language_lower: entry.language.toLowerCase(),
					native_country_lower: entry.native_country.toLowerCase(),
					native_language_lower: entry.native_language.toLowerCase(),
				}))
				.sort((a, b) => sortByLocaleRelevance(a.locale, b.locale)),
		[countryLanguageMapping, supported, supportedLangs, tLocale],
	);

	const filteredData = useMemo(
		() =>
			data.filter(
				(entry) =>
					entry.locale_lower.includes(lowercaseFilter) ||
					entry.country_lower.includes(lowercaseFilter) ||
					entry.language_lower.includes(lowercaseFilter) ||
					entry.native_country_lower.includes(lowercaseFilter) ||
					entry.native_language_lower.includes(lowercaseFilter),
			),
		[data, lowercaseFilter],
	);

	const LocaleEntryRenderer = useCallback(
		(entryProps: RowComponentProps<{ filteredData: typeof filteredData }>) => {
			const locale = entryProps.filteredData[entryProps.index];

			return (
				<div style={entryProps.style} {...entryProps.ariaAttributes}>
					<Suspense fallback={<Loader />}>
						<LocaleSelectorEntry
							locale={locale}
							currentLanguage={currentLang}
							handleSwitch={handleSwitch}
							disabled={switching}
							key={locale.locale}
						/>
					</Suspense>
				</div>
			);
		},
		[currentLang, handleSwitch, switching],
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
	const currentRow = useMemo(() => rowLocaleOf(currentLocale), [currentLocale]);
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
		onFocus: handleListFocus,
		onBlur: handleListBlur,
	} = useListFocusKeeper(getListElement);

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
							// focusable for the focus keeper, but no tab stop of its own
							tabIndex={-1}
							onFocus={handleListFocus}
							onBlur={handleListBlur}
							onResize={handleListResize}
							overscanCount={2}
							rowCount={filteredData.length}
							rowHeight={rowHeight}
							rowComponent={LocaleEntryRenderer}
							rowProps={{ filteredData }}
						/>
					</ListFocusKeeperContext.Provider>
				)}
			</LocaleList>
		</Grid>
	);
};

export default React.memo(LocaleSelectorDialogContent);
