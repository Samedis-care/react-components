# A HistoryRouter inside a Route starts a fresh routing scope

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Routes` (`HistoryRouter`, `Route`, `useRouteInfo`, `useParams`)

## What changed

A `HistoryRouter` rendered inside a `Route` of another one, e.g. a wizard on a
`createMemoryHistory()` inside a page under "/devices/*", no longer passes that
`Route` on to its children:

- Its `Routes` and `Route`s resolve their paths from "/" against its own location: a
  `<Route path="/step1">` matches its location "/step1". Before, it became
  "/devices/step1" and never rendered.
- Inside it, outside of its own routes, `RouteContext` is null, `useRouteInfo()` throws
  and `useParams()` returns `{}`, as outside of every Route. Before, they reported the
  outer `Route`.
- Its page titles (`usePageTitle`, `PageTitle`) still go to the outer router's
  document title: those set outside of its own routes rank as titles set in the outer
  `Route`, those of its own routes deeper.

The `HistoryRouter` that `Framework` renders is not inside any `Route`: nothing changes
for it.

## Why

A `HistoryRouter` has a location of its own, so its routes have to match that location.
Resolved against the outer route's path, they could not match it.

## Migration

- **Required for any app that renders a `HistoryRouter` inside a `Route` and reads that
  outer `Route` inside it (`useRouteInfo`, `useParams`, `RouteContext`):** read it
  outside of the inner `HistoryRouter` and pass it down:

  ```tsx
  const DevicePage = () => {
  	const { id } = useParams<"id">(); // outside of the wizard's router
  	return (
  		<HistoryRouter history={wizardHistory}>
  			<WizardSteps deviceId={id} />
  		</HistoryRouter>
  	);
  };
  ```

- **Required for any app whose nested `HistoryRouter` routes with the outer route's
  path in its own paths** (e.g. a memory history started at "/devices/step1" to match
  `<Route path="step1">` under "/devices/*"): write its paths and its history's
  locations from "/" ("/step1").
