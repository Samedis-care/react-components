import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import {
	act,
	cleanup,
	fireEvent,
	renderHook,
	screen,
	within,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import { useBackendDataGridDeleteHandler } from "../../../src/backend-components/DataGrid";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelVisibilityEdit,
} from "../../../src/backend-integration";
import BackendError from "../../../src/backend-integration/Connector/BackendError";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import ccI18n from "../../../src/i18n";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(async () => {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
	await ccI18n.loadNamespaces("translation");
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const FILTER = { quickFilter: "", additionalFilters: {}, fieldFilter: {} };

const createModel = () => {
	const connector = new MockConnector([
		{ id: "1", title: "One" },
		{ id: "2", title: "Two" },
	]);
	const model = new Model(
		"delete-handler-" + Math.random().toString(16),
		{
			title: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Title",
				visibility: {
					overview: ModelVisibilityEdit,
					edit: ModelVisibilityEdit,
					create: ModelVisibilityEdit,
				},
				customData: null,
			},
		},
		connector,
	);
	return { model, connector };
};

type DeleteHandlerProps = Parameters<typeof useBackendDataGridDeleteHandler>[0];

/**
 * Renders the hook under the Framework (dialogs, translations, query client).
 * The confirmation is skipped unless the props replace customDeleteConfirm
 * (customDeleteConfirm: undefined shows the built-in dialog).
 * @param props Overrides of the hook's props
 * @param prepare Called with the connector before the first render, e.g. to give it
 *                deleteAdvanced
 */
const renderDeleteHandler = (
	props: Partial<DeleteHandlerProps>,
	prepare?: (connector: MockConnector) => void,
) => {
	const { model, connector } = createModel();
	prepare?.(connector);
	const refreshGrid = vi.fn();
	const { result } = renderHook(
		() =>
			useBackendDataGridDeleteHandler(
				{
					model,
					enableDelete: true,
					// skip the confirmation dialog
					customDeleteConfirm: () => {},
					...props,
				},
				refreshGrid,
			),
		{
			wrapper: ({ children }: { children: React.ReactNode }) => (
				<Framework>{children}</Framework>
			),
		},
	);
	return {
		handleDelete: result.current!,
		result,
		connector,
		model,
		refreshGrid,
	};
};

/** Keeps the console clean of the cancel that the handler logs (ISSUE-3497-ITEM-4) */
const silenceConsoleError = () =>
	vi.spyOn(console, "error").mockImplementation(() => {});

const CONFIRM = "backend-components.data-grid.delete.confirm-dialog.";
const ERROR_DIALOG = "backend-components.data-grid.delete.error-dialog.";

describe("useBackendDataGridDeleteHandler onDeleteSettled", () => {
	it("is called after a delete, once the grid refreshed", async () => {
		const onDeleteSettled = vi.fn();
		const { handleDelete, connector, refreshGrid } = renderDeleteHandler({
			onDeleteSettled,
		});
		const deleteMultiple = vi.spyOn(connector, "deleteMultiple");

		await act(() => handleDelete(false, ["1", "2"], FILTER));

		expect(deleteMultiple).toHaveBeenCalledWith(["1", "2"], expect.anything());
		expect(onDeleteSettled).toHaveBeenCalledExactlyOnceWith(
			false,
			["1", "2"],
			FILTER,
			undefined,
		);
		expect(refreshGrid.mock.invocationCallOrder[0]).toBeLessThan(
			onDeleteSettled.mock.invocationCallOrder[0],
		);
	});

	it("is called with the error of a failed delete, before the error is shown", async () => {
		const onDeleteSettled = vi.fn();
		const customDeleteErrorHandler = vi.fn();
		const { handleDelete, connector } = renderDeleteHandler({
			onDeleteSettled,
			customDeleteErrorHandler,
		});
		const error = new BackendError("conflict", "conflict");
		vi.spyOn(connector, "deleteMultiple").mockRejectedValue(error);

		await act(() => handleDelete(false, ["1"], FILTER));

		expect(onDeleteSettled).toHaveBeenCalledExactlyOnceWith(
			false,
			["1"],
			FILTER,
			error,
		);
		expect(customDeleteErrorHandler).toHaveBeenCalledWith(error);
		expect(onDeleteSettled.mock.invocationCallOrder[0]).toBeLessThan(
			customDeleteErrorHandler.mock.invocationCallOrder[0],
		);
	});

	it("isn't called when the user cancels the confirmation", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const onDeleteSettled = vi.fn();
		const { handleDelete, connector } = renderDeleteHandler({
			onDeleteSettled,
			customDeleteConfirm: () => {
				throw new Error("cancelled");
			},
		});
		const deleteMultiple = vi.spyOn(connector, "deleteMultiple");

		await act(() => handleDelete(false, ["1"], FILTER));

		expect(deleteMultiple).not.toHaveBeenCalled();
		expect(onDeleteSettled).not.toHaveBeenCalled();
	});

	it("doesn't turn an error thrown by the callback into a failed delete", async () => {
		const customDeleteErrorHandler = vi.fn();
		const { handleDelete } = renderDeleteHandler({
			onDeleteSettled: () => {
				throw new Error("callback bug");
			},
			customDeleteErrorHandler,
		});

		await expect(act(() => handleDelete(false, ["1"], FILTER))).rejects.toThrow(
			"callback bug",
		);
		expect(customDeleteErrorHandler).not.toHaveBeenCalled();
	});
});

describe("useBackendDataGridDeleteHandler", () => {
	it("[ISSUE-3506-ITEM-5] the confirmation uses the singular for one entry", async () => {
		silenceConsoleError();
		const { handleDelete } = renderDeleteHandler({
			customDeleteConfirm: undefined,
		});
		let pending!: Promise<boolean>;
		act(() => {
			pending = handleDelete(false, ["1"], FILTER);
		});
		const dialog = await screen.findByRole("dialog", { name: "Delete" });
		const shown = dialog.textContent;
		fireEvent.click(within(dialog).getByRole("button", { name: "No" }));
		await act(() => pending.catch(() => undefined));

		await ccI18n.loadLanguages(["de"]);
		const german = ccI18n.getFixedT("de")(CONFIRM + "message", {
			NUM: 1,
			count: 1,
		});
		expect(
			{
				en: /\b1 entry\b/.test(shown ?? ""),
				de: /\b1 Eintrag\b/.test(german),
			},
			`singular in ${JSON.stringify({ en: shown, de: german })}`,
		).toEqual({ en: true, de: true });
	});

	it("[ISSUE-3506-ITEM-5] French Yes reads Oui, the Dutch error title is Dutch and the Uzbek OK is spelled right", async () => {
		await ccI18n.loadLanguages(["fr", "nl", "uz"]);
		const text = (lang: string, key: string) =>
			ccI18n.getResource(lang, "translation", key) as unknown;
		expect({
			fr: text("fr", CONFIRM + "buttons.yes"),
			nl: text("nl", ERROR_DIALOG + "title"),
			uz: text("uz", ERROR_DIALOG + "buttons.okay"),
		}).toEqual({
			fr: "Oui",
			// "Fout" is what the other Dutch error titles use
			nl: expect.stringMatching(/^Fout\b/) as unknown,
			// "OK" as in the other Uzbek dialogs, or the word spelled with its apostrophe
			uz: expect.stringMatching(/^(OK|xo['ʻ‘’]p)$/i) as unknown,
		});
	});

	it("[ISSUE-3506-ITEM-5] the inverted confirmation after select all counts the kept entries in their plural form", async () => {
		silenceConsoleError();
		const { handleDelete } = renderDeleteHandler({
			customDeleteConfirm: undefined,
		});
		let pending!: Promise<boolean>;
		act(() => {
			pending = handleDelete(true, ["1"], FILTER);
		});
		const dialog = await screen.findByRole("dialog", { name: "Delete" });
		expect(dialog).toHaveTextContent(
			"Do you really want to delete everything except 1 entry?",
		);
		fireEvent.click(within(dialog).getByRole("button", { name: "No" }));
		await act(() => pending.catch(() => undefined));
	});

	it("[ISSUE-3506-ITEM-5] each language puts the number where it belongs and uses the form the number needs", async () => {
		const langs = ["de", "fr", "ru", "uz"];
		await ccI18n.loadLanguages(langs);
		const confirm = (
			lang: string,
			key: "message" | "messageInverted",
			count: number,
		) => ccI18n.getFixedT(lang)(CONFIRM + key, { count });
		expect({
			de: confirm("de", "message", 3),
			deInverted: confirm("de", "messageInverted", 3),
			fr: confirm("fr", "message", 3),
			frInverted: confirm("fr", "messageInverted", 1),
			ru1: confirm("ru", "message", 1),
			ru3: confirm("ru", "message", 3),
			ru5: confirm("ru", "message", 5),
			ru21: confirm("ru", "message", 21),
			ruInverted1: confirm("ru", "messageInverted", 1),
			ruInverted3: confirm("ru", "messageInverted", 3),
			uz: confirm("uz", "message", 3),
		}).toEqual({
			de: "Wirklich 3 Einträge löschen?",
			// dative after "außer"
			deInverted: "Wirklich alles außer 3 Einträgen löschen?",
			fr: "Souhaitez-vous vraiment supprimer 3 entrées ?",
			frInverted: "Voulez-vous vraiment tout supprimer sauf 1 entrée ?",
			ru1: "Вы действительно хотите удалить 1 запись?",
			ru3: "Вы действительно хотите удалить 3 записи?",
			ru5: "Вы действительно хотите удалить 5 записей?",
			ru21: "Вы действительно хотите удалить 21 запись?",
			// genitive after "кроме"
			ruInverted1: "Вы действительно хотите удалить все, кроме 1 записи?",
			ruInverted3: "Вы действительно хотите удалить все, кроме 3 записей?",
			uz: "Haqiqatan ham 3 ta yozuvni o'chirmoqchimisiz?",
		});
	});

	it("[ISSUE-3506-ITEM-5] has both confirmations in every locale, for each of their plural forms", () => {
		const i18nDir = path.resolve(__dirname, "../../../src/assets/i18n");
		const missing = fs
			.readdirSync(i18nDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.flatMap((entry) => {
				const translation = JSON.parse(
					fs.readFileSync(
						path.join(i18nDir, entry.name, "translation.json"),
						"utf8",
					),
				) as {
					"backend-components": {
						"data-grid": {
							delete: { "confirm-dialog": Record<string, unknown> };
						};
					};
				};
				const dialog =
					translation["backend-components"]["data-grid"].delete[
						"confirm-dialog"
					];
				const categories = new Intl.PluralRules(entry.name).resolvedOptions()
					.pluralCategories;
				return ["message", "messageInverted"].flatMap((key) => [
					...categories
						.map((category) => `${key}_${category}`)
						.filter((plural) => {
							const text = dialog[plural];
							return !(
								typeof text === "string" &&
								text.includes("{{count}}") &&
								!text.includes("{{NUM}}")
							);
						})
						.map((plural) => `${entry.name}: ${plural}`),
					// the old key without a plural suffix is gone
					...(key in dialog ? [`${entry.name}: ${key} (unsuffixed)`] : []),
				]);
			});
		expect(missing).toEqual([]);
	});
});

describe("useBackendDataGridDeleteHandler result", () => {
	it("[ISSUE-3495-ITEM-4] resolves false when the user cancels, so the grid keeps the selection", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const { handleDelete, connector } = renderDeleteHandler({
			customDeleteConfirm: () => {
				throw new Error("cancelled");
			},
		});
		const deleteMultiple = vi.spyOn(connector, "deleteMultiple");

		await expect(act(() => handleDelete(false, ["1"], FILTER))).resolves.toBe(
			false,
		);
		expect(deleteMultiple).not.toHaveBeenCalled();
	});

	it("[ISSUE-3495-ITEM-4] resolves true once the delete ran, also when it failed", async () => {
		const { handleDelete, connector } = renderDeleteHandler({
			customDeleteErrorHandler: vi.fn(),
		});

		await expect(act(() => handleDelete(false, ["1"], FILTER))).resolves.toBe(
			true,
		);
		// a failed delete may have deleted some of the records
		vi.spyOn(connector, "deleteMultiple").mockRejectedValue(
			new BackendError("conflict", "conflict"),
		);
		await expect(act(() => handleDelete(false, ["2"], FILTER))).resolves.toBe(
			true,
		);
	});
});

describe("useBackendDataGridDeleteHandler announcement", () => {
	it("[ISSUE-3506-ITEM-11] announces a finished delete politely, with the number of entries", async () => {
		const { handleDelete } = renderDeleteHandler({});

		await act(() => handleDelete(false, ["1", "2"], FILTER));
		expect(await screen.findByRole("status")).toHaveTextContent(
			"2 entries deleted",
		);
	});

	it("[ISSUE-3506-ITEM-11] says one entry for a single one", async () => {
		const { handleDelete } = renderDeleteHandler({});

		await act(() => handleDelete(false, ["1"], FILTER));
		expect(await screen.findByRole("status")).toHaveTextContent(
			"1 entry deleted",
		);
	});

	it("[ISSUE-3506-ITEM-11] says that the selected entries were deleted after a delete of everything except some", async () => {
		const deleteAdvanced = vi.fn();
		const { handleDelete } = renderDeleteHandler(
			{ enableDeleteAll: true },
			(connector) => {
				connector.deleteAdvanced = deleteAdvanced;
			},
		);

		await act(() => handleDelete(true, ["1"], FILTER));
		expect(deleteAdvanced).toHaveBeenCalledOnce();
		expect(await screen.findByRole("status")).toHaveTextContent(
			"The selected entries have been deleted",
		);
	});

	it("[ISSUE-3506-ITEM-11] announces nothing when the user cancels or the delete fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const customDeleteErrorHandler = vi.fn();
		const { handleDelete } = renderDeleteHandler({
			customDeleteConfirm: () => {
				throw new Error("cancelled");
			},
			customDeleteErrorHandler,
		});
		await act(() => handleDelete(false, ["1"], FILTER));
		expect(screen.queryByRole("status"), "after a cancel").toBeNull();
		cleanup();

		const failing = renderDeleteHandler({ customDeleteErrorHandler });
		vi.spyOn(failing.connector, "deleteMultiple").mockRejectedValue(
			new BackendError("conflict", "conflict"),
		);
		await act(() => failing.handleDelete(false, ["1"], FILTER));
		expect(customDeleteErrorHandler).toHaveBeenCalledOnce();
		expect(screen.queryByRole("status"), "after a failure").toBeNull();
	});

	it("[ISSUE-3506-ITEM-11] customDeleteSuccessHandler replaces the toast, before onDeleteSettled", async () => {
		const customDeleteSuccessHandler = vi.fn();
		const onDeleteSettled = vi.fn();
		const { handleDelete } = renderDeleteHandler({
			customDeleteSuccessHandler,
			onDeleteSettled,
		});

		await act(() => handleDelete(false, ["1", "2"], FILTER));
		expect(customDeleteSuccessHandler).toHaveBeenCalledExactlyOnceWith(
			false,
			["1", "2"],
			FILTER,
		);
		expect(customDeleteSuccessHandler.mock.invocationCallOrder[0]).toBeLessThan(
			onDeleteSettled.mock.invocationCallOrder[0],
		);
		expect(screen.queryByRole("status")).toBeNull();
	});

	it("[ISSUE-3506-ITEM-11] has the message in every locale, for each of its plural forms", () => {
		const i18nDir = path.resolve(__dirname, "../../../src/assets/i18n");
		const missing = fs
			.readdirSync(i18nDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.flatMap((entry) => {
				const translation = JSON.parse(
					fs.readFileSync(
						path.join(i18nDir, entry.name, "translation.json"),
						"utf8",
					),
				) as {
					"backend-components": {
						"data-grid": {
							delete: { "success-toast"?: Record<string, string> };
						};
					};
				};
				const toast =
					translation["backend-components"]["data-grid"].delete[
						"success-toast"
					] ?? {};
				return [
					...new Intl.PluralRules(entry.name)
						.resolvedOptions()
						.pluralCategories.filter(
							(category) =>
								!toast[`message_${category}`]?.includes("{{count}}"),
						)
						.map((category) => `${entry.name}: message_${category}`),
					...(toast.messageInverted ? [] : [`${entry.name}: messageInverted`]),
				];
			});
		expect(missing).toEqual([]);
	});
});
