# Form fields carry their dirty state

- **Date:** 2026-08-31
- **Kind:** behavior
- **Scope:** `backend-components/Form`, `backend-integration/Model`, `standalone/UIKit`

## What changed

Every field rendered by `FormField` now knows whether its value differs from the
server-side value, and says so in the DOM. Three pieces:

### `RenderParams.dirty`

`RenderParams` gained a **required** `dirty: boolean`, next to the existing `touched`.
Every renderer in the library forwards it to its control the same way it already
forwards `warning`.

`dirty` is a diff, not a latch: it goes back to `false` when the user restores the
original value, and it is `true` for a value set programmatically that the user never
touched. It is `false` wherever there is no form state to diff against — data grid
cells and the CRUD import preview.

### `FormContextData.dirtyFields`

`Record<string, boolean>`, one entry per model field and nothing else. Custom (non-model)
fields are deliberately absent: whatever reports one through `setCustomFieldDirty` — a
nested form, `useLazyCrudConnector`'s upload queue — already holds that state and is
responsible for displaying it. The form only folds it into the form-wide `dirty` flag.

### The marker

**A modified field now renders a small blue dot after its label.** This is new UI on
every existing form.

The other obvious markers were taken: an asterisk means required, and tinting the input
reads as a state it isn't — yellow is a warning, red an error, blue the focus ring. A dot
beside the label stacks with all three.

Most controls get it as a `::after` on their label, from `withMuiFieldState`. Three label
themselves in a way that rule can't reach, and carry the marker themselves instead:

- `BaseSelector` (so every selector) renders its label as a *sibling* of the autocomplete
  rather than inside the text field, so its own `StyledLabel` is wrapped in
  `withMuiFieldState` and marked there.
- `FileUploadGeneric` and `ImageSelector` label themselves with a fieldset legend, and
  `MultiSelectWithTags` with a `Typography`; those three gained a `dirty` prop and render
  the marker as an element.

All of them draw the same dot; `DirtyMarker` and `dirtyMarkerStyles` are exported for
custom renderers that need one or the other.

Two theme slots control it. `CcFieldState` is shared by every control wrapped in
`withMuiFieldState`, `CcDirtyMarker` styles the element version:

```ts
// recolour it
CcDirtyMarker: { styleOverrides: { root: { backgroundColor: "#7b1fa2" } } },
// or take it off entirely
CcFieldState: {
	styleOverrides: {
		root: { "& > .MuiFormLabel-root::after": { display: "none" } },
	},
},
```

Outlined inputs need one extra thing, already handled: the notch in the border is sized
by a second copy of the label that the pseudo element can't reach, so the marker styles
widen it. A custom marker that is wider than the stock dot has to widen it further.

### The DOM

`FormField` also wraps what the type renders in a `FormFieldStateWrapper`:

```html
<div data-cc-field="first_name" data-cc-dirty="true">…the control…</div>
```

The wrapper is `display: contents`, so it takes part in no layout — a field inside a
`Grid` item still lays out exactly as before — while still being a CSS ancestor the
theme can select through (`CcFormFieldStateWrapper`). Controls that take the `dirty` prop
additionally carry `data-cc-dirty` on their own root. Neither carries styling of its own;
they are there for markers the label-based one can't express.

See the `Backend-Components/Form` → `DirtyState` story for the whole spread of controls.

## Why

A long form gives no answer to "what did I actually change?" before saving. The form
engine already computed the whole-record dirty flag on every keystroke — the per-field
answer was one comparison away but never reached the controls.

Deriving the per-field map from the same normalization pass that computes the form-wide
flag means the added cost is one `JSON.stringify` per field, and the pass itself now
runs once per value change rather than once for the flag and once for the map.

## Migration

**Expect the dot in screenshots and visual regression baselines** on every form where a
field differs from the server value. Turn it off through `CcFieldState` (above) if the
application wants to introduce it on its own schedule.

Two more things to check:

- Code that builds a `RenderParams` by hand — a custom `Type.render` caller, a test
  fixture, a Storybook story — has to add `dirty`. Pass `false` where there is no form
  behind it.
- **Anything that assumed the control is the direct child of whatever the application
  puts around `FormField`.** `display: contents` only suppresses the wrapper's *box* —
  it is still a node in the DOM tree, so a child combinator like
  `.myFormRow > .MuiFormControl-root` no longer matches, and `control.parentElement` is
  now the wrapper. Descendant selectors (`.myFormRow .MuiFormControl-root`) are
  unaffected, and so is layout: the control still participates in the grid or flex
  container as if the wrapper were not there.

A custom renderer does not have to do anything — it will simply ignore `dirty` and be
covered by the wrapper. Forward it to the control if you want the attribute on the
control root as well.
