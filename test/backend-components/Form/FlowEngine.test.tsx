/**
 * FlowEngine (multi-step forms): stage changes through goToStage / safeGoToStage, the stage
 * API on the props and through useFlowStageContext, the stage config, FlowEngineFormPage and
 * FlowEngineSaveButton. FlowEngineBackButton is in FlowEngineBackButton.test.tsx.
 *
 * Every test mounts a Form with `flowEngine` on record "1" of the formFixture model (title
 * "T1", note "N1", reason "a", other ""), whose page renders a FlowEngine with the stages
 * a, b and c. Each stage component counts its mounts and reports its props and the stage
 * context it sees.
 */
import "@testing-library/jest-dom/vitest";
import React, { useState } from "react";
import { describe, expect, it, MockInstance, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import {
	PageProps,
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FlowEngine, {
	FlowEngineProps,
	FlowStageContextType,
	FlowStageProps,
	useFlowStageContext,
} from "../../../src/backend-components/Form/FlowEngine/FlowEngine";
import FlowEngineFormPage from "../../../src/backend-components/Form/FlowEngine/FlowEngineFormPage";
import FlowEngineSaveButton from "../../../src/backend-components/Form/FlowEngine/FlowEngineSaveButton";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { ModelUnknown } from "../../../src/backend-integration";
import {
	FieldExtras,
	loaded,
	makeModel,
	mountForm,
	recordData,
	settle,
	setupFormTests,
	Sink,
	TestFormProps,
	wait,
} from "./formFixture";
import ActionButton from "../../../src/standalone/UIKit/ActionButton";

setupFormTests();

type St = "a" | "b" | "c";

type StageProps = FlowStageProps<ModelUnknown, St, unknown>;

type StageBody = (p: StageProps) => React.ReactNode;

/**
 * What the page and the stages report to the test
 */
interface Flow {
	/**
	 * The PageProps the Form gave the page (and the page gave FlowEngine)
	 */
	pageProps?: PageProps<ModelUnknown, unknown>;
	/**
	 * The props of the stage that rendered last
	 */
	props?: StageProps;
	/**
	 * The stage context that stage saw
	 */
	ctx?: FlowStageContextType<St>;
	/**
	 * Mounts per stage
	 */
	mounts: Partial<Record<St, number>>;
	/**
	 * Changes the defaultStage prop of the FlowEngine after mount
	 */
	setDefault?: (stage: St) => void;
}

/**
 * One component type per stage (made once per test, like module-level stages in an app)
 */
const makeStages = (flow: Flow, body: Partial<Record<St, StageBody>>) => {
	const make = (name: St) => {
		const Stage = (p: StageProps) => {
			flow.props = p;
			flow.ctx = useFlowStageContext<St>();
			useState(() => {
				flow.mounts[name] = (flow.mounts[name] ?? 0) + 1;
				return null;
			});
			return <>{body[name]?.(p)}</>;
		};
		return Stage;
	};
	return { a: make("a"), b: make("b"), c: make("c") };
};

const makePage = (
	sink: Sink,
	flow: Flow,
	stages: ReturnType<typeof makeStages>,
) => {
	const Page = (formProps: PageProps<ModelUnknown, unknown>) => {
		sink.ctx = useFormContext<ModelUnknown>();
		flow.pageProps = formProps;
		const [defaultStage, setDefaultStage] = useState<St>("a");
		flow.setDefault = setDefaultStage;
		return (
			<FlowEngine<ModelUnknown, St, unknown>
				defaultStage={defaultStage}
				formProps={formProps}
			>
				{stages}
			</FlowEngine>
		);
	};
	return Page;
};

interface SetupOptions {
	/**
	 * Form props; customProps is allowed here too
	 */
	formProps?: TestFormProps & { customProps?: unknown };
	extra?: FieldExtras;
}

/**
 * Mounts a flow-engine Form whose page renders the stages
 * @returns The render result, the connector and its update/create spies, the form sink
 *          and the flow report
 */
const setup = (
	body: Partial<Record<St, StageBody>>,
	opts: SetupOptions = {},
) => {
	const connector = new MockConnector(recordData());
	const update = vi.spyOn(connector, "update");
	const create = vi.spyOn(connector, "create");
	const sink: Sink = {};
	const flow: Flow = { mounts: {} };
	const result = mountForm(
		makeModel(opts.extra, connector),
		makePage(sink, flow, makeStages(flow, body)) as never,
		{ flowEngine: true, ...opts.formProps },
	);
	return { ...result, connector, update, create, sink, flow };
};

/**
 * Calls goToStage and returns what it rejected with (null if it resolved)
 */
const go = async (
	flow: Flow,
	stage: St,
	toServer: boolean,
): Promise<unknown> => {
	let error: unknown = null;
	await act(async () => {
		try {
			await flow.props!.goToStage(stage, toServer);
		} catch (e) {
			error = e;
		}
	});
	await settle();
	return error;
};

/**
 * Keeps every update pending until release() (then it is written to the connector)
 */
const hold = (update: MockInstance, connector: MockConnector) => {
	const pending: (() => void)[] = [];
	update.mockImplementation(
		(data: Record<string, unknown>) =>
			new Promise((resolve) => {
				pending.push(() =>
					resolve(MockConnector.prototype.update.call(connector, data)),
				);
			}) as never,
	);
	return async () => {
		act(() => {
			pending.shift()!();
		});
		await settle();
	};
};

const set = async (sink: Sink, field: string, value: unknown) => {
	act(() => sink.ctx!.setFieldValue(field, value));
	await settle();
};

const sent = (spy: MockInstance): unknown[] =>
	(spy.mock.calls as unknown[][]).map((call) => call[0]);

const TITLE: StageBody = () => <FormField name={"title"} />;
const NOTE: StageBody = () => <FormField name={"note"} />;

/**
 * A FlowEngineFormPage stage with the field and the buttons (customProps.buttons)
 */
const pageStage = (
	field: string | null,
	buttons: (p: StageProps) => React.ReactNode[],
) =>
	function PageStage(p: StageProps) {
		return (
			<FlowEngineFormPage
				{...p.formProps}
				customProps={{
					...(p.formProps.customProps as object),
					buttons: buttons(p),
				}}
			>
				{field && <FormField name={field} />}
			</FlowEngineFormPage>
		);
	};

/**
 * Footer buttons of a stage: "Next <stage>", which goes to the given stage
 */
const nextTo = (stage: St) => (p: StageProps) => [
	<ActionButton key={"n"} onClick={() => void p.safeGoToStage(stage, false)}>
		{"Next " + p.stage}
	</ActionButton>,
];

/**
 * Mounts a flow-engine Form whose page renders the stages with the given FlowEngine props,
 * between an "Outside" text box before the FlowEngine and a focusable container around
 * it (as a dialog's focus trap has)
 */
const setupEngine = (
	body: Partial<Record<St, StageBody>>,
	engine: Partial<FlowEngineProps<ModelUnknown, St, unknown>> = {},
) => {
	const sink: Sink = {};
	const flow: Flow = { mounts: {} };
	const stages = makeStages(flow, body);
	const Page = (formProps: PageProps<ModelUnknown, unknown>) => {
		sink.ctx = useFormContext<ModelUnknown>();
		return (
			<>
				<input aria-label={"Outside"} />
				<div tabIndex={-1} data-testid={"around"}>
					<FlowEngine<ModelUnknown, St, unknown>
						defaultStage={"a"}
						formProps={formProps}
						{...engine}
					>
						{stages}
					</FlowEngine>
				</div>
			</>
		);
	};
	const result = mountForm(
		makeModel({}, new MockConnector(recordData())),
		Page as never,
		{
			flowEngine: true,
		},
	);
	return { ...result, sink, flow };
};

/**
 * Starts a stage change from code and waits until the stage is shown
 */
const goFromCode = async (flow: Flow, stage: St) => {
	await act(async () => {
		await flow.props!.goToStage(stage, false);
	});
	await settle();
};

const TITLE_AND_NEXT = pageStage("title", nextTo("b"));

const NOTE_ONLY = pageStage("note", () => []);

const STAGE_LABELS: Partial<Record<St, string>> = {
	a: "Title step",
	b: "Note step",
};

/**
 * Mounts a read-only flow form whose stage a renders Title and a FlowEngineSaveButton
 * @param readOnlyReasons The Form's readOnlyReasons (undefined: an editable form)
 * @param save Props of the FlowEngineSaveButton
 */
const setupSave = (
	readOnlyReasons: Record<string, string | null> | undefined,
	save: React.ComponentProps<typeof FlowEngineSaveButton> = {},
) =>
	setup(
		{
			a: pageStage("title", () => [
				<FlowEngineSaveButton key={"s"} {...save} />,
			]),
		},
		{ formProps: { readOnlyReasons } },
	);

describe("FlowEngine: bugs", () => {
	it("[ISSUE-3504-ITEM-2] a refetch with a server change elsewhere keeps the staged values of a stage that is not shown", async () => {
		const { sink, flow, update, connector } = setup({ a: TITLE, b: NOTE });
		await loaded(sink);
		await set(sink, "title", "staged");
		expect(await go(flow, "b", false)).toBeNull();
		// another user changes a field nobody edited here
		MockConnector.prototype.update.call(connector, {
			id: "1",
			reason: "R-server",
		});
		await act(async () => {
			await sink.ctx!.refetchForm();
		});
		await wait(50);
		expect(sink.ctx!.values.reason).toBe("R-server");
		expect(sink.ctx!.values.title, "the staged title").toBe("staged");
		expect(await go(flow, "c", true)).toBeNull();
		expect(sent(update)).toEqual([{ id: "1", title: "staged" }]);
	});

	it("[ISSUE-3504-ITEM-2] a refetch that changes the staged field on the server keeps the staged value, as it keeps a typed one", async () => {
		const { sink, flow, update, connector } = setup({ a: TITLE, b: NOTE });
		await loaded(sink);
		await set(sink, "title", "staged");
		expect(await go(flow, "b", false)).toBeNull();
		MockConnector.prototype.update.call(connector, {
			id: "1",
			title: "T-server",
		});
		await act(async () => {
			await sink.ctx!.refetchForm();
		});
		await wait(50);
		expect(sink.ctx!.values.title).toBe("staged");
		expect(await go(flow, "c", true)).toBeNull();
		expect(sent(update)).toEqual([{ id: "1", title: "staged" }]);
	});

	it("[ISSUE-3504-ITEM-2] once the flow saved the staged values, a refetch takes the server's value for them again", async () => {
		const { sink, flow, update, connector } = setup({ a: TITLE, b: NOTE });
		await loaded(sink);
		await set(sink, "title", "staged");
		expect(await go(flow, "b", true)).toBeNull();
		expect(sent(update)).toEqual([{ id: "1", title: "staged" }]);
		MockConnector.prototype.update.call(connector, {
			id: "1",
			title: "T-server",
		});
		await act(async () => {
			await sink.ctx!.refetchForm();
		});
		await wait(50);
		expect(sink.ctx!.values.title).toBe("T-server");
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3504-ITEM-9] a read-only FlowEngineSaveButton says why it is disabled", async () => {
		const { sink } = setup(
			{
				a: pageStage("title", () => [<FlowEngineSaveButton key={"s"} />]),
			},
			{ formProps: { readOnlyReasons: { perm: "You may not edit people" } } },
		);
		await loaded(sink);
		const save = screen.getByRole("button", { name: "Save" });
		expect(save).toBeDisabled();
		expect(save).toHaveAccessibleDescription("You may not edit people");
	});
	it("[ISSUE-3504-ITEM-9] the reason shows in a tooltip when the pointer is on the read-only Save", async () => {
		const { sink } = setupSave({ perm: "You may not edit people" });
		await loaded(sink);
		const save = screen.getByRole("button", { name: "Save" });
		expect(screen.queryByRole("tooltip")).toBeNull();
		fireEvent.mouseOver(save);
		expect(await screen.findByRole("tooltip")).toHaveTextContent(
			"You may not edit people",
		);
	});
	it("[ISSUE-3504-ITEM-9] several reasons are joined, reasons without a text are left out", async () => {
		const { sink } = setupSave({ a: "One", b: null, c: "Two" });
		await loaded(sink);
		expect(
			screen.getByRole("button", { name: "Save" }),
		).toHaveAccessibleDescription("One, Two");
	});
	it("[ISSUE-3504-ITEM-9] read-only without a reason text: Save is disabled and has no description", async () => {
		const { sink } = setupSave({ perm: null });
		await loaded(sink);
		const save = screen.getByRole("button", { name: "Save" });
		expect(save).toBeDisabled();
		expect(save).not.toHaveAttribute("aria-describedby");
	});
	it("[ISSUE-3504-ITEM-9] an editable form's Save has no description", async () => {
		const { sink } = setupSave(undefined);
		await loaded(sink);
		expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute(
			"aria-describedby",
		);
	});
	it("[ISSUE-3504-ITEM-9] the caller's own description is kept in front of the reason", async () => {
		const { sink } = setupSave(
			{ perm: "You may not edit people" },
			{ "aria-describedby": "save-hint" },
		);
		await loaded(sink);
		const hint = document.createElement("p");
		hint.id = "save-hint";
		hint.textContent = "Saves every step.";
		document.body.appendChild(hint);
		try {
			expect(
				screen.getByRole("button", { name: "Save" }),
			).toHaveAccessibleDescription(
				"Saves every step. You may not edit people",
			);
		} finally {
			hint.remove();
		}
	});
	it("[ISSUE-3504-ITEM-9] while the form saves, Save says so and stays the same element", async () => {
		const { sink, update, connector } = setupSave(undefined);
		await loaded(sink);
		const release = hold(update, connector);
		fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
			target: { value: "x" },
		});
		await settle();
		const save = screen.getByRole("button", { name: "Save" });
		fireEvent.click(save);
		await waitFor(() =>
			expect(save).toHaveAccessibleDescription(
				"The form is currently being saved",
			),
		);
		expect(screen.getByRole("button", { name: "Save" })).toBe(save);
		await release();
		await waitFor(() => expect(save).not.toHaveAttribute("aria-describedby"));
		expect(screen.getByRole("button", { name: "Save" })).toBe(save);
		expect(update).toHaveBeenCalledTimes(1);
	});
	it("[ISSUE-3504-ITEM-7] after a stage change from a focused button, focus is in the new stage", async () => {
		const next = (stage: St) => (p: StageProps) => [
			<ActionButton
				key={"n"}
				onClick={() => void p.safeGoToStage(stage, false)}
			>
				{"Next " + p.stage}
			</ActionButton>,
		];
		const { sink, flow } = setup({
			a: pageStage("title", next("b")),
			b: pageStage("note", next("c")),
		});
		await loaded(sink);
		const button = screen.getByRole("button", { name: "Next a" });
		button.focus();
		expect(button).toHaveFocus();
		fireEvent.click(button);
		await waitFor(() => expect(flow.props!.stage).toBe("b"));
		await settle();
		expect(document.activeElement, "focus on the page").not.toBe(document.body);
		expect(
			screen
				.getByRole("textbox", { name: "Note" })
				.closest("form")
				?.contains(document.activeElement),
		).toBe(true);
	});
	it("[ISSUE-3504-ITEM-7] the new stage's container takes the focus, named after the stage's stageLabels entry", async () => {
		const { sink, flow } = setupEngine(
			{
				a: pageStage("title", nextTo("b")),
				b: pageStage("note", nextTo("c")),
				c: pageStage(null, nextTo("a")),
			},
			{ stageLabels: STAGE_LABELS },
		);
		await loaded(sink);
		expect(document.activeElement, "nothing is focused on mount").toBe(
			document.body,
		);
		const first = screen.getByRole("group", { name: "Title step" });
		expect(first).not.toHaveFocus();

		screen.getByRole("button", { name: "Next a" }).focus();
		fireEvent.click(screen.getByRole("button", { name: "Next a" }));
		await waitFor(() => expect(flow.props!.stage).toBe("b"));
		await settle();
		const second = screen.getByRole("group", { name: "Note step" });
		expect(second).toHaveFocus();
		expect(second).toHaveAttribute("tabindex", "-1");
		expect(second).toContainElement(
			screen.getByRole("textbox", { name: "Note" }),
		);

		// a stage without a label: the container is focused, but is no named group
		fireEvent.click(screen.getByRole("button", { name: "Next b" }));
		await waitFor(() => expect(flow.props!.stage).toBe("c"));
		await settle();
		expect(screen.queryByRole("group")).toBeNull();
		expect(document.activeElement).toContainElement(
			screen.getByRole("button", { name: "Next c" }),
		);
	});
	it("[ISSUE-3504-ITEM-7] focus that fell to a container around the flow during the stage change goes to the new stage", async () => {
		const { sink, flow } = setupEngine({ a: TITLE_AND_NEXT, b: NOTE_ONLY });
		await loaded(sink);
		screen.getByRole("button", { name: "Next a" }).focus();
		// a dialog's focus trap takes back the focus of a button that disabled itself
		act(() => screen.getByTestId("around").focus());
		await goFromCode(flow, "b");
		expect(document.activeElement).not.toBe(screen.getByTestId("around"));
		expect(document.activeElement).toContainElement(
			screen.getByRole("textbox", { name: "Note" }),
		);
	});
	it("[ISSUE-3504-ITEM-7] a stage that focuses a field itself keeps that focus", async () => {
		const { sink, flow } = setupEngine({
			a: TITLE_AND_NEXT,
			b: () => <FormField name={"note"} autoFocus />,
		});
		await loaded(sink);
		screen.getByRole("button", { name: "Next a" }).focus();
		await goFromCode(flow, "b");
		expect(screen.getByRole("textbox", { name: "Note" })).toHaveFocus();
	});
	it("[ISSUE-3504-ITEM-7] focus outside the flow stays there", async () => {
		const { sink, flow } = setupEngine({ a: TITLE_AND_NEXT, b: NOTE_ONLY });
		await loaded(sink);
		const outside = screen.getByRole("textbox", { name: "Outside" });
		outside.focus();
		await goFromCode(flow, "b");
		expect(outside).toHaveFocus();
	});
	it("[ISSUE-3504-ITEM-7] a stage change to the shown stage (save and stay) leaves the focus where it is", async () => {
		const { sink, flow } = setupEngine({ a: TITLE_AND_NEXT });
		await loaded(sink);
		const title = screen.getByRole("textbox", { name: "Title" });
		title.focus();
		await goFromCode(flow, "a");
		expect(title).toHaveFocus();
	});
	it("[ISSUE-3504-ITEM-7] disableAutoFocus leaves the focus to the app", async () => {
		const { sink, flow } = setupEngine(
			{ a: TITLE_AND_NEXT, b: NOTE_ONLY },
			{ disableAutoFocus: true, stageLabels: STAGE_LABELS },
		);
		await loaded(sink);
		screen.getByRole("button", { name: "Next a" }).focus();
		await goFromCode(flow, "b");
		expect(document.activeElement).toBe(document.body);
		expect(screen.getByRole("group", { name: "Note step" })).toBeVisible();
	});
});
