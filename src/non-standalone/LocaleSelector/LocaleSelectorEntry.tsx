import React, { useCallback } from "react";
import {
	LocaleSelectorDialogContentProps,
	LocaleSelectorEntryData,
} from "./LocaleSelectorDialogContent";
import {
	Grid2 as Grid,
	ListItemButton,
	styled,
	useThemeProps,
} from "@mui/material";
import CountryFlags from "../../standalone/CountryFlags";

export interface LocaleSelectorEntryProps
	extends Omit<LocaleSelectorDialogContentProps, "close"> {
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
});

const Container = styled(Grid, {
	name: "CcLocaleSelectorEntry",
	slot: "container",
})({
	width: "100%",
	height: "100%",
	margin: 0,
});

const ImageWrapper = styled(Grid, {
	name: "CcLocaleSelectorEntry",
	slot: "imageWrapper",
})({
	height: 30, // available: 70px - 16px padding
	position: "relative",
});

const Image = styled("img", { name: "CcLocaleSelectorEntry", slot: "image" })({
	height: "100%",
	width: "auto",
	maxWidth: "100%",
	objectFit: "contain",
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	position: "absolute",
	border: "1px solid lightgray",
});

export type LocaleSelectorEntryClassKey =
	| "root"
	| "container"
	| "imageWrapper"
	| "image";

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
			<Container container spacing={2} alignItems={"stretch"}>
				<ImageWrapper size={4}>
					<Image alt={locale.country} src={flag} />
				</ImageWrapper>
				<Grid container size={8}>
					<Grid size={6}>{locale.country}</Grid>
					<Grid size={6}>{locale.language}</Grid>
					{!sameLang && (
						<>
							<Grid size={6}>{locale.native_country}</Grid>
							<Grid size={6}>{locale.native_language}</Grid>
						</>
					)}
				</Grid>
			</Container>
		</ListItemRoot>
	);
};

// virtualization remounts the component every time, so no need for memo here
export default LocaleSelectorEntry;
