import "@testing-library/jest-dom/vitest";
import React, { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { PageProps } from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import {
	buttonNames,
	connectorOf,
	LOAD,
	makePage,
	makePeopleModel,
	mountPage,
	PeopleModel,
	setupPageTests,
	TestCustomProps,
} from "./pageFixture";

setupPageTests();

const RelabeledPage = makePage({
	textButtonSave: "Create",
	textButtonBack: "Cancel",
});

/**
 * A DefaultFormPage whose extra button switches the labels between unset and
 * "Create" / "Cancel"
 */
const RelabelLaterPage = (props: PageProps<PeopleModel, TestCustomProps>) => {
	const [relabeled, setRelabeled] = useState(false);
	return (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
			textButtonSave={relabeled ? "Create" : undefined}
			textButtonBack={relabeled ? "Cancel" : undefined}
			extraButtons={
				<button type={"button"} onClick={() => setRelabeled((r) => !r)}>
					Relabel
				</button>
			}
		>
			<FormField name="first_name" />
		</DefaultFormPage>
	);
};

describe("DefaultFormPage footer", () => {
	it("[ISSUE-3503-ITEM-5] textButtonSave and textButtonBack label the buttons", async () => {
		mountPage(RelabeledPage);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		expect(buttonNames()).toEqual(["Create", "Cancel"]);
	});

	it("[ISSUE-3503-ITEM-5] the relabeled buttons are named by their labels, Create saves and Cancel goes back", async () => {
		const model = makePeopleModel();
		const update = vi.spyOn(connectorOf(model), "update");
		const { goBack } = mountPage(RelabeledPage, { model });
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.change(input, { target: { value: "AliceX" } });
		const create = screen.getByRole("button", { name: "Create" });
		await waitFor(() =>
			expect(create).not.toHaveAttribute("aria-disabled", "true"),
		);
		fireEvent.click(create);
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		// unavailable after the save, but focusable (aria-disabled, not the native disabled)
		await waitFor(() =>
			expect(create).toHaveAttribute("aria-disabled", "true"),
		);
		const cancel = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancel).toBeEnabled());
		fireEvent.click(cancel);
		await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
	});

	it("[ISSUE-3503-ITEM-5] labels set or removed after mount take effect", async () => {
		mountPage(RelabelLaterPage);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		expect(buttonNames()).toEqual(["Save", "Relabel", "Back"]);
		fireEvent.click(screen.getByRole("button", { name: "Relabel" }));
		await waitFor(() =>
			expect(buttonNames()).toEqual(["Create", "Relabel", "Cancel"]),
		);
		fireEvent.click(screen.getByRole("button", { name: "Relabel" }));
		await waitFor(() =>
			expect(buttonNames()).toEqual(["Save", "Relabel", "Back"]),
		);
	});
});
