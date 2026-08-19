# debouncePromise resolves each caller with its own invocation's result

- **Date:** 2026-08-19
- **Kind:** behavior
- **Scope:** `utils/debouncePromise`, `utils/useDebounce` (`useDebouncePromise`)

## What changed

`debouncePromise` (and the `useDebouncePromise` hook, which carries the same
implementation) used to keep one shared list of waiting callers. The list was only
cleared once an invocation **settled**, so a call made while an earlier invocation was
still running got attached to it:

- the newer caller was resolved with the older invocation's result, and
- the newer invocation's own result was then delivered to nobody, because the list had
  already been emptied.

Waiting callers are now handed over to an invocation when it **starts**. Calls arriving
after that are collected for the next one, so every caller gets the result of the
invocation its arguments went into. Debouncing itself is unchanged: calls within the
timeout window are still coalesced into a single invocation, and everyone waiting on it
still gets that one result.

## Why

This is what made a selector drop its search a few seconds after typing
([samedis-care-issues#2543](https://github.com/Samedis-care/samedis-care-issues/issues/2543)):

1. Opening the dropdown starts a load for the empty query.
2. The user types before that (slow) request comes back, starting a second load.
3. The empty-query response arrives first and resolved **both** loads — so the search
   received the unfiltered result set and rendered it.
4. The real search response then had nobody left to resolve and was dropped, leaving the
   unfiltered list on screen.

`BaseSelector` already discards outdated loads, but it can only do that when each load
actually receives its own answer.

## Migration

Nothing to do. Code that fires a call while a previous invocation is in flight now causes
one more invocation of the wrapped function than before — that call previously piggybacked
on the running one and received its result.
