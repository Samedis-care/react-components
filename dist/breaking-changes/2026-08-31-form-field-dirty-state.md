# Form fields can display their dirty state

- **Date:** 2026-08-31
- **Kind:** type
- **Scope:** `backend-components/Form`, `backend-integration/Model`, `standalone/UIKit`

## What changed

A field rendered by `FormField` can now be marked as modified — a small blue dot after its
label. **Nothing is marked unless the application asks for it**, so no existing form
changes appearance.

### Switching it on

`FormProps.showDirtyState` marks the fields whose value differs from the server-side one:

```tsx
<Form model={model} id={id} showDirtyState>
	{FormContent}
</Form>
```

That answer is a diff, not a latch: it goes back to `false` when the user restores the
original value, and it is `true` for a value set programmatically that the user never
touched. It is independent of `touched`.

### Marking fields from the application

Which fields count as modified is not always the form engine's call, so the display is
driven by a context rather than by the form's own state. `DirtyStateProvider` sets it for
a subtree, taking the marks outright or a function which is handed the form engine's own
per-field state to build on:

```tsx
<DirtyStateProvider marks={marks}>{fields}</DirtyStateProvider>
```

A change request workflow is the case this exists for: the proposed record is saved, so
the form is not dirty, and the fields the proposal touches still have to stand out.

`Form` always sets the marks — to its own per-field state with `showDirtyState`, and to
none without — so a nested form never inherits the marks of the form around it.

`useDirtyState(field)` reads the resolved flag, which is how a custom (non-model) field
follows the same switch as the model fields. `useDirtyState()` returns the whole map.

The switch itself is on both the full and the lite form context as `showDirtyState`, for a
control which holds dirty state of its own — a queued upload, a nested editor — and wants
to display it on the same terms as the model fields.

### `RenderParams.dirty`

`RenderParams` gained a **required** `dirty: boolean`, next to the existing `touched`.
Every renderer in the library forwards it to its control the same way it already forwards
`warning`. It is the resolved display flag, whatever produced it, and `false` wherever
there is no form state behind the control — data grid cells and the CRUD import preview.

### `FormContextData.dirtyFields`

`Record<string, boolean>`, one entry per model field and nothing else — what the form
engine computed, regardless of what is displayed. Custom (non-model) fields are
deliberately absent: whatever reports one through `setCustomFieldDirty` — a nested form,
`useLazyCrudConnector`'s upload queue — already holds that state and is responsible for
displaying it. The form only folds it into the form-wide `dirty` flag.

### The marker

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

See the `Backend-Components/Form` → `DirtyState`, `DirtyStateHidden` and
`DirtyStateProvided` stories.

## Why

A long form gives no answer to "what did I actually change?" before saving. The form
engine already computed the whole-record dirty flag on every keystroke — the per-field
answer was one comparison away but never reached the controls.

It is off by default, and driven by a context rather than by the form's dirty state
directly, because "modified" is a statement to the user and the application is what knows
when to make it. A form which shows a saved proposal against its baseline has a per-field
answer the form engine cannot compute, and a form which is simply being filled in may not
want the noise at all.

## Migration

Nothing to do to keep the current appearance — the marker only shows where it is asked
for.

Code that builds a `RenderParams` by hand — a custom `Type.render` caller, a test fixture,
a Storybook story — has to add `dirty`. Pass `false` where there is no form behind it.

A custom renderer does not have to do anything; it will ignore `dirty` and never mark
anything. Forward it to the control, next to `warning`, to join in.
