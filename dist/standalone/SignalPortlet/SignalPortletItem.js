import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Avatar, ListItem, ListItemAvatar, ListItemButton, listItemButtonClasses, ListItemText, styled, useThemeProps, } from "@mui/material";
import Loader from "../Loader";
import Link from "../Routes/Link";
import combineClassNames from "../../utils/combineClassNames";
import focusRing from "../../utils/internal/focusRing";
import visuallyHidden from "../../utils/internal/visuallyHidden";
const ListAvatar = styled(ListItemAvatar, {
    name: "CcSignalPortletItem",
    slot: "listAvatar",
})({});
const AvatarLoading = styled(Avatar, {
    name: "CcSignalPortletItem",
    slot: "itemColorLoading",
})({
    backgroundColor: "transparent",
});
const AvatarActive = styled(Avatar, {
    name: "CcSignalPortletItem",
    slot: "itemColorActive",
})(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
}));
const AvatarInactive = styled(Avatar, {
    name: "CcSignalPortletItem",
    slot: "itemColorInactive",
})(({ theme }) => ({
    // the grey of MUI's Avatar without an image, with the text color for it:
    // the count is content, not a disabled control, and needs 4.5:1. The dark
    // palette's colors apply in the dark scheme of a theme of CSS variables
    // too. A scheme sets only these properties, so a theme's color and
    // backgroundColor for this slot apply in every scheme
    "--cc-signal-portlet-inactive-color": theme.palette.getContrastText(theme.palette.grey[400]),
    "--cc-signal-portlet-inactive-background": theme.palette.grey[400],
    ...theme.applyStyles("dark", {
        "--cc-signal-portlet-inactive-color": theme.palette.getContrastText(theme.palette.grey[600]),
        "--cc-signal-portlet-inactive-background": theme.palette.grey[600],
    }),
    color: "var(--cc-signal-portlet-inactive-color)",
    backgroundColor: "var(--cc-signal-portlet-inactive-background)",
}));
const CountCapped = styled("span", {
    name: "CcSignalPortletItem",
    slot: "countCapped",
})({
    // "999+" in the avatar's font size is wider than the 40px avatar
    fontSize: "0.7em",
});
const CountFull = styled("span", {
    name: "CcSignalPortletItem",
    slot: "countFull",
})(visuallyHidden);
const ListText = styled(ListItemText, {
    name: "CcSignalPortletItem",
    slot: "listText",
})({});
const ListRoot = styled(ListItem, {
    name: "CcSignalPortletItem",
    slot: "root",
})({});
const ListRootButton = styled(ListItemButton, {
    name: "CcSignalPortletItem",
    slot: "rootBtn",
})(({ theme }) => ({
    // MUI marks the keyboard-focused row with a faint tint only, which forced
    // colors drop; inside the row, which spans the card from edge to edge
    [`&.${listItemButtonClasses.focusVisible}`]: focusRing(theme, -2),
})); // styled() drops the typing of `component`
/** The highest count shown as it is; higher counts show as "999+" */
const MAX_COUNT = 999;
const SignalPortletItem = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSignalPortletItem" });
    const { count, link, text, textTypographyProps, className, classes } = props;
    const AvatarComponent = count == null ? AvatarLoading : count ? AvatarActive : AvatarInactive;
    const avatarClass = classes
        ? count == null
            ? classes.itemColorLoading
            : count
                ? classes.itemColorActive
                : classes.itemColorInactive
        : undefined;
    const content = (_jsxs(_Fragment, { children: [_jsx(ListAvatar, { className: classes?.listAvatar, children: _jsx(AvatarComponent, { className: avatarClass, children: count == null ? (_jsx(Loader, {})) : count > MAX_COUNT ? (_jsxs(_Fragment, { children: [_jsx(CountCapped, { "aria-hidden": true, className: classes?.countCapped, children: `${MAX_COUNT}+` }), _jsx(CountFull, { className: classes?.countFull, children: count.toString() })] })) : (count.toString()) }) }), _jsx(ListText, { className: classes?.listText, slotProps: { primary: textTypographyProps }, children: text })] }));
    // every row is a list item; a linked row puts its link inside, as in
    // MUI's ListItem disablePadding + ListItemButton pattern
    return (_jsx(ListRoot, { disablePadding: !!link, className: combineClassNames([className, classes?.root]), children: link ? (_jsx(ListRootButton, { component: Link, to: link, className: classes?.rootBtn, children: content })) : (content) }));
};
export default React.memo(SignalPortletItem);
