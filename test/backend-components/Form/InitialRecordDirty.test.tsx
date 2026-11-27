/**
 * A create form (`id={null}`) is dirty by the fields its `initialRecord` sets that differ from
 * the model's defaults: its dirty baseline (`initialValues`) is the model's default record, and
 * `initialRecord` is applied to the values as a change. So a pre-filled create form opens dirty
 * (Save enabled, the leave guard asks, FormAutoSave saves it, the dirty markers show), and one
 * with only the model's defaults opens clean, as an existing record does.
 */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import { useFormContext } from "../../../src/backend-components/Form/Form";
import FormAutoSave from "../../../src/backend-components/Form/FormAutoSave";
import FlowEngineSaveButton from "../../../src/backend-components/Form/FlowEngine/FlowEngineSaveButton";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { ModelUnknown } from "../../../src/backend-integration";
import {
	capture,
	makeModel,
	mountForm,
	mountNested,
	recordData,
	settle,
	Sink,
	trySubmit,
	wait,
} from "./formFixture";
import {
	backButton,
	connectorOf,
	findLeavePrompt,
	LOAD,
	makePage,
	mountPage,
	saveButton,
	setupPageTests,
	unloadIsBlocked,
} from "./pageFixture";

setupPageTests();

const FieldPage = makePage();

/**
 * A complete person, as a create form from a template or a copy starts with
 */
const JANE = {
	first_name: "Jane",
	last_name: "Doe",
	email: "jane@example.com",
	department: "Sales",
};

/**
 * Mounts FieldPage (DefaultFormPage around the first name) as a create form
 * @param initialRecord The create form's initialRecord, none by default
 * @returns mountPage's result and the connector's create spy
 */
const mountCreatePage = (initialRecord?: Record<string, unknown>) => {
	const goBack = vi.fn();
	const mounted = mountPage(FieldPage, {
		goBack,
		formProps: { id: null, initialRecord },
	});
	return {
		...mounted,
		create: vi.spyOn(connectorOf(mounted.model), "create"),
	};
};

/**
 * A formFixture model on its own connector, with a spy on create
 */
const spiedModel = () => {
	const connector = new MockConnector(recordData());
	return {
		model: makeModel({}, connector),
		create: vi.spyOn(connector, "create"),
	};
};

/**
 * Waits until the create form shows its values (title === expected) and its effects ran
 */
const created = async (sink: Sink, expected: unknown) => {
	await waitFor(() => expect(sink.ctx?.values.title).toBe(expected));
	await settle();
};

/**
 * A flow form's page: the title and a FlowEngineSaveButton
 */
const FlowSavePage = () => (
	<>
		<FormField name={"title"} />
		<FlowEngineSaveButton />
	</>
);

/**
 * A page that stores the form context in the sink and the dirty flag of every "dirty" event
 * in events, subscribed as a form page does
 */
const captureEvents = (sink: Sink, events: boolean[]) => {
	const Capture = () => {
		const ctx = useFormContext<ModelUnknown>();
		sink.ctx = ctx;
		const { addEventListener, removeEventListener } = ctx;
		React.useEffect(() => {
			const listener = (event: { dirty: boolean }) => events.push(event.dirty);
			addEventListener("dirty", listener);
			return () => removeEventListener("dirty", listener);
		}, [addEventListener, removeEventListener]);
		return null;
	};
	return Capture;
};

describe("A create form pre-filled through initialRecord", () => {
	it("[ISSUE-3503-ITEM-23] opens dirty: Save is enabled and creates the record as it is", async () => {
		const { create } = mountCreatePage(JANE);
		await screen.findByDisplayValue("Jane", undefined, LOAD);
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
		fireEvent.click(saveButton());
		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject(JANE);
		// created and unchanged: nothing left to save
		await waitFor(() => expect(unloadIsBlocked()).toBe(false));
		expect(saveButton()).toHaveAttribute("aria-disabled", "true");
	});

	it("[ISSUE-3503-ITEM-23] asks before it is left untouched", async () => {
		const { goBack } = mountCreatePage(JANE);
		await screen.findByDisplayValue("Jane", undefined, LOAD);
		await waitFor(() => expect(unloadIsBlocked()).toBe(true));
		fireEvent.click(backButton());
		await findLeavePrompt();
		expect(goBack).not.toHaveBeenCalled();
	});

	it("[ISSUE-3503-ITEM-23] is clean again once its pre-filled field is changed back to the model's default", async () => {
		mountCreatePage({ first_name: "Jane" });
		const input = await screen.findByDisplayValue("Jane", undefined, LOAD);
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
		fireEvent.change(input, { target: { value: "" } });
		await waitFor(() =>
			expect(saveButton()).toHaveAttribute("aria-disabled", "true"),
		);
		expect(unloadIsBlocked()).toBe(false);
	});

	it("[ISSUE-3503-ITEM-23] counts the fields that differ from the model's defaults, against the defaults as its initial values", async () => {
		const sink: Sink = {};
		mountForm(makeModel(), capture(sink), {
			id: null,
			// note repeats the model's default: no change
			initialRecord: { title: "New", note: "" },
		});
		await created(sink, "New");
		expect(sink.ctx!.dirty).toBe(true);
		expect(sink.ctx!.dirtyFields).toMatchObject({
			title: true,
			note: false,
			reason: false,
		});
		// the baseline is the record as the model creates it; initialRecord is a change to it
		expect(sink.ctx!.initialValues.title).toBe("");
		expect(sink.ctx!.values.title).toBe("New");
	});

	it("[ISSUE-3503-ITEM-23] marks the pre-filled fields with showDirtyState", async () => {
		const sink: Sink = {};
		mountForm(
			makeModel(),
			capture(sink, () => (
				<>
					<FormField name={"title"} />
					<FormField name={"note"} />
				</>
			)),
			{ id: null, initialRecord: { title: "New" }, showDirtyState: true },
		);
		await created(sink, "New");
		expect(
			screen.getByRole("textbox", { name: /^Title.*\(modified\)/ }),
		).toHaveValue("New");
		expect(
			screen.getByRole("textbox", { name: /^Note/ }),
		).not.toHaveAccessibleName(/\(modified\)/);
	});

	it("[ISSUE-3503-ITEM-23] announces itself dirty through the 'dirty' event", async () => {
		const sink: Sink = {};
		const events: boolean[] = [];
		mountForm(makeModel(), captureEvents(sink, events), {
			id: null,
			initialRecord: { title: "New" },
		});
		await created(sink, "New");
		expect(events.at(-1)).toBe(true);
	});

	it("[ISSUE-3503-ITEM-23] submit creates it without an edit, and sends nothing more once it is created", async () => {
		const { model, create } = spiedModel();
		const sink: Sink = {};
		mountForm(model, capture(sink), {
			id: null,
			initialRecord: { title: "New" },
		});
		await created(sink, "New");
		expect(await trySubmit(sink)).toBeNull();
		expect(create).toHaveBeenCalledTimes(1);
		expect(create.mock.calls[0][0]).toMatchObject({ title: "New" });
		await settle();
		expect(sink.ctx!.dirty).toBe(false);
		expect(await trySubmit(sink)).toBeNull();
		expect(create).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3503-ITEM-23] is saved by FormAutoSave", async () => {
		const { model, create } = spiedModel();
		const sink: Sink = {};
		mountForm(
			model,
			capture(sink, () => <FormAutoSave debounceTime={30} />),
			{ id: null, initialRecord: { title: "New" } },
		);
		await created(sink, "New");
		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({ title: "New" });
		// created: the next pause saves nothing
		await wait(100);
		expect(create).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3503-ITEM-23] in a flow, FlowEngineSaveButton is enabled and creates it", async () => {
		const { model, create } = spiedModel();
		mountForm(model, FlowSavePage, {
			id: null,
			flowEngine: true,
			initialRecord: { title: "New" },
		});
		await screen.findByDisplayValue("New", undefined, LOAD);
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
		fireEvent.click(saveButton());
		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({ title: "New" });
	});

	it("[ISSUE-3503-ITEM-23] nested, makes its parent dirty, and the parent's save creates it", async () => {
		const child = spiedModel();
		const { parent, child: childSink } = mountNested(child.model, makeModel(), {
			id: null,
			initialRecord: { title: "Child" },
		});
		await waitFor(() => expect(parent.ctx?.values.title).toBe("T1"));
		await created(childSink, "Child");
		await waitFor(() => expect(parent.ctx!.dirty).toBe(true));
		expect(await trySubmit(parent)).toBeNull();
		expect(child.create).toHaveBeenCalledTimes(1);
		expect(child.create.mock.calls[0][0]).toMatchObject({ title: "Child" });
		await settle();
		expect(parent.ctx!.dirty).toBe(false);
	});
});

describe("A create form without initialRecord, or an existing record", () => {
	it("[ISSUE-3503-ITEM-23] a create form with only the model's defaults opens clean: Save waits for an edit", async () => {
		mountCreatePage();
		const input = await screen.findByRole("textbox", undefined, LOAD);
		await settle();
		expect(saveButton()).toHaveAttribute("aria-disabled", "true");
		expect(unloadIsBlocked()).toBe(false);
		fireEvent.change(input, { target: { value: "Jane" } });
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
	});

	it("[ISSUE-3503-ITEM-23] an initialRecord that repeats the model's defaults leaves a create form clean", async () => {
		const sink: Sink = {};
		mountForm(makeModel(), capture(sink), {
			id: null,
			initialRecord: { title: "", note: "" },
		});
		await created(sink, "");
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3503-ITEM-23] an existing record ignores initialRecord and opens clean", async () => {
		const sink: Sink = {};
		mountForm(makeModel(), capture(sink), {
			id: "1",
			initialRecord: { title: "New" },
		});
		await created(sink, "T1");
		expect(sink.ctx!.dirty).toBe(false);
		expect(sink.ctx!.initialValues.title).toBe("T1");
	});
});
