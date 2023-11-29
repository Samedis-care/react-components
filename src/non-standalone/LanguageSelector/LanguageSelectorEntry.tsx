import React, { useCallback } from "react";
import {
	LanguageSelectorDialogContentProps,
	LanguageSelectorEntryData,
} from "./LanguageSelectorDialogContent";
import { Grid, ListItemButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CountryFlags from "../../standalone/CountryFlags";

export interface LanguageSelectorEntryProps
	extends Omit<LanguageSelectorDialogContentProps, "close"> {
	locale: LanguageSelectorEntryData;
	currentLanguage: string;
	handleSwitch: (lang: string) => void;
	disabled: boolean;
}

const useStyles = makeStyles(
	{
		root: {
			height: "100%",
			display: "block",
		},
		container: {
			width: "100%",
			height: "100%",
			margin: 0,
		},
		imageWrapper: {
			height: 30, // available: 70px - 16px padding
			position: "relative",
		},
		image: {
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
		},
	},
	{ name: "CcLanguageSelectorEntry" }
);

const LanguageSelectorEntry = (
	props: LanguageSelectorEntryProps
): React.ReactElement => {
	const { locale, currentLanguage, handleSwitch, disabled } = props;
	const classes = useStyles();
	const sameLang = locale.language_short === currentLanguage;

	const handleClick = useCallback(() => {
		handleSwitch(locale.locale);
	}, [locale, handleSwitch]);

	const flag = CountryFlags[locale.country_short];

	return (
		<ListItemButton
			onClick={handleClick}
			disabled={disabled}
			className={classes.root}
		>
			<Grid
				container
				spacing={2}
				className={classes.container}
				alignItems={"stretch"}
			>
				<Grid item xs={4} className={classes.imageWrapper}>
					<img alt={locale.country} src={flag} className={classes.image} />
				</Grid>
				<Grid item xs={8} container>
					<Grid item xs={6}>
						{locale.country}
					</Grid>
					<Grid item xs={6}>
						{locale.language}
					</Grid>
					{!sameLang && (
						<>
							<Grid item xs={6}>
								{locale.native_country}
							</Grid>
							<Grid item xs={6}>
								{locale.native_language}
							</Grid>
						</>
					)}
				</Grid>
			</Grid>
		</ListItemButton>
	);
};

// virtualization remounts the component every time, so no need for memo here
export default LanguageSelectorEntry;
