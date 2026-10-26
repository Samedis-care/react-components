/**
 * Shared scaffolding of the Form tests (values, validation, fields, submit, dirty state,
 * nesting): a small model on an in-memory connector, a page component that hands the live
 * form context to the test, a parent form with a nested one, and helpers to wait for the
 * form to load and settle.
 *
 * One Framework per test: a second mountForm in the same test throws "More than one
 * instance of UnsafeToLeave loaded" unless the first one is unmounted.
 *
 * Not a test file itself (no `.test.` in the name), so vitest only runs it through the
 * files that import it.
 */
import React from "react";
import { act, render, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeAll, expect, vi } from "vitest";
import { Framework } from "../../../src/framework";
import Form, {
	FormContextData,
	FormProps,
	PageProps,
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import {
	Model,
	ModelDataTypeLocalizedStringRenderer,
	ModelDataTypeStringRendererMUI,
	ModelFieldDefinitionUnknown,
	ModelUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityEditRequired,
	ModelVisibilityHidden,
} from "../../../src/backend-integration";
import ccI18n from "../../../src/i18n";

/**
 * Registers what every Form test file needs: jsdom's missing matchMedia (the Framework's
 * ThemeProvider asks for it) and scrollIntoView, the library's translations (dialog buttons and validator
 * messages are looked up by name), and a cleanup after each test
 */
export const setupFormTests = () => {
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
		// DefaultErrorComponent scrolls the first invalid field into view after its dialog
		if (!Element.prototype.scrollIntoView) {
			Element.prototype.scrollIntoView = () => {};
		}
		await ccI18n.loadNamespaces("translation");
	});
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});
};

/**
 * The connector's records: two complete ones, with a dot-notation field (address.city)
 * and a localized string (loc)
 */
export const recordData = (): Record<string, unknown>[] => [
	{
		id: "1",
		title: "T1",
		note: "N1",
		reason: "a",
		other: "",
		address: { city: "C1" },
		loc: { de: "a", en: "b" },
	},
	{
		id: "2",
		title: "T2",
		note: "N2",
		reason: "a",
		other: "",
		address: { city: "C2" },
		loc: { de: "x" },
	},
];

export const editRequired = {
	overview: ModelVisibilityDisabled,
	edit: ModelVisibilityEditRequired,
	create: ModelVisibilityEditRequired,
};

/**
 * Field definition changes per field name, merged over the defaults
 */
export type FieldExtras = Partial<
	Record<string, Partial<ModelFieldDefinitionUnknown>>
>;

let modelCounter = 0;

/**
 * A model with the text fields title, note, reason, other and address.city (all
 * EditRequired, no validation), a localized string loc, and an id hidden in edit and
 * disabled in create.
 * @param extra Changes per field, e.g. `{ title: { validate } }`
 * @param connector The connector, by default one holding recordData()
 * @param moreFields Further fields to add to the model
 * @remarks Each call gets its own model id (from a counter, not the clock), so two models
 *          never share react-query cache entries.
 */
export const makeModel = (
	extra: FieldExtras = {},
	connector: MockConnector = new MockConnector(recordData()),
	moreFields: Record<string, ModelFieldDefinitionUnknown> = {},
): ModelUnknown => {
	const text = (name: string, label: string): ModelFieldDefinitionUnknown => ({
		type: new ModelDataTypeStringRendererMUI(),
		getLabel: () => label,
		visibility: editRequired,
		customData: null,
		...extra[name],
	});
	const fields: Record<string, ModelFieldDefinitionUnknown> = {
		id: {
			type: new ModelDataTypeStringRendererMUI(),
			getLabel: () => "ID",
			visibility: {
				overview: ModelVisibilityDisabled,
				edit: ModelVisibilityHidden,
				create: ModelVisibilityDisabled,
			},
			customData: null,
			...extra.id,
		},
		title: text("title", "Title"),
		note: text("note", "Note"),
		reason: text("reason", "Reason"),
		other: text("other", "Other reason"),
		"address.city": text("address.city", "City"),
		loc: {
			type: new ModelDataTypeLocalizedStringRenderer({
				enabledLanguages: ["de", "en"],
			}),
			getLabel: () => "Localized",
			visibility: editRequired,
			customData: null,
			...extra.loc,
		},
		...moreFields,
	};
	return new Model("u43-form-" + String(modelCounter++), fields, connector);
};

/**
 * Receives the live form context of the mounted form
 */
export interface Sink {
	ctx?: FormContextData<ModelUnknown>;
}

/**
 * Form props a test may set; model, children and customProps come from mountForm
 */
export type TestFormProps = Partial<
	Omit<FormProps<ModelUnknown, undefined>, "model" | "children" | "customProps">
>;

export type TestPage = React.ComponentType<PageProps<ModelUnknown, undefined>>;

/**
 * Mounts a Form (edit mode, record "1", DefaultErrorComponent, routing disabled)
 * @param model The model
 * @param Content The page component, created once per mount
 * @param props Form props to set or override
 * @returns The render result plus rerenderWith, which re-renders the same tree with
 *          other Form props
 */
export const mountForm = (
	model: ModelUnknown,
	Content: TestPage,
	props: TestFormProps = {},
) => {
	const el = (p: TestFormProps) => (
		<Framework>
			<Form
				model={model}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={undefined}
				disableRouting
				{...p}
			>
				{Content}
			</Form>
		</Framework>
	);
	const result = render(el(props));
	return {
		...result,
		rerenderWith: (p: TestFormProps) => result.rerender(el(p)),
	};
};

/**
 * A page component that stores the form context in the sink and renders extra
 * @param sink Receives the context
 * @param extra What the page renders, e.g. FormFields
 */
export const capture = (
	sink: Sink,
	extra?: () => React.ReactNode,
): TestPage => {
	const Capture = () => {
		sink.ctx = useFormContext<ModelUnknown>();
		return <>{extra?.()}</>;
	};
	return Capture;
};

/**
 * Waits until the form shows the record (title === expected) and its effects ran
 */
export const loaded = async (sink: Sink, expected: unknown = "T1") => {
	await waitFor(() => expect(sink.ctx?.values.title).toBe(expected));
	await act(async () => {});
};

/**
 * Lets pending validations and the renders they cause finish
 */
export const settle = async () => {
	await act(async () => {});
	await act(async () => {});
};

/**
 * Submits through the context and returns what submit rejected with (null if it resolved)
 */
export const trySubmit = async (sink: Sink): Promise<unknown> => {
	let error: unknown = null;
	await act(async () => {
		try {
			await sink.ctx!.submit();
		} catch (e) {
			error = e;
		}
	});
	return error;
};

/**
 * The input a string FormField renders for the given field
 */
export const inputOf = (container: HTMLElement, name: string) =>
	container.querySelector(`input[name="${name}"]`) as HTMLInputElement;

/**
 * A validator rejecting an empty value with the text "required"
 */
export const required = (value: unknown) => (value ? null : "required");

/**
 * Waits for real time to pass, inside act (react-query notifies its observers through
 * setTimeout(0), so a refetch or a debounced save needs a macrotask, not just a flush)
 */
export const wait = async (ms: number) => {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, ms));
	});
};

/**
 * Lets the test switch the nested form of mountNested
 */
export interface NestedControl {
	/**
	 * Mounts (true) or unmounts (false) the nested form, the parent stays
	 */
	setShow: (show: boolean) => void;
	/**
	 * Sets the nested form's disableNestedSubmit
	 */
	setDisable: (disable: boolean) => void;
}

/**
 * Mounts a parent form on record "1" of parentModel whose page renders a nested form
 * (nestedFormName "child") on record "2" of childModel
 * @param childModel The nested form's model; give it its own connector to tell the saves apart
 * @param parentModel The parent form's model
 * @param nestedProps Further props of the nested Form
 * @param childExtra What the nested form's page renders, e.g. a FormField
 * @param parentProps Further props of the parent Form
 * @returns The render result, the sinks of both forms, and the control to hide, show and
 *          disable the nested form
 */
export const mountNested = (
	childModel: ModelUnknown,
	parentModel: ModelUnknown = makeModel(),
	nestedProps: Partial<FormProps<ModelUnknown, undefined>> = {},
	childExtra?: () => React.ReactNode,
	parentProps: TestFormProps = {},
) => {
	const parent: Sink = {};
	const child: Sink = {};
	const control: NestedControl = { setShow: () => {}, setDisable: () => {} };
	const ChildPage = capture(child, childExtra);
	const ParentPage = () => {
		parent.ctx = useFormContext<ModelUnknown>();
		const [show, setShow] = React.useState(true);
		const [disable, setDisable] = React.useState(false);
		control.setShow = setShow;
		control.setDisable = setDisable;
		return show ? (
			<Form
				model={childModel}
				id={"2"}
				nestedFormName={"child"}
				errorComponent={DefaultErrorComponent}
				customProps={undefined}
				disableNestedSubmit={disable}
				{...nestedProps}
			>
				{ChildPage}
			</Form>
		) : null;
	};
	const result = mountForm(parentModel, ParentPage, parentProps);
	return { ...result, parent, child, control };
};
