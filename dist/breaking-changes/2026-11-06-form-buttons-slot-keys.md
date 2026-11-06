# FormButtons keys its slots by the buttons' keys and flattens nested arrays

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (FormButtons; DefaultFormPageButtons, FlowEngineFormPageButtons)

## What changed

FormButtons now takes its children through `React.Children.toArray`:

- A slot is keyed by its button's own `key`, or by the button's position among the
  children (inside an array, its position in that array). A button keeps its DOM node,
  focus included, when a conditional button before it disappears, and the removed
  button's node goes away. Slots used to be keyed by their index among the remaining
  children, so the next button was rendered into the removed button's node.
- Arrays among the children are flattened before the slots are made, so `null`,
  `undefined` and booleans inside an array (such as DefaultFormPageButtons'
  `extraButtons`) get no slot. Each of them used to get an empty slot, which added the
  slot's margin and the grid gap, and a bar of nothing but such entries rendered an empty
  bar instead of nothing.
- The buttons' own keys now reach React, so two buttons with the same key in one array
  produce React's duplicate-key warning.

## Why

Focus stayed on the reused node, which then showed the next button: a second Enter
activated that button, and screen readers were not told that focus had moved.

## Migration

- Give the buttons of an array (such as `extraButtons`) unique keys.
- Expect the gaps that falsy entries of `extraButtons` arrays left in the button bar to
  disappear.
