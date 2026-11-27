/**
 * CRUD's views: which of grid, record page and importer shows for a URL (routed) or a view
 * id (disableRouting), how the grid is hidden, what disableBackgroundGrid, goBackCallback and
 * the refresh flags do, and the Suspense boundaries around the views.
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { CrudDispatch } from "../../../src/backend-components/CRUD";
import {
	connectorOf,
	crudEl,
	gridWrapper,
	LOAD,
	peopleModel,
	renderPlain,
	renderRouted,
	setupCrudTests,
} from "./crudFixture";
import { PeopleModel } from "../Form/pageFixture";

setupCrudTests();

const Forbidden = () => <div>FORBIDDEN</div>;

/**
 * A people model and a spy on its connector's read, which a record page calls
 */
const modelWithReadSpy = () => {
	const model = peopleModel();
	const read = vi.spyOn(connectorOf(model as unknown as PeopleModel), "read");
	return { model, read };
};

describe("routed CRUD", () => {
	it("[ISSUE-3507-ITEM-4] has no importer at <url>/import or <url>/devimport while enableUserImport is off", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/import"] });
		renderRouted(h, crudEl(peopleModel()));
		// the importer would render in the same commit as the grid
		await screen.findByTestId("grid", undefined, LOAD);
		expect(screen.queryByTestId("importer")).toBeNull();
		act(() => h.push("/rec/devimport"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/devimport"));
		expect(screen.queryByTestId("importer")).toBeNull();
	});

	it("[ISSUE-3507-ITEM-4] serves <url>/import with enableUserImport and <url>/devimport with enableDevImport only", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/import"] });
		const { unmount } = renderRouted(
			h,
			crudEl(peopleModel(), { enableUserImport: true }),
		);
		expect(
			await screen.findByTestId("importer", undefined, LOAD),
		).toHaveTextContent("IMPORT guided=true");
		act(() => h.push("/rec/devimport"));
		await waitFor(() => expect(screen.queryByTestId("importer")).toBeNull());
		expect(gridWrapper()).toHaveClass("Mui-hidden");
		unmount();

		const { model, read } = modelWithReadSpy();
		const h2 = createMemoryHistory({ initialEntries: ["/rec/devimport"] });
		renderRouted(h2, crudEl(model, { enableDevImport: true }));
		expect(
			await screen.findByTestId("importer", undefined, LOAD),
		).toHaveTextContent("IMPORT guided=false");
		act(() => h2.push("/rec/import"));
		await waitFor(() => expect(screen.queryByTestId("importer")).toBeNull());
		// not a record id either: no record page loads it
		expect(read).not.toHaveBeenCalled();
		expect(screen.queryByTestId("form-id")).toBeNull();
	});

	it("[ISSUE-3507-ITEM-4] shows the forbidden page at <url>/import and <url>/devimport while they are off", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/import"] });
		renderRouted(h, crudEl(peopleModel(), { forbiddenPage: Forbidden }));
		expect(
			await screen.findByText("FORBIDDEN", undefined, LOAD),
		).toBeInTheDocument();
		expect(screen.queryByTestId("importer")).toBeNull();
		act(() => h.push("/rec/devimport"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/devimport"));
		expect(screen.getByText("FORBIDDEN")).toBeInTheDocument();
		expect(screen.queryByTestId("importer")).toBeNull();
	});
});

describe("disableRouting CRUD", () => {
	it("[ISSUE-3507-ITEM-4] opens the import views only while they are on", async () => {
		const ref = React.createRef<CrudDispatch>();
		const { model, read } = modelWithReadSpy();
		renderPlain(crudEl(model, { disableRouting: true }, ref));
		await screen.findByTestId("grid", undefined, LOAD);
		act(() => ref.current!.openView("import"));
		await waitFor(() => expect(gridWrapper()).toHaveClass("Mui-hidden"));
		expect(screen.queryByTestId("importer")).toBeNull();
		act(() => ref.current!.openView("devimport"));
		expect(screen.queryByTestId("importer")).toBeNull();
		// not a record id either: no record page loads it
		expect(read).not.toHaveBeenCalled();
		expect(screen.queryByTestId("form-id")).toBeNull();
	});

	it("[ISSUE-3507-ITEM-4] opens import with enableUserImport and devimport with enableDevImport only", async () => {
		const ref = React.createRef<CrudDispatch>();
		const { unmount } = renderPlain(
			crudEl(
				peopleModel(),
				{ disableRouting: true, enableUserImport: true, initialView: "import" },
				ref,
			),
		);
		expect(
			await screen.findByTestId("importer", undefined, LOAD),
		).toHaveTextContent("IMPORT guided=true");
		act(() => ref.current!.openView("devimport"));
		await waitFor(() => expect(screen.queryByTestId("importer")).toBeNull());
		unmount();

		renderPlain(
			crudEl(
				peopleModel(),
				{
					disableRouting: true,
					enableDevImport: true,
					initialView: "devimport",
				},
				ref,
			),
		);
		expect(
			await screen.findByTestId("importer", undefined, LOAD),
		).toHaveTextContent("IMPORT guided=false");
		act(() => ref.current!.openView("import"));
		await waitFor(() => expect(screen.queryByTestId("importer")).toBeNull());
	});

	it("[ISSUE-3507-ITEM-4] shows the forbidden page for an import view that is off, and for one the user may not import in", async () => {
		const ref = React.createRef<CrudDispatch>();
		const { unmount } = renderPlain(
			crudEl(
				peopleModel(),
				{
					disableRouting: true,
					forbiddenPage: Forbidden,
					initialView: "import",
				},
				ref,
			),
		);
		expect(
			await screen.findByText("FORBIDDEN", undefined, LOAD),
		).toBeInTheDocument();
		expect(screen.queryByTestId("importer")).toBeNull();
		unmount();

		renderPlain(
			crudEl(
				peopleModel(),
				{
					disableRouting: true,
					forbiddenPage: Forbidden,
					enableUserImport: true,
					enableDevImport: true,
					initialView: "import",
				},
				ref,
			),
			["crud.read", "crud.edit"],
		);
		expect(
			await screen.findByText("FORBIDDEN", undefined, LOAD),
		).toBeInTheDocument();
		expect(screen.queryByTestId("importer")).toBeNull();
		act(() => ref.current!.openView("devimport"));
		expect(screen.getByText("FORBIDDEN")).toBeInTheDocument();
		expect(screen.queryByTestId("importer")).toBeNull();
	});
});
