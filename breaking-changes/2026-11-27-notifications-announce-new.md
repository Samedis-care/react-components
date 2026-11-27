# Notifications announces new notifications

- **Date:** 2026-11-27
- **Kind:** behavior, i18n, type
- **Scope:** `standalone/Notifications`

## What changed

When the unread count rises, Notifications announces it to screen readers: a visually
hidden polite status region (`role="status"`, theme slot `announcement`, `classes.announcement`)
says by how much, e.g. "1 new notification" or "3 new notifications". The text is the new
key `standalone.notifications.announce-new`, with the plural forms of every locale, and it
is removed again after a few seconds.

Not announced: the count on mount, the count the first `loadLatest` call brings, a falling
count. The new prop `disableAnnouncement` switches the announcement off, for one
Notifications or, through the theme's `CcNotifications.defaultProps`, for all of them.

`loadLatest` is typed `() => void | Promise<unknown>` (was `() => void`). When it returns
the promise of the load, the count that first load brings is not announced. A function
that returns nothing counts as done on mount, so a count it brings later is announced.

## Why

A notification that arrives while the user works elsewhere on the page (an export that is
delivered as a notification, for example) changed only the badge: sighted users saw it,
screen-reader users heard nothing until they reached the bell.

## Migration

**Required for any app whose `loadLatest` loads the unread count without returning the
load's promise** (it starts a request and returns nothing): otherwise screen readers say
"3 new notifications" each time the app starts while 3 are unread. Return the promise, and
set the count before it settles:

```tsx
const loadLatest = useCallback(async () => {
	const { notifications, unreadCount } = await fetchLatest();
	setNotifications(notifications);
	setUnreadCount(unreadCount);
}, []);
```

An async `loadLatest` that sets the count before it returns needs no change.

**Required for any app whose `loadLatest` returns a value that is neither `undefined` nor a
promise** (e.g. `() => counter++`): it no longer compiles. Return nothing, or the promise of
the load.

**Required for any app that announces new notifications itself** (its own live region or
toast for a rising count): set `disableAnnouncement`, or remove the app's own announcement,
so screen readers don't say it twice.

Tests that look up a single element by `role="status"` next to a Notifications find its
status region too.
