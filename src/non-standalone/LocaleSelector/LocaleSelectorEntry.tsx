import React, { useCallback } from "react";
import {
	LocaleSelectorDialogContentProps,
	LocaleSelectorEntryData,
} from "./LocaleSelectorDialogContent";
import { ListItemButton, styled, useThemeProps } from "@mui/material";
import CountryFlags from "../../standalone/CountryFlags";

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
	height: "100%",
	display: "block",
	// long names (e.g. de: "Sonderverwaltungsregion Hongkong") must never bleed
	// into the neighbouring entries of the virtualized list
	overflow: "hidden",
});

const Container = styled("div", {
	name: "CcLocaleSelectorEntry",
	slot: "container",
})({
	display: "flex",
	alignItems: "center",
	gap: 16,
	width: "100%",
	height: "100%",
});

const ImageWrapper = styled("div", {
	name: "CcLocaleSelectorEntry",
	slot: "imageWrapper",
})({
	flex: "0 0 auto",
	width: 60,
	height: 30, // available: 70px - 16px padding
	display: "flex",
	alignItems: "center",
});

// the flag keeps its aspect ratio within the wrapper, so the border always
// hugs the flag itself (ratios range from 0.82 (NP) to 2.54 (QA))
const Image = styled("img", { name: "CcLocaleSelectorEntry", slot: "image" })({
	maxHeight: "100%",
	maxWidth: "100%",
	objectFit: "contain",
	border: "1px solid lightgray",
});

/**
 * Both text lines share a single grid, so the language column stays aligned
 * while the country column gets all the remaining space.
 * The language column has a fixed width so it doesn't jump around between
 * entries - 120px fits the longest translated language name we ship.
 */
const TextContainer = styled("div", {
	name: "CcLocaleSelectorEntry",
	slot: "textContainer",
})({
	flex: "1 1 auto",
	minWidth: 0,
	display: "grid",
	gridTemplateColumns: "minmax(0, 1fr) 120px",
	columnGap: 16,
	alignItems: "center",
});

const Text = styled("span", { name: "CcLocaleSelectorEntry", slot: "text" })({
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
});

export type LocaleSelectorEntryClassKey =
	"root" | "container" | "imageWrapper" | "image" | "textContainer" | "text";

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

	const flag = CountryFlags[locale.country_short];

	return (
		<ListItemRoot
			onClick={handleClick}
			disabled={disabled}
			className={className}
		>
			<Container>
				<ImageWrapper>
					<Image alt={locale.country} src={flag} />
				</ImageWrapper>
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
