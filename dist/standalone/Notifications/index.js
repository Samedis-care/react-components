import React, { useCallback, useEffect, useState } from "react";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Badge, Box, Divider, Grid2 as Grid, IconButton, Popover, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import InfiniteScroll from "../InfiniteScroll";
import i18n from "../../i18n";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";
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
const defaultRenderer = (notification) => (React.createElement(Box, { p: 2, style: notification.read ? readStyle : unreadStyle, key: notification.id },
    React.createElement(Grid, { container: true, spacing: 2 },
        React.createElement(Grid, { size: "grow" }, notification.image && (React.createElement("img", { style: defaultImageStyle, src: notification.image, alt: "" }))),
        React.createElement(Grid, { size: 9 },
            React.createElement(Box, { py: 2 },
                React.createElement(Grid, { container: true, spacing: 2 },
                    React.createElement(Grid, { size: 12 },
                        React.createElement(Typography, null, notification.message)),
                    React.createElement(Grid, { size: 12 },
                        React.createElement(Typography, { variant: "body2" },
                            React.createElement(React.Fragment, null, notification.origin && React.createElement(React.Fragment, null,
                                notification.origin,
                                " ")),
                            React.createElement(Tooltip, { title: notification.created.toLocaleString(i18n.language) },
                                React.createElement("span", null, timestampToAge(notification.created)))))))),
        React.createElement(Grid, { size: 12 },
            React.createElement(Divider, null)))));
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
    const Renderer = props.notificationRenderer || defaultRenderer;
    const notifications = props.notifications.filter((not) => !not.expires || not.expires > new Date());
    return (React.createElement("div", { className: className },
        React.createElement(IconButton, { size: "large", ...IconButtonProps, onClick: onIconClick },
            React.createElement(Badge, { badgeContent: unreadCount ?? notifications.filter((not) => !not.read).length, max: 99, color: "error", ...props.BadgeProps },
                React.createElement(NotificationsIcon, null))),
        React.createElement(Popover, { open: !!anchor, anchorEl: anchor, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClose: onClose, ...props.PopoverProps },
            React.createElement(Box, { p: 2 },
                React.createElement(Grid, { container: true, spacing: 2 },
                    React.createElement(Grid, { size: 12 },
                        React.createElement(StyledHeader, { component: "h2", variant: "h6", className: classes?.header }, t("standalone.notifications.title"))),
                    React.createElement(Grid, { size: 12 },
                        React.createElement(Divider, null)),
                    React.createElement(Grid, { size: 12 },
                        React.createElement(StyledInfiniteScroll, { loadMoreBottom: loadRead, loadMoreTop: loadUnread, className: classes?.notificationArea ?? "" }, notifications.map((notification) => (React.createElement(Renderer, { key: notification.id, ...notification }))))))))));
};
export default React.memo(Notifications);
