import React from "react";
import { BadgeProps, IconButtonProps, PopoverProps } from "@mui/material";
import { InfiniteScrollProps } from "../InfiniteScroll";
export interface Notification {
    /**
     * An unique identifier for the notification
     */
    id: string;
    /**
     * An optional image for the notification (URL)
     */
    image?: string;
    /**
     * The main message of the notification
     */
    message: React.ReactNode;
    /**
     * The sub message of the notification, shown before it's age
     */
    origin?: React.ReactNode;
    /**
     * The timestamp of creation of this notification
     */
    created: Date;
    /**
     * When the notification expires (hides)
     */
    expires?: Date;
    /**
     * Has the user already read the notification?
     */
    read: boolean;
}
export interface NotificationsProps {
    /**
     * Properties to pass to the notification count badge
     */
    BadgeProps?: BadgeProps;
    /**
     * Props for the MUI `Popover` that lists the notifications, spread over the
     * defaults `anchorOrigin` bottom/right and `transformOrigin` top/right (the
     * popover opens below the bell, right edges aligned). `open`, `anchorEl`
     * and `onClose` are managed internally.
     *
     * The paper is `min(400px, 100% - 32px)` wide by default: 400px, and on a
     * window narrower than 432px the window's width less 16px on each side.
     * Set another width with e.g. `{ slotProps: { paper: { sx: { width: 600 } } } }`,
     * here or, for every Notifications that passes no `PopoverProps` of its
     * own, in the theme's `CcNotifications.defaultProps.PopoverProps`; MUI
     * keeps it 16px from the window edges. A paper width in the theme's
     * `MuiPopover.styleOverrides.paper` does not apply: the default width
     * outranks it. The theme's other `MuiPopover` paper settings do apply
     * (`styleOverrides.paper`, `defaultProps.slotProps.paper`). Keep it a
     * fixed width: MUI repositions the paper after every render while it is
     * open, and a paper sized by its content (`width: "auto"`) gets wider each
     * time. `slots` is merged into the defaults, so only a `slots.paper` of
     * your own replaces the default paper and its width; one in the theme's
     * `MuiPopover.defaultProps.slots` does not.
     *
     * The paper is a modal dialog named by the popover's "Notifications"
     * heading: `role="dialog"`, `aria-modal` and `aria-labelledby` (the
     * heading's id). A `slotProps.paper` of your own (an object, or a function
     * of the owner state) is spread over these, so it can change them, e.g.
     * name the dialog by another element with `aria-labelledby`. The paper's
     * `id` is managed internally: the bell's `aria-controls` refers to it.
     */
    PopoverProps?: Omit<PopoverProps, "open" | "onClose" | "anchorEl">;
    /**
     * Props to pass to the icon button. `aria-haspopup`, `aria-expanded` and
     * `aria-controls` are managed internally: the bell says that it opens a
     * dialog, whether that is open, and while it is, which element it is.
     */
    IconButtonProps?: Omit<IconButtonProps, "onClick" | "aria-haspopup" | "aria-expanded" | "aria-controls">;
    /**
     * Callback which is fired by the infinite scroll to load old notifications
     */
    loadRead: NonNullable<InfiniteScrollProps["loadMoreBottom"]>;
    /**
     * Callback which is fired by the infinite scroll to load new (unread) notifications
     * Should load the oldest unread notifications
     *
     * Called when the list is scrolled to its top, and once when the popover
     * opens and the notifications fill the list (see InfiniteScroll's
     * `loadMoreTop`). Add what it loads to the start of `notifications`: the
     * new notifications stay out of view above the ones shown until the user
     * scrolls up. Pass `undefined` while there is nothing more to load.
     */
    loadUnread: InfiniteScrollProps["loadMoreTop"] | undefined;
    /**
     * Load the latest notifications
     * called at refreshInterval or on page focus
     */
    loadLatest: () => void;
    /**
     * Delay between `loadLatest` calls in ms: a positive number up to 2^31 - 1
     * (about 24.8 days, the longest timer delay browsers support). `0`
     * switches polling off, and so does any longer delay, `Infinity` included;
     * `loadLatest` is then still called on mount and on window focus. A
     * negative number or `NaN` uses the default. A change restarts the
     * interval, without an immediate call.
     * @default 60000
     */
    refreshInterval?: number;
    /**
     * A custom notification renderer (optional)
     * @param notification The notification to render
     */
    notificationRenderer?: React.ComponentType<Notification>;
    /**
     * The notifications to display (should be updated by loadMore)
     */
    notifications: Notification[];
    /**
     * Total number of unread notifications (if not provided inferred from notifications)
     */
    unreadCount?: number;
    /**
     * Event handler which fires when the user opens the notifications
     */
    onOpen?: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
    /**
     * Custom CSS class to apply
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<NotificationsClassKey, string>>;
}
export type NotificationsClassKey = "notificationArea" | "header";
declare const _default: React.MemoExoticComponent<(inProps: NotificationsProps) => React.JSX.Element>;
export default _default;
