# The country flags load when the first flag is shown: loadCountryFlags and loadCountryFlag replace CountryFlags and getCountryFlag

- **Date:** 2026-11-17
- **Kind:** type, behavior
- **Scope:** `standalone/CountryFlags` (removed: `CountryFlags`, `getCountryFlag`; new:
  `loadCountryFlags`, `loadCountryFlag`), `standalone/CountryFlag`

## What changed

- The flags are a chunk of their own. Importing the library, `CountryFlag`, `useCountryOptions`,
  `CountryCodes` or `isCountryCode` imports no flag; the first `CountryFlag` shown loads all of
  them in one request.
- `CountryFlags`, the map of the flags' URLs, is no longer exported. `loadCountryFlags()` returns
  a promise of the same map: `Readonly<Record<CountryCode, string>>`, frozen, without a
  prototype. Every call resolves to the same map.
- `getCountryFlag(code)` is removed. `loadCountryFlag(code)` returns a promise of the flag's URL,
  or of `undefined` for a code without a flag.
- A `CountryFlag` shows its box empty until the flags have loaded, then its flag. The box keeps
  its size, so nothing moves. Once the flags have loaded, a `CountryFlag` shows its flag in its
  first render.
- If the flags fail to load (offline, an app update replaced the chunk), the boxes stay empty,
  the error is logged to the console once, and the next `CountryFlag` that mounts tries again.
  `loadCountryFlags()` rejects in that case, and its next call tries again.
- `isCountryCode(code)` needs no flag: it tests against a generated list of the codes.

## Why

Every flag was imported statically, so the apps' webpack (`type: "asset"`, which inlines files up
to 8 KB) put all 248 flags into the JavaScript of the code that imports a `CountryFlag`, about
227 KB of data URIs (63 KB gzipped), loaded with that code whether a flag is shown or not. Now
that code holds no flag, and the flags arrive in one request when the first one is shown.

## Migration

**Required for code that reads `CountryFlags` or calls `getCountryFlag`:** both no longer exist.
To show a flag, use `<CountryFlag code={code} />`. For a flag's URL, await it:

```ts
import { loadCountryFlag, loadCountryFlags } from "components-care";

const flag = await loadCountryFlag(code); // string | undefined, for any string
const flags = await loadCountryFlags(); // flags.DE, for a CountryCode
```

**Required for tests that render a `CountryFlag` (or a country select, or the LocaleSelector) and
look for its `img` right after rendering:** the image appears once the flags have loaded. Wait
for it (`findBy…`, `waitFor`), or load the flags before rendering:

```ts
beforeAll(() => loadCountryFlags());
```

samedis-ui and identity-management-frontend use neither `CountryFlags` nor `getCountryFlag`, and
their tests look for no flag image: nothing to do there. Their bundles get one more chunk, the
flags.
