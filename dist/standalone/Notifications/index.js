import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useId, useMemo, useState, } from "react";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Badge, Box, Divider, Grid, IconButton, Popover, PopoverPaper, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import InfiniteScroll from "../InfiniteScroll";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";
import useCurrentLocale from "../../utils/useCurrentLocale";
import visuallyHidden from "../../utils/internal/visuallyHidden";
/** The longest delay browsers support for a timer (about 24.8 days) */
const MAX_TIMER_DELAY = 2 ** 31 - 1;
const DEFAULT_REFRESH_INTERVAL = 60000;
/**
 * How long the announcement of new notifications stays in the status region:
 * then it is removed, so the region holds no outdated text and the next
 * announcement is a new text, also when it reads the same.
 */
const ANNOUNCEMENT_DURATION = 7000;
/**
 * The delay of the polling interval for a `refreshInterval`, or `null` for no
 * polling. Browsers convert a delay to a 32-bit integer: they run `0`, `NaN`,
 * `Infinity` and negative numbers at their minimum delay of a few ms, and wrap
 * values of 2^31 and more around (2^31 itself to a negative number), so none
 * of them may reach `setInterval`.
 * @param refreshInterval The prop value
 */
const getPollingDelay = (refreshInterval = DEFAULT_REFRESH_INTERVAL) => {
    if (refreshInterval === 0 || refreshInterval > MAX_TIMER_DELAY)
        return null;
    if (!(refreshInterval > 0))
        return DEFAULT_REFRESH_INTERVAL; // negative, NaN
    return refreshInterval;
};
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "right",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "right",
};
/**
 * The popover's paper: MUI's own `PopoverPaper` with a fixed width. Without
 * one the paper shrinks to fit between its left edge and the window edge, and
 * MUI's repositioning after every render while it is open moves that edge
 * 16px further left: the paper would grow with every render and touch the
 * window edge.
 *
 * Built on `PopoverPaper` on purpose, as MUI's `Menu` builds its paper: MUI's
 * paper styles, the `.MuiPopover-paper` class and the theme's `MuiPopover`
 * paper overrides stay, except a `width` there, which this default outranks
 * (as `Menu`'s `maxHeight` outranks one). It is not a `CcNotifications` theme
 * slot: a width for every Notifications goes through
 * `CcNotifications.defaultProps.PopoverProps`.
 */
const NotificationsPaper = styled(PopoverPaper)({
    width: "min(400px, 100% - 32px)",
});
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
/**
 * The default row's "Unread", which only screen readers read: the row's dimmed
 * look is not seen by them. It sits in the top left corner of the list item.
 */
const UnreadLabel = styled("span")(visuallyHidden);
const DefaultRenderer = (notification) => {
    const locale = useCurrentLocale();
    const { t } = useCCTranslations();
    return (_jsxs(Box, { sx: { p: 2 }, style: notification.read ? readStyle : unreadStyle, children: [!notification.read && (_jsx(UnreadLabel, { children: `${t("standalone.notifications.unread")} ` })), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: "grow", children: notification.image && (_jsx("img", { style: defaultImageStyle, src: notification.image, alt: "" })) }), _jsx(Grid, { size: 9, children: _jsx(Box, { sx: { py: 2 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: 12, children: _jsx(Typography, { children: notification.message }) }), _jsx(Grid, { size: 12, children: _jsxs(Typography, { variant: "body2", children: [_jsx(React.Fragment, { children: notification.origin && _jsxs(_Fragment, { children: [notification.origin, " "] }) }), _jsx(Tooltip, { title: notification.created.toLocaleString(locale), children: _jsx("span", { children: timestampToAge(notification.created) }) })] }) })] }) }) }), _jsx(Grid, { size: 12, children: _jsx(Divider, {}) })] })] }, notification.id));
};
const StyledInfiniteScroll = styled(InfiniteScroll, {
    name: "CcNotifications",
    slot: "notificationArea",
})({
    height: "50vh",
    overflow: "auto",
});
// the rows as a list: screen readers say how many there are and move from row
// to row. Without markers, as MUI's List: role="list" keeps the list role,
// which WebKit drops from a list styled list-style: none.
const StyledList = styled("ul", {
    name: "CcNotifications",
    slot: "list",
})({
    listStyle: "none",
    margin: 0,
    padding: 0,
});
// a row, positioned as MUI's ListItem is, so what the row positions
// absolutely (the default row's visually hidden "Unread") stays in it
const StyledListItem = styled("li", {
    name: "CcNotifications",
    slot: "listItem",
})({
    position: "relative",
});
const StyledHeader = styled(Typography, {
    name: "CcNotifications",
    slot: "header",
})({});
// announces new notifications (a live region must exist before its text
// changes, so it is rendered while announcements are on)
const StyledAnnouncement = styled("span", {
    name: "CcNotifications",
    slot: "announcement",
})(visuallyHidden);
const Notifications = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcNotifications" });
    const { t } = useCCTranslations();
    const headerId = useId();
    const dialogId = useId();
    const [anchor, setAnchor] = useState(null);
    const open = anchor !== null;
    const { onOpen, loadLatest, loadRead, loadUnread, refreshInterval, unreadCount, disableAnnouncement, classes, className, IconButtonProps, PopoverProps: popoverProps, } = props;
    const customPopoverSlots = popoverProps?.slots;
    const popoverSlots = useMemo(() => ({
        ...customPopoverSlots,
        paper: customPopoverSlots?.paper ?? NotificationsPaper,
    }), [customPopoverSlots]);
    const customPopoverSlotProps = popoverProps?.slotProps;
    // the paper is a modal dialog (focus trap, the page behind is hidden from
    // assistive technology) named by its heading. The caller's paper props go
    // over these, except the id the bell's aria-controls refers to.
    const popoverSlotProps = useMemo(() => {
        const customPaper = customPopoverSlotProps?.paper;
        const dialogProps = {
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": headerId,
        };
        return {
            ...customPopoverSlotProps,
            paper: typeof customPaper === "function"
                ? (ownerState) => ({
                    ...dialogProps,
                    ...customPaper(ownerState),
                    id: dialogId,
                })
                : { ...dialogProps, ...customPaper, id: dialogId },
        };
    }, [customPopoverSlotProps, headerId, dialogId]);
    const onIconClick = useCallback((evt) => {
        setAnchor(evt.currentTarget);
        if (onOpen)
            onOpen(evt);
    }, [setAnchor, onOpen]);
    const onClose = useCallback(() => {
        setAnchor(null);
    }, [setAnchor]);
    const handleLoadLatest = useCallback(() => {
        void loadLatest();
    }, [loadLatest]);
    const pollingDelay = getPollingDelay(refreshInterval);
    useEffect(() => {
        window.addEventListener("focus", handleLoadLatest);
        const intervalHandle = pollingDelay === null
            ? undefined
            : window.setInterval(handleLoadLatest, pollingDelay);
        return () => {
            window.removeEventListener("focus", handleLoadLatest);
            window.clearInterval(intervalHandle);
        };
    }, [handleLoadLatest, pollingDelay]);
    // the first load: the count it brings is not announced
    const [firstLoadDone, setFirstLoadDone] = useState(false);
    useEffect(() => {
        let mounted = true;
        const done = () => {
            if (mounted)
                setFirstLoadDone(true);
        };
        const load = loadLatest();
        // React renders the state the app sets before its promise settles
        // together with firstLoadDone (its render waits for the promise
        // callbacks), so counting starts from the first load's count. A
        // rejection stays unhandled, as on every other call: the promise
        // finally() returns rejects with it.
        if (load instanceof Promise)
            void load.finally(done);
        else
            done();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const Renderer = props.notificationRenderer || DefaultRenderer;
    const notifications = props.notifications.filter((not) => !not.expires || not.expires > new Date());
    const unread = unreadCount ?? notifications.filter((not) => !not.read).length;
    // the unread count as the announcement counts it: null until the first
    // load is done and while announcements are off, 0 for a negative count or
    // NaN. A rise from the count of the render before is announced.
    const counted = firstLoadDone && !disableAnnouncement ? (unread > 0 ? unread : 0) : null;
    const [lastCounted, setLastCounted] = useState(null);
    const [announcement, setAnnouncement] = useState(null);
    if (lastCounted !== counted) {
        setLastCounted(counted);
        if (counted === null) {
            setAnnouncement(null);
        }
        else if (lastCounted !== null && counted > lastCounted) {
            const count = counted - lastCounted;
            setAnnouncement((prev) => ({ count, id: (prev?.id ?? 0) + 1 }));
        }
    }
    useEffect(() => {
        if (!announcement)
            return;
        const timeout = window.setTimeout(() => setAnnouncement(null), ANNOUNCEMENT_DURATION);
        return () => window.clearTimeout(timeout);
    }, [announcement]);
    return (_jsxs("div", { className: className, children: [_jsx(IconButton, { size: "large", "aria-label": unread > 0
                    ? t("standalone.notifications.bell-label", { count: unread })
                    : t("standalone.notifications.title"), ...IconButtonProps, onClick: onIconClick, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? dialogId : undefined, children: _jsx(Badge, { badgeContent: unread, max: 99, color: "error", ...props.BadgeProps, children: _jsx(NotificationsIcon, {}) }) }), !disableAnnouncement && (_jsx(StyledAnnouncement, { role: "status", className: classes?.announcement, children: announcement && (_jsx("span", { children: t("standalone.notifications.announce-new", {
                        count: announcement.count,
                    }) }, announcement.id)) })), _jsx(Popover, { open: open, anchorEl: anchor, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClose: onClose, ...popoverProps, slots: popoverSlots, slotProps: popoverSlotProps, children: _jsx(Box, { sx: { p: 2 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: 12, children: _jsx(StyledHeader, { component: "h2", variant: "h6", className: classes?.header, id: headerId, children: t("standalone.notifications.title") }) }), _jsx(Grid, { size: 12, children: _jsx(Divider, {}) }), _jsx(Grid, { size: 12, children: _jsx(StyledInfiniteScroll, { loadMoreBottom: loadRead, loadMoreTop: loadUnread, className: classes?.notificationArea, role: "region", "aria-labelledby": headerId, children: notifications.length > 0 && (_jsx(StyledList, { role: "list", className: classes?.list, children: notifications.map((notification) => (_jsx(StyledListItem, { className: classes?.listItem, children: _jsx(Renderer, { ...notification }) }, notification.id))) })) }) })] }) }) })] }));
};
export default React.memo(Notifications);
