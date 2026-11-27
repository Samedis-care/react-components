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
declare const searchKey: (text: string) => string;
export default searchKey;
