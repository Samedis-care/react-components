import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import ccI18n from "../i18n";
import moment from "moment";

export interface CCI18nProviderProps {
	/**
	 * The children to render
	 */
	children: React.ReactNode;
}

const CCI18nProvider = (props: CCI18nProviderProps) => {
	const [momentLocale, setMomentLocale] = useState(ccI18n.language);

	const updateLocale = () => {
		void (async () => {
			try {
				await import("moment/locale/" + ccI18n.language.toLowerCase());
			} catch (e) {
				try {
					await import(
						"moment/locale/" + ccI18n.language.split("-")[0].toLowerCase()
					);
				} catch (e) {
					// locale not found
				}
			} finally {
				moment.locale(ccI18n.language);
				setMomentLocale(ccI18n.language);
			}
		})();
	};

	useEffect(() => {
		updateLocale();
		ccI18n.on("languageChanged", updateLocale);
		return () => ccI18n.off("languageChanged", updateLocale);
	}, []);

	return (
		<I18nextProvider i18n={ccI18n} key={momentLocale}>
			{props.children}
		</I18nextProvider>
	);
};

export default React.memo(CCI18nProvider);
