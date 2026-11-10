# CountryFlags has no prototype

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/CountryFlags` (`CountryFlags`)

## What changed

`CountryFlags` is now an object without a prototype, like one made by `Object.create(null)`.
A lookup of a name that is not a country code returns `undefined`, the names of
`Object.prototype` included: `CountryFlags["toString"]`, `["constructor"]`,
`["hasOwnProperty"]` and `["valueOf"]` used to return functions, and `["__proto__"]` returned
`Object.prototype`. Likewise `name in CountryFlags` is `true` for country codes only.

The map no longer has the methods of `Object.prototype`:

- `CountryFlags.hasOwnProperty(code)` throws a `TypeError`.
- Converting the map to a string (`String(CountryFlags)`, `` `${CountryFlags}` ``) throws a
  `TypeError`.
- `CountryFlags instanceof Object` is `false`.

Lookups by code, `in`, `Object.hasOwn`, `Object.keys`, `Object.entries`, spreading and
`JSON.stringify` work as before.

## Why

Apps look up codes that come from user or backend data and check the result with
`if (flag)` or `code in CountryFlags`. For a code such as `"constructor"` that check passed,
`<img src>` got a function, and a broken image showed instead of the app's fallback.

## Migration

Nothing is required: neither the library nor samedis-ui nor identity-management-frontend
calls a method on the map; they only look up codes.

Replace `CountryFlags.hasOwnProperty(code)` with `Object.hasOwn(CountryFlags, code)`.
