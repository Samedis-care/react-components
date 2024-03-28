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
    const content = (React.createElement(React.Fragment, null,
        React.createElement(ListAvatar, { className: classes?.listAvatar },
            React.createElement(AvatarComponent, { className: avatarClass }, count == null ? React.createElement(Loader, null) : count.toString())),
        React.createElement(ListText, { primaryTypographyProps: textTypographyProps }, text)));
    return link ? (React.createElement(ListRootButton, { onClick: handleClick, className: combineClassNames([className, classes?.rootBtn]) }, content)) : (React.createElement(ListRoot, { className: combineClassNames([className, classes?.root]) }, content));
};
export default React.memo(SignalPortletItem);
