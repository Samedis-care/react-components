# Filled toasts darken a fill until its text reaches 4.5:1

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Toast` (also every toast shown through the Framework's `useToastContext`)

## What changed

In the default `filled` variant, a toast whose text has less than 4.5:1 on its fill now
gets that fill darkened (behind dark text: lightened) by the smallest amount that reaches
4.5:1, in the same hue. The text color stays MUI's (`palette.getContrastText(palette[severity].main)`),
and fills that already reach 4.5:1 stay MUI's (`palette[severity].main`, in a dark palette
`palette[severity].dark`).

| Palette            | Severity | Fill before                 | Fill now                    |
| ------------------ | -------- | --------------------------- | --------------------------- |
| MUI default, light | info     | `#0288d1` (3.86:1)          | `rgb(1, 124, 192)` (4.52:1) |
| MUI default, light | warning  | `#ed6c02` (3.11:1)          | `rgb(193, 88, 1)` (4.50:1)  |
| samedis.care       | info     | `#0288d1` (3.86:1)          | `rgb(1, 124, 192)` (4.52:1) |
| samedis.care       | error    | `rgb(230, 45, 75)` (4.34:1) | `rgb(225, 44, 73)` (4.51:1) |
| MUI default, dark  | all      | unchanged                   | unchanged                   |

A palette color the toast cannot measure (a CSS variable, a keyword) is used as it is.
The `standard` and `outlined` variants are unchanged.

## Why

A toast's text is 14px (16px for the title), which needs a contrast of at least 4.5:1
(WCAG 1.4.3). MUI picks the text color of a filled alert against 3:1, so with MUI's
default palette info and warning toasts were below that, and with samedis.care's palette
info and error toasts.

## Migration

Nothing to do. Expect the darker info and warning toasts (samedis.care: info, and a
slightly darker error red) in screenshots. To give a severity another fill, override it in
the `CcToast` theme slot (`styleOverrides.alert`, selector `&.MuiAlert-filled.MuiAlert-colorInfo`
and so on); the fill you set there is not adjusted.
