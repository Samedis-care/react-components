import { describe, it, expect } from "vitest";
import searchKey from "../../src/utils/internal/searchKey";

describe("searchKey", () => {
	it("[ISSUE-3499-ITEM-14] folds case and the accents of Latin, Greek and Cyrillic letters, as MUI's Autocomplete does", () => {
		expect(
			[
				"Österreich",
				"français",
				"ESPAÑOL",
				"Việt Nam",
				"İstanbul",
				"Ελλάδα",
				"Йемен",
				"Österreich".normalize("NFD"),
			].map(searchKey),
		).toEqual([
			"osterreich",
			"francais",
			"espanol",
			"viet nam",
			"istanbul",
			"ελλαδα",
			"иемен",
			"osterreich",
		]);
	});

	it("[ISSUE-3499-ITEM-14] leaves letters of their own alone: ß, ø, æ, ı", () => {
		expect(["Straße", "Færøerne", "Kıbrıs"].map(searchKey)).toEqual([
			"straße",
			"færøerne",
			"kıbrıs",
		]);
	});

	it("[ISSUE-3499-ITEM-14] leaves the vowel signs of other scripts alone", () => {
		const texts = ["हिन्दी", "বাংলা", "தமிழ்", "ไทย", "العربية", "日本語"];
		expect(texts.map(searchKey)).toEqual(texts);
	});

	it("[ISSUE-3499-ITEM-14] reads the apostrophe-like characters as the keyboard's apostrophe", () => {
		expect(
			[
				"o'zbek",
				"o\u2018zbek",
				"o\u2019zbek",
				"o\u201bzbek",
				"o\u02bbzbek",
				"o\u02bczbek",
				"o\u02bdzbek",
				"o\u02b9zbek",
				"o`zbek",
				"o\u00b4zbek",
				"o\u2032zbek",
				"o\uff07zbek",
			].map(searchKey),
		).toEqual(Array(12).fill("o'zbek"));
	});

	it("[ISSUE-3499-ITEM-14] drops the blanks around the text and reads a run of blanks inside it as one space", () => {
		expect(
			[
				" united states ",
				"\tunited\u00a0states\n",
				"united   states",
				"   ",
				"",
			].map(searchKey),
		).toEqual(["united states", "united states", "united states", "", ""]);
	});
});
