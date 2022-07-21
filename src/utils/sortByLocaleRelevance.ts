import localeRelevance from "../assets/data/locale-relevance.json";

const sortByLocaleRelevance = (a: string, b: string) => {
	const languages = navigator.languages; // example: [ "de", "en-US", "en", "fr" ]
	// languages index (locale or lang)
	const getMatchScore = (locale: string) => {
		let index = languages.indexOf(locale);
		if (index === -1) index = languages.indexOf(locale.split("-")[0]);
		if (index !== -1) index = languages.length - index;
		else index = 0;
		return index;
	};
	const aScore = getMatchScore(a);
	const bScore = getMatchScore(b);
	if (aScore != bScore) return bScore - aScore;
	// score is equal, check relevance
	const getRelevance = (locale: string) =>
		(localeRelevance as Record<string, number>)[locale] ?? 0;
	const aRelevance = getRelevance(a);
	const bRelevance = getRelevance(b);
	return bRelevance - aRelevance;
};

export default sortByLocaleRelevance;
