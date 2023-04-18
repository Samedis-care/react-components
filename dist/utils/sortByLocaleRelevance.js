import localeRelevance from "../assets/data/locale-relevance.json";
var sortByLocaleRelevance = function (a, b) {
    var languages = navigator.languages; // example: [ "de", "en-US", "en", "fr" ]
    // languages index (locale or lang)
    var getMatchScore = function (locale) {
        var index = languages.indexOf(locale);
        if (index === -1)
            index = languages.indexOf(locale.split("-")[0]);
        if (index !== -1)
            index = languages.length - index;
        else
            index = 0;
        return index;
    };
    var aScore = getMatchScore(a);
    var bScore = getMatchScore(b);
    if (aScore != bScore)
        return bScore - aScore;
    // score is equal, check relevance
    var getRelevance = function (locale) { var _a; return (_a = localeRelevance[locale]) !== null && _a !== void 0 ? _a : 0; };
    var aRelevance = getRelevance(a);
    var bRelevance = getRelevance(b);
    return bRelevance - aRelevance;
};
export default sortByLocaleRelevance;
