import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, styled, useThemeProps, } from "@mui/material";
import Loader from "../Loader";
import useNavigate from "../Routes/useNavigate";
import combineClassNames from "../../utils/combineClassNames";
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
    color: theme.palette.getContrastText(theme.palette.action.disabled),
    backgroundColor: theme.palette.action.disabled,
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
})({
    // visually hidden, as MUI's visuallyHidden
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
});
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
})({});
/** The highest count shown as it is; higher counts show as "999+" */
const MAX_COUNT = 999;
const SignalPortletItem = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSignalPortletItem" });
    const { count, link, text, textTypographyProps, className, classes } = props;
    const navigate = useNavigate();
    const handleClick = useCallback(() => {
        if (link) {
            navigate(link);
        }
    }, [navigate, link]);
    const AvatarComponent = count == null ? AvatarLoading : count ? AvatarActive : AvatarInactive;
    const avatarClass = classes
        ? count == null
            ? classes.itemColorLoading
            : count
                ? classes.itemColorActive
                : classes.itemColorInactive
        : undefined;
    const content = (_jsxs(_Fragment, { children: [_jsx(ListAvatar, { className: classes?.listAvatar, children: _jsx(AvatarComponent, { className: avatarClass, children: count == null ? (_jsx(Loader, {})) : count > MAX_COUNT ? (_jsxs(_Fragment, { children: [_jsx(CountCapped, { "aria-hidden": true, className: classes?.countCapped, children: `${MAX_COUNT}+` }), _jsx(CountFull, { className: classes?.countFull, children: count.toString() })] })) : (count.toString()) }) }), _jsx(ListText, { slotProps: { primary: textTypographyProps }, children: text })] }));
    // every row is a list item; a linked row puts its button inside, as in
    // MUI's ListItem disablePadding + ListItemButton pattern
    return (_jsx(ListRoot, { disablePadding: !!link, className: combineClassNames([className, classes?.root]), children: link ? (_jsx(ListRootButton, { onClick: handleClick, className: classes?.rootBtn, children: content })) : (content) }));
};
export default React.memo(SignalPortletItem);
