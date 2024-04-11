import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import {
	Badge,
	BadgeProps,
	Box,
	Divider,
	Grid,
	IconButton,
	Popover,
	PopoverOrigin,
	PopoverProps,
	styled,
	Tooltip,
	Typography,
	useThemeProps,
} from "@mui/material";
import InfiniteScroll, { InfiniteScrollProps } from "../InfiniteScroll";
import i18n from "../../i18n";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";

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
	message: React.ReactChild;
	/**
	 * The sub message of the notification, shown before it's age
	 */
	origin?: React.ReactChild;
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

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "right",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "right",
};

const defaultImageStyle: CSSProperties = {
	width: "auto",
	height: 96,
	borderRadius: "100%",
};

const unreadStyle: CSSProperties = {};

const readStyle: CSSProperties = {
	...unreadStyle,
	opacity: 0.7,
};

const defaultRenderer = (notification: Notification): React.ReactElement => (
	<Box
		p={2}
		style={notification.read ? readStyle : unreadStyle}
		key={notification.id}
	>
		<Grid container spacing={2}>
			<Grid item xs>
				{notification.image && (
					<img style={defaultImageStyle} src={notification.image} alt={""} />
				)}
			</Grid>
			<Grid item xs={9}>
				<Box py={2}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography>{notification.message}</Typography>
						</Grid>
						<Grid item xs={12}>
							<Typography variant={"body2"}>
								<React.Fragment>
									{notification.origin && <>{notification.origin} </>}
								</React.Fragment>
								<Tooltip
									title={notification.created.toLocaleString(i18n.language)}
								>
									<span>{timestampToAge(notification.created)}</span>
								</Tooltip>
							</Typography>
						</Grid>
					</Grid>
				</Box>
			</Grid>
			<Grid item xs={12}>
				<Divider />
			</Grid>
		</Grid>
	</Box>
);

const StyledInfiniteScroll = styled(InfiniteScroll, {
	name: "CcNotifications",
	slot: "notificationArea",
})({
	height: "50vh",
	overflow: "auto",
});

export type NotificationsClassKey = "notificationArea";

const Notifications = (inProps: NotificationsProps) => {
	const props = useThemeProps({ props: inProps, name: "CcNotifications" });
	const { t } = useCCTranslations();

	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const {
		onOpen,
		loadLatest,
		loadRead,
		loadUnread,
		refreshInterval,
		unreadCount,
		classes,
		className,
	} = props;

	const onIconClick = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			setAnchor(evt.currentTarget);
			if (onOpen) onOpen(evt);
		},
		[setAnchor, onOpen],
	);

	const onClose = useCallback(() => {
		setAnchor(null);
	}, [setAnchor]);

	const handleLoadLatest = useCallback(() => {
		loadLatest();
	}, [loadLatest]);

	useEffect(() => {
		window.addEventListener("focus", handleLoadLatest);
		const intervalHandle = window.setInterval(
			handleLoadLatest,
			refreshInterval ?? 60000,
		);
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
	const notifications = props.notifications.filter(
		(not) => !not.expires || not.expires > new Date(),
	);

	return (
		<div className={className}>
			<IconButton onClick={onIconClick} size="large">
				<Badge
					badgeContent={
						unreadCount ?? notifications.filter((not) => !not.read).length
					}
					max={99}
					color={"error"}
					{...props.BadgeProps}
				>
					<NotificationsIcon />
				</Badge>
			</IconButton>
			<Popover
				open={!!anchor}
				anchorEl={anchor}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				onClose={onClose}
				{...props.PopoverProps}
			>
				<Box p={2}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography variant={"h6"}>
								{t("standalone.notifications.title")}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Divider />
						</Grid>
						<Grid item xs={12}>
							<StyledInfiniteScroll
								loadMoreBottom={loadRead}
								loadMoreTop={loadUnread}
								className={classes?.notificationArea ?? ""}
							>
								{notifications.map((notification) => (
									<Renderer key={notification.id} {...notification} />
								))}
							</StyledInfiniteScroll>
						</Grid>
					</Grid>
				</Box>
			</Popover>
		</div>
	);
};

export default React.memo(Notifications);
