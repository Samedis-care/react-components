/**
 * The Save button DefaultFormPage and FlowEngineSaveButton share (FormPageSaveButton): what
 * it says while the form is read-only, here in a DefaultFormPage. FlowEngineSaveButton's
 * cases are in FlowEngine.test.tsx.
 */
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	holdUpdates,
	LOAD,
	makeDirty,
	makePage,
	mountPage,
	saveButton,
	setupPageTests,
} from "./pageFixture";

setupPageTests();

const FieldPage = makePage();

describe("FormPageSaveButton in DefaultFormPage", () => {
	it("[ISSUE-3504-ITEM-9] the read-only Save has the reason as its description and shows it in a tooltip", async () => {
		mountPage(FieldPage, {
			formProps: {
				readOnlyReasons: { permission: "You may not edit people" },
			},
		});
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		const save = saveButton();
		expect(save).toHaveAttribute("aria-disabled", "true");
		expect(save).toHaveAccessibleDescription("You may not edit people");
		fireEvent.mouseOver(save);
		expect(await screen.findByRole("tooltip")).toHaveTextContent(
			"You may not edit people",
		);
	});

	it("[ISSUE-3504-ITEM-9] the element around the read-only Save gets no aria-label", async () => {
		mountPage(FieldPage, {
			formProps: {
				readOnlyReasons: { permission: "You may not edit people" },
			},
		});
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		const save = saveButton();
		expect(save.parentElement).not.toHaveAttribute("aria-label");
		fireEvent.mouseOver(save);
		await screen.findByRole("tooltip");
		expect(save.parentElement).not.toHaveAttribute("aria-label");
		expect(save.parentElement).not.toHaveAttribute("aria-labelledby");
	});

	it("[ISSUE-3473-ITEM-10] Save keeps the keyboard focus during and after a save, and pressing it then saves nothing", async () => {
		const user = userEvent.setup();
		const { model } = mountPage(FieldPage);
		const updates = holdUpdates(model);
		const input = await makeDirty();
		const save = saveButton();
		save.focus();
		await user.keyboard("{Enter}");
		await waitFor(() => expect(input).toBeDisabled());

		// unavailable, but not natively disabled: browsers move the focus of a button that
		// gets disabled to the page
		expect(saveButton()).toBe(save);
		expect(save).toHaveAttribute("aria-disabled", "true");
		expect(save).not.toBeDisabled();
		expect(save).toHaveFocus();
		await user.keyboard("{Enter}");
		await user.keyboard(" ");
		fireEvent.click(save);
		expect(updates.spy).toHaveBeenCalledTimes(1);

		updates.release();
		await waitFor(() => expect(input).toBeEnabled());
		// saved, so not dirty: still unavailable, still focused
		expect(saveButton()).toBe(save);
		expect(save).toHaveAttribute("aria-disabled", "true");
		expect(save).toHaveFocus();
		await user.keyboard("{Enter}");
		expect(updates.spy).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3473-ITEM-10] a read-only Save is in the tab order, so the keyboard reaches it and its reason", async () => {
		const user = userEvent.setup();
		mountPage(FieldPage, {
			formProps: {
				readOnlyReasons: { permission: "You may not edit people" },
			},
		});
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		// the field is read-only, so Save is the first tab stop
		await user.tab();
		expect(saveButton()).toHaveFocus();
		expect(saveButton()).toHaveAccessibleDescription("You may not edit people");
	});
});
