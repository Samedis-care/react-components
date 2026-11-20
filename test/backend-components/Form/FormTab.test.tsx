import React, { createRef, useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Tabs } from "@mui/material";
import { createMemoryHistory, MemoryHistory } from "history";
import { Framework } from "../../../src/framework";
import { setFrameworkHistory } from "../../../src/framework/History";
import Routes from "../../../src/standalone/Routes/Routes";
import Route from "../../../src/standalone/Routes/Route";
import Form, {
	FormProps,
	PageProps,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import DirtyStateProvider from "../../../src/backend-components/Form/DirtyStateProvider";
import FormTab from "../../../src/backend-components/Form/FormTab";
import {
	RoutedTabPanelWrapper,
	RoutedTabs,
	useRoutedTabPanel,
} from "../../../src/non-standalone/RoutedTabs";
import { ModelUnknown } from "../../../src/backend-integration";
import { makeModel, required, setupFormTests } from "./formFixture";

setupFormTests();
beforeEach(() => {
	// useNavigate scrolls the window to the top on every tab click; jsdom does not implement it
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

const LOAD = { timeout: 10000 };

const GENERAL_FIELDS = ["title", "note"] as const;
const MORE_FIELDS = ["reason", "other"] as const;

type Page = React.ComponentType<
	PageProps<ModelUnknown, { goBack: () => void }>
>;

/**
 * The consumer shape of SCF's contract form: the form page wraps the tabs and
 * the panels, and each tab lists the fields of its panel. Record 1 has an
 * empty "other", which the model requires, on the tab "More".
 */
const TabbedPage: Page = (props) => {
	const tab = useRoutedTabPanel();
	return (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
			autoBack={false}
		>
			<RoutedTabs aria-label="Record">
				<FormTab label="General" value="" fields={GENERAL_FIELDS} />
				<FormTab label="More" value="more" fields={MORE_FIELDS} />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab(
						"more",
						<>
							<FormField name="reason" />
							<FormField name="other" />
						</>,
					),
					tab(
						"",
						<>
							<FormField name="title" />
							<FormField name="note" />
						</>,
					),
				]}
			</RoutedTabPanelWrapper>
		</DefaultFormPage>
	);
};

/**
 * A routed Form for record 1 under /rec/*, with the tabbed page
 * @param history The history, at /rec or below
 * @param formProps Further Form props, e.g. showDirtyState
 */
const renderTabbedForm = (
	history: MemoryHistory,
	formProps: Partial<FormProps<ModelUnknown, { goBack: () => void }>> = {},
) => {
	setFrameworkHistory(history);
	return render(
		<Framework>
			<Routes>
				{[
					<Route
						key="rec"
						path="/rec/*"
						element={
							<Form
								model={makeModel({ other: { validate: required } })}
								id={"1"}
								errorComponent={DefaultErrorComponent}
								customProps={{ goBack: () => {} }}
								{...formProps}
							>
								{TabbedPage}
							</Form>
						}
					/>,
				]}
			</Routes>
		</Framework>,
	);
};

const tabEl = (name: string) => screen.getByRole("tab", { name });

const hasErrorIcon = (tab: HTMLElement) =>
	within(tab).queryByTestId("ErrorOutlinedIcon") !== null;

const hasDirtyMarker = (tab: HTMLElement) =>
	tab.querySelector('[class*="CcDirtyMarker-root"]') !== null;

/** Changes the title on the default tab, so the form is dirty and can be saved */
const editTitle = async () => {
	const input = await screen.findByDisplayValue("T1", undefined, LOAD);
	fireEvent.change(input, { target: { value: "T1 changed" } });
	await waitFor(() =>
		expect(screen.getByRole("button", { name: /save/i })).toBeEnabled(),
	);
};

/** Clicks Save and closes the validation dialog it opens */
const saveAndDismissValidationDialog = async () => {
	fireEvent.click(screen.getByRole("button", { name: /save/i }));
	const dialog = await screen.findByRole("dialog", undefined, LOAD);
	expect(dialog).toHaveTextContent("required");
	fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
	await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
};

describe("FormTab", () => {
	it("[ISSUE-3500-ITEM-21] a save that fails on a field of a tab not shown marks that tab as invalid, visibly and in its description", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderTabbedForm(h);
		await editTitle();
		const more = tabEl("More");
		expect(hasErrorIcon(more)).toBe(false);
		expect(more).not.toHaveAttribute("aria-describedby");
		await saveAndDismissValidationDialog();
		// the field is on the panel of "More", which is not rendered
		expect(screen.queryByRole("textbox", { name: /other reason/i })).toBeNull();
		await waitFor(() => expect(hasErrorIcon(tabEl("More"))).toBe(true));
		expect(tabEl("More")).toHaveAccessibleDescription(
			"Contains invalid fields.",
		);
		// the name stays the label
		expect(tabEl("More")).toHaveAccessibleName("More");
		// the default tab has no invalid field
		expect(hasErrorIcon(tabEl("General"))).toBe(false);
		expect(tabEl("General")).not.toHaveAttribute("aria-describedby");
	});

	it("[ISSUE-3500-ITEM-21] the invalid marker goes when the field is corrected", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderTabbedForm(h);
		await editTitle();
		await saveAndDismissValidationDialog();
		await waitFor(() => expect(hasErrorIcon(tabEl("More"))).toBe(true));
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		const other = await screen.findByRole("textbox", { name: /other reason/i });
		fireEvent.change(other, { target: { value: "given" } });
		await waitFor(() => expect(hasErrorIcon(tabEl("More"))).toBe(false));
		expect(tabEl("More")).not.toHaveAttribute("aria-describedby");
	});

	it("[ISSUE-3500-ITEM-21] an invalid field that is not touched yet does not mark its tab, as it does not show its error either", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderTabbedForm(h);
		await editTitle();
		// validation ran on the change and found "other" empty, untouched
		expect(hasErrorIcon(tabEl("More"))).toBe(false);
		expect(hasErrorIcon(tabEl("General"))).toBe(false);
	});

	it("[ISSUE-3500-ITEM-21] with showDirtyState a tab with modified fields shows the modified marker, also while another tab is open", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderTabbedForm(h, { showDirtyState: true });
		await screen.findByDisplayValue("T1", undefined, LOAD);
		expect(hasDirtyMarker(tabEl("General"))).toBe(false);
		await editTitle();
		await waitFor(() => expect(hasDirtyMarker(tabEl("General"))).toBe(true));
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		expect(hasDirtyMarker(tabEl("General"))).toBe(true);
		expect(tabEl("General")).toHaveAccessibleDescription(
			"Contains modified fields.",
		);
		expect(tabEl("General")).toHaveAccessibleName("General");
		expect(hasDirtyMarker(tabEl("More"))).toBe(false);
		expect(tabEl("More")).not.toHaveAttribute("aria-describedby");
	});

	it("[ISSUE-3500-ITEM-21] without showDirtyState a modified tab is not marked, as its fields are not", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderTabbedForm(h);
		await editTitle();
		expect(hasDirtyMarker(tabEl("General"))).toBe(false);
		expect(tabEl("General")).not.toHaveAttribute("aria-describedby");
	});

	it("[ISSUE-3500-ITEM-21] a tab both invalid and modified shows both markers and both descriptions", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderTabbedForm(h, { showDirtyState: true });
		await editTitle();
		await saveAndDismissValidationDialog();
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		const reason = await screen.findByRole("textbox", { name: /^reason/i });
		fireEvent.change(reason, { target: { value: "b" } });
		await waitFor(() => expect(hasDirtyMarker(tabEl("More"))).toBe(true));
		expect(hasErrorIcon(tabEl("More"))).toBe(true);
		expect(tabEl("More")).toHaveAccessibleDescription(
			"Contains invalid fields. Contains modified fields.",
		);
	});
});

describe("FormTab outside RoutedTabs", () => {
	/** MUI Tabs with state of their own, the other tab's fields not rendered */
	const StateTabs = (props: { extra?: React.ReactNode }) => {
		const [value, setValue] = useState("general");
		return (
			<>
				<Tabs
					aria-label="Record"
					value={value}
					onChange={(_evt, next: string) => setValue(next)}
				>
					<FormTab label="General" value="general" fields={GENERAL_FIELDS} />
					<FormTab label="More" value="more" fields={MORE_FIELDS} />
				</Tabs>
				{props.extra}
			</>
		);
	};

	it("[ISSUE-3500-ITEM-21] marks follow a DirtyStateProvider's marks, like the fields", async () => {
		const marks = { reason: true };
		const Page = () => (
			<DirtyStateProvider marks={marks}>
				<StateTabs />
			</DirtyStateProvider>
		);
		render(
			<Framework>
				<Form
					model={makeModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={undefined}
					disableRouting
				>
					{Page}
				</Form>
			</Framework>,
		);
		await waitFor(() => expect(hasDirtyMarker(tabEl("More"))).toBe(true));
		expect(hasDirtyMarker(tabEl("General"))).toBe(false);
	});

	it("[ISSUE-3500-ITEM-21] dirty and error mark a tab without fields, also outside a Form, and a description of its own is kept", () => {
		render(
			<Framework>
				<Tabs aria-label="Steps" value={0}>
					<FormTab label="Plain" />
					<FormTab label="Changed" dirty aria-describedby="hint" />
					<FormTab label="Broken" error fields={["title"]} />
				</Tabs>
				<p id="hint">Has a hint</p>
			</Framework>,
		);
		const plain = tabEl("Plain");
		expect(hasDirtyMarker(plain)).toBe(false);
		expect(hasErrorIcon(plain)).toBe(false);
		expect(plain).not.toHaveAttribute("aria-describedby");
		const changed = tabEl("Changed");
		expect(hasDirtyMarker(changed)).toBe(true);
		expect(hasErrorIcon(changed)).toBe(false);
		expect(changed).toHaveAccessibleDescription(
			"Has a hint Contains modified fields.",
		);
		// outside a Form, fields mark nothing, and the flag still does
		const broken = tabEl("Broken");
		expect(hasErrorIcon(broken)).toBe(true);
		expect(hasDirtyMarker(broken)).toBe(false);
		expect(broken).toHaveAccessibleDescription("Contains invalid fields.");
	});

	it("[ISSUE-3500-ITEM-21] forwards its ref and MUI's props to the Tab, and keeps a Tab without a label unlabelled", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<Framework>
				<Tabs aria-label="Steps" value="b">
					<FormTab label="A" value="a" disabled />
					<FormTab label="B" value="b" ref={ref} />
					<FormTab aria-label="Icon only" value="c" icon={<span>i</span>} />
				</Tabs>
			</Framework>,
		);
		expect(tabEl("A")).toBeDisabled();
		expect(tabEl("B")).toHaveAttribute("aria-selected", "true");
		expect(ref.current).toBe(tabEl("B"));
		// MUI lays out a Tab with an icon and a label differently (labelIcon)
		expect(tabEl("Icon only")).not.toHaveClass("MuiTab-labelIcon");
		expect(tabEl("Icon only")).toHaveTextContent(/^i$/);
	});
});
