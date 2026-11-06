import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, within } from "storybook/test";
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
