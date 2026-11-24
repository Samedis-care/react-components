import React, { useCallback, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fireEvent, fn, waitFor, within } from "storybook/test";
import {
	Button,
	createTheme,
	CssBaseline,
	Grid,
	ThemeProvider,
	Typography,
} from "@mui/material";
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
import {
	Model,
	ModelGetResponse,
	ModelUnknown,
} from "../../backend-integration";
import FullFormDialog from "./FormDialog";

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

/**
 * The people connector, holding every save until finish() is called
 */
class HeldSaveConnector extends MockConnector {
	private held: (() => void)[] = [];

	// MockConnector's update is typed as synchronous, Connector's may return a promise
	update(data: Record<string, unknown>) {
		return new Promise<ModelGetResponse<ModelUnknown>>((resolve) => {
			this.held.push(() => resolve(super.update(data)));
		}) as never;
	}

	/**
	 * Finishes the saves held so far
	 */
	finish() {
		this.held.splice(0).forEach((save) => save());
	}
}

/**
 * PersonPage whose saves wait until "Finish saving" is pressed
 */
const HeldSaveStory = (props: { goBack: () => void }) => {
	const { goBack } = props;
	const connector = useMemo(() => new HeldSaveConnector(sampleData), []);
	const model = useMemo(
		() =>
			new Model(
				"u45-story-people-" + String(modelCounter++),
				createTestModel().fields,
				connector,
			),
		[connector],
	);
	const customProps = useMemo(() => ({ goBack }), [goBack]);
	const finish = useCallback(() => connector.finish(), [connector]);
	return (
		<>
			<Button onClick={finish}>Finish saving</Button>
			<Form
				model={model}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={customProps}
				disableRouting
			>
				{PersonPage}
			</Form>
		</>
	);
};

/**
 * ISSUE-3473-ITEM-10: Save pressed by keyboard keeps the focus while the form saves and
 * afterwards. Save is unavailable then, but stays focusable (`aria-disabled`, not the native
 * `disabled`), so the browser does not move the focus to the page, and the tooltip says why
 * Save is unavailable while it has keyboard focus.
 */
export const Issue3473Item10SaveKeepsFocus: StoryObj<PageArgs> = {
	args: { goBack: fn() },
	parameters: { a11y: { test: "error" } },
	render: (args) => <HeldSaveStory goBack={args.goBack} />,
	play: async ({ canvas, userEvent }) => {
		const input = await canvas.findByDisplayValue("Alice", undefined, LOAD);
		await userEvent.type(input, "X");
		const save = canvas.getByRole("button", { name: "Save" });
		await waitFor(() => expect(save).not.toHaveAttribute("aria-disabled"));
		save.focus();
		await userEvent.keyboard("{Enter}");

		await waitFor(() => expect(input).toBeDisabled());
		await expect(save).toHaveFocus();
		await expect(save).toHaveAttribute("aria-disabled", "true");
		// the tooltip is in a portal, outside the story's canvas
		await expect(
			await within(document.body).findByRole("tooltip", undefined, LOAD),
		).toHaveTextContent("The form is currently being saved");

		// a click on Finish saving that leaves the focus where it is
		await fireEvent.click(
			canvas.getByRole("button", { name: "Finish saving" }),
		);
		await waitFor(() => expect(input).toBeEnabled());
		await expect(save).toHaveFocus();
		await expect(save).toHaveAttribute("aria-disabled", "true");
		// saved: no reason left to show
		await waitFor(() =>
			expect(within(document.body).queryByRole("tooltip")).toBeNull(),
		);
	},
};

/**
 * ISSUE-3503-ITEM-16: while a save is pending Back is disabled, and it looks disabled: its
 * background is no longer the grey of the enabled Back.
 */
export const Issue3503Item16DisabledBackLooksDisabled: StoryObj<PageArgs> = {
	args: { goBack: fn() },
	parameters: { a11y: { test: "error" } },
	render: (args) => <HeldSaveStory goBack={args.goBack} />,
	play: async ({ canvas, userEvent }) => {
		const first = await canvas.findByDisplayValue("Alice", undefined, LOAD);
		const idle = getComputedStyle(
			canvas.getByRole("button", { name: "Back" }),
		).backgroundColor;
		await userEvent.type(first, "X");
		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Back" })).toBeDisabled(),
		);
		// waitFor: Back fades to its disabled colors (MUI's transition)
		await waitFor(() =>
			expect(
				getComputedStyle(canvas.getByRole("button", { name: "Back" }))
					.backgroundColor,
				"the disabled Back has the background of the enabled one",
			).not.toBe(idle),
		);
	},
};

/**
 * The background and text of a button as drawn
 */
const buttonLook = (button: HTMLElement) => {
	const style = getComputedStyle(button);
	return { background: style.backgroundColor, text: style.color };
};

/**
 * ISSUE-3503-ITEM-16: while a save is pending the disabled Back looks like the disabled Save,
 * background and text, and once the save is done it has its own grey again.
 */
export const Issue3503Item16DisabledBackLooksLikeDisabledSave: StoryObj<PageArgs> =
	{
		args: { goBack: fn() },
		parameters: { a11y: { test: "error" } },
		render: (args) => <HeldSaveStory goBack={args.goBack} />,
		play: async ({ canvas, userEvent }) => {
			const first = await canvas.findByDisplayValue("Alice", undefined, LOAD);
			const back = canvas.getByRole("button", { name: "Back" });
			const save = canvas.getByRole("button", { name: "Save" });
			const idle = buttonLook(back);
			await userEvent.type(first, "X");
			await userEvent.click(save);
			await waitFor(() => expect(back).toBeDisabled());
			// waitFor: both buttons fade to their disabled colors (MUI's transition)
			await waitFor(() =>
				expect(
					buttonLook(back),
					"the disabled Back looks like the disabled Save",
				).toEqual(buttonLook(save)),
			);
			await expect(buttonLook(back).text).not.toBe(idle.text);

			await fireEvent.click(
				canvas.getByRole("button", { name: "Finish saving" }),
			);
			await waitFor(() => expect(back).toBeEnabled());
			await waitFor(() =>
				expect(buttonLook(back), "Back has its grey again").toEqual(idle),
			);
		},
	};

/**
 * Tooltips appear at once and, when they close, stay fully opaque for a minute before they
 * vanish, so the play and the accessibility check after it see a tooltip that is closing
 */
const SLOW_TOOLTIP_EXIT_THEME = createTheme({
	components: {
		MuiTooltip: {
			defaultProps: {
				slotProps: {
					transition: {
						timeout: { enter: 0, exit: 60000 },
						easing: { exit: "step-end" },
					},
				},
			},
		},
	},
});

/**
 * ISSUE-3503-ITEM-29: the reason tooltip that is open when a save ends keeps its text while
 * it closes, so it never fades out as an empty bubble without a name (axe
 * `aria-tooltip-name`, which runs after the play while the tooltip is still closing).
 */
export const Issue3503Item29SaveTooltipKeepsTextWhileClosing: StoryObj<PageArgs> =
	{
		args: { goBack: fn() },
		parameters: { a11y: { test: "error" } },
		render: (args) => (
			<ThemeProvider theme={SLOW_TOOLTIP_EXIT_THEME}>
				<HeldSaveStory goBack={args.goBack} />
			</ThemeProvider>
		),
		play: async ({ canvas, userEvent }) => {
			const input = await canvas.findByDisplayValue("Alice", undefined, LOAD);
			await userEvent.type(input, "X");
			const save = canvas.getByRole("button", { name: "Save" });
			await waitFor(() => expect(save).not.toHaveAttribute("aria-disabled"));
			save.focus();
			await userEvent.keyboard("{Enter}");
			// the tooltip is in a portal, outside the story's canvas
			await expect(
				await within(document.body).findByRole("tooltip", undefined, LOAD),
			).toHaveAccessibleName("The form is currently being saved");

			// a click on Finish saving that leaves the focus where it is
			await fireEvent.click(
				canvas.getByRole("button", { name: "Finish saving" }),
			);
			// saved: Save has no reason left, and its tooltip closes
			await waitFor(() => expect(save).toHaveAccessibleDescription(""));
			await expect(save.parentElement).not.toHaveAttribute("aria-describedby");
			// still on the page while it closes, with the text it showed
			const closing = within(document.body).getByRole("tooltip");
			await expect(closing).toHaveTextContent(
				"The form is currently being saved",
			);
			await expect(closing).toHaveAccessibleName(
				"The form is currently being saved",
			);
		},
	};

const LONG_DIALOG_TITLE =
	"Hochfrequenzchirurgiegerät Modell XYZ-2000 Sicherheitsmeldung Rückruf Charge 2026-17 Ersatzteile";

interface OpenInNewArgs {
	/**
	 * FullFormDialog's openInNewLink, called by the "Open in new tab" button
	 */
	openInNewLink: () => void;
}

/**
 * ISSUE-3503-ITEM-18: with `openInNewLink` a FullFormDialog shows an "Open in new tab" button in
 * its title row, before the close button. Tab reaches it and Enter activates it. It is not part
 * of the heading, so the dialog is named by its title alone, and at 320px a long title does not
 * push it out of the dialog.
 */
export const Issue3503Item18OpenInNewIsAButton: StoryObj<OpenInNewArgs> = {
	args: { openInNewLink: fn() },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<FullFormDialog
			dialogTitle={LONG_DIALOG_TITLE}
			openInNewLink={args.openInNewLink}
			maxWidth="md"
		>
			<Typography>The form.</Typography>
		</FullFormDialog>
	),
	play: async ({ args, userEvent }) => {
		// the dialog is in a portal, outside the story's canvas
		const dialog = await within(document.body).findByRole(
			"dialog",
			{ name: LONG_DIALOG_TITLE },
			LOAD,
		);
		await waitFor(() => expect(dialog).toBeVisible());
		const button = within(dialog).getByRole("button", {
			name: "Open in new tab",
		});
		await expect(
			within(dialog).getByRole("heading", { name: LONG_DIALOG_TITLE }),
		).not.toContainElement(button);
		// inside the dialog, and nothing scrolls sideways
		const paperBox = dialog.getBoundingClientRect();
		const buttonBox = button.getBoundingClientRect();
		await expect({
			left: buttonBox.left >= paperBox.left,
			right: buttonBox.right <= paperBox.right,
		}).toEqual({ left: true, right: true });
		await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);

		// MUI's focus trap focuses the dialog's container when it opens; Tab goes to the button
		// first
		await waitFor(() =>
			expect(document.activeElement?.contains(dialog)).toBe(true),
		);
		await userEvent.tab();
		await expect(button).toHaveFocus();
		await waitFor(() => expect(button).toHaveClass("Mui-focusVisible"));
		await expect(getComputedStyle(button).outlineStyle).toBe("solid");
		await userEvent.keyboard("{Enter}");
		await expect(args.openInNewLink).toHaveBeenCalledTimes(1);
	},
};
