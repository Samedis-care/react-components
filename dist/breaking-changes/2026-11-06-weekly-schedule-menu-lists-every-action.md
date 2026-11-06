# The weekly schedule's settings menu lists every action

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (`WeeklySchedule`)

## What changed

When `WeeklySchedule` moves its filters and actions into the settings menu (more than two
filters or more than one action), the menu now lists every action, in order. It used to
leave out the first action, which was then rendered nowhere: with `actions={[A, B]}` the
menu showed only B, and with three filters and one action the action could not be reached.

The divider in the menu now separates the filters from the actions only when the menu holds
both. It used to be drawn whenever there were more than two filters, so it ended the menu
when there were no actions, and was missing between the filter and the actions with two
filters and two actions.

With at most two filters and at most one action nothing changes: the action stays inline
in the header.

## Why

Every action passed to the schedule has to be reachable. `ScrollableSchedule` already lists
all actions in its menu.

## Migration

Nothing to do, unless an app worked around the missing first action (a placeholder first
action, or the first action rendered outside the schedule): remove the workaround, the
first action now shows up in the menu. samedis.care passes two filters and one action,
which stay inline, so it is not affected.
