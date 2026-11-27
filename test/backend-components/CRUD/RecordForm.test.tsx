/**
 * CRUD's record page: the handoff from "new" to the saved record, the reset when another
 * record opens, the customProps it gives the page, the CrudDispatch, and what happens around
 * a save.
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
	act,
	fireEvent,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createMemoryHistory } from "history";
import { CrudDispatch } from "../../../src/backend-components/CRUD";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import {
	connectorOf,
	crudEl,
	fillCreateForm,
	gridWrapper,
	holdCreates,
	lastGrid,
	LOAD,
	pageLog,
	peopleModel,
	renderPlain,
	renderRouted,
	setupCrudTests,
} from "./crudFixture";
import { findLeavePrompt, PeopleModel } from "../Form/pageFixture";

setupCrudTests();

const saveButton = () => screen.getByRole("button", { name: "Save" });

/**
 * Changes Alice's first name and waits until Save is enabled
 */
const editAlice = async (value = "AliceX") => {
	const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
	fireEvent.change(input, { target: { value } });
	await waitFor(() => expect(saveButton()).toBeEnabled());
	return input;
};

/**
 * Freezes Date (only Date: timers stay real); the grid's refresh token and the Form's key
 * are the time in ms
 * @returns A function that moves the clock on
 */
const freezeDate = () => {
	let clock = 1_000_000;
	vi.useFakeTimers({ toFake: ["Date"] });
	vi.setSystemTime(clock);
	return () => {
		clock += 1000;
		vi.setSystemTime(clock);
	};
};

/**
 * Answers the "Leave form page?" prompt with Yes
 */
const confirmLeave = async () => {
	fireEvent.click(
		within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
	);
};

describe("after a save", () => {
	it("routed: saving a new record replaces <url>/new with <url>/<id> and keeps the same Form", async () => {
		const tick = freezeDate();
		try {
			const onSubmit = vi.fn();
			const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
			renderRouted(
				h,
				crudEl(peopleModel(), {
					formProps: { errorComponent: DefaultErrorComponent, onSubmit },
				}),
			);
			const inputs = await fillCreateForm();
			const tokenBefore = lastGrid().forceRefreshToken;
			tick();
			fireEvent.click(saveButton());
			await waitFor(() => expect(h.location.pathname).toBe("/rec/9"));
			// replaced, not pushed
			expect(h.index).toBe(0);
			await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
			const [data, submitted, old] = onSubmit.mock.calls[0] as Record<
				string,
				unknown
			>[];
			expect(data.id).toBe("9");
			expect(data.first_name).toBe("v0");
			expect(submitted.first_name).toBe("v0");
			expect(old).toBeDefined();
			expect(lastGrid().forceRefreshToken).not.toBe(tokenBefore);
			await waitFor(() =>
				expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
			);
			// the same Form: the field nodes and the page instance are kept
			expect(screen.getAllByRole("textbox")[0]).toBe(inputs[0]);
			expect(inputs[0]).toHaveValue("v0");
			expect(pageLog.mounts).toBe(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it("routed: a second save of the created record updates it", async () => {
		const model = peopleModel();
		const connector = connectorOf(model as unknown as PeopleModel);
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(h, crudEl(model));
		const inputs = await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
		);
		const update = vi.spyOn(connector, "update");
		const create = vi.spyOn(connector, "create");
		fireEvent.change(inputs[0], { target: { value: "changed" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());
		fireEvent.click(saveButton());
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		expect((update.mock.calls[0][0] as { id: string }).id).toBe("9");
		expect(create).not.toHaveBeenCalled();
	});

	it("routed: saving an existing record stays where it is (also on a tab) and reloads the grid", async () => {
		const tick = freezeDate();
		try {
			const onSubmit = vi.fn();
			const h = createMemoryHistory({ initialEntries: ["/rec/1/more"] });
			renderRouted(
				h,
				crudEl(peopleModel(), {
					formProps: { errorComponent: DefaultErrorComponent, onSubmit },
				}),
			);
			await editAlice();
			const tokenBefore = lastGrid().forceRefreshToken;
			tick();
			fireEvent.click(saveButton());
			await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
			expect(h.location.pathname).toBe("/rec/1/more");
			expect(h.index).toBe(0);
			expect(lastGrid().forceRefreshToken).not.toBe(tokenBefore);
		} finally {
			vi.useRealTimers();
		}
	});

	it("disableRouting: saving a new record switches to it and keeps the same Form", async () => {
		renderPlain(
			crudEl(peopleModel(), { disableRouting: true, initialView: "new" }),
		);
		const inputs = await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
		);
		expect(screen.getAllByRole("textbox")[0]).toBe(inputs[0]);
		expect(inputs[0]).toHaveValue("v0");
		expect(pageLog.mounts).toBe(1);
	});

	it("disableRouting: a create form closed during the save stays closed", async () => {
		const model = peopleModel();
		const ref = React.createRef<CrudDispatch>();
		const onSubmit = vi.fn();
		const held = holdCreates(model);
		renderPlain(
			crudEl(
				model,
				{
					disableRouting: true,
					initialView: "new",
					formProps: { errorComponent: DefaultErrorComponent, onSubmit },
				},
				ref,
			),
		);
		await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() => expect(held.spy).toHaveBeenCalled());
		act(() => ref.current!.showOverview());
		await waitFor(() => expect(screen.queryByTestId("form-id")).toBeNull());
		await held.release();
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		expect(screen.queryByTestId("form-id")).toBeNull();
		expect(gridWrapper()).not.toHaveClass("Mui-hidden");
	});

	it("[ISSUE-3507-ITEM-3] routed: leaving the create form while it saves keeps the user where they went", async () => {
		const model = peopleModel();
		const onSubmit = vi.fn();
		const held = holdCreates(model);
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(
			h,
			crudEl(model, {
				formProps: { errorComponent: DefaultErrorComponent, onSubmit },
			}),
		);
		await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() => expect(held.spy).toHaveBeenCalled());
		// the form has unsaved changes while it saves, so leaving asks first
		act(() => h.push("/other"));
		await confirmLeave();
		expect(await screen.findByText("OTHER PAGE")).toBeInTheDocument();
		await held.release();
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		expect(h.location.pathname).toBe("/other");
		expect(h.index).toBe(1);
	});

	it("[ISSUE-3507-ITEM-3] routed: going back to the list while it saves keeps the list", async () => {
		const tick = freezeDate();
		try {
			const model = peopleModel();
			const onSubmit = vi.fn();
			const held = holdCreates(model);
			const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
			renderRouted(
				h,
				crudEl(model, {
					formProps: { errorComponent: DefaultErrorComponent, onSubmit },
				}),
			);
			await fillCreateForm();
			fireEvent.click(saveButton());
			await waitFor(() => expect(held.spy).toHaveBeenCalled());
			act(() => h.push("/rec"));
			await confirmLeave();
			await waitFor(() => expect(screen.queryByTestId("form-id")).toBeNull());
			const tokenBefore = lastGrid().forceRefreshToken;
			tick();
			await held.release();
			await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
			expect(h.location.pathname).toBe("/rec");
			expect(h.index).toBe(1);
			expect(screen.queryByTestId("form-id")).toBeNull();
			expect(gridWrapper()).not.toHaveClass("Mui-hidden");
			// the list shows the created record
			expect(lastGrid().forceRefreshToken).not.toBe(tokenBefore);
		} finally {
			vi.useRealTimers();
		}
	});

	it("[ISSUE-3507-ITEM-3] routed: opening another record while it saves keeps that record", async () => {
		const model = peopleModel();
		const onSubmit = vi.fn();
		const held = holdCreates(model);
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(
			h,
			crudEl(model, {
				formProps: { errorComponent: DefaultErrorComponent, onSubmit },
			}),
		);
		await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() => expect(held.spy).toHaveBeenCalled());
		act(() => h.push("/rec/1"));
		await confirmLeave();
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		await held.release();
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		expect(h.location.pathname).toBe("/rec/1");
		expect(h.index).toBe(1);
		expect(screen.getByTestId("form-id")).toHaveTextContent("1");
		expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
	});

	it("[ISSUE-3507-ITEM-3] routed: a create form opened again after leaving the saving one stays a create form", async () => {
		const model = peopleModel();
		const onSubmit = vi.fn();
		const held = holdCreates(model);
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(
			h,
			crudEl(model, {
				formProps: { errorComponent: DefaultErrorComponent, onSubmit },
			}),
		);
		await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() => expect(held.spy).toHaveBeenCalled());
		act(() => h.push("/other"));
		await confirmLeave();
		await screen.findByText("OTHER PAGE");
		// a new CRUD with an empty create form
		act(() => h.push("/rec/new"));
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("null"),
		);
		await held.release();
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		expect(h.location.pathname).toBe("/rec/new");
		expect(h.index).toBe(2);
		expect(screen.getByTestId("form-id")).toHaveTextContent("null");
	});

	it("[ISSUE-3507-ITEM-3] routed: a tab opened while it saves is where the saved record opens", async () => {
		const model = peopleModel();
		const held = holdCreates(model);
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(h, crudEl(model));
		const inputs = await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() => expect(held.spy).toHaveBeenCalled());
		// inside the form page: no prompt, the same Form
		act(() => h.push("/rec/new/more"));
		expect(h.location.pathname).toBe("/rec/new/more");
		await held.release();
		await waitFor(() => expect(h.location.pathname).toBe("/rec/9/more"));
		// the tab's entry is replaced, not pushed
		expect(h.index).toBe(1);
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
		);
		expect(screen.getAllByRole("textbox")[0]).toBe(inputs[0]);
	});

	it("[ISSUE-3507-ITEM-3] disableRouting: opening another record while it saves keeps that record", async () => {
		const model = peopleModel();
		const ref = React.createRef<CrudDispatch>();
		const onSubmit = vi.fn();
		const held = holdCreates(model);
		renderPlain(
			crudEl(
				model,
				{
					disableRouting: true,
					initialView: "new",
					formProps: { errorComponent: DefaultErrorComponent, onSubmit },
				},
				ref,
			),
		);
		await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() => expect(held.spy).toHaveBeenCalled());
		act(() => ref.current!.openView("1"));
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		await held.release();
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		await act(async () => {});
		expect(screen.getByTestId("form-id")).toHaveTextContent("1");
		expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
	});
});
