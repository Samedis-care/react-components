import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { ListItemButton, styled, useThemeProps } from "@mui/material";
import CountryFlag from "../../standalone/CountryFlag";
import focusRing from "../../utils/internal/focusRing";
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
    return (_jsx(ListItemRoot, { onClick: handleClick, disabled: disabled, className: className, children: _jsxs(Container, { children: [_jsx(Flag, { code: locale.country_short, size: 30 }), _jsxs(TextContainer, { children: [_jsx(Text, { title: locale.country, children: locale.country }), _jsx(Text, { title: locale.language, children: locale.language }), !sameLang && (_jsxs(_Fragment, { children: [_jsx(Text, { title: locale.native_country, children: locale.native_country }), _jsx(Text, { title: locale.native_language, children: locale.native_language })] }))] })] }) }));
};
// virtualization remounts the component every time, so no need for memo here
export default LocaleSelectorEntry;
