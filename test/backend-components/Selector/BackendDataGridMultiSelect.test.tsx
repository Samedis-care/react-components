/**
 * BackendDataGridMultiSelect over 30 people P1..P30 (GridTestConnector, which pages by
 * offset and honours id inSet/notInSet): how the field is named, what it says about
 * the selection, and the row counts it gives the grid.
 *
 * DataGrid is wrapped so the test can read its props (store.props) and call its loadData
 * like the grid does (page slots, see replayPages); with store.real the real grid renders
 * as well. MultiGrid (the cells) is not rendered in jsdom.
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import BackendDataGridMultiSelect, {
	BackendDataGridMultiSelectProps,
} from "../../../src/backend-components/Selector/BackendDataGridMultiSelect";
import FormField from "../../../src/backend-components/Form/Field";
import {
	ModelDataTypeBackendDataGridMultiSelectRenderer,
	ModelUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityEditRequired,
} from "../../../src/backend-integration";
import type {
	DataGridData,
	DataGridProps,
	IDataGridLoadDataParameters,
} from "../../../src/standalone/DataGrid/DataGrid";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import type { ConnectorIndex2Params } from "../../../src/backend-integration/Connector/Connector";
import {
	capture,
	makeModel,
	mountForm,
	recordData,
	setupFormTests,
	Sink,
} from "../Form/formFixture";
import {
	flush,
	GridTestConnector,
	makeSelectorModel,
	Row,
} from "./backendSelectorFixture";

const store = vi.hoisted(() => ({
	props: null as Record<string, unknown> | null,
	real: false,
}));

vi.mock("../../../src/standalone/DataGrid/DataGrid", async (importOriginal) => {
	const original =
		await importOriginal<
			typeof import("../../../src/standalone/DataGrid/DataGrid")
		>();
	const { createElement } = await import("react");
	const DataGridProbe = (props: Record<string, unknown>) => {
		store.props = props;
		return store.real
			? createElement(original.default, props as unknown as DataGridProps)
			: null;
	};
	return { ...original, default: DataGridProbe };
});

// MultiGrid draws the cells; without it the header, the footer and the loads remain
vi.mock("../../../src/standalone/Virtualized/MultiGrid", () => ({
	default: () => null,
}));

setupFormTests();

window.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as never;

/** P1..P30 with ids "1".."30" */
const rows30 = (): Row[] =>
	Array.from({ length: 30 }, (_, index) => ({
		id: String(index + 1),
		name: "P" + String(index + 1),
	}));

const gridModel = () => {
	const connector = new GridTestConnector(rows30());
	return { connector, model: makeSelectorModel(connector) };
};

type Props = Partial<BackendDataGridMultiSelectProps<ModelUnknown>> & {
	model: ModelUnknown;
};

const ui = (props: Props) => (
	<Framework>
		<div style={{ height: 500 }}>
			<BackendDataGridMultiSelect
				selected={[]}
				onChange={() => {}}
				{...props}
			/>
		</div>
	</Framework>
);

const gridProps = () => store.props as unknown as DataGridProps;

const query = (
	page: number,
	quickFilter = "",
): IDataGridLoadDataParameters => ({
	page,
	rows: 10,
	quickFilter,
	sort: [],
	fieldFilter: {},
	additionalFilters: {},
});

const idsOf = (data: DataGridData) => data.rows.map((row) => row.id);

/**
 * Loads pages 1..pages like DataGrid does: a page whose first slot is filled is skipped,
 * and every returned row is stored at pageIndex * 10 + i
 */
const replayPages = async (pages: number) => {
	const slots: Record<number, string> = {};
	for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
		if (pageIndex * 10 in slots) continue;
		const data = await gridProps().loadData(query(pageIndex + 1));
		data.rows.forEach((row, i) => (slots[pageIndex * 10 + i] = row.id));
	}
	return slots;
};

const mount = async (props: Props) => {
	store.props = null;
	store.real = false;
	const result = render(ui(props));
	await flush();
	return result;
};

/** a form whose field "recipients" is a BackendDataGridMultiSelect over people */
const recipientsForm = (
	people: ModelUnknown,
	visibility: Record<string, unknown> = {
		overview: ModelVisibilityDisabled,
		edit: ModelVisibilityEdit,
		create: ModelVisibilityEdit,
	},
) =>
	makeModel(
		{},
		new MockConnector(
			recordData().map((record) => ({ ...record, recipients: ["2"] })),
		),
		{
			recipients: {
				type: new ModelDataTypeBackendDataGridMultiSelectRenderer(),
				getLabel: () => "Recipients",
				getRelationModel: () => people,
				visibility: visibility as never,
				customData: null,
			},
		},
	);

/** the field with its selection in a parent's state, starting with initial */
const StatefulField = (props: Props & { initial: string[] }) => {
	const { initial, ...fieldProps } = props;
	const [selected, setSelected] = React.useState(initial);
	return (
		<Framework>
			<div style={{ height: 500 }}>
				<BackendDataGridMultiSelect
					{...fieldProps}
					selected={selected}
					onChange={setSelected}
				/>
			</div>
		</Framework>
	);
};

/** GridTestConnector whose offset queries (index2) wait while gate is set */
class HeldGridConnector extends GridTestConnector {
	gate: Promise<void> | null = null;

	async index2(params: ConnectorIndex2Params) {
		if (this.gate) await this.gate;
		return super.index2(params);
	}
}

// ---------------------------------------------------------------------------
// Bugs (each test asserts the correct behavior and fails until it is fixed)
// ---------------------------------------------------------------------------

describe("BackendDataGridMultiSelect bugs", () => {
	it("[ISSUE-3510-ITEM-4] scrolling through the pages lists every record exactly once", async () => {
		const { model, connector } = gridModel();
		await mount({ model, selected: ["3", "23"] });
		const slots = await replayPages(3);
		const listed = Object.values(slots);
		expect(listed).toHaveLength(30);
		expect(new Set(listed).size).toBe(30);
		connector.log
			.filter((entry) => entry.startsWith("index2:"))
			.forEach((entry) => {
				const rows = Number(/\+(\d+)/.exec(entry)![1]);
				expect(rows).toBeLessThanOrEqual(10);
			});
	});

	it("[ISSUE-3510-ITEM-4] with more selected records than a page holds, every record is listed once, and only the pages with selected rows ask for them", async () => {
		const { model, connector } = gridModel();
		// 2, 4, .., 24: page 1 holds ten of them, page 2 the last two
		const selected = Array.from({ length: 12 }, (_, index) =>
			String(2 * (index + 1)),
		);
		const ids = selected.join(",");
		await mount({ model, selected });
		const slots = await replayPages(3);
		expect(Object.values(slots)).toEqual([
			// page 1 and the first two rows of page 2
			...selected,
			// the rest of page 2 and page 3
			...["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23"],
			...["25", "26", "27", "28", "29", "30"],
		]);
		expect(connector.log).toEqual([
			"index::ids=" + ids,
			"index2:0+0:not=" + ids,
			"index::ids=" + ids,
			"index2:0+8:not=" + ids,
			"index2:8+10:not=" + ids,
		]);
	});

	it("[ISSUE-3510-ITEM-4] a page loaded before the pages above it counts the selected records first, and asks for its own rows", async () => {
		const { model, connector } = gridModel();
		await mount({ model, selected: ["3", "23"] });
		// e.g. a refresh while the grid shows the last page
		const page3 = await gridProps().loadData(query(3));
		expect(idsOf(page3)).toEqual([
			"20",
			"21",
			"22",
			"24",
			"25",
			"26",
			"27",
			"28",
			"29",
			"30",
		]);
		expect(page3.rowsFiltered).toBe(30);
		expect(connector.log).toEqual(["index::ids=3,23", "index2:18+10:not=3,23"]);
	});

	it("[ISSUE-3510-ITEM-4] 'Select all' over three pages selects every record once", async () => {
		const { model } = gridModel();
		store.real = true;
		render(
			<StatefulField
				model={model}
				initial={["3", "23"]}
				enableSelectAll
				rowsPerPage={10}
			/>,
		);
		const all = await screen.findByRole("checkbox", { name: "All" });
		await flush();
		act(() => all.click());
		// the grid loads pages 2 and 3, then reports the ids
		await waitFor(() =>
			expect(gridProps().selection![1].length).toBeGreaterThan(2),
		);
		const ids = gridProps().selection![1];
		expect(ids).toHaveLength(30);
		expect(new Set(ids).size).toBe(30);
		expect(screen.getByRole("status")).toHaveTextContent("Selected: 30");
	});

	it("[ISSUE-3510-ITEM-10] with a connector that reports filteredRows, the counts are the collection and the matches", async () => {
		const { model } = gridModel();
		await mount({ model, selected: ["3", "23"] });
		// "P1" matches P1 and P10..P19, none of them selected
		const data = await gridProps().loadData(query(1, "P1"));
		expect(idsOf(data)).toHaveLength(10);
		expect(data.rowsFiltered).toBe(11);
		expect(data.rowsTotal).toBe(30);
	});

	it("[ISSUE-3510-ITEM-10] with a connector that reports filteredRows, a selected match is counted once, among the matches", async () => {
		const { model } = gridModel();
		await mount({ model, selected: ["3", "23"] });
		// "P2" matches P2 and P20..P29, the selected P23 among them
		const search = await gridProps().loadData(query(1, "P2"));
		expect(idsOf(search)[0]).toBe("23");
		expect(search.rowsFiltered).toBe(11);
		expect(search.rowsTotal).toBe(30);
		// without a search every record matches, the selected ones included
		const all = await gridProps().loadData(query(1));
		expect(all.rowsFiltered).toBe(30);
		expect(all.rowsTotal).toBe(30);
	});

	it("[ISSUE-3510-ITEM-10] with a connector that reports only totalRows, as the filtered count (like SCF's), the total is the selected matches plus the others", async () => {
		const { model, connector } = gridModel();
		connector.reportFiltered = false;
		await mount({ model, selected: ["3", "23"] });
		const all = await gridProps().loadData(query(1));
		expect(all.rowsTotal).toBe(30);
		expect(all.rowsFiltered).toBeUndefined();
		// "P2" matches P2 and P20..P29, the selected P23 among them
		const search = await gridProps().loadData(query(1, "P2"));
		expect(search.rowsTotal).toBe(11);
		expect(search.rowsFiltered).toBeUndefined();
	});

	it("[ISSUE-3510-ITEM-11] after an untick the next page continues where the loaded ones stopped", async () => {
		const { model } = gridModel();
		const { rerender } = await mount({ model, selected: ["3", "23"] });
		const page1 = await gridProps().loadData(query(1));
		expect(idsOf(page1)).toEqual([
			"3",
			"23",
			"1",
			"2",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
		]);
		// the user unticks 23; the grid keeps the loaded page and loads the next one
		rerender(ui({ model, selected: ["3"] }));
		await flush();
		const page2 = idsOf(await gridProps().loadData(query(2)));
		expect(page2[0]).toBe("10");
		expect(page2).not.toContain("23");
	});

	it("[ISSUE-3510-ITEM-11] a reload (a search or a refresh) lists the records selected at its start first", async () => {
		const { model } = gridModel();
		const { rerender } = await mount({ model, selected: ["3", "23"] });
		await gridProps().loadData(query(1));
		// the user unticks 23 and searches "P2" (P2 and P20..P29): 23 is listed in its place
		rerender(ui({ model, selected: ["3"] }));
		await flush();
		const search = await gridProps().loadData(query(1, "P2"));
		expect(idsOf(search)).toEqual([
			"2",
			"20",
			"21",
			"22",
			"23",
			"24",
			"25",
			"26",
			"27",
			"28",
		]);
		// the user ticks 23 again; a refresh of the same search lists it first
		rerender(ui({ model, selected: ["3", "23"], forceRefreshToken: "r1" }));
		await flush();
		const refreshed = await gridProps().loadData(query(1, "P2"));
		expect(idsOf(refreshed)).toEqual([
			"23",
			"2",
			"20",
			"21",
			"22",
			"24",
			"25",
			"26",
			"27",
			"28",
		]);
	});

	it("[ISSUE-3510-ITEM-12] 'Select all' does not empty the selection", async () => {
		const { model } = gridModel();
		const onChange = vi.fn();
		store.real = true;
		render(ui({ model, selected: ["1"], onChange, enableSelectAll: true }));
		const all = await screen.findByRole("checkbox", { name: "All" });
		await flush();
		act(() => all.click());
		await flush();
		expect(onChange).not.toHaveBeenCalledWith([]);
	});

	it("[ISSUE-3510-ITEM-12] 'Select all' selects every record by its id, the pages the grid hasn't loaded too, and unticked it clears the selection", async () => {
		const { model } = gridModel();
		store.real = true;
		render(<StatefulField model={model} initial={["7"]} enableSelectAll />);
		const all = await screen.findByRole("checkbox", { name: "All" });
		await flush();
		// the grid shows the first page of 25 rows: select all loads the second
		act(() => all.click());
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("Selected: 30"),
		);
		const ids = gridProps().selection![1];
		expect([...ids].sort((a, b) => Number(a) - Number(b))).toEqual(
			rows30().map((row) => row.id),
		);
		expect(gridProps().selection![0]).toBe(false);
		expect(all).toBeChecked();
		act(() => all.click());
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("Selected: 0"),
		);
		expect(all).not.toBeChecked();
	});

	it("[ISSUE-3510-ITEM-12] with limitSelectAll, 'Select all' selects the first records in the grid's order, the selected ones first", async () => {
		const { model } = gridModel();
		store.real = true;
		render(
			<StatefulField
				model={model}
				initial={["7"]}
				enableSelectAll
				limitSelectAll={5}
			/>,
		);
		const first = await screen.findByRole("checkbox", { name: "First 5" });
		await flush();
		// 30 records match, more than the limit
		expect(first).toHaveAccessibleName("First 5");
		act(() => first.click());
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("Selected: 5"),
		);
		expect(gridProps().selection).toEqual([false, ["7", "1", "2", "3", "4"]]);
		expect(first).toBeChecked();
	});

	it("[ISSUE-3510-ITEM-16] as a form field the grid is labelled with the field's label", async () => {
		const { model: people } = gridModel();
		store.real = true;
		const formModel = makeModel(
			{},
			new MockConnector(
				recordData().map((record) => ({ ...record, recipients: ["2"] })),
			),
			{
				recipients: {
					type: new ModelDataTypeBackendDataGridMultiSelectRenderer(),
					getLabel: () => "Recipients",
					getRelationModel: () => people,
					visibility: {
						overview: ModelVisibilityDisabled,
						edit: ModelVisibilityEdit,
						create: ModelVisibilityEdit,
					},
					customData: null,
				},
			},
		);
		const sink: Sink = {};
		mountForm(
			formModel,
			capture(sink, () => <FormField name={"recipients"} />),
		);
		await waitFor(() => expect(sink.ctx?.values.recipients).toEqual(["2"]));
		await waitFor(() => expect(store.props).not.toBeNull());
		// the field (a group or region around the grid) or the grid itself carries the label
		const named = (["group", "region", "grid"] as const).flatMap((role) =>
			screen.queryAllByRole(role, { name: "Recipients" }),
		);
		expect(named).not.toHaveLength(0);
	});

	it("[ISSUE-3510-ITEM-16] label names the field when it is used on its own", async () => {
		const { model } = gridModel();
		store.real = true;
		render(ui({ model, label: "Recipients" }));
		await flush();
		const group = screen.getByRole("group", { name: "Recipients" });
		// the grid itself (MultiGrid) is not rendered here: its root is
		expect(group.querySelector("[class*=CcDataGrid-root]")).not.toBeNull();
		expect(screen.getByText("Recipients")).toBeVisible();
	});

	it("[ISSUE-3510-ITEM-16] the number of selected rows is shown as a polite status that describes the field and follows the selection", async () => {
		const { model } = gridModel();
		store.real = false;
		const { rerender } = render(
			ui({ model, label: "Recipients", selected: ["2", "3"] }),
		);
		await flush();
		const status = screen.getByRole("status");
		expect(status).toHaveTextContent("Selected: 2");
		const group = screen.getByRole("group", { name: "Recipients" });
		expect(group).toHaveAccessibleDescription("Selected: 2");
		rerender(ui({ model, label: "Recipients", selected: ["2"] }));
		await flush();
		expect(screen.getByRole("status")).toBe(status);
		expect(status).toHaveTextContent("Selected: 1");
		expect(group).toHaveAccessibleDescription("Selected: 1");
	});

	it("[ISSUE-3510-ITEM-16] the count is shown without a label too, and a tick reaches it through the parent", async () => {
		const { model } = gridModel();
		store.real = false;
		const Parent = () => {
			const [selected, setSelected] = React.useState<string[]>([]);
			return (
				<Framework>
					<div style={{ height: 500 }}>
						<BackendDataGridMultiSelect
							model={model}
							selected={selected}
							onChange={setSelected}
						/>
					</div>
				</Framework>
			);
		};
		render(<Parent />);
		await flush();
		expect(screen.getByRole("status")).toHaveTextContent("Selected: 0");
		// the grid's first report after mounting is ignored, then a tick
		act(() => gridProps().onSelectionChange!(false, []));
		act(() => gridProps().onSelectionChange!(false, ["4", "5", "6"]));
		await flush();
		expect(screen.getByRole("status")).toHaveTextContent("Selected: 3");
	});

	it("[ISSUE-3510-ITEM-16] as a required form field the label is marked required, and leaving the grid marks the field touched", async () => {
		const { model: people } = gridModel();
		store.real = true;
		const sink: Sink = {};
		mountForm(
			recipientsForm(people, {
				overview: ModelVisibilityDisabled,
				edit: ModelVisibilityEditRequired,
				create: ModelVisibilityEditRequired,
			}),
			capture(sink, () => <FormField name={"recipients"} />),
		);
		await waitFor(() => expect(sink.ctx?.values.recipients).toEqual(["2"]));
		await flush();
		const group = screen.getByRole("group", { name: /^Recipients/ });
		expect(group.querySelector("legend")).toHaveTextContent(/Recipients\s*\*/);
		expect(screen.getByRole("status")).toHaveTextContent("Selected: 1");
		expect(sink.ctx?.touched.recipients).toBeFalsy();
		const search = group.querySelector("input")!;
		act(() => search.focus());
		fireEvent.blur(search);
		await flush();
		expect(sink.ctx?.touched.recipients).toBe(true);
	});

	it("[ISSUE-3510-ITEM-13] read-only: no row can be ticked, select all is disabled, and a change the grid reports does not reach onChange", async () => {
		const { model } = gridModel();
		const onChange = vi.fn();
		store.real = true;
		render(
			ui({
				model,
				selected: ["3"],
				onChange,
				readOnly: true,
				enableSelectAll: true,
			}),
		);
		const all = await screen.findByRole("checkbox", { name: "All" });
		await flush();
		expect(all).toBeDisabled();
		// the row checkboxes are drawn by MultiGrid (not rendered here) from canSelectRow
		const canSelectRow = gridProps().canSelectRow;
		expect(canSelectRow?.({ id: "3" })).toBe(false);
		expect(canSelectRow?.({ id: "4" })).toBe(false);
		act(() => gridProps().onSelectionChange!(false, ["3", "4"]));
		await flush();
		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3510-ITEM-13] read-only turned on and off after mounting refuses and allows ticks again, with the canSelectRow passed", async () => {
		const { model } = gridModel();
		const onChange = vi.fn();
		const canSelectRow = (record: Record<string, unknown>) => record.id !== "4";
		const props = {
			model,
			selected: ["3"],
			onChange,
			canSelectRow,
			enableSelectAll: true,
		};
		const { rerender } = await mount(props);
		// the grid's first report after mounting
		act(() => gridProps().onSelectionChange!(false, ["3"]));
		expect(gridProps().canSelectRow?.({ id: "5" })).toBe(true);
		expect(gridProps().canSelectRow?.({ id: "4" })).toBe(false);
		expect(gridProps().enableSelectAll).toBe(true);
		rerender(ui({ ...props, readOnly: true }));
		await flush();
		expect(gridProps().canSelectRow?.({ id: "5" })).toBe(false);
		expect(gridProps().enableSelectAll).toBe(false);
		act(() => gridProps().onSelectionChange!(false, ["3", "5"]));
		expect(onChange).not.toHaveBeenCalled();
		rerender(ui({ ...props, readOnly: false }));
		await flush();
		expect(gridProps().canSelectRow?.({ id: "5" })).toBe(true);
		expect(gridProps().canSelectRow?.({ id: "4" })).toBe(false);
		expect(gridProps().enableSelectAll).toBe(true);
		act(() => gridProps().onSelectionChange!(false, ["3", "5"]));
		expect(onChange.mock.calls).toEqual([[["3", "5"]]]);
	});

	it("[ISSUE-3510-ITEM-13] a select all still loading when the field turns read-only (as for a save) is not taken: the value and the grid keep the selection", async () => {
		const connector = new HeldGridConnector(rows30());
		const model = makeSelectorModel(connector);
		store.real = true;
		const { rerender } = render(
			<StatefulField model={model} initial={["7"]} enableSelectAll />,
		);
		const all = await screen.findByRole("checkbox", { name: "All" });
		await flush();
		let release!: () => void;
		connector.gate = new Promise<void>((resolve) => (release = resolve));
		// the grid shows the first page of 25 rows: select all loads the second
		act(() => all.click());
		await flush();
		expect(all).toHaveAttribute("aria-busy", "true");
		rerender(
			<StatefulField model={model} initial={["7"]} enableSelectAll readOnly />,
		);
		await flush();
		connector.gate = null;
		release();
		await flush();
		expect(screen.getByRole("status")).toHaveTextContent("Selected: 1");
		expect(screen.getByRole("checkbox", { name: "All" })).not.toBeChecked();
	});
});
