import React, { useCallback, useContext, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fireEvent, fn, waitFor, within } from "storybook/test";
import {
	Box,
	Button,
	createTheme,
	CssBaseline,
	decomposeColor,
	getContrastRatio,
	Grid,
	hexToRgb,
	IconButton,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { Edit, MoreVert } from "@mui/icons-material";
import { createMemoryHistory } from "history";
import { Framework, useDialogContext } from "../../framework";
import { setFrameworkHistory } from "../../framework/History";
import Form, {
	FormContext,
	FormContextLite,
	PageProps,
	useFormContextLite,
} from "./Form";
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
import {
	BackActionButton,
	BackButtonDefaultColorClass,
} from "./DefaultFormPageButtons";
import useSetFormDialogTitle from "./useSetFormDialogTitle";
import useSetFormDialogTitleAction from "./useSetFormDialogTitleAction";
import { PageTitle } from "../../non-standalone/PageTitle";

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

// Synthetic pointer events never match :hover; hoverLook gives the button this class instead
const FORCED_HOVER = "story-forced-hover";

/**
 * The background and text of a button under a pointer: every `:hover` rule of the page is
 * copied right after itself with `:hover` replaced by a class the button gets for the reading,
 * so the cascade stays as it is. The copies are removed again.
 */
const hoverLook = (button: HTMLElement) => {
	const copies: [CSSStyleSheet | CSSGroupingRule, CSSRule][] = [];
	const copyHoverRules = (parent: CSSStyleSheet | CSSGroupingRule) => {
		for (let index = parent.cssRules.length - 1; index >= 0; index--) {
			const rule = parent.cssRules[index];
			if (
				rule instanceof CSSStyleRule &&
				rule.selectorText.includes(":hover")
			) {
				parent.insertRule(
					rule.cssText.replaceAll(":hover", `.${FORCED_HOVER}`),
					index + 1,
				);
				copies.push([parent, parent.cssRules[index + 1]]);
			} else if (rule instanceof CSSGroupingRule) copyHoverRules(rule);
		}
	};
	for (const sheet of Array.from(document.styleSheets)) copyHoverRules(sheet);
	// MUI's transition would report the color it starts from
	button.style.transition = "none";
	button.classList.add(FORCED_HOVER);
	const look = buttonLook(button);
	button.classList.remove(FORCED_HOVER);
	buttonLook(button); // back at rest before the transition returns
	button.style.transition = "";
	for (const [parent, copy] of copies)
		parent.deleteRule(Array.from(parent.cssRules).indexOf(copy));
	return look;
};

/**
 * The contrast of a button's text, also a translucent one, laid over its background
 */
const textContrast = ({
	background,
	text,
}: {
	background: string;
	text: string;
}) => {
	const [r, g, b, a = 1] = decomposeColor(text).values;
	const fill = decomposeColor(background).values;
	const shown = [r, g, b].map((channel, i) =>
		Math.round(channel * a + fill[i] * (1 - a)),
	);
	return getContrastRatio(`rgb(${shown.join(", ")})`, background);
};

/**
 * Checks the default Back of a loaded PersonPage under the pointer: filled `hover` (MUI's
 * contained `color="inherit"` hover grey), not its resting grey, with readable text
 */
const expectBackHover = async (back: HTMLElement, hover: string) => {
	const rest = buttonLook(back);
	const hovered = hoverLook(back);
	await expect(
		hovered.background,
		"Back looks the same under the pointer as at rest",
	).not.toBe(rest.background);
	await expect(hovered.background, "Back's hover fill").toBe(hexToRgb(hover));
	await expect(
		textContrast(hovered),
		"Back's text on its hover fill",
	).toBeGreaterThanOrEqual(4.5);
};

/**
 * ISSUE-3503-ITEM-28: under a pointer the default Back button turns MUI's hover grey for a
 * contained button without a palette color (`grey.A100`), as Save next to it shows its own
 * hover, and its text stays readable.
 */
export const Issue3503Item28BackButtonHover: StoryObj<PageArgs> = {
	args: { goBack: fn() },
	parameters: { a11y: { test: "error" } },
	render: (args) => <PageStory page={PersonPage} goBack={args.goBack} />,
	play: async ({ canvas }) => {
		await canvas.findByDisplayValue("Alice", undefined, LOAD);
		await expectBackHover(
			canvas.getByRole("button", { name: "Back" }),
			createTheme().palette.grey.A100,
		);
	},
};

/**
 * ISSUE-3503-ITEM-28: in the dark palette the default Back button turns `grey[700]` under a
 * pointer, MUI's hover grey there, and its text stays readable.
 */
export const Issue3503Item28BackButtonHoverDark: StoryObj<PageArgs> = {
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
		await expectBackHover(
			canvas.getByRole("button", { name: "Back" }),
			DARK_THEME.palette.grey[700],
		);
	},
};

/**
 * An app theme that paints the default Back button primary, with its own hover fill when
 * `hover` is set
 */
const primaryBackTheme = (hover: boolean) =>
	createTheme({
		components: {
			CcDefaultFormPageButtons: {
				styleOverrides: {
					backButton: ({ theme }) => ({
						[`&.${BackButtonDefaultColorClass}:not(.Mui-disabled)`]: {
							backgroundColor: theme.palette.primary.main,
							color: theme.palette.primary.contrastText,
							...(hover && {
								"&:hover": { backgroundColor: theme.palette.primary.dark },
							}),
						},
					}),
				},
			},
		},
	});
const PRIMARY_BACK = primaryBackTheme(false);
const PRIMARY_BACK_WITH_HOVER = primaryBackTheme(true);

interface BackButtonArgs {
	/**
	 * Called by each Back button
	 */
	onClick: () => void;
}

/**
 * ISSUE-3503-ITEM-28: a theme that restyles the default Back button with
 * `&.${BackButtonDefaultColorClass}:not(.Mui-disabled)` in
 * `CcDefaultFormPageButtons.styleOverrides.backButton` keeps its fill and text under the
 * pointer (left, never the grey hover under its own text), and a `&:hover` in that rule gives
 * it a hover of its own (right).
 */
export const Issue3503Item28ThemedBackButtonHover: StoryObj<BackButtonArgs> = {
	args: { onClick: fn() },
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<Box sx={{ display: "flex", gap: 2 }}>
			<ThemeProvider theme={PRIMARY_BACK}>
				<BackActionButton fullWidth={false} onClick={args.onClick}>
					Back
				</BackActionButton>
			</ThemeProvider>
			<ThemeProvider theme={PRIMARY_BACK_WITH_HOVER}>
				<BackActionButton fullWidth={false} onClick={args.onClick}>
					Cancel
				</BackActionButton>
			</ThemeProvider>
		</Box>
	),
	play: async ({ canvas }) => {
		const { primary } = PRIMARY_BACK.palette;
		const back = canvas.getByRole("button", { name: "Back" });
		await expect(buttonLook(back), "the themed Back at rest").toEqual({
			background: hexToRgb(primary.main),
			text: hexToRgb(primary.contrastText),
		});
		await expect(
			hoverLook(back),
			"the themed Back without a hover of its own keeps its look",
		).toEqual(buttonLook(back));
		const cancel = canvas.getByRole("button", { name: "Cancel" });
		await expect(hoverLook(cancel), "the theme's own hover").toEqual({
			background: hexToRgb(primary.dark),
			text: hexToRgb(primary.contrastText),
		});
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

/**
 * Checks that the floating labels of the first row of fields start inside the dialog's
 * content, which cuts off what lies above its top edge
 * @param dialog The dialog (its paper)
 */
const expectFirstRowLabelsInside = async (dialog: HTMLElement) => {
	await within(dialog).findByDisplayValue("Alice", undefined, LOAD);
	const content = dialog.querySelector(".MuiDialogContent-root");
	const top = content?.getBoundingClientRect().top;
	for (const name of ["First Name", "Last Name"]) {
		const label = within(dialog).getByText(new RegExp("^" + name), {
			selector: "label",
		});
		await expect(
			label.getBoundingClientRect().top,
			`the ${name} label starts above the top edge of the dialog content`,
		).toBeGreaterThanOrEqual(top ?? Infinity);
	}
};

/**
 * A button "Edit person" that pushes a FullFormDialog titled "Edit person" with the person form
 */
const DialogOpener = (props: { goBack?: () => void }) => {
	const [pushDialog, popDialog] = useDialogContext();
	const model = useMemo(makeModel, []);
	const open = () =>
		pushDialog(
			<FullFormDialog dialogTitle={"Edit person"}>
				<Form
					model={model}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={{ goBack: props.goBack ?? popDialog }}
					disableRouting
				>
					{PersonPage}
				</Form>
			</FullFormDialog>,
		);
	return <Button onClick={open}>Edit person</Button>;
};

/**
 * ISSUE-3503-ITEM-19: in a FullFormDialog the content has no top padding, so the floating labels of
 * the first row of outlined fields are cut in half.
 */
export const Issue3503Item19DialogFieldLabelsNotClipped: StoryObj = {
	parameters: { a11y: { test: "error" } },
	render: () => <DialogOpener />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Edit person" }));
		// the dialog is in a portal, outside the story's canvas
		const dialog = await within(document.body).findByRole("dialog", {
			name: /Edit person/,
		});
		await expectFirstRowLabelsInside(dialog);
	},
};

interface LabelDialogArgs extends PageArgs {
	/**
	 * FullFormDialog's dialogTitle; none for a dialog without a title, named by its aria-label
	 */
	dialogTitle?: string;
	/**
	 * FullFormDialog's useCustomClasses: the content is 80vh tall
	 */
	useCustomClasses: boolean;
}

/**
 * The person form in a FullFormDialog named "Edit person", rendered without pushDialog
 */
const PersonFormDialog = (props: LabelDialogArgs) => {
	const { dialogTitle, useCustomClasses, goBack } = props;
	const model = useMemo(makeModel, []);
	const customProps = useMemo(() => ({ goBack }), [goBack]);
	return (
		<FullFormDialog
			dialogTitle={dialogTitle}
			aria-label={"Edit person"}
			useCustomClasses={useCustomClasses}
		>
			<Form
				model={model}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={customProps}
				disableRouting
			>
				{PersonPage}
			</Form>
		</FullFormDialog>
	);
};

/**
 * ISSUE-3503-ITEM-19: without a title the content starts at the top edge of the dialog, and the
 * floating labels of its first row of fields start inside it too.
 */
export const Issue3503Item19UntitledDialogFieldLabelsNotClipped: StoryObj<LabelDialogArgs> =
	{
		args: { goBack: fn(), useCustomClasses: false },
		parameters: { a11y: { test: "error" } },
		render: (args) => <PersonFormDialog {...args} />,
		play: async () => {
			// the dialog is in a portal, outside the story's canvas
			const dialog = await within(document.body).findByRole(
				"dialog",
				{ name: "Edit person" },
				LOAD,
			);
			await expectFirstRowLabelsInside(dialog);
		},
	};

/**
 * ISSUE-3503-ITEM-19: the tall content of `useCustomClasses` keeps the labels of its first row of
 * fields inside it too.
 */
export const Issue3503Item19TallDialogFieldLabelsNotClipped: StoryObj<LabelDialogArgs> =
	{
		args: { goBack: fn(), dialogTitle: "Edit person", useCustomClasses: true },
		parameters: { a11y: { test: "error" } },
		render: (args) => <PersonFormDialog {...args} />,
		play: async () => {
			// the dialog is in a portal, outside the story's canvas
			const dialog = await within(document.body).findByRole(
				"dialog",
				{ name: "Edit person" },
				LOAD,
			);
			await expectFirstRowLabelsInside(dialog);
		},
	};

/**
 * The people connector, whose read answers after `delay` milliseconds
 */
class SlowReadConnector extends MockConnector {
	private readonly delay: number;

	constructor(data: Record<string, unknown>[], delay: number) {
		super(data);
		this.delay = delay;
	}

	// MockConnector's read is typed as synchronous, Connector's may return a promise
	read(id: string) {
		const delayed = new Promise<void>((resolve) =>
			setTimeout(resolve, this.delay),
		);
		return delayed.then(() => super.read(id)) as never;
	}
}

/**
 * PersonPage with a PageTitle, which inside a FullFormDialog becomes the dialog's title
 */
const TitledPersonPage = (props: PageProps<PeopleModel, PageArgs>) => (
	<DefaultFormPage {...props} customProps={crudProps(props)}>
		<PageTitle>Edit person</PageTitle>
		<PersonFields />
	</DefaultFormPage>
);

interface LateTitleArgs extends PageArgs {
	/**
	 * How long the record takes to load, in milliseconds
	 */
	loadDelay: number;
	/**
	 * FullFormDialog's onClose
	 */
	onClose: () => void;
}

/**
 * A FullFormDialog without dialogTitle around a form whose page sets the title once the record
 * has loaded
 */
const LateTitleDialog = (props: LateTitleArgs) => {
	const { loadDelay, goBack, onClose } = props;
	const model = useMemo(
		() =>
			new Model(
				"u45-story-people-" + String(modelCounter++),
				createTestModel().fields,
				new SlowReadConnector(sampleData, loadDelay),
			),
		[loadDelay],
	);
	const customProps = useMemo(() => ({ goBack }), [goBack]);
	return (
		<FullFormDialog onClose={onClose}>
			<Form
				model={model}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={customProps}
				disableRouting
			>
				{TitledPersonPage}
			</Form>
		</FullFormDialog>
	);
};

/**
 * A button "Open person" that pushes the LateTitleDialog
 */
const LateTitleOpener = (props: LateTitleArgs) => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(
		() => pushDialog(<LateTitleDialog {...props} />),
		[pushDialog, props],
	);
	return <Button onClick={open}>Open person</Button>;
};

/**
 * FOLLOWUP-DIALOG-LATE-TITLE: a FullFormDialog without `dialogTitle` whose form page sets the
 * dialog's title with a `PageTitle` once its record has loaded (after `loadDelay` ms). The dialog
 * opens with the focus on itself and no name, as the form is still loading, so a screen reader
 * says only "dialog". Once the title shows, the focus moves on to it and the screen reader reads
 * the title. Tab goes on to the close button, as it does from the dialog.
 */
export const FollowupDialogLateTitleTakesFocus: StoryObj<LateTitleArgs> = {
	args: { loadDelay: 2000, goBack: fn(), onClose: fn() },
	parameters: { a11y: { test: "error" } },
	render: (args) => <LateTitleOpener {...args} />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Open person" }));
		// the dialog is in a portal, outside the story's canvas
		const dialog = await within(document.body).findByRole(
			"dialog",
			undefined,
			LOAD,
		);
		// while the record loads, the dialog has the focus and no name
		await waitFor(() => expect(dialog).toHaveFocus());
		await expect(dialog).toHaveAccessibleName("");

		const heading = await within(dialog).findByRole(
			"heading",
			{ name: "Edit person" },
			LOAD,
		);
		await expect(dialog).toHaveAccessibleName("Edit person");
		await waitFor(() => expect(heading).toHaveFocus());
		await userEvent.tab();
		await expect(
			within(dialog).getByRole("button", { name: "Close" }),
		).toHaveFocus();
	},
};

interface TitleActionArgs extends LateTitleArgs {
	/**
	 * Called by the Edit button in the dialog's title row, with the e-mail of the form's record
	 */
	onEdit: (email: unknown) => void;
	/**
	 * FullFormDialog's openInNewLink, called by the "Open in new tab" button
	 */
	openInNewLink: () => void;
}

/**
 * The Edit button of the title row: it reads the form it is set by, through the context the
 * page wraps it in
 */
const EditPersonButton = (props: { onEdit: (email: unknown) => void }) => {
	const { onEdit } = props;
	const { getFieldValue } = useFormContextLite<ModelUnknown>();
	const edit = useCallback(
		() => onEdit(getFieldValue("email")),
		[onEdit, getFieldValue],
	);
	return (
		<IconButton aria-label={"Edit"} onClick={edit}>
			<Edit />
		</IconButton>
	);
};

/**
 * Sets the Edit and More buttons as the dialog's title-row controls, in the form's contexts:
 * the title row is rendered by the dialog, outside the form
 */
const PersonTitleActions = (props: { onEdit: (email: unknown) => void }) => {
	const { onEdit } = props;
	const formContext = useContext(FormContext);
	const formContextLite = useContext(FormContextLite);
	const action = useMemo(
		() => (
			<FormContext.Provider value={formContext}>
				<FormContextLite.Provider value={formContextLite}>
					<EditPersonButton onEdit={onEdit} />
					<IconButton aria-label={"More"}>
						<MoreVert />
					</IconButton>
				</FormContextLite.Provider>
			</FormContext.Provider>
		),
		[formContext, formContextLite, onEdit],
	);
	useSetFormDialogTitleAction(true, action);
	return null;
};

/**
 * A FullFormDialog without dialogTitle around a form whose page sets the title (a PageTitle)
 * and the title-row controls once the record has loaded
 */
const TitleActionDialog = (props: TitleActionArgs) => {
	const { loadDelay, goBack, onClose, onEdit, openInNewLink } = props;
	const model = useMemo(
		() =>
			new Model(
				"u45-story-people-" + String(modelCounter++),
				createTestModel().fields,
				new SlowReadConnector(sampleData, loadDelay),
			),
		[loadDelay],
	);
	const customProps = useMemo(() => ({ goBack }), [goBack]);
	const page = useCallback(
		(pageProps: PageProps<PeopleModel, PageArgs>) => (
			<DefaultFormPage {...pageProps} customProps={crudProps(pageProps)}>
				<PageTitle>Edit person</PageTitle>
				<PersonTitleActions onEdit={onEdit} />
				<PersonFields />
			</DefaultFormPage>
		),
		[onEdit],
	);
	return (
		<FullFormDialog onClose={onClose} openInNewLink={openInNewLink}>
			<Form
				model={model}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={customProps}
				disableRouting
			>
				{page}
			</Form>
		</FullFormDialog>
	);
};

/**
 * A button "Open person" that pushes the TitleActionDialog
 */
const TitleActionOpener = (props: TitleActionArgs) => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(
		() => pushDialog(<TitleActionDialog {...props} />),
		[pushDialog, props],
	);
	return <Button onClick={open}>Open person</Button>;
};

/**
 * FOLLOWUP-DIALOG-TITLE-ACTION: the form page in a FullFormDialog sets the dialog's title with a
 * `PageTitle` and its Edit and More buttons with `useSetFormDialogTitleAction`, once its record
 * has loaded (after `loadDelay` ms). The buttons show in the title row after the title, before
 * "Open in new tab" and Close, outside the heading: the dialog is named "Edit person" alone, and
 * the title takes the focus as it shows. Tab reaches Edit, More, "Open in new tab" and Close,
 * in that order. Edit reads the form's record through the form contexts the page wraps it in.
 */
export const FollowupDialogTitleActionOutsideHeading: StoryObj<TitleActionArgs> =
	{
		args: {
			loadDelay: 1000,
			goBack: fn(),
			onClose: fn(),
			onEdit: fn(),
			openInNewLink: fn(),
		},
		parameters: { a11y: { test: "error" } },
		render: (args) => <TitleActionOpener {...args} />,
		play: async ({ args, canvas, userEvent }) => {
			await userEvent.click(
				canvas.getByRole("button", { name: "Open person" }),
			);
			// the dialog is in a portal, outside the story's canvas
			const dialog = await within(document.body).findByRole(
				"dialog",
				undefined,
				LOAD,
			);
			const heading = await within(dialog).findByRole(
				"heading",
				{ name: "Edit person" },
				LOAD,
			);
			const edit = within(dialog).getByRole("button", { name: "Edit" });
			// the title takes the focus, and is read without the buttons
			await waitFor(() => expect(heading).toHaveFocus());
			await expect(dialog).toHaveAccessibleName("Edit person");
			// Chromium names the dialog with the buttons inside the element it is labelled by too
			await expect(
				document.getElementById(dialog.getAttribute("aria-labelledby") ?? ""),
			).toBe(heading);
			await expect(heading).toHaveTextContent(/^Edit person$/);
			await expect(within(heading).queryAllByRole("button")).toHaveLength(0);
			// beside the title, on its line
			const headingBox = heading.getBoundingClientRect();
			const editBox = edit.getBoundingClientRect();
			await expect({
				right: editBox.left >= headingBox.right,
				centered:
					Math.abs(
						editBox.top +
							editBox.height / 2 -
							(headingBox.top + headingBox.height / 2),
					) < 1,
			}).toEqual({ right: true, centered: true });

			const order: (string | null)[] = [];
			for (let i = 0; i < 4; i++) {
				await userEvent.tab();
				order.push(document.activeElement?.getAttribute("aria-label") ?? null);
			}
			await expect(order).toEqual(["Edit", "More", "Open in new tab", "Close"]);
			await userEvent.tab({ shift: true });
			await userEvent.tab({ shift: true });
			await userEvent.tab({ shift: true });
			await expect(edit).toHaveFocus();
			await userEvent.keyboard("{Enter}");
			await expect(args.onEdit).toHaveBeenCalledWith("alice@example.com");
		},
	};

const titleRowActions = (
	<>
		<IconButton aria-label={"Edit"}>
			<Edit />
		</IconButton>
		<IconButton aria-label={"More"}>
			<MoreVert />
		</IconButton>
	</>
);

/**
 * Content that sets the dialog's title and its Edit and More buttons
 */
const TitleAndActions = (props: { title: string }) => {
	useSetFormDialogTitle(true, props.title);
	useSetFormDialogTitleAction(true, titleRowActions);
	return <Typography>The form.</Typography>;
};

/**
 * FOLLOWUP-DIALOG-TITLE-ACTION: at 320px the Edit and More buttons the content sets, "Open in new
 * tab" and Close don't fit beside the long title. They move below it, at the end of the row, so
 * the title keeps the width of the dialog, and nothing scrolls sideways.
 */
export const FollowupDialogTitleActionWrapsOnPhone: StoryObj<OpenInNewArgs> = {
	args: { openInNewLink: fn() },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<FullFormDialog openInNewLink={args.openInNewLink} maxWidth="md">
			<TitleAndActions title={"Hochfrequenzchirurgiegerät bearbeiten"} />
		</FullFormDialog>
	),
	play: async () => {
		// the dialog is in a portal, outside the story's canvas
		const dialog = await within(document.body).findByRole(
			"dialog",
			{ name: "Hochfrequenzchirurgiegerät bearbeiten" },
			LOAD,
		);
		await waitFor(() => expect(dialog).toBeVisible());
		const heading = within(dialog).getByRole("heading");
		const paperBox = dialog.getBoundingClientRect();
		const headingBox = heading.getBoundingClientRect();
		const boxes = ["Edit", "More", "Open in new tab", "Close"].map((name) =>
			within(dialog).getByRole("button", { name }).getBoundingClientRect(),
		);
		const centerY = (box: DOMRect) => box.top + box.height / 2;
		await expect({
			// below the title, on one line, inside the dialog
			below: boxes.every((box) => box.top >= headingBox.bottom),
			oneLine: boxes.every(
				(box) => Math.abs(centerY(box) - centerY(boxes[0])) < 1,
			),
			inside: boxes.every(
				(box) => box.left >= paperBox.left && box.right <= paperBox.right,
			),
			// the title has the width of the dialog, less its padding
			titleWidth: headingBox.width >= paperBox.width - 2 * 24 - 1,
		}).toEqual({ below: true, oneLine: true, inside: true, titleWidth: true });
		await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
	},
};

const MANY_ACTIONS = ["Edit", "Copy", "Print", "Share", "Archive", "More"];

const manyTitleRowActions = (
	<>
		{MANY_ACTIONS.map((name) => (
			<IconButton key={name} aria-label={name}>
				<MoreVert />
			</IconButton>
		))}
	</>
);

/**
 * Content that sets the dialog's title and six buttons beside it
 */
const TitleAndManyActions = (props: { title: string }) => {
	useSetFormDialogTitle(true, props.title);
	useSetFormDialogTitleAction(true, manyTitleRowActions);
	return <Typography>The form.</Typography>;
};

/**
 * FOLLOWUP-DIALOG-TITLE-ACTION: at 320px six buttons the content sets and "Open in new tab" don't
 * fit on one line below the title either: they wrap onto a second line, and Close stays beside
 * them, inside the dialog.
 */
export const FollowupDialogTitleActionManyOnPhone: StoryObj<OpenInNewArgs> = {
	args: { openInNewLink: fn() },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<FullFormDialog openInNewLink={args.openInNewLink} maxWidth="md">
			<TitleAndManyActions title={"Edit device"} />
		</FullFormDialog>
	),
	play: async () => {
		// the dialog is in a portal, outside the story's canvas
		const dialog = await within(document.body).findByRole(
			"dialog",
			{ name: "Edit device" },
			LOAD,
		);
		await waitFor(() => expect(dialog).toBeVisible());
		const paperBox = dialog.getBoundingClientRect();
		const box = (name: string) =>
			within(dialog).getByRole("button", { name }).getBoundingClientRect();
		const actions = [...MANY_ACTIONS, "Open in new tab"].map(box);
		const close = box("Close");
		await expect({
			wrapped: new Set(actions.map((a) => Math.round(a.top))).size > 1,
			// beside the buttons, not on a line of its own below them
			closeBeside:
				actions.every((a) => close.left >= a.right) &&
				close.top < Math.max(...actions.map((a) => a.bottom)),
			inside: [...actions, close].every(
				(b) => b.left >= paperBox.left && b.right <= paperBox.right,
			),
		}).toEqual({ wrapped: true, closeBeside: true, inside: true });
		await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
	},
};
