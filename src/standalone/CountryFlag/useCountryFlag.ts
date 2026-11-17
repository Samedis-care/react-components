import { useSyncExternalStore } from "react";
import isCountryCode from "../CountryFlags/isCountryCode";
import loadCountryFlags, {
	getLoadedCountryFlags,
} from "../CountryFlags/loadCountryFlags";

/**
 * The load the flags on screen wait for. It never rejects: a failure is
 * reported once, not by every flag waiting, and unsets it, so the next
 * CountryFlag that mounts tries again.
 */
let shownLoad: Promise<void> | undefined;

const loadShownFlags = (): Promise<void> => {
	shownLoad ??= loadCountryFlags().then(
		() => undefined,
		(error: unknown) => {
			shownLoad = undefined;
			// the boxes stay empty: at least don't fail silently
			// eslint-disable-next-line no-console
			console.error(
				"[Components-Care] [CountryFlag] The flags failed to load:",
				error,
			);
		},
	);
	return shownLoad;
};

/** Loads the flags and tells React when they are there */
const subscribe = (onLoad: () => void): (() => void) => {
	let subscribed = true;
	void loadShownFlags().then(() => {
		if (subscribed) onLoad();
	});
	return () => {
		subscribed = false;
	};
};

/**
 * The URL of a country's flag for CountryFlag: `undefined` for a code without
 * a flag and while the flags load. The first call loads them
 * (`loadCountryFlags()`); the component re-renders when they are there.
 *
 * @param code The country's code, any string
 */
const useCountryFlag = (code: string): string | undefined => {
	const flags = useSyncExternalStore(subscribe, getLoadedCountryFlags);
	return flags && isCountryCode(code) ? flags[code] : undefined;
};

export default useCountryFlag;
