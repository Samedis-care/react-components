import ccI18n from "../i18n";

const getDecimalSeparator = (): string => {
	const numberWithDecimalSeparator = 1.1;

	return numberWithDecimalSeparator
		.toLocaleString(ccI18n.language)
		.substring(1, 2);
};
export default getDecimalSeparator;
