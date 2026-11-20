import React, { useCallback, useMemo } from "react";
import {
	LocaleSelectorDialogContentProps,
	LocaleSelectorEntryData,
} from "./LocaleSelectorDialogContent";
import { ListItemButton, styled, useThemeProps } from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import CountryFlag from "../../standalone/CountryFlag";
import focusRing from "../../utils/internal/focusRing";
import useCurrentLocale from "../../utils/useCurrentLocale";
import { useListFocusTarget } from "./useListFocusKeeper";

export interface LocaleSelectorEntryProps extends Omit<
	LocaleSelectorDialogContentProps,
	"handleSwitch" | "switching" | "supportedLocales"
> {
	locale: LocaleSelectorEntryData;
	currentLanguage: string;
	handleSwitch: (lang: string) => void;
	disabled: boolean;
}

const ListItemRoot = styled(ListItemButton, {
	name: "CcLocaleSelectorEntry",
	slot: "root",
})(({ theme }) => ({
	// the row grows when a long name wraps (e.g. de: "Sonderverwaltungsregion
	// Hongkong"); the list measures it
	minHeight: 70,
	// MUI marks the keyboard-focused row with a faint tint only, which forced
	// colors drop; inside the row, because the scrolling list clips its sides
	"&.Mui-focusVisible": focusRing(theme, -2),
}));

const Container = styled("div", {
	name: "CcLocaleSelectorEntry",
	slot: "container",
})({
	display: "flex",
	alignItems: "center",
	gap: 16,
	width: "100%",
});

// 30px high in a 60x30 box, outlined in the theme's divider color
const Flag = styled(CountryFlag, {
	name: "CcLocaleSelectorEntry",
	slot: "flag",
})({});

/**
 * Both text lines share a single grid, so the language column stays aligned
 * while the country column gets all the remaining space.
 * The language column has the same width in every entry, so it doesn't jump
 * around: 120px fits most translated language names, and on a narrow screen
 * it shrinks to 45% so the country keeps room too. Longer names wrap.
 */
const TextContainer = styled("div", {
	name: "CcLocaleSelectorEntry",
	slot: "textContainer",
})({
	flex: "1 1 auto",
	minWidth: 0,
	display: "grid",
	gridTemplateColumns: "minmax(0, 1fr) min(120px, 45%)",
	columnGap: 16,
	// a name that wraps keeps its neighbour on its first line
	alignItems: "start",
});

const Text = styled("span", { name: "CcLocaleSelectorEntry", slot: "text" })({
	overflowWrap: "anywhere",
});

/**
 * The language name in the UI language and, in the current locale's row, the
 * check after it. The check takes no room in the other rows, so their names keep
 * the whole column. It moves to the second line when the name leaves no room
 * for it (at 320px): the current row is in the UI language, so it shows no
 * native names there.
 */
const Language = styled("div", {
	name: "CcLocaleSelectorEntry",
	slot: "language",
})({
	minWidth: 0,
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	// a name and check that don't fit side by side wrap, before the name shrinks
	columnGap: 8,
});

const CurrentIcon = styled("span", {
	name: "CcLocaleSelectorEntry",
	slot: "currentIcon",
})(({ theme }) => ({
	display: "flex",
	// at the row's end, also on a line of its own
	marginInlineStart: "auto",
	color: theme.palette.primary.main,
}));

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
export type LocaleSelectorEntryClassKey =
	| "root"
	| "container"
	| "flag"
	| "textContainer"
	| "text"
	| "language"
	| "currentIcon";

/**
 * The row a locale shows as, lower case `language-region`: the region of a
 * locale without one is its most likely one (`"de"` is `"de-de"`, `"en"` is
 * `"en-us"`), as for the date and number formats
 * @param locale The locale, e.g. `"de-AT"` or `"de"`
 * @returns The row's locale in lower case, e.g. `"de-at"`
 */
const rowLocaleOf = (locale: string): string => {
	try {
		const parsed = new Intl.Locale(locale);
		const region = parsed.region ?? parsed.maximize().region;
		if (region) return `${parsed.language}-${region}`.toLowerCase();
	} catch {
		// not a valid language tag: compared as it is
	}
	return locale.toLowerCase();
};

const LocaleSelectorEntry = (
	inProps: LocaleSelectorEntryProps,
): React.ReactElement => {
	const props = useThemeProps({
		props: inProps,
		name: "CcLocaleSelectorEntry",
	});
	const { locale, currentLanguage, handleSwitch, disabled, className } = props;
	const sameLang = locale.language_short === currentLanguage;
	const currentLocale = useCurrentLocale();
	const currentRow = useMemo(() => rowLocaleOf(currentLocale), [currentLocale]);
	const current = locale.locale.toLowerCase() === currentRow;

	const handleClick = useCallback(() => {
		handleSwitch(locale.locale);
	}, [locale, handleSwitch]);
	// keyboard focus waits on the list while this row is scrolled away
	const focusRef = useListFocusTarget(locale.locale);

	return (
		<ListItemRoot
			ref={focusRef}
			onClick={handleClick}
			disabled={disabled}
			// MUI's look of a selected row, the check and aria-current mark the
			// current locale, so neither color nor sight alone tells it
			selected={current}
			aria-current={current ? "true" : undefined}
			className={className}
		>
			<Container>
				{/* decorative: the country's name is the text beside it, so a
				    named flag would read the country twice */}
				<Flag code={locale.country_short} size={30} />
				<TextContainer>
					<Text title={locale.country}>{locale.country}</Text>
					<Language>
						<Text title={locale.language}>{locale.language}</Text>
						{current && (
							<CurrentIcon>
								<CheckIcon />
							</CurrentIcon>
						)}
					</Language>
					{!sameLang && (
						<>
							<Text title={locale.native_country}>{locale.native_country}</Text>
							<Text title={locale.native_language}>
								{locale.native_language}
							</Text>
						</>
					)}
				</TextContainer>
			</Container>
		</ListItemRoot>
	);
};

// virtualization remounts the component every time, so no need for memo here
export default LocaleSelectorEntry;
