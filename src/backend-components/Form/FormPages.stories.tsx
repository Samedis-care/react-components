import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn } from "storybook/test";
import { createTheme, CssBaseline, Grid, ThemeProvider } from "@mui/material";
import { createMemoryHistory } from "history";
import { Framework } from "../../framework";
import { setFrameworkHistory } from "../../framework/History";
import Form, { PageProps } from "./Form";
import FormField from "./Field";
import DefaultFormPage from "./DefaultFormPage";
import DefaultErrorComponent from "./DefaultErrorComponent";
import createTestModel, {
	sampleData,
} from "../../stories/test-utils/TestModel";
import MockConnector from "../../stories/test-utils/MockConnector";
import { Model } from "../../backend-integration";

// a dirty form page blocks the history; keep that away from the Storybook frame's own
setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<Story />
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/Form/Pages",
	decorators: [FrameworkDecorator],
	parameters: {
		docs: {
			description: {
				component:
					'A form page is the root of the page component a `Form` renders. `DefaultFormPage` adds the standard footer (Save, `extraButtons`, Back when `customProps.goBack` exists) and guards unsaved changes: leaving through Back, a navigation, closing the tab or closing a `FullFormDialog` asks "Leave form page?" first. `EditOnlyFormPage` is the same without Back; `BasicFormPage` takes your own footer component. `FullFormDialog` shows a form page (or any content) in a dialog opened with `pushDialog`.',
			},
		},
	},
};

export default meta;

let modelCounter = 0;

/**
 * The people model of the stories, with its own id per call
 */
const makeModel = () =>
	new Model(
		"u45-story-people-" + String(modelCounter++),
		createTestModel().fields,
		new MockConnector(sampleData),
	);

type PeopleModel = ReturnType<typeof createTestModel>;

interface PageArgs {
	/**
	 * The Form's goBack, called by Back (after "Leave form page?" on a dirty form)
	 */
	goBack: () => void;
}

const PersonFields = () => (
	<Grid container spacing={2}>
		<Grid size={{ xs: 6 }}>
			<FormField name="first_name" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="last_name" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="email" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="department" />
		</Grid>
	</Grid>
);

const crudProps = (props: PageProps<PeopleModel, PageArgs>) => ({
	...props.customProps,
	open: () => {},
	hasCustomSubmitHandler: false,
});

const PersonPage = (props: PageProps<PeopleModel, PageArgs>) => (
	<DefaultFormPage {...props} customProps={crudProps(props)}>
		<PersonFields />
	</DefaultFormPage>
);

const PageStory = (props: {
	page: React.ComponentType<PageProps<PeopleModel, PageArgs>>;
	goBack: () => void;
}) => {
	const { page, goBack } = props;
	const model = useMemo(makeModel, []);
	return (
		<Form
			model={model}
			id={"1"}
			errorComponent={DefaultErrorComponent}
			customProps={{ goBack }}
			disableRouting
		>
			{page}
		</Form>
	);
};

const LOAD = { timeout: 10000 };

/**
 * ISSUE-3503-ITEM-17: the default Back button is white on #bcbdbf, 1.88:1 (axe `color-contrast`).
 */
export const Issue3503Item17BackButtonContrast: StoryObj<PageArgs> = {
	args: { goBack: fn() },
	// no exception: axe fails "color-contrast" on Back
	parameters: { a11y: { test: "error" } },
	render: (args) => <PageStory page={PersonPage} goBack={args.goBack} />,
	play: async ({ canvas }) => {
		await canvas.findByDisplayValue("Alice", undefined, LOAD);
		await expect(canvas.getByRole("button", { name: "Back" })).toBeVisible();
	},
};

const DARK_THEME = createTheme({ palette: { mode: "dark" } });

/**
 * ISSUE-3503-ITEM-17: the default Back button in the dark palette keeps a text contrast of at
 * least 4.5:1 (axe `color-contrast`).
 */
export const Issue3503Item17BackButtonContrastDark: StoryObj<PageArgs> = {
	args: { goBack: fn() },
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<ThemeProvider theme={DARK_THEME}>
			<CssBaseline />
			<PageStory page={PersonPage} goBack={args.goBack} />
		</ThemeProvider>
	),
	play: async ({ canvas }) => {
		await canvas.findByDisplayValue("Alice", undefined, LOAD);
		await expect(canvas.getByRole("button", { name: "Back" })).toBeVisible();
	},
};
