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
	PopoverOwnerState,
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
import visuallyHidden from "../../utils/internal/visuallyHidden";

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
	IconButtonProps?: Omit<
		IconButtonProps,
		"onClick" | "aria-haspopup" | "aria-expanded" | "aria-controls"
	>;
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
	 * A custom notification renderer (optional)
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

// announces new notifications (a live region must exist before its text
// changes, so it is rendered while announcements are on)
const StyledAnnouncement = styled("span", {
	name: "CcNotifications",
	slot: "announcement",
})(visuallyHidden);

/**
 * Theme style slots of Notifications
 * (`components.CcNotifications.styleOverrides.<slot>`), and the keys of its
 * `classes` prop:
 * - `notificationArea`: the scrolling list of notifications in the popover
 * - `header`: the popover's "Notifications" heading
 * - `announcement`: the visually hidden status region that announces new
 *   notifications (see `disableAnnouncement`)
 */
export type NotificationsClassKey =
	"notificationArea" | "header" | "announcement";

/** An announcement of new notifications */
interface Announcement {
	/** By how much the unread count rose */
	count: number;
	/** Tells announcements apart: each one is a new element */
	id: number;
}

const Notifications = (inProps: NotificationsProps) => {
	const props = useThemeProps({ props: inProps, name: "CcNotifications" });
	const { t } = useCCTranslations();
	const headerId = useId();
	const dialogId = useId();

	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const open = anchor !== null;
	const {
		onOpen,
		loadLatest,
		loadRead,
		loadUnread,
		refreshInterval,
		unreadCount,
		disableAnnouncement,
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

	const customPopoverSlotProps = popoverProps?.slotProps;
	// the paper is a modal dialog (focus trap, the page behind is hidden from
	// assistive technology) named by its heading. The caller's paper props go
	// over these, except the id the bell's aria-controls refers to.
	const popoverSlotProps = useMemo((): PopoverProps["slotProps"] => {
		const customPaper = customPopoverSlotProps?.paper;
		const dialogProps = {
			role: "dialog",
			"aria-modal": true,
			"aria-labelledby": headerId,
		};
		return {
			...customPopoverSlotProps,
			paper:
				typeof customPaper === "function"
					? (ownerState: PopoverOwnerState) => ({
							...dialogProps,
							...customPaper(ownerState),
							id: dialogId,
						})
					: { ...dialogProps, ...customPaper, id: dialogId },
		};
	}, [customPopoverSlotProps, headerId, dialogId]);

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
		void loadLatest();
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
	// the first load: the count it brings is not announced
	const [firstLoadDone, setFirstLoadDone] = useState(false);
	useEffect(() => {
		let mounted = true;
		const done = () => {
			if (mounted) setFirstLoadDone(true);
		};
		const load = loadLatest();
		// React renders the state the app sets before its promise settles
		// together with firstLoadDone (its render waits for the promise
		// callbacks), so counting starts from the first load's count. A
		// rejection stays unhandled, as on every other call: the promise
		// finally() returns rejects with it.
		if (load instanceof Promise) void load.finally(done);
		else done();
		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const Renderer = props.notificationRenderer || DefaultRenderer;
	const notifications = props.notifications.filter(
		(not) => !not.expires || not.expires > new Date(),
	);
	const unread = unreadCount ?? notifications.filter((not) => !not.read).length;

	// the unread count as the announcement counts it: null until the first
	// load is done and while announcements are off, 0 for a negative count or
	// NaN. A rise from the count of the render before is announced.
	const counted =
		firstLoadDone && !disableAnnouncement ? (unread > 0 ? unread : 0) : null;
	const [lastCounted, setLastCounted] = useState<number | null>(null);
	const [announcement, setAnnouncement] = useState<Announcement | null>(null);
	if (lastCounted !== counted) {
		setLastCounted(counted);
		if (counted === null) {
			setAnnouncement(null);
		} else if (lastCounted !== null && counted > lastCounted) {
			const count = counted - lastCounted;
			setAnnouncement((prev) => ({ count, id: (prev?.id ?? 0) + 1 }));
		}
	}
	useEffect(() => {
		if (!announcement) return;
		const timeout = window.setTimeout(
			() => setAnnouncement(null),
			ANNOUNCEMENT_DURATION,
		);
		return () => window.clearTimeout(timeout);
	}, [announcement]);

	return (
		<div className={className}>
			<IconButton
				size="large"
				// the label replaces the button's content, the badge's number included
				aria-label={
					unread > 0
						? t("standalone.notifications.bell-label", { count: unread })
						: t("standalone.notifications.title")
				}
				{...IconButtonProps}
				onClick={onIconClick}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={open ? dialogId : undefined}
			>
				<Badge
					badgeContent={unread}
					max={99}
					color={"error"}
					{...props.BadgeProps}
				>
					<NotificationsIcon />
				</Badge>
			</IconButton>
			{!disableAnnouncement && (
				<StyledAnnouncement role={"status"} className={classes?.announcement}>
					{announcement && (
						<span key={announcement.id}>
							{t("standalone.notifications.announce-new", {
								count: announcement.count,
							})}
						</span>
					)}
				</StyledAnnouncement>
			)}
			<Popover
				open={open}
				anchorEl={anchor}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				onClose={onClose}
				{...popoverProps}
				slots={popoverSlots}
				slotProps={popoverSlotProps}
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
								className={classes?.notificationArea}
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
