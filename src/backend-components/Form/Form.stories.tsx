import React, { useCallback, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import { Grid } from "@mui/material";
import { Framework } from "../../framework";
import { Form } from "./index";
import FormField from "./Field";
import DefaultFormPage from "./DefaultFormPage";
import DefaultErrorComponent from "./DefaultErrorComponent";
import createTestModel from "../../stories/test-utils/TestModel";
import createMixedControlModel from "../../stories/test-utils/MixedControlModel";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { PageProps } from "./Form";
import DirtyStateProvider from "./DirtyStateProvider";
import { DirtyStateMarks } from "./DirtyStateContext";

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
}

const FormContent = (props: PageProps<ModelFieldName, FormCustomProps>) => {
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
		<Form<ModelFieldName, PageVisibility, null, FormCustomProps>
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
		<Form<ModelFieldName, PageVisibility, null, FormCustomProps>
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
const FieldCell = (props: { name: ModelFieldName }) => (
	<Grid
		size={{ xs: FIELD_SIZES[props.name] ?? 6 }}
		data-field={props.name}
		key={props.name}
	>
		<FormField name={props.name} />
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
	props: PageProps<ModelFieldName, FormCustomProps>,
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
					<FieldCell name={name} key={name} />
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
	props: PageProps<ModelFieldName, FormCustomProps>,
) => (
	<DirtyStateProvider marks={mergeProposedChanges}>
		<MixedFormContent {...props} />
	</DirtyStateProvider>
);

const DirtyStateFormStory = (props: {
	showDirtyState?: boolean;
	content?: React.ComponentType<PageProps<ModelFieldName, FormCustomProps>>;
}) => {
	const model = useMemo(createMixedControlModel, []);
	const goBack = useCallback(() => {
		// eslint-disable-next-line no-console
		console.log("Go back");
	}, []);
	return (
		<Form<ModelFieldName, PageVisibility, null, FormCustomProps>
			model={model}
			id="1"
			errorComponent={DefaultErrorComponent}
			customProps={{ goBack }}
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
	render: () => <DirtyStateFormStory showDirtyState />,
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
		await userEvent.click(find(`${field("department")} input`));
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
		await userEvent.type(find(`${field("notes")} textarea`), "x");
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
	render: () => <DirtyStateFormStory />,
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
	render: () => <DirtyStateFormStory content={ProposedChangesFormContent} />,
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
