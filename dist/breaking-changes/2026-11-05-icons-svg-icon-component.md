# The icons are typed as Material icons

- **Date:** 2026-11-05
- **Kind:** type
- **Scope:** `standalone/Icons`

## What changed

`FilterIcon`, `FilterActiveIcon`, `SignIcon`, `TuneIcon`, `ResetIcon`, `ExportIcon`,
`AppsIcon` and `SuccessOutlinedIcon` are typed as `SvgIconComponent` from
`@mui/icons-material`, the type of every Material icon. They used to be typed
`NamedExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>`. Like a
Material icon, each one now carries MUI's `muiName` (`SvgIcon.muiName`) on its render
function. `DataGridColumnHeaderFilterIcon` and `DataGridColumnHeaderFilterActiveIcon`,
typed `typeof FilterIcon`, change with them.

What the icons render is unchanged.

A prop, an icon map or a config typed `SvgIconComponent` now accepts these icons, as it
accepts any Material icon, without a cast.

Because the type is now MUI's, a few things that compiled against the old type no longer
do, the same as for a Material icon:

- `FilterIcon.displayName` and `FilterIcon.$$typeof` are not part of the type.
- `React.ComponentProps<typeof FilterIcon>`, and the props of `styled(FilterIcon)`, have
  no `component` key. `<FilterIcon component="span" />` still compiles.

## Why

An app type built on `SvgIconComponent` took every Material icon but none of these, so
the app had to cast them. The icons are meant to be interchangeable with Material icons.

## Migration

Nothing to do for icons used as JSX (`<FilterIcon … />`) or passed to the library's own
`icon` props.

- A cast that only made one of these icons fit `SvgIconComponent` can go.
- An app's own copy of one of these icons, kept to have it typed as `SvgIconComponent`, can
  be replaced by the library icon.
- Code that reads `displayName` or `$$typeof` from one of these icons needs a cast. Code
  that takes an icon's props from `React.ComponentProps<typeof …>` and needs `component`
  uses `SvgIconProps` instead.
