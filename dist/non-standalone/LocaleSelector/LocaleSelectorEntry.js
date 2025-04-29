import React, { useCallback } from "react";
import { Grid, ListItemButton, styled, useThemeProps } from "@mui/material";
import CountryFlags from "../../standalone/CountryFlags";
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
const LocaleSelectorEntry = (inProps) => {
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
    return (React.createElement(ListItemRoot, { onClick: handleClick, disabled: disabled, className: className },
        React.createElement(Container, { container: true, spacing: 2, alignItems: "stretch" },
            React.createElement(ImageWrapper, { size: 4 },
                React.createElement(Image, { alt: locale.country, src: flag })),
            React.createElement(Grid, { container: true, size: 8 },
                React.createElement(Grid, { size: 6 }, locale.country),
                React.createElement(Grid, { size: 6 }, locale.language),
                !sameLang && (React.createElement(React.Fragment, null,
                    React.createElement(Grid, { size: 6 }, locale.native_country),
                    React.createElement(Grid, { size: 6 }, locale.native_language)))))));
};
// virtualization remounts the component every time, so no need for memo here
export default LocaleSelectorEntry;
