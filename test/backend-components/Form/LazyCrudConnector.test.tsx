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
} from "./formFixture";
import {
	FormContextData,
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FormCrudMultiSelect, {
	FormCrudMultiSelectProps,
} from "../../../src/backend-components/Form/CrudControls/FormCrudMultiSelect";
import ApiConnector from "../../../src/backend-integration/Connector/ApiConnector";
import type { ResponseMeta } from "../../../src/backend-integration/Connector/Connector";
import { useCrudSelectContext } from "../../../src/backend-components/Selector/CrudMultiSelect";
import type {
	CrudSelectDispatch,
	UseCrudSelectResult,
} from "../../../src/backend-components/Selector/useCrudSelect";
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
