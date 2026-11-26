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
import {
	act,
	configure,
	fireEvent,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
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
import MultiSelectEntry, {
	MultiSelectEntryProps,
} from "../../../src/standalone/Selector/MultiSelectEntry";
import { PartialExcept } from "../../../src/utils/distributiveOmit";
import PartialApplyError, {
	isPartialApplyError,
} from "../../../src/backend-components/Form/PartialApplyError";
import NetworkError from "../../../src/backend-integration/Connector/NetworkError";
import BackendError from "../../../src/backend-integration/Connector/BackendError";
import {
	configureErrorReporting,
	defaultShouldReportError,
	getErrorReportingConfig,
} from "../../../src/framework/ErrorReporting";

setupFormTests();

type Rows = Record<string, unknown>[];

/**
 * What the real connectors of one test share: the join rows per endpoint, the request log,
 * the source ids whose create or update the backend refuses, and an index result that
 * replaces the store's (to hold or fail the load)
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
		const sourceId = String(data.source_id);
		if (this.env.refuse.has(sourceId))
			return Promise.reject(new Error(`refused ${sourceId}`));
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
 * The selector's state, captured by an end adornment and by the entries (rendered once
 * loading finished; a read-only field renders no end adornment)
 */
const selSink: { ctx?: UseCrudSelectResult<ModelUnknown, MultiSelectorData> } =
	{};

const CaptureSelectCtx = () => {
	selSink.ctx = useCrudSelectContext();
	return null;
};

const CaptureEntry = (props: MultiSelectEntryProps<JoinData>) => {
	selSink.ctx = useCrudSelectContext();
	return <MultiSelectEntry {...props} />;
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
	selectedEntryRenderer: CaptureEntry,
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
	props: PartialExcept<
		SelectProps,
		"switchFilterName" | "switchLabel" | "defaultSwitchValue"
	> = {},
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

	it("[ISSUE-3505-ITEM-7] turning onlySubmitMounted off while the selector stays mounted keeps the form dirty", async () => {
		const { sink, ref, rerenderWith } = await mountSelector(
			undefined,
			{},
			{
				onlySubmitMounted: true,
			},
		);
		await add(ref);
		expect(sink.ctx!.dirty).toBe(true);

		rerenderWith({ onlySubmitMounted: false });
		await settle();

		// the queue still holds the pick
		expect(sink.ctx!.dirty).toBe(true);
	});

	it("[ISSUE-3505-ITEM-7] after onlySubmitMounted was turned off while the selector stays mounted, the next save sends the pick", async () => {
		const { env, sink, ref, rerenderWith } = await mountSelector(
			undefined,
			{},
			{ onlySubmitMounted: true },
		);
		await add(ref);
		rerenderWith({ onlySubmitMounted: false });
		await settle();

		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(env.calls).toContain("create:joins/1:s2");
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-7] turned off while the selector was shown, onlySubmitMounted no longer drops its pick when it is hidden: the form stays dirty and the save sends it", async () => {
		const { env, sink, ref, rerenderWith } = await mountSelector(
			undefined,
			{},
			{ onlySubmitMounted: true },
		);
		await add(ref);
		rerenderWith({ onlySubmitMounted: false });
		await settle();

		act(() => ctl.setShow(false));
		await settle();
		expect(sink.ctx!.dirty).toBe(true);

		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(env.calls).toContain("create:joins/1:s2");
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-7] turned on while the selector was shown, onlySubmitMounted drops its pick when it is hidden: the form is clean and the save leaves it out", async () => {
		const { env, sink, ref, rerenderWith } = await mountSelector(
			undefined,
			{},
			{ onlySubmitMounted: false },
		);
		await add(ref);
		rerenderWith({ onlySubmitMounted: true });
		await settle();
		expect(sink.ctx!.dirty).toBe(true);

		act(() => ctl.setShow(false));
		await settle();
		expect(sink.ctx!.dirty).toBe(false);

		await act(async () => {
			await sink.ctx!.submit({ ignoreDirtyCheck: true });
		});
		await settle();
		expect(env.calls).not.toContain("create:joins/1:s2");
	});

	it("[ISSUE-3505-ITEM-7] in a flow form, a selector outside the stages keeps the form dirty in a stage that turns onlySubmitMounted off, and the next save sends its pick", async () => {
		const model = makeModel();
		const env = makeEnv({ "joins/1": [] });
		const sink: Sink = {};
		const ref = React.createRef<CrudSelectDispatch<JoinData>>();
		type St = "a" | "b";
		const flow: { props?: FlowStageProps<ModelUnknown, St, undefined> } = {};
		const configB = { onlySubmitMounted: false };
		const StageA = (props: FlowStageProps<ModelUnknown, St, undefined>) => {
			flow.props = props;
			return null;
		};
		const StageB = (props: FlowStageProps<ModelUnknown, St, undefined>) => {
			flow.props = props;
			useFormFlowEngineStageConfig(configB);
			return null;
		};
		const stages = { a: StageA, b: StageB };
		const Page = (formProps: PageProps<ModelUnknown, undefined>) => {
			sink.ctx = useFormContext<ModelUnknown>();
			return (
				<>
					<FlowEngine<ModelUnknown, St, undefined>
						defaultStage={"a"}
						formProps={formProps}
					>
						{stages}
					</FlowEngine>
					<FormCrudMultiSelect<ModelUnknown, JoinData>
						ref={ref}
						{...selectorProps(model, env)}
					/>
				</>
			);
		};
		mountForm(model, Page, { flowEngine: true });
		await loaded(sink);
		await ready();

		// stage "a" saves its pick, so nothing is staged when stage "b" is shown
		await add(ref);
		await act(async () => {
			await flow.props!.goToStage("b", true);
		});
		await settle();
		expect(env.calls).toContain("create:joins/1:s2");
		expect(sink.ctx!.dirty).toBe(false);

		await add(ref, "s3");
		expect(sink.ctx!.dirty).toBe(true);

		await act(async () => {
			await sink.ctx!.submit({ submitToServer: true });
		});
		await settle();
		expect(env.calls).toContain("create:joins/1:s3");
		expect(sink.ctx!.dirty).toBe(false);
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

/**
 * The variant of the selector's params the page of mountVariants renders: "a" when it
 * mounts, then whatever set switches it to
 */
const variant: { set: (value: string) => void } = { set: () => {} };

/**
 * Mounts the form on record "1" with a page that renders the selector for its current
 * variant ("a" first), and waits until form and selector are ready
 * @param stores The join rows per endpoint
 * @param render Renders the selector of a variant, from the props every test starts from
 * @param formProps Form props
 */
const mountVariants = async (
	stores: Record<string, Rows>,
	render: (
		current: string,
		props: SelectProps,
		ref: React.RefObject<CrudSelectDispatch<JoinData> | null>,
	) => React.ReactNode,
	formProps: Parameters<typeof mountForm>[2] = {},
) => {
	const model = makeModel();
	const env = makeEnv(stores);
	const sink: Sink = {};
	const ref = React.createRef<CrudSelectDispatch<JoinData>>();
	const Page = () => {
		sink.ctx = useFormContext<ModelUnknown>();
		const [current, setCurrent] = useState("a");
		variant.set = setCurrent;
		return <>{render(current, selectorProps(model, env), ref)}</>;
	};
	const result = mountForm(model, Page, formProps);
	await loaded(sink);
	await ready();
	return { ...result, env, sink, ref };
};

/**
 * Switches the page of mountVariants to another variant of the selector's params
 */
const switchVariant = async (value: string) => {
	act(() => variant.set(value));
	await settle();
};

describe("useLazyCrudConnector: params and record changes after mount", () => {
	it("[ISSUE-3505-ITEM-3] a getEndpoint and onParentIdChange changed after mount change neither the list nor the save: both keep the first", async () => {
		const first = vi.fn();
		const later = vi.fn();
		const { env, sink, ref } = await mountVariants(
			{
				"a/1/joins": [{ id: "j1", source_id: "s1" }],
				"b/1/joins": [{ id: "j7", source_id: "s7" }],
			},
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...props}
					getEndpoint={(id) => `${current}/${id}/joins`}
					onParentIdChange={current === "a" ? first : later}
				/>
			),
		);
		expect(first).toHaveBeenCalledWith("1");
		first.mockClear();

		await switchVariant("b");
		expect(labels()).toEqual(["Ls1"]);
		await add(ref);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).toContain("create:a/1/joins:s2");
		expect(env.calls.filter((call) => call.includes("b/1/joins"))).toEqual([]);
		expect(first).toHaveBeenCalledWith("1");
		expect(later).not.toHaveBeenCalled();
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-3] the save keeps the first getEndpoint and onParentIdChange when the form's onlySubmitMounted changes after them", async () => {
		const later = vi.fn();
		const { env, sink, ref, rerenderWith } = await mountVariants(
			{ "a/1/joins": [], "b/1/joins": [] },
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...props}
					getEndpoint={(id) => `${current}/${id}/joins`}
					onParentIdChange={current === "a" ? undefined : later}
				/>
			),
		);

		await switchVariant("b");
		rerenderWith({ onlySubmitMounted: true });
		await settle();
		await add(ref);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).toContain("create:a/1/joins:s2");
		expect(env.calls).not.toContain("create:b/1/joins:s2");
		expect(later).not.toHaveBeenCalled();
	});

	it("[ISSUE-3505-ITEM-3] a selector mounted again under its field with another getEndpoint gets its connector back: it lists and saves the first endpoint's rows", async () => {
		const { env, sink, ref } = await mountVariants(
			{
				"a/1/joins": [{ id: "j1", source_id: "s1" }],
				"b/1/joins": [{ id: "j7", source_id: "s7" }],
			},
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					key={current}
					ref={ref}
					{...props}
					getEndpoint={(id) => `${current}/${id}/joins`}
				/>
			),
		);

		selSink.ctx = undefined;
		await switchVariant("b");
		await ready();
		expect(labels()).toEqual(["Ls1"]);
		await add(ref);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).toContain("create:a/1/joins:s2");
		expect(env.calls.filter((call) => call.includes("b/1/joins"))).toEqual([]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-3] extraParams, getConnector and configureConnector changed after mount are never used: the connector is built once, from the first", async () => {
		const configure = vi.fn();
		const laterConfigure = vi.fn();
		const laterEnv = makeEnv({ "joins/1": [{ id: "j7", source_id: "s7" }] });
		const { env, sink, ref } = await mountVariants(
			{ "joins/1": [{ id: "j1", source_id: "s1" }] },
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...props}
					getConnector={
						current === "a" ? props.getConnector : laterEnv.getConnector
					}
					configureConnector={current === "a" ? configure : laterConfigure}
					extraParams={{ variant: current }}
				/>
			),
		);

		await switchVariant("b");
		expect(labels()).toEqual(["Ls1"]);
		await add(ref);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.getConnector).toHaveBeenCalledTimes(1);
		expect(env.getConnector).toHaveBeenCalledWith("joins/1", {
			variant: "a",
		});
		expect(configure).toHaveBeenCalledTimes(1);
		expect(configure).toHaveBeenCalledWith(env.connectors[0]);
		expect(env.calls).toContain("create:joins/1:s2");
		expect(laterEnv.getConnector).not.toHaveBeenCalled();
		expect(laterConfigure).not.toHaveBeenCalled();
	});

	it("[ISSUE-3505-ITEM-3] a field changed after mount moves nothing: the queue stays under the first name, and the save leaves the form clean", async () => {
		const { env, sink, ref } = await mountVariants(
			{ "joins/1": [{ id: "j1", source_id: "s1" }] },
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...props}
					field={current === "a" ? "joins" : "joins2"}
				/>
			),
		);

		await add(ref);
		await switchVariant("b");
		expect(sink.ctx!.getCustomState("joins2")).toBeUndefined();
		await add(ref, "s3");
		expect(sink.ctx!.dirty).toBe(true);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).toEqual(
			expect.arrayContaining(["create:joins/1:s2", "create:joins/1:s3"]),
		);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-3] a field changed after mount does not move FormCrudMultiSelect's validation: its messages keep the first name", async () => {
		const validate = (data: JoinData[]): Record<string, string> =>
			data.length > 1 ? { many: "Pick one at most" } : {};
		const { sink, ref } = await mountVariants(
			{ "joins/1": [{ id: "j1", source_id: "s1" }] },
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...props}
					field={current === "a" ? "joins" : "joins2"}
					validate={validate}
				/>
			),
		);

		await switchVariant("b");
		await add(ref);
		expect(await trySubmit(sink)).not.toBeNull();
		await settle();

		const messages = Object.keys(sink.ctx!.errors).filter(
			(key) => sink.ctx!.errors[key],
		);
		expect(messages).toEqual(["joins_many"]);
	});

	it("[ISSUE-3505-ITEM-3] another collection takes another field and a new mount (key): the selector lists and saves the new endpoint's rows", async () => {
		const { env, sink, ref } = await mountVariants(
			{
				"a/1/joins": [{ id: "j1", source_id: "s1" }],
				"b/1/joins": [{ id: "j7", source_id: "s7" }],
			},
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					key={current}
					ref={ref}
					{...props}
					field={`joins_${current}`}
					getEndpoint={(id) => `${current}/${id}/joins`}
				/>
			),
		);
		expect(labels()).toEqual(["Ls1"]);

		selSink.ctx = undefined;
		await switchVariant("b");
		await ready();
		expect(labels()).toEqual(["Ls7"]);
		await add(ref);
		expect(sink.ctx!.dirty).toBe(true);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).toContain("create:b/1/joins:s2");
		expect(env.calls).not.toContain("create:a/1/joins:s2");
		expect(sink.ctx!.dirty).toBe(false);
	});

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

	it("[ISSUE-3505-ITEM-8] an onParentIdChange that sets state does not update a component during render", async () => {
		const errors = vi.spyOn(console, "error").mockImplementation(() => {});
		const model = makeModel();
		const env = makeEnv({ "joins/1": [] });
		const sink: Sink = {};
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			const [, setParent] = useState<string | null>(null);
			return (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
					onParentIdChange={setParent}
				/>
			);
		};
		mountForm(model, Page);
		await loaded(sink);
		await ready();

		const renderWarnings = errors.mock.calls.filter((call) =>
			String(call[0]).includes("Cannot update a component"),
		);
		expect(renderWarnings).toEqual([]);
	});

	it("[ISSUE-3505-ITEM-8] in StrictMode the connector is built and configured once, and onParentIdChange gets the parent id once", async () => {
		configure({ reactStrictMode: true });
		try {
			const model = makeModel();
			const env = makeEnv({ "joins/1": [{ id: "j1", source_id: "s1" }] });
			const sink: Sink = {};
			const configureConnector = vi.fn();
			const onParentIdChange = vi.fn();
			mountForm(
				model,
				makePage(sink, () => (
					<FormCrudMultiSelect<ModelUnknown, JoinData>
						{...selectorProps(model, env)}
						configureConnector={configureConnector}
						onParentIdChange={onParentIdChange}
					/>
				)),
			);
			await loaded(sink);
			await ready();

			expect(env.getConnector).toHaveBeenCalledTimes(1);
			expect(configureConnector.mock.calls).toEqual([[env.connectors[0]]]);
			expect(onParentIdChange.mock.calls).toEqual([["1"]]);
			expect(labels()).toEqual(["Ls1"]);
		} finally {
			configure({ reactStrictMode: false });
		}
	});

	it("[ISSUE-3505-ITEM-13] onParentIdChange is not called for a new record before the save, also not when the control mounts again, and gets the created record's id on the save", async () => {
		const model = makeModel();
		const env = makeEnv({});
		const sink: Sink = {};
		const ref = React.createRef<CrudSelectDispatch<JoinData>>();
		const onParentIdChange = vi.fn();
		const onQueueSent = vi.fn<(id: string) => void>();
		mountForm(
			model,
			makePage(sink, () => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...selectorProps(model, env)}
					initialId={null}
					onParentIdChange={onParentIdChange}
					onQueueSent={onQueueSent}
				/>
			)),
			{ id: null },
		);
		await loaded(sink, "");
		await ready();
		expect(onParentIdChange).not.toHaveBeenCalled();

		await hideAndShow();
		expect(onParentIdChange).not.toHaveBeenCalled();

		await add(ref);
		act(() => sink.ctx!.setFieldValue("title", "New"));
		await settle();
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(onParentIdChange).toHaveBeenCalledTimes(1);
		const createdId = onParentIdChange.mock.calls[0][0] as string;
		expect(createdId).not.toBe("null");
		expect(env.calls).toContain(`create:joins/${createdId}:s2`);
		expect(onQueueSent.mock.calls.map((call) => call[0])).toEqual([createdId]);
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

	it("[ISSUE-3505-ITEM-16] the search field stays enabled while the form saves", async () => {
		const { env, sink, ref } = await mountSelector();
		await add(ref);
		let release: () => void = () => {};
		env.connectors[0].gate = new Promise((resolve) => {
			release = resolve;
		});
		const input = screen.getByRole("combobox");

		let saved!: Promise<void>;
		act(() => {
			saved = sink.ctx!.submit();
		});
		await waitFor(() => expect(sink.ctx!.submitting).toBe(true));
		const disabledWhileSaving = (input as HTMLInputElement).disabled;
		await act(async () => {
			release();
			await saved;
		});

		expect(disabledWhileSaving).toBe(false);
	});

	it("[ISSUE-3505-ITEM-16] in a read-only form nothing is disabled: the entries are listed under the field's label, without a search field", async () => {
		const { container } = await mountSelector(
			undefined,
			{},
			{ readOnly: true },
		);

		expect(screen.queryByRole("combobox")).toBeNull();
		expect(container.querySelector(":disabled, .Mui-disabled")).toBeNull();
		const list = screen.getByRole("list", { name: "Joins" });
		expect(within(list).getByText("Ls1")).toBeInTheDocument();
	});

	it("[ISSUE-3505-ITEM-16] while it loads in a read-only form, the field is shown loading, not as a field without entries", async () => {
		const model = makeModel();
		const env = makeEnv();
		let resolve: (result: [Rows, ResponseMeta]) => void = () => {};
		env.indexResult = new Promise((resolveLoad) => {
			resolve = resolveLoad;
		});
		const sink: Sink = {};
		mountForm(
			model,
			makePage(sink, () => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					{...selectorProps(model, env)}
				/>
			)),
			{ readOnly: true },
		);
		await loaded(sink);
		await settle();
		const whileLoading = {
			field: screen.queryByRole<HTMLInputElement>("combobox")?.disabled,
			status: screen.queryByRole("status")?.textContent,
			noEntries: screen.queryByText("No entries") !== null,
		};

		await act(async () => {
			resolve([
				[{ id: "j1", source_id: "s1" }],
				{ totalRows: 1, filteredRows: 1 },
			]);
			await Promise.resolve();
		});
		await settle();

		expect(whileLoading).toEqual({
			field: true,
			status: "Loading…",
			noEntries: false,
		});
		expect(screen.queryByRole("combobox")).toBeNull();
		expect(
			within(screen.getByRole("list", { name: "Joins" })).getByText("Ls1"),
		).toBeInTheDocument();
	});

	it("[ISSUE-3505-ITEM-16] while the form saves, the entries keep their remove buttons, but a removal or a pick through the ref queues nothing; afterwards the field takes them again", async () => {
		const { env, sink, ref } = await mountSelector();
		await add(ref);
		let release: () => void = () => {};
		env.connectors[0].gate = new Promise((resolve) => {
			release = resolve;
		});

		let saved!: Promise<void>;
		act(() => {
			saved = sink.ctx!.submit();
		});
		await waitFor(() => expect(sink.ctx!.submitting).toBe(true));
		const disabledWhileSaving = selSink.ctx!.disabled;
		const readOnlyWhileSaving = screen
			.getByRole("combobox")
			.hasAttribute("readonly");
		fireEvent.click(screen.getByRole("button", { name: "Remove Ls1" }));
		await settle();
		let refused: unknown = null;
		let pending: Promise<void> | undefined;
		act(() => {
			pending = ref
				.current!.addToSelection({
					value: "to-create-s3",
					label: "Ls3",
					source_id: "s3",
				})
				.catch((e: unknown) => {
					refused = e;
				});
		});
		await act(async () => {
			await pending;
		});
		const labelsWhileSaving = labels();
		await act(async () => {
			release();
			await saved;
		});
		await settle();

		expect(disabledWhileSaving).toBe(true);
		expect(readOnlyWhileSaving).toBe(false);
		expect(refused).toBeInstanceOf(Error);
		expect(labelsWhileSaving).toEqual(["Ls1", "Ls2"]);
		expect(env.calls).toEqual([
			"index:joins/1",
			"setApiEndpoint:joins/1",
			"create:joins/1:s2",
		]);
		expect(sink.ctx!.dirty).toBe(false);
		expect(selSink.ctx!.disabled).toBe(false);

		fireEvent.click(screen.getByRole("button", { name: "Remove Ls1" }));
		await settle();
		expect(labels()).toEqual(["Ls2"]);
		expect(sink.ctx!.dirty).toBe(true);
	});

	it("[ISSUE-3505-ITEM-16] once the form is editable again, the search field is back", async () => {
		const { rerenderWith } = await mountSelector(
			undefined,
			{},
			{ readOnly: true },
		);
		rerenderWith({ readOnly: false });
		await settle();

		expect(screen.getByRole("combobox")).toBeEnabled();
		expect(
			screen.getByRole("button", { name: "Remove Ls1" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3505-ITEM-16] an explicit readOnly={false} or blockWrites={false} does not unlock it in a read-only form", async () => {
		await mountSelector(
			undefined,
			{ readOnly: false, blockWrites: false },
			{ readOnly: true },
		);

		expect(screen.queryByRole("combobox")).toBeNull();
		expect(screen.queryByRole("button", { name: "Remove Ls1" })).toBeNull();
		expect(selSink.ctx!.disabled).toBe(true);
	});

	it("[ISSUE-3505-ITEM-16] an explicit blockWrites={false} does not unlock it while the form saves", async () => {
		const { env, sink, ref } = await mountSelector(undefined, {
			blockWrites: false,
		});
		await add(ref);
		let release: () => void = () => {};
		env.connectors[0].gate = new Promise((resolve) => {
			release = resolve;
		});

		let saved!: Promise<void>;
		act(() => {
			saved = sink.ctx!.submit();
		});
		await waitFor(() => expect(sink.ctx!.submitting).toBe(true));
		const disabledWhileSaving = selSink.ctx!.disabled;
		await act(async () => {
			release();
			await saved;
		});

		expect(disabledWhileSaving).toBe(true);
	});

	it("[ISSUE-3505-ITEM-9] removing one entry does not write the others when deserialize builds a fresh object per call", async () => {
		const { env, sink } = await mountSelector(
			{
				"joins/1": [
					{ id: "j0", source_id: "s0" },
					{ id: "j9", source_id: "s9" },
				],
			},
			{
				deserialize: (record) => ({
					...deserialize(record),
					meta: { at: new Date(0) },
				}),
			},
		);

		fireEvent.click(screen.getByRole("button", { name: "Remove Ls9" }));
		await settle();
		expect(labels()).toEqual(["Ls0"]);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(env.calls).toEqual([
			"index:joins/1",
			"setApiEndpoint:joins/1",
			"delete:joins/1:j9",
		]);
	});
});

describe("FormCrudMultiSelect: changes that are not saved yet", () => {
	/**
	 * The entries' texts as listed, the mark of a change included (also while the error
	 * dialog of a failed save hides the page)
	 */
	const listed = () =>
		screen
			.getAllByRole("listitem", { hidden: true })
			.map((item) => item.textContent);

	/** the field's dirty marker: "true", "false", or null where it shows no state */
	const marker = (container: HTMLElement) =>
		container.querySelector("[data-cc-dirty]")?.getAttribute("data-cc-dirty") ??
		null;

	const remove = async (label: string) => {
		fireEvent.click(screen.getByRole("button", { name: `Remove ${label}` }));
		await settle();
		await settle();
	};

	const restore = async (label: string) => {
		fireEvent.click(screen.getByRole("button", { name: `Restore ${label}` }));
		await settle();
		await settle();
	};

	it("[ISSUE-3505-ITEM-12] with the Form's showDirtyState the field is marked while a change is queued, and no longer once the save sent it", async () => {
		const { container, sink, ref } = await mountSelector(
			undefined,
			{},
			{ showDirtyState: true },
		);
		const before = marker(container);
		await add(ref);
		const queued = marker(container);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect({ before, queued, saved: marker(container) }).toEqual({
			before: "false",
			queued: "true",
			saved: "false",
		});
	});

	it("[ISSUE-3505-ITEM-12] is not marked without the Form's showDirtyState, and its own showDirtyState wins over the Form's", async () => {
		const first = await mountSelector();
		await add(first.ref);
		const withoutForms = marker(first.container);
		first.unmount();
		selSink.ctx = undefined;

		const second = await mountSelector(
			undefined,
			{ showDirtyState: false },
			{ showDirtyState: true },
		);
		await add(second.ref);
		const offOverForms = marker(second.container);
		second.unmount();
		selSink.ctx = undefined;

		const third = await mountSelector(undefined, { showDirtyState: true });
		await add(third.ref);
		const onWithoutForms = marker(third.container);

		expect({ withoutForms, offOverForms, onWithoutForms }).toEqual({
			withoutForms: null,
			offOverForms: null,
			onWithoutForms: "true",
		});
	});

	it("[ISSUE-3505-ITEM-12] marks a queued pick as added, in text, until the save sent it", async () => {
		const { sink, ref } = await mountSelector();
		await add(ref);
		const queued = listed();
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect({ queued, saved: listed() }).toEqual({
			queued: ["Ls1", "Ls2Added"],
			saved: ["Ls1", "Ls2"],
		});
	});

	it("[ISSUE-3505-ITEM-12] keeps a queued removal listed, struck through and marked removed, with a restore button instead of the remove button, until the save sent it", async () => {
		const { env, sink } = await mountSelector({
			"joins/1": [
				{ id: "j1", source_id: "s1" },
				{ id: "j2", source_id: "s2" },
			],
		});
		await remove("Ls1");

		expect(labels()).toEqual(["Ls2"]);
		expect(listed()).toEqual(["Ls2", "Ls1Removed"]);
		expect(
			screen.getByText("Ls1").closest(".CcMultiSelectEntry-removed"),
		).not.toBeNull();
		expect(screen.queryByRole("button", { name: "Remove Ls1" })).toBeNull();
		expect(
			screen.getByRole("button", { name: "Restore Ls1" }),
		).toBeInTheDocument();

		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(env.calls).toContain("delete:joins/1:j1");
		expect(listed()).toEqual(["Ls2"]);
	});

	it("[ISSUE-3505-ITEM-12] restoring a queued removal cancels it: the entry is selected again, and nothing is written", async () => {
		const { env, sink } = await mountSelector();
		await remove("Ls1");
		expect(sink.ctx!.dirty).toBe(true);

		await restore("Ls1");

		expect(labels()).toEqual(["Ls1"]);
		expect(listed()).toEqual(["Ls1"]);
		expect(
			screen.getByRole("button", { name: "Remove Ls1" }),
		).toBeInTheDocument();
		expect(sink.ctx!.dirty).toBe(false);
		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(env.calls).toEqual(["index:joins/1"]);
	});

	it("[ISSUE-3505-ITEM-12] an end adornment restores a queued removal by selecting the entry again", async () => {
		const { env, sink } = await mountSelector();
		await remove("Ls1");
		const [removed] = selSink.ctx!.removed as JoinData[];

		await select([...selected(), removed]);

		expect(labels()).toEqual(["Ls1"]);
		expect(selSink.ctx!.removed).toEqual([]);
		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(env.calls).toEqual(["index:joins/1"]);
	});

	it("[ISSUE-3505-ITEM-12] a queued pick that is removed again leaves the list: there is nothing to restore", async () => {
		const { sink, ref } = await mountSelector();
		await add(ref);
		expect(listed()).toEqual(["Ls1", "Ls2Added"]);
		await remove("Ls2");

		expect(listed()).toEqual(["Ls1"]);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3505-ITEM-12] shows the queued pick and removal again after the control was unmounted, and the removal can still be restored", async () => {
		const { env, sink, ref } = await mountSelector();
		await add(ref);
		await remove("Ls1");

		await hideAndShow();
		const afterRemount = listed();
		await restore("Ls1");
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(afterRemount).toEqual(["Ls2Added", "Ls1Removed"]);
		expect(env.calls).toEqual([
			"index:joins/1",
			"index:joins/1",
			"setApiEndpoint:joins/1",
			"create:joins/1:s2",
		]);
		expect(listed()).toEqual(["Ls2", "Ls1"]);
	});

	it("[ISSUE-3505-ITEM-12] after the control was unmounted, an end adornment restores a queued removal, listed with its own label", async () => {
		await mountSelector();
		await remove("Ls1");
		await hideAndShow();
		const [removed] = selSink.ctx!.removed as JoinData[];

		await select([...selected(), removed]);
		await settle();

		expect(listed()).toEqual(["Ls1"]);
	});

	it("[ISSUE-3505-ITEM-12] after a refused save, the entries the save did not send stay marked", async () => {
		const { env, sink, ref } = await mountSelector();
		env.refuse.add("s2");
		await remove("Ls1");
		await add(ref);

		expect(await trySubmit(sink)).not.toBeNull();
		await settle();

		// the removal was sent before the refused pick, the pick is still queued
		expect(env.calls).toContain("delete:joins/1:j1");
		expect(listed()).toEqual(["Ls2Added"]);
		expect(sink.ctx!.dirty).toBe(true);
	});
});

describe("FormCrudMultiSelect: a save the backend refuses in part", () => {
	/**
	 * The entries' texts as listed, the mark of a change included (also while the error
	 * dialog of the failed save hides the page)
	 */
	const listed = () =>
		screen
			.getAllByRole("listitem", { hidden: true })
			.map((item) => item.textContent);

	/** what a save's error lists: each refused write's entry, action and reason */
	const failuresOf = (error: unknown) =>
		(error as PartialApplyError<JoinData>).failures.map((failure) => [
			failure.entry.label,
			failure.action,
			failure.error.message,
		]);

	it("[ISSUE-3505-ITEM-11] a refused pick does not stop the save: the picks after it are sent, and only the refused one stays queued and marked", async () => {
		const { env, sink, ref } = await mountSelector();
		env.refuse.add("s3");
		await add(ref, "s2");
		await add(ref, "s3");
		await add(ref, "s4");

		expect(await trySubmit(sink)).not.toBeNull();
		await settle();

		expect(env.calls).toEqual([
			"index:joins/1",
			"setApiEndpoint:joins/1",
			"create:joins/1:s2",
			"create:joins/1:s3",
			"create:joins/1:s4",
		]);
		expect(listed()).toEqual(["Ls1", "Ls2", "Ls3Added", "Ls4"]);
		expect(sink.ctx!.dirty).toBe(true);
	});

	it("[ISSUE-3505-ITEM-11] the save's error names every refused entry by its label, and the form shows it in one dialog", async () => {
		const { env, sink, ref } = await mountSelector();
		env.refuse.add("s2").add("s4");
		await add(ref, "s2");
		await add(ref, "s3");
		await add(ref, "s4");

		const error = await trySubmit(sink);
		await screen.findByRole("dialog");
		await settle();

		expect(isPartialApplyError(error as Error)).toBe(true);
		expect(failuresOf(error)).toEqual([
			["Ls2", "create", "refused s2"],
			["Ls4", "create", "refused s4"],
		]);
		// a second modal dialog would hide the first from assistive technology
		const dialogs = screen.getAllByRole("dialog", { hidden: true });
		expect(dialogs).toHaveLength(1);
		expect(dialogs[0]).toHaveTextContent("Ls2: refused s2; Ls4: refused s4");
	});

	it("[ISSUE-3505-ITEM-11] a refused change of an entry is named too, as a refused update", async () => {
		const { env, sink } = await mountSelector();
		env.refuse.add("s1");
		await select([{ ...selected()[0], note: "changed" }]);

		const error = await trySubmit(sink);

		expect(env.calls).toContain("update:joins/1:j1:changed");
		expect((error as Error).message).toBe("Ls1: refused s1");
		expect(failuresOf(error)).toEqual([["Ls1", "update", "refused s1"]]);
	});

	it("[ISSUE-3505-ITEM-11] a removal queued after a refused pick waits for it: it stays listed as removed, and the next save sends both", async () => {
		const { env, sink, ref } = await mountSelector({
			"joins/1": [
				{ id: "j1", source_id: "s1" },
				{ id: "j9", source_id: "s9" },
			],
		});
		env.refuse.add("s2");
		await add(ref, "s2");
		fireEvent.click(screen.getByRole("button", { name: "Remove Ls9" }));
		await settle();
		await settle();

		expect(await trySubmit(sink)).not.toBeNull();
		await settle();
		const sentFirst = [...env.calls];
		const listedAfterRefusal = listed();
		env.refuse.clear();
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(sentFirst).toEqual([
			"index:joins/1",
			"setApiEndpoint:joins/1",
			"create:joins/1:s2",
		]);
		expect(listedAfterRefusal).toEqual(["Ls1", "Ls2Added", "Ls9Removed"]);
		expect(env.calls.slice(sentFirst.length)).toEqual([
			"setApiEndpoint:joins/1",
			"create:joins/1:s2",
			"delete:joins/1:j9",
		]);
		expect(listed()).toEqual(["Ls1", "Ls2"]);
	});

	it("[ISSUE-3505-ITEM-27] a save whose queued writes failed for the connection is not reported, one the backend refused is", async () => {
		const before = { ...getErrorReportingConfig() };
		const report = vi.fn();
		configureErrorReporting({ report, shouldReport: defaultShouldReportError });
		try {
			const { env, sink, ref } = await mountSelector();
			// the queue binds the real connector's create as the pick is queued
			vi.spyOn(env.connectors[0], "create")
				.mockRejectedValueOnce(new NetworkError("offline"))
				.mockRejectedValueOnce(new BackendError("Person 2 is archived"));
			await add(ref, "s2");

			const offline = await trySubmit(sink);
			await settle();
			const refused = await trySubmit(sink);
			await settle();

			expect(isPartialApplyError(offline as Error)).toBe(true);
			expect(isPartialApplyError(refused as Error)).toBe(true);
			expect(report).toHaveBeenCalledTimes(1);
			expect(report).toHaveBeenCalledWith(
				refused,
				expect.objectContaining({ source: "FormEngine.submit" }),
			);
		} finally {
			configureErrorReporting(before);
		}
	});
});

describe("useLazyCrudConnector: after the queue was sent", () => {
	/**
	 * The test's request log, for callbacks made before mountSelector hands it out
	 */
	const log: { env?: Env } = {};

	beforeEach(() => {
		log.env = undefined;
	});

	it("[ISSUE-3505-ITEM-13] onQueueSent runs on every save once the queue was sent, with the saved record's id and the connector, which maps a picked entry's client-side id to the server's", async () => {
		const mapped: string[] = [];
		let picked = "";
		const onQueueSent = vi.fn((id: string, connector: LazyConnector) => {
			log.env!.calls.push(`onQueueSent:${id}`);
			mapped.push(connector.mapId(picked));
		});
		const { env, sink, ref } = await mountSelector(undefined, {
			onQueueSent,
		});
		log.env = env;
		await add(ref);
		picked = selected().find((entry) => entry.source_id === "s2")!.value;

		expect(await trySubmit(sink)).toBeNull();
		await settle();
		// a save with nothing queued, of a changed field of the record
		act(() => sink.ctx!.setFieldValue("title", "Changed"));
		await settle();
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(picked).toMatch(/^fake-id-/);
		expect(env.calls).toEqual([
			"index:joins/1",
			"setApiEndpoint:joins/1",
			"create:joins/1:s2",
			"onQueueSent:1",
			"setApiEndpoint:joins/1",
			"onQueueSent:1",
		]);
		const created = env.stores["joins/1"].find(
			(row) => row.source_id === "s2",
		)!;
		expect(mapped).toEqual([created.id, created.id]);
		expect(onQueueSent.mock.calls[0][1]).toBeInstanceOf(LazyConnector);
	});

	it("[ISSUE-3505-ITEM-13] the save waits for onQueueSent before the Form's onSubmit, and fails when it rejects", async () => {
		const order: string[] = [];
		let refuse = false;
		const onQueueSent = async () => {
			await Promise.resolve();
			if (refuse) throw new Error("primary refused");
			order.push("onQueueSent done");
		};
		const { sink, ref } = await mountSelector(
			undefined,
			{ onQueueSent },
			{ onSubmit: () => void order.push("onSubmit") },
		);
		await add(ref);

		expect(await trySubmit(sink)).toBeNull();
		await settle();
		refuse = true;
		act(() => sink.ctx!.setFieldValue("title", "Changed"));
		await settle();
		const error = await trySubmit(sink);
		await settle();

		expect(order).toEqual(["onQueueSent done", "onSubmit"]);
		expect((error as Error).message).toBe("primary refused");
	});

	it("[ISSUE-3505-ITEM-13] onQueueSent is not called while the backend refuses a write of the queue", async () => {
		const onQueueSent = vi.fn<(id: string) => void>();
		const { env, sink, ref } = await mountSelector(undefined, {
			onQueueSent,
		});
		env.refuse.add("s2");
		await add(ref);

		expect(await trySubmit(sink)).not.toBeNull();
		await settle();
		expect(onQueueSent).not.toHaveBeenCalled();

		env.refuse.clear();
		expect(await trySubmit(sink)).toBeNull();
		await settle();
		expect(onQueueSent.mock.calls.map((call) => call[0])).toEqual(["1"]);
	});

	it("[ISSUE-3505-ITEM-13] the save calls the onQueueSent of the control's latest render", async () => {
		const first = vi.fn<(id: string) => void>();
		const later = vi.fn<(id: string) => void>();
		const { sink, ref } = await mountVariants(
			{ "joins/1": [] },
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					ref={ref}
					{...props}
					onQueueSent={current === "a" ? first : later}
				/>
			),
		);

		await switchVariant("b");
		await add(ref);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(first).not.toHaveBeenCalled();
		expect(later.mock.calls.map((call) => call[0])).toEqual(["1"]);
	});

	it("[ISSUE-3505-ITEM-13] a control mounted again under its field has the save call its own onQueueSent", async () => {
		const first = vi.fn<(id: string) => void>();
		const later = vi.fn<(id: string) => void>();
		const { sink, ref } = await mountVariants(
			{ "joins/1": [] },
			(current, props, ref) => (
				<FormCrudMultiSelect<ModelUnknown, JoinData>
					key={current}
					ref={ref}
					{...props}
					onQueueSent={current === "a" ? first : later}
				/>
			),
		);

		selSink.ctx = undefined;
		await switchVariant("b");
		await ready();
		await add(ref);
		expect(await trySubmit(sink)).toBeNull();
		await settle();

		expect(first).not.toHaveBeenCalled();
		expect(later.mock.calls.map((call) => call[0])).toEqual(["1"]);
	});
});
