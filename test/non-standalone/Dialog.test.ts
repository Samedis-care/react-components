/* eslint-disable import/first */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type React from "react";
import type { DialogContextType } from "../../src/framework/DialogContextProvider";
import type {
	IDialogConfigConfirm,
	IDialogConfigInput,
	IDialogConfigSimple,
} from "../../src/non-standalone/Dialog/Types";

// Mock i18n so the helper functions can call t()
vi.mock("../../src/i18n", () => ({
	default: {
		t: (key: string) => key,
	},
}));

// Mock isValidationError from backend-components
vi.mock("../../src/backend-components", () => ({
	isValidationError: (e: Error) => e.name === "CcValidationError",
}));

import {
	showConfirmDialog,
	showConfirmDialogBool,
	showInputDialog,
	showInfoDialog,
	showErrorDialog,
} from "../../src/non-standalone/Dialog/Utils";

describe("Dialog Utils", () => {
	let pushDialog: Mock<DialogContextType[0]>;
	/** The dialog element the helper pushed, with the props of that dialog */
	const pushed = <P>() => pushDialog.mock.calls[0][0] as React.ReactElement<P>;

	beforeEach(() => {
		pushDialog = vi.fn<DialogContextType[0]>();
	});

	describe("showConfirmDialog", () => {
		it("calls pushDialog with a ConfirmDialog element", () => {
			const props = {
				title: "Confirm",
				message: "Are you sure?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			// Don't await - the promise won't resolve until the user clicks
			void showConfirmDialog(pushDialog, props);
			expect(pushDialog).toHaveBeenCalledTimes(1);
			const element = pushed<IDialogConfigConfirm>();
			expect(element).toBeTruthy();
			expect(element.props.title).toBe("Confirm");
			expect(element.props.message).toBe("Are you sure?");
			expect(element.props.textButtonYes).toBe("Yes");
			expect(element.props.textButtonNo).toBe("No");
		});

		it("resolves when handlerButtonYes is called", async () => {
			const props = {
				title: "Confirm",
				message: "Sure?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			const promise = showConfirmDialog(pushDialog, props);
			const element = pushed<IDialogConfigConfirm>();
			// Simulate user clicking yes
			element.props.handlerButtonYes();
			await expect(promise).resolves.toBeUndefined();
		});

		it("rejects when handlerButtonNo is called", async () => {
			const props = {
				title: "Confirm",
				message: "Sure?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			const promise = showConfirmDialog(pushDialog, props);
			const element = pushed<IDialogConfigConfirm>();
			element.props.handlerButtonNo();
			await expect(promise).rejects.toBeUndefined();
		});

		it("rejects when onClose is called", async () => {
			const props = {
				title: "Confirm",
				message: "Sure?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			const promise = showConfirmDialog(pushDialog, props);
			const element = pushed<IDialogConfigConfirm>();
			element.props.onClose!();
			await expect(promise).rejects.toBeUndefined();
		});
	});

	describe("showConfirmDialogBool", () => {
		it("calls pushDialog with a ConfirmDialog element", () => {
			const props = {
				title: "Confirm",
				message: "Proceed?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			void showConfirmDialogBool(pushDialog, props);
			expect(pushDialog).toHaveBeenCalledTimes(1);
		});

		it("resolves to true when handlerButtonYes is called", async () => {
			const props = {
				title: "Confirm",
				message: "Proceed?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			const promise = showConfirmDialogBool(pushDialog, props);
			const element = pushed<IDialogConfigConfirm>();
			element.props.handlerButtonYes();
			await expect(promise).resolves.toBe(true);
		});

		it("resolves to false when handlerButtonNo is called", async () => {
			const props = {
				title: "Confirm",
				message: "Proceed?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			const promise = showConfirmDialogBool(pushDialog, props);
			const element = pushed<IDialogConfigConfirm>();
			element.props.handlerButtonNo();
			await expect(promise).resolves.toBe(false);
		});

		it("resolves to false when onClose is called", async () => {
			const props = {
				title: "Confirm",
				message: "Proceed?",
				textButtonYes: "Yes",
				textButtonNo: "No",
			};
			const promise = showConfirmDialogBool(pushDialog, props);
			const element = pushed<IDialogConfigConfirm>();
			element.props.onClose!();
			await expect(promise).resolves.toBe(false);
		});
	});

	describe("showInputDialog", () => {
		it("calls pushDialog with an InputDialog element", () => {
			const props = {
				title: "Input",
				message: "Enter value:",
				textButtonYes: "Submit",
				textButtonNo: "Cancel",
				textFieldLabel: "Value",
				textFieldValidator: (v: string) => v.length > 0,
			};
			void showInputDialog(pushDialog, props);
			expect(pushDialog).toHaveBeenCalledTimes(1);
			const element = pushed<IDialogConfigInput>();
			expect(element.props.title).toBe("Input");
			expect(element.props.textFieldLabel).toBe("Value");
		});

		it("resolves with the input value when yes is clicked", async () => {
			const props = {
				title: "Input",
				message: "Enter value:",
				textButtonYes: "Submit",
				textButtonNo: "Cancel",
				textFieldLabel: "Value",
				textFieldValidator: (v: string) => v.length > 0,
			};
			const promise = showInputDialog(pushDialog, props);
			const element = pushed<IDialogConfigInput>();
			element.props.handlerButtonYes("test-value");
			await expect(promise).resolves.toBe("test-value");
		});

		it("rejects when no is clicked", async () => {
			const props = {
				title: "Input",
				message: "Enter value:",
				textButtonYes: "Submit",
				textButtonNo: "Cancel",
				textFieldLabel: "Value",
				textFieldValidator: (v: string) => v.length > 0,
			};
			const promise = showInputDialog(pushDialog, props);
			const element = pushed<IDialogConfigInput>();
			element.props.handlerButtonNo();
			await expect(promise).rejects.toBeUndefined();
		});
	});

	describe("showInfoDialog", () => {
		it("calls pushDialog with an InfoDialog element", () => {
			void showInfoDialog(pushDialog, {
				title: "Info",
				message: "Something happened",
			});
			expect(pushDialog).toHaveBeenCalledTimes(1);
			const element = pushed<IDialogConfigSimple>();
			expect(element.props.title).toBe("Info");
			expect(element.props.message).toBe("Something happened");
		});

		it("uses default OK button when no buttons provided", () => {
			void showInfoDialog(pushDialog, {
				title: "Info",
				message: "Hello",
			});
			const element = pushed<IDialogConfigSimple>();
			expect(element.props.buttons).toHaveLength(1);
			expect(element.props.buttons[0].autoFocus).toBe(true);
		});

		it("uses custom buttons when provided", () => {
			const customButtons = [
				{ text: "Got it", autoFocus: true },
				{ text: "Learn more" },
			];
			void showInfoDialog(pushDialog, {
				title: "Info",
				message: "Hello",
				buttons: customButtons,
			});
			const element = pushed<IDialogConfigSimple>();
			expect(element.props.buttons).toEqual(customButtons);
		});

		it("resolves when onClose is called", async () => {
			const promise = showInfoDialog(pushDialog, {
				title: "Info",
				message: "Hello",
			});
			const element = pushed<IDialogConfigSimple>();
			element.props.onClose!();
			await expect(promise).resolves.toBeUndefined();
		});
	});

	describe("showErrorDialog", () => {
		it("handles Error object", () => {
			const error = new Error("Network failure");
			void showErrorDialog(pushDialog, error);
			expect(pushDialog).toHaveBeenCalledTimes(1);
			const element = pushed<IDialogConfigSimple>();
			expect(element.props.title).toBe("common.dialogs.error-title");
			expect(element.props.message).toBe("Network failure");
		});

		it("handles string error", () => {
			void showErrorDialog(pushDialog, "Something broke");
			expect(pushDialog).toHaveBeenCalledTimes(1);
			const element = pushed<IDialogConfigSimple>();
			expect(element.props.title).toBe("common.dialogs.error-title");
			expect(element.props.message).toBe("Something broke");
		});

		it("handles ValidationResult (plain object)", () => {
			const validationResult = {
				name: "Name is required",
				email: "Email is invalid",
			};
			void showErrorDialog(pushDialog, validationResult);
			expect(pushDialog).toHaveBeenCalledTimes(1);
			const element = pushed<IDialogConfigSimple>();
			expect(element.props.title).toBe("common.dialogs.validation-error-title");
		});

		it("handles ValidationError (Error with CcValidationError name)", () => {
			const error = new Error("Validation failed");
			error.name = "CcValidationError";
			(error as Error & { result: Record<string, string> }).result = {
				field1: "Field 1 error",
			};
			void showErrorDialog(pushDialog, error);
			expect(pushDialog).toHaveBeenCalledTimes(1);
			const element = pushed<IDialogConfigSimple>();
			expect(element.props.title).toBe("common.dialogs.validation-error-title");
		});

		it("resolves when onClose is called", async () => {
			const promise = showErrorDialog(pushDialog, "oops");
			const element = pushed<IDialogConfigSimple>();
			element.props.onClose!();
			await expect(promise).resolves.toBeUndefined();
		});
	});
});
