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
     * Has the user already read the notification? The default row dims a read
     * one, and starts an unread one with the visually hidden text "Unread"
     * (translated), so screen readers say which notifications are new.
     */
    read: boolean;
}
export interface NotificationsProps {
    /**
     * Properties to pass to the notification count badge. A `badgeContent` of
     * your own changes only what the badge shows: the bell's accessible name
     * keeps the unread count (see `IconButtonProps`).
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
     *
     * The bell's accessible name is "Notifications" and, while anything is
     * unread, the unread count: "Notifications, 2 unread" (translated, with
     * the language's plural forms). It gives the exact count, also above 99
     * where the badge shows "99+". An `aria-label` of your own replaces the
     * whole name, the badge's number included: put the count into it.
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
     * Load the latest notifications. Called on mount, at `refreshInterval` and
     * on window focus.
     *
     * Return the promise of the load (an async function does): the unread
     * count the first load (the call on mount) brings is then not announced
     * as new notifications (see `disableAnnouncement`). A function that
     * returns nothing counts as done on mount, so a count it brings later is
     * announced. The component does not catch a rejection of the promise:
     * handle errors inside `loadLatest`.
     */
    loadLatest: () => void | Promise<unknown>;
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
     * A custom notification renderer (optional): renders one row, the content
     * of a list item. Notifications renders the rows as a list, each in an
     * `<li>` (theme slot `listItem`) of a `<ul>` (`list`), so the renderer
     * returns flow content, not an `<li>` of its own. The list item is
     * `position: relative`: it is the containing block of what the row
     * positions absolutely.
     *
     * A renderer that shows whether a notification is read (dimmed, bold, a
     * dot) has to say it in text too, as the default row does: e.g. a visually
     * hidden "Unread" at the start of an unread row.
     * @param notification The notification to render
     */
    notificationRenderer?: React.ComponentType<Notification>;
    /**
     * The notifications to display (should be updated by loadMore)
     */
    notifications: Notification[];
    /**
     * Number of unread notifications, shown by the badge and part of the bell's
     * accessible name ("Notifications, 2 unread"). When omitted, the number of
     * the non-expired `notifications` with `read: false`. `0` hides the badge
     * and leaves the name "Notifications". A rise is announced as new
     * notifications (see `disableAnnouncement`).
     */
    unreadCount?: number;
    /**
     * Switches off the announcement of new notifications.
     *
     * By default, when the unread count rises, a visually hidden polite status
     * region (`role="status"`, theme slot `announcement`) says by how much,
     * e.g. "1 new notification" (translated, with the language's plural
     * forms): screen-reader users learn of a notification that arrives while
     * they work elsewhere on the page, as sighted users see the badge change.
     * The text is removed after a few seconds. Not announced: the count on
     * mount, the count the first `loadLatest` brings (when it returns the
     * load's promise), a falling count, and a rise while this is set.
     *
     * The component only sees the count, so any rise is announced, also one
     * that brings no new notification (e.g. an `unreadCount` that changes from
     * the number of loaded notifications to the server's total after the
     * first load). While the popover is open, the page behind it, the status
     * region included, is hidden from assistive technology.
     *
     * Set it for every Notifications in the theme's
     * `CcNotifications.defaultProps`.
     * @default false
     */
    disableAnnouncement?: boolean;
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
/**
 * Theme style slots of Notifications
 * (`components.CcNotifications.styleOverrides.<slot>`), and the keys of its
 * `classes` prop:
 * - `notificationArea`: the scroll container in the popover, which holds the
 *   list
 * - `list`: the list of notifications, a `<ul>` without markers, margin or
 *   padding. Not rendered while there are no notifications.
 * - `listItem`: each row's `<li>`, `position: relative`. It holds the row
 *   the default or a custom renderer (`notificationRenderer`) renders.
 * - `header`: the popover's "Notifications" heading
 * - `announcement`: the visually hidden status region that announces new
 *   notifications (see `disableAnnouncement`)
 */
export type NotificationsClassKey = "notificationArea" | "list" | "listItem" | "header" | "announcement";
declare const _default: React.MemoExoticComponent<(inProps: NotificationsProps) => React.JSX.Element>;
export default _default;
