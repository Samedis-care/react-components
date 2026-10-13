import React, { useContext } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import LocalStoragePersist from "../../src/standalone/DataGrid/LocalStoragePersist";
import StorageManagerPersist, {
	DATA_GRID_STORAGE_KEY_FILTERS,
} from "../../src/standalone/DataGrid/StorageManagerPersist";
import { DataGridPersistentStateContext } from "../../src/standalone/DataGrid/StatePersistence";
import {
	DATA_GRID_PERSIST_VERSION,
	DataGridPersistentState,
} from "../../src/standalone/DataGrid/PersistFormat";
import {
	DefaultGetStorageProviderCallback,
	StorageManager,
} from "../../src/framework/Storage";

const theme = createTheme();

const STORED: DataGridPersistentState = {
	v: DATA_GRID_PERSIST_VERSION,
	search: "stored",
};
const WRITTEN: DataGridPersistentState = {
	v: DATA_GRID_PERSIST_VERSION,
	search: "written",
	customData: { "filter[status]": "open" },
};

let write: ((data: DataGridPersistentState) => Promise<void> | void) | null =
	null;

/** Shows what the persistence context provides, and keeps its setter */
const Probe = (props: { testId: string }) => {
	const ctx = useContext(DataGridPersistentStateContext);
	write = ctx?.[1] ?? null;
	return <span data-testid={props.testId}>{ctx?.[0]?.search ?? "none"}</span>;
};

beforeEach(() => {
	localStorage.clear();
	StorageManager.configure(DefaultGetStorageProviderCallback);
	write = null;
});

afterEach(cleanup);

describe("LocalStoragePersist", () => {
	const renderPersist = (storageKey: string, ui: React.ReactNode) => (
		<LocalStoragePersist storageKey={storageKey}>{ui}</LocalStoragePersist>
	);

	it("provides what was stored before", () => {
		localStorage.setItem("grid", JSON.stringify(STORED));
		render(renderPersist("grid", <Probe testId={"a"} />));
		expect(screen.getByTestId("a")).toHaveTextContent("stored");
	});

	it("provides what was written last and stores it", () => {
		localStorage.setItem("grid", JSON.stringify(STORED));
		const { rerender } = render(renderPersist("grid", <Probe testId={"a"} />));
		act(() => void write!(WRITTEN));
		expect(screen.getByTestId("a")).toHaveTextContent("written");
		expect(JSON.parse(localStorage.getItem("grid")!)).toEqual(WRITTEN);

		// a grid mounted after the write starts from it
		rerender(
			renderPersist(
				"grid",
				<>
					<Probe testId={"a"} />
					<Probe testId={"b"} />
				</>,
			),
		);
		expect(screen.getByTestId("b")).toHaveTextContent("written");
	});

	it("provides another key's own data", () => {
		localStorage.setItem("other", JSON.stringify(STORED));
		const { rerender } = render(renderPersist("grid", <Probe testId={"a"} />));
		act(() => void write!(WRITTEN));
		rerender(renderPersist("other", <Probe testId={"a"} />));
		expect(screen.getByTestId("a")).toHaveTextContent("stored");
	});
});

describe("StorageManagerPersist", () => {
	const renderPersist = (
		storageKeys: Record<string, string>,
		ui: React.ReactNode,
	) => (
		<ThemeProvider theme={theme}>
			<StorageManagerPersist storageKeys={storageKeys}>
				{ui}
			</StorageManagerPersist>
		</ThemeProvider>
	);

	it("provides what was stored before", async () => {
		await StorageManager.setItem(
			DATA_GRID_STORAGE_KEY_FILTERS,
			{ grid: "a" },
			JSON.stringify(STORED),
		);
		render(renderPersist({ grid: "a" }, <Probe testId={"a"} />));
		expect(await screen.findByTestId("a")).toHaveTextContent("stored");
	});

	it("provides what was written last and stores it", async () => {
		const { rerender } = render(
			renderPersist({ grid: "a" }, <Probe testId={"a"} />),
		);
		expect(await screen.findByTestId("a")).toHaveTextContent("none");
		await act(async () => {
			await write!(WRITTEN);
		});
		expect(screen.getByTestId("a")).toHaveTextContent("written");
		expect(
			JSON.parse(
				StorageManager.getItem(DATA_GRID_STORAGE_KEY_FILTERS, {
					grid: "a",
				}) as string,
			),
		).toMatchObject({ search: "written", customData: WRITTEN.customData });

		// a grid mounted after the write starts from it
		rerender(
			renderPersist(
				{ grid: "a" },
				<>
					<Probe testId={"a"} />
					<Probe testId={"b"} />
				</>,
			),
		);
		expect(screen.getByTestId("b")).toHaveTextContent("written");
	});

	it("provides other keys' own data", async () => {
		await StorageManager.setItem(
			DATA_GRID_STORAGE_KEY_FILTERS,
			{ grid: "b" },
			JSON.stringify(STORED),
		);
		const { rerender } = render(
			renderPersist({ grid: "a" }, <Probe testId={"a"} />),
		);
		await screen.findByTestId("a");
		await act(async () => {
			await write!(WRITTEN);
		});
		rerender(renderPersist({ grid: "b" }, <Probe testId={"a"} />));
		await waitFor(() =>
			expect(screen.getByTestId("a")).toHaveTextContent("stored"),
		);
	});
});
