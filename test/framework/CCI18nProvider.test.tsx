import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act, waitFor } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import ccI18n from "../../src/i18n";
import CCI18nProvider from "../../src/framework/CCI18nProvider";

/**
 * The moment locale chunks the tests load. Each one stays loading until its
 * test calls `finish`: a dynamic import that resolves later than one started
 * after it, as a chunk that isn't cached yet does over the network.
 */
const chunks = vi.hoisted(() => {
	const chunk = () => {
		let finish!: () => void;
		const gate = new Promise<void>((resolve) => {
			finish = resolve;
		});
		const state = {
			/** the provider asked for the chunk */
			requested: false,
			/** the chunk ran and its import resolves with the next microtasks */
			loaded: false,
			finish,
			load: async <T,>(importOriginal: () => Promise<T>): Promise<T> => {
				state.requested = true;
				await gate;
				const mod = await importOriginal();
				state.loaded = true;
				return mod;
			},
		};
		return state;
	};
	return {
		de: chunk(),
		fr: chunk(),
		es: chunk(),
		it: chunk(),
		nl: chunk(),
		ru: chunk(),
	};
});
vi.mock("moment/locale/de", (orig) => chunks.de.load(orig));
vi.mock("moment/locale/fr", (orig) => chunks.fr.load(orig));
vi.mock("moment/locale/es", (orig) => chunks.es.load(orig));
vi.mock("moment/locale/it", (orig) => chunks.it.load(orig));
vi.mock("moment/locale/nl", (orig) => chunks.nl.load(orig));
vi.mock("moment/locale/ru", (orig) => chunks.ru.load(orig));

type Chunk = (typeof chunks)["de"];

const requested = (chunk: Chunk) =>
	waitFor(() => expect(chunk.requested).toBe(true));
/**
 * finishes loading the chunk: it ran, so moment's global locale is its own,
 * and the updates waiting for it resume
 */
const finish = async (chunk: Chunk) => {
	chunk.finish();
	await waitFor(() => expect(chunk.loaded).toBe(true));
};
const changeLanguage = (lng: string) =>
	act(async () => {
		await ccI18n.changeLanguage(lng);
	});

/** a translated component that shows dates: it renders moment's locale */
const MomentLocale = () => {
	useTranslation();
	return <span data-testid={"moment-locale"}>{moment.locale()}</span>;
};
/** moment, <html lang> and a translated component settle on the language */
const settlesOn = (code: string) =>
	waitFor(() => {
		expect(moment.locale()).toBe(code);
		expect(document.documentElement.lang).toBe(code);
		expect(screen.getByTestId("moment-locale").textContent).toBe(code);
	});

beforeEach(async () => {
	await ccI18n.changeLanguage("en-US");
	moment.locale("en");
	document.documentElement.lang = "";
});
afterEach(async () => {
	cleanup();
	// a real switch changes the shared instance and the detector's cache
	await ccI18n.changeLanguage("en-US");
	moment.locale("en");
	localStorage.clear();
});

describe("CCI18nProvider", () => {
	it("[ISSUE-3499-ITEM-19] moment and <html lang> end on the latest language when an earlier language's moment locale loads last", async () => {
		render(
			<CCI18nProvider>
				<MomentLocale />
			</CCI18nProvider>,
		);
		await settlesOn("en");

		await changeLanguage("de-DE");
		await requested(chunks.de);
		await changeLanguage("fr-FR");
		await requested(chunks.fr);

		await finish(chunks.fr);
		await settlesOn("fr");

		// the German update is stale by now
		await finish(chunks.de);
		await settlesOn("fr");
	});

	it("[ISSUE-3499-ITEM-19] translated components show the latest language's moment locale when an earlier language's loads first", async () => {
		render(
			<CCI18nProvider>
				<MomentLocale />
			</CCI18nProvider>,
		);
		await settlesOn("en");

		await changeLanguage("es-ES");
		await requested(chunks.es);
		await changeLanguage("it-IT");
		await requested(chunks.it);

		// the Spanish update is stale: it neither applies nor ends the update
		await finish(chunks.es);
		await settlesOn("en");

		await finish(chunks.it);
		await settlesOn("it");
	});

	it("[ISSUE-3499-ITEM-19] under StrictMode the update of the discarded first mount is dropped too", async () => {
		await ccI18n.changeLanguage("nl-NL");
		render(
			<React.StrictMode>
				<CCI18nProvider>
					<MomentLocale />
				</CCI18nProvider>
			</React.StrictMode>,
		);
		await requested(chunks.nl);

		await changeLanguage("ru-RU");
		await requested(chunks.ru);

		// Both mounts' Dutch updates are stale now. What moment shows meanwhile
		// depends on how the test runner serves the second of two concurrent
		// imports of one chunk, so only the end state is checked.
		await finish(chunks.nl);
		await finish(chunks.ru);
		await settlesOn("ru");
	});
});
