import { describe, it, expect } from "vitest";
import CountryFlags from "../../src/standalone/CountryFlags";

describe("CountryFlags", () => {
	it("contains entries for well-known country codes", () => {
		const knownCodes = [
			"US",
			"DE",
			"GB",
			"FR",
			"JP",
			"CN",
			"AU",
			"CA",
			"BR",
			"IN",
		];
		for (const code of knownCodes) {
			expect(CountryFlags, `Missing flag for ${code}`).toHaveProperty(code);
		}
	});

	it("has no undefined or null values", () => {
		for (const [code, value] of Object.entries(CountryFlags)) {
			expect(value, `Flag for ${code} is falsy`).toBeTruthy();
		}
	});

	it("all values are strings", () => {
		for (const [code, value] of Object.entries(CountryFlags)) {
			expect(typeof value, `Flag for ${code} is not a string`).toBe("string");
		}
	});

	it("contains at least 200 country codes", () => {
		expect(Object.keys(CountryFlags).length).toBeGreaterThanOrEqual(200);
	});

	it("all keys are two-letter uppercase ISO codes", () => {
		for (const code of Object.keys(CountryFlags)) {
			expect(code).toMatch(/^[A-Z]{2}$/);
		}
	});
});
