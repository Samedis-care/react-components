import React, { Suspense, useCallback, useState } from "react";
import { Box, Grid, InputAdornment } from "@material-ui/core";
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer";
import { List } from "react-virtualized/dist/commonjs/List";
import supportedLanguages from "../../assets/data/supported-languages.json";
import countryLanguages from "../../assets/data/country-languages.json";
import localeRelevance from "../../assets/data/locale-relevance.json";
import LanguageSelectorEntry from "./LanguageSelectorEntry";
import { Search as SearchIcon } from "@material-ui/icons";
import { ListRowProps } from "react-virtualized/dist/es/List";
import { makeStyles } from "@material-ui/core/styles";
import useCCTranslations, {
	useCCLocaleSwitcherTranslations,
} from "../../utils/useCCTranslations";
import TextFieldWithHelp from "../../standalone/UIKit/TextFieldWithHelp";
import Loader from "../../standalone/Loader";

export interface LanguageSelectorDialogContentProps {
	close: () => void;
}

export interface LanguageSelectorEntryData {
	locale: string;
	language_short: string;
	country_short: string;
	country: string;
	language: string;
	native_country: string;
	native_language: string;
}

interface LanguageSelectorEntryFilterData extends LanguageSelectorEntryData {
	locale_lower: string;
	country_lower: string;
	language_lower: string;
	native_country_lower: string;
	native_language_lower: string;
}

const useStyles = makeStyles(
	{
		localeList: {
			height: "calc(75vh - 128px)",
			width: 200,
		},
		noLocalesMessage: {
			textAlign: "center",
			width: "100%",
		},
	},
	{ name: "CcLanguageSelectorDialogContent" }
);

const SearchInputProps = {
	startAdornment: (
		<InputAdornment position={"start"}>
			<SearchIcon />
		</InputAdornment>
	),
};

const LanguageSelectorDialogContent = (
	props: LanguageSelectorDialogContentProps
) => {
	const [filter, setFilter] = useState("");
	const lowercaseFilter = filter.toLowerCase();
	const { i18n, t } = useCCTranslations();
	const { t: tLocale } = useCCLocaleSwitcherTranslations();
	const currentLang = i18n.language.substring(0, 2);
	const classes = useStyles();
	const handleFilterChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			setFilter(evt.target.value);
		},
		[setFilter]
	);

	const supportedLangs = supportedLanguages;
	const countryLanguageMapping = countryLanguages as Record<string, string[]>;

	const data: LanguageSelectorEntryFilterData[] = React.useMemo(
		() =>
			Object.entries(countryLanguageMapping)
				.map(
					([country, langs]) =>
						[
							country,
							langs.filter((lang) => supportedLangs.includes(lang)),
						] as [string, string[]]
				)
				.map(([country, langs]) => langs.map((lang) => lang + "-" + country))
				.flat()
				.map(
					(locale) =>
						({
							locale: locale,
							language_short: locale.split("-")[0],
							country_short: locale.split("-")[1],
							country: tLocale(locale + ".country"),
							language: tLocale(locale + ".language"),
							native_country: tLocale(locale + ".native_country"),
							native_language: tLocale(locale + ".native_language"),
						} as LanguageSelectorEntryData)
				)
				.map(
					(entry) =>
						({
							...entry,
							locale_lower: entry.locale.toLowerCase(),
							country_lower: entry.country.toLowerCase(),
							language_lower: entry.language.toLowerCase(),
							native_country_lower: entry.native_country.toLowerCase(),
							native_language_lower: entry.native_language.toLowerCase(),
						} as LanguageSelectorEntryFilterData)
				)
				.sort((a, b) => {
					const languages = navigator.languages; // example: [ "de", "en-US", "en", "fr" ]
					// languages index (locale or lang)
					const getMatchScore = (locale: string) => {
						let index = languages.indexOf(locale);
						if (index === -1) index = languages.indexOf(locale.split("-")[0]);
						if (index !== -1) index = languages.length - index;
						else index = 0;
						return index;
					};
					const aScore = getMatchScore(a.locale);
					const bScore = getMatchScore(b.locale);
					if (aScore != bScore) return bScore - aScore;
					// score is equal, check relevance
					const getRelevance = (locale: string) =>
						(localeRelevance as Record<string, number>)[locale] ?? 0;
					const aRelevance = getRelevance(a.locale);
					const bRelevance = getRelevance(b.locale);
					return bRelevance - aRelevance;
				}),
		[countryLanguageMapping, supportedLangs, tLocale]
	);

	const noLocalesRenderer = useCallback(() => {
		return (
			<div className={classes.noLocalesMessage}>
				{t("non-standalone.language-switcher.no-locales")}
			</div>
		);
	}, [t, classes.noLocalesMessage]);

	const filteredData = data.filter(
		(entry) =>
			entry.locale_lower.includes(lowercaseFilter) ||
			entry.country_lower.includes(lowercaseFilter) ||
			entry.language_lower.includes(lowercaseFilter) ||
			entry.native_country_lower.includes(lowercaseFilter) ||
			entry.native_language_lower.includes(lowercaseFilter)
	);

	const localeEntryRenderer = (entryProps: ListRowProps) => {
		const locale = filteredData[entryProps.index];

		return (
			<div style={entryProps.style}>
				<Suspense fallback={<Loader />}>
					<LanguageSelectorEntry
						locale={locale}
						currentLanguage={currentLang}
						close={props.close}
						key={locale.locale}
					/>
				</Suspense>
			</div>
		);
	};

	return (
		<Grid container>
			<Grid item xs={12}>
				<Box px={2} pb={1}>
					<TextFieldWithHelp
						value={filter}
						onChange={handleFilterChange}
						fullWidth
						InputProps={SearchInputProps}
					/>
				</Box>
			</Grid>
			<Grid item xs={12} className={classes.localeList}>
				<AutoSizer>
					{({ width, height }) => (
						<List
							width={width}
							height={height}
							overscanRowCount={2}
							noRowsRenderer={noLocalesRenderer}
							rowCount={filteredData.length}
							rowHeight={70}
							rowRenderer={localeEntryRenderer}
						/>
					)}
				</AutoSizer>
			</Grid>
		</Grid>
	);
};

export default React.memo(LanguageSelectorDialogContent);
