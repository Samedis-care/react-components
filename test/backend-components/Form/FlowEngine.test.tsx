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
import { describe, expect, it, vi, MockInstance } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import {
	PageProps,
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FlowEngine, {
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
} from "./formFixture";

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
});
