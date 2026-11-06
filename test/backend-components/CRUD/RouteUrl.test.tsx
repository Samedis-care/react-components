/**
 * A routed CRUD at URLs that differ from its route's url only in their slashes: the route
 * context's url is normalized (no trailing or double slash), useLocation's pathname is not.
 */
import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import {
	crudEl,
	gridLog,
	gridWrapper,
	lastGrid,
	LOAD,
	peopleModel,
	renderRouted,
	setupCrudTests,
} from "./crudFixture";

setupCrudTests();

describe("routed CRUD", () => {
	it.each(["/rec/", "/rec//", "//rec"])(
		"[ISSUE-3475-ITEM-7] shows the grid at %s like at its url",
		async (path) => {
			const h = createMemoryHistory({ initialEntries: [path] });
			renderRouted(h, crudEl(peopleModel()));
			await screen.findByTestId("grid", undefined, LOAD);
			expect(gridWrapper()).not.toHaveClass("Mui-hidden");
			expect(lastGrid().globalScrollListener).toBe(true);
			expect(screen.queryByTestId("form-id")).toBeNull();
		},
	);

	it("[ISSUE-3475-ITEM-7] hides the grid at a record url with a trailing slash, and shows it again on Back", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/1/"] });
		renderRouted(h, crudEl(peopleModel()));
		expect(
			await screen.findByDisplayValue("Alice", undefined, LOAD),
		).toBeInTheDocument();
		expect(gridWrapper()).toHaveClass("Mui-hidden");
		expect(lastGrid().globalScrollListener).toBe(false);

		fireEvent.click(screen.getByRole("button", { name: "Back" }));
		await waitFor(() => expect(h.location.pathname).toBe("/rec"));
		await waitFor(() => expect(gridWrapper()).not.toHaveClass("Mui-hidden"));
		expect(lastGrid().globalScrollListener).toBe(true);
		// hidden, not remounted
		expect(gridLog.mounts).toBe(1);
	});
});
