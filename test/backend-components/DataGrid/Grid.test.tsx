/**
 * BackendDataGrid: the rows it builds from the model (renderDataGridRecordUsingModel),
 * inline edits of ModelVisibilityGridEdit fields, the header buttons
 * (useBackendDataGridAddNewButtons), and the grid itself: loading through
 * model.index, forceRefreshToken and the Delete/Export gates. The delete handler is
 * tested in DeleteHandler.test.tsx.
 */
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import { renderDataGridRecordUsingModel } from "../../../src/backend-components/DataGrid";
import {
	Model,
	ModelDataTypeBooleanCheckboxRendererMUI,
	ModelDataTypeStringRendererMUI,
	ModelUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityDisabledReadOnly,
	ModelVisibilityEdit,
	ModelVisibilityGridEdit,
	ModelVisibilityGridView,
	ModelVisibility,
	ModelVisibilityGridViewHidden,
	PageVisibility,
} from "../../../src/backend-integration";
import BackendError from "../../../src/backend-integration/Connector/BackendError";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import ccI18n from "../../../src/i18n";

// MultiGrid draws the cells; without it the header, the footer and the loads remain,
// which is what the grid-level tests here look at. The cells are rendered from the
// row builder directly.
vi.mock("../../../src/standalone/Virtualized/MultiGrid", () => ({
	default: () => null,
}));

beforeAll(async () => {
	// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs
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
	await ccI18n.loadNamespaces("translation");
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

const vis = (overview: ModelVisibility): PageVisibility => ({
	overview,
	edit: ModelVisibilityEdit,
	create: ModelVisibilityEdit,
});
const str = () => new ModelDataTypeStringRendererMUI();
const bool = () => new ModelDataTypeBooleanCheckboxRendererMUI();

/**
 * Fields in every overview visibility the grid treats differently:
 * - title, flag, address.city: shown columns (GridView), one of them dotted
 * - hid: a column hidden until the user shows it (GridViewHidden)
 * - active, settings.active: inline-editable checkboxes (GridEdit), one of them dotted
 * - kept: no column, but its value is loaded (DisabledReadOnly)
 * - id, secret: no column, not loaded (Disabled; id is kept anyway)
 */
const makeModel = () => {
	const connector = new MockConnector([
		{
			id: "1",
			title: "One",
			hid: "h1",
			flag: true,
			active: true,
			settings: { active: true },
			kept: "k1",
			secret: "s1",
			address: { city: "Berlin" },
			extra: "x",
		},
		{
			id: "2",
			title: "Two",
			hid: "h2",
			flag: false,
			active: false,
			settings: { active: false },
			kept: "k2",
			secret: "s2",
			address: { city: "Rome" },
		},
	]);
	const model = new Model(
		"bdg-grid-" + Math.random().toString(16),
		{
			id: {
				type: str(),
				getLabel: () => "ID",
				visibility: vis(ModelVisibilityDisabled),
				customData: null,
			},
			title: {
				type: str(),
				getLabel: () => "Title",
				visibility: vis(ModelVisibilityGridView),
				customData: null,
			},
			hid: {
				type: str(),
				getLabel: () => "Hidden column",
				visibility: vis(ModelVisibilityGridViewHidden),
				customData: null,
			},
			flag: {
				type: bool(),
				getLabel: () => "Flag",
				visibility: vis(ModelVisibilityGridView),
				customData: null,
			},
			active: {
				type: bool(),
				getLabel: () => "Active",
				visibility: vis(ModelVisibilityGridEdit),
				customData: null,
			},
			"settings.active": {
				type: bool(),
				getLabel: () => "Enabled",
				visibility: vis(ModelVisibilityGridEdit),
				customData: null,
			},
			"address.city": {
				type: str(),
				getLabel: () => "City",
				visibility: vis(ModelVisibilityGridView),
				customData: null,
			},
			kept: {
				type: str(),
				getLabel: () => "Kept",
				visibility: vis(ModelVisibilityDisabledReadOnly),
				customData: null,
			},
			secret: {
				type: str(),
				getLabel: () => "Secret",
				visibility: vis(ModelVisibilityDisabled),
				customData: null,
			},
		},
		connector,
	);
	return { model, connector };
};

/** The grid row BackendDataGrid builds for the record at the given index */
const rowOf = async (
	model: ModelUnknown,
	refreshGrid: () => void = vi.fn(),
	index = 0,
) => {
	const [records] = await model.index({ page: 1, rows: 25 });
	return renderDataGridRecordUsingModel(
		model,
		refreshGrid,
	)(records[index]) as Record<string, unknown>;
};

/** Renders one cell of a row the way the grid does: inside the Framework */
const renderCell = (cell: unknown) =>
	render(<Framework>{cell as React.ReactElement}</Framework>);

/** The part of Node's process this file uses (the test config has no Node types) */
interface RejectionEvents {
	listeners(event: "unhandledRejection"): ((reason: unknown) => void)[];
	removeAllListeners(event: "unhandledRejection"): void;
	on(event: "unhandledRejection", listener: (reason: unknown) => void): void;
	off(event: "unhandledRejection", listener: (reason: unknown) => void): void;
}
const nodeProcess = (globalThis as unknown as { process: RejectionEvents })
	.process;

describe("renderDataGridRecordUsingModel", () => {
	it("puts the rendered cell under the field name and the loaded value under <field>_raw", async () => {
		const { model } = makeModel();
		const row = await rowOf(model);

		expect(row.id).toBe("1");
		expect(row.id_raw).toBe("1");
		expect(React.isValidElement(row.title)).toBe(true);
		expect(row.title_raw).toBe("One");
		expect(row.flag_raw).toBe(true);
		expect(row.active_raw).toBe(true);
		// dotted fields stay flat keys
		expect(row["address.city_raw"]).toBe("Berlin");
		expect(row["settings.active_raw"]).toBe(true);
		expect("address" in row).toBe(false);
		// DisabledReadOnly: no column, the value is there for the row callbacks
		expect(row.kept).toBe("k1");
		expect(row.kept_raw).toBe("k1");
		// Disabled: not loaded
		expect(row.secret_raw).toBe(undefined);
		// attributes the model does not declare are left out
		expect("extra" in row || "extra_raw" in row).toBe(false);

		const { container } = renderCell(row.title);
		expect(container).toHaveTextContent(/^One$/);
	});

	it("renders a boolean column as the words Yes and No", async () => {
		const { model } = makeModel();
		const { container } = renderCell((await rowOf(model)).flag);
		expect(container).toHaveTextContent(/^Yes$/);
		cleanup();
		const second = renderCell((await rowOf(model, vi.fn(), 1)).flag);
		expect(second.container).toHaveTextContent(/^No$/);
	});

	it("renders a column hidden by default (GridViewHidden) with its value, for when the user shows it", async () => {
		const { model } = makeModel();
		const { container } = renderCell((await rowOf(model)).hid);
		expect(container).toHaveTextContent(/^h1$/);
		expect(container.querySelector("input[type=hidden]")).toBeNull();
	});

	it("saves an inline edit through the connector with the record's id, then refreshes the grid", async () => {
		const { model, connector } = makeModel();
		const update = vi.spyOn(connector, "update");
		const refreshGrid = vi.fn();
		renderCell((await rowOf(model, refreshGrid)).active);

		fireEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(refreshGrid).toHaveBeenCalledTimes(1));
		expect(update).toHaveBeenCalledTimes(1);
		expect(update.mock.calls[0][0]).toEqual({ id: "1", active: false });
		expect(connector.read("1")[0].active).toBe(false);
	});

	it("saves an inline edit of a dotted field as the nested object", async () => {
		const { model, connector } = makeModel();
		const update = vi.spyOn(connector, "update");
		const refreshGrid = vi.fn();
		renderCell((await rowOf(model, refreshGrid))["settings.active"]);

		fireEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(refreshGrid).toHaveBeenCalledTimes(1));
		expect(update.mock.calls[0][0]).toEqual({
			id: "1",
			settings: { active: false },
		});
	});

	it("[ISSUE-3506-ITEM-1] a refused inline edit is shown to the user and is not an unhandled rejection", async () => {
		const { model, connector } = makeModel();
		const update = vi
			.spyOn(connector, "update")
			.mockRejectedValue(new BackendError("refused", "refused"));
		const row = await rowOf(model);
		// the unhandled rejection is the bug: collect it instead of letting vitest fail
		// the whole run with it
		const vitestHandlers = nodeProcess.listeners("unhandledRejection");
		nodeProcess.removeAllListeners("unhandledRejection");
		const unhandled: unknown[] = [];
		const collect = (reason: unknown) => void unhandled.push(reason);
		nodeProcess.on("unhandledRejection", collect);
		try {
			renderCell(row.active);
			fireEvent.click(screen.getByRole("checkbox"));
			await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
			await waitFor(() =>
				expect({
					unhandled: unhandled.map(String),
					shown:
						screen.queryByRole("dialog") !== null ||
						screen.queryByRole("alert") !== null,
				}).toEqual({ unhandled: [], shown: true }),
			);
		} finally {
			nodeProcess.off("unhandledRejection", collect);
			vitestHandlers.forEach((handler) =>
				nodeProcess.on("unhandledRejection", handler),
			);
		}
	});

	it("[ISSUE-3506-ITEM-1] the error dialog names the field and the error, and the grid reloads the stored value", async () => {
		const { model, connector } = makeModel();
		vi.spyOn(connector, "update").mockRejectedValue(
			new BackendError("Request failed with status code 403", "forbidden"),
		);
		const refreshGrid = vi.fn();
		renderCell((await rowOf(model, refreshGrid))["settings.active"]);

		fireEvent.click(screen.getByRole("checkbox"));

		const dialog = await screen.findByRole("dialog");
		expect(dialog).toHaveAccessibleDescription(
			'The change to "Enabled" was not saved: Request failed with status code 403',
		);
		expect(refreshGrid).toHaveBeenCalledTimes(1);
		fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("[ISSUE-3506-ITEM-1] a change the model cannot serialize is reported the same way", async () => {
		const { model, connector } = makeModel();
		const update = vi.spyOn(connector, "update");
		const refreshGrid = vi.fn();
		const row = await rowOf(model, refreshGrid);
		// model.index deserializes with it as well, so it fails only from here on
		vi.spyOn(model, "applySerialization").mockRejectedValue(
			new Error("cannot serialize"),
		);
		renderCell(row.active);

		fireEvent.click(screen.getByRole("checkbox"));

		expect(await screen.findByRole("dialog")).toHaveAccessibleDescription(
			'The change to "Active" was not saved: cannot serialize',
		);
		expect(refreshGrid).toHaveBeenCalledTimes(1);
		expect(update).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-1] an editable field whose renderer has no grid editor fails the row build", async () => {
		const model = new Model(
			"bdg-unsupported-" + Math.random().toString(16),
			{
				id: {
					type: str(),
					getLabel: () => "ID",
					visibility: vis(ModelVisibilityDisabled),
					customData: null,
				},
				title: {
					type: str(),
					getLabel: () => "Title",
					visibility: vis(ModelVisibilityGridEdit),
					customData: null,
				},
			},
			new MockConnector([{ id: "1", title: "One" }]),
		);
		await expect(rowOf(model)).rejects.toThrow("Not supported");
	});
});
