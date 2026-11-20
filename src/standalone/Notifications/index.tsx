import React, {
	CSSProperties,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useState,
} from "react";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import {
	Badge,
	BadgeProps,
	Box,
	Divider,
	Grid,
	IconButton,
	IconButtonProps,
	Popover,
	PopoverOrigin,
	PopoverPaper,
	PopoverProps,
	styled,
	Tooltip,
	Typography,
	useThemeProps,
} from "@mui/material";
import InfiniteScroll, { InfiniteScrollProps } from "../InfiniteScroll";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";
import useCurrentLocale from "../../utils/useCurrentLocale";

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

/** The longest delay browsers support for a timer (about 24.8 days) */
const MAX_TIMER_DELAY = 2 ** 31 - 1;
const DEFAULT_REFRESH_INTERVAL = 60000;

/**
 * The delay of the polling interval for a `refreshInterval`, or `null` for no
 * polling. Browsers convert a delay to a 32-bit integer: they run `0`, `NaN`,
 * `Infinity` and negative numbers at their minimum delay of a few ms, and wrap
 * values of 2^31 and more around (2^31 itself to a negative number), so none
 * of them may reach `setInterval`.
 * @param refreshInterval The prop value
 */
const getPollingDelay = (
	refreshInterval = DEFAULT_REFRESH_INTERVAL,
): number | null => {
	if (refreshInterval === 0 || refreshInterval > MAX_TIMER_DELAY) return null;
	if (!(refreshInterval > 0)) return DEFAULT_REFRESH_INTERVAL; // negative, NaN
	return refreshInterval;
};

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "right",
};

const transformOrigin: PopoverOrigin = {
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

const DefaultRenderer = (notification: Notification): React.ReactElement => {
	const locale = useCurrentLocale();
	return (
		<Box
			sx={{ p: 2 }}
			style={notification.read ? readStyle : unreadStyle}
			key={notification.id}
		>
			<Grid container spacing={2}>
				<Grid size="grow">
					{notification.image && (
						<img style={defaultImageStyle} src={notification.image} alt={""} />
					)}
				</Grid>
				<Grid size={9}>
					<Box sx={{ py: 2 }}>
						<Grid container spacing={2}>
							<Grid size={12}>
								<Typography>{notification.message}</Typography>
							</Grid>
							<Grid size={12}>
								<Typography variant={"body2"}>
									<React.Fragment>
										{notification.origin && <>{notification.origin} </>}
									</React.Fragment>
									<Tooltip title={notification.created.toLocaleString(locale)}>
										<span>{timestampToAge(notification.created)}</span>
									</Tooltip>
								</Typography>
							</Grid>
						</Grid>
					</Box>
				</Grid>
				<Grid size={12}>
					<Divider />
				</Grid>
			</Grid>
		</Box>
	);
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
})({}) as typeof Typography;

export type NotificationsClassKey = "notificationArea" | "header";

const Notifications = (inProps: NotificationsProps) => {
	const props = useThemeProps({ props: inProps, name: "CcNotifications" });
	const { t } = useCCTranslations();
	const headerId = useId();

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
		IconButtonProps,
		PopoverProps: popoverProps,
	} = props;

	const customPopoverSlots = popoverProps?.slots;
	const popoverSlots = useMemo(
		() => ({
			...customPopoverSlots,
			paper: customPopoverSlots?.paper ?? NotificationsPaper,
		}),
		[customPopoverSlots],
	);

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

	const pollingDelay = getPollingDelay(refreshInterval);
	useEffect(() => {
		window.addEventListener("focus", handleLoadLatest);
		const intervalHandle =
			pollingDelay === null
				? undefined
				: window.setInterval(handleLoadLatest, pollingDelay);
		return () => {
			window.removeEventListener("focus", handleLoadLatest);
			window.clearInterval(intervalHandle);
		};
	}, [handleLoadLatest, pollingDelay]);
	useEffect(() => {
		// initial load
		handleLoadLatest();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const Renderer = props.notificationRenderer || DefaultRenderer;
	const notifications = props.notifications.filter(
		(not) => !not.expires || not.expires > new Date(),
	);

	return (
		<div className={className}>
			<IconButton
				size="large"
				aria-label={t("standalone.notifications.title")}
				{...IconButtonProps}
				onClick={onIconClick}
			>
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
				{...popoverProps}
				slots={popoverSlots}
			>
				<Box sx={{ p: 2 }}>
					<Grid container spacing={2}>
						<Grid size={12}>
							<StyledHeader
								component={"h2"}
								variant={"h6"}
								className={classes?.header}
								id={headerId}
							>
								{t("standalone.notifications.title")}
							</StyledHeader>
						</Grid>
						<Grid size={12}>
							<Divider />
						</Grid>
						<Grid size={12}>
							<StyledInfiniteScroll
								loadMoreBottom={loadRead}
								loadMoreTop={loadUnread}
								className={classes?.notificationArea ?? ""}
								role={"region"}
								aria-labelledby={headerId}
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
