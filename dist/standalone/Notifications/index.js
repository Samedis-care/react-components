import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useState } from "react";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Badge, Box, Divider, Grid, IconButton, Popover, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import InfiniteScroll from "../InfiniteScroll";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";
import useCurrentLocale from "../../utils/useCurrentLocale";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "right",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "right",
};
const defaultImageStyle = {
    width: "auto",
    height: 96,
    borderRadius: "100%",
};
const unreadStyle = {};
const readStyle = {
    ...unreadStyle,
    opacity: 0.7,
};
const DefaultRenderer = (notification) => {
    const locale = useCurrentLocale();
    return (_jsx(Box, { sx: { p: 2 }, style: notification.read ? readStyle : unreadStyle, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: "grow", children: notification.image && (_jsx("img", { style: defaultImageStyle, src: notification.image, alt: "" })) }), _jsx(Grid, { size: 9, children: _jsx(Box, { sx: { py: 2 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: 12, children: _jsx(Typography, { children: notification.message }) }), _jsx(Grid, { size: 12, children: _jsxs(Typography, { variant: "body2", children: [_jsx(React.Fragment, { children: notification.origin && _jsxs(_Fragment, { children: [notification.origin, " "] }) }), _jsx(Tooltip, { title: notification.created.toLocaleString(locale), children: _jsx("span", { children: timestampToAge(notification.created) }) })] }) })] }) }) }), _jsx(Grid, { size: 12, children: _jsx(Divider, {}) })] }) }, notification.id));
};
const StyledInfiniteScroll = styled(InfiniteScroll, {
    name: "CcNotifications",
    slot: "notificationArea",
})({
    height: "50vh",
    overflow: "auto",
});
const StyledHeader = styled(Typography, {
    name: "CcNotifications",
    slot: "header",
})({});
const Notifications = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcNotifications" });
    const { t } = useCCTranslations();
    const [anchor, setAnchor] = useState(null);
    const { onOpen, loadLatest, loadRead, loadUnread, refreshInterval, unreadCount, classes, className, IconButtonProps, } = props;
    const onIconClick = useCallback((evt) => {
        setAnchor(evt.currentTarget);
        if (onOpen)
            onOpen(evt);
    }, [setAnchor, onOpen]);
    const onClose = useCallback(() => {
        setAnchor(null);
    }, [setAnchor]);
    const handleLoadLatest = useCallback(() => {
        loadLatest();
    }, [loadLatest]);
    useEffect(() => {
        window.addEventListener("focus", handleLoadLatest);
        const intervalHandle = window.setInterval(handleLoadLatest, refreshInterval ?? 60000);
        return () => {
            window.removeEventListener("focus", handleLoadLatest);
            window.clearInterval(intervalHandle);
        };
    }, [handleLoadLatest, refreshInterval]);
    useEffect(() => {
        // initial load
        handleLoadLatest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const Renderer = props.notificationRenderer || DefaultRenderer;
    const notifications = props.notifications.filter((not) => !not.expires || not.expires > new Date());
    return (_jsxs("div", { className: className, children: [_jsx(IconButton, { size: "large", "aria-label": t("standalone.notifications.title"), ...IconButtonProps, onClick: onIconClick, children: _jsx(Badge, { badgeContent: unreadCount ?? notifications.filter((not) => !not.read).length, max: 99, color: "error", ...props.BadgeProps, children: _jsx(NotificationsIcon, {}) }) }), _jsx(Popover, { open: !!anchor, anchorEl: anchor, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClose: onClose, ...props.PopoverProps, children: _jsx(Box, { sx: { p: 2 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: 12, children: _jsx(StyledHeader, { component: "h2", variant: "h6", className: classes?.header, children: t("standalone.notifications.title") }) }), _jsx(Grid, { size: 12, children: _jsx(Divider, {}) }), _jsx(Grid, { size: 12, children: _jsx(StyledInfiniteScroll, { loadMoreBottom: loadRead, loadMoreTop: loadUnread, className: classes?.notificationArea ?? "", children: notifications.map((notification) => (_jsx(Renderer, { ...notification }, notification.id))) }) })] }) }) })] }));
};
export default React.memo(Notifications);
