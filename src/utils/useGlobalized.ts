import { useEffect, useState } from "react";
import Globalize from "globalize/dist/globalize";
import { getGlobalized } from "../globalize";
import ccI18n from "../i18n";

/**
 * React Hook providing a Globalize instance matching the current locale (ccI18n.language)
 */
const useGlobalized = (): Globalize | null => {
	const [globalized, setGlobalized] = useState<Globalize | null>(null);
	useEffect(() => {
		const updateGlobalized = () =>
			void (async () => {
				setGlobalized(await getGlobalized());
			})();
		// initial load
		updateGlobalized();

		// listen for locale switches
		ccI18n.on("languageChanged", updateGlobalized);
		return () => {
			ccI18n.off("languageChanged", updateGlobalized);
		};
	}, []);

	return globalized;
};

export default useGlobalized;
