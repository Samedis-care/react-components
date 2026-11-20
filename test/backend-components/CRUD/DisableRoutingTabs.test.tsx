/**
 * A disableRouting CRUD under a Route whose record page has routed tabs (an account or
 * profile page that keeps its record in a CRUD without URLs of its own): what the leave
 * guard asks when the user switches tabs and when the user leaves the page.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { Tab } from "@mui/material";
import { createMemoryHistory } from "history";
import type { CrudFormProps } from "../../../src/backend-components/CRUD";
import { PageProps } from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import type { ModelUnknown } from "../../../src/backend-integration";
import {
	RoutedTabPanelWrapper,
	RoutedTabs,
	useRoutedTabPanel,
} from "../../../src/non-standalone/RoutedTabs";
import {
	crudEl,
	peopleModel,
	renderRouted,
	setupCrudTests,
} from "./crudFixture";
import { leavePrompts, makeDirty } from "../Form/pageFixture";

setupCrudTests();

/**
 * A record page with a tab bar: "General" (the default tab, with the first name) and
 * "Logins", each with a panel of its own
 */
const TabbedPage = (props: PageProps<ModelUnknown, CrudFormProps>) => {
	const tab = useRoutedTabPanel();
	return (
		<DefaultFormPage {...props} autoBack={false}>
			<RoutedTabs aria-label={"Account"}>
				<Tab label={"General"} value={""} />
				<Tab label={"Logins"} value={"logins"} />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("logins", <div>LOGINS PANEL</div>),
					tab("", <FormField name="first_name" />),
				]}
			</RoutedTabPanelWrapper>
		</DefaultFormPage>
	);
};

describe("disableRouting CRUD under a route: tabs in the record page", () => {
	it("[ISSUE-3500-ITEM-5] a tab switch on a dirty record keeps the edit without asking; leaving the page asks", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderRouted(
			h,
			crudEl(
				peopleModel(),
				{ disableRouting: true, initialView: "1" },
				undefined,
				TabbedPage,
			),
		);
		await makeDirty();
		fireEvent.click(screen.getByRole("tab", { name: "Logins" }));
		expect(await screen.findByText("LOGINS PANEL")).toBeInTheDocument();
		expect(h.location.pathname).toBe("/rec/logins");
		expect(leavePrompts()).toHaveLength(0);

		fireEvent.click(screen.getByRole("tab", { name: "General" }));
		expect(await screen.findByDisplayValue("AliceX")).toBeInTheDocument();
		expect(leavePrompts()).toHaveLength(0);

		act(() => h.push("/other"));
		await waitFor(() => expect(leavePrompts()).toHaveLength(1));
		expect(h.location.pathname).not.toBe("/other");
		expect(screen.queryByText("OTHER PAGE")).toBeNull();
	});
});
