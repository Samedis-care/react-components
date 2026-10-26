/**
 * Shared scaffolding of the form page and FullFormDialog tests (BasicFormPage,
 * DefaultFormPage, EditOnlyFormPage, DefaultFormPageButtons, FormDialog): a people model on
 * an in-memory connector, a DefaultFormPage around the first name, mounts as a page (memory
 * history at /page, disableRouting) and inside a pushed FullFormDialog, and helpers to edit,
 * hold a save and find the leave prompt.
 *
 * One Framework per test: a second mount in the same test throws "More than one instance of
 * UnsafeToLeave loaded" unless the first one is unmounted.
 *
 * Not a test file itself (no `.test.` in the name), so vitest only runs it through the files
 * that import it.
 */
import React, { useEffect } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import { createMemoryHistory, MemoryHistory } from "history";
import { Framework, useDialogContext } from "../../../src/framework";
import { setFrameworkHistory } from "../../../src/framework/History";
import Form, {
	FormProps,
	PageProps,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage, {
	DefaultFormPageProps,
} from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import FormDialog, {
	FormDialogProps,
} from "../../../src/backend-components/Form/FormDialog";
import createTestModel, {
	sampleData,
} from "../../../src/stories/test-utils/TestModel";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { Model } from "../../../src/backend-integration";
import ccI18n from "../../../src/i18n";

/**
 * Registers what every test file of this unit needs: jsdom's missing matchMedia and
 * scrollIntoView, a stub for window.scrollTo (navigate scrolls to the top), the library's
 * translations, and a cleanup after each test
 */
export const setupPageTests = () => {
	beforeAll(async () => {
		if (!window.matchMedia) {
			window.matchMedia = (query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: () => {},
				removeListener: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false,
			});
		}
		if (!Element.prototype.scrollIntoView) {
			Element.prototype.scrollIntoView = () => {};
		}
		await ccI18n.loadNamespaces("translation");
	});
	beforeEach(() => {
		vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
	});
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});
};

export const LOAD = { timeout: 10000 };

export type PeopleModel = ReturnType<typeof createTestModel>;

let modelCounter = 0;

/**
 * The people model of the stories (record 1 Alice Mueller, 2 Bob Smith, 3 Carol Jones, …)
 * with its own model id per call, so two tests never share react-query cache entries
 */
export const makePeopleModel = (): PeopleModel =>
	new Model(
		"u45-people-" + String(modelCounter++),
		createTestModel().fields,
		new MockConnector(sampleData),
	);

/**
 * The connector of a people model, to spy on
 */
export const connectorOf = (model: PeopleModel) =>
	model.connector as unknown as MockConnector;

/**
 * The customProps the test forms get: a goBack, and the flag DefaultFormPageButtons reads
 */
export interface TestCustomProps {
	goBack: (forceRefresh?: boolean) => void;
	hasCustomSubmitHandler?: boolean;
}

export type TestPage = React.ComponentType<
	PageProps<PeopleModel, TestCustomProps>
>;

/**
 * A DefaultFormPage around the first name field (and body), with CrudFormProps made from
 * the Form's customProps
 * @param extra DefaultFormPage props to set
 * @param body More page content after the field
 * @remarks Call it once per test or at module level, not in a render
 */
export const makePage = (
	extra: Partial<Omit<DefaultFormPageProps, "children">> = {},
	body?: React.ReactNode,
): TestPage => {
	const Page = (props: PageProps<PeopleModel, TestCustomProps>) => (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				open: () => {},
				hasCustomSubmitHandler: !!props.customProps.hasCustomSubmitHandler,
			}}
			{...extra}
		>
			<FormField name="first_name" />
			{body}
		</DefaultFormPage>
	);
	return Page;
};

export interface MountOptions {
	goBack?: TestCustomProps["goBack"];
	/**
	 * More customProps of the Form, next to goBack
	 */
	customProps?: Omit<TestCustomProps, "goBack"> & Record<string, unknown>;
	model?: PeopleModel;
	formProps?: Partial<
		Omit<
			FormProps<PeopleModel, TestCustomProps>,
			"model" | "children" | "customProps"
		>
	>;
	history?: MemoryHistory;
	theme?: React.ComponentProps<typeof Framework>["defaultTheme"];
	/**
	 * Wraps the Framework, e.g. in React.StrictMode
	 */
	wrap?: (el: React.ReactElement) => React.ReactElement;
}

/**
 * Mounts the page in a Form (record "1", DefaultErrorComponent, disableRouting) under a
 * memory history at /page
 * @returns The render result, the history, the goBack spy and the model
 */
export const mountPage = (Page: TestPage, opts: MountOptions = {}) => {
	const history =
		opts.history ?? createMemoryHistory({ initialEntries: ["/page"] });
	setFrameworkHistory(history);
	const goBack = opts.goBack ?? vi.fn();
	const model = opts.model ?? makePeopleModel();
	const el = (
		<Framework defaultTheme={opts.theme}>
			<Form
				model={model}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={{ goBack, ...opts.customProps }}
				disableRouting
				{...opts.formProps}
			>
				{Page}
			</Form>
		</Framework>
	);
	const result = render(opts.wrap ? opts.wrap(el) : el);
	return { ...result, history, goBack, model };
};

export interface DialogMountOptions {
	model?: PeopleModel;
	dialogProps?: Partial<FormDialogProps>;
	customProps?: Partial<TestCustomProps>;
	formProps?: MountOptions["formProps"];
	theme?: MountOptions["theme"];
}

/**
 * Mounts a button "Open" that pushes a FullFormDialog ("Edit person") with the page in a
 * Form (record "1", disableRouting, goBack = popDialog); memory history at /page
 * @returns The render result, the history, the model and open(), which clicks "Open" and
 *          waits for the first name
 */
export const mountDialogPage = (
	Page: TestPage,
	opts: DialogMountOptions = {},
) => {
	const history = createMemoryHistory({ initialEntries: ["/page"] });
	setFrameworkHistory(history);
	const model = opts.model ?? makePeopleModel();
	const DialogForm = () => {
		const [, popDialog] = useDialogContext();
		return (
			<FormDialog dialogTitle={"Edit person"} {...opts.dialogProps}>
				<Form
					model={model}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={{ goBack: popDialog, ...opts.customProps }}
					disableRouting
					{...opts.formProps}
				>
					{Page}
				</Form>
			</FormDialog>
		);
	};
	const Opener = () => {
		const [pushDialog] = useDialogContext();
		return (
			<button type={"button"} onClick={() => pushDialog(<DialogForm />)}>
				Open
			</button>
		);
	};
	const result = render(
		<Framework defaultTheme={opts.theme}>
			<Opener />
		</Framework>,
	);
	const open = async () => {
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		return screen.findByDisplayValue("Alice", undefined, LOAD);
	};
	return { ...result, history, model, open };
};

/**
 * Mounts a component that pushes the given dialog once, after mount
 */
export const PushOnMount = (props: { dialog: React.ReactNode }) => {
	const [pushDialog] = useDialogContext();
	const { dialog } = props;
	useEffect(() => {
		pushDialog(dialog);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return null;
};

export const saveButton = () => screen.getByRole("button", { name: "Save" });
export const backButton = () => screen.getByRole("button", { name: "Back" });

/**
 * The names of the buttons in the container, in DOM order (aria-label, else the text)
 */
export const buttonNames = (container: HTMLElement = document.body) =>
	within(container)
		.queryAllByRole("button")
		.map((b) => b.getAttribute("aria-label") ?? b.textContent);

/**
 * The open "Leave form page?" prompts, including those below another dialog (MUI hides
 * the dialogs below the top one from the accessibility tree)
 */
export const leavePrompts = () =>
	screen.queryAllByRole("dialog", { name: "Leave form page?", hidden: true });

export const findLeavePrompt = () =>
	screen.findByRole("dialog", { name: "Leave form page?" });

/**
 * Changes the first name from Alice to the value and waits until Save is enabled
 * @returns The input
 */
export const makeDirty = async (value = "AliceX") => {
	const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
	fireEvent.change(input, { target: { value } });
	await waitFor(() => expect(saveButton()).toBeEnabled());
	return input;
};

/**
 * Lets real time pass inside act
 */
export const wait = async (ms: number) => {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, ms));
	});
};

/**
 * Whether a beforeunload event right now would be cancelled (the browser's "leave site?")
 */
export const unloadIsBlocked = () => {
	const event = new Event("beforeunload", { cancelable: true });
	window.dispatchEvent(event);
	return event.defaultPrevented;
};

/**
 * Holds every connector update until the test calls release (or fail)
 */
export const holdUpdates = (model: PeopleModel) => {
	const connector = connectorOf(model);
	const original = connector.update.bind(connector);
	const pending: { release: () => void; fail: (e: Error) => void }[] = [];
	const spy = vi.spyOn(connector, "update").mockImplementation(
		(data) =>
			new Promise((resolve, reject) => {
				pending.push({
					release: () => resolve(original(data)),
					fail: reject,
				});
			}) as never,
	);
	return {
		spy,
		release: () => pending.shift()!.release(),
		fail: (e: Error) => pending.shift()!.fail(e),
	};
};
