import React, { Suspense, useCallback, useMemo, useState } from "react";
import {
	Box,
	Grid,
	InputAdornment,
	styled,
	useThemeProps,
} from "@mui/material";
import { List, RowComponentProps } from "react-window";
import supportedLanguages from "../../assets/data/supported-languages.json";
import countryLanguages from "../../assets/data/country-languages.json";
import LocaleSelectorEntry from "./LocaleSelectorEntry";
import { Search as SearchIcon } from "@mui/icons-material";
import useCCTranslations, {
	useCCLocaleSwitcherTranslations,
} from "../../utils/useCCTranslations";
import sortByLocaleRelevance from "../../utils/sortByLocaleRelevance";
import TextFieldWithHelp from "../../standalone/UIKit/TextFieldWithHelp";
import Loader from "../../standalone/Loader";
import { LocaleSelectorDialogCommonProps } from "./LocaleSelectorDialog";
import { useDialogContext } from "../../framework";
import { showErrorDialog } from "../Dialog";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";

export interface LocaleSelectorDialogContentProps
	extends LocaleSelectorDialogCommonProps {
	close: () => void;
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
})({
	height: "calc(75vh - 128px)",
	width: "100%",
});

const NoLocalesMessage = styled("div", {
	name: "CcLocaleSelectorDialogContent",
	slot: "noLocalesMessage",
})({
	textAlign: "center",
	width: "100%",
});

export type LocaleSelectorDialogContentClassKey =
	| "localeList"
	| "noLocalesMessage";

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
	const { supportedLocales: appSupportedLocales, className, close } = props;

	const [filter, setFilter] = useState("");
	const lowercaseFilter = filter.toLowerCase();
	const { i18n, t } = useCCTranslations();
	const { t: tLocale } = useCCLocaleSwitcherTranslations();
	const currentLang = i18n.language.substring(0, 2);
	const handleFilterChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			setFilter(evt.target.value);
		},
		[setFilter],
	);
	const [switchingLanguage, setSwitchingLanguage] = useState(false);
	const [pushDialog] = useDialogContext();

	const supportedLangs = supportedLanguages;
	const countryLanguageMapping = countryLanguages as Record<string, string[]>;

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
						!appSupportedLocales ||
						appSupportedLocales.includes(locale) ||
						appSupportedLocales.includes(locale.split("-")[0]),
				)
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
						}) as LocaleSelectorEntryData,
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
						}) as LocaleSelectorEntryFilterData,
				)
				.sort((a, b) => sortByLocaleRelevance(a.locale, b.locale)),
		[countryLanguageMapping, appSupportedLocales, supportedLangs, tLocale],
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

	const handleSwitch = useCallback(
		async (lang: string) => {
			setSwitchingLanguage(true);
			try {
				await i18n.changeLanguage(lang);
				close();
			} catch (e) {
				await showErrorDialog(pushDialog, e as Error);
			} finally {
				setSwitchingLanguage(false);
			}
		},
		[close, i18n, pushDialog],
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
							disabled={switchingLanguage}
							key={locale.locale}
						/>
					</Suspense>
				</div>
			);
		},
		[currentLang, handleSwitch, switchingLanguage],
	);

	return (
		<Grid container className={className}>
			<Grid size={12}>
				<Box px={2} pb={1}>
					<TextFieldWithHelp
						value={filter}
						onChange={handleFilterChange}
						fullWidth
						slotProps={{ input: SearchInputProps }}
					/>
				</Box>
			</Grid>
			<LocaleList size={12}>
				<FormLoaderOverlay visible={switchingLanguage} />
				{filteredData.length === 0 ? (
					<NoLocalesMessage>
						{t("non-standalone.language-switcher.no-locales")}
					</NoLocalesMessage>
				) : (
					<List
						overscanCount={2}
						rowCount={filteredData.length}
						rowHeight={70}
						rowComponent={LocaleEntryRenderer}
						rowProps={{ filteredData }}
					/>
				)}
			</LocaleList>
		</Grid>
	);
};

export default React.memo(LocaleSelectorDialogContent);
