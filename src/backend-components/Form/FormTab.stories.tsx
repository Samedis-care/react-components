import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fireEvent, waitFor, within } from "storybook/test";
import { AppBar, Box, Grid, Stack, Tabs, Typography } from "@mui/material";
import { createMemoryHistory } from "history";
import { Framework } from "../../framework";
import { setFrameworkHistory } from "../../framework/History";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import {
	RoutedTabPanelWrapper,
	RoutedTabs,
	useRoutedTabPanel,
} from "../../non-standalone/RoutedTabs";
import Form, { PageProps } from "./Form";
import FormField from "./Field";
import DefaultFormPage from "./DefaultFormPage";
import DefaultErrorComponent from "./DefaultErrorComponent";
import FormTab from "./FormTab";
import createTestModel, {
	sampleData,
} from "../../stories/test-utils/TestModel";
import MockConnector from "../../stories/test-utils/MockConnector";
import { Model } from "../../backend-integration";
import validatePresence from "../../utils/validations/validatePresence";

/**
 * A Framework on a memory history of its own, created once per story: the
 * form page blocks the history while the form is dirty, and the tabs navigate,
 * which must not touch the Storybook frame's own URL
 */
const FrameworkDecorator = (Story: React.ComponentType) => {
	useState(() =>
		setFrameworkHistory(createMemoryHistory({ initialEntries: ["/person"] })),
	);
	return (
		<Framework>
			<Story />
		</Framework>
	);
};

interface Args {
	/**
	 * The Form's `showDirtyState`: whether modified fields, and with them their
	 * tabs, show the modified marker
	 */
	showDirtyState: boolean;
}

const meta: Meta<Args> = {
	title: "Backend-Components/Form/FormTab",
	decorators: [FrameworkDecorator],
	args: { showDirtyState: true },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"A MUI `Tab` for a tabbed form. Its `fields` list the model fields of its panel; the label shows the modified marker (the dot after a modified field's label) while one of them is marked modified, and an error icon while one of them shows a validation error, also while the panel is not rendered. `dirty` and `error` mark the tab regardless. The states are part of the tab's accessible description. Use it in place of `Tab` in `RoutedTabs` or any MUI `Tabs` inside a Form.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<Args>;

let modelCounter = 0;

/**
 * The people model with a required department, on records whose first one has
 * none, so a save of record 1 fails on the "Contact" tab
 */
const makeModel = () => {
	const fields = createTestModel().fields;
	return new Model(
		"form-tab-story-" + String(modelCounter++),
		{
			...fields,
			department: { ...fields.department, validate: validatePresence },
		},
		new MockConnector(
			sampleData.map((record) =>
				record.id === "1" ? { ...record, department: "" } : record,
			),
		),
	);
};

type PeopleModel = ReturnType<typeof makeModel>;

const PERSON_FIELDS = ["first_name", "last_name"];
const CONTACT_FIELDS = ["email", "department"];

/** The form page: the tabs and their panels, as an app's contract form has them */
const TabbedPage = (props: PageProps<PeopleModel, { goBack: () => void }>) => {
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
			<RoutedTabs aria-label="Person">
				<FormTab label="Person" value="" fields={PERSON_FIELDS} />
				<FormTab label="Contact" value="contact" fields={CONTACT_FIELDS} />
				<FormTab label="Notes" value="notes" />
			</RoutedTabs>
			<Box sx={{ p: 2 }}>
				<RoutedTabPanelWrapper>
					{[
						tab(
							"contact",
							<Grid container spacing={2}>
								<Grid size={6}>
									<FormField name="email" />
								</Grid>
								<Grid size={6}>
									<FormField name="department" />
								</Grid>
							</Grid>,
						),
						tab("notes", <Typography>No fields on this tab.</Typography>),
						tab(
							"",
							<Grid container spacing={2}>
								<Grid size={6}>
									<FormField name="first_name" />
								</Grid>
								<Grid size={6}>
									<FormField name="last_name" />
								</Grid>
							</Grid>,
						),
					]}
				</RoutedTabPanelWrapper>
			</Box>
		</DefaultFormPage>
	);
};

const goBack = () => {};
const CUSTOM_PROPS = { goBack };

/** A routed Form for record 1 at /person, with the tabbed page */
const TabbedForm = (props: Args) => {
	const model = useMemo(makeModel, []);
	return (
		<Routes>
			{[
				<Route
					key="person"
					path="/person/*"
					element={
						<Form
							model={model}
							id={"1"}
							errorComponent={DefaultErrorComponent}
							customProps={CUSTOM_PROPS}
							showDirtyState={props.showDirtyState}
						>
							{TabbedPage}
						</Form>
					}
				/>,
			]}
		</Routes>
	);
};

const LOAD = { timeout: 10000 };

/**
 * The consumer shape: change a field and its tab shows the modified marker;
 * save, and the tab holding the missing department shows the error icon.
 */
export const InRoutedTabs: Story = {
	render: (args) => <TabbedForm {...args} />,
	play: async ({ canvas }) => {
		await canvas.findByDisplayValue("Alice", undefined, LOAD);
		await expect(canvas.getByRole("tab", { name: "Person" })).toBeVisible();
	},
};

/**
 * ISSUE-3500-ITEM-21: the department is required and empty on the "Contact"
 * tab. Saving from "Person" fails on it: the dialog names the field, and the
 * "Contact" tab is marked with the error icon and described as containing
 * invalid fields, while the modified "Person" tab shows the modified marker.
 * Correcting the department replaces the error marker with the modified one.
 */
export const Issue3500Item21SaveMarksTabOfInvalidField: Story = {
	render: (args) => <TabbedForm {...args} />,
	play: async ({ canvasElement }) => {
		const body = within(canvasElement.ownerDocument.body);
		const canvas = within(canvasElement);
		const tab = (name: string) => canvas.getByRole("tab", { name });
		const input = await canvas.findByDisplayValue("Alice", undefined, LOAD);
		await fireEvent.change(input, { target: { value: "Alicia" } });
		await waitFor(() =>
			expect(tab("Person")).toHaveAccessibleDescription(
				"Contains modified fields.",
			),
		);
		await expect(tab("Contact")).not.toHaveAttribute("aria-describedby");
		await fireEvent.click(canvas.getByRole("button", { name: /save/i }));
		const dialog = await body.findByRole("dialog", undefined, LOAD);
		await expect(dialog).toHaveTextContent("The Department field is required");
		await fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
		await waitFor(() =>
			expect(tab("Contact")).toHaveAccessibleDescription(
				"Contains invalid fields.",
			),
		);
		const icon = within(tab("Contact")).getByTestId("ErrorOutlinedIcon");
		await expect(icon).toBeVisible();
		await expect(tab("Person")).toHaveAccessibleDescription(
			"Contains modified fields.",
		);
		await fireEvent.click(tab("Contact"));
		const department = await canvas.findByRole("textbox", {
			name: /department/i,
		});
		await fireEvent.change(department, { target: { value: "Engineering" } });
		// corrected, and now modified
		await waitFor(() =>
			expect(tab("Contact")).toHaveAccessibleDescription(
				"Contains modified fields.",
			),
		);
		await expect(
			within(tab("Contact")).queryByTestId("ErrorOutlinedIcon"),
		).toBeNull();
	},
};

/** Every combination of the markers, in a tab bar of the given colors */
const MarkerTabs = (props: { textColor?: "primary" | "inherit" }) => (
	<Tabs aria-label="Markers" value={0} textColor={props.textColor}>
		<FormTab label="Unmarked" />
		<FormTab label="Modified" dirty />
		<FormTab label="Invalid" error />
		<FormTab label="Both" dirty error />
	</Tabs>
);

/** A dark bar, on which MUI's dimmed unselected tabs still reach 4.5:1 */
const DARK_BAR = { backgroundColor: "#1a237e" };

/**
 * The markers on a white bar and on a colored one (`textColor="inherit"` in an
 * AppBar), where both take the tab's text color: the palette's info and error
 * colors need not contrast with the bar (`palette.error.main` has 2.6:1 on
 * this one), the text color does.
 */
export const Markers: Story = {
	render: () => (
		<Stack spacing={2}>
			<MarkerTabs />
			<AppBar position="static" sx={DARK_BAR}>
				<MarkerTabs textColor="inherit" />
			</AppBar>
		</Stack>
	),
	play: async ({ canvasElement }) => {
		const bars = within(canvasElement).getAllByRole("tablist");
		const [, onAppBar] = bars;
		const both = within(onAppBar).getByRole("tab", { name: "Both" });
		const tabColor = getComputedStyle(both).color;
		const icon = within(both).getByTestId("ErrorOutlinedIcon");
		await expect(getComputedStyle(icon).color).toBe(tabColor);
		const dot = icon.previousElementSibling as HTMLElement;
		await expect(getComputedStyle(dot).backgroundColor).toBe(tabColor);
		// on the white bar the markers keep the palette's colors
		const white = within(bars[0]).getByRole("tab", { name: "Both" });
		const whiteIcon = within(white).getByTestId("ErrorOutlinedIcon");
		await expect(getComputedStyle(whiteIcon).color).not.toBe(
			getComputedStyle(white).color,
		);
	},
};
