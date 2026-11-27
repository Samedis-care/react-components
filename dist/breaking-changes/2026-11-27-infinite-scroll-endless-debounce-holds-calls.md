# InfiniteScroll: a `callBackDebounce` above 2^31 - 1 or `Infinity` makes no call

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll`

## What changed

`callBackDebounce` accepts a wait of up to 2147483647 ms (2^31 - 1, about 24.8 days, the
longest delay a timer supports), as before. A longer wait, `Infinity` included, now never
ends:

| `callBackDebounce`                  | Before                                            | Now                                        |
| ----------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| above 2^31 - 1, `Infinity` included | the call after a few ms, or after a wrapped delay | no call while it is set, as with `loading` |
| 0 to 2^31 - 1, negative, `NaN`      | unchanged                                         | unchanged                                  |

While such a value is set, neither `loadMoreTop` nor `loadMoreBottom` is called, also not a
call that was already waiting when it was set. The calls that come up meanwhile are held, as
while `loading` is set, and are made once `callBackDebounce` changes to a shorter wait, after
that wait, if the content still needs them then. While `loading` is also set, they wait for
both.

## Why

The value went to `setTimeout` unchecked. Browsers convert the delay to a 32-bit integer and
run the invalid ones at their minimum delay, so a value meant as a very long wait, or an
`Infinity` that came out of a calculation, called the callbacks almost at once.

## Migration

Nothing required. An app that passes a `callBackDebounce` above 2147483647 or `Infinity`
gets no more calls while it does; pass `loading` instead to pause loading while a load runs.
