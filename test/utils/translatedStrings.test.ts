import { describe, expect, expectTypeOf, it } from "vitest";
import i18next, { Resource } from "i18next";
import type * as PackageRoot from "../../src";
import translatedStrings from "../../src/utils/translatedStrings";

const makeAppI18n = async (resources: Resource) => {
	const inst = i18next.createInstance();
	await inst.init({ lng: "en", resources, initAsync: false });
	return inst;
};

describe("translatedStrings", () => {
	it("[ISSUE-3463-ITEM-12] gives the strings of a translated array, interpolated with the values passed to t", async () => {
		const app = await makeAppI18n({
			en: {
				translation: {
					help: ["Fill in at most {{count}} rows", "Upload the file below", ""],
				},
			},
		});
		expect(
			translatedStrings(app.t("help", { returnObjects: true, count: 500 })),
		).toEqual(["Fill in at most 500 rows", "Upload the file below", ""]);
	});

	it("[ISSUE-3463-ITEM-12] gives one entry for a key that holds a string, and the key itself as one entry for a missing key", async () => {
		const app = await makeAppI18n({
			en: { translation: { hint: "A single hint" } },
		});
		expect(translatedStrings(app.t("hint", { returnObjects: true }))).toEqual([
			"A single hint",
		]);
		expect(
			translatedStrings(app.t("import-how-to-help", { returnObjects: true })),
		).toEqual(["import-how-to-help"]);
	});

	it("[ISSUE-3463-ITEM-12] gives the values of a key that holds an object in key order, and skips nested groups", async () => {
		const app = await makeAppI18n({
			en: {
				translation: {
					steps: { download: "Download the template", upload: "Upload it" },
					import: {
						title: "Import",
						steps: ["Step one", "Step two"],
						more: { a: "Step A" },
					},
					mixed: ["first", { a: "Step A" }, ["x", "y"], 3, "last"],
					groups: { a: { b: "Step B" }, c: ["Step C"] },
					none: [],
				},
			},
		});
		expect(translatedStrings(app.t("steps", { returnObjects: true }))).toEqual([
			"Download the template",
			"Upload it",
		]);
		expect(translatedStrings(app.t("import", { returnObjects: true }))).toEqual(
			["Import"],
		);
		expect(translatedStrings(app.t("mixed", { returnObjects: true }))).toEqual([
			"first",
			"3",
			"last",
		]);
		expect(translatedStrings(app.t("groups", { returnObjects: true }))).toEqual(
			[],
		);
		expect(translatedStrings(app.t("none", { returnObjects: true }))).toEqual(
			[],
		);
	});

	it("[ISSUE-3463-ITEM-12] gives a number as its text, and no entries for a value that is no text, array or record", () => {
		class Steps {
			a = "Step A";
		}
		expect(translatedStrings(4)).toEqual(["4"]);
		expect(translatedStrings(undefined)).toEqual([]);
		expect(translatedStrings(null)).toEqual([]);
		expect(translatedStrings(true)).toEqual([]);
		expect(translatedStrings(new Date(0))).toEqual([]);
		expect(translatedStrings(new Steps())).toEqual([]);
	});

	it("[ISSUE-3463-ITEM-12] is exported from the package root, which has no HowToBoxTranslate any more", () => {
		expectTypeOf<typeof PackageRoot.translatedStrings>().toEqualTypeOf<
			typeof translatedStrings
		>();
		expectTypeOf<typeof PackageRoot>().not.toHaveProperty("HowToBoxTranslate");
	});
});
