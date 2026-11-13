import React, { useEffect, useState } from "react";
import { getI18n, I18nextProvider } from "react-i18next";
import ccI18n from "../i18n";
import getCurrentLocale, {
	getCurrentLanguage,
} from "../utils/getCurrentLocale";
import moment from "moment";

export interface CCI18nProviderProps {
	/**
	 * The children to render
	 */
	children: React.ReactNode;
	/**
	 * Disable setting of HTML language attribute
	 */
	disableHtmlLanguageAttributeSetter?: boolean;
}

const CCI18nProvider = (props: CCI18nProviderProps) => {
	const [updating, setUpdating] = useState(false);
	const [, setMomentLocale] = useState(getCurrentLocale(ccI18n));

	useEffect(() => {
		// The moment locales load in any order, so only the latest update
		// applies its locale and ends `updating`. Loading a locale also makes it
		// moment's global one (moment.defineLocale does that), so a stale update
		// puts back the locale applied last. After the cleanup, no update does
		// anything.
		let latestUpdate = 0;
		let appliedLocale = moment.locale();
		let active = true;
		const updateLocale = () => {
			const update = ++latestUpdate;
			void (async () => {
				setUpdating(true);
				const lang = getCurrentLocale(ccI18n) ?? "en-US"; // fallback
				try {
					await import("moment/locale/" + lang.toLowerCase());
				} catch {
					try {
						await import(
							"moment/locale/" + getCurrentLanguage(ccI18n).toLowerCase()
						);
					} catch {
						// locale not found
					}
				}
				if (!active) return;
				if (update !== latestUpdate) {
					moment.locale(appliedLocale);
					return;
				}
				appliedLocale = moment.locale(lang);
				setMomentLocale(lang);
				const htmlTag = document.querySelector("html");
				if (htmlTag) htmlTag.lang = getCurrentLanguage(ccI18n);
				setUpdating(false);
			})();
		};

		updateLocale();
		ccI18n.on("languageChanged", updateLocale);
		return () => {
			active = false;
			ccI18n.off("languageChanged", updateLocale);
		};
	}, []);

	return (
		<I18nextProvider
			i18n={getI18n() ?? ccI18n}
			// defaultNS used to force refresh
			defaultNS={
				updating
					? (((getI18n() ?? ccI18n).options.defaultNS || "") as
							string | string[])
					: undefined
			}
		>
			{props.children}
		</I18nextProvider>
	);
};

export default React.memo(CCI18nProvider);
