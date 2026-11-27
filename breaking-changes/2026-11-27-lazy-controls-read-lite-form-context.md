# Lazy controls and CrudMultiSelect's validation read the Form's lite context

- **Date:** 2026-11-27
- **Kind:** type, behavior
- **Scope:** `backend-components/Form` (`FormContextDataLite`, `FormContextLite`,
  `useLazyCrudConnector` and so `FormCrudMultiSelect`, `FormCrudFileUpload`,
  `FormCrudMultiImage`), `backend-components/Selector` (`useCrudSelect` and so
  `CrudMultiSelect` and `CrudMultiSelectWithGroups` with `validate`)

## What changed

`FormContextDataLite` (`useFormContextLite`) carries the Form's custom-field callbacks, the
same functions as `FormContextData`: `setCustomValidationHandler`,
`removeCustomValidationHandler`, `setCustomWarningHandler`, `removeCustomWarningHandler`,
`setPreSubmitHandler`, `removePreSubmitHandler`, `setPostSubmitHandler`,
`removePostSubmitHandler`, `getCustomState`, `setCustomState`, `hasCustomState` and
`setCustomFieldDirty`.

`useLazyCrudConnector` and the validation of `useCrudSelect` read them from `FormContextLite`
instead of `FormContext`. Outside a Form, `useLazyCrudConnector` throws "Form Context (Lite)
not set. Not using form engine?" instead of "Form Context not set. Not using form engine?".

## Why

`FormContext` gets a new value with every change of a value of the Form. A control that read
it rendered again, down to its Autocomplete, several times per keystroke in any field of the
Form, although it only used callbacks that never change. The lite context does not change
with the values, so a keystroke elsewhere in the Form no longer reaches these controls.

## Migration

**Required for any app that builds a `FormContextDataLite` object itself** (instead of passing
on what the Form gives it, e.g. a form context simulated for a dialog): add the twelve
callbacks listed above. TypeScript reports the missing properties. An app that passes a
`FormContextData` object as the lite context's value has them already.

**Required for any app that provides `FormContext` again around a lazy control or a
`CrudMultiSelect` with `validate`** (e.g. to render a part of the form in a dialog's title
or a portal): provide `FormContextLite` there too, with the Form's lite context. Without it a
lazy control throws, and the validation of a `CrudMultiSelect` is not registered:

```tsx
const formContext = useContext(FormContext);
const formContextLite = useContext(FormContextLite);

<FormContext.Provider value={formContext}>
	<FormContextLite.Provider value={formContextLite}>
		{children}
	</FormContextLite.Provider>
</FormContext.Provider>;
```

An app whose own component reads `useFormContext()` only for these callbacks, `readOnly`,
`onlySubmitMounted` or the other members of the lite context can read `useFormContextLite()`
instead, so that it does not render again on every keystroke either.
