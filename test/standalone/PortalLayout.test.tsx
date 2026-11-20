import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor,
} from "@testing-library/react";
import { ThemeProvider, createTheme, List, Theme } from "@mui/material";
import PortalLayout, {
	PortalLayoutProps,
	usePortalLayoutContext,
} from "../../src/standalone/Portal/Layout";
import MenuBase, {
	IMenuItemDefinition,
} from "../../src/standalone/Portal/Menu";
import MaterialMenuItem from "../../src/standalone/Portal/MenuItem/Material";

afterEach(cleanup);

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
});
