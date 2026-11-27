# InlineSwitch requires onChange unless it is disabled

- **Date:** 2026-11-27
- **Kind:** type
- **Scope:** `standalone/InlineSwitch` (`InlineSwitch`, `InlineSwitchProps`)

## What changed

`onChange` is required unless `disabled` is `true`. These no longer compile:

```tsx
<InlineSwitch value={on} visible label="Show inactive" />
<InlineSwitch value={on} visible label="Show inactive" disabled={false} />
<InlineSwitch value={on} visible label="Show inactive" disabled={readOnly} /> // readOnly: boolean
```

A switch with `onChange` compiles with any `disabled`, and a switch with `disabled` (the
literal `true`) compiles without `onChange`. A `styled(InlineSwitch)(…)` component has the
same rule. With options (`styled(InlineSwitch, { name, slot })`), MUI's typing merges the
union's members, so `onChange` is optional on such a component and the rule is not checked
there.

`InlineSwitchProps` is now a type alias of an intersection with a union, no longer an
interface: an `interface … extends InlineSwitchProps` does not compile, and
`Omit<InlineSwitchProps, …>` drops the rule (it merges the union's members, so `onChange`
becomes optional).

What renders is unchanged.

## Why

A switch shown without `onChange` looked operable, Tab stopped on it and screen readers
announced an operable switch, but a click or Space changed nothing (WCAG 4.1.2 Name, Role,
Value). A switch the user can toggle needs a handler; one the user cannot toggle is
disabled.

## Migration

Required for any app that renders an InlineSwitch without `onChange`: pass the handler that
sets the value, or `disabled` for a switch that only shows a state.

```tsx
const [showInactive, setShowInactive] = useState(false);

<InlineSwitch
	value={showInactive}
	onChange={setShowInactive}
	visible
	label={t("show-inactive")}
/>;

// a state the user cannot change here
<InlineSwitch value={record.active} visible label={t("active")} disabled />;
```

A `disabled` that is a `boolean` needs `onChange`; if the switch has no handler, pass
`disabled` alone.

Required for any app that extends `InlineSwitchProps` with an interface: write
`type MySwitchProps = InlineSwitchProps & { … }`. Required for any app that derives props
with `Omit<InlineSwitchProps, …>` and wants to keep the rule: use `DistributiveOmit` from
the package root.
