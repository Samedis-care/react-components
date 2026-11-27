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
	act,
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
	ModelDataTypeBooleanCheckboxRendererCC,
	ModelDataTypeBooleanCheckboxRendererMUI,
	ModelDataTypeImageRenderer,
	ModelDataTypeStringRendererMUI,
	ModelUnknown,
	ModelVisibility,
	ModelVisibilityDisabled,
	ModelVisibilityDisabledReadOnly,
	ModelVisibilityEdit,
	ModelVisibilityGridEdit,
	ModelVisibilityGridView,
	ModelVisibilityGridViewHidden,
	PageVisibility,
} from "../../../src/backend-integration";
import { RowLabelContext } from "../../../src/standalone/DataGrid/Content/RowLabel";
import {
	DataGridDispatch,
	DataGridRowData,
	DataGridUpdateRowContext,
} from "../../../src/standalone/DataGrid/DataGrid";
import BackendError from "../../../src/backend-integration/Connector/BackendError";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import ccI18n from "../../../src/i18n";
import { waitForCcI18n } from "../../waitForCcI18n";

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
	await waitForCcI18n();
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
const rowOf = async (model: ModelUnknown, index = 0) => {
	const [records] = await model.index({ page: 1, rows: 25 });
	return renderDataGridRecordUsingModel(model)(records[index]) as Record<
		string,
		unknown
	>;
};

/** Renders one cell of a row the way the grid does: inside the Framework */
const renderCell = (cell: unknown) =>
	render(<Framework>{cell as React.ReactElement}</Framework>);

/** Renders one cell of a row, inside a grid cell that provides the row's label */
const renderCellWithRowLabel = (cell: unknown, rowLabel: string) =>
	render(
		<Framework>
			<RowLabelContext.Provider value={() => rowLabel}>
				{cell as React.ReactElement}
			</RowLabelContext.Provider>
		</Framework>,
	);

/**
 * Renders one cell of a row inside a stand-in for the DataGrid: it holds the row and gives
 * the cell its updateRow (DataGridUpdateRowContext), as the grid does, so a save shows in
 * the cell. updateRow is a spy of the calls; show(false) unmounts the cell, as the grid
 * does with a row scrolled out of view, and show(true) mounts it again.
 */
const renderCellInRow = (row: Record<string, unknown>, field: string) => {
	const updateRow = vi.fn<DataGridDispatch["updateRow"]>();
	let setShown!: (shown: boolean) => void;
	const InRow = () => {
		const [current, setCurrent] = React.useState(row as DataGridRowData);
		const [shown, setShownState] = React.useState(true);
		setShown = setShownState;
		const update = React.useCallback<DataGridDispatch["updateRow"]>(
			(id, change) => {
				updateRow(id, change);
				setCurrent((prev) =>
					prev.id === id
						? {
								...prev,
								...(typeof change === "function" ? change(prev) : change),
								id: prev.id,
							}
						: prev,
				);
			},
			[],
		);
		return (
			<DataGridUpdateRowContext.Provider value={update}>
				{shown && (current[field] as React.ReactElement)}
			</DataGridUpdateRowContext.Provider>
		);
	};
	const result = render(
		<Framework>
			<InRow />
		</Framework>,
	);
	return {
		...result,
		updateRow,
		show: (shown: boolean) => act(() => setShown(shown)),
	};
};

/** The row an updateRow call put in place of the old one */
const rowPut = (updateRow: ReturnType<typeof vi.fn>, call = 0) =>
	updateRow.mock.calls[call][1] as Record<string, unknown>;

/**
 * Lets the test answer each connector.update when it wants: requests[i].resolve answers
 * the i-th request with the data it sent (the record as the connector stores it, without
 * the fields it was not sent), reject refuses it
 */
const holdUpdates = (connector: MockConnector) => {
	const requests: {
		data: Record<string, unknown>;
		resolve: () => Promise<void>;
		reject: (error: Error) => Promise<void>;
	}[] = [];
	const update = vi.spyOn(connector, "update").mockImplementation(
		(data) =>
			new Promise((resolve, reject) => {
				requests.push({
					data,
					resolve: () =>
						act(() => Promise.resolve().then(() => resolve([data, {}]))),
					reject: (error) =>
						act(() => Promise.resolve().then(() => reject(error))),
				});
			}) as never,
	);
	return { update, requests };
};

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
		const second = renderCell((await rowOf(model, 1)).flag);
		expect(second.container).toHaveTextContent(/^No$/);
	});

	it("[ISSUE-3506-ITEM-4] a cell renders again in the new language when the language changes", async () => {
		const { model } = makeModel();
		const row = await rowOf(model);
		const { container } = renderCell(row.flag);
		expect(container).toHaveTextContent(/^Yes$/);
		try {
			await act(() => ccI18n.changeLanguage("de"));
			expect(container).toHaveTextContent(/^Ja$/);
			await act(() => ccI18n.changeLanguage("en"));
			expect(container).toHaveTextContent(/^Yes$/);
		} finally {
			await act(() => ccI18n.changeLanguage("en"));
		}
	});

	it("[ISSUE-3506-ITEM-4] a cell that mounts after a language switch, e.g. in a row scrolled into view, shows the new language", async () => {
		const { model } = makeModel();
		const row = await rowOf(model);
		try {
			await ccI18n.changeLanguage("de");
			const { container } = renderCell(row.flag);
			expect(container).toHaveTextContent(/^Ja$/);
		} finally {
			await act(() => ccI18n.changeLanguage("en"));
		}
	});

	it("renders a column hidden by default (GridViewHidden) with its value, for when the user shows it", async () => {
		const { model } = makeModel();
		const { container } = renderCell((await rowOf(model)).hid);
		expect(container).toHaveTextContent(/^h1$/);
		expect(container.querySelector("input[type=hidden]")).toBeNull();
	});

	it("saves an inline edit through the connector with the record's id, then updates its row", async () => {
		const { model, connector } = makeModel();
		const update = vi.spyOn(connector, "update");
		const { updateRow } = renderCellInRow(await rowOf(model), "active");

		fireEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));
		expect(update).toHaveBeenCalledTimes(1);
		expect(update.mock.calls[0][0]).toEqual({ id: "1", active: false });
		expect(connector.read("1")[0].active).toBe(false);
	});

	it("saves an inline edit of a dotted field as the nested object", async () => {
		const { model, connector } = makeModel();
		const update = vi.spyOn(connector, "update");
		const { updateRow } = renderCellInRow(
			await rowOf(model),
			"settings.active",
		);

		fireEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));
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

	it("[ISSUE-3506-ITEM-1] the error dialog names the field and the error, and the cell shows the stored value again", async () => {
		const { model, connector } = makeModel();
		vi.spyOn(connector, "update").mockRejectedValue(
			new BackendError("Request failed with status code 403", "forbidden"),
		);
		const { updateRow } = renderCellInRow(
			await rowOf(model),
			"settings.active",
		);

		fireEvent.click(screen.getByRole("checkbox"));

		const dialog = await screen.findByRole("dialog");
		expect(dialog).toHaveAccessibleDescription(
			'The change to "Enabled" was not saved: Request failed with status code 403',
		);
		expect(screen.getByRole("checkbox", { hidden: true })).toBeChecked();
		expect(updateRow).not.toHaveBeenCalled();
		fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("[ISSUE-3506-ITEM-1] a change the model cannot serialize is reported the same way", async () => {
		const { model, connector } = makeModel();
		const update = vi.spyOn(connector, "update");
		const row = await rowOf(model);
		// model.index deserializes with it as well, so it fails only from here on
		vi.spyOn(model, "applySerialization").mockRejectedValue(
			new Error("cannot serialize"),
		);
		const { updateRow } = renderCellInRow(row, "active");

		fireEvent.click(screen.getByRole("checkbox"));

		expect(await screen.findByRole("dialog")).toHaveAccessibleDescription(
			'The change to "Active" was not saved: cannot serialize',
		);
		expect(screen.getByRole("checkbox", { hidden: true })).toBeChecked();
		expect(updateRow).not.toHaveBeenCalled();
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

	it("[ISSUE-3506-ITEM-2] an inline edit updates the cached record and tells the model's mutate listeners", async () => {
		const { model, connector } = makeModel();
		const update = vi.spyOn(connector, "update");
		const mutate = vi.fn();
		model.addEventHandler("mutate", mutate);
		try {
			// a form opened the record before
			const [before] = await model.getCached("1");
			expect(before.active).toBe(true);
			const { updateRow } = renderCellInRow(await rowOf(model), "active");

			fireEvent.click(screen.getByRole("checkbox"));
			await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));

			// what a form opened now shows
			const [after] = await model.getCached("1");
			expect({
				cached: after.active,
				mutateEvents: mutate.mock.calls.length,
				// the model performing the request, which every other update passes
				modelPassedToConnector:
					(update.mock.calls[0] as unknown[])[1] === model,
			}).toEqual({
				cached: false,
				mutateEvents: 1,
				modelPassedToConnector: true,
			});
		} finally {
			model.removeEventHandler("mutate", mutate);
		}
	});

	it("[ISSUE-3506-ITEM-2] an inline edit calls the model's onCreateOrUpdate hook with the saved record", async () => {
		const { model } = makeModel();
		const onCreateOrUpdate = vi.fn();
		model.hooks.onCreateOrUpdate = onCreateOrUpdate;
		const { updateRow } = renderCellInRow(
			await rowOf(model),
			"settings.active",
		);

		fireEvent.click(screen.getByRole("checkbox"));
		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));

		// the record the connector returned, not only the edited value
		expect(onCreateOrUpdate).toHaveBeenCalledExactlyOnceWith([
			expect.objectContaining({
				id: "1",
				title: "One",
				settings: { active: false },
			}),
			{},
		]);
	});

	it("[ISSUE-3506-ITEM-2] an inline edit of a field the edit form shows read-only is still saved", async () => {
		const connector = new MockConnector([
			{ id: "1", title: "One", active: true },
		]);
		const model = new Model(
			"bdg-grid-only-" + Math.random().toString(16),
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
				active: {
					type: bool(),
					getLabel: () => "Active",
					// only the grid changes it
					visibility: {
						overview: ModelVisibilityGridEdit,
						edit: ModelVisibilityDisabledReadOnly,
						create: ModelVisibilityDisabledReadOnly,
					},
					customData: null,
				},
			},
			connector,
		);
		const update = vi.spyOn(connector, "update");
		const { updateRow } = renderCellInRow(await rowOf(model), "active");

		fireEvent.click(screen.getByRole("checkbox"));
		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));

		expect(update.mock.calls[0][0]).toEqual({ id: "1", active: false });
		const [cached] = await model.getCached("1");
		expect(cached.active).toBe(false);
	});

	it("[ISSUE-3506-ITEM-10] an inline checkbox shows the click at once, or that it is saving", async () => {
		const { model, connector } = makeModel();
		let finish!: () => void;
		vi.spyOn(connector, "update").mockImplementation(
			(data) =>
				new Promise((resolve) => {
					finish = () => resolve([data, {}]);
				}) as never,
		);
		renderCell((await rowOf(model)).active);

		fireEvent.click(screen.getByRole("checkbox"));
		await act(async () => {});

		const box = screen.getByRole<HTMLInputElement>("checkbox");
		const saving = box.disabled || box.closest("[aria-busy=true]") !== null;
		expect(
			!box.checked || saving,
			"the checkbox still looks as before the click, while the save runs",
		).toBe(true);
		await act(() => Promise.resolve().then(finish));
	});

	it("[ISSUE-3506-ITEM-10] a saved inline edit replaces its row with the row of the saved record, and the focused checkbox stays", async () => {
		const { model } = makeModel();
		const { updateRow } = renderCellInRow(await rowOf(model), "active");
		const box = screen.getByRole<HTMLInputElement>("checkbox");
		box.focus();

		fireEvent.click(box);
		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));

		const row = rowPut(updateRow);
		expect(updateRow.mock.calls[0][0]).toBe("1");
		expect(React.isValidElement(row.active)).toBe(true);
		expect(React.isValidElement(row.title)).toBe(true);
		expect({
			id: row.id,
			active: row.active_raw,
			enabled: row["settings.active_raw"],
			title: row.title_raw,
			city: row["address.city_raw"],
			kept: row.kept_raw,
		}).toEqual({
			id: "1",
			active: false,
			enabled: true,
			title: "One",
			city: "Berlin",
			kept: "k1",
		});
		// the same control, not one rendered anew
		expect(screen.getByRole("checkbox")).toBe(box);
		expect(box).not.toBeChecked();
		expect(box).toHaveFocus();
	});

	it("[ISSUE-3506-ITEM-10] the row takes the values the save returned, and keeps its own where the response has none", async () => {
		const { model, connector } = makeModel();
		vi.spyOn(connector, "update").mockImplementation(
			(data) =>
				Promise.resolve([
					// the server changed the title too, and returned neither kept nor the city
					{ id: data.id, active: data.active, title: "One (checked)" },
					{},
				]) as never,
		);
		const { updateRow, unmount } = renderCellInRow(
			await rowOf(model),
			"active",
		);

		fireEvent.click(screen.getByRole("checkbox"));
		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));

		const row = rowPut(updateRow);
		expect({
			active: row.active_raw,
			title: row.title_raw,
			city: row["address.city_raw"],
			kept: row.kept_raw,
			hidden: row.hid_raw,
		}).toEqual({
			active: false,
			title: "One (checked)",
			city: "Berlin",
			kept: "k1",
			hidden: "h1",
		});
		unmount();
		expect(renderCell(row.title).container).toHaveTextContent(
			/^One \(checked\)$/,
		);
	});

	it("[ISSUE-3506-ITEM-10] a click while a save runs shows at once and is saved after it, the last of several only", async () => {
		const { model, connector } = makeModel();
		const { update, requests } = holdUpdates(connector);
		const { updateRow } = renderCellInRow(await rowOf(model), "active");
		const box = screen.getByRole<HTMLInputElement>("checkbox");

		fireEvent.click(box);
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		fireEvent.click(box);
		expect(box).toBeChecked();
		fireEvent.click(box);
		expect(box).not.toBeChecked();
		fireEvent.click(box);
		expect(box).toBeChecked();
		// one request at a time
		expect(update).toHaveBeenCalledTimes(1);

		await requests[0].resolve();
		await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
		expect(update.mock.calls.map((call) => call[0])).toEqual([
			{ id: "1", active: false },
			{ id: "1", active: true },
		]);
		// the first save's row is in place, the box still shows the last click
		expect(rowPut(updateRow, 0).active_raw).toBe(false);
		expect(box).toBeChecked();

		await requests[1].resolve();
		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(2));
		expect(rowPut(updateRow, 1).active_raw).toBe(true);
		expect(box).toBeChecked();
		expect(update).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3506-ITEM-10] a click back to the value being saved is not sent again", async () => {
		const { model, connector } = makeModel();
		const { update, requests } = holdUpdates(connector);
		const { updateRow } = renderCellInRow(await rowOf(model), "active");
		const box = screen.getByRole<HTMLInputElement>("checkbox");

		fireEvent.click(box);
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		fireEvent.click(box);
		fireEvent.click(box);
		expect(box).not.toBeChecked();

		await requests[0].resolve();
		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));
		expect(box).not.toBeChecked();
		expect(update).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3506-ITEM-10] a refused save drops the clicks made while it ran, and the cell shows the stored value", async () => {
		const { model, connector } = makeModel();
		const { update, requests } = holdUpdates(connector);
		const { updateRow } = renderCellInRow(await rowOf(model), "active");
		const box = screen.getByRole<HTMLInputElement>("checkbox");

		fireEvent.click(box);
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		fireEvent.click(box);
		fireEvent.click(box);
		expect(box).not.toBeChecked();

		await requests[0].reject(new BackendError("refused", "refused"));
		expect(await screen.findByRole("dialog")).toHaveAccessibleDescription(
			'The change to "Active" was not saved: refused',
		);
		expect(box).toBeChecked();
		expect(update).toHaveBeenCalledTimes(1);
		expect(updateRow).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-10] a save that ends after its row was scrolled out of view still updates the row", async () => {
		const { model, connector } = makeModel();
		const { update, requests } = holdUpdates(connector);
		const { updateRow, show } = renderCellInRow(await rowOf(model), "active");

		fireEvent.click(screen.getByRole("checkbox"));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		show(false);
		await requests[0].resolve();
		await waitFor(() => expect(updateRow).toHaveBeenCalledTimes(1));
		show(true);

		expect(screen.getByRole("checkbox")).not.toBeChecked();
	});

	it("[ISSUE-3506-ITEM-9] names an inline checkbox by its field's label", async () => {
		const { model } = makeModel();
		renderCell((await rowOf(model)).active);
		expect(screen.getByRole("checkbox")).toHaveAccessibleName("Active");
	});

	it("[ISSUE-3506-ITEM-9] an inline checkbox also names the row its cell is in", async () => {
		const { model } = makeModel();
		renderCellWithRowLabel((await rowOf(model)).active, "One");
		expect(screen.getByRole("checkbox")).toHaveAccessibleName("Active, One");
	});

	it("[ISSUE-3506-ITEM-9] names the UIKit renderer's inline checkbox too", async () => {
		const model = new Model(
			"bdg-grid-cc-" + Math.random().toString(16),
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
				active: {
					type: new ModelDataTypeBooleanCheckboxRendererCC(),
					getLabel: () => "Active",
					visibility: vis(ModelVisibilityGridEdit),
					customData: null,
				},
			},
			new MockConnector([{ id: "1", title: "One", active: true }]),
		);
		renderCellWithRowLabel((await rowOf(model)).active, "One");
		expect(screen.getByRole("checkbox")).toHaveAccessibleName("Active, One");
	});
});

describe("renderDataGridRecordUsingModel: image cells", () => {
	it("[ISSUE-3506-ITEM-14] an image cell showing the placeholder does not use the label as its alt text", async () => {
		const STORED =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
		const PLACEHOLDER =
			"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
		const model = new Model(
			"bdg-image-" + Math.random().toString(16),
			{
				id: {
					type: str(),
					getLabel: () => "ID",
					visibility: vis(ModelVisibilityDisabled),
					customData: null,
				},
				logo: {
					type: new ModelDataTypeImageRenderer({ placeholder: PLACEHOLDER }),
					getLabel: () => "Logo",
					visibility: vis(ModelVisibilityGridView),
					customData: null,
				},
			},
			new MockConnector([
				{ id: "1", logo: STORED },
				{ id: "2", logo: "" },
			]),
		);
		const stored = renderCell((await rowOf(model)).logo);
		// a stored picture is named
		expect(stored.container.querySelector("img")).toHaveAttribute(
			"alt",
			"Logo",
		);
		cleanup();

		const missing = renderCell((await rowOf(model, 1)).logo);
		const placeholder = missing.container.querySelector("img");
		expect(placeholder).toHaveAttribute("src", PLACEHOLDER);
		expect(
			placeholder,
			"the placeholder is announced like the stored picture",
		).not.toHaveAttribute("alt", "Logo");
	});
});
