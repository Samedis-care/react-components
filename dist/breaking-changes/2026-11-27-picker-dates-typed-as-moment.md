# The date pickers' dates are typed as Moment, and their ref as the field's root div

- **Date:** 2026-11-27
- **Kind:** type, behavior
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedKeyboardDatePicker`,
  `LocalizedDatePicker`, `LocalizedDateTimePicker`), the props types built from theirs
  (`DateTimeInput`'s `onChange` and `onAccept`, the `CcLocalizedKeyboardDatePicker` theme
  defaults), and MUI X's own pickers in a program that imports the library

## What changed

- Every date a picker takes or reports is typed as a `Moment`, or `null` for no date:
  `value`, `defaultValue`, `referenceDate`, `minDate`, `maxDate`, on the date-time picker
  also `minDateTime`, `maxDateTime`, `minTime` and `maxTime`, and the dates `onChange`,
  `onAccept`, `shouldDisableDate` and `shouldDisableTime` get. MUI types them as its
  `PickerValidDate`, which is `any` in a program that loads no date adapter's types, as an
  app that never imports `@mui/x-date-pickers/AdapterMoment` itself. The pickers'
  declaration files now load the types of MUI's `AdapterMoment`, which make
  `PickerValidDate` a `Moment`.
- That holds for the whole program that imports a picker, from the package root or by its
  own path: MUI X's own pickers and types are typed with `Moment` there too (`DatePicker`'s
  `value`, `PickerValidDate`). A program that also loads another adapter's types gets
  either date type there.
- `ref` is typed as `Ref<HTMLDivElement>`: the field's root `div`
  (`.MuiPickersTextField-root`), which is what it receives, instead of a class component
  instance. Under React 18 the ref now reaches that `div`; before, React dropped it with
  "Function components cannot be given refs". Under React 19 it reached the `div` already.

## Why

The pickers work with `Moment`s only (the library's `Framework` provides MUI's
`AdapterMoment`), but a `Date` or an ISO string compiled as their `value` and then threw
"value.isSame is not a function" on mount. A ref to the field's `div` did not compile.

## Migration

Nothing to do for an app that passes `Moment`s or `null` as the dates of these pickers and
of MUI X pickers it renders itself, types the dates its handlers get as `Moment | null` (or
leaves them inferred), and passes no `ref` to one of these pickers.

Required for any app that passes a `Date`, a string or a number as a date to one of these
pickers or to a MUI X picker of its own, or types a date its handler gets as anything but
`Moment | null`: it no longer compiles. Pass `Moment`s and take `Moment | null`.

```tsx
const [due, setDue] = useState<Moment | null>(null);
<LocalizedKeyboardDatePicker
	value={due}
	onChange={setDue}
	minDate={moment(start)}
/>;
```

Required for any app that types the ref of one of these pickers as a component instance:
it no longer compiles. Type it as the field's root `div`.

```tsx
const fieldRef = useRef<HTMLDivElement>(null);
<LocalizedKeyboardDatePicker ref={fieldRef} value={due} onChange={setDue} />;
```
