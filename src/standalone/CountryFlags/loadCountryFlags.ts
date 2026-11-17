import type { CountryCode } from "./index";

/** The flags, once they have loaded */
let loadedFlags: Readonly<Record<CountryCode, string>> | undefined;
/** The load in progress or done; unset when it fails, so the next call tries again */
let loading: Promise<Readonly<Record<CountryCode, string>>> | undefined;

/**
 * The flags if they have loaded, otherwise `undefined`. Internal: lets a
 * `CountryFlag` show its flag in its first render once the flags are there.
 */
export const getLoadedCountryFlags = ():
	Readonly<Record<CountryCode, string>> | undefined => loadedFlags;

/**
 * Loads the country flags: the image URL of each `CountryCode`, for
 * `<img src>` or CSS `url()`. To show a flag, use the `CountryFlag`
 * component, which loads the flags itself and sizes, outlines and names the
 * flag.
 *
 * The flags are a chunk of their own: the app's bundler leaves them out of the
 * code that imports the library and loads them on the first call (the first
 * `CountryFlag` shown). Later calls resolve to the same map. If the chunk
 * fails to load (offline, an app update replaced it), the promise rejects and
 * the next call tries again.
 *
 * The map takes a `CountryCode`; for a `string` use `loadCountryFlag(code)`,
 * or narrow it with `isCountryCode(code)` first. It is frozen and has no
 * prototype: a lookup of a name of `Object.prototype` (`"toString"`,
 * `"__proto__"`, ...) gives `undefined`, and `code in flags` is true for
 * country codes only.
 *
 * The URLs come from the app's bundler (`assets/img/countries/<code>.svg`): a
 * `data:` URI for a small file, otherwise the URL of an emitted file. The
 * bundler must turn default imports of `*.svg` files into asset URLs (webpack
 * `type: "asset"`, Vite's default), not into React components.
 *
 * @returns The flags' image URLs by `CountryCode`, frozen
 * @example
 * const flags = await loadCountryFlags();
 * const germany = flags.DE;
 */
const loadCountryFlags = (): Promise<Readonly<Record<CountryCode, string>>> => {
	loading ??= import("./flags").then(
		(module) => (loadedFlags = module.default),
		(error: unknown) => {
			loading = undefined;
			throw error;
		},
	);
	return loading;
};

export default loadCountryFlags;
