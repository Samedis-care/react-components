import React, { CSSProperties, useCallback, useState } from "react";
import { Notifications as NotificationsIcon } from "@material-ui/icons";
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
	Tooltip,
	Typography,
} from "@material-ui/core";
import InfiniteScroll, { InfiniteScrollProps } from "../InfiniteScroll";
import { makeStyles } from "@material-ui/core/styles";
import i18n from "../../i18n";

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
	PopoverProps?: PopoverProps;
	/**
	 * Callback which is fired by the infinite scroll to load old notifications
	 */
	loadMore: InfiniteScrollProps["loadMoreBottom"];
	/**
	 * A custom notification renderer (optional)
	 * @param notification The notification to render
	 */
	notificationRenderer?: (notification: Notification) => React.ReactElement;
	/**
	 * The notifications to display (should be updated by loadMore)
	 */
	notifications: Notification[];
	/**
	 * Event handler which fires when the user opens the notifications
	 */
	onOpen?: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "right",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "right",
};

const ageParser = (timestamp: Date): string => {
	const delta = new Date().getTime() - timestamp.getTime();

	if (delta < 5000 /* 5s */) return "just now";
	if (delta < 60000 /* 1m */) return "less than a minute ago";
	if (delta < 3600000 /* 1h */) {
		const minutes = delta / 60000;
		return `${minutes.toFixed(0)} ${minutes > 1 ? "minutes" : "minute"} ago`;
	}
	if (delta < 86400000 /* 1d */) {
		const hours = delta / 3600000;
		return `${hours.toFixed(0)} ${hours > 1 ? "hours" : "hour"} ago`;
	}
	const days = delta / 86400000;
	return `${days.toFixed(0)} ${days > 1 ? "days" : "day"} ago`;
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
									<span>{ageParser(notification.created)}</span>
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

const useStyles = makeStyles({
	notificationArea: {
		height: "50vh",
		overflow: "auto",
	},
});

const Notifications = (props: NotificationsProps) => {
	const classes = useStyles();

	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const { onOpen } = props;

	const onIconClick = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			setAnchor(evt.currentTarget);
			if (onOpen) onOpen(evt);
		},
		[setAnchor, onOpen]
	);

	const onClose = useCallback(() => {
		setAnchor(null);
	}, [setAnchor]);

	const renderer = props.notificationRenderer || defaultRenderer;
	const notifications = props.notifications.filter(
		(not) => !not.expires || not.expires > new Date()
	);

	return (
		<>
			<IconButton onClick={onIconClick}>
				<Badge
					badgeContent={notifications.filter((not) => !not.read).length}
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
							<Typography variant={"h6"}>Notifications</Typography>
						</Grid>
						<Grid item xs={12}>
							<Divider />
						</Grid>
						<Grid item xs={12}>
							<InfiniteScroll
								className={classes.notificationArea}
								loadMoreBottom={props.loadMore}
							>
								{notifications.map(renderer)}
							</InfiniteScroll>
						</Grid>
					</Grid>
				</Box>
			</Popover>
		</>
	);
};

export default React.memo(Notifications);
