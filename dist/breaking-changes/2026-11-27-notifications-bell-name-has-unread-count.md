# Notifications: the bell's name includes the unread count

- **Date:** 2026-11-27
- **Kind:** behavior, i18n
- **Scope:** `standalone/Notifications`

## What changed

While anything is unread, the bell's accessible name includes the unread count:
"Notifications, 2 unread" instead of "Notifications". The count is the one the badge
shows (`unreadCount`, or the number of unread, non-expired `notifications`), and it stays
exact above 99, where the badge shows "99+". With nothing unread the name is
"Notifications", as before. The text is the new key `standalone.notifications.bell-label`,
with the plural forms of every locale.

An `aria-label` in `IconButtonProps` still replaces the whole name.

## Why

The bell's `aria-label` replaces the button's content, the badge included, so the unread
count never reached assistive technology: screen-reader users were not told that anything
was unread (WCAG 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value).

## Migration

**Required for any app that passes its own `aria-label` in `IconButtonProps`**: that label
still replaces the name, so without a change the app's bell has no count in its name and
screen-reader users are not told about unread notifications. Remove the label to get the
default name, which is translated in every locale, or put the count into your own label:

```tsx
// the default name: "Notifications" or "Notifications, 2 unread"
<Notifications unreadCount={unreadCount} /* … */ />;

// or a label of your own, with the count
const iconButtonProps = useMemo(
	() => ({
		"aria-label":
			unreadCount > 0
				? t("bell-with-unread", { count: unreadCount })
				: t("bell"),
	}),
	[t, unreadCount],
);
<Notifications
	unreadCount={unreadCount}
	IconButtonProps={iconButtonProps}
	/* … */
/>;
```

Tests that look up the bell by its exact name "Notifications" find it only while nothing
is unread; match the start of the name instead (`{ name: /^Notifications/ }`).
