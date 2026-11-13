import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme, List, Theme } from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import MenuBase, {
	IMenuItemDefinition,
	MenuItemProps,
} from "../../src/standalone/Portal/Menu";
import MaterialMenuItem from "../../src/standalone/Portal/MenuItem/Material";

afterEach(cleanup);

const theme = createTheme();
const renderUi = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<List>{children}</List>
);

/**
 * Dashboard (leaf, icon), Reports (group: Monthly, Annual (group: Q1), Secret
 * hidden), Users (leaf with onAuxClick), Hidden (hidden group with a visible child)
 */
const defs = (
	over: Partial<Record<string, Partial<IMenuItemDefinition>>> = {},
): IMenuItemDefinition[] => [
	{
		title: "Dashboard",
		icon: DashboardIcon,
		onClick: vi.fn(),
		shouldRender: true,
		...over.Dashboard,
	},
	{
		title: "Reports",
		onClick: vi.fn(),
		shouldRender: true,
		...over.Reports,
		children: [
			{ title: "Monthly", onClick: vi.fn(), shouldRender: true },
			{
				title: "Annual",
				onClick: vi.fn(),
				shouldRender: true,
				...over.Annual,
				children: [{ title: "Q1", onClick: vi.fn(), shouldRender: true }],
			},
			{ title: "Secret", onClick: vi.fn(), shouldRender: false },
		],
	},
	{
		title: "Users",
		onClick: vi.fn(),
		onAuxClick: vi.fn(),
		shouldRender: true,
		...over.Users,
	},
	{
		title: "Hidden",
		onClick: vi.fn(),
		shouldRender: false,
		children: [{ title: "HiddenChild", onClick: vi.fn(), shouldRender: true }],
	},
];

// by text: entries inside a collapsed group are visibility: hidden, so they
// have no accessible name
const entry = (title: string) => {
	const found = screen
		.getAllByRole("button", { hidden: true })
		.filter((b) => b.textContent === title);
	if (found.length !== 1) throw new Error(`${found.length} entries "${title}"`);
	return found[0];
};

describe("MenuBase: onAuxClick", () => {
	it("[ISSUE-3479-ITEM-1] a right click does not call the middle-click handler", () => {
		const d = defs();
		renderUi(
			<MenuBase definition={d} wrapper={Wrap} menuItem={MaterialMenuItem} />,
		);
		// browsers fire auxclick with button 2 for the right button too
		fireEvent(
			entry("Users"),
			new MouseEvent("auxclick", { bubbles: true, button: 2 }),
		);
		expect(d[2].onAuxClick).not.toHaveBeenCalled();
	});

	it("[ISSUE-3479-ITEM-1] a custom renderer's onAuxClick passes the middle button only", () => {
		// a renderer that puts onAuxClick on its element unfiltered, as an app's would
		const Custom = (p: MenuItemProps) => (
			<button type={"button"} onClick={p.onClick} onAuxClick={p.onAuxClick}>
				{p.title}
			</button>
		);
		const d = defs();
		renderUi(<MenuBase definition={d} wrapper={Wrap} menuItem={Custom} />);
		// right, back and forward
		for (const button of [2, 3, 4])
			fireEvent(
				entry("Users"),
				new MouseEvent("auxclick", { bubbles: true, button }),
			);
		expect(d[2].onAuxClick).not.toHaveBeenCalled();
		fireEvent(
			entry("Users"),
			new MouseEvent("auxclick", { bubbles: true, button: 1 }),
		);
		expect(d[2].onAuxClick).toHaveBeenCalledTimes(1);
		expect(vi.mocked(d[2].onAuxClick!).mock.calls[0][0]).toMatchObject({
			type: "auxclick",
			button: 1,
		});
		expect(d[2].onClick).not.toHaveBeenCalled();
	});
});

describe("MenuBase: focus when the focused entry is removed", () => {
	const without = (title: string) => defs({ [title]: { shouldRender: false } });

	const ui = (
		d: IMenuItemDefinition[],
		menuItem: React.ComponentType<MenuItemProps> = MaterialMenuItem,
	) => (
		<ThemeProvider theme={theme}>
			<MenuBase
				definition={d}
				wrapper={Wrap}
				menuItem={menuItem}
				className={"test-menu"}
			/>
			<button type={"button"}>Outside</button>
		</ThemeProvider>
	);

	it("[ISSUE-3498-ITEM-8] a permission change that hides the focused entry moves focus to the highlighted entry", () => {
		const { rerender } = render(ui(defs()));
		fireEvent.click(entry("Monthly"));
		entry("Users").focus();
		rerender(ui(without("Users")));
		expect(document.activeElement).toBe(entry("Monthly"));
	});

	it("[ISSUE-3498-ITEM-8] without a highlighted entry, focus moves to the first entry", () => {
		const { rerender } = render(ui(defs()));
		entry("Users").focus();
		rerender(ui(without("Users")));
		expect(document.activeElement).toBe(entry("Dashboard"));
	});

	it("[ISSUE-3498-ITEM-8] a renderer without focusRef: focus moves to the first focusable element of the menu", () => {
		const Custom = (p: MenuItemProps) => (
			<button type={"button"} onClick={p.onClick}>
				{p.title}
			</button>
		);
		const { rerender } = render(ui(defs(), Custom));
		fireEvent.click(entry("Users"));
		entry("Dashboard").focus();
		rerender(ui(without("Dashboard"), Custom));
		expect(document.activeElement).toBe(entry("Reports"));
	});

	it("[ISSUE-3498-ITEM-8] when no entry is left, focus moves to the menu itself", () => {
		const { container, rerender } = render(ui(defs()));
		entry("Users").focus();
		rerender(ui([]));
		const root = container.querySelector(".test-menu");
		expect(root).not.toBeNull();
		expect(document.activeElement).toBe(root);
	});

	it("[ISSUE-3498-ITEM-8] focus outside the menu stays where it is", async () => {
		const { rerender } = render(ui(defs()));
		entry("Users").focus();
		screen.getByRole("button", { name: "Outside" }).focus();
		rerender(ui(without("Users")));
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Outside" }),
		);
		// focus that left the menu for the page is not pulled back either
		fireEvent.click(entry("Monthly"));
		entry("Dashboard").focus();
		entry("Dashboard").blur();
		await Promise.resolve();
		rerender(ui(without("Dashboard")));
		expect(document.activeElement).toBe(document.body);
	});
});
