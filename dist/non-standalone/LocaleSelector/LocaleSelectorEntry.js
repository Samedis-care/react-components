import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo } from "react";
import { ListItemButton, styled, useThemeProps } from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import CountryFlag from "../../standalone/CountryFlag";
import focusRing from "../../utils/internal/focusRing";
import useCurrentLocale from "../../utils/useCurrentLocale";
import { useListFocusTarget } from "./useListFocusKeeper";
import rowLocaleOf from "./rowLocaleOf";
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
const LocaleSelectorEntry = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcLocaleSelectorEntry",
    });
    const { locale, currentLanguage, handleSwitch, disabled, focusableWhenDisabled = false, active = false, position, count, className, } = props;
    const sameLang = locale.language_short === currentLanguage;
    const currentLocale = useCurrentLocale();
    const currentRow = useMemo(() => rowLocaleOf(currentLocale), [currentLocale]);
    const current = locale.locale.toLowerCase() === currentRow;
    const handleClick = useCallback(() => {
        if (disabled)
            return;
        handleSwitch(locale.locale);
    }, [disabled, locale, handleSwitch]);
    // a focusable row is disabled for assistive technology only (aria-disabled,
    // which MUI sets on the other disabled rows), so that it keeps keyboard focus
    const focusable = disabled && focusableWhenDisabled;
    // keyboard focus waits on the list while this row is scrolled away
    const focusRef = useListFocusTarget(locale.locale);
    return (_jsx(ListItemRoot, { ref: focusRef, role: "option", "aria-posinset": position, "aria-setsize": count, 
        // a roving tab stop; MUI makes a disabled row no tab stop anyway
        tabIndex: active ? 0 : -1, onClick: handleClick, disabled: disabled && !focusable, "aria-disabled": disabled || undefined, 
        // MUI's look of a selected row, the check and aria-selected mark the
        // current locale, so neither color nor sight alone tells it. The other
        // rows say they are not selected: a listbox whose options don't say
        // so may be read as selecting the focused one
        selected: current, "aria-selected": current, className: className, children: _jsxs(Container, { children: [_jsx(Flag, { code: locale.country_short, size: 30 }), _jsxs(TextContainer, { children: [_jsx(Text, { title: locale.country, children: locale.country }), _jsxs(Language, { children: [_jsx(Text, { title: locale.language, children: locale.language }), current && (_jsx(CurrentIcon, { children: _jsx(CheckIcon, {}) }))] }), !sameLang && (_jsxs(_Fragment, { children: [_jsx(Text, { lang: locale.language_short, title: locale.native_country, children: locale.native_country }), _jsx(Text, { lang: locale.language_short, title: locale.native_language, children: locale.native_language })] }))] })] }) }));
};
// virtualization remounts the component every time, so no need for memo here
export default LocaleSelectorEntry;
