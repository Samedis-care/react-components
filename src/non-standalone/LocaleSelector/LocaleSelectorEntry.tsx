import React, { useCallback } from "react";
import {
	LocaleSelectorDialogContentProps,
	LocaleSelectorEntryData,
} from "./LocaleSelectorDialogContent";
import { ListItemButton, styled, useThemeProps } from "@mui/material";
import CountryFlag from "../../standalone/CountryFlag";

export interface LocaleSelectorEntryProps extends Omit<
	LocaleSelectorDialogContentProps,
	"close"
> {
	locale: LocaleSelectorEntryData;
	currentLanguage: string;
	handleSwitch: (lang: string) => void;
	disabled: boolean;
}

const ListItemRoot = styled(ListItemButton, {
	name: "CcLocaleSelectorEntry",
	slot: "root",
})({
	// the row grows when a long name wraps (e.g. de: "Sonderverwaltungsregion
	// Hongkong"); the list measures it
	minHeight: 70,
});

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

export type LocaleSelectorEntryClassKey =
	"root" | "container" | "flag" | "textContainer" | "text";

const LocaleSelectorEntry = (
	inProps: LocaleSelectorEntryProps,
): React.ReactElement => {
	const props = useThemeProps({
		props: inProps,
		name: "CcLocaleSelectorEntry",
	});
	const { locale, currentLanguage, handleSwitch, disabled, className } = props;
	const sameLang = locale.language_short === currentLanguage;

	const handleClick = useCallback(() => {
		handleSwitch(locale.locale);
	}, [locale, handleSwitch]);

	return (
		<ListItemRoot
			onClick={handleClick}
			disabled={disabled}
			className={className}
		>
			<Container>
				{/* decorative: the country's name is the text beside it, so a
				    named flag would read the country twice */}
				<Flag code={locale.country_short} size={30} />
				<TextContainer>
					<Text title={locale.country}>{locale.country}</Text>
					<Text title={locale.language}>{locale.language}</Text>
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
