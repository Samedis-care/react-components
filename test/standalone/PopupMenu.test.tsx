import { describe, it, expect, afterEach, beforeEach } from "vitest";
import React, { Suspense } from "react";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	within,
} from "@testing-library/react";
import { ThemeProvider, createTheme, MenuItem, Theme } from "@mui/material";
import PopupMenu from "../../src/standalone/PopupMenu";

const theme = createTheme();
const wrap = (ui: React.ReactNode, withTheme: Theme = theme) =>
	render(<ThemeProvider theme={withTheme}>{ui}</ThemeProvider>);

let anchor: HTMLButtonElement;
beforeEach(() => {
	anchor = document.createElement("button");
	anchor.id = "trigger";
	anchor.textContent = "Options";
	document.body.appendChild(anchor);
});
afterEach(() => {
	// auto-cleanup is off in this repo
	cleanup();
	anchor.remove();
});

const items = (
	<>
		<MenuItem>Profile</MenuItem>
		<MenuItem disabled>Settings</MenuItem>
		<MenuItem>Logout</MenuItem>
	</>
);

describe("PopupMenu", () => {
	it("can be named by its trigger through slotProps.list and given an id", () => {
		wrap(
			<PopupMenu
				open
				anchorEl={anchor}
				slotProps={{
					list: { id: "options-menu", "aria-labelledby": "trigger" },
				}}
			>
				{items}
			</PopupMenu>,
		);
		const menu = screen.getByRole("menu", { name: "Options" });
		expect(menu).toHaveAttribute("id", "options-menu");
	});

	it("[ISSUE-3459-ITEM-7] is flat by default: its border is the paper's only outline", () => {
		wrap(
			<PopupMenu open anchorEl={anchor}>
				{items}
			</PopupMenu>,
		);
		const paper = screen.getByRole("menu").closest(".MuiMenu-paper")!;
		expect(paper).toHaveClass("MuiPaper-elevation0");
		expect(getComputedStyle(paper).borderTop).toBe(
			`1px solid ${theme.palette.divider}`,
		);
	});

	it("[ISSUE-3459-ITEM-7] draws MUI's shadow in addition to the border when given an elevation", () => {
		wrap(
			<PopupMenu open anchorEl={anchor} elevation={8}>
				{items}
			</PopupMenu>,
		);
		const paper = screen.getByRole("menu").closest(".MuiMenu-paper")!;
		expect(paper).toHaveClass("MuiPaper-elevation8");
		expect(getComputedStyle(paper).borderTop).toBe(
			`1px solid ${theme.palette.divider}`,
		);
	});
});

// importing the whole package (or the DataGrid) takes ~20s in jsdom
const importTimeout = 90000;

describe("PopupMenu at the DataGrid call sites", () => {
	it(
		"[ISSUE-3459-ITEM-11] the DataGrid reset trigger announces a menu and names it",
		async () => {
			const { default: ActionBarView } =
				await import("../../src/standalone/DataGrid/Header/ActionBarView");
			const noop = () => {};
			wrap(
				<Suspense fallback={null}>
					<ActionBarView
						hideReset={false}
						hasCustomFilterBar={false}
						refresh={noop}
						resetFilter={noop}
						resetSort={noop}
						resetColumn={noop}
						resetWidth={noop}
						resetAll={noop}
					/>
				</Suspense>,
			);
			// jsdom has no matchMedia, so the xs/sm trigger (IconButton) renders
			const trigger = await screen.findByRole("button", { name: "Reset" });
			const expandedWhileClosed = trigger.getAttribute("aria-expanded");
			fireEvent.click(trigger);
			const menu = await screen.findByRole("menu");
			expect(within(menu).getAllByRole("menuitem")).toHaveLength(6);
			expect({
				"aria-haspopup": trigger.getAttribute("aria-haspopup"),
				"aria-expanded while closed": expandedWhileClosed,
				"aria-expanded while open": trigger.getAttribute("aria-expanded"),
				"aria-controls is the menu's id":
					menu.id !== "" && trigger.getAttribute("aria-controls") === menu.id,
				"menu is named by its trigger":
					screen.queryByRole("menu", { name: "Reset" }) === menu,
			}).toEqual({
				"aria-haspopup": "menu",
				"aria-expanded while closed": "false",
				"aria-expanded while open": "true",
				"aria-controls is the menu's id": true,
				"menu is named by its trigger": true,
			});
		},
		importTimeout,
	);
});

describe("package root exports of the small primitives", () => {
	it(
		"[ISSUE-3459-ITEM-2] exports PopupMenu",
		async () => {
			const root = (await import("../../src")) as Record<string, unknown>;
			expect(root.PopupMenu, "PopupMenu is missing from the package root").toBe(
				PopupMenu,
			);
		},
		importTimeout,
	);
});
