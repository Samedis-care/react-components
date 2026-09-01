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
				<Grid size={{ xs: 6 }}>
					<FormField name="first_name" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="department" />
				</Grid>
				<Grid size={{ xs: 12 }}>
					<FormField name="notes" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="start_date" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="avatar" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="priority" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="active" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="notify" />
				</Grid>
			</Grid>
		</DefaultFormPage>
	);
};

const DirtyStateFormStory = () => {
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
			disableRouting
		>
			{MixedFormContent}
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
	render: () => <DirtyStateFormStory />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const input = await canvas.findByDisplayValue("Alice", undefined, {
			timeout: 10000,
		});
		const find = (selector: string) => canvasElement.querySelector(selector);
		const field = (name: string) => `[data-cc-field="${name}"]`;

		// the wrapper Field puts around every control...
		const wrapperDirty = () =>
			find(field("first_name"))?.getAttribute("data-cc-dirty");
		// ...and the control root the renderer handed RenderParams.dirty to
		const controlDirty = () =>
			find(`${field("first_name")} .MuiTextField-root`)?.getAttribute(
				"data-cc-dirty",
			);
		const label = () => find(`${field("first_name")} .MuiFormLabel-root`);

		await expect(wrapperDirty()).toBe("false");
		await expect(controlDirty()).toBe("false");
		await expect(hasMarker(label())).toBe(false);

		await userEvent.type(input, "x");
		await waitFor(async () => {
			await expect(wrapperDirty()).toBe("true");
		});
		await expect(controlDirty()).toBe("true");
		await expect(hasMarker(label())).toBe(true);

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

		// back to the server-side value: dirty is a diff, not a "was edited" latch
		await userEvent.type(input, "{Backspace}");
		await waitFor(async () => {
			await expect(wrapperDirty()).toBe("false");
		});
		await expect(controlDirty()).toBe("false");
		await expect(hasMarker(label())).toBe(false);
	},
};
