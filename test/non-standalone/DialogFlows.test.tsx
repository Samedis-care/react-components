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
import { render, screen, cleanup, act } from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import { setFrameworkHistory } from "../../src/framework/History";
import DialogContextProvider, {
	DialogContextType,
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import ccI18n from "../../src/i18n";
// Dialog/Utils must come before the component modules: importing the Dialog
// index first runs into an import cycle
import { showErrorDialog } from "../../src/non-standalone/Dialog/Utils";
import { ConfirmDialog } from "../../src/non-standalone/Dialog/ConfirmDialog";
import { InputDialog } from "../../src/non-standalone/Dialog/InputDialog";
import { FormDialog } from "../../src/non-standalone/Dialog/FormDialog";
import type { IDialogConfigInput } from "../../src/non-standalone/Dialog/Types";

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
const push = (dialog: React.ReactNode) => act(() => ctx[0](dialog));
/** all mounted dialogs, including the ones a dialog on top hides */
const dialogEls = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));

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
