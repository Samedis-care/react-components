# Contributing

## Adding new components

When adding new components please follow these principles and rules:

1. If possible separate your component into the different categories. Example:
   > You want to build a selection component with backend connection.
   > Split your component into a controlled view part (standalone component)
   > and build a component which controls your view part (backend component)
2. Adhere to the [React performance optimization guidelines](https://reactjs.org/docs/optimizing-performance.html#avoid-reconciliation). In summary:

- Use functional components with `React.memo` or pure components, if you use a normal component make sure to define your own shouldComponentUpdate
- Avoid inline functions and objects and other things which result in `code === code` being false, e.g. `({}) === ({})` => false. If your function/object can be static make it a static variable. Otherwise: For functional components take a look at React.useCallback and React.useMemo. For class components use properties.
- If you want to know the details: [Read more about reconciliation](https://reactjs.org/docs/reconciliation.html)
- Have multiple small components instead of one large component. This will significantly aid performance if combined with the points above.
  Unoptimized code will not be merged.

3. Write function components. Don't add class components; expose a DOM node or methods with
   `forwardRef` and `useImperativeHandle`.
4. Avoid using @ts-ignore. If you use it anyways please provide some reasoning in the comments.
5. If you build something that the user can see also build a story.
6. When building a story make sure to capture all events using Storybook's actions (`fn()` in
   `args`) and make all properties controllable through its controls.
7. Always comment your code. Especially properties and state should be explained. All functions should be commented, describing function task, params and return value.
   For what a prop's documentation has to say, see the [review checklist](#review-checklist).
8. Don't forget to export your component in the index.ts of your component's parent folder. If you create folders make sure there is an index.ts if your want to export more than one component. Don't mix components and re-exporting indexes.
9. Avoid Anonymous components:

```tsx
// Bad:
export default React.memo((props: any) => "Text");
// Also bad:
const MemoComponent = React.memo((props: any) => "Text");
export default MemoComponent;
// Good:
const Component = (props: any) => "Text";
export default React.memo(Component);
```

10. Style with `styled()` and resolve props with `useThemeProps()`, both under the name
    `Cc<ComponentName>`, and register the name in `src/theme-def.ts`. Make sure the name is
    unique, if not you may use a different name.
11. If you think these principles shouldn't apply to your specific component please provide a reasonable explanation when submitting a pull request.

## Review checklist

Every new component and every change to an existing one is held to this list, by its
author and by its reviewer. It is the standard the component audit of October 2026 applied
to the whole library; most items below come with a defect that audit found more than once.

### Correctness

- Edge cases are handled on purpose: empty, `null`/`undefined`, `0`, `NaN`, very long
  text, duplicate ids or keys, the number and date formats of every locale in
  `src/assets/i18n` (an input reads its own formatted output back), timezones.
- A prop that changes after mount takes effect. Nothing is read once at mount and then
  ignored.
- Effects list their real dependencies and clean up what they start: listeners, timers,
  debounces, observers, object URLs, pending requests. No callback runs and no state is set
  after unmount, and effects survive StrictMode's double invocation.
- Callbacks are read from the latest render (a ref), never from a copy captured earlier, so
  a replaced callback is never called.
- Async work tolerates out-of-order responses, cancellation and a second click: a stale
  response is dropped, a double submit sends once, a rejected promise is reported (the
  error reporter, an error state or the caller), never left unhandled.
- A value is controlled or uncontrolled for the component's whole life, never both.
- Persisted user data (grid settings and the like) stays readable across versions; see
  [Breaking changes](#breaking-changes).

### Structure and performance

`src/standalone/DataGrid` is the reference for structure and performance.

- One component per file.
- No `ownerState`. Variants are static `&.Cc<Name>-<state>` selectors on one styled slot,
  toggled with `combineClassNames`; dynamic numbers go into CSS custom properties. Theme
  `variants` and `styleOverrides` documented for a component must actually apply.
- Every key of a `classes` prop is applied to an element; don't declare keys that aren't.
- `React.memo` must actually hit: stable props (`useCallback`/`useMemo`/static values), no
  pre-rendered element passed as `children` to a memoized child, hover and drag state in a
  context the leaves subscribe to.
- `useThemeProps` once at the root, then a context; no drilling of class names.
- Every public component, its props type and its public hooks are exported from the
  package root (`src/index.ts` through the tier `index.ts` files), not only from a deep
  path.
- Refs work in the React versions the apps run (React 18 too): use `forwardRef` for a
  component that takes a `ref`.

### Accessibility (WCAG 2.2 AA)

- Every interactive element has an accessible name, the right role, and its state and
  value: `aria-checked`/`-expanded`/`-selected`/`-pressed`, `aria-invalid`, `aria-required`,
  `aria-describedby` linking help and error text. `IconButton`s have an `aria-label`.
- Every action works with the keyboard alone, in a logical tab order, without traps.
  `Escape` closes popups. Composite widgets (grid, tree, listbox, menu, tabs) follow the
  [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/) keyboard
  patterns. A scrollable region is reachable by keyboard.
- Keyboard focus is visible: a focus ring, not only MUI's ripple or a faint tint, and also
  in forced-colors mode.
- Focus never falls to the page. It goes somewhere sensible when a dialog or menu opens and
  closes, and when the focused control unmounts, gets disabled or is re-created. A
  confirmation that destroys or discards something starts on the safe choice.
- Async results, validation errors, toasts and loading are announced (`aria-live`,
  `role="status"`/`"alert"`, `aria-busy`).
- Semantics: headings, lists, tables with header cells, landmarks, buttons for actions and
  links for navigation. Decorative icons are hidden from assistive technology, and
  meaningful images have alt text.
- Color is never the only signal (dirty, error, warning, selection). Text contrast is at
  least 4.5:1, UI and focus indicators at least 3:1. Targets are at least 24×24 px.
  Motion respects `prefers-reduced-motion`.
- The layout reflows at 320 px: long words wrap and nothing scrolls the page sideways.
- Every user-facing text is translated, including `aria-label`s and `title`s, and every key
  exists in every locale.

### Documentation

- Every exported component, props interface, prop, hook and type has JSDoc. A prop's
  documentation states its meaning, its default, the format of its value (`Date` or ISO
  string, id or record, `null` or `undefined`), and for a callback when it fires and with
  which arguments.
- Every visible component has a story that shows its states, with controls for its props
  and actions for its callbacks.

### Tests

- Logic, rendering and ARIA get unit tests (`test/`, jsdom). Layout, focus, keyboard,
  real events and canvas get story tests (`play` functions, real Chromium). Phone-only UI
  gets a story at the xs viewport.
- A test asserts behavior the component controls, not implementation details. Check each
  new assertion once by breaking it: flip the expectation and see the test fail.
- No whole-tree snapshots and no real sleeps: use `findBy`/`waitFor` or fake timers. A test
  leaves no pending timer or debounce behind when its file ends.
- Backend components are tested against `src/stories/test-utils` (`MockConnector`,
  `TestModel`), not by mocking library modules.
- Stories run axe with `parameters: { a11y: { test: "error" } }`, so an accessibility
  regression fails the story tests (`pnpm run test:stories`, which CI runs on every push to
  `master`; the global default in `.storybook/preview.ts` is only `"todo"`). Disable a
  single rule only with a comment that says why.
- A bug fix comes with a test that failed before the fix.

## Code Style

- The formatting is automatically set and corrected by prettier and enforced using git commit hooks.
- Do not store non-mutable/read-only data in the component state. Use static class properties or static functions instead.
- Use Material-UI Styles/Theme. Do not create global CSS styles. Avoid inline styles.

## Breaking changes

Backward compatibility is not a hard requirement — prefer a clean API over a
compatible one. In exchange, record every breaking change as a new file in
[`breaking-changes/`](breaking-changes/README.md) so the consuming apps know what to
adjust. Behavioral changes count too, not just type changes.

## Translating

Translations live in `src/assets/i18n/<lang>/translation.json`, one folder per locale.
Fork & clone the repository and edit those files directly.

`en` is the source language and the fallback, so a key missing from another locale renders
in English rather than failing — please fill in every locale you can. When you're done,
commit, push and open a pull request. See
[`src/assets/i18n/README.md`](src/assets/i18n/README.md) for how to add a new language.
