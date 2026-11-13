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
import { setFrameworkHistory } from "../../src/framework/History";
import DialogContextProvider, {
	DialogContextType,
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import ccI18n from "../../src/i18n";
// Dialog/Utils must come before the component modules: importing the Dialog
// index first runs into an import cycle
import {
	showConfirmDialog,
	showConfirmDialogBool,
	showErrorDialog,
	showInfoDialog,
} from "../../src/non-standalone/Dialog/Utils";
import { ConfirmDialog } from "../../src/non-standalone/Dialog/ConfirmDialog";
import { ErrorDialog } from "../../src/non-standalone/Dialog/ErrorDialog";
import { InfoDialog } from "../../src/non-standalone/Dialog/InfoDialog";
import { InputDialog } from "../../src/non-standalone/Dialog/InputDialog";
import { FormDialog } from "../../src/non-standalone/Dialog/FormDialog";
import type { IDialogConfigInput } from "../../src/non-standalone/Dialog/Types";
import FullFormDialog from "../../src/backend-components/Form/FormDialog";

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
const btn = (name: string) => screen.getByRole("button", { name });
/** all mounted dialogs, including the ones a dialog on top hides */
const dialogEls = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
const dialogCount = () => dialogEls().length;
/** the title texts of the mounted dialogs, bottom to top */
const openTitles = () =>
	dialogEls().map(
		(d) =>
			document.getElementById(d.getAttribute("aria-labelledby") ?? "")
				?.textContent,
	);

const confirmProps = {
	title: "Delete records?",
	message: "Really delete 3 entries?",
	textButtonYes: "Yes",
	textButtonNo: "No",
};

const inputProps = (
	overrides: Partial<IDialogConfigInput> = {},
): IDialogConfigInput => ({
	title: "Rename",
	message: "Enter a new name",
	textButtonYes: "Save",
	textButtonNo: "Cancel",
	textFieldLabel: "Name",
	textFieldPlaceholder: "e.g. Pump",
	textFieldValidator: () => true,
	handlerButtonYes: vi.fn(),
	handlerButtonNo: vi.fn(),
	...overrides,
});

describe("showConfirmDialogBool and showConfirmDialog through the dialog", () => {
	it("[ISSUE-3497-ITEM-4] showConfirmDialog resolves with undefined on Yes and rejects with undefined on No", async () => {
		mount();
		let yesValue: unknown = "pending";
		act(() => {
			void showConfirmDialog(ctx[0], confirmProps).then((v: unknown) => {
				yesValue = v;
			});
		});
		fireEvent.click(btn("Yes"));
		await flush();

		let noReason: unknown = "pending";
		act(() => {
			showConfirmDialog(ctx[0], confirmProps).catch((e: unknown) => {
				noReason = e;
			});
		});
		fireEvent.click(btn("No"));
		await flush();
		expect({ yes: typeof yesValue, no: typeof noReason }).toEqual({
			yes: "undefined",
			no: "undefined",
		});
	});

	it("[ISSUE-3497-ITEM-2] code after await showConfirmDialogBool / showConfirmDialog navigates", async () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		mount();
		act(() => {
			void (async () => {
				if (await showConfirmDialogBool(ctx[0], confirmProps))
					history.push("/bool");
			})();
		});
		fireEvent.click(btn("Yes"));
		await flush();
		expect(history.location.pathname).toBe("/bool");

		act(() => {
			void showConfirmDialog(ctx[0], confirmProps).then(() =>
				history.push("/plain"),
			);
		});
		fireEvent.click(btn("Yes"));
		await flush();
		expect(history.location.pathname).toBe("/plain");
		expect(alert).not.toHaveBeenCalled();
	});

	it("[ISSUE-3497-ITEM-2] code awaiting a promise that a pushed ConfirmDialog's handler resolves navigates", async () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		mount();
		act(() => {
			void (async () => {
				const leave = await new Promise<boolean>((resolve) => {
					ctx[0](
						<ConfirmDialog
							{...confirmProps}
							handlerButtonYes={() => resolve(true)}
							handlerButtonNo={() => resolve(false)}
						/>,
					);
				});
				if (leave) history.push("/target");
			})();
		});
		fireEvent.click(btn("Yes"));
		await flush();
		expect({
			path: history.location.pathname,
			alerts: alert.mock.calls.length,
			open: dialogCount(),
		}).toEqual({ path: "/target", alerts: 0, open: 0 });
	});
});

describe("ErrorDialog / InfoDialog buttons", () => {
	it("[ISSUE-3497-ITEM-1] a dialog pushed from an InfoDialog button handler stays open; the InfoDialog closes", async () => {
		mount();
		push(
			<InfoDialog
				title="First"
				message="f"
				buttons={[
					{
						text: "Next",
						onClick: () => {
							void showInfoDialog(ctx[0], { title: "Second", message: "s" });
						},
					},
				]}
			/>,
		);
		fireEvent.click(btn("Next"));
		await flush();
		expect(openTitles()).toEqual(["Second"]);
	});

	it("[ISSUE-3497-ITEM-1] a dialog pushed while an async button handler runs stays open when the handler ends", async () => {
		mount();
		let release!: () => void;
		push(
			<InfoDialog
				title="First"
				message="f"
				buttons={[
					{
						text: "Save",
						onClick: () =>
							new Promise<void>((resolve) => {
								release = resolve;
							}),
					},
				]}
			/>,
		);
		fireEvent.click(btn("Save"));
		await flush();
		act(() => {
			void showErrorDialog(ctx[0], "Background error");
		});
		act(() => release());
		await flush();
		expect(openTitles()).toEqual(["An error occurred"]);
	});

	it.each([
		[
			"an InfoDialog button",
			() => (
				<InfoDialog
					title="Done"
					message="m"
					buttons={[{ text: "Go", onClick: () => history.push("/target") }]}
				/>
			),
		],
		[
			"ConfirmDialog's handlerButtonYes",
			() => (
				<ConfirmDialog
					{...confirmProps}
					textButtonYes="Go"
					handlerButtonYes={() => history.push("/target")}
					handlerButtonNo={() => {}}
				/>
			),
		],
	])(
		"[ISSUE-3497-ITEM-2] navigate() in %s navigates and closes the dialog",
		async (_label, make) => {
			const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
			mount();
			push(make());
			fireEvent.click(btn("Go"));
			await flush();
			expect({
				path: history.location.pathname,
				alerts: alert.mock.calls.length,
				open: dialogCount(),
			}).toEqual({ path: "/target", alerts: 0, open: 0 });
		},
	);
});

describe("InputDialog and showInputDialog", () => {
	it("[ISSUE-3497-ITEM-8] an InputDialog pushed from another InputDialog's Save handler starts with an empty field", () => {
		mount();
		push(
			<InputDialog
				{...inputProps({
					title: "First",
					handlerButtonYes: () =>
						ctx[0](<InputDialog {...inputProps({ title: "Second" })} />),
				})}
			/>,
		);
		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "carry" },
		});
		fireEvent.click(btn("Save"));
		expect(screen.getByRole("dialog")).toHaveAccessibleName("Second");
		expect(screen.getByRole("textbox")).toHaveValue("");
	});
});

describe("rendered without pushDialog", () => {
	/** renders a dialog from state, as `{open && <Dialog onClose={…} />}` */
	const InlineHost = (props: {
		make: (onClose: () => void) => React.ReactNode;
	}) => {
		const [open, setOpen] = useState(true);
		return open ? <>{props.make(() => setOpen(false))}</> : null;
	};
	const mountInline = (make: (onClose: () => void) => React.ReactNode) =>
		render(
			<DialogContextProvider>
				<Grab />
				<InlineHost make={make} />
			</DialogContextProvider>,
		);

	it.each([
		[
			"InfoDialog's button",
			(onClose: () => void) => (
				<InfoDialog
					title="Inline"
					message="m"
					onClose={onClose}
					buttons={[{ text: "Go" }]}
				/>
			),
			() => fireEvent.click(btn("Go")),
		],
		[
			"ConfirmDialog's Yes",
			(onClose: () => void) => (
				<ConfirmDialog
					{...confirmProps}
					title="Inline"
					textButtonYes="Go"
					onClose={onClose}
					handlerButtonYes={() => {}}
					handlerButtonNo={() => {}}
				/>
			),
			() => fireEvent.click(btn("Go")),
		],
		[
			"InputDialog's Escape",
			(onClose: () => void) => (
				<InputDialog {...inputProps({ title: "Inline", onClose })} />
			),
			() => fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" }),
		],
		[
			"FormDialog's button",
			(onClose: () => void) => (
				<FormDialog
					title="Inline"
					message="m"
					inputs={null}
					onClose={onClose}
					buttons={[{ text: "Go" }]}
				/>
			),
			() => fireEvent.click(btn("Go")),
		],
	])(
		"[ISSUE-3497-ITEM-1] %s closes the dialog through onClose and leaves a pushed dialog open",
		async (_label, make, close) => {
			const error = vi.spyOn(console, "error");
			mountInline(make);
			// not a modal, so the inline dialog's controls stay reachable by role
			push(<div>pushed dialog</div>);
			expect(openTitles()).toEqual(["Inline"]);
			close();
			await flush();
			expect(openTitles()).toEqual([]);
			expect(screen.queryByText("pushed dialog")).not.toBeNull();
			expect(error).not.toHaveBeenCalled();
		},
	);

	it("[ISSUE-3497-ITEM-1] without onClose a button closes nothing and throws nothing", async () => {
		const error = vi.spyOn(console, "error");
		mountInline(() => (
			<ErrorDialog title="Inline" message="m" buttons={[{ text: "OK" }]} />
		));
		fireEvent.click(btn("OK"));
		await flush();
		expect(openTitles()).toEqual(["Inline"]);
		expect(error).not.toHaveBeenCalled();
	});

	it("[ISSUE-3497-ITEM-1] in the content of a pushed FullFormDialog, an InfoDialog closes through its onClose, not the FullFormDialog", async () => {
		const ContentWithInfo = () => {
			const [open, setOpen] = useState(true);
			return open ? (
				<InfoDialog
					title="Inline"
					message="m"
					onClose={() => setOpen(false)}
					buttons={[{ text: "Go" }]}
				/>
			) : null;
		};
		mount();
		push(
			<FullFormDialog dialogTitle="Edit">
				<ContentWithInfo />
			</FullFormDialog>,
		);
		expect(openTitles()).toEqual(["Edit", "Inline"]);
		fireEvent.click(btn("Go"));
		await flush();
		expect(openTitles()).toEqual(["Edit"]);
	});
});

describe("FormDialog", () => {
	it("[ISSUE-3497-ITEM-9] renders a button's color", () => {
		mount();
		push(
			<FormDialog
				title="T"
				message="M"
				inputs={null}
				buttons={[{ text: "Submit" }, { text: "Cancel", color: "secondary" }]}
			/>,
		);
		expect(btn("Cancel")).toHaveClass("MuiButton-colorSecondary");
	});
});

describe("message content and description", () => {
	it.each([
		[
			"ConfirmDialog",
			() => (
				<ConfirmDialog
					{...confirmProps}
					handlerButtonYes={() => {}}
					handlerButtonNo={() => {}}
				/>
			),
		],
		[
			"InputDialog",
			() => (
				<InputDialog {...inputProps({ message: "Really delete 3 entries?" })} />
			),
		],
		[
			"FormDialog",
			() => (
				<FormDialog
					title="T"
					message="Really delete 3 entries?"
					inputs={null}
					buttons={[{ text: "OK" }]}
				/>
			),
		],
	])(
		"[ISSUE-3497-ITEM-15] %s: the message is the dialog's accessible description",
		(_label, make) => {
			mount();
			push(make());
			expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
				"Really delete 3 entries?",
			);
		},
	);

	it("[ISSUE-3497-ITEM-15] showErrorDialog: the error message is the dialog's accessible description", () => {
		mount();
		act(() => {
			void showErrorDialog(ctx[0], new Error("Request failed (500)"));
		});
		expect(screen.getByRole("dialog")).toHaveAccessibleName(
			"An error occurred",
		);
		expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
			"Request failed (500)",
		);
	});

	it("[ISSUE-3497-ITEM-15] two open dialogs are each described by their own message", () => {
		mount();
		push(
			<ConfirmDialog
				{...confirmProps}
				handlerButtonYes={() => {}}
				handlerButtonNo={() => {}}
			/>,
		);
		push(
			<InputDialog
				{...inputProps({ message: "Enter the name of the copy" })}
			/>,
		);
		push(
			<FormDialog
				title="T"
				message="Fill in the user"
				inputs={null}
				buttons={[{ text: "OK" }]}
			/>,
		);
		const descriptions = dialogEls().map((dialog) =>
			document.getElementById(dialog.getAttribute("aria-describedby") ?? ""),
		);
		expect(descriptions.map((element) => element?.textContent)).toEqual([
			"Really delete 3 entries?",
			"Enter the name of the copy",
			"Fill in the user",
		]);
		expect(new Set(descriptions).size).toBe(3);
	});
});
