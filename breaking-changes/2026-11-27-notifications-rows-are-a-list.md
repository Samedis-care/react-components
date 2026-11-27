# Notifications renders its rows as a list, and the default row says "Unread"

- **Date:** 2026-11-27
- **Kind:** behavior, i18n, type
- **Scope:** `standalone/Notifications`

## What changed

The rows in the popover are a list: a `<ul role="list">` inside the scroll container
(`notificationArea`), with each row, of the default or a custom `notificationRenderer`,
in an `<li>`. Two new theme slots and `classes` keys style them: `list` (the `<ul>`,
without markers, margin or padding) and `listItem` (each `<li>`, `position: relative`).
While there are no notifications, no list is rendered.

The default row of an unread notification starts with the visually hidden text "Unread",
the new key `standalone.notifications.unread`, in every locale.

`NotificationsClassKey` has the new keys `list` and `listItem`.

## Why

The rows were a run of plain elements: screen readers did not say how many notifications
there are and could not move from one to the next, and nothing told them which
notifications are new, since the default row marks a read one only by dimming it
(WCAG 1.3.1 Info and Relationships).

## Migration

**Required for any app whose `notificationRenderer` shows whether a notification is read**
(dims, bolds or marks the unread ones): say it in text too, or screen-reader users cannot
tell new notifications from old ones. A visually hidden "Unread" at the start of an unread
row, as the default row has, does it:

```tsx
import { visuallyHidden } from "@mui/utils";

const Row = (notification: Notification) => (
	<div className={notification.read ? "read" : "unread"}>
		{!notification.read && <span style={visuallyHidden}>{t("unread")} </span>}
		{notification.message}
	</div>
);
```

**Required for any app whose `notificationRenderer` renders an `<li>`**: render another
element, since the row is inside an `<li>` now.

**Required for any app whose styles or tests select the rows as children of the scroll
container** (e.g. `notificationArea: { "& > div": … }`, or `.notificationArea > *`):
select them as the list's items (`"& > ul > li"`), or style them through the `listItem`
slot or `classes.listItem`.

A row's absolutely positioned content is now placed relative to its `<li>`, not to the
popover's paper.
