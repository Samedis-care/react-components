import { beforeAll, describe, expect, it } from "vitest";
import ccI18n from "../../src/i18n";
import {
	validateLocalized,
	validateLocalizedPresence,
	validateLocalizedPresenceFor,
	validatePresence,
	type ModelFieldDefinition,
	type PageVisibility,
} from "../../src";
import type { MultiLanguageInputSupportedLanguages } from "../../src/standalone/UIKit/InputControls/MultiLanguageInput";

beforeAll(async () => {
	await ccI18n.changeLanguage("en");
	await ccI18n.loadNamespaces("translation");
});

type Localized = Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
const field = { getLabel: () => "Title" };
const REQUIRED = "The Title field is required";

describe("validateLocalizedPresence", () => {
	it("[FOLLOWUP-VALIDATE-LOCALIZED-PRESENCE] refuses a localized value without text in any language", () => {
		for (const value of [
			null,
			undefined,
			{},
			{ en: "" },
			{ en: " ", de: "\n\t" },
		])
			expect(
				validateLocalizedPresence(value, {}, field),
				JSON.stringify(value),
			).toBe(REQUIRED);
		// the message is validatePresence's
		expect(validatePresence(null, {}, field)).toBe(REQUIRED);
	});

	it("[FOLLOWUP-VALIDATE-LOCALIZED-PRESENCE] accepts a text in any one language", () => {
		expect(
			validateLocalizedPresence({ en: "", de: "Titel" }, {}, field),
		).toBeNull();
		expect(validateLocalizedPresence({ fr: " x " }, {}, field)).toBeNull();
	});

	it("[FOLLOWUP-VALIDATE-LOCALIZED-PRESENCE] where validatePresence and validateLocalized let an empty localized value through", () => {
		const empty: Localized = { en: "", de: "" };
		expect(validatePresence(empty, {}, field)).toBeNull();
		expect(validateLocalized(() => null)(empty as never, {}, field)).toBeNull();
		expect(validateLocalizedPresence(empty, {}, field)).toBe(REQUIRED);
	});
});

describe("validateLocalizedPresenceFor", () => {
	it("[FOLLOWUP-VALIDATE-LOCALIZED-PRESENCE] requires each given language, one line per language without text, in the given order", () => {
		const validate = validateLocalizedPresenceFor(["en", "de"]);
		expect(
			validate({ en: "Title", de: "Titel", fr: "" }, {}, field),
		).toBeNull();
		expect(validate({ en: "Title", de: " " }, {}, field)).toBe(
			`de: ${REQUIRED}`,
		);
		expect(validate({ fr: "Titre" }, {}, field)).toBe(
			`en: ${REQUIRED}\nde: ${REQUIRED}`,
		);
		expect(validate(null, {}, field)).toBe(`en: ${REQUIRED}\nde: ${REQUIRED}`);
	});

	it("[FOLLOWUP-VALIDATE-LOCALIZED-PRESENCE] both fit a localized field's validate", () => {
		type Validate = NonNullable<
			ModelFieldDefinition<Localized, "title", PageVisibility, null>["validate"]
		>;
		const forAny: Validate = validateLocalizedPresence;
		const forEnglish: Validate = validateLocalizedPresenceFor(["en"]);
		expect([forAny, forEnglish]).toHaveLength(2);
	});
});
