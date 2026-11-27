# Tab switches keep the scroll position, and PortalLayout's main pane scrolls to the top after a navigation

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Routes` (`HistoryRouter`, `useNavigate`, `Link`), `PortalLayout`,
  `RoutedTabs`, `CRUD`

## What changed

- `RoutedTabs`: opening a tab (a click, Enter or Space, an arrow key with
  `selectionFollowsFocus`) no longer scrolls the page to the top. The page, the tab bar, the
  focused tab and the opened panel stay where the user is.
- `CRUD`: the first save of a new record, which moves the form from `<url>/new` to
  `<url>/<id>`, no longer scrolls the page to the top.
- `PortalLayout`: inside a `HistoryRouter` (`Framework` renders one), a push or replace
  navigation now scrolls the main pane to the top, as it scrolls the window. The pane used to
  keep its offset, so the next page opened as far down as the user had scrolled the last one.
  Back/forward navigations and navigations that a blocker cancels leave it where it is, as they
  leave the window.
- New option `preventScrollReset` of `useNavigate()` and prop of `Link`: the navigation leaves
  the window, the document and the registered scroll containers where they are. It also holds
  when a blocker (the unsaved-changes guard of a form) holds the navigation back and lets it go
  ahead later. Back/forward navigations never reset the scroll.
- New hook `useResetScrollOnNavigation(ref)`: registers a scroll container with the nearest
  `HistoryRouter`, which then scrolls it to the top after the same navigations as the window.
  Other scroll containers, such as DataGrid's, keep their positions.

## Why

A tab switch is a navigation, and every navigation scrolled the window to the top: with the
tab bar further down the page, below a long record header, the focused tab and the panel the
user had opened ended up out of view. Keyboard users lost their place, and with
`selectionFollowsFocus` every arrow key did it. Saving a new record has the same shape: the
user stays on the form. Pages that scroll in a pane instead of the window had the opposite
problem: the pane was never reset, so following a link at the bottom of a long page showed the
next page scrolled down to the same offset.

## Migration

- Required for any app whose pages scroll in a container of its own that stays mounted across
  navigations, such as a layout body with `overflow: auto` around the routes (PortalLayout's
  main pane is registered already): register it, otherwise the next page keeps opening at the
  offset of the last one.

  ```tsx
  const bodyRef = useRef<HTMLDivElement>(null);
  useResetScrollOnNavigation(bodyRef);
  return <LayoutBody ref={bodyRef}>{routes}</LayoutBody>;
  ```

- Required for any app with a tab bar, stepper or filter of its own that navigates (with
  `navigate()`, `Link`, or a search parameter such as `?tab=` or a selected record id) on a
  page that scrolls in the window, in PortalLayout's main pane or in a registered container:
  pass `preventScrollReset` so the user stays where they are. Without it, every switch scrolls
  them to the top, now also the main pane of PortalLayout.

  ```tsx
  navigate(
  	{ search: params.toString() },
  	{ replace: true, preventScrollReset: true },
  );
  const historyTab = (
  	<Link to="?tab=history" preventScrollReset>
  		History
  	</Link>
  );
  ```

- Nothing to do for `RoutedTabs` and `CRUD`: they pass `preventScrollReset` themselves.
