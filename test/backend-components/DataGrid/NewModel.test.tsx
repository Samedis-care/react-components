/**
 * BackendDataGrid given a new model instance (BackendDataGridProps.model): the
 * columns follow it at once, while the rows it already loaded stay and nothing is
 * requested. A model for other data loads its rows when the grid is remounted with
 * a key, or when forceRefreshToken changes in the same render.
 *
 * MultiGrid is real here, so the headers and the rows render. AutoSizer measures
 * nothing in jsdom, so it is given a size.
 */
import React, { useEffect } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import BackendDataGrid from "../../../src/backend-components/DataGrid";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelVisibility,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityGridView,
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
	vi.useRealTimers();
	vi.restoreAllMocks();
});

const field = (label: string, overview: ModelVisibility) => ({
	type: new ModelDataTypeStringRendererMUI(),
	getLabel: () => label,
	visibility: {
		overview,
		edit: ModelVisibilityEdit,
		create: ModelVisibilityEdit,
	},
	customData: null,
});

/**
 * A model of people (an id and a name column) on the given connector, built as an
 * app builds one: under the same name for the same data, with the header of the
 * name column it is given (e.g. in the current language)
 */
const peopleModel = (
	name: string,
	connector: MockConnector,
	nameLabel = "Name",
) =>
	new Model(
		name,
		{
			id: field("ID", ModelVisibilityDisabled),
			name: field(nameLabel, ModelVisibilityGridView),
		},
		connector,
	);

const modelName = () => "new-model-" + Math.random().toString(16);

const CLASSES = {
	header: "test-header",
	columnHeaderLabel: "test-column-header",
};

/** The grid's header (search, buttons) */
const header = () => document.querySelector<HTMLElement>(".test-header")!;

/** The texts of the column headers */
const columnHeaders = () =>
	Array.from(
		document.querySelectorAll(".test-column-header"),
		(label) => label.textContent,
	);

/** Lets the grid's reload delay pass, so a reload it started would have run */
const passReloadDelay = async () => {
	act(() => void vi.advanceTimersByTime(700));
	await act(async () => {});
};

describe("BackendDataGrid: a new model", () => {
	it("[ISSUE-3506-ITEM-3] a new model instance for the same data, e.g. rebuilt with the labels of another language, shows its headers at once, keeps the rows and sends no request", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const connector = new MockConnector([
			{ id: "1", name: "Alice" },
			{ id: "2", name: "Bob" },
		]);
		const index = vi.spyOn(connector, "index");
		const name = modelName();
		const grid = (nameLabel: string) => (
			<Framework>
				<BackendDataGrid
					model={peopleModel(name, connector, nameLabel)}
					classes={CLASSES}
				/>
			</Framework>
		);
		const { rerender } = render(grid("Name"));
		expect(await screen.findByText("Alice")).toBeInTheDocument();
		expect(columnHeaders()).toEqual(["Name"]);

		rerender(grid("Nom"));
		expect(columnHeaders(), "the headers of the new instance").toEqual(["Nom"]);
		await passReloadDelay();
		expect(index, "the requests").toHaveBeenCalledTimes(1);
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
	});

	it("[ISSUE-3506-ITEM-3] a model for other data with a new forceRefreshToken in the same render loads that data's rows through its own connector, with the search the user typed", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const first = new MockConnector([{ id: "1", name: "Alice" }]);
		const second = new MockConnector([{ id: "9", name: "Zed" }]);
		const firstIndex = vi.spyOn(first, "index");
		const secondIndex = vi.spyOn(second, "index");
		const firstModel = peopleModel(modelName(), first);
		const secondModel = peopleModel(modelName(), second);
		const { rerender } = render(
			<Framework>
				<BackendDataGrid
					model={firstModel}
					classes={CLASSES}
					forceRefreshToken={"first"}
				/>
			</Framework>,
		);
		expect(await screen.findByText("Alice")).toBeInTheDocument();
		fireEvent.change(within(header()).getByRole("textbox"), {
			target: { value: "e" },
		});
		await passReloadDelay();
		await waitFor(() => expect(firstIndex).toHaveBeenCalledTimes(2));

		rerender(
			<Framework>
				<BackendDataGrid
					model={secondModel}
					classes={CLASSES}
					forceRefreshToken={"second"}
				/>
			</Framework>,
		);
		await passReloadDelay();
		expect(await screen.findByText("Zed")).toBeInTheDocument();
		expect(screen.queryByText("Alice")).toBeNull();
		expect(secondIndex).toHaveBeenCalledTimes(1);
		expect(secondIndex.mock.calls[0][0]).toMatchObject({ quickFilter: "e" });
		expect(firstIndex, "the old model loaded again").toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3506-ITEM-3] a grid remounted with a key for a model of other data shows only that data's rows", async () => {
		const first = new MockConnector([{ id: "1", name: "Alice" }]);
		const second = new MockConnector([{ id: "9", name: "Zed" }]);
		const firstIndex = vi.spyOn(first, "index");
		const firstModel = peopleModel(modelName(), first);
		const secondModel = peopleModel(modelName(), second);
		const { rerender } = render(
			<Framework>
				<BackendDataGrid key={"first"} model={firstModel} />
			</Framework>,
		);
		expect(await screen.findByText("Alice")).toBeInTheDocument();

		rerender(
			<Framework>
				<BackendDataGrid key={"second"} model={secondModel} />
			</Framework>,
		);
		expect(await screen.findByText("Zed")).toBeInTheDocument();
		expect(screen.queryByText("Alice")).toBeNull();
		expect(firstIndex, "the old model loaded again").toHaveBeenCalledTimes(1);
	});
});
