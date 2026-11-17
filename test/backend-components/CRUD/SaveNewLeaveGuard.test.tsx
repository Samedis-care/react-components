/**
 * A routed CRUD whose record page holds a control with a dirty state of its own
 * (setCustomFieldDirty) that catches up with the saved record only after the save: the move
 * from the create form to the saved record, and the leave guard around it.
 */
import React, { useEffect } from "react";
import { describe, expect, it } from "vitest";
import {
	act,
	fireEvent,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createMemoryHistory } from "history";
import type { CrudFormProps } from "../../../src/backend-components/CRUD";
import {
	PageProps,
	useFormContext,
	useFormContextLite,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import type { ModelUnknown } from "../../../src/backend-integration";
import { FrameworkHistory } from "../../../src/framework/History";
import {
	crudEl,
	fillCreateForm,
	holdCreates,
	LOAD,
	peopleModel,
	renderRouted,
	setupCrudTests,
} from "./crudFixture";
import {
	findLeavePrompt,
	leavePrompts,
	unloadIsBlocked,
} from "../Form/pageFixture";

setupCrudTests();

/**
 * A control with a value of its own that the save of the record takes care of (as an image
 * list does with its primary image): it reports itself dirty until the record exists, or for
 * good with `pending`. Like such controls, it skips that check while the form is read-only, so
 * during the save it can't catch up with the saved record.
 */
const OwnValueControl = (props: { pending: boolean }) => {
	const { pending } = props;
	const { values, readOnly, setCustomFieldDirty } =
		useFormContext<ModelUnknown>();
	const recordExists = !!values.id;
	useEffect(() => {
		if (readOnly) return;
		setCustomFieldDirty("own-value", pending || !recordExists);
	}, [pending, readOnly, recordExists, setCustomFieldDirty]);
	return null;
};

const FormId = () => {
	const { id } = useFormContextLite<ModelUnknown>();
	return <div data-testid={"form-id"}>{String(id)}</div>;
};

/**
 * The record page: the four people fields and the OwnValueControl
 * @param pending Does the control keep unsaved changes after the save?
 */
const makePage = (pending: boolean) => {
	const OwnValuePage = (props: PageProps<ModelUnknown, CrudFormProps>) => (
		<DefaultFormPage {...props} autoBack={false}>
			<FormField name="first_name" />
			<FormField name="last_name" />
			<FormField name="email" />
			<FormField name="department" />
			<OwnValueControl pending={pending} />
			<FormId />
		</DefaultFormPage>
	);
	return OwnValuePage;
};

const saveButton = () => screen.getByRole("button", { name: "Save" });

/**
 * Pushes a location and lets the blockers and the dialogs they push render
 */
const navigate = async (to: string) => {
	act(() => FrameworkHistory.push(to));
	await act(async () => {});
};

describe("routed CRUD: the move from the create form to the saved record", () => {
	it("[ISSUE-3507-ITEM-23] goes to <url>/<id> without asking, while a control's own dirty state still lags behind the save", async () => {
		const guardedAtMove: boolean[] = [];
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(
			h,
			crudEl(
				peopleModel(),
				{
					formProps: {
						errorComponent: DefaultErrorComponent,
						// runs right after CRUD's move to the saved record
						onSubmit: () => {
							guardedAtMove.push(unloadIsBlocked());
						},
					},
				},
				undefined,
				makePage(false),
			),
		);
		await fillCreateForm();
		const index = h.index;

		fireEvent.click(saveButton());
		// the control catches up once the save has finished, and the form is clean
		await waitFor(() => expect(guardedAtMove).toHaveLength(1));
		await waitFor(() => expect(unloadIsBlocked()).toBe(false));

		// the form still had unsaved changes (the control's) when CRUD moved on
		expect(guardedAtMove).toEqual([true]);
		expect(leavePrompts()).toHaveLength(0);
		expect(h.location.pathname).toBe("/rec/9");
		expect(h.index).toBe(index);
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
		);
	});

	it("[ISSUE-3507-ITEM-23] the saved record's page stays guarded while the control still has unsaved changes", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(h, crudEl(peopleModel(), {}, undefined, makePage(true)));
		await fillCreateForm();

		fireEvent.click(saveButton());
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
		);
		expect(h.location.pathname).toBe("/rec/9");
		expect(leavePrompts()).toHaveLength(0);

		expect(unloadIsBlocked()).toBe(true);
		await navigate("/other");
		expect(h.location.pathname).toBe("/rec/9");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3507-ITEM-23] Back from another record with unsaved changes to the saved one still asks", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(h, crudEl(peopleModel(), {}, undefined, makePage(false)));
		await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
		);
		await waitFor(() => expect(unloadIsBlocked()).toBe(false));

		await navigate("/rec/1");
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() => expect(unloadIsBlocked()).toBe(true));
		act(() => h.back());
		await act(async () => {});
		expect(h.location.pathname).toBe("/rec/1");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3507-ITEM-23] a navigation elsewhere while the create form saves still asks", async () => {
		const model = peopleModel();
		const creates = holdCreates(model);
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(h, crudEl(model, {}, undefined, makePage(false)));
		const inputs = await fillCreateForm();
		fireEvent.click(saveButton());
		await waitFor(() => expect(inputs[0]).toBeDisabled());

		await navigate("/other");
		expect(h.location.pathname).toBe("/rec/new");
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));

		await creates.release();
		await waitFor(() =>
			expect(screen.getByTestId("form-id")).toHaveTextContent("9"),
		);
		expect(h.location.pathname).toBe("/rec/9");
		expect(leavePrompts()).toHaveLength(0);
	});
});
