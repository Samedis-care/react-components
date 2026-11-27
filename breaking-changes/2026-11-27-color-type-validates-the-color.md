# A model's color field refuses text that is no color

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `TypeColor` and its renderer `ModelDataTypeColorRendererCC`: every model
  field of the color type, in forms and in the CRUD import

## What changed

`TypeColor.validate` now checks the value. A form shows "Please enter a valid color,
such as #336699" (in the library's language) under a color field whose text is not a
color, marks the field invalid, and refuses to save, like any other validation error.
The CRUD import reports the same message for such a value.

A color is one of the formats MUI's palette reads:

- `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, hex digits in either case (`#00788A`);
- `rgb(8, 105, 179)` and `rgba(8, 105, 179, 0.5)`: comma-separated numbers from 0 to
  255, an optional alpha from 0 to 1;
- `hsl(210, 50%, 40%)` and `hsla(210, 50%, 40%, 0.5)`: a hue from 0 to 360, saturation
  and lightness in percent, an optional alpha.

Anything else is refused: a typo (`zzz`, `abc`, `#12345`), a color name (`red`,
`transparent`), the space-separated syntax (`rgb(8 105 179)`), percentages in `rgb()`,
uppercase function names, and spaces before or after the color.

No color (`""` or `null`) is still accepted. Values are not converted: a color is stored
as it was typed or stored before, and the picker still reports lowercase `#rrggbb`.
`ColorInput` itself checks nothing, as MUI's `TextField`.

## Why

Any text was saved: a typo, an emptied field or a color name. An app that builds a MUI
theme from stored colors (`createTheme({ palette: { primary: { main } } })`) then fails
to render, since MUI throws "Unsupported color" for `zzz`, `abc` and `red`, and computes
`NaN` shades from `#zzz` or `rgb(8 105 179)`. The picker also showed something else than
what was saved (`abc` as `#aabbcc`, `zzz` as black).

## Migration

- **Required for any app that stores colors in another format** (color names, the
  space-separated syntax, `hsl()` without percent signs): convert the stored values to
  one of the formats above. Until then a form that shows such a value refuses to save
  until the user corrects it. Colors in the formats above, such as `rgb(8, 105, 179)` or
  `#00788A`, need nothing.
- **Required for any app that builds a theme from a color field that must not be
  empty** (a palette's `main`): give that field `validate: validatePresence`. An empty
  color is still accepted by the type, and MUI's `createTheme` throws for `""` as `main`.

  ```ts
  primary_color: {
    type: new ModelDataTypeColorRendererCC(),
    getLabel: () => t("fields.primary_color"),
    validate: validatePresence,
    // …
  },
  ```

- An app that needs to accept other text in a color field overrides `validate` in a
  subclass of the renderer.
