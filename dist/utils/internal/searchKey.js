/**
 * The combining marks of Latin, Greek and Cyrillic accents (U+0300-U+036F), which
 * the canonical decomposition (NFD) separates from their letters. The vowel signs
 * and other marks of further scripts lie outside this block and stay
 */
const COMBINING_DIACRITICS = /[\u0300-\u036f]/g;
/**
 * The characters that stand for an apostrophe: the typographic single quotation
 * marks (often put in by autocorrect), the modifier letters that Uzbek and other
 * Latin spellings write (ʻ ʼ ʽ ʹ), the grave and acute accents and the prime typed
 * in their place, and the fullwidth apostrophe
 */
const APOSTROPHES = /[\u0060\u00b4\u02b9\u02bb\u02bc\u02bd\u2018\u2019\u201b\u2032\uff07]/g;
const BLANKS = /\s+/g;
/**
 * A text as a search compares it: in lower case and without the accents of Latin,
 * Greek and Cyrillic letters, as MUI's Autocomplete filters its options by default
 * (`createFilterOptions`), with each apostrophe-like character read as `'`, and
 * without the blanks around it, a run of blanks inside it read as one space.
 *
 * A query matches a text when the text's key includes the query's key.
 * "osterreich" finds "Österreich", "o'zbek" finds "oʻzbek" and "o‘zbek",
 * "austria " finds "Austria". Letters of their own, such as ß, ø, æ and ı, stay as
 * they are, and so does the text of scripts without such accents.
 * @param text The text or the query
 * @returns The text's search key
 */
const searchKey = (text) => text
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(APOSTROPHES, "'")
    .replace(BLANKS, " ")
    .trim();
export default searchKey;
