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
import { showLocaleSelectorDialog } from "../../src/non-standalone/LocaleSelector/showLocaleSelectorDialog";
import type { DialogPromise } from "../../src/non-standalone/Dialog/Utils";
import type { showLocaleSelectorDialog as RootShowLocaleSelectorDialog } from "../../src";

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
/**
 * The dialog's search status. The dialog has two status regions: the search's, which
 * always has a text, and the busy overlay's, which is empty until a locale is picked
 */
const searchStatus = () => {
	const statuses = within(screen.getByRole("dialog"))
		.getAllByRole("status")
		.filter((status) => status.textContent !== "");
	expect(statuses).toHaveLength(1);
	return statuses[0];
};

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

/** the close button in the dialog's title */
const closeButton = () =>
	within(screen.getByRole("dialog")).getByRole("button", { name: "Close" });
/** a click on the area around the dialog box (MUI's backdrop click) */
const clickBackdrop = () => {
	const container = document.querySelector<HTMLElement>(".MuiDialog-container");
	if (!container) throw new Error("no dialog container");
	fireEvent.mouseDown(container);
	fireEvent.click(container);
};
const dismissals: [string, () => void][] = [
	["the close button", () => fireEvent.click(closeButton())],
	[
		"Escape",
		() => fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" }),
	],
	["a backdrop click", clickBackdrop],
];

/** renders the dialog from state, as an app does with an MUI Dialog */
const Inline = (props: { onClose: () => void }) => {
	const { onClose } = props;
	const [open, setOpen] = React.useState(true);
	const close = React.useCallback(() => {
		onClose();
		setOpen(false);
	}, [onClose]);
	return open ? (
		<LocaleSelectorDialog supportedLocales={DE} onClose={close} />
	) : null;
};

describe("LocaleSelectorDialog", () => {
	describe("onClose", () => {
		it.each(dismissals)(
			"[ISSUE-3499-ITEM-17] rendered without pushDialog, %s calls onClose, which closes it by no longer rendering it",
			async (_way, dismiss) => {
				const onClose = vi.fn();
				render(
					<DialogContextProvider>
						<Inline onClose={onClose} />
					</DialogContextProvider>,
				);
				await rowBtn("Austria");
				dismiss();
				expect(onClose).toHaveBeenCalledTimes(1);
				await waitFor(() => expect(dialogEls()).toHaveLength(0));
			},
		);

		it.each(dismissals)(
			"[ISSUE-3499-ITEM-17] pushed, %s closes it and calls onClose once",
			async (_way, dismiss) => {
				const onClose = vi.fn();
				mount();
				open(<LocaleSelectorDialog supportedLocales={DE} onClose={onClose} />);
				await rowBtn("Austria");
				dismiss();
				await waitFor(() => expect(dialogEls()).toHaveLength(0));
				await flush();
				expect(onClose).toHaveBeenCalledTimes(1);
			},
		);

		it("[ISSUE-3499-ITEM-17] rendered without pushDialog, a pick calls onClose once the language is applied", async () => {
			const onClose = vi.fn(() => {
				// the language is applied before the dialog reports itself closed
				expect(ccI18n.language).toBe("fr-FR");
			});
			render(
				<DialogContextProvider>
					<LocaleSelectorDialog supportedLocales={["fr"]} onClose={onClose} />
				</DialogContextProvider>,
			);
			fireEvent.click(await rowBtn("France"));
			await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), {
				timeout: 10000,
			});
			expect(onClose).toHaveReturned();
		});

		it("[ISSUE-3499-ITEM-17] pushed, a pick closes it and calls onClose once", async () => {
			const onClose = vi.fn();
			mount();
			open(
				<LocaleSelectorDialog supportedLocales={["fr"]} onClose={onClose} />,
			);
			fireEvent.click(await rowBtn("France"));
			await waitFor(() => expect(dialogEls()).toHaveLength(0), {
				timeout: 10000,
			});
			await flush();
			expect(ccI18n.language).toBe("fr-FR");
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3499-ITEM-17] removed while the picked language loads, neither onChange nor onClose is called when the load ends", async () => {
			const { release } = holdSwitch();
			const onChange = vi.fn();
			const onClose = vi.fn();
			const { rerender } = render(
				<DialogContextProvider>
					<LocaleSelectorDialog
						supportedLocales={DE}
						onChange={onChange}
						onClose={onClose}
					/>
				</DialogContextProvider>,
			);
			fireEvent.click(await rowBtn("Austria"));
			await flush();
			rerender(<DialogContextProvider>{null}</DialogContextProvider>);
			await flush();
			expect(dialogEls()).toHaveLength(0);
			await release();
			expect(onChange).not.toHaveBeenCalled();
			expect(onClose).not.toHaveBeenCalled();
		});

		it("[ISSUE-3499-ITEM-17] the onClose of the latest render is called", async () => {
			const first = vi.fn();
			const latest = vi.fn();
			const { rerender } = render(
				<DialogContextProvider>
					<LocaleSelectorDialog supportedLocales={DE} onClose={first} />
				</DialogContextProvider>,
			);
			await rowBtn("Austria");
			rerender(
				<DialogContextProvider>
					<LocaleSelectorDialog supportedLocales={DE} onClose={latest} />
				</DialogContextProvider>,
			);
			fireEvent.click(closeButton());
			expect(first).not.toHaveBeenCalled();
			expect(latest).toHaveBeenCalledTimes(1);
		});
	});

	describe("onChange", () => {
		it("[ISSUE-3499-ITEM-17] a pick calls onChange with the picked locale once it is applied, then onClose", async () => {
			const calls: string[] = [];
			const onChange = vi.fn((locale: string) => {
				calls.push(`change ${locale}, language ${ccI18n.language}`);
			});
			const onClose = vi.fn(() => {
				calls.push("close");
			});
			mount();
			open(
				<LocaleSelectorDialog
					supportedLocales={["fr"]}
					onChange={onChange}
					onClose={onClose}
				/>,
			);
			fireEvent.click(await rowBtn("France"));
			await waitFor(() => expect(dialogEls()).toHaveLength(0), {
				timeout: 10000,
			});
			await flush();
			expect(calls).toEqual(["change fr-FR, language fr-FR", "close"]);
		});

		it("[ISSUE-3499-ITEM-17] picking the current locale again calls onChange with it", async () => {
			const onChange = vi.fn();
			mount();
			open(
				<LocaleSelectorDialog
					supportedLocales={["en-US"]}
					onChange={onChange}
				/>,
			);
			fireEvent.click(await rowBtn("United States"));
			await waitFor(() => expect(dialogEls()).toHaveLength(0));
			await flush();
			expect(onChange).toHaveBeenCalledExactlyOnceWith("en-US");
		});

		it("[ISSUE-3499-ITEM-17] the onChange of the latest render is called", async () => {
			const first = vi.fn();
			const latest = vi.fn();
			const { rerender } = render(
				<DialogContextProvider>
					<LocaleSelectorDialog supportedLocales={["fr"]} onChange={first} />
				</DialogContextProvider>,
			);
			const row = await rowBtn("France");
			rerender(
				<DialogContextProvider>
					<LocaleSelectorDialog supportedLocales={["fr"]} onChange={latest} />
				</DialogContextProvider>,
			);
			fireEvent.click(row);
			await waitFor(() => expect(latest).toHaveBeenCalledTimes(1), {
				timeout: 10000,
			});
			expect(latest).toHaveBeenCalledWith("fr-FR");
			expect(first).not.toHaveBeenCalled();
		});

		it("[ISSUE-3499-ITEM-17] a language that fails to load calls neither onChange nor onClose, and the dialog can be closed again once the error is acknowledged", async () => {
			// es is used by no other test: i18next does not retry a failed load
			const read = backend().read.bind(backend());
			vi.spyOn(backend(), "read").mockImplementation((lng, ns, cb) =>
				lng.startsWith("es")
					? cb(new Error("ChunkLoadError"), null)
					: read(lng, ns, cb),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});
			const onChange = vi.fn();
			const onClose = vi.fn();
			mount();
			open(
				<LocaleSelectorDialog
					supportedLocales={["es-ES"]}
					onChange={onChange}
					onClose={onClose}
				/>,
			);
			fireEvent.click(await rowBtn("Spain"));
			await waitFor(() => expect(dialogEls()).toHaveLength(2), {
				timeout: 10000,
			});
			fireEvent.click(
				within(dialogEls()[1]).getByRole("button", { name: "OK" }),
			);
			await waitFor(() => expect(dialogEls()).toHaveLength(1));
			await flush();
			expect(onChange).not.toHaveBeenCalled();
			expect(onClose).not.toHaveBeenCalled();
			fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
			await waitFor(() => expect(dialogEls()).toHaveLength(0));
			expect(onClose).toHaveBeenCalledTimes(1);
			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe("while the picked language loads", () => {
		it.each(dismissals)(
			"[ISSUE-3499-ITEM-17] %s is ignored, and the dialog closes once the language is applied",
			async (_way, dismiss) => {
				const { release } = holdSwitch();
				const onChange = vi.fn();
				const onClose = vi.fn();
				mount();
				open(
					<LocaleSelectorDialog
						supportedLocales={DE}
						onChange={onChange}
						onClose={onClose}
					/>,
				);
				fireEvent.click(await rowBtn("Austria"));
				await flush();
				dismiss();
				await flush();
				expect(dialogEls()).toHaveLength(1);
				expect(onClose).not.toHaveBeenCalled();
				await release();
				await waitFor(() => expect(dialogEls()).toHaveLength(0));
				expect(onChange).toHaveBeenCalledExactlyOnceWith("de-AT");
				expect(onClose).toHaveBeenCalledTimes(1);
			},
		);

		it.each(dismissals)(
			"[ISSUE-3499-ITEM-17] rendered without pushDialog, %s is ignored until the language is applied",
			async (_way, dismiss) => {
				const { release } = holdSwitch();
				const onClose = vi.fn();
				render(
					<DialogContextProvider>
						<Inline onClose={onClose} />
					</DialogContextProvider>,
				);
				fireEvent.click(await rowBtn("Austria"));
				await flush();
				dismiss();
				await flush();
				expect(onClose).not.toHaveBeenCalled();
				expect(dialogEls()).toHaveLength(1);
				await release();
				expect(onClose).toHaveBeenCalledTimes(1);
				await waitFor(() => expect(dialogEls()).toHaveLength(0));
			},
		);
	});

	describe("showLocaleSelectorDialog", () => {
		const show = (props: Parameters<typeof showLocaleSelectorDialog>[1]) => {
			let result: DialogPromise<string | null> | undefined;
			act(() => {
				result = showLocaleSelectorDialog(ctx[0], props);
			});
			if (!result) throw new Error("nothing shown");
			const settled = vi.fn();
			result.then(settled, settled);
			return { result, settled };
		};

		it("[ISSUE-3499-ITEM-17] is exported from the package root", () => {
			const fromRoot: typeof RootShowLocaleSelectorDialog =
				showLocaleSelectorDialog;
			expect(fromRoot).toBeTypeOf("function");
		});

		it("[ISSUE-3499-ITEM-17] resolves to the picked locale once it is applied, and the dialog is closed", async () => {
			mount();
			const { settled } = show({ supportedLocales: ["fr"] });
			fireEvent.click(await rowBtn("France"));
			await waitFor(() => expect(settled).toHaveBeenCalledWith("fr-FR"), {
				timeout: 10000,
			});
			expect(ccI18n.language).toBe("fr-FR");
			await waitFor(() => expect(dialogEls()).toHaveLength(0));
			expect(settled).toHaveBeenCalledTimes(1);
		});

		it.each(dismissals)(
			"[ISSUE-3499-ITEM-17] resolves to null when %s dismisses the dialog",
			async (_way, dismiss) => {
				mount();
				const { settled } = show({ supportedLocales: DE });
				await rowBtn("Austria");
				dismiss();
				await waitFor(() => expect(dialogEls()).toHaveLength(0));
				await flush();
				expect(settled).toHaveBeenCalledExactlyOnceWith(null);
			},
		);

		it("[ISSUE-3499-ITEM-17] its close() closes the dialog and resolves to null at once", async () => {
			mount();
			const { result, settled } = show({ supportedLocales: DE });
			await rowBtn("Austria");
			act(() => result.close());
			await flush();
			expect(settled).toHaveBeenCalledExactlyOnceWith(null);
			await waitFor(() => expect(dialogEls()).toHaveLength(0));
		});

		it("[ISSUE-3499-ITEM-17] stays pending while the picked language loads, also through Escape", async () => {
			const { release } = holdSwitch();
			mount();
			const { settled } = show({ supportedLocales: DE });
			fireEvent.click(await rowBtn("Austria"));
			await flush();
			fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
			await flush();
			expect(settled).not.toHaveBeenCalled();
			await release();
			expect(settled).toHaveBeenCalledExactlyOnceWith("de-AT");
		});
	});

	describe("supportedLocales", () => {
		it.each([["de-at"], ["de_AT"], ["DE-at"], ["De_aT"]])(
			"[ISSUE-3499-ITEM-17] %s is read as de-AT, ignoring case and with _ for -",
			async (entry) => {
				mount();
				open(<LocaleSelectorDialog supportedLocales={[entry]} />);
				await waitRows();
				expect(rows()).toHaveLength(1);
				expect(rows()[0]).toHaveTextContent("Austria");
			},
		);

		it("[ISSUE-3499-ITEM-17] a language matches ignoring case: DE offers every German row", async () => {
			mount();
			open(<LocaleSelectorDialog supportedLocales={["DE"]} />);
			await waitRows();
			expect(rows()[0]).toHaveAttribute("aria-setsize", "11");
		});

		it("[ISSUE-3499-ITEM-17] takes a readonly array (as const)", async () => {
			const langs = ["de-AT", "fr-FR"] as const;
			mount();
			open(<LocaleSelectorDialog supportedLocales={langs} />);
			await waitRows();
			const texts = rows().map((row) => row.textContent);
			expect(texts).toHaveLength(2);
			expect(texts).toEqual(
				expect.arrayContaining([
					expect.stringContaining("Austria"),
					expect.stringContaining("France"),
				]),
			);
		});
	});

	describe("paper slot", () => {
		it("[ISSUE-3499-ITEM-17] classes.paper lands on the visible box, MUI's dialog paper", async () => {
			mount();
			open(
				<LocaleSelectorDialog
					supportedLocales={DE}
					classes={{ paper: "app-paper" }}
				/>,
			);
			await waitRows();
			const box = screen.getByRole("dialog");
			expect(box).toHaveClass("app-paper");
			expect(box).toHaveClass("MuiDialog-paper");
		});
	});

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
			expect(searchStatus()).toHaveTextContent(noLocalesText());
		});

		it("[ISSUE-3499-ITEM-3] the status region states the number of rows, and stays the same element while the search changes", async () => {
			mount();
			open(<LocaleSelectorDialog supportedLocales={DE} />);
			await waitRows();
			// a live region announces changes of its text, not its insertion
			const status = searchStatus();
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
			expect(searchStatus()).toBe(status);
		});
	});
});
