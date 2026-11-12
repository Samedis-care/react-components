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

## Why

The map's type said that every string has a flag. A lookup of a code without one (`"de"`,
`"UK"`, a typo) compiled and gave `undefined` at runtime, which reached `<img src>` unchecked.
Now a code from user or backend data has to be checked before it indexes the map, and a wrong
literal code is a type error.

## Migration

**Required for samedis-ui:** two calls of `CountryCodes.includes` with a `string` no longer
compile, `getCountries` in `src/components/RegionSelector/RegionSelector.tsx` and
`validateBillingContact` in `src/components-care/models/TenantBillingModel.tsx`. Narrow the code
first; the check stays the same:

```ts
import { CountryCodes, isCountryCode } from "components-care";

if (isCountryCode(code) && CountryCodes.includes(code)) {
	// one of the countries a country select offers
}
```

`isCountryCode(code)` on its own is true for every code the library has a flag for, also for
countries that `CountryCodes` does not list (Aruba, Curaçao, Sint Maarten, …).

**Required for code that indexes `CountryFlags` with a `string`:** it no longer compiles. Use
`getCountryFlag(code)` and handle `undefined`, or narrow with `isCountryCode(code)` first:

```ts
const flag = getCountryFlag(code); // string | undefined
```

To show a flag, `<CountryFlag code={code} />` takes any string and leaves its box empty for a
code without a flag.

Code that changes `CountryFlags` throws now; build a new map instead
(`{ ...CountryFlags, DE: myFlag }`).

identity-management-frontend uses neither `CountryFlags` nor `CountryCodes`: nothing to do there.
