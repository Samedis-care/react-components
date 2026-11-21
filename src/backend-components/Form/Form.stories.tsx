import React, { useCallback, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import {
	createTheme,
	getContrastRatio,
	Grid,
	ThemeProvider,
} from "@mui/material";
import { Framework } from "../../framework";
import { Form } from "./index";
import FormField from "./Field";
import DefaultFormPage from "./DefaultFormPage";
import DefaultErrorComponent from "./DefaultErrorComponent";
import createTestModel from "../../stories/test-utils/TestModel";
import createMixedControlModel from "../../stories/test-utils/MixedControlModel";
import MockConnector from "../../stories/test-utils/MockConnector";
import {
	Model,
	ModelDataTypeEnumMultiCheckboxRendererMUI,
	ModelDataTypeStringRendererMUI,
	ModelFieldName,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityHidden,
} from "../../backend-integration";
import { PageProps } from "./Form";
import DirtyStateProvider from "./DirtyStateProvider";
import { DirtyStateMarks } from "./DirtyStateContext";

type TestModel = ReturnType<typeof createTestModel>;
type MixedControlModel = ReturnType<typeof createMixedControlModel>;

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<Story />
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/Form",
	decorators: [FrameworkDecorator],
};

export default meta;

interface FormCustomProps {
	goBack: () => void;
	/**
	 * The field the form starts in
	 */
	autoFocus?: ModelFieldName;
}

const FormContent = (props: PageProps<TestModel, FormCustomProps>) => {
	const handleGoBack = useCallback(() => {
		props.customProps.goBack();
	}, [props.customProps]);

	return (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				goBack: handleGoBack,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
			autoBack={false}
		>
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
		</DefaultFormPage>
	);
};

const CreateFormStory = () => {
	const model = useMemo(createTestModel, []);
	const goBack = useCallback(() => {
		// eslint-disable-next-line no-console
		console.log("Go back");
	}, []);
	return (
		<Form
			model={model}
			id={null}
			errorComponent={DefaultErrorComponent}
			customProps={{ goBack }}
			disableRouting
		>
			{FormContent}
		</Form>
	);
};

export const CreateMode: StoryObj = {
	render: () => <CreateFormStory />,
};

const EditFormStory = () => {
	const model = useMemo(createTestModel, []);
	const goBack = useCallback(() => {
		// eslint-disable-next-line no-console
		console.log("Go back");
	}, []);
	return (
		<Form
			model={model}
			id="1"
			errorComponent={DefaultErrorComponent}
			customProps={{ goBack }}
			disableRouting
		>
			{FormContent}
		</Form>
	);
};

export const EditMode: StoryObj = {
	render: () => <EditFormStory />,
};

/**
 * The modified marker across the spread of control families: a text field, an outlined
 * multiline one, a searchable select, a date, an image selector, a radio group, a
 * checkbox and a switch.
 *
 * Edit any of them and a blue dot appears after its label; restore the original value
 * and it goes away again.
 */
const FIELD_SIZES: Partial<Record<ModelFieldName, number>> = { notes: 12 };

/**
 * A field in its own grid cell, tagged with its name
 * @remarks The form engine wraps fields in nothing of its own, so the story marks its
 *          cells to have something to assert against.
 */
const FieldCell = (props: { name: ModelFieldName; autoFocus?: boolean }) => (
	<Grid
		size={{ xs: FIELD_SIZES[props.name] ?? 6 }}
		data-field={props.name}
		key={props.name}
	>
		<FormField name={props.name} autoFocus={props.autoFocus} />
	</Grid>
);

const MIXED_FIELDS: ModelFieldName[] = [
	"first_name",
	"department",
	"notes",
	"start_date",
	"avatar",
	"priority",
	"active",
	"notify",
];

const MixedFormContent = (
	props: PageProps<MixedControlModel, FormCustomProps>,
) => {
	const handleGoBack = useCallback(() => {
		props.customProps.goBack();
	}, [props.customProps]);

	return (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				goBack: handleGoBack,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
			autoBack={false}
		>
			<Grid container spacing={2}>
				{MIXED_FIELDS.map((name) => (
					<FieldCell
						name={name}
						autoFocus={name === props.customProps.autoFocus}
						key={name}
					/>
				))}
			</Grid>
		</DefaultFormPage>
	);
};

/**
 * The fields a change request proposes to modify: saved, so the form is not dirty, but
 * still to be marked
 */
const PROPOSED_CHANGES: DirtyStateMarks = { notes: true };

/**
 * Declared outside the render, as DirtyStateProvider asks for
 */
const mergeProposedChanges = (
	formDirtyFields: DirtyStateMarks,
): DirtyStateMarks => ({ ...formDirtyFields, ...PROPOSED_CHANGES });

const ProposedChangesFormContent = (
	props: PageProps<MixedControlModel, FormCustomProps>,
) => (
	<DirtyStateProvider marks={mergeProposedChanges}>
		<MixedFormContent {...props} />
	</DirtyStateProvider>
);

const MixedFormStory = (props: {
	showDirtyState?: boolean;
	autoFocus?: ModelFieldName;
	content?: React.ComponentType<PageProps<MixedControlModel, FormCustomProps>>;
}) => {
	const model = useMemo(createMixedControlModel, []);
	const goBack = useCallback(() => {
		// eslint-disable-next-line no-console
		console.log("Go back");
	}, []);
	return (
		<Form
			model={model}
			id="1"
			errorComponent={DefaultErrorComponent}
			customProps={{ goBack, autoFocus: props.autoFocus }}
			showDirtyState={props.showDirtyState}
			disableRouting
		>
			{props.content ?? MixedFormContent}
		</Form>
	);
};

/**
 * Reads whether the dirty marker is actually painted on an element, rather than only
 * whether the state attribute says it should be
 */
const hasMarker = (el: Element | null | undefined) =>
	!!el && getComputedStyle(el, "::after").content !== "none";

export const DirtyState: StoryObj = {
	render: () => <MixedFormStory showDirtyState />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const input = await canvas.findByDisplayValue("Alice", undefined, {
			timeout: 10000,
		});
		const find = (selector: string) => canvasElement.querySelector(selector);
		const field = (name: string) => `[data-field="${name}"]`;

		const label = () => find(`${field("first_name")} .MuiFormLabel-root`);
		// an outlined input keeps a second copy of its label inside the gap in its
		// border, and that copy is what sizes the gap
		const notch = (name: string) =>
			find(
				`${field(name)} .MuiOutlinedInput-notchedOutline legend`,
			)?.getBoundingClientRect().width ?? -1;

		await expect(hasMarker(label())).toBe(false);

		const notesNotch = notch("notes");
		const departmentNotch = notch("department");
		await expect(notesNotch).toBeGreaterThan(0);
		// the selector labels itself outside the input, so its notch holds no label -
		// nothing to make room for, and a gap in the border if we did
		await expect(departmentNotch).toBeLessThan(2);

		await userEvent.type(input, "x");
		await waitFor(async () => {
			await expect(hasMarker(label())).toBe(true);
		});

		// a checkbox labels the control, not the FormControl around it — a different
		// selector in the marker styles, so worth its own assertion
		await userEvent.click(canvas.getByRole("checkbox", { name: "Active" }));
		await waitFor(async () => {
			await expect(
				hasMarker(find(`${field("active")} .MuiFormControlLabel-label`)),
			).toBe(true);
		});

		// a selector renders its label as a sibling of the autocomplete rather than
		// inside the text field, so it is marked from BaseSelector's own label
		await userEvent.click(find(`${field("department")} input`)!);
		await userEvent.click(await within(document.body).findByText("Sales"));
		await waitFor(async () => {
			await expect(
				hasMarker(find(`${field("department")} .MuiFormLabel-root`)),
			).toBe(true);
		});
		// ...and its empty notch stays empty
		await expect(notch("department")).toBe(departmentNotch);

		// the outlined variant marks the label inside the notch, which has to widen for
		// the dot or the two overlap
		await userEvent.type(find(`${field("notes")} textarea`)!, "x");
		await waitFor(async () => {
			await expect(
				hasMarker(find(`${field("notes")} .MuiFormLabel-root`)),
			).toBe(true);
		});
		await expect(notch("notes")).toBeGreaterThan(notesNotch);

		// back to the server-side value: dirty is a diff, not a "was edited" latch
		await userEvent.type(input, "{Backspace}");
		await waitFor(async () => {
			await expect(hasMarker(label())).toBe(false);
		});
	},
};

/**
 * Without `showDirtyState` nothing is marked, however dirty the form gets.
 */
export const DirtyStateHidden: StoryObj = {
	render: () => <MixedFormStory />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const input = await canvas.findByDisplayValue("Alice", undefined, {
			timeout: 10000,
		});
		const find = (selector: string) => canvasElement.querySelector(selector);

		await userEvent.type(input, "x");
		// the form knows it is dirty...
		await waitFor(async () => {
			await expect(
				find("[data-form-dirty]")?.getAttribute("data-form-dirty"),
			).toBe("true");
		});
		// ...and says nothing about it
		await expect(
			hasMarker(find('[data-field="first_name"] .MuiFormLabel-root')),
		).toBe(false);
	},
};

/**
 * Marks supplied by the application rather than derived from the form: a change request
 * workflow marking the fields a proposal touches. Those are saved — the form is not
 * dirty — and still marked, and the form's own dirty state is merged in on top.
 */
export const DirtyStateProvided: StoryObj = {
	render: () => <MixedFormStory content={ProposedChangesFormContent} />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const input = await canvas.findByDisplayValue("Alice", undefined, {
			timeout: 10000,
		});
		const find = (selector: string) => canvasElement.querySelector(selector);
		const field = (name: string) => `[data-field="${name}"]`;
		const label = (name: string) => find(`${field(name)} .MuiFormLabel-root`);

		// proposed by the change request, untouched by the user, marked anyway
		await waitFor(async () => {
			await expect(hasMarker(label("notes"))).toBe(true);
		});
		// not proposed, not edited
		await expect(hasMarker(label("first_name"))).toBe(false);

		// the form's own dirty state is merged in, not replaced
		await userEvent.type(input, "x");
		await waitFor(async () => {
			await expect(hasMarker(label("first_name"))).toBe(true);
		});
		await expect(hasMarker(label("notes"))).toBe(true);
	},
};

/**
 * `FormField autoFocus` puts the cursor in the field a form should start in, whichever
 * control it is. It applies when the field mounts, so picking another field here
 * reopens the form.
 */
export const AutoFocus: StoryObj<{ field: ModelFieldName }> = {
	args: { field: "start_date" },
	argTypes: {
		field: {
			control: "select",
			options: MIXED_FIELDS.filter((name) => name !== "avatar"),
		},
	},
	render: (args) => <MixedFormStory autoFocus={args.field} key={args.field} />,
	play: async ({ canvas, canvasElement, args }) => {
		await canvas.findByDisplayValue("Alice", undefined, { timeout: 10000 });
		const cell = canvasElement.querySelector(`[data-field="${args.field}"]`);
		await waitFor(async () => {
			await expect(cell?.contains(document.activeElement)).toBe(true);
		});
	},
};

/**
 * [ISSUE-3506-ITEM-12] Tab to the form's checkbox (ModelDataTypeBooleanCheckboxRendererMUI):
 * its box gets an outline, which forced colors keep, not only the ripple's faint tint
 */
export const Issue3506Item12FormCheckboxShowsFocus: StoryObj = {
	render: () => <MixedFormStory />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await canvas.findByDisplayValue("Alice", undefined, { timeout: 10000 });
		const box = canvas.getByRole("checkbox", { name: "Active" });
		canvasElement
			.querySelector<HTMLInputElement>('[data-field="notify"] input')!
			.focus();
		await userEvent.tab({ shift: true });
		await expect(box).toHaveFocus();
		const root = box.parentElement!;
		await waitFor(() => expect(root).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(root.querySelector(":scope > svg")!);
		await expect(
			{ style: style.outlineStyle, width: parseFloat(style.outlineWidth) },
			"the outline around the focused checkbox's box",
		).toEqual({ style: "solid", width: 2 });
	},
};

/**
 * The options of the multi-checkbox field "Channels"
 */
const CHANNELS = [
	{ value: "email", getLabel: () => "Email" },
	{ value: "sms", getLabel: () => "SMS" },
	{ value: "phone", getLabel: () => "Phone" },
];

/**
 * A model with a name and the enum multi-checkbox field "Channels"
 * (ModelDataTypeEnumMultiCheckboxRendererMUI), and one record with Email checked
 */
const createChannelsModel = () =>
	new Model(
		"channels-model-" + Date.now().toString(16),
		{
			id: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "ID",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityHidden,
					create: ModelVisibilityDisabled,
				},
				customData: null,
			},
			name: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Name",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityEdit,
					create: ModelVisibilityEdit,
				},
				customData: null,
			},
			channels: {
				type: new ModelDataTypeEnumMultiCheckboxRendererMUI(CHANNELS),
				getLabel: () => "Channels",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityEdit,
					create: ModelVisibilityEdit,
				},
				customData: null,
			},
		},
		new MockConnector([{ id: "1", name: "Alice", channels: ["email"] }]),
	);

type ChannelsModel = ReturnType<typeof createChannelsModel>;

const CHANNELS_CUSTOM_PROPS: FormCustomProps = {
	goBack: () => {
		// eslint-disable-next-line no-console
		console.log("Go back");
	},
};

const ChannelsFormContent = (
	props: PageProps<ChannelsModel, FormCustomProps>,
) => (
	<DefaultFormPage
		{...props}
		customProps={{
			...props.customProps,
			open: () => {},
			hasCustomSubmitHandler: false,
		}}
		autoBack={false}
	>
		<Grid container spacing={2}>
			<Grid size={{ xs: 12 }}>
				<FormField name="name" />
			</Grid>
			<Grid size={{ xs: 12 }}>
				<FormField name="channels" />
			</Grid>
		</Grid>
	</DefaultFormPage>
);

const ChannelsFormStory = () => {
	const model = useMemo(createChannelsModel, []);
	return (
		<Form
			model={model}
			id="1"
			errorComponent={DefaultErrorComponent}
			customProps={CHANNELS_CUSTOM_PROPS}
			disableRouting
		>
			{ChannelsFormContent}
		</Form>
	);
};

type PlayContext = Parameters<NonNullable<StoryObj["play"]>>[0];

/**
 * Tabs from Name to the options Email (checked) and SMS (unchecked) of "Channels" and
 * reads the outline around each focused option's box
 * @returns per option its outline's style, width in px and color
 */
const tabToChannelRings = async ({ canvas, userEvent }: PlayContext) => {
	const name = await canvas.findByDisplayValue("Alice", undefined, {
		timeout: 10000,
	});
	name.focus();
	const rings = [];
	for (const option of ["Email", "SMS"]) {
		await userEvent.tab();
		const input = canvas.getByRole("checkbox", { name: option });
		await expect(input).toHaveFocus();
		const root = input.parentElement!;
		// keyboard focus as MUI sees it, so the ring is the only open question
		await waitFor(() => expect(root).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(root.querySelector(":scope > svg")!);
		rings.push({
			option,
			style: style.outlineStyle,
			width: parseFloat(style.outlineWidth),
			color: style.outlineColor,
		});
	}
	return rings;
};

/**
 * [ISSUE-3501-ITEM-47] Tab to the options of an enum multi-checkbox field
 * (ModelDataTypeEnumMultiCheckboxRendererMUI): the focused option's box gets an outline
 * of at least 3:1 against the form, which forced colors keep, not only the ripple's
 * faint tint
 */
export const Issue3501Item47EnumMultiCheckboxShowsFocus: StoryObj = {
	render: () => <ChannelsFormStory />,
	parameters: { a11y: { test: "error" } },
	play: async (context) => {
		for (const ring of await tabToChannelRings(context)) {
			await expect(
				{ style: ring.style, width: ring.width },
				`the outline around the box of the focused option ${ring.option}`,
			).toEqual({ style: "solid", width: 2 });
			await expect(
				getContrastRatio(ring.color, "#fff"),
				`the contrast of ${ring.option}'s outline against the form`,
			).toBeGreaterThanOrEqual(3);
		}
	},
};

/**
 * An app's theme ring, as MUI's createTheme({ focusVisible }) takes it
 */
const GREEN_RING = createTheme({
	focusVisible: { outlineColor: "rgb(0, 128, 0)" },
});

/**
 * [ISSUE-3501-ITEM-47] With a theme that sets MUI's `focusVisible` ring (here
 * `outlineColor: rgb(0, 128, 0)`), the focused option's box shows that ring
 */
export const Issue3501Item47EnumMultiCheckboxThemeRing: StoryObj = {
	render: () => (
		<ThemeProvider theme={GREEN_RING}>
			<ChannelsFormStory />
		</ThemeProvider>
	),
	parameters: { a11y: { test: "error" } },
	play: async (context) => {
		for (const ring of await tabToChannelRings(context))
			await expect(
				{ style: ring.style, color: ring.color },
				`the theme's ring around the box of the focused option ${ring.option}`,
			).toEqual({ style: "solid", color: "rgb(0, 128, 0)" });
	},
};
