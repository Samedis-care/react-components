# CountryFlags, CountryCodes and CountryOption.value are typed by CountryCode, and CountryFlags is frozen

- **Date:** 2026-11-12
- **Kind:** type, behavior
- **Scope:** `standalone/CountryFlags` (`CountryFlags`, `CountryCodes`, `CountryOption`; new:
  `CountryCode`, `isCountryCode`, `getCountryFlag`)

## What changed

- The new type `CountryCode` is the union of the codes the library has a flag and a name for
  (`"AD" | "AE" | … | "ZW"`), the keys of `CountryFlags`.
- `CountryFlags` is a `Readonly<Record<CountryCode, string>>` instead of a
  `Record<string, string>`. A lookup with a `string`, or with a code that is not a key
  (`CountryFlags["de"]`, `CountryFlags.UK`), no longer compiles.
- `CountryFlags` is frozen. Changing, adding or deleting a flag throws a `TypeError` instead of
  changing the flag for every consumer on the page.
- `CountryCodes` is a `readonly CountryCode[]` instead of a `readonly string[]`, and
  `CountryOption.value` is a `CountryCode` instead of a `string`. So
  `CountryCodes.includes(code)` with a `string` no longer compiles.
- New: `isCountryCode(code: string): code is CountryCode`, and
  `getCountryFlag(code: string): string | undefined`, which returns the flag of a code known only
  at runtime, or `undefined` if the library has none for it.

Since 2026-11-17 the flags load when they are first shown, and `CountryFlags` and
`getCountryFlag` are no longer exported: see
[`2026-11-17-country-flags-load-when-shown.md`](2026-11-17-country-flags-load-when-shown.md). The
migration below names what replaced them.

## Why

The map's type said that every string has a flag. A lookup of a code without one (`"de"`,
`"UK"`, a typo) compiled and gave `undefined` at runtime, which reached `<img src>` unchecked.
Now a code from user or backend data has to be checked before it indexes the map, and a wrong
literal code is a type error.

## Migration

**Required for code that calls `CountryCodes.includes` with a `string`:** it no longer
compiles. Narrow the code first; the check stays the same:

```ts
import { CountryCodes, isCountryCode } from "components-care";

if (isCountryCode(code) && CountryCodes.includes(code)) {
	// one of the countries a country select offers
}
```

`isCountryCode(code)` on its own is true for every code the library has a flag for, also for
a country that `CountryCodes` does not list (Kosovo, `XK`).

**Required for code that indexes `CountryFlags` with a `string`:** it no longer compiles, and
since 2026-11-17 `CountryFlags` is not exported at all. To show a flag, use
`<CountryFlag code={code} />`, which takes any string and leaves its box empty for a code without
a flag. For a flag's URL, await it; `loadCountryFlag` takes any string and resolves to
`undefined` for a code without a flag:

```ts
import { loadCountryFlag } from "components-care";

const flag = await loadCountryFlag(code); // string | undefined
```

The map `loadCountryFlags()` resolves to is frozen: changing it throws, so build a new map
instead (`{ ...flags, DE: myFlag }`).
