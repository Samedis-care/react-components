import React from "react";
import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SignPad from "../../src/standalone/SignPad";
import ccI18n, { langs } from "../../src/i18n";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

// SignPad suspends until the components-care "translation" namespace is loaded
beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
	expect(ccI18n.hasLoadedNamespace("translation")).toBe(true);
});

describe("SignPad tile", () => {
	it("[ISSUE-3467-ITEM-5] the unsigned prompt asks to sign instead of saying the field is signed", async () => {
		// the past participle ("signed") in each locale that uses it today
		const signedWords: Record<string, RegExp> = {
			en: /\bsigned\b/i,
			es: /firmado/i,
			fr: /signé/i,
			it: /firmato/i,
			nl: /ondertekend/i,
			uz: /imzolangan/i,
		};
		await ccI18n.loadLanguages(langs);
		const wrong: string[] = [];
		for (const [lng, signed] of Object.entries(signedWords)) {
			const text = String(
				ccI18n.getResource(
					lng,
					"translation",
					"standalone.signature-pad.sign-here",
				),
			);
			if (signed.test(text)) wrong.push(`${lng}: ${text}`);
		}
		expect(wrong, "prompts that read as already signed").toEqual([]);
	});

	it("[ISSUE-3467-ITEM-5] an unsigned tile asks to sign", () => {
		render(<SignPad signature={null} />);
		expect(screen.getByText("Sign here digitally")).toBeInTheDocument();
	});

	it("[ISSUE-3467-ITEM-5] every locale has its own prompt", async () => {
		await ccI18n.loadLanguages(langs);
		const missing = langs.filter(
			(lng) =>
				!ccI18n.getResource(
					lng.split("-")[0],
					"translation",
					"standalone.signature-pad.sign-here",
				),
		);
		expect(missing, "locales without the prompt").toEqual([]);
	});
});
