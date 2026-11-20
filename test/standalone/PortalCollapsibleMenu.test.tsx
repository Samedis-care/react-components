import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	within,
} from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import PortalLayout, {
	PortalLayoutProps,
} from "../../src/standalone/Portal/Layout";
import CollapsibleMenu from "../../src/standalone/Portal/CollapsibleMenu";

afterEach(cleanup);

const theme = createTheme();

const classes = {
	root: "c-root",
	content: "c-content",
	bar: "c-bar",
	button: "c-button",
	iconOpen: "c-icon-open",
	iconClose: "c-icon-close",
};

const collapsible = (
	props: Partial<React.ComponentProps<typeof CollapsibleMenu>> = {},
) => (
	<CollapsibleMenu
		width={240}
		className={"c-class"}
		classes={classes}
		{...props}
	>
		<span data-testid={"menu"}>MENU</span>
	</CollapsibleMenu>
);

// jsdom has no matchMedia, so the layout is in desktop mode unless collapseMenu is set
const layoutProps = (p: Partial<PortalLayoutProps> = {}) =>
	({
		variant: "no-top-left",
		headerContent: <span>Header</span>,
		menuContent: collapsible(),
		content: <span>content</span>,
		menuId: "mnu",
		...p,
	}) as PortalLayoutProps;

const renderLayout = (p: Partial<PortalLayoutProps> = {}, t: Theme = theme) => {
	const result = render(
		<ThemeProvider theme={t}>
			<PortalLayout {...layoutProps(p)} />
		</ThemeProvider>,
	);
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

const contentOf = () => screen.getByTestId("menu").parentElement as HTMLElement;

describe("CollapsibleMenu", () => {
	it("[ISSUE-3479-ITEM-7] a collapsed menu becomes visible again when the layout turns mobile", () => {
		// in content, so the switch does not remount it (in menuContent it is remounted, ISSUE-3479-ITEM-25)
		const { rerenderLayout } = renderLayout({
			menuContent: <span>main menu</span>,
			content: collapsible(),
		});
		fireEvent.click(
			within(document.querySelector(".c-root") as HTMLElement).getByRole(
				"button",
				{ name: "Collapse menu" },
			),
		);
		expect(contentOf()).toHaveStyle({ display: "none" });
		rerenderLayout({ collapseMenu: true });
		expect(contentOf()).not.toHaveStyle({ display: "none" });
	});

	it("[ISSUE-3479-ITEM-7] back on desktop the menu is collapsed again, and Expand menu shows it", () => {
		const { rerenderLayout } = renderLayout({
			menuContent: <span>main menu</span>,
			content: collapsible(),
		});
		const root = document.querySelector(".c-root") as HTMLElement;
		fireEvent.click(
			within(root).getByRole("button", { name: "Collapse menu" }),
		);
		rerenderLayout({ collapseMenu: true });
		expect(within(root).queryByRole("button")).toBeNull();
		rerenderLayout({ collapseMenu: false });
		expect(contentOf()).toHaveStyle({ display: "none" });
		fireEvent.click(within(root).getByRole("button", { name: "Expand menu" }));
		expect(contentOf()).not.toHaveStyle({ display: "none" });
	});
});
