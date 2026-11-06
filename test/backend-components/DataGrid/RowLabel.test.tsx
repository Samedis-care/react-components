/**
 * The row labels of the model-backed grids: BackendDataGrid (and so CRUD's
 * grid) and BackendDataGridMultiSelect take a getRowLabel over the model's
 * record and hand the DataGrid one over its rendered rows.
 *
 * MultiGrid is real here, so the row checkboxes render. AutoSizer measures
 * nothing in jsdom, so it is given a size.
 */
import React, { useEffect } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import BackendDataGrid from "../../../src/backend-components/DataGrid";
import BackendDataGridMultiSelect from "../../../src/backend-components/Selector/BackendDataGridMultiSelect";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelRecord,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityGridView,
	ModelVisibilityHidden,
} from "../../../src/backend-integration";
import MockConnector from "../../../src/stories/test-utils/MockConnector";

const SIZE = { width: 1000, height: 500 };
vi.mock("react-virtualized-auto-sizer", () => ({
	AutoSizer: (props: {
		onResize?: (s: { width: number; height: number }) => void;
		renderProp: (s: { width: number; height: number }) => React.ReactNode;
	}) => {
		const { onResize, renderProp } = props;
		useEffect(() => onResize?.(SIZE), [onResize]);
		return <>{renderProp(SIZE)}</>;
	},
}));

beforeAll(() => {
	// jsdom has neither; MUI's useMediaQuery and the grid need them
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
	window.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as never;
	// MultiGrid syncs the panes with scrollTo, which jsdom lacks
	if (!("scrollTo" in Element.prototype))
		Object.defineProperty(Element.prototype, "scrollTo", {
			configurable: true,
			writable: true,
			value: () => {},
		});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const gridField = (label: string) => ({
	type: new ModelDataTypeStringRendererMUI(),
	getLabel: () => label,
	visibility: {
		overview: ModelVisibilityGridView,
		edit: ModelVisibilityEdit,
		create: ModelVisibilityEdit,
	},
	customData: null,
});

/** people with a name and a nested contact e-mail, both shown in the grid */
const makePeopleModel = () =>
	new Model(
		"row-label-" + Math.random().toString(16),
		{
			id: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "ID",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityHidden,
					create: ModelVisibilityDisabled,
				},
				customData: null,
			},
			name: gridField("Name"),
			"contact.email": gridField("E-mail"),
		},
		new MockConnector([
			{ id: "1", name: "Alice", contact: { email: "alice@example.com" } },
			{ id: "2", name: "Bob", contact: { email: "bob@example.com" } },
		]),
	);
type PeopleModel = ReturnType<typeof makePeopleModel>;

const labelOf = (record: ModelRecord<PeopleModel>) =>
	`${record.name} <${record.contact.email}>`;

describe("BackendDataGrid: getRowLabel", () => {
	it("[ISSUE-3493-ITEM-13] getRowLabel gets the model's record, nested and with the values before rendering, and names the row checkboxes", async () => {
		const model = makePeopleModel();
		const getRowLabel = vi.fn(labelOf);
		render(
			<Framework>
				<BackendDataGrid model={model} getRowLabel={getRowLabel} />
			</Framework>,
		);
		expect(
			await screen.findByRole("checkbox", {
				name: "Select Alice <alice@example.com>",
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("checkbox", { name: "Select Bob <bob@example.com>" }),
		).toBeInTheDocument();
		const record = getRowLabel.mock.calls.find(([r]) => r.id === "1")![0];
		expect(record).toEqual({
			id: "1",
			name: "Alice",
			contact: { email: "alice@example.com" },
		});
	});

	it("[ISSUE-3493-ITEM-13] without getRowLabel the row checkboxes are named by the first text column", async () => {
		render(
			<Framework>
				<BackendDataGrid model={makePeopleModel()} />
			</Framework>,
		);
		expect(
			await screen.findByRole("checkbox", { name: "Select Alice" }),
		).toBeInTheDocument();
	});
});

describe("BackendDataGridMultiSelect: getRowLabel", () => {
	it("[ISSUE-3493-ITEM-13] getRowLabel gets the model's record and names the row checkboxes", async () => {
		const getRowLabel = vi.fn(labelOf);
		render(
			<Framework>
				<BackendDataGridMultiSelect
					model={makePeopleModel()}
					selected={[]}
					onChange={() => {}}
					getRowLabel={getRowLabel}
				/>
			</Framework>,
		);
		expect(
			await screen.findByRole("checkbox", {
				name: "Select Bob <bob@example.com>",
			}),
		).toBeInTheDocument();
		expect(getRowLabel).toHaveBeenCalledWith({
			id: "2",
			name: "Bob",
			contact: { email: "bob@example.com" },
		});
	});
});
