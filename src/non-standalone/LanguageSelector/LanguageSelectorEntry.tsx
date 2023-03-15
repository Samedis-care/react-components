import React, { useCallback } from "react";
import {
	LanguageSelectorDialogContentProps,
	LanguageSelectorEntryData,
} from "./LanguageSelectorDialogContent";
import { Grid, ListItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useCCTranslations from "../../utils/useCCTranslations";
import CountryFlags from "../../standalone/CountryFlags";

export interface LanguageSelectorEntryProps
	extends LanguageSelectorDialogContentProps {
	locale: LanguageSelectorEntryData;
	currentLanguage: string;
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
	const { locale, currentLanguage, close } = props;
	const { i18n } = useCCTranslations();
	const classes = useStyles();
	const sameLang = locale.language_short === currentLanguage;

	const handleClick = useCallback(async () => {
		await i18n.changeLanguage(locale.locale);
		close();
	}, [i18n, locale, close]);

	const flag = CountryFlags[locale.country_short];

	return (
		<ListItem button onClick={handleClick} className={classes.root}>
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
		</ListItem>
	);
};

// virtualization remounts the component every time, so no need for memo here
export default LanguageSelectorEntry;
