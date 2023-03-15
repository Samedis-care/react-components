import React, { useEffect, useState } from "react";
import { getI18n, I18nextProvider } from "react-i18next";
import ccI18n from "../i18n";
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
	const [, setMomentLocale] = useState(ccI18n.language);

	useEffect(() => {
		const updateLocale = () => {
			void (async () => {
				setUpdating(true);
				const lang = ccI18n.language ?? "en-Us"; // fallback
				try {
					await import("moment/locale/" + lang.toLowerCase());
				} catch (e) {
					try {
						await import("moment/locale/" + lang.split("-")[0].toLowerCase());
					} catch (e) {
						// locale not found
					}
				} finally {
					moment.locale(lang);
					setMomentLocale(lang);
					const htmlTag = document.querySelector("html");
					if (htmlTag) htmlTag.lang = lang.split("-")[0];
					setUpdating(false);
				}
			})();
		};

		updateLocale();
		ccI18n.on("languageChanged", updateLocale);
		return () => ccI18n.off("languageChanged", updateLocale);
	}, []);

	return (
		<I18nextProvider
			i18n={getI18n() ?? ccI18n}
			// defaultNS used to force refresh
			defaultNS={
				updating ? (getI18n() ?? ccI18n).options.defaultNS ?? "" : undefined
			}
		>
			{props.children}
		</I18nextProvider>
	);
};

export default React.memo(CCI18nProvider);
