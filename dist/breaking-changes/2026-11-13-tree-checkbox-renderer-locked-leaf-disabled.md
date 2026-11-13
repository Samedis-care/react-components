# TreeViewCheckboxSelectionRenderer disables a locked leaf's checkbox

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Tree` (`TreeViewCheckboxSelectionRenderer`)

## What changed

The checkbox of a leaf with `expandLocked: true` is disabled: it is greyed out like any
disabled MUI checkbox, keeps showing the leaf's `expanded` state (checked or not), is
skipped by Tab, and a screen reader announces it as unavailable. Before, it looked and
was announced as an ordinary checkbox, took focus, and a click or Space did nothing.

Entries with children (the chevron) and custom renderers are unchanged.

## Why

A control that cannot be changed has to say so (WCAG 4.1.2 Name, Role, Value). The
locked checkbox invited a click that silently did nothing.

## Migration

Nothing to do. Expect the checkboxes of locked leaves to be greyed out in screenshots. If
you set `expandLocked` on a leaf while its checkbox has keyboard focus (for example while
saving the selection), the checkbox loses focus, as any MUI control does when it gets
disabled.
