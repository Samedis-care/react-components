/**
 * BackendDataGridMultiSelect over 30 people P1..P30 (GridTestConnector, which pages by
 * offset and honours id inSet/notInSet): how the field is named, what it says about
 * the selection, and the row counts it gives the grid.
 *
 * DataGrid is wrapped so the test can read its props (store.props) and call its loadData
 * like the grid does; with store.real the real grid renders as well. MultiGrid (the cells)
 * is not rendered in jsdom.
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

// ---------------------------------------------------------------------------
// Bugs (each test asserts the correct behavior and fails until it is fixed)
// ---------------------------------------------------------------------------

describe("BackendDataGridMultiSelect bugs", () => {
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
});
