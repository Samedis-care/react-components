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
     * Properties to pass to the popover showing the notifications
     */
    PopoverProps?: Omit<PopoverProps, "open" | "onClose" | "anchorEl">;
    /**
     * Props to pass to the icon button
     */
    IconButtonProps?: Omit<IconButtonProps, "onClick">;
    /**
     * Callback which is fired by the infinite scroll to load old notifications
     */
    loadRead: InfiniteScrollProps["loadMoreBottom"];
    /**
     * Callback which is fired by the infinite scroll to load new (unread) notifications
     * Should load the oldest unread notifications
     */
    loadUnread: InfiniteScrollProps["loadMoreTop"] | undefined;
    /**
     * Load the latest notifications
     * called at refreshInterval or on page focus
     */
    loadLatest: () => void;
    /**
     * Refresh interval (delay between loadLatest calls) in ms
     * @default 1 minute
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
