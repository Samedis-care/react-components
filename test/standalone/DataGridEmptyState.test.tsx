import React, { useEffect } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import ccI18n from "../../src/i18n";
import DataGrid, {
	DataGridData,
	DataGridProps,
	IDataGridColumnDef,
} from "../../src/standalone/DataGrid/DataGrid";

// What the grid shows instead of rows: the empty result and the load error.
// AutoSizer measures nothing in jsdom (offsetWidth 0), so it is given a size:
// the real MultiGrid then renders its no-content placeholder.
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

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
	// jsdom has neither; MUI's useMediaQuery and the filter bar need them
	if (!("matchMedia" in window)) {
		Object.defineProperty(window, "matchMedia", {
			configurable: true,
			value: (query: string) =>
				({
					matches: false,
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => false,
				}) as MediaQueryList,
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

const theme = createTheme();
const COLUMNS: IDataGridColumnDef[] = [
	{ field: "name", headerName: "Name", type: "string", filterable: true },
];
const empty = (): DataGridData => ({ rowsTotal: 0, rows: [] });

const Grid = (props: Partial<DataGridProps>) => (
	<ThemeProvider theme={theme}>
		<DataGrid columns={COLUMNS} loadData={empty} {...props} />
	</ThemeProvider>
);

/**
 * the grid's one status message once it shows the given text; while the grid
 * loads, its Loader is a status region too
 */
const findStatus = async (text: string) => {
	await waitFor(() =>
		expect(screen.getByRole("status")).toHaveTextContent(text),
	);
	return screen.getByRole("status");
};

/** the elements a screen reader lists as headings, also inside the given one */
const headings = (container: HTMLElement) =>
	container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');

describe("DataGrid empty and error messages", () => {
	it("[ISSUE-3482-ITEM-9] says that the list is empty as a status message, not as a heading", async () => {
		const { container } = render(<Grid />);
		await findStatus("The list does not contain any data.");
		expect(headings(container)).toHaveLength(0);
	});

	it("[ISSUE-3482-ITEM-9] says that the filters matched nothing as a status message, with Clear filters outside it and outside any text element", async () => {
		const { container } = render(<Grid overrideSearch={"zzz"} />);
		const status = await findStatus("No data matched your filters.");
		const reset = screen.getByRole("button", { name: "Clear filters" });
		// the live region holds only the message, so the button's label is not
		// read as part of it
		expect(status).not.toContainElement(reset);
		expect(reset.closest("h1, h2, h3, h4, h5, h6, p")).toBeNull();
		expect(headings(container)).toHaveLength(0);
	});

	it("[ISSUE-3482-ITEM-9] reports a load error as an alert, not as a heading", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const { container } = render(
			<Grid
				loadData={() => Promise.reject(new Error("Request failed: 500"))}
			/>,
		);
		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent("Request failed: 500");
		expect(headings(container)).toHaveLength(0);
		expect(screen.queryByRole("status")).toBeNull();
	});
});
