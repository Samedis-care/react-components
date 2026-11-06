/**
 * The Save button DefaultFormPage and FlowEngineSaveButton share (FormPageSaveButton): what
 * it says while the form is read-only, here in a DefaultFormPage. FlowEngineSaveButton's
 * cases are in FlowEngine.test.tsx.
 */
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
	LOAD,
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
		expect(save).toBeDisabled();
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
});
