import React, { useCallback, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor, within } from "storybook/test";
import { createMemoryHistory } from "history";
import { Framework } from "../../../framework";
import { setFrameworkHistory } from "../../../framework/History";
import Form, { PageProps } from "../Form";
import FormField from "../Field";
import DefaultErrorComponent from "../DefaultErrorComponent";
import type { CrudFormProps } from "../../CRUD";
import FlowEngine, { FlowStageProps } from "./FlowEngine";
import FlowEngineFormPage from "./FlowEngineFormPage";
import FlowEngineSaveButton from "./FlowEngineSaveButton";
import createTestModel, {
	sampleData,
} from "../../../stories/test-utils/TestModel";
import MockConnector from "../../../stories/test-utils/MockConnector";
import { Model } from "../../../backend-integration";
import type Connector from "../../../backend-integration/Connector/Connector";
import { styled, Typography } from "@mui/material";
import ActionButton from "../../../standalone/UIKit/ActionButton";

// a dirty form page blocks the history; keep that away from the Storybook frame's own
setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<Story />
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/Form/FlowEngine",
	decorators: [FrameworkDecorator],
	parameters: {
		docs: {
			description: {
				component:
					"A multi-step form: `FlowEngine`, rendered as the page component of a `Form` with `flowEngine`, shows one stage component at a time. All stages share the one Form. `goToStage(next, false)` validates and stages the fields the current stage renders and sends nothing; `goToStage(next, true)` (or `FlowEngineSaveButton`, which stays on the stage) also saves what every stage staged. Each stage usually renders a `FlowEngineFormPage` with its own footer buttons in `customProps.buttons`. `FlowEngineBackButton` leaves the form through the Form's `goBack`; it does not go to the previous stage.",
			},
		},
	},
	argTypes: {
		goBack: {
			description:
				"The Form's `customProps.goBack` (a CRUD's), called by FlowEngineBackButton",
		},
		onSubmit: {
			description:
				"The Form's `onSubmit`, called after a save with the server's record",
		},
	},
};

export default meta;

type PeopleModel = ReturnType<typeof createTestModel>;

type Stage = "person" | "contact";

type StageProps = FlowStageProps<PeopleModel, Stage, CrudFormProps>;

let modelCounter = 0;

/**
 * The people model of the stories (record 1 is Alice Mueller), with its own id per call
 * @param requireFirstName Give first_name a "required" validation
 * @param saveDelay Let every save take this many milliseconds
 */
const makeModel = (requireFirstName: boolean, saveDelay: number) => {
	const fields = createTestModel().fields;
	const model: PeopleModel = new Model(
		"u46-story-people-" + String(modelCounter++),
		requireFirstName
			? {
					...fields,
					first_name: {
						...fields.first_name,
						validate: (value: string) =>
							value ? null : "First name is required",
					},
				}
			: fields,
		new MockConnector(sampleData),
	);
	if (saveDelay) {
		// the delayed save writes to a second in-memory store with the same records
		const store = new MockConnector(sampleData);
		const connector: Connector = model.connector;
		connector.update = (data) =>
			new Promise((resolve) => {
				setTimeout(() => resolve(store.update(data)), saveDelay);
			});
	}
	return model;
};

interface FlowArgs {
	goBack: () => void;
	onSubmit: () => void;
}

const noop = () => {};

const LOAD = { timeout: 10000 };

/**
 * What the page shows above the scroll area (an app's header)
 */
const PageTop = styled("div")({ height: 200 });

/**
 * The scroll area of the long wizard, like an app layout's main area or a dialog's content
 */
const ScrollArea = styled("div")({ height: 400, overflow: "auto" });

/**
 * Space that makes a stage taller than the scroll area
 */
const Filler = styled("div")({ height: 1200 });

/**
 * A stage taller than the scroll area: its heading, two fields, and at its end the button
 * that goes to the other stage (disabled while the stage change runs)
 */
const makeLongStage = (
	title: string,
	fields: [string, string],
	target: Stage,
	button: string,
) =>
	function LongStage(props: StageProps) {
		const { formProps, safeGoToStage } = props;
		const go = useCallback(() => {
			void safeGoToStage(target, false);
		}, [safeGoToStage]);
		return (
			<>
				<Typography variant={"h5"} component={"h2"}>
					{title}
				</Typography>
				<FormField name={fields[0]} />
				<FormField name={fields[1]} />
				<Filler />
				<ActionButton disabled={formProps.isSubmitting} onClick={go}>
					{button}
				</ActionButton>
			</>
		);
	};

const LONG_STAGES = {
	person: makeLongStage(
		"Person",
		["first_name", "last_name"],
		"contact",
		"Next",
	),
	contact: makeLongStage(
		"Contact",
		["email", "department"],
		"person",
		"Previous",
	),
};

const LONG_STAGE_LABELS = {
	person: "Step 1 of 2: Person",
	contact: "Step 2 of 2: Contact",
};

const LongPage = (props: PageProps<PeopleModel, CrudFormProps>) => (
	<FlowEngine<PeopleModel, Stage, CrudFormProps>
		defaultStage={"person"}
		formProps={props}
		stageLabels={LONG_STAGE_LABELS}
	>
		{LONG_STAGES}
	</FlowEngine>
);

/**
 * The long wizard below a page heading, in a scroll area 200px below the top of the page
 */
const LongFlowStory = (props: FlowArgs) => {
	const { goBack, onSubmit } = props;
	const model = useMemo(() => makeModel(false, 0), []);
	const customProps: CrudFormProps = useMemo(
		() => ({ goBack, open: noop, hasCustomSubmitHandler: false }),
		[goBack],
	);
	return (
		<>
			<PageTop>
				<Typography>{"The wizard scrolls in its own area below."}</Typography>
			</PageTop>
			<ScrollArea data-testid={"scroll-area"}>
				<Typography variant={"h4"} component={"h1"}>
					{"Edit person"}
				</Typography>
				<Form
					model={model}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={customProps}
					onSubmit={onSubmit}
					flowEngine
					disableRouting
				>
					{LongPage}
				</Form>
			</ScrollArea>
		</>
	);
};

/**
 * A stage change moves the keyboard focus to the new stage, a group named after its
 * `stageLabels` entry, so screen readers announce the step and Tab continues in it. A
 * stage whose start is scrolled out of view, also by a few pixels, is scrolled to its
 * start; when the start is in view nothing scrolls, so a page heading above the flow stays
 * visible.
 */
export const Issue3504Item7StageChangeFocusesAndScrollsTheNewStage: StoryObj<FlowArgs> =
	{
		args: { goBack: fn(), onSubmit: fn() },
		parameters: { a11y: { test: "error" } },
		render: (args) => <LongFlowStory {...args} />,
		play: async ({ canvas, userEvent }) => {
			await canvas.findByDisplayValue("Alice", undefined, LOAD);
			const area = canvas.getByTestId("scroll-area");
			const offsetInArea = (el: Element) =>
				el.getBoundingClientRect().top - area.getBoundingClientRect().top;

			// Next is at the end of the long Person stage: focusing it scrolls down there
			const next = canvas.getByRole("button", { name: "Next" });
			next.focus();
			await waitFor(() => expect(area.scrollTop).toBeGreaterThan(800));
			await userEvent.keyboard("{Enter}");
			const contact = await canvas.findByRole(
				"group",
				{ name: "Step 2 of 2: Contact" },
				LOAD,
			);
			await expect(contact).toHaveFocus();
			await expect(
				Math.abs(offsetInArea(contact)),
				"the Contact stage starts at the top of the scroll area",
			).toBeLessThan(1);
			await userEvent.tab();
			await expect(
				canvas.getByRole("textbox", { name: "Email" }),
			).toHaveFocus();

			// with the start of the stage in view, nothing scrolls
			area.scrollTop = 0;
			canvas
				.getByRole("button", { name: "Previous" })
				.focus({ preventScroll: true });
			await userEvent.keyboard("{Enter}");
			const person = await canvas.findByRole(
				"group",
				{ name: "Step 1 of 2: Person" },
				LOAD,
			);
			await expect(person).toHaveFocus();
			await expect(area.scrollTop, "scroll position").toBe(0);

			// the start is scrolled out of the area, but not out of the window
			area.scrollTop = 100;
			await expect(offsetInArea(person)).toBeLessThan(-50);
			await expect(person.getBoundingClientRect().top).toBeGreaterThan(0);
			canvas
				.getByRole("button", { name: "Next" })
				.focus({ preventScroll: true });
			await userEvent.keyboard("{Enter}");
			const contactAgain = await canvas.findByRole(
				"group",
				{ name: "Step 2 of 2: Contact" },
				LOAD,
			);
			await expect(contactAgain).toHaveFocus();
			await expect(Math.abs(offsetInArea(contactAgain))).toBeLessThan(1);
		},
	};

const page = () => within(document.body);

/**
 * A stage with First Name and a footer with Save
 */
const SaveStage = (props: StageProps) => {
	const { formProps } = props;
	return (
		<FlowEngineFormPage
			{...formProps}
			customProps={{
				...formProps.customProps,
				buttons: [<FlowEngineSaveButton key={"save"} />],
			}}
		>
			<FormField name={"first_name"} />
		</FlowEngineFormPage>
	);
};

const SAVE_STAGES = { person: SaveStage, contact: SaveStage };

const SavePage = (props: PageProps<PeopleModel, CrudFormProps>) => (
	<FlowEngine<PeopleModel, Stage, CrudFormProps>
		defaultStage={"person"}
		formProps={props}
	>
		{SAVE_STAGES}
	</FlowEngine>
);

const READ_ONLY_REASONS = { permission: "You may not edit people" };

/**
 * The flow of a user who may not edit people (readOnlyReasons)
 */
const ReadOnlyFlowStory = (props: FlowArgs) => {
	const { goBack, onSubmit } = props;
	const model = useMemo(() => makeModel(false, 0), []);
	const customProps: CrudFormProps = useMemo(
		() => ({ goBack, open: noop, hasCustomSubmitHandler: false }),
		[goBack],
	);
	return (
		<Form
			model={model}
			id={"1"}
			errorComponent={DefaultErrorComponent}
			customProps={customProps}
			readOnlyReasons={READ_ONLY_REASONS}
			onSubmit={onSubmit}
			flowEngine
			disableRouting
		>
			{SavePage}
		</Form>
	);
};

/**
 * A read-only flow form says why Save is disabled, as DefaultFormPage's Save does: the
 * reason ("You may not edit people") shows in a tooltip when the pointer is on Save, and it
 * is Save's accessible description.
 */
export const Issue3504Item9ReadOnlySaveSaysWhy: StoryObj<FlowArgs> = {
	args: { goBack: fn(), onSubmit: fn() },
	parameters: { a11y: { test: "error" } },
	render: (args) => <ReadOnlyFlowStory {...args} />,
	play: async ({ canvas, userEvent }) => {
		await canvas.findByDisplayValue("Alice", undefined, LOAD);
		const save = canvas.getByRole("button", { name: "Save" });
		await expect(save).toBeDisabled();
		await expect(save).toHaveAccessibleDescription("You may not edit people");
		// a disabled button takes no pointer events; the element around it does
		await userEvent.hover(save.parentElement);
		const tooltip = await page().findByRole("tooltip", undefined, LOAD);
		await expect(tooltip).toHaveTextContent("You may not edit people");
	},
};
