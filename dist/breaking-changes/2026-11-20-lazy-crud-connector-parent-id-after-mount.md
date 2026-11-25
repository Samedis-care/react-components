# A lazy control's onParentIdChange is called after the control mounted, not while it renders

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`useLazyCrudConnector`, and with it `FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`)

## What changed

`onParentIdChange` gets the parent record's id the connector was built for (`initialId`, the
string `"null"` for a new record) once the control that built the connector has mounted, from an
effect. It used to get it while that control rendered, when the connector was built. It is still
called once per connector: not again when the control mounts again under its `field`, nor when
StrictMode runs the effects again. The call on every save, with the saved record's id, is
unchanged.

`getEndpoint`, `getConnector` and `configureConnector` still build the connector during render.
Their documentation now says so: they must not set state, and React runs them again for a render
it discards (React 18's StrictMode does for every mount, in development); the connector of a
discarded render is never used.

## Why

A state update in `onParentIdChange`, such as passing a state setter of the page
(`onParentIdChange={setParentId}`), updated another component while the control rendered: React
logged "Cannot update a component while rendering a different component".

## Migration

Nothing required for a callback that stores the id for later, e.g. for the save.

Code that read, while the control first rendered, what `onParentIdChange` had stored during that
render gets it after the mount now: keep the id in state, or read it in an effect or a handler.
