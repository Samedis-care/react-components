import React from "react";
import { I18nextProvider } from "react-i18next";
import ccI18n from "../i18n";

export interface CCI18nProviderProps {
	/**
	 * The children to render
	 */
	children: React.ReactNode;
}

const CCI18nProvider = (props: CCI18nProviderProps) => {
	return <I18nextProvider i18n={ccI18n}>{props.children}</I18nextProvider>;
};

export default React.memo(CCI18nProvider);
