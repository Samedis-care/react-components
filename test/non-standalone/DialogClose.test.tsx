import React, { useState } from "react";
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
} from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import {
	FrameworkHistory,
	setFrameworkHistory,
} from "../../src/framework/History";
import DialogContextProvider, {
	DialogContextType,
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import ccI18n from "../../src/i18n";
// Dialog/Utils must come before the component modules: importing the Dialog
// index first runs into an import cycle
import {
	DialogPromise,
	showConfirmDialog,
	showConfirmDialogBool,
	showErrorDialog,
	showInfoDialog,
	showInputDialog,
} from "../../src/non-standalone/Dialog/Utils";
import { ErrorDialog } from "../../src/non-standalone/Dialog/ErrorDialog";
import { InfoDialog } from "../../src/non-standalone/Dialog/InfoDialog";
import { FormDialog } from "../../src/non-standalone/Dialog/FormDialog";
import type { IDialogButtonConfig } from "../../src/non-standalone/Dialog/Types";

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
const mount = () =>
	render(
		<DialogContextProvider>
			<Grab />
		</DialogContextProvider>,
	);
/** lets pending handler continuations and their state updates settle */
const flush = async () => {
	for (let i = 0; i < 10; i++) await act(() => Promise.resolve());
};
const push = (dialog: React.ReactNode) =>
	act(() => {
		ctx[0](dialog);
	});
/** calls a show…Dialog helper in act and returns what it returned */
const show = <T,>(
	helper: (pushDialog: DialogContextType[0]) => DialogPromise<T>,
): DialogPromise<T> => {
	let promise: DialogPromise<T> | undefined;
	act(() => {
		promise = helper(ctx[0]);
	});
	return promise!;
};
const btn = (name: string) => screen.getByRole("button", { name });
/** the title texts of the mounted dialogs, bottom to top */
const openTitles = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).map(
		(d) =>
			document.getElementById(d.getAttribute("aria-labelledby") ?? "")
				?.textContent,
	);
type Outcome = ["resolved" | "rejected", unknown];
/** records how `promise` settles; also keeps a rejection from going unhandled */
const outcome = (promise: Promise<unknown>) => {
	const seen: Outcome[] = [];
	promise.then(
		(value) => seen.push(["resolved", value]),
		(reason: unknown) => seen.push(["rejected", reason]),
	);
	return seen;
};
/** a promise the test settles; what an async button handler awaits */
const gate = () => {
	let release!: () => void;
	const promise = new Promise<void>((resolve) => {
		release = resolve;
	});
	return { promise, release: () => act(() => release()) };
};
/** a dialog pushed first, below the one under test */
const pushBelow = () =>
	push(<InfoDialog title="Below" message="b" buttons={[{ text: "Stay" }]} />);

const confirmProps = {
	title: "Confirm",
	message: "Sure?",
	textButtonYes: "Yes",
	textButtonNo: "No",
};

interface HelperCase {
	/** shows the dialog */
	show: (pushDialog: DialogContextType[0]) => DialogPromise<unknown>;
	/** its title */
	title: string;
	/** how close() and Escape settle the promise */
	dismissed: Outcome;
	/** answers the dialog the way that differs most from dismissing it */
	answer: () => void;
	/** how answer() settles the promise */
	answered: Outcome;
}

const helperCases: [string, HelperCase][] = [
	[
		"showInfoDialog",
		{
			show: (pushDialog) =>
				showInfoDialog(pushDialog, { title: "Info", message: "i" }),
			title: "Info",
			dismissed: ["resolved", undefined],
			answer: () => fireEvent.click(btn("OK")),
			answered: ["resolved", undefined],
		},
	],
	[
		"showErrorDialog",
		{
			show: (pushDialog) => showErrorDialog(pushDialog, "Request failed"),
			title: "An error occurred",
			dismissed: ["resolved", undefined],
			answer: () => fireEvent.click(btn("OK")),
			answered: ["resolved", undefined],
		},
	],
	[
		"showConfirmDialogBool",
		{
			show: (pushDialog) => showConfirmDialogBool(pushDialog, confirmProps),
			title: "Confirm",
			dismissed: ["resolved", false],
			answer: () => fireEvent.click(btn("Yes")),
			answered: ["resolved", true],
		},
	],
	[
		"showConfirmDialog",
		{
			show: (pushDialog) => showConfirmDialog(pushDialog, confirmProps),
			title: "Confirm",
			dismissed: ["rejected", undefined],
			answer: () => fireEvent.click(btn("Yes")),
			answered: ["resolved", undefined],
		},
	],
	[
		"showInputDialog",
		{
			show: (pushDialog) =>
				showInputDialog(pushDialog, {
					title: "Rename",
					message: "Enter a new name",
					textButtonYes: "Save",
					textButtonNo: "Cancel",
					textFieldLabel: "Name",
					textFieldValidator: () => true,
				}),
			title: "Rename",
			dismissed: ["rejected", undefined],
			answer: () => {
				fireEvent.change(screen.getByRole("textbox"), {
					target: { value: "Pump" },
				});
				fireEvent.click(btn("Save"));
			},
			answered: ["resolved", "Pump"],
		},
	],
];

describe("the show…Dialog helpers' close", () => {
	it.each(helperCases)(
		"%s: close() closes exactly that dialog, a dialog pushed after it stays open, and the promise settles at once",
		async (_name, c) => {
			mount();
			const dlg = show(c.show);
			expect(dlg).toBeInstanceOf(Promise);
			const seen = outcome(dlg);
			push(<InfoDialog title="Later" message="l" buttons={[]} />);
			expect(openTitles()).toEqual([c.title, "Later"]);
			act(() => dlg.close());
			expect(openTitles()).toEqual(["Later"]);
			await flush();
			expect(seen).toEqual([c.dismissed]);
		},
	);

	it.each(helperCases)(
		"%s: a second close() does nothing",
		async (_name, c) => {
			const error = vi.spyOn(console, "error");
			mount();
			pushBelow();
			const dlg = show(c.show);
			const seen = outcome(dlg);
			act(() => dlg.close());
			act(() => dlg.close());
			await flush();
			expect(openTitles()).toEqual(["Below"]);
			expect(seen).toEqual([c.dismissed]);
			expect(error).not.toHaveBeenCalled();
		},
	);

	it.each(helperCases)(
		"%s: close() after the user answered the dialog does nothing",
		async (_name, c) => {
			const error = vi.spyOn(console, "error");
			mount();
			pushBelow();
			const dlg = show(c.show);
			const seen = outcome(dlg);
			c.answer();
			await flush();
			expect(openTitles()).toEqual(["Below"]);
			act(() => dlg.close());
			await flush();
			expect(openTitles()).toEqual(["Below"]);
			expect(seen).toEqual([c.answered]);
			expect(error).not.toHaveBeenCalled();
		},
	);

	it.each(helperCases)(
		"%s: without close(), Escape closes the dialog and settles the promise as close() does",
		async (_name, c) => {
			mount();
			const dlg = show(c.show);
			const seen = outcome(dlg);
			fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
			await flush();
			expect(openTitles()).toEqual([]);
			expect(seen).toEqual([c.dismissed]);
		},
	);

	describe.each([false, true])(
		"dlg.close() in a handler of the dialog's own button (dontClose: %s)",
		(dontClose) => {
			it("releases the navigation block at once: a navigation right after it goes through", async () => {
				const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
				mount();
				let path: string | undefined;
				const dlg: DialogPromise<void> = show((pushDialog) =>
					showInfoDialog(pushDialog, {
						title: "Saved",
						message: "m",
						buttons: [
							{
								text: "Open",
								dontClose,
								onClick: () => {
									dlg.close();
									FrameworkHistory.push("/target");
									path = history.location.pathname;
								},
							},
						],
					}),
				);
				const seen = outcome(dlg);
				fireEvent.click(btn("Open"));
				expect(path).toBe("/target");
				expect(alert).not.toHaveBeenCalled();
				await flush();
				expect(openTitles()).toEqual([]);
				expect(seen).toEqual([["resolved", undefined]]);
			});

			it("the dialog's own close after the handler does nothing: a dialog below stays open", async () => {
				const error = vi.spyOn(console, "error");
				mount();
				pushBelow();
				const dlg: DialogPromise<void> = show((pushDialog) =>
					showInfoDialog(pushDialog, {
						title: "Saved",
						message: "m",
						buttons: [
							{
								text: "Open",
								dontClose,
								onClick: () => {
									dlg.close();
								},
							},
						],
					}),
				);
				const seen = outcome(dlg);
				fireEvent.click(btn("Open"));
				await flush();
				expect(openTitles()).toEqual(["Below"]);
				expect(seen).toEqual([["resolved", undefined]]);
				expect(error).not.toHaveBeenCalled();
			});
		},
	);
});

describe("[ISSUE-3497-ITEM-27] a button's onClick gets the dialog's close", () => {
	/** pushes an InfoDialog titled "Dialog" with one button "Go" */
	const pushWithButton = (
		button: Omit<IDialogButtonConfig, "text">,
		onClose?: () => void,
	) =>
		push(
			<InfoDialog
				title="Dialog"
				message="m"
				onClose={onClose}
				buttons={[{ text: "Go", ...button }]}
			/>,
		);

	it.each([false, true])(
		"[ISSUE-3497-ITEM-27] close() closes the dialog at once, so a navigation in the handler goes through (dontClose: %s)",
		async (dontClose) => {
			const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
			mount();
			const onClose = vi.fn();
			let path: string | undefined;
			pushWithButton(
				{
					dontClose,
					onClick: (close) => {
						close();
						FrameworkHistory.push("/target");
						path = history.location.pathname;
					},
				},
				onClose,
			);
			fireEvent.click(btn("Go"));
			expect(path).toBe("/target");
			expect(alert).not.toHaveBeenCalled();
			expect(openTitles()).toEqual([]);
			await flush();
			expect(onClose).toHaveBeenCalledTimes(1);
		},
	);

	it.each([false, true])(
		"[ISSUE-3497-ITEM-27] after close(), onClose runs once, when the async handler has ended (dontClose: %s)",
		async (dontClose) => {
			mount();
			const onClose = vi.fn();
			const work = gate();
			pushWithButton(
				{
					dontClose,
					onClick: async (close) => {
						close();
						await work.promise;
					},
				},
				onClose,
			);
			fireEvent.click(btn("Go"));
			await flush();
			expect(openTitles()).toEqual([]);
			expect(onClose).not.toHaveBeenCalled();
			work.release();
			await flush();
			expect(onClose).toHaveBeenCalledTimes(1);
		},
	);

	it("[ISSUE-3497-ITEM-27] showInfoDialog's promise settles once the async handler that called close() has ended", async () => {
		mount();
		const work = gate();
		const dlg = show((pushDialog) =>
			showInfoDialog(pushDialog, {
				title: "Print?",
				message: "m",
				buttons: [
					{
						text: "Print",
						onClick: async (close) => {
							close();
							await work.promise;
						},
					},
				],
			}),
		);
		const seen = outcome(dlg);
		fireEvent.click(btn("Print"));
		await flush();
		expect(openTitles()).toEqual([]);
		expect(seen).toEqual([]);
		work.release();
		await flush();
		expect(seen).toEqual([["resolved", undefined]]);
	});

	it("[ISSUE-3497-ITEM-27] close() closes the button's own dialog, not one the handler pushed", async () => {
		mount();
		pushWithButton({
			onClick: (close) => {
				ctx[0](<InfoDialog title="Next" message="n" buttons={[]} />);
				close();
			},
		});
		fireEvent.click(btn("Go"));
		await flush();
		expect(openTitles()).toEqual(["Next"]);
	});

	it("[ISSUE-3497-ITEM-27] a dontClose button whose handler does not call close keeps the dialog open and calls no onClose", async () => {
		mount();
		const onClose = vi.fn();
		const onClick = vi.fn();
		pushWithButton({ dontClose: true, onClick }, onClose);
		fireEvent.click(btn("Go"));
		await flush();
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(openTitles()).toEqual(["Dialog"]);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("[ISSUE-3497-ITEM-27] a handler that never calls close keeps the dialog open while it runs, then it closes and calls onClose once", async () => {
		mount();
		const onClose = vi.fn();
		const work = gate();
		pushWithButton({ onClick: () => work.promise }, onClose);
		fireEvent.click(btn("Go"));
		await flush();
		expect(openTitles()).toEqual(["Dialog"]);
		expect(btn("Go")).toBeDisabled();
		expect(onClose).not.toHaveBeenCalled();
		work.release();
		await flush();
		expect(openTitles()).toEqual([]);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3497-ITEM-27] close() kept and called after the handler has ended closes the dialog and calls onClose once", async () => {
		mount();
		const onClose = vi.fn();
		let later!: () => void;
		pushWithButton(
			{
				dontClose: true,
				onClick: (close) => {
					later = close;
				},
			},
			onClose,
		);
		fireEvent.click(btn("Go"));
		await flush();
		expect(openTitles()).toEqual(["Dialog"]);
		act(() => later());
		expect(openTitles()).toEqual([]);
		act(() => later());
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3497-ITEM-27] a handler that fails after close() still has onClose called, so a helper's promise settles", async () => {
		// the handler's failure stays an unhandled rejection, as before: collect it here
		// instead of letting it fail the run
		const nodeProcess = (
			globalThis as unknown as {
				process: {
					listeners(event: "unhandledRejection"): ((r: unknown) => void)[];
					removeAllListeners(event: "unhandledRejection"): void;
					on(event: "unhandledRejection", l: (r: unknown) => void): void;
					removeListener(
						event: "unhandledRejection",
						l: (r: unknown) => void,
					): void;
				};
			}
		).process;
		const saved = nodeProcess.listeners("unhandledRejection");
		nodeProcess.removeAllListeners("unhandledRejection");
		const rejections: unknown[] = [];
		const collect = (reason: unknown) => rejections.push(reason);
		nodeProcess.on("unhandledRejection", collect);
		try {
			mount();
			const failure = new Error("printer offline");
			const dlg = show((pushDialog) =>
				showInfoDialog(pushDialog, {
					title: "Print?",
					message: "m",
					buttons: [
						{
							text: "Print",
							onClick: async (close) => {
								close();
								await Promise.resolve();
								throw failure;
							},
						},
					],
				}),
			);
			const seen = outcome(dlg);
			fireEvent.click(btn("Print"));
			await flush();
			// unhandled rejections are reported on a later macrotask
			await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
			expect(openTitles()).toEqual([]);
			expect(seen).toEqual([["resolved", undefined]]);
			expect(rejections).toEqual([failure]);
		} finally {
			nodeProcess.removeListener("unhandledRejection", collect);
			saved.forEach((listener) =>
				nodeProcess.on("unhandledRejection", listener),
			);
		}
	});

	it("[ISSUE-3497-ITEM-27] showConfirmDialog: Yes resolves and No rejects with undefined, as Escape does", async () => {
		mount();
		const yes = show((pushDialog) =>
			showConfirmDialog(pushDialog, confirmProps),
		);
		const yesSeen = outcome(yes);
		fireEvent.click(btn("Yes"));
		await flush();
		const no = show((pushDialog) =>
			showConfirmDialog(pushDialog, confirmProps),
		);
		const noSeen = outcome(no);
		fireEvent.click(btn("No"));
		await flush();
		expect(yesSeen).toEqual([["resolved", undefined]]);
		expect(noSeen).toEqual([["rejected", undefined]]);
	});

	it("[ISSUE-3497-ITEM-27] old code: popDialog() first, the argument called last, with dontClose, closes the dialog and settles the promise after the handler", async () => {
		mount();
		pushBelow();
		const work = gate();
		const dlg = show((pushDialog) =>
			showInfoDialog(pushDialog, {
				title: "Print?",
				message: "m",
				buttons: [
					{
						text: "Print",
						onClick: async (onClose?: () => void) => {
							ctx[1]();
							await work.promise;
							if (onClose) onClose();
						},
						dontClose: true,
					},
				],
			}),
		);
		const seen = outcome(dlg);
		fireEvent.click(btn("Print"));
		await flush();
		expect(openTitles()).toEqual(["Below"]);
		expect(seen).toEqual([]);
		work.release();
		await flush();
		expect(openTitles()).toEqual(["Below"]);
		expect(seen).toEqual([["resolved", undefined]]);
	});

	it("[ISSUE-3497-ITEM-27] FormDialog: a dontClose button's close() closes the dialog at once and onClose follows the handler", async () => {
		mount();
		const onClose = vi.fn();
		const work = gate();
		push(
			<FormDialog
				title="Form"
				message="m"
				inputs={null}
				onClose={onClose}
				buttons={[
					{
						text: "Go",
						dontClose: true,
						onClick: async (close) => {
							close();
							await work.promise;
						},
					},
				]}
			/>,
		);
		fireEvent.click(btn("Go"));
		await flush();
		expect(openTitles()).toEqual([]);
		expect(onClose).not.toHaveBeenCalled();
		work.release();
		await flush();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3497-ITEM-27] rendered without pushDialog, a dontClose button's close() closes the dialog through onClose", async () => {
		const InlineHost = () => {
			const [open, setOpen] = useState(true);
			return open ? (
				<ErrorDialog
					title="Inline"
					message="m"
					onClose={() => setOpen(false)}
					buttons={[
						{ text: "Go", dontClose: true, onClick: (close) => close() },
					]}
				/>
			) : null;
		};
		render(
			<DialogContextProvider>
				<Grab />
				<InlineHost />
			</DialogContextProvider>,
		);
		push(<div>pushed dialog</div>);
		fireEvent.click(btn("Go"));
		await flush();
		expect(openTitles()).toEqual([]);
		expect(screen.queryByText("pushed dialog")).not.toBeNull();
	});
});
