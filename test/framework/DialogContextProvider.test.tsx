import "@testing-library/jest-dom/vitest";
import React, { useContext, useMemo } from "react";
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
import { createMemoryHistory, MemoryHistory } from "history";
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
import ccI18n from "../../src/i18n";

let history: MemoryHistory;
beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
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

	it("releases the navigation block when the last dialog closes through it", () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		renderProvider();
		const closeFirst = push(<Named name={"First"} />);
		const closeSecond = push(<Named name={"Second"} />);

		act(() => closeFirst());
		act(() => history.push("/blocked"));
		expect(alert).toHaveBeenCalledTimes(1);
		expect(history.location.pathname, "navigated with a dialog open").toBe("/");

		act(() => closeSecond());
		act(() => history.push("/free"));
		expect(alert).toHaveBeenCalledTimes(1);
		expect(history.location.pathname).toBe("/free");
	});

	it("releases the navigation block when the dialog is closed before the next render", () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		renderProvider();
		act(() => {
			const close = ctx[0](<Named name={"First"} />);
			close();
		});
		act(() => history.push("/free"));
		expect(alert).not.toHaveBeenCalled();
		expect(history.location.pathname).toBe("/free");
	});
});

describe("navigation block while dialogs close", () => {
	/** what allowNavigation the dialogs got, by name */
	const allowers: Record<string, (() => () => void) | undefined> = {};
	/** A dialog named `name` that hands out its allowNavigation */
	const Allowing = (props: { name: string }) => {
		allowers[props.name] = useContext(
			PushedDialogCloseContext,
		)?.allowNavigation;
		return <Named name={props.name} />;
	};
	const allow = (name: string) => {
		const allowNavigation = allowers[name];
		if (!allowNavigation) throw new Error("no allowNavigation in " + name);
		let blockAgain!: () => void;
		act(() => {
			blockAgain = allowNavigation();
		});
		return blockAgain;
	};
	/** pushes the path and returns where the history is then */
	const navigate = (to: string) => {
		act(() => history.push(to));
		return history.location.pathname;
	};

	it("[ISSUE-3497-ITEM-2] lets navigation through while every open dialog allows it, until each allowance is taken back", () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		renderProvider();
		push(<Allowing name={"First"} />);
		push(<Allowing name={"Second"} />);

		const blockSecondAgain = allow("Second");
		expect(navigate("/a"), "First still blocks").toBe("/");
		expect(alert).toHaveBeenCalledTimes(1);

		const blockFirstAgain = allow("First");
		const blockFirstAgainToo = allow("First");
		expect(navigate("/b")).toBe("/b");
		act(() => blockFirstAgain());
		act(() => blockFirstAgain());
		expect(navigate("/c"), "one allowance of First is left").toBe("/c");
		act(() => blockFirstAgainToo());
		expect(navigate("/d")).toBe("/c");
		expect(alert).toHaveBeenCalledTimes(2);

		act(() => blockSecondAgain());
		allow("First");
		expect(navigate("/e"), "Second blocks again").toBe("/c");
		expect(alert).toHaveBeenCalledTimes(3);
	});

	it("[ISSUE-3497-ITEM-2] an allowance taken back after its dialog closed blocks nothing", () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		renderProvider();
		const closeOnly = push(<Allowing name={"Only"} />);
		const blockAgain = allow("Only");
		act(() => closeOnly());
		act(() => blockAgain());
		expect(navigate("/free")).toBe("/free");
		expect(alert).not.toHaveBeenCalled();
	});

	it("[ISSUE-3497-ITEM-2] the navigation block alerts in the language switched to while the dialog is open", async () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		const initialLanguage = ccI18n.language;
		await ccI18n.loadLanguages(["de"]);
		try {
			renderProvider();
			push(<Allowing name={"Only"} />);
			await act(() => ccI18n.changeLanguage("de-DE"));
			expect(navigate("/blocked")).toBe("/");
			expect(alert).toHaveBeenCalledWith(
				"Die Navigation ist gesperrt. Bitte schließe zuerst die geöffneten Dialoge.",
			);
		} finally {
			await act(() => ccI18n.changeLanguage(initialLanguage));
		}
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
