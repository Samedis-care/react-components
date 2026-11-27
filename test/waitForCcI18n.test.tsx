import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ccI18n from "../src/i18n";
import useCCTranslations from "../src/utils/useCCTranslations";
import { waitForCcI18n } from "./waitForCcI18n";

// The English translations that src/i18n.ts starts to load on import arrive only when the
// first test releases them, as on a busy machine where their import takes longer than the
// test file's own imports.
const englishTranslations = vi.hoisted(() => {
	let release!: () => void;
	const released = new Promise<void>((resolve) => {
		release = resolve;
	});
	return { release, released };
});
vi.mock("../src/assets/i18n/en/translation.json", async (importOriginal) => {
	await englishTranslations.released;
	return importOriginal();
});
// also when the first test fails before it releases them
afterEach(() => englishTranslations.release());

/** Translated by the library's instance: suspends (renders nothing) until it has loaded */
const CancelLabel = () => {
	const { t } = useCCTranslations();
	return <span>{t("common.buttons.cancel")}</span>;
};

describe("waitForCcI18n", () => {
	it("waits for the library's own init while its translations still load, so a first render shows them", async () => {
		expect(ccI18n.isInitialized).toBeFalsy();
		let resolved = false;
		const ready = waitForCcI18n().then(() => {
			resolved = true;
		});
		// i18next runs an init's load in a setTimeout(0): after one, a second init() would
		// have resolved, with an empty resource store
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(resolved).toBe(false);

		englishTranslations.release();
		await ready;
		render(<CancelLabel />);
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("loads the other namespaces it is given", async () => {
		await waitForCcI18n(["translation", "countries"]);
		expect(ccI18n.hasLoadedNamespace("countries")).toBe(true);
	});
});
