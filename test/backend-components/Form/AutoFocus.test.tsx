import { describe, it, expect, afterEach, beforeAll } from "vitest";
import React, { useState } from "react";
import {
	render,
	act,
	waitFor,
	cleanup,
	fireEvent,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import Form, {
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import Model from "../../../src/backend-integration/Model/Model";
import ModelRenderParams from "../../../src/backend-integration/Model/RenderParams";
import RendererString from "../../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererString";
import RendererStringArray from "../../../src/backend-integration/Model/Types/Renderers/UIKit/RendererStringArray";
import {
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityHidden,
} from "../../../src/backend-integration/Model/Visibilities";
import MultiLanguageInput from "../../../src/standalone/UIKit/InputControls/MultiLanguageInput";
import createMixedControlModel from "../../../src/stories/test-utils/MixedControlModel";
import MockConnector from "../../../src/stories/test-utils/MockConnector";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
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
});

afterEach(cleanup);

const MIXED_FIELDS = [
	"first_name",
	"notes",
	"active",
	"notify",
	"department",
	"priority",
	"start_date",
];

const renderMixedForm = (autoFocus: string | null) => {
	const Content = () => (
		<>
			{MIXED_FIELDS.map((name) => (
				<div data-field={name} key={name}>
					<FormField name={name} autoFocus={name === autoFocus} />
				</div>
			))}
		</>
	);
	return render(
		<Framework>
			<Form
				model={createMixedControlModel()}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				disableRouting
			>
				{Content as unknown as React.ComponentType<never>}
			</Form>
		</Framework>,
	);
};

const loaded = async (container: HTMLElement) => {
	await waitFor(() =>
		expect(container.querySelector('input[name="first_name"]')).toHaveValue(
			"Alice",
		),
	);
	await act(async () => {});
};

describe("FormField autoFocus", () => {
	it.each(MIXED_FIELDS)("focuses the %s control", async (name) => {
		const { container } = renderMixedForm(name);
		await loaded(container);

		const focused = document.activeElement;
		expect(focused).not.toBe(document.body);
		expect(
			container.querySelector(`[data-field="${name}"]`)?.contains(focused),
		).toBe(true);
	});

	it("starts a radio group on the checked option", async () => {
		const { container } = renderMixedForm("priority");
		await loaded(container);

		expect(document.activeElement).toBe(
			container.querySelector('input[name="priority"][value="normal"]'),
		);
	});

	it("focuses nothing without it", async () => {
		const { container } = renderMixedForm(null);
		await loaded(container);

		expect(document.activeElement).toBe(document.body);
	});
});

/**
 * Renders a plain input that is replaced whenever the value changes, the way a
 * selector remounts its input when it refreshes
 */
class RemountingRenderer extends RendererString {
	render(params: ModelRenderParams<string>): React.ReactElement {
		if (!params.visibility.editable) return super.render(params);
		return (
			<input
				key={params.value}
				name={params.field}
				defaultValue={params.value}
				autoFocus={params.autoFocus}
			/>
		);
	}
}

const EDIT = {
	overview: ModelVisibilityDisabled,
	edit: ModelVisibilityEdit,
	create: ModelVisibilityEdit,
};

const createRemountModel = () =>
	new Model(
		"auto-focus-remount-" + Date.now().toString(16),
		{
			id: {
				type: new RendererString(),
				getLabel: () => "ID",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityHidden,
					create: ModelVisibilityDisabled,
				},
				customData: null,
			},
			code: {
				type: new RemountingRenderer(),
				getLabel: () => "Code",
				visibility: EDIT,
				customData: null,
			},
			comment: {
				type: new RendererString(),
				getLabel: () => "Comment",
				visibility: EDIT,
				customData: null,
			},
			tags: {
				type: new RendererStringArray(),
				getLabel: () => "Tags",
				visibility: EDIT,
				customData: null,
			},
		},
		new MockConnector([
			{ id: "1", code: "A-1", comment: "", tags: ["a", "b"] },
		]),
	);

describe("FormField autoFocus only applies while the field mounts", () => {
	it("does not pull the focus back when the control remounts its input", async () => {
		const sink: { ctx?: ReturnType<typeof useFormContext> } = {};
		const Content = () => {
			sink.ctx = useFormContext();
			return (
				<>
					<FormField name={"code"} autoFocus />
					<FormField name={"comment"} />
				</>
			);
		};
		const { container } = render(
			<Framework>
				<Form
					model={createRemountModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					disableRouting
				>
					{Content as unknown as React.ComponentType<never>}
				</Form>
			</Framework>,
		);
		const code = () => container.querySelector('input[name="code"]');
		await waitFor(() => expect(code()).toHaveValue("A-1"));
		await act(async () => {});
		expect(document.activeElement).toBe(code());

		const comment = container.querySelector<HTMLInputElement>(
			'input[name="comment"]',
		)!;
		act(() => comment.focus());
		act(() => sink.ctx!.setFieldValue("code", "A-2"));
		await waitFor(() => expect(code()).toHaveValue("A-2"));

		expect(document.activeElement).toBe(comment);
	});

	it("does not move the focus when turned on for a control already shown", async () => {
		const sink: { focus?: (focus: boolean) => void } = {};
		const Content = () => {
			const [focus, setFocus] = useState(false);
			sink.focus = setFocus;
			return <FormField name={"comment"} autoFocus={focus} />;
		};
		const { container } = render(
			<Framework>
				<Form
					model={createRemountModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					disableRouting
				>
					{Content as unknown as React.ComponentType<never>}
				</Form>
			</Framework>,
		);
		await waitFor(() =>
			expect(container.querySelector('input[name="comment"]')).not.toBeNull(),
		);
		act(() => sink.focus!(true));
		await act(async () => {});

		expect(document.activeElement).toBe(document.body);
	});
});

describe("string array autoFocus", () => {
	it("starts in the empty entry at the end, and leaves the next one alone", async () => {
		const Content = () => <FormField name={"tags"} autoFocus />;
		const { container } = render(
			<Framework>
				<Form
					model={createRemountModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					disableRouting
				>
					{Content as unknown as React.ComponentType<never>}
				</Form>
			</Framework>,
		);
		const inputs = () =>
			Array.from(
				container.querySelectorAll<HTMLInputElement>('input[name="tags"]'),
			);
		await waitFor(() => expect(inputs()).toHaveLength(3));
		await act(async () => {});

		const last = inputs()[2];
		expect(last).toHaveValue("");
		expect(document.activeElement).toBe(last);

		// typing there adds the next empty entry, which must not take the focus
		fireEvent.change(last, { target: { value: "c" } });
		await waitFor(() => expect(inputs()).toHaveLength(4));
		expect(inputs()[2]).toHaveValue("c");
		expect(document.activeElement).toBe(inputs()[2]);
	});
});

describe("MultiLanguageInput autoFocus", () => {
	it("focuses the first field only, not the languages expanded later", async () => {
		const { container, getByLabelText } = render(
			<Framework>
				<MultiLanguageInput
					enabledLanguages={["de", "en"]}
					ignoreI18nLocale
					values={{}}
					onChange={() => {}}
					label={"Title"}
					name={"title"}
					autoFocus
				/>
			</Framework>,
		);
		const first = await waitFor(() => {
			const input = container.querySelector('input[name="title-de"]');
			expect(input).not.toBeNull();
			return input;
		});
		expect(document.activeElement).toBe(first);

		// a click through fireEvent leaves the focus where it is
		fireEvent.click(getByLabelText(/./, { selector: "button" }));
		await waitFor(() =>
			expect(container.querySelector('input[name="title-en"]')).not.toBeNull(),
		);

		expect(document.activeElement).toBe(first);
	});
});
