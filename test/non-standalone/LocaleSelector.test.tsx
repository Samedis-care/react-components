import React from "react";
import {
	describe,
	it,
	expect,
	vi,
	afterEach,
	beforeAll,
	beforeEach,
} from "vitest";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	act,
	waitFor,
	within,
} from "@testing-library/react";
import { Dialog, DialogTitle as MuiDialogTitle } from "@mui/material";
import { createTheme, ThemeProvider, type Theme } from "@mui/material/styles";
import { createMemoryHistory } from "history";
import { setFrameworkHistory } from "../../src/framework/History";
import DialogContextProvider, {
	DialogContextType,
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import ccI18n from "../../src/i18n";
// Dialog/Utils must come before the component modules: importing the Dialog
// index first runs into an import cycle
import "../../src/non-standalone/Dialog/Utils";
import LocaleSelectorDialog from "../../src/non-standalone/LocaleSelector/LocaleSelectorDialog";

const DE = ["de"];

/**
 * jsdom has no ResizeObserver, and without one react-window renders no rows at
 * all, so every "row X is absent" check would pass vacuously. The stub reports
 * this height for the list at once: 600px mounts rows 1-9 plus 2 overscan.
 * Rows measure 70px (react-window reads borderBoxSize for measured row heights).
 */
let listHeight = 600;

beforeAll(async () => {
	window.ResizeObserver = class {
		constructor(private cb: ResizeObserverCallback) {}
		observe(target: Element) {
			this.cb(
				[
					{
						target,
						contentRect: { height: listHeight, width: 400 },
						borderBoxSize: [{ blockSize: 70, inlineSize: 400 }],
					} as unknown as ResizeObserverEntry,
				],
				this,
			);
		}
		unobserve() {}
		disconnect() {}
	};
	await ccI18n.changeLanguage("en-US");
	await ccI18n.loadNamespaces(["translation", "locale-switcher"]);
});
beforeEach(() => {
	setFrameworkHistory(createMemoryHistory());
	listHeight = 600;
});
afterEach(async () => {
	cleanup();
	vi.restoreAllMocks();
	// a real switch changes the shared instance and the detector's cache
	await ccI18n.changeLanguage("en-US");
	localStorage.clear();
});

let ctx: DialogContextType;
const Grab = () => {
	ctx = useDialogContext();
	return null;
};
const mount = (theme: Theme = createTheme()) =>
	render(
		<ThemeProvider theme={theme}>
			<DialogContextProvider>
				<Grab />
			</DialogContextProvider>
		</ThemeProvider>,
	);
const open = (dialog: React.ReactNode) =>
	act(() => {
		ctx[0](dialog);
	});
/** lets pending promise continuations and their state updates settle */
const flush = async () => {
	for (let i = 0; i < 20; i++) await act(() => Promise.resolve());
};
/** all mounted dialogs, including the ones a dialog on top hides */
const dialogEls = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
const rows = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="listitem"]'));
/** the rows appear after the lazy content chunk and the locale-switcher namespace */
const waitRows = () =>
	waitFor(() => {
		if (!rows().length) throw new Error("no rows rendered");
		return rows();
	});
/** the row control (role=button) whose texts include the given text */
const rowBtn = (text: string) =>
	waitFor(() => {
		const button = rows()
			.map((row) => row.querySelector<HTMLElement>('[role="button"]'))
			.find((el) => el?.textContent?.includes(text));
		if (!button) throw new Error("no row " + text);
		return button;
	});
const search = async (query: string) => {
	fireEvent.change(searchInput(), { target: { value: query } });
	await flush();
};
const searchInput = () => {
	const input = document.querySelector<HTMLInputElement>(
		'[role="dialog"] input',
	);
	if (!input) throw new Error("no search input");
	return input;
};
const noLocalesText = () =>
	ccI18n.t("non-standalone.language-switcher.no-locales");

type ChangeLanguage = typeof ccI18n.changeLanguage;
/** replaces ccI18n.changeLanguage with a call that stays pending until released */
const holdSwitch = () => {
	let resolve: (() => void) | undefined;
	const spy = vi.spyOn(ccI18n, "changeLanguage").mockImplementation(
		(() =>
			new Promise<void>((res) => {
				resolve = res;
			})) as unknown as ChangeLanguage,
	);
	return {
		spy,
		release: async () => {
			await act(async () => {
				resolve?.();
				await Promise.resolve();
			});
			await flush();
		},
	};
};

type ReadFn = (
	lng: string,
	ns: string,
	cb: (err: unknown, data: unknown) => void,
) => void;
const backend = () =>
	(
		ccI18n.services.backendConnector as unknown as {
			backend: { read: ReadFn };
		}
	).backend;

describe("LocaleSelectorDialog", () => {
	describe("switching", () => {
		it("[ISSUE-3499-ITEM-1] a language that fails to load shows an error and keeps the previous language", async () => {
			// e.g. offline, or the old chunk hashes return 404 after a deploy.
			// nl is used by no other test: i18next does not retry a failed load.
			const read = backend().read.bind(backend());
			vi.spyOn(backend(), "read").mockImplementation((lng, ns, cb) =>
				lng.startsWith("nl")
					? cb(new Error("ChunkLoadError"), null)
					: read(lng, ns, cb),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});
			mount();
			open(<LocaleSelectorDialog supportedLocales={["nl"]} />);
			fireEvent.click(await rowBtn("Netherlands"));
			// settled: either the selector closed, or an error dialog is on top of it
			await waitFor(() => expect([0, 2]).toContain(dialogEls().length), {
				timeout: 10000,
			});
			expect(
				dialogEls().map((el) => el.querySelector("h2")?.textContent),
			).toEqual([
				expect.stringContaining("Select your country and language"),
				expect.stringContaining("An error occurred"),
			]);
			expect(ccI18n.language).toBe("en-US");
		});

		it("[ISSUE-3499-ITEM-1] picking a language that failed to load again shows the error again, and the previous language stays remembered", async () => {
			// it is used by no other test: i18next does not retry a failed load,
			// so the second pick loads nothing and reports no error of its own
			const read = backend().read.bind(backend());
			vi.spyOn(backend(), "read").mockImplementation((lng, ns, cb) =>
				lng.startsWith("it")
					? cb(new Error("ChunkLoadError"), null)
					: read(lng, ns, cb),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});
			const changed = vi.fn();
			ccI18n.on("languageChanged", changed);
			try {
				mount();
				open(<LocaleSelectorDialog supportedLocales={["it"]} />);
				for (let attempt = 1; attempt <= 2; attempt++) {
					fireEvent.click(await rowBtn("Italy"));
					await waitFor(() => expect([0, 2]).toContain(dialogEls().length), {
						timeout: 10000,
					});
					expect(dialogEls()).toHaveLength(2);
					const errorDialog = dialogEls()[1];
					expect(errorDialog).toHaveTextContent(
						ccI18n.t("non-standalone.language-switcher.load-error"),
					);
					expect(ccI18n.language).toBe("en-US");
					expect(localStorage.getItem("i18nextLng")).toBe("en-US");
					// listeners that followed the failed language are switched back
					expect(changed.mock.lastCall).toEqual(["en-US"]);
					fireEvent.click(
						within(errorDialog).getByRole("button", { name: "OK" }),
					);
					// the selector stays open for another pick
					await waitFor(() => expect(dialogEls()).toHaveLength(1));
				}
			} finally {
				ccI18n.off("languageChanged", changed);
			}
		});

		it("[ISSUE-3499-ITEM-1] a language that loads is applied, and the dialog closes without an error", async () => {
			mount();
			open(<LocaleSelectorDialog supportedLocales={["fr"]} />);
			fireEvent.click(await rowBtn("France"));
			await waitFor(() => expect(ccI18n.language).toBe("fr-FR"), {
				timeout: 10000,
			});
			await waitFor(() => expect(dialogEls()).toHaveLength(0));
			expect(localStorage.getItem("i18nextLng")).toBe("fr-FR");
		});

		it("[ISSUE-3499-ITEM-2] Escape while the language loads: the switch finishes without an error dialog", async () => {
			const { release } = holdSwitch();
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			mount();
			open(<LocaleSelectorDialog supportedLocales={DE} />);
			fireEvent.click(await rowBtn("Austria"));
			await flush();
			fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
			await flush();
			await release();
			// closed by Escape or by the finished switch, and nothing else shown
			expect(dialogEls().map((el) => el.textContent)).toEqual([]);
			expect(error).not.toHaveBeenCalled();
		});

		it("[ISSUE-3499-ITEM-2] Escape while the language loads: the dialog below stays open when the load ends", async () => {
			const { release } = holdSwitch();
			mount();
			open(
				<Dialog open>
					<MuiDialogTitle>Below</MuiDialogTitle>
				</Dialog>,
			);
			open(<LocaleSelectorDialog supportedLocales={DE} />);
			fireEvent.click(await rowBtn("Austria"));
			await flush();
			const top = dialogEls()[1];
			fireEvent.keyDown(top, { key: "Escape" });
			await flush();
			await release();
			expect(dialogEls().map((el) => el.textContent)).toEqual(["Below"]);
		});
	});

	describe("accessibility", () => {
		it("[ISSUE-3499-ITEM-3] the search box is named", async () => {
			mount();
			open(<LocaleSelectorDialog supportedLocales={DE} />);
			await waitRows();
			expect(searchInput()).toHaveAccessibleName(/search/i);
		});

		it("[ISSUE-3499-ITEM-3] the search result is announced in a status region", async () => {
			mount();
			open(<LocaleSelectorDialog supportedLocales={DE} />);
			await waitRows();
			await search("xyz");
			expect(
				within(screen.getByRole("dialog")).getByRole("status"),
			).toHaveTextContent(noLocalesText());
		});

		it("[ISSUE-3499-ITEM-3] the status region states the number of rows, and stays the same element while the search changes", async () => {
			mount();
			open(<LocaleSelectorDialog supportedLocales={DE} />);
			await waitRows();
			// a live region announces changes of its text, not its insertion
			const status = within(screen.getByRole("dialog")).getByRole("status");
			const all = rows()[0].getAttribute("aria-setsize");
			expect(Number(all)).toBeGreaterThan(1);
			expect(status.textContent).toBe(`Results: ${all}`);
			await search("Germany");
			expect(rows()).toHaveLength(1);
			expect(status.textContent).toBe("Results: 1");
			await search("xyz");
			expect(status.textContent).toBe(noLocalesText());
			await search("");
			expect(status.textContent).toBe(`Results: ${all}`);
			expect(within(screen.getByRole("dialog")).getByRole("status")).toBe(
				status,
			);
		});
	});
});
