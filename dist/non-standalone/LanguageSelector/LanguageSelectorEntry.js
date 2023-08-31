import React, { useCallback } from "react";
import { Grid, ListItemButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import useCCTranslations from "../../utils/useCCTranslations";
import CountryFlags from "../../standalone/CountryFlags";
const useStyles = makeStyles({
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
        height: 30,
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
}, { name: "CcLanguageSelectorEntry" });
const LanguageSelectorEntry = (props) => {
    const { locale, currentLanguage, close } = props;
    const { i18n } = useCCTranslations();
    const classes = useStyles();
    const sameLang = locale.language_short === currentLanguage;
    const handleClick = useCallback(async () => {
        await i18n.changeLanguage(locale.locale);
        close();
    }, [i18n, locale, close]);
    const flag = CountryFlags[locale.country_short];
    return (React.createElement(ListItemButton, { onClick: handleClick, className: classes.root },
        React.createElement(Grid, { container: true, spacing: 2, className: classes.container, alignItems: "stretch" },
            React.createElement(Grid, { item: true, xs: 4, className: classes.imageWrapper },
                React.createElement("img", { alt: locale.country, src: flag, className: classes.image })),
            React.createElement(Grid, { item: true, xs: 8, container: true },
                React.createElement(Grid, { item: true, xs: 6 }, locale.country),
                React.createElement(Grid, { item: true, xs: 6 }, locale.language),
                !sameLang && (React.createElement(React.Fragment, null,
                    React.createElement(Grid, { item: true, xs: 6 }, locale.native_country),
                    React.createElement(Grid, { item: true, xs: 6 }, locale.native_language)))))));
};
// virtualization remounts the component every time, so no need for memo here
export default LanguageSelectorEntry;
