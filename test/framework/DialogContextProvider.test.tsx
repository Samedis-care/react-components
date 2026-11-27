import "@testing-library/jest-dom/vitest";
import React, { useMemo } from "react";
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
	cleanup,
	act,
	fireEvent,
} from "@testing-library/react";
import {
	createBrowserHistory,
	createMemoryHistory,
	MemoryHistory,
} from "history";
import { setFrameworkHistory } from "../../src/framework/History";
import DialogContextProvider, {
	DialogContextType,
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import {
	PushedDialogCloseContext,
	useCloseThisDialog,
} from "../../src/framework/PushedDialogCloseContext";
import type { PushedDialogClose } from "../../src";
import FormDialog from "../../src/backend-components/Form/FormDialog";
import { waitForCcI18n } from "../waitForCcI18n";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import Link from "../../src/standalone/Routes/Link";

let history: MemoryHistory;
beforeAll(async () => {
	await waitForCcI18n();
});
beforeEach(() => {
	history = createMemoryHistory();
	setFrameworkHistory(history);
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

let ctx: DialogContextType;
const Grab = () => {
	ctx = useDialogContext();
	return null;
};
const renderProvider = () =>
	render(
		<DialogContextProvider>
			<Grab />
		</DialogContextProvider>,
	);
/** Pushes `dialog` and returns what pushDialog returned */
const push = (dialog: React.ReactNode) => {
	let close: (() => void) | undefined;
	act(() => {
		close = ctx[0](dialog);
	});
	return close!;
};
const pop = () => act(() => ctx[1]());

const Named = (props: { name: string }) => (
	<div role={"dialog"} aria-label={props.name} />
);

const closers: Record<string, () => void> = {};

/**
 * A dialog named `name` with a button that closes it through useCloseThisDialog
 */
const Closable = (props: { name: string }) => {
	const close = useCloseThisDialog();
	closers[props.name] = close;
	return (
		<div role={"dialog"} aria-label={props.name}>
			<button type={"button"} onClick={close}>
				{"Close " + props.name}
			</button>
		</div>
	);
};

const openDialogs = () =>
	screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"));

describe("pushDialog", () => {
	it("returns a function that closes the dialog it pushed, and only that one, also while dialogs pushed after it are open", () => {
		renderProvider();
		const closeFirst = push(<Named name={"First"} />);
		push(<Named name={"Second"} />);
		push(<Named name={"Third"} />);
		expect(openDialogs()).toEqual(["First", "Second", "Third"]);

		act(() => closeFirst());
		expect(openDialogs()).toEqual(["Second", "Third"]);
	});

	it("returns a close that does nothing when called again, or after the dialog was closed another way", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		renderProvider();
		const closeFirst = push(<Named name={"First"} />);
		const closeSecond = push(<Named name={"Second"} />);

		// popDialog closed it
		pop();
		expect(openDialogs()).toEqual(["First"]);
		act(() => closeSecond());
		expect(openDialogs(), "closed another dialog").toEqual(["First"]);

		// called a second time, with another dialog open
		act(() => closeFirst());
		expect(openDialogs()).toEqual([]);
		const closeThird = push(<Closable name={"Third"} />);
		act(() => closeFirst());
		expect(openDialogs(), "closed another dialog").toEqual(["Third"]);

		// the dialog's own close (useCloseThisDialog) closed it
		push(<Named name={"Fourth"} />);
		fireEvent.click(screen.getByRole("button", { name: "Close Third" }));
		expect(openDialogs()).toEqual(["Fourth"]);
		act(() => closeThird());
		expect(openDialogs(), "closed another dialog").toEqual(["Fourth"]);

		expect(consoleError).not.toHaveBeenCalled();
	});

	it("returns the function useCloseThisDialog returns inside that dialog, for the life of the dialog", () => {
		renderProvider();
		const closeFirst = push(<Closable name={"First"} />);
		expect(closeFirst).toBe(closers.First);

		// a re-render of the dialog (another one pushed) keeps it
		const seen = closers.First;
		push(<Closable name={"Second"} />);
		expect(closers.First).toBe(seen);
		expect(closeFirst).toBe(closers.First);
		expect(closers.Second).not.toBe(closers.First);
	});

	it("returns the function useCloseThisDialog returns in the content of a FullFormDialog it pushed", () => {
		renderProvider();
		const close = push(
			<FormDialog dialogTitle={"Form"}>
				<Closable name={"Content"} />
			</FormDialog>,
		);
		expect(close).toBe(closers.Content);

		act(() => close());
		expect(screen.queryByText("Form")).toBeNull();
	});

	it("leaves nothing rendered when the dialog is closed before the next render", () => {
		renderProvider();
		push(<Named name={"First"} />);
		act(() => {
			const close = ctx[0](<Named name={"Second"} />);
			close();
		});
		expect(openDialogs()).toEqual(["First"]);
	});

	it("[ISSUE-3497-ITEM-2] blocks neither navigation nor closing the tab", () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		// a browser history: only that one blocks closing the tab while it blocks navigation
		const browserHistory = createBrowserHistory();
		setFrameworkHistory(browserHistory);
		renderProvider();
		push(<Named name={"First"} />);
		push(<Named name={"Second"} />);

		// while the dialogs are open: a navigation closes them (ISSUE-3475-ITEM-21)
		const unload = new Event("beforeunload", { cancelable: true });
		window.dispatchEvent(unload);
		act(() => browserHistory.push("/elsewhere"));
		expect({
			path: browserHistory.location.pathname,
			alerts: alert.mock.calls.length,
			unloadBlocked: unload.defaultPrevented,
		}).toEqual({
			path: "/elsewhere",
			alerts: 0,
			unloadBlocked: false,
		});
	});
});

describe("[ISSUE-3475-ITEM-21] navigation", () => {
	it("[ISSUE-3475-ITEM-21] closes the dialogs when a navigation leads to another path: push, replace, back", () => {
		history = createMemoryHistory({ initialEntries: ["/devices"] });
		setFrameworkHistory(history);
		renderProvider();
		push(<Named name={"First"} />);
		push(<Named name={"Second"} />);
		act(() => history.push("/devices/4711"));
		expect(openDialogs(), "push").toEqual([]);

		push(<Named name={"Third"} />);
		act(() => history.replace("/devices/4711/notes"));
		expect(openDialogs(), "replace").toEqual([]);

		push(<Named name={"Fourth"} />);
		act(() => history.back());
		expect(history.location.pathname).toBe("/devices");
		expect(openDialogs(), "back").toEqual([]);
	});

	it("[ISSUE-3475-ITEM-21] keeps the dialogs open when a navigation changes only the search or the hash", () => {
		history = createMemoryHistory({ initialEntries: ["/devices"] });
		setFrameworkHistory(history);
		renderProvider();
		push(<Named name={"First"} />);
		act(() => history.push("/devices?page=2"));
		act(() => history.replace("/devices?page=2#notes"));
		act(() => history.back());
		expect(openDialogs()).toEqual(["First"]);
	});

	it("[ISSUE-3475-ITEM-21] keeps the dialogs open when a blocker stops the navigation, and closes them once it lets it through", () => {
		renderProvider();
		push(<Named name={"First"} />);
		let retry: (() => void) | undefined;
		const unblock = history.block((transition) => {
			retry = () => transition.retry();
		});
		act(() => history.push("/elsewhere"));
		expect(history.location.pathname).toBe("/");
		expect(openDialogs(), "blocked").toEqual(["First"]);

		unblock();
		act(() => retry!());
		expect(history.location.pathname).toBe("/elsewhere");
		expect(openDialogs(), "let through").toEqual([]);
	});

	it("[ISSUE-3475-ITEM-21] closes a dialog pushed before the navigation, and keeps one pushed after it", () => {
		renderProvider();
		act(() => {
			ctx[0](<Named name={"Before"} />);
			history.push("/elsewhere");
			ctx[0](<Named name={"After"} />);
		});
		expect(openDialogs()).toEqual(["After"]);
	});

	it("[ISSUE-3475-ITEM-21] a close pushDialog returned does nothing once a navigation closed its dialog", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		renderProvider();
		const closeFirst = push(<Named name={"First"} />);
		act(() => history.push("/elsewhere"));
		push(<Named name={"Second"} />);
		act(() => closeFirst());
		expect(openDialogs(), "closed another dialog").toEqual(["Second"]);
		expect(consoleError).not.toHaveBeenCalled();
	});

	it("[ISSUE-3475-ITEM-21] follows the history of the HistoryRouter around it, and stops when it unmounts", () => {
		// another history than the framework's
		const routerHistory = createMemoryHistory();
		// counts the listeners added to the router's history, and those removed again
		let added = 0;
		let removed = 0;
		const listen = routerHistory.listen.bind(routerHistory);
		vi.spyOn(routerHistory, "listen").mockImplementation((listener) => {
			added++;
			const unlisten = listen(listener);
			return () => {
				removed++;
				unlisten();
			};
		});
		const { unmount } = render(
			<HistoryRouter history={routerHistory}>
				<DialogContextProvider>
					<Grab />
				</DialogContextProvider>
			</HistoryRouter>,
		);
		push(<Named name={"First"} />);
		act(() => history.push("/framework"));
		expect(openDialogs(), "the framework's history").toEqual(["First"]);
		act(() => routerHistory.push("/router"));
		expect(openDialogs(), "the router's history").toEqual([]);

		// the router's listener and the provider's
		expect(added).toBeGreaterThanOrEqual(2);
		unmount();
		expect(removed).toBe(added);
	});

	it("[ISSUE-3475-ITEM-21] a Link in a pushed dialog shows its page and closes the dialog", () => {
		history = createMemoryHistory({ initialEntries: ["/devices/4711"] });
		const Device = () => {
			const [pushDialog] = useDialogContext();
			return (
				<button
					type={"button"}
					onClick={() =>
						pushDialog(
							<div role={"dialog"} aria-label={"Manufacturer"}>
								<Link to={"/manufacturers/7"}>{"Open the manufacturer"}</Link>
							</div>,
						)
					}
				>
					{"Show manufacturer"}
				</button>
			);
		};
		render(
			<HistoryRouter history={history}>
				<DialogContextProvider>
					<Routes>
						<Route path={"/devices/:id"} element={<Device />} />
						<Route
							path={"/manufacturers/:id"}
							element={<h1>{"Manufacturer 7"}</h1>}
						/>
					</Routes>
				</DialogContextProvider>
			</HistoryRouter>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Show manufacturer" }));
		fireEvent.click(
			screen.getByRole("link", { name: "Open the manufacturer" }),
		);
		expect({
			path: history.location.pathname,
			page: screen.queryByRole("heading", { name: "Manufacturer 7" }) != null,
			open: openDialogs(),
		}).toEqual({ path: "/manufacturers/7", page: true, open: [] });
	});
});

describe("PushedDialogCloseContext", () => {
	it("makes useCloseThisDialog close a dialog that was not pushed when provided around it", () => {
		const close = vi.fn();
		const NotPushed = () => {
			const value = useMemo(
				(): PushedDialogClose => ({ close, pushed: true }),
				[],
			);
			return (
				<PushedDialogCloseContext.Provider value={value}>
					<Closable name={"Not pushed"} />
				</PushedDialogCloseContext.Provider>
			);
		};
		render(<NotPushed />);
		fireEvent.click(screen.getByRole("button", { name: "Close Not pushed" }));
		expect(close).toHaveBeenCalledTimes(1);
	});

	it("is exported from the package root, with its PushedDialogClose type", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		expect(root.PushedDialogCloseContext).toBe(PushedDialogCloseContext);
		expect(root.useCloseThisDialog).toBe(useCloseThisDialog);
	}, 90000);
});
