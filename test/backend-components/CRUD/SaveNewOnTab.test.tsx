/**
 * A routed CRUD whose record page has routed tabs (IMF's role and user forms): what the URL,
 * the tab bar and the panel show after the first save of a new record.
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Tab } from "@mui/material";
import { createMemoryHistory } from "history";
import type { CrudFormProps } from "../../../src/backend-components/CRUD";
import {
	PageProps,
	useFormContextLite,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import type { ModelUnknown } from "../../../src/backend-integration";
import {
	RoutedTabPanelWrapper,
	RoutedTabs,
	useRoutedTabPanel,
} from "../../../src/non-standalone/RoutedTabs";
import {
	crudEl,
	fillCreateForm,
	LOAD,
	peopleModel,
	renderRouted,
	setupCrudTests,
} from "./crudFixture";

setupCrudTests();

const FormId = () => {
	const { id } = useFormContextLite<ModelUnknown>();
	return <div data-testid={"form-id"}>{String(id)}</div>;
};

/**
 * A record page with the four people fields above a tab bar: "General" (the default tab) and
 * "Permissions", each with a panel of its own
 */
const TabbedPage = (props: PageProps<ModelUnknown, CrudFormProps>) => {
	const tab = useRoutedTabPanel();
	return (
		<DefaultFormPage {...props} autoBack={false}>
			<FormField name="first_name" />
			<FormField name="last_name" />
			<FormField name="email" />
			<FormField name="department" />
			<FormId />
			<RoutedTabs aria-label={"Record"}>
				<Tab label={"General"} value={""} />
				<Tab label={"Permissions"} value={"permissions"} />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("permissions", <div>PERMISSIONS PANEL</div>),
					tab("", <div>GENERAL PANEL</div>),
				]}
			</RoutedTabPanelWrapper>
		</DefaultFormPage>
	);
};

const saveButton = () => screen.getByRole("button", { name: "Save" });

const savedAs = (id: string) =>
	waitFor(() => expect(screen.getByTestId("form-id")).toHaveTextContent(id));

describe("routed CRUD: the first save of a new record", () => {
	it("[ISSUE-3500-ITEM-22] saving a new record on a tab opens the saved record on that tab", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/new"] });
		renderRouted(h, crudEl(peopleModel(), {}, undefined, TabbedPage));
		const inputs = await fillCreateForm();
		fireEvent.click(screen.getByRole("tab", { name: "Permissions" }));
		const panel = await screen.findByText("PERMISSIONS PANEL");
		expect(h.location.pathname).toBe("/rec/new/permissions");
		const index = h.index;

		fireEvent.click(saveButton());
		await savedAs("9");

		expect(h.location.pathname).toBe("/rec/9/permissions");
		// the create form's history entry is replaced, as without a tab
		expect(h.index).toBe(index);
		expect(screen.getByRole("tab", { name: "Permissions" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute(
			"aria-selected",
			"false",
		);
		// the panel and the Form stay mounted: nothing flickers, the saved values stay
		expect(screen.getByText("PERMISSIONS PANEL")).toBe(panel);
		expect(screen.queryByText("GENERAL PANEL")).toBeNull();
		expect(screen.getAllByRole("textbox")[0]).toBe(inputs[0]);
		expect(inputs[0]).toHaveValue("v0");
	});

	it.each([
		["/rec/new", "/rec/9"],
		["/rec/new/permissions", "/rec/9/permissions"],
		["/rec/new/permissions/", "/rec/9/permissions"],
		["/rec/new//permissions", "/rec/9/permissions"],
		["/rec/new/permissions/section/2", "/rec/9/permissions/section/2"],
	])(
		"[ISSUE-3500-ITEM-22] saving the create form at %s goes to %s",
		async (from, to) => {
			const h = createMemoryHistory({ initialEntries: [from] });
			renderRouted(h, crudEl(peopleModel(), {}, undefined, TabbedPage));
			await fillCreateForm();
			fireEvent.click(saveButton());
			await savedAs("9");
			expect(h.location.pathname).toBe(to);
		},
	);

	it("[ISSUE-3500-ITEM-22] the create form's query and hash are not carried over to the saved record", async () => {
		const h = createMemoryHistory({
			initialEntries: ["/rec/new/permissions?prefill=1#top"],
		});
		renderRouted(h, crudEl(peopleModel(), {}, undefined, TabbedPage));
		await fillCreateForm();
		fireEvent.click(saveButton());
		await savedAs("9");
		expect(h.location).toMatchObject({
			pathname: "/rec/9/permissions",
			search: "",
			hash: "",
		});
	});

	it("[ISSUE-3500-ITEM-22] saving the saved record again on its tab stays there", async () => {
		const onSubmit = vi.fn();
		const h = createMemoryHistory({ initialEntries: ["/rec/1/permissions"] });
		renderRouted(
			h,
			crudEl(
				peopleModel(),
				{ formProps: { errorComponent: DefaultErrorComponent, onSubmit } },
				undefined,
				TabbedPage,
			),
		);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());
		const index = h.index;
		fireEvent.click(saveButton());
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		expect(h.location.pathname).toBe("/rec/1/permissions");
		expect(h.index).toBe(index);
	});
});
