import "@testing-library/jest-dom/vitest";
import fs from "fs";
import path from "path";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createTheme, List, Theme, ThemeProvider } from "@mui/material";
import PortalLayout, {
	PortalLayoutProps,
	usePortalLayoutContext,
} from "../../src/standalone/Portal/Layout";
import MenuBase, {
	IMenuItemDefinition,
} from "../../src/standalone/Portal/Menu";
import MaterialMenuItem from "../../src/standalone/Portal/MenuItem/Material";
import CollapsibleMenu from "../../src/standalone/Portal/CollapsibleMenu";

afterEach(cleanup);

// matchMedia stub: evaluates (max-width:Npx)/(min-width:Npx) against a fake
// viewport width and notifies MUI's useMediaQuery subscriptions on resizeTo()
let viewportWidth = 1200;

const mediaListeners = new Set<() => void>();

const evaluateQuery = (query: string) => {
	const max = /max-width:\s*([\d.]+)px/.exec(query);
	const min = /min-width:\s*([\d.]+)px/.exec(query);
	if (!max && !min) return false;
	return (
		(!max || viewportWidth <= parseFloat(max[1])) &&
		(!min || viewportWidth >= parseFloat(min[1]))
	);
};

const stubViewport = (width: number) => {
	viewportWidth = width;
	vi.stubGlobal("matchMedia", (query: string) => ({
		get matches() {
			return evaluateQuery(query);
		},
		media: query,
		onchange: null,
		addEventListener: (_type: string, cb: () => void) => mediaListeners.add(cb),
		removeEventListener: (_type: string, cb: () => void) =>
			mediaListeners.delete(cb),
		addListener: () => undefined,
		removeListener: () => undefined,
		dispatchEvent: () => false,
	}));
};

const resizeTo = (width: number) =>
	act(() => {
		viewportWidth = width;
		mediaListeners.forEach((cb) => cb());
	});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	mediaListeners.clear();
});

const theme = createTheme();

const renderUi = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<List>{children}</List>
);

const defs = (): IMenuItemDefinition[] => [
	{ title: "Dashboard", onClick: vi.fn(), shouldRender: true },
	{
		title: "Reports",
		onClick: vi.fn(),
		shouldRender: true,
		children: [
			{ title: "Monthly", onClick: vi.fn(), shouldRender: true },
			{ title: "Annual", onClick: vi.fn(), shouldRender: true },
		],
	},
	{ title: "Users", onClick: vi.fn(), shouldRender: true },
];

const menu = (definition: IMenuItemDefinition[] = defs()) => (
	<MenuBase
		definition={definition}
		wrapper={Wrap}
		menuItem={MaterialMenuItem}
	/>
);

/** shows "<mobile>/<menuOpen>" of the surrounding layout */
const ContextProbe = ({ label }: { label: string }) => {
	const ctx = usePortalLayoutContext();
	return (
		<span data-testid={label}>
			{String(ctx.mobile)}/{String(ctx.menuOpen)}
		</span>
	);
};

/** a counter, to see whether a subtree kept its state */
const Counter = ({ label }: { label: string }) => {
	const [count, setCount] = React.useState(0);
	return (
		<button data-testid={label} onClick={() => setCount((c) => c + 1)}>
			{count}
		</button>
	);
};

const layoutProps = (p: Partial<PortalLayoutProps> = {}) =>
	({
		variant: "no-top-left",
		headerContent: <span>Header</span>,
		menuContent: menu(),
		content: <ContextProbe label={"content"} />,
		headerId: "hdr",
		menuId: "mnu",
		mainId: "main",
		...p,
	}) as PortalLayoutProps;

const renderLayout = (p: Partial<PortalLayoutProps> = {}, t: Theme = theme) => {
	const result = renderUi(<PortalLayout {...layoutProps(p)} />, t);
	return {
		...result,
		rerenderLayout: (next: Partial<PortalLayoutProps>) =>
			result.rerender(
				<ThemeProvider theme={t}>
					<PortalLayout {...layoutProps({ ...p, ...next })} />
				</ThemeProvider>,
			),
	};
};

const drawerRoot = () => {
	const el = document.querySelector<HTMLElement>(".MuiDrawer-root");
	if (!el) throw new Error("no drawer rendered");
	return el;
};

const drawerIsOpen = () => !drawerRoot().hasAttribute("aria-hidden");

// hidden: true, because an open drawer hides everything else from AT
const burger = () =>
	screen.getByRole("button", { name: "Toggle menu", hidden: true });

const probe = () => screen.getByTestId("content").textContent;

const openDrawer = async () => {
	burger().focus();
	fireEvent.click(burger());
	await waitFor(() => expect(drawerIsOpen()).toBe(true));
};

describe("PortalLayout: bugs", () => {
	it("[ISSUE-3479-ITEM-14] the burger says whether the drawer is open", async () => {
		renderLayout({ collapseMenu: true });
		expect(burger()).toHaveAttribute("aria-expanded", "false");
		await openDrawer();
		expect(burger()).toHaveAttribute("aria-expanded", "true");
	});
	it("[ISSUE-3479-ITEM-14] the burger says the drawer is closed again once Escape closed it", async () => {
		renderLayout({ collapseMenu: true });
		await openDrawer();
		await waitFor(() =>
			expect(screen.getByRole("dialog")).toContainElement(
				document.activeElement as HTMLElement,
			),
		);
		fireEvent.keyDown(document.activeElement!, { key: "Escape" });
		await waitFor(() => expect(drawerIsOpen()).toBe(false));
		expect(burger()).toHaveAttribute("aria-expanded", "false");
	});
	it("[ISSUE-3479-ITEM-14] the burger names the drawer it opens, which holds the close button and the menu", async () => {
		renderLayout({ collapseMenu: true });
		const id = burger().getAttribute("aria-controls");
		expect(id).toMatch(/\S/);
		// closed, the drawer is kept mounted, so the reference resolves
		expect(document.getElementById(id!)).toBe(
			screen.getByRole("dialog", { hidden: true }),
		);
		await openDrawer();
		expect(burger()).toHaveAttribute("aria-controls", id);
		const dialog = screen.getByRole("dialog");
		expect(dialog).toHaveAttribute("id", id);
		expect(
			within(dialog).getByRole("button", { name: "Close menu" }),
		).toBeInTheDocument();
		expect(
			within(dialog).getByRole("button", { name: "Dashboard" }),
		).toBeInTheDocument();
	});
	it("[ISSUE-3479-ITEM-14] after a trip to desktop, the burger names the drawer by the same id", () => {
		stubViewport(600);
		renderLayout();
		const id = burger().getAttribute("aria-controls");
		resizeTo(1200);
		expect(
			screen.queryByRole("button", { name: "Toggle menu", hidden: true }),
		).not.toBeInTheDocument();
		resizeTo(600);
		expect(burger()).toHaveAttribute("aria-controls", id);
		expect(document.getElementById(id!)).toBe(
			screen.getByRole("dialog", { hidden: true }),
		);
	});
	it("[ISSUE-3479-ITEM-14] two layouts on one page name their own drawers", () => {
		const ids = { headerId: undefined, menuId: undefined, mainId: undefined };
		renderUi(
			<>
				<PortalLayout {...layoutProps({ collapseMenu: true, ...ids })} />
				<PortalLayout {...layoutProps({ collapseMenu: true, ...ids })} />
			</>,
		);
		const controlled = screen
			.getAllByRole("button", { name: "Toggle menu", hidden: true })
			.map((button) => button.getAttribute("aria-controls"));
		expect(new Set(controlled).size).toBe(2);
		const drawers = screen.getAllByRole("dialog", { hidden: true });
		for (const id of controlled) {
			expect(drawers).toContain(document.getElementById(id!));
		}
	});

	it("[ISSUE-3479-ITEM-11] the open drawer has a close button that closes it and returns focus to the burger", async () => {
		renderLayout({ collapseMenu: true });
		await openDrawer();
		fireEvent.click(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: "Close menu",
			}),
		);
		await waitFor(() => expect(drawerIsOpen()).toBe(false));
		await waitFor(() => expect(document.activeElement).toBe(burger()));
	});
	it("[ISSUE-3479-ITEM-11] the close button is the first stop of Tab in the drawer, also before a focusable topLeft in variant basic", async () => {
		renderLayout({
			collapseMenu: true,
			variant: "basic",
			topLeft: <a href={"#home"}>Home</a>,
		});
		await openDrawer();
		const dialog = screen.getByRole("dialog");
		const tabbable = dialog.querySelectorAll(
			"a[href], button:not([disabled]), [tabindex='0']",
		);
		expect(tabbable[0]).toBe(
			within(dialog).getByRole("button", { name: "Close menu" }),
		);
		expect(tabbable[1]).toBe(
			within(dialog).getByRole("link", { name: "Home" }),
		);
		expect(tabbable[2]).toBe(
			within(dialog).getByRole("button", { name: "Dashboard" }),
		);
	});
	it("[ISSUE-3479-ITEM-11] a second click on the close button while the drawer slides out leaves it closed", async () => {
		renderLayout({ collapseMenu: true });
		await openDrawer();
		const close = within(screen.getByRole("dialog")).getByRole("button", {
			name: "Close menu",
		});
		fireEvent.click(close);
		fireEvent.click(close);
		expect(probe()).toBe("true/false");
		await waitFor(() => expect(drawerIsOpen()).toBe(false));
	});
	it("[ISSUE-3479-ITEM-11] the desktop menu has no close button", () => {
		stubViewport(1200);
		renderLayout();
		expect(probe()).toBe("false/false");
		expect(
			screen.getByRole("button", { name: "Dashboard" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Close menu", hidden: true }),
		).not.toBeInTheDocument();
	});
	it("[ISSUE-3479-ITEM-11] the close button's label is translated in every locale", () => {
		const i18nDir = path.resolve(__dirname, "../../src/assets/i18n");
		const labels = Object.fromEntries(
			fs
				.readdirSync(i18nDir, { withFileTypes: true })
				.filter((entry) => entry.isDirectory())
				.map((entry) => {
					const translation = JSON.parse(
						fs.readFileSync(
							path.join(i18nDir, entry.name, "translation.json"),
							"utf8",
						),
					) as {
						standalone: { portal: Record<string, string | undefined> };
					};
					return [entry.name, translation.standalone.portal["close-menu"]];
				}),
		);
		expect(Object.keys(labels)).toHaveLength(8);
		expect(labels.en).toBe("Close menu");
		for (const [lng, label] of Object.entries(labels)) {
			if (lng === "en") continue;
			expect(label, lng).toMatch(/\S/);
			expect(label, lng).not.toBe(labels.en);
		}
	});
	it("[ISSUE-3479-ITEM-12] desktop: the content is in a main landmark and the menu in a navigation landmark", () => {
		stubViewport(1200);
		renderLayout();
		expect(screen.getByRole("main")).toContainElement(
			screen.getByTestId("content"),
		);
		expect(
			within(screen.getByRole("navigation")).getByRole("button", {
				name: "Dashboard",
			}),
		).toBeInTheDocument();
	});
	it("[ISSUE-3479-ITEM-12] mobile: the open drawer holds the navigation landmark", async () => {
		renderLayout({ collapseMenu: true });
		await openDrawer();
		const nav = within(screen.getByRole("dialog")).getByRole("navigation");
		expect(
			within(nav).getByRole("button", { name: "Dashboard" }),
		).toBeInTheDocument();
	});
	it("[ISSUE-3479-ITEM-12] the element with mainId can take focus, e.g. after a client-side navigation", () => {
		stubViewport(1200);
		renderLayout({ content: <span>no focusable content</span> });
		const main = document.getElementById("main")!;
		act(() => main.focus());
		expect(document.activeElement).toBe(main);
	});
	it("[ISSUE-3479-ITEM-12] menuId is on the navigation landmark in both views, also in the closed drawer; without menuContent there is none", () => {
		stubViewport(1200);
		const { rerenderLayout } = renderLayout();
		const nav = () => document.getElementById("mnu");
		expect(nav()).toBe(screen.getByRole("navigation"));
		expect(screen.getAllByRole("main")).toHaveLength(1);
		resizeTo(600);
		// the closed drawer is hidden from AT, but kept mounted
		expect(nav()).toBe(screen.getByRole("navigation", { hidden: true }));
		expect(screen.getByRole("dialog", { hidden: true })).toContainElement(
			nav(),
		);
		expect(within(nav()!).getByText("Dashboard")).toBeInTheDocument();
		expect(screen.getAllByRole("main")).toHaveLength(1);
		rerenderLayout({ menuContent: null });
		expect(
			screen.queryByRole("navigation", { hidden: true }),
		).not.toBeInTheDocument();
		expect(nav()).toBeNull();
	});
	it("[ISSUE-3479-ITEM-12] the navigation landmark is named, in every locale", () => {
		stubViewport(1200);
		renderLayout();
		expect(screen.getByRole("navigation")).toHaveAccessibleName("Main menu");
		const i18nDir = path.resolve(__dirname, "../../src/assets/i18n");
		const labels = Object.fromEntries(
			fs
				.readdirSync(i18nDir, { withFileTypes: true })
				.filter((entry) => entry.isDirectory())
				.map((entry) => {
					const translation = JSON.parse(
						fs.readFileSync(
							path.join(i18nDir, entry.name, "translation.json"),
							"utf8",
						),
					) as {
						standalone: { portal: Record<string, string | undefined> };
					};
					return [entry.name, translation.standalone.portal["main-menu"]];
				}),
		);
		expect(Object.keys(labels)).toHaveLength(8);
		expect(labels.en).toBe("Main menu");
		for (const [lng, label] of Object.entries(labels)) {
			if (lng === "en") continue;
			expect(label, lng).toMatch(/\S/);
			expect(label, lng).not.toBe(labels.en);
		}
	});
	it("[ISSUE-3479-ITEM-25] crossing the breakpoint keeps the menu's active entry and expanded groups", async () => {
		stubViewport(1200);
		renderLayout();
		fireEvent.click(screen.getByRole("button", { name: "Reports" }));
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Monthly" })).toBeVisible(),
		);
		fireEvent.click(screen.getByRole("button", { name: "Monthly" }));
		resizeTo(600);
		await openDrawer();
		const dialog = screen.getByRole("dialog");
		const reports = within(dialog).getByRole("button", { name: "Reports" });
		expect(
			reports.querySelector("[data-testid=ExpandLessIcon]"),
		).not.toBeNull();
		// by text: a collapsed group's entries have no accessible name
		expect(
			within(dialog).getByText("Monthly").closest("[role=button]"),
		).toHaveClass("Mui-selected");
	});
	it("[ISSUE-3479-ITEM-25] back on desktop, the groups expanded in the drawer and any state in menuContent are kept", async () => {
		stubViewport(600);
		renderLayout({
			menuContent: (
				<>
					<Counter label={"menu-counter"} />
					{menu()}
				</>
			),
		});
		await openDrawer();
		const dialog = screen.getByRole("dialog");
		fireEvent.click(within(dialog).getByRole("button", { name: "Reports" }));
		fireEvent.click(screen.getByTestId("menu-counter"));
		resizeTo(1200);
		const menuArea = document.getElementById("mnu")!;
		expect(menuArea).toContainElement(screen.getByTestId("menu-counter"));
		expect(screen.getByTestId("menu-counter")).toHaveTextContent("1");
		expect(
			within(menuArea)
				.getByRole("button", { name: "Reports" })
				.querySelector("[data-testid=ExpandLessIcon]"),
		).not.toBeNull();
	});
	it("[ISSUE-3479-ITEM-25] a CollapsibleMenu collapsed on desktop is collapsed again after a trip to mobile", () => {
		stubViewport(1200);
		renderLayout({ menuContent: <CollapsibleMenu>{menu()}</CollapsibleMenu> });
		fireEvent.click(screen.getByRole("button", { name: "Collapse menu" }));
		resizeTo(600);
		resizeTo(1200);
		expect(
			screen.getByRole("button", { name: "Expand menu" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Dashboard" }),
		).not.toBeInTheDocument();
	});
	it("[ISSUE-3479-ITEM-25] Escape on a drawer entry closes the drawer, returns focus to the burger and is not passed on", async () => {
		const keyDown = vi.fn();
		renderUi(
			<div onKeyDown={keyDown}>
				<PortalLayout {...layoutProps({ collapseMenu: true })} />
			</div>,
		);
		await openDrawer();
		const users = within(screen.getByRole("dialog")).getByRole("button", {
			name: "Users",
		});
		act(() => users.focus());
		fireEvent.keyDown(users, { key: "Escape" });
		expect(probe()).toBe("true/false");
		await waitFor(() => expect(drawerIsOpen()).toBe(false));
		await waitFor(() => expect(document.activeElement).toBe(burger()));
		// as MUI's Modal does with the Escape that closes it
		expect(keyDown).not.toHaveBeenCalled();
	});
	it("[ISSUE-3479-ITEM-25] Escape on a desktop menu entry does not open the drawer", () => {
		stubViewport(1200);
		renderLayout();
		const users = screen.getByRole("button", { name: "Users" });
		act(() => users.focus());
		fireEvent.keyDown(users, { key: "Escape" });
		expect(probe()).toBe("false/false");
		resizeTo(600);
		expect(drawerIsOpen()).toBe(false);
	});
	it("[ISSUE-3479-ITEM-25] a click in the drawer's menu reaches the handlers above the layout once", async () => {
		const click = vi.fn();
		renderUi(
			<div onClick={click}>
				<PortalLayout {...layoutProps({ collapseMenu: true })} />
			</div>,
		);
		await openDrawer();
		click.mockClear();
		fireEvent.click(
			within(screen.getByRole("dialog")).getByRole("button", { name: "Users" }),
		);
		expect(click).toHaveBeenCalledTimes(1);
	});
});
