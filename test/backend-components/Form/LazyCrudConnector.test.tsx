/**
 * useLazyCrudConnector and FormCrudMultiSelect: a sub-collection of the form's record (the
 * join records behind getEndpoint(id)) whose adds and removals are queued in a
 * LazyConnector and written by the form's post-submit handler once the record is saved.
 *
 * The form is record "1" of the formFixture model. The selector's join rows live in a store
 * per endpoint, and every request the real connector gets is logged with the endpoint it
 * went to: "index:joins/1", "setApiEndpoint:joins/1", "create:joins/1:s2" (by source_id),
 * "delete:joins/1:j1" (by id), "update:joins/1:j1:<note>".
 */
import React, { useState } from "react";
import { afterAll, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import {
	loaded,
	makeModel,
	mountForm,
	settle,
	setupFormTests,
	Sink,
	TestPage,
	trySubmit,
} from "./formFixture";
import {
	FormContextData,
	PageProps,
	useFormContext,
	useFormFlowEngineStageConfig,
} from "../../../src/backend-components/Form/Form";
import FormCrudMultiSelect, {
	FormCrudMultiSelectProps,
} from "../../../src/backend-components/Form/CrudControls/FormCrudMultiSelect";
import ApiConnector from "../../../src/backend-integration/Connector/ApiConnector";
import LazyConnector from "../../../src/backend-integration/Connector/LazyConnector";
import type { ResponseMeta } from "../../../src/backend-integration/Connector/Connector";
import { useCrudSelectContext } from "../../../src/backend-components/Selector/CrudMultiSelect";
import type {
	CrudSelectDispatch,
	UseCrudSelectResult,
} from "../../../src/backend-components/Selector/useCrudSelect";
import FlowEngine, {
	FlowStageProps,
} from "../../../src/backend-components/Form/FlowEngine/FlowEngine";
import type {
	ModelGetResponse,
	ModelUnknown,
} from "../../../src/backend-integration";
import type { MultiSelectorData } from "../../../src/standalone";

setupFormTests();

type Rows = Record<string, unknown>[];

/**
 * What the real connectors of one test share: the join rows per endpoint, the request log,
 * the source ids whose create the backend refuses, and an index result that replaces the
 * store's (to hold or fail the load)
 */
interface Env {
	stores: Record<string, Rows>;
	calls: string[];
	refuse: Set<string>;
	indexResult: Promise<[Rows, ResponseMeta]> | null;
	connectors: EndpointConnector[];
	getConnector: Mock<(endpoint: string, extra?: unknown) => EndpointConnector>;
}

/**
 * The real connector behind the LazyConnector: one endpoint at a time (setApiEndpoint
 * switches it), backed by the test's stores
 */
class EndpointConnector extends ApiConnector {
	private counter = 100;
	/**
	 * While set, creates wait for it: holds the save in flight
	 */
	public gate: Promise<void> | null = null;

	constructor(
		public endpoint: string,
		private env: Env,
	) {
		super();
	}

	setApiEndpoint(url: string): void {
		this.env.calls.push(`setApiEndpoint:${url}`);
		this.endpoint = url;
	}

	index(): Promise<[Rows, ResponseMeta]> {
		this.env.calls.push(`index:${this.endpoint}`);
		if (this.env.indexResult) return this.env.indexResult;
		const rows = this.env.stores[this.endpoint] ?? [];
		return Promise.resolve([
			rows.map((row) => ({ ...row })),
			{ totalRows: rows.length, filteredRows: rows.length },
		]);
	}

	async create(
		data: Record<string, unknown>,
	): Promise<ModelGetResponse<ModelUnknown>> {
		if (this.gate) await this.gate;
		const sourceId = String(data.source_id);
		this.env.calls.push(`create:${this.endpoint}:${sourceId}`);
		if (this.env.refuse.has(sourceId)) throw new Error(`refused ${sourceId}`);
		const id = String(this.counter++);
		(this.env.stores[this.endpoint] ??= []).push({ ...data, id });
		return [{ ...data, id }, {}];
	}

	read(id: string): Promise<ModelGetResponse<ModelUnknown>> {
		return Promise.resolve([{ id }, {}]);
	}

	update(
		data: Record<string, unknown>,
	): Promise<ModelGetResponse<ModelUnknown>> {
		this.env.calls.push(
			`update:${this.endpoint}:${String(data.id)}:${String(data.note)}`,
		);
		return Promise.resolve([data, {}]);
	}

	delete(id: string): Promise<void> {
		this.env.calls.push(`delete:${this.endpoint}:${id}`);
		return Promise.resolve();
	}
}

const makeEnv = (stores: Record<string, Rows> = {}): Env => {
	const env = {
		stores,
		calls: [],
		refuse: new Set<string>(),
		indexResult: null,
		connectors: [],
	} as unknown as Env;
	env.getConnector = vi.fn((endpoint: string) => {
		const connector = new EndpointConnector(endpoint, env);
		env.connectors.push(connector);
		return connector;
	});
	return env;
};

/**
 * A join record as the selector holds it: value is the join id, source_id the id of the
 * picked record of the lookup model
 */
interface JoinData extends MultiSelectorData {
	source_id: string;
	note?: string;
}

const serialize = (data: JoinData) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	source_id: data.source_id,
	note: data.note,
});

const deserialize = (record: Record<string, unknown>): JoinData => ({
	value: record.id as string,
	label: "L" + String(record.source_id),
	source_id: record.source_id as string,
	note: record.note as string | undefined,
});

const deserializeModel = (record: Record<string, unknown>) => ({
	label: "L" + String(record.id),
	source_id: record.id as string,
});

const getIdOfData = (data: JoinData) => data.source_id;

/**
 * The selector's state, captured by an end adornment (rendered once loading finished)
 */
const selSink: { ctx?: UseCrudSelectResult<ModelUnknown, MultiSelectorData> } =
	{};

const CaptureSelectCtx = () => {
	selSink.ctx = useCrudSelectContext();
	return null;
};

const selected = () => selSink.ctx!.selected as JoinData[];

const labels = () => selected().map((entry) => entry.label);

const ready = async () => {
	await waitFor(() => expect(selSink.ctx).toBeDefined());
	await settle();
};

beforeEach(() => {
	selSink.ctx = undefined;
});

afterAll(async () => {
	// The selector reloads its options through a 500 ms debounce after every selection
	// change. A load still pending when the last test ends would otherwise run after the
	// jsdom window is torn down, and its state update throws "window is not defined".
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

/**
 * Picks an entry through the ref (addToSelection is worked by an effect: start it in a sync
 * act, wait for the result, then await it)
 */
const add = async (
	ref: React.RefObject<CrudSelectDispatch<JoinData> | null>,
	sourceId = "s2",
) => {
	let pending: Promise<void> | undefined;
	act(() => {
		pending = ref.current!.addToSelection({
			value: "to-create-" + sourceId,
			label: "L" + sourceId,
			source_id: sourceId,
		});
	});
	await waitFor(() =>
		expect(selected().some((entry) => entry.source_id === sourceId)).toBe(true),
	);
	await act(async () => {
		await pending;
	});
	await settle();
};

/**
 * Sets the selection the way the selector's own UI does: handleSelect with the new list
 */
const select = async (entries: JoinData[]) => {
	await act(async () => {
		await selSink.ctx!.handleSelect(
			entries.map((entry) => entry.value),
			entries,
		);
	});
	await settle();
};

type SelectProps = FormCrudMultiSelectProps<ModelUnknown, JoinData>;

/**
 * The selector props every test starts from: field "joins" of record "1"
 */
const selectorProps = (model: ModelUnknown, env: Env): SelectProps => ({
	model,
	field: "joins",
	initialId: "1",
	getEndpoint: (id: string) => `joins/${id}`,
	getConnector: env.getConnector,
	serialize,
	deserialize,
	deserializeModel,
	getIdOfData,
	label: "Joins",
	placeholder: "Search joins",
	endAdornment: <CaptureSelectCtx />,
});

/**
 * Lets a test hide and show the selector (the page renders it conditionally)
 */
const ctl: { setShow: (show: boolean) => void } = { setShow: () => {} };

/**
 * A page that hands the form context to the sink and renders the selector while shown
 * @param render Renders the selector, with the live form context
 */
const makePage = (
	sink: Sink,
	render: (ctx: FormContextData<ModelUnknown>) => React.ReactNode,
): TestPage => {
	const Page = () => {
		const ctx = useFormContext<ModelUnknown>();
		sink.ctx = ctx;
		const [show, setShow] = useState(true);
		ctl.setShow = setShow;
		return <>{show ? render(ctx) : null}</>;
	};
	return Page;
};

/**
 * Mounts the form on record "1" with a FormCrudMultiSelect and waits until both are ready
 * @param stores The join rows per endpoint
 * @param props Changes of the selector props
 * @param formProps Form props
 */
const mountSelector = async (
	stores: Record<string, Rows> = { "joins/1": [{ id: "j1", source_id: "s1" }] },
	props: Partial<SelectProps> = {},
	formProps: Parameters<typeof mountForm>[2] = {},
) => {
	const model = makeModel();
	const env = makeEnv(stores);
	const sink: Sink = {};
	const ref = React.createRef<CrudSelectDispatch<JoinData>>();
	const result = mountForm(
		model,
		makePage(sink, () => (
			<FormCrudMultiSelect<ModelUnknown, JoinData>
				ref={ref}
				{...selectorProps(model, env)}
				{...props}
			/>
		)),
		formProps,
	);
	await loaded(sink);
	await ready();
	return { ...result, model, env, sink, ref };
};

const hideAndShow = async () => {
	act(() => ctl.setShow(false));
	await settle();
	selSink.ctx = undefined;
	act(() => ctl.setShow(true));
	await ready();
};

describe("useLazyCrudConnector: unmount and remount", () => {
	it("without onlySubmitMounted a hidden selector's picks stay pending, come back with it and are saved", async () => {
		const { env, sink, ref } = await mountSelector();
		await add(ref);

		act(() => ctl.setShow(false));
		await settle();
		expect(sink.ctx!.dirty).toBe(true);

		selSink.ctx = undefined;
		act(() => ctl.setShow(true));
		await ready();

		// the same connector, so the same queue
		expect(env.getConnector).toHaveBeenCalledTimes(1);
		expect(labels()).toEqual(["Ls1", "Ls2"]);
		expect(sink.ctx!.dirty).toBe(true);

		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(env.calls).toContain("create:joins/1:s2");
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("without onlySubmitMounted a save while the selector is hidden writes its picks", async () => {
		const { env, sink, ref } = await mountSelector();
		await add(ref);
		act(() => ctl.setShow(false));
		await settle();

		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).toEqual([
			"index:joins/1",
			"setApiEndpoint:joins/1",
			"create:joins/1:s2",
		]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-1] with onlySubmitMounted, a remounted selector that lists a queued pick keeps the form dirty", async () => {
		const { sink, ref } = await mountSelector(
			undefined,
			{},
			{
				onlySubmitMounted: true,
			},
		);
		await add(ref);
		expect(sink.ctx!.dirty).toBe(true);

		await hideAndShow();

		// whichever way the queue of an unmounted selector is handled (dropped, or kept and
		// saved), what the selector lists after the remount has to match what the next save
		// writes: a listed pick that is not saved is lost without a word
		const listsPick = labels().includes("Ls2");
		expect({ listsPick, dirty: sink.ctx!.dirty }).toEqual({
			listsPick,
			dirty: listsPick,
		});
	});

	it("[ISSUE-3505-ITEM-1] in a flow form, a pick made in a stage that was left is saved from the next stage, or dropped", async () => {
		const model = makeModel();
		const env = makeEnv({ "joins/1": [] });
		const sink: Sink = {};
		const ref = React.createRef<CrudSelectDispatch<JoinData>>();
		type St = "a" | "b";
		const flow: { props?: FlowStageProps<ModelUnknown, St, undefined> } = {};
		const StageA = (props: FlowStageProps<ModelUnknown, St, undefined>) => {
			flow.props = props;
			return (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...selectorProps(model, env)}
				/>
			);
		};
		const StageB = (props: FlowStageProps<ModelUnknown, St, undefined>) => {
			flow.props = props;
			return null;
		};
		const stages = { a: StageA, b: StageB };
		const Page = (formProps: PageProps<ModelUnknown, undefined>) => {
			sink.ctx = useFormContext<ModelUnknown>();
			return (
				<FlowEngine<ModelUnknown, St, undefined>
					defaultStage={"a"}
					formProps={formProps}
				>
					{stages}
				</FlowEngine>
			);
		};
		mountForm(model, Page, { flowEngine: true });
		await loaded(sink);
		await ready();
		await add(ref);
		expect(sink.ctx!.dirty).toBe(true);

		await act(async () => {
			await flow.props!.goToStage("b", false);
		});
		await settle();
		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();

		// staged model values of a stage that was left are saved with the record; the pick
		// must be too, unless leaving the stage dropped it
		const lazy = sink.ctx!.getCustomState<LazyConnector>("joins");
		const sent = env.calls.includes("create:joins/1:s2");
		const dropped = !lazy || lazy.isQueueEmpty();
		expect(
			sent || dropped,
			`neither sent nor dropped: requests ${JSON.stringify(env.calls)}, dirty ${String(sink.ctx!.dirty)}`,
		).toBe(true);
	});

	it("[ISSUE-3505-ITEM-1] with onlySubmitMounted, a hidden selector's pick is not saved, and is saved once the selector is shown again", async () => {
		const { env, sink, ref } = await mountSelector(
			undefined,
			{},
			{ onlySubmitMounted: true },
		);
		await add(ref);
		act(() => ctl.setShow(false));
		await settle();

		// like the value of an unmounted field: not counted, not saved
		expect(sink.ctx!.dirty).toBe(false);
		await act(async () => {
			await sink.ctx!.submit({ ignoreDirtyCheck: true });
		});
		await settle();
		expect(env.calls).not.toContain("create:joins/1:s2");

		selSink.ctx = undefined;
		act(() => ctl.setShow(true));
		await ready();
		expect(labels()).toEqual(["Ls1", "Ls2"]);
		expect(sink.ctx!.dirty).toBe(true);

		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(env.calls.filter((call) => call.startsWith("create:"))).toEqual([
			"create:joins/1:s2",
		]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	/**
	 * A flow form whose stage "a" renders the selector (hidden and shown within the stage by
	 * ctl.setShow, shown again whenever the stage is entered) and stage "b" nothing
	 */
	const mountFlow = async () => {
		const model = makeModel();
		const env = makeEnv({ "joins/1": [] });
		const sink: Sink = {};
		const ref = React.createRef<CrudSelectDispatch<JoinData>>();
		type St = "a" | "b";
		const flow: { props?: FlowStageProps<ModelUnknown, St, undefined> } = {};
		const StageA = (props: FlowStageProps<ModelUnknown, St, undefined>) => {
			flow.props = props;
			const [show, setShow] = useState(true);
			ctl.setShow = setShow;
			return show ? (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...selectorProps(model, env)}
				/>
			) : null;
		};
		const StageB = (props: FlowStageProps<ModelUnknown, St, undefined>) => {
			flow.props = props;
			return null;
		};
		const stages = { a: StageA, b: StageB };
		const Page = (formProps: PageProps<ModelUnknown, undefined>) => {
			sink.ctx = useFormContext<ModelUnknown>();
			return (
				<FlowEngine<ModelUnknown, St, undefined>
					defaultStage={"a"}
					formProps={formProps}
				>
					{stages}
				</FlowEngine>
			);
		};
		mountForm(model, Page, { flowEngine: true });
		await loaded(sink);
		await ready();
		const goTo = async (stage: St, submitToServer: boolean) => {
			await act(async () => {
				await flow.props!.goToStage(stage, submitToServer);
			});
			await settle();
		};
		return { env, sink, ref, goTo };
	};

	it("[ISSUE-3505-ITEM-1] in a flow form, a pick made in a stage that was left keeps the form dirty and is saved by the next submit to the server", async () => {
		const { env, sink, ref, goTo } = await mountFlow();
		await add(ref);

		await goTo("b", false);
		expect(sink.ctx!.dirty).toBe(true);
		expect(env.calls).not.toContain("create:joins/1:s2");

		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();

		expect(env.calls.filter((call) => call.startsWith("create:"))).toEqual([
			"create:joins/1:s2",
		]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-1] in a flow form, a stage left with nothing queued sends nothing for it", async () => {
		const { env, goTo, sink } = await mountFlow();

		await goTo("b", false);
		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();

		expect(env.calls).toEqual(["index:joins/1"]);
	});

	it("[ISSUE-3505-ITEM-1] in a flow form, a lazy control hidden within its stage does not keep its queue", async () => {
		const { env, sink, ref, goTo } = await mountFlow();
		await add(ref);
		expect(sink.ctx!.dirty).toBe(true);

		// hidden while its stage stays shown: like an unmounted field with onlySubmitMounted,
		// not counted, and neither staged by the stage change nor saved
		act(() => ctl.setShow(false));
		await settle();
		expect(sink.ctx!.dirty).toBe(false);
		await goTo("b", false);
		expect(sink.ctx!.dirty).toBe(false);
		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();
		expect(env.calls).not.toContain("create:joins/1:s2");

		// the queue waits for the control, which lists it again once it is shown
		selSink.ctx = undefined;
		await goTo("a", false);
		await ready();
		expect(labels()).toEqual(["Ls2"]);
		expect(sink.ctx!.dirty).toBe(true);

		await goTo("b", false);
		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();
		expect(env.calls.filter((call) => call.startsWith("create:"))).toEqual([
			"create:joins/1:s2",
		]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-1] in a flow form, a pick made after the queue was saved is not kept when the control is hidden within its stage", async () => {
		const { env, sink, ref, goTo } = await mountFlow();
		await add(ref);
		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();
		expect(env.calls).toContain("create:joins/1:s2");

		await add(ref, "s3");
		act(() => ctl.setShow(false));
		await settle();
		expect(sink.ctx!.dirty).toBe(false);

		await goTo("b", false);
		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();
		expect(env.calls).not.toContain("create:joins/1:s3");
	});
});

describe("useLazyCrudConnector: re-renders of the form", () => {
	it("a pick in a flow stage that passes a new stage config on every render renders the stage a few times and keeps the form dirty", async () => {
		const model = makeModel();
		const env = makeEnv({ "joins/1": [] });
		const sink: Sink = {};
		const ref = React.createRef<CrudSelectDispatch<JoinData>>();
		type St = "a" | "b";
		// from this many renders on the stage passes one config object, so that a render loop
		// ends and fails the test instead of hanging it
		const renderLimit = 100;
		const lastConfig = { alwaysSubmitFields: ["title"] };
		let renders = 0;
		const StageA = () => {
			renders++;
			// a literal at the call site: a new object, and a new array, on every render
			useFormFlowEngineStageConfig(
				renders < renderLimit ? { alwaysSubmitFields: ["title"] } : lastConfig,
			);
			// renders whenever the form does, like a stage that reads the form's state
			useFormContext<ModelUnknown>();
			return (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...selectorProps(model, env)}
				/>
			);
		};
		const StageB = () => null;
		const stages = { a: StageA, b: StageB };
		const Page = (formProps: PageProps<ModelUnknown, undefined>) => {
			sink.ctx = useFormContext<ModelUnknown>();
			return (
				<FlowEngine<ModelUnknown, St, undefined>
					defaultStage={"a"}
					formProps={formProps}
				>
					{stages}
				</FlowEngine>
			);
		};
		mountForm(model, Page, { flowEngine: true });
		await loaded(sink);
		await ready();

		renders = 0;
		await add(ref);

		expect(renders).toBeLessThan(10);
		expect(sink.ctx!.dirty).toBe(true);
	});
});

describe("useLazyCrudConnector: params and record changes after mount", () => {
	it("[ISSUE-3505-ITEM-2] a form that switches to another record without a new key lists and writes that record's rows", async () => {
		const model = makeModel();
		const env = makeEnv({
			"joins/1": [{ id: "j1", source_id: "s1" }],
			"joins/2": [{ id: "j2", source_id: "s9" }],
		});
		const sink: Sink = {};
		const Page = () => {
			const ctx = useFormContext<ModelUnknown>();
			sink.ctx = ctx;
			return (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
					initialId={ctx.id}
				/>
			);
		};
		const { rerenderWith } = mountForm(model, Page);
		await loaded(sink);
		await ready();
		expect(labels()).toEqual(["Ls1"]);

		selSink.ctx = undefined;
		rerenderWith({ id: "2" });
		await loaded(sink, "T2");
		await ready();
		await settle();

		// record 2's rows, not record 1's
		expect(labels()).toEqual(["Ls9"]);

		await select([]);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		// record 1's join is never deleted through record 2
		expect(env.calls).not.toContain("delete:joins/2:j1");
	});

	it("[ISSUE-3505-ITEM-2] a pick queued for record 1 is dropped when the form switches to record 2: record 2 lists its own rows, is clean, and its save sends none of it", async () => {
		const model = makeModel();
		const env = makeEnv({
			"joins/1": [{ id: "j1", source_id: "s1" }],
			"joins/2": [{ id: "j2", source_id: "s9" }],
		});
		const sink: Sink = {};
		const ref = React.createRef<CrudSelectDispatch<JoinData>>();
		const Page = () => {
			const ctx = useFormContext<ModelUnknown>();
			sink.ctx = ctx;
			return (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...selectorProps(model, env)}
					initialId={ctx.id}
				/>
			);
		};
		const { rerenderWith } = mountForm(model, Page);
		await loaded(sink);
		await ready();
		await add(ref);
		expect(sink.ctx!.dirty).toBe(true);

		selSink.ctx = undefined;
		rerenderWith({ id: "2" });
		await loaded(sink, "T2");
		await ready();
		await settle();

		expect(labels()).toEqual(["Ls9"]);
		expect(sink.ctx!.dirty).toBe(false);

		act(() => sink.ctx!.setFieldValue("title", "T2 edited"));
		await settle();
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).not.toContain("create:joins/2:s2");
		expect(env.calls).not.toContain("create:joins/1:s2");
	});

	it("[ISSUE-3505-ITEM-2] a pick queued for record 1 is not saved into record 2 when record 2's page does not show the control", async () => {
		const model = makeModel();
		const env = makeEnv({
			"joins/1": [{ id: "j1", source_id: "s1" }],
			"joins/2": [{ id: "j2", source_id: "s9" }],
		});
		const sink: Sink = {};
		const ref = React.createRef<CrudSelectDispatch<JoinData>>();
		const Page = () => {
			const ctx = useFormContext<ModelUnknown>();
			sink.ctx = ctx;
			if (ctx.id !== "1") return null;
			return (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...selectorProps(model, env)}
					initialId={ctx.id}
				/>
			);
		};
		const { rerenderWith } = mountForm(model, Page);
		await loaded(sink);
		await ready();
		await add(ref);
		expect(sink.ctx!.dirty).toBe(true);

		rerenderWith({ id: "2" });
		await loaded(sink, "T2");
		await settle();
		expect(sink.ctx!.dirty).toBe(false);

		act(() => sink.ctx!.setFieldValue("title", "T2 edited"));
		await settle();
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		// record 1's connector sends nothing, to neither record
		expect(env.calls).toEqual(["index:joins/1"]);
	});

	it("[ISSUE-3505-ITEM-2] the selector's validation of record 1 does not block the save of record 2 when record 2's page does not show the control", async () => {
		const model = makeModel();
		const env = makeEnv({
			"joins/1": [{ id: "j1", source_id: "s1" }],
			"joins/2": [{ id: "j2", source_id: "s9" }],
		});
		const sink: Sink = {};
		const validate = (data: JoinData[]): Record<string, string> =>
			data.length > 0 ? {} : { required: "Pick at least one" };
		const Page = () => {
			const ctx = useFormContext<ModelUnknown>();
			sink.ctx = ctx;
			if (ctx.id !== "1") return null;
			return (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
					initialId={ctx.id}
					validate={validate}
				/>
			);
		};
		const { rerenderWith } = mountForm(model, Page);
		await loaded(sink);
		await ready();
		await select([]);

		rerenderWith({ id: "2" });
		await loaded(sink, "T2");
		await settle();

		act(() => sink.ctx!.setFieldValue("title", "T2 edited"));
		await settle();
		expect(await trySubmit(sink)).toBeNull();
	});
});

describe("FormCrudMultiSelect: the form's state", () => {
	it("[ISSUE-3505-ITEM-15] keeps the field's label while it loads and after the load failed", async () => {
		const model = makeModel();
		const env = makeEnv();
		let reject: (error: Error) => void = () => {};
		env.indexResult = new Promise((_resolve, rejectLoad) => {
			reject = rejectLoad;
		});
		const sink: Sink = {};
		mountForm(
			model,
			makePage(sink, () => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
				/>
			)),
		);
		await loaded(sink);
		await settle();
		const whileLoading = screen.queryByText("Joins") !== null;

		await act(async () => {
			reject(new Error("403 Forbidden"));
			await Promise.resolve();
		});
		await settle();
		const afterFailure = screen.queryByText("Joins") !== null;

		expect({ whileLoading, afterFailure }).toEqual({
			whileLoading: true,
			afterFailure: true,
		});
	});
	it("[ISSUE-3505-ITEM-15] while it loads the field is locked and busy and says so; once loaded it can be edited", async () => {
		const model = makeModel();
		const env = makeEnv();
		let resolve: (result: [Rows, ResponseMeta]) => void = () => {};
		env.indexResult = new Promise((resolveLoad) => {
			resolve = resolveLoad;
		});
		const sink: Sink = {};
		const { container } = mountForm(
			model,
			makePage(sink, () => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
				/>
			)),
		);
		await loaded(sink);
		await settle();

		expect(screen.getByRole("combobox")).toBeDisabled();
		expect(screen.getByRole("status")).toHaveTextContent("Loading…");
		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
		// the end adornment works on the selection: it waits until that is loaded
		expect(selSink.ctx).toBeUndefined();

		await act(async () => {
			resolve([
				[{ id: "j1", source_id: "s1" }],
				{ totalRows: 1, filteredRows: 1 },
			]);
			await Promise.resolve();
		});
		await ready();

		expect(labels()).toEqual(["Ls1"]);
		expect(screen.getByRole("combobox")).toBeEnabled();
		expect(
			screen.getByRole("button", { name: "Remove Ls1" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("status")).toBeNull();
		expect(container.querySelector('[aria-busy="true"]')).toBeNull();
	});
	it("[ISSUE-3505-ITEM-15] a failed load is announced in words that name the field, the error itself goes to the console, and the field stays locked", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const model = makeModel();
		const env = makeEnv();
		let reject: (error: Error) => void = () => {};
		env.indexResult = new Promise((_resolve, rejectLoad) => {
			reject = rejectLoad;
		});
		const sink: Sink = {};
		const { container } = mountForm(
			model,
			makePage(sink, () => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
				/>
			)),
		);
		await loaded(sink);
		await settle();
		expect(screen.queryByRole("alert")).toBeNull();

		const failure = new Error("403 Forbidden: actors.reader missing");
		await act(async () => {
			reject(failure);
			await Promise.resolve();
		});
		await settle();

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Joins could not be loaded.",
		);
		expect(screen.queryByText(/403 Forbidden/)).toBeNull();
		expect(warn).toHaveBeenCalledWith(expect.any(String), failure);
		expect(screen.getByRole("combobox")).toBeDisabled();
		expect(screen.queryByRole("status")).toBeNull();
		expect(container.querySelector('[aria-busy="true"]')).toBeNull();
		expect(selSink.ctx).toBeUndefined();
	});
	it("[ISSUE-3505-ITEM-15] a failed load of a field without a label still says what failed", async () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		const model = makeModel();
		const env = makeEnv();
		let reject: (error: Error) => void = () => {};
		env.indexResult = new Promise((_resolve, rejectLoad) => {
			reject = rejectLoad;
		});
		const sink: Sink = {};
		mountForm(
			model,
			makePage(sink, () => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
					label={undefined}
				/>
			)),
		);
		await loaded(sink);
		await act(async () => {
			reject(new Error("500"));
			await Promise.resolve();
		});
		await settle();

		expect(screen.getByRole("alert")).toHaveTextContent(
			"The selected entries could not be loaded.",
		);
	});
	it("cannot be edited in a read-only form, and can be once the form is editable again", async () => {
		const { rerenderWith } = await mountSelector(
			undefined,
			{},
			{
				readOnly: true,
			},
		);

		expect(screen.queryByRole("button", { name: "Remove Ls1" })).toBeNull();

		rerenderWith({ readOnly: false });
		await settle();

		expect(
			screen.getByRole("button", { name: "Remove Ls1" }),
		).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toBeEnabled();
	});
	it("cannot be edited with disabled in an editable form", async () => {
		await mountSelector(undefined, { disabled: true });

		expect(screen.queryByRole("button", { name: "Remove Ls1" })).toBeNull();
	});
	it("[ISSUE-3505-ITEM-4] an explicit disabled={undefined} or disabled={false} does not unlock it in a read-only form", async () => {
		const first = await mountSelector(
			undefined,
			{ disabled: undefined },
			{ readOnly: true },
		);
		const undefinedUnlocks = !!screen.queryByRole("button", {
			name: "Remove Ls1",
		});
		first.unmount();
		selSink.ctx = undefined;

		await mountSelector(undefined, { disabled: false }, { readOnly: true });
		const falseUnlocks = !!screen.queryByRole("button", {
			name: "Remove Ls1",
		});

		expect({ undefinedUnlocks, falseUnlocks }).toEqual({
			undefinedUnlocks: false,
			falseUnlocks: false,
		});
	});

	it("[ISSUE-3505-ITEM-5] a pick through the ref does not queue a write in a read-only form", async () => {
		const { sink, ref } = await mountSelector(
			undefined,
			{},
			{
				readOnly: true,
			},
		);

		let pending: Promise<void> | undefined;
		act(() => {
			pending = ref
				.current!.addToSelection({
					value: "to-create-s2",
					label: "Ls2",
					source_id: "s2",
				})
				.catch(() => {});
		});
		await act(async () => {
			await pending;
		});
		await settle();

		expect(labels()).toEqual(["Ls1"]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-5] an end adornment's handleSelect queues no pick and no removal in a read-only form, and the context says the control is disabled", async () => {
		const { sink } = await mountSelector(undefined, {}, { readOnly: true });
		expect(selSink.ctx!.disabled).toBe(true);

		const picked: JoinData = {
			value: "to-create-s2",
			label: "Ls2",
			source_id: "s2",
		};
		await act(async () => {
			await selSink.ctx!.handleSelect(
				["j1", picked.value],
				[...selected(), picked],
			);
		});
		await settle();
		expect(labels()).toEqual(["Ls1"]);

		await act(async () => {
			await selSink.ctx!.handleSelect([], []);
		});
		await settle();
		expect(labels()).toEqual(["Ls1"]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-5] once the form is editable again, a pick through the ref is queued", async () => {
		const { sink, ref, rerenderWith } = await mountSelector(
			undefined,
			{},
			{ readOnly: true },
		);
		rerenderWith({ readOnly: false });
		await settle();
		expect(selSink.ctx!.disabled).toBe(false);

		let pending: Promise<void> | undefined;
		act(() => {
			pending = ref.current!.addToSelection({
				value: "to-create-s2",
				label: "Ls2",
				source_id: "s2",
			});
		});
		await act(async () => {
			await pending;
		});
		await settle();

		expect(labels()).toEqual(["Ls1", "Ls2"]);
		expect(sink.ctx!.dirty).toBe(true);
	});
});
