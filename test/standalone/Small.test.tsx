import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import {
	ThemeProvider,
	createTheme,
	List,
	ListItem,
	ListItemText,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
import {
	SmallIconButton,
	SmallestIconButton,
	SmallListItem,
	SmallListItemButton,
	SmallListItemIcon,
	SelectorSmallListItem,
	SelectorSmallListItemButton,
} from "../../src/standalone/Small";

const theme = createTheme();
const wrap = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

afterEach(() => {
	cleanup();
});

/** Left and right padding in px (jsdom reports an unitless 0 as "0") */
const gutterPx = (el: Element) => {
	const style = getComputedStyle(el);
	return [parseFloat(style.paddingLeft), parseFloat(style.paddingRight)];
};

describe("Small", () => {
	describe("SmallIconButton", () => {
		it("renders without crashing", () => {
			wrap(
				<SmallIconButton aria-label="settings">
					<HomeIcon />
				</SmallIconButton>,
			);
			expect(screen.getByRole("button", { name: "settings" })).toBeTruthy();
		});
	});

	describe("SmallestIconButton", () => {
		it("renders without crashing", () => {
			wrap(
				<SmallestIconButton aria-label="home">
					<HomeIcon />
				</SmallestIconButton>,
			);
			expect(screen.getByRole("button", { name: "home" })).toBeTruthy();
		});
	});

	describe("SmallListItem", () => {
		it("renders children", () => {
			wrap(
				<List>
					<SmallListItem>
						<ListItemText primary="Item text" />
					</SmallListItem>
				</List>,
			);
			expect(screen.getByText("Item text")).toBeTruthy();
		});
	});

	describe("SmallListItemButton", () => {
		it("renders as a button", () => {
			wrap(
				<List>
					<SmallListItemButton>
						<ListItemText primary="Button text" />
					</SmallListItemButton>
				</List>,
			);
			expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
		});
	});

	describe("SmallListItemIcon", () => {
		it("renders icon with minWidth 0", () => {
			const { container } = wrap(
				<List>
					<SmallListItem>
						<SmallListItemIcon>
							<HomeIcon />
						</SmallListItemIcon>
					</SmallListItem>
				</List>,
			);
			const iconEl = container.querySelector(".MuiListItemIcon-root");
			expect(iconEl).toBeTruthy();
		});
	});

	describe("SelectorSmallListItem", () => {
		it("renders children", () => {
			wrap(
				<List>
					<SelectorSmallListItem>
						<ListItemText primary="Selector item" />
					</SelectorSmallListItem>
				</List>,
			);
			expect(screen.getByText("Selector item")).toBeTruthy();
		});
	});

	describe("SelectorSmallListItemButton", () => {
		it("renders as a button", () => {
			wrap(
				<List>
					<SelectorSmallListItemButton>
						<ListItemText primary="Selector button" />
					</SelectorSmallListItemButton>
				</List>,
			);
			expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
		});
	});

	describe("list items", () => {
		it("[ISSUE-3459-ITEM-1] narrows the horizontal gutters (8/8, Selector variants 0/8)", () => {
			const { container } = wrap(
				<List>
					<SmallListItem data-testid="item">
						<ListItemText primary="a" />
					</SmallListItem>
					<ListItem disablePadding>
						<SmallListItemButton data-testid="button">
							<ListItemText primary="b" />
						</SmallListItemButton>
					</ListItem>
					<SelectorSmallListItem data-testid="selectorItem">
						<ListItemText primary="c" />
					</SelectorSmallListItem>
					<ListItem disablePadding>
						<SelectorSmallListItemButton data-testid="selectorButton">
							<ListItemText primary="d" />
						</SelectorSmallListItemButton>
					</ListItem>
				</List>,
			);
			const gutters = (id: string) =>
				gutterPx(container.querySelector(`[data-testid='${id}']`)!);
			expect({
				item: gutters("item"),
				button: gutters("button"),
				selectorItem: gutters("selectorItem"),
				selectorButton: gutters("selectorButton"),
			}).toEqual({
				item: [8, 8],
				button: [8, 8],
				selectorItem: [0, 8],
				selectorButton: [0, 8],
			});
		});

		it("[ISSUE-3459-ITEM-1] disableGutters removes the gutters, disablePadding all padding", () => {
			const { container } = wrap(
				<List>
					<SmallListItem disableGutters data-testid="item">
						<ListItemText primary="a" />
					</SmallListItem>
					<SmallListItem disablePadding data-testid="itemNoPadding">
						<ListItemText primary="b" />
					</SmallListItem>
					<SelectorSmallListItem
						disablePadding
						data-testid="selectorItemNoPadding"
					>
						<ListItemText primary="c" />
					</SelectorSmallListItem>
					<ListItem disablePadding>
						<SmallListItemButton disableGutters data-testid="button">
							<ListItemText primary="d" />
						</SmallListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<SelectorSmallListItemButton
							disableGutters
							data-testid="selectorButton"
						>
							<ListItemText primary="e" />
						</SelectorSmallListItemButton>
					</ListItem>
				</List>,
			);
			for (const id of [
				"item",
				"itemNoPadding",
				"selectorItemNoPadding",
				"button",
				"selectorButton",
			]) {
				expect([
					id,
					gutterPx(container.querySelector(`[data-testid='${id}']`)!),
				]).toEqual([id, [0, 0]]);
			}
		});

		it("[ISSUE-3459-ITEM-1] keeps MUI's 48px on the right for a secondary action", () => {
			const action = (
				<SmallIconButton aria-label="Delete">
					<HomeIcon />
				</SmallIconButton>
			);
			const { container } = wrap(
				<List>
					<SmallListItem secondaryAction={action} data-testid="item">
						<ListItemText primary="a" />
					</SmallListItem>
					<SelectorSmallListItem
						secondaryAction={action}
						data-testid="selectorItem"
					>
						<ListItemText primary="b" />
					</SelectorSmallListItem>
					<ListItem disablePadding secondaryAction={action}>
						<SmallListItemButton data-testid="button">
							<ListItemText primary="c" />
						</SmallListItemButton>
					</ListItem>
					<ListItem disablePadding secondaryAction={action}>
						<SelectorSmallListItemButton data-testid="selectorButton">
							<ListItemText primary="d" />
						</SelectorSmallListItemButton>
					</ListItem>
				</List>,
			);
			const gutters = (id: string) =>
				gutterPx(container.querySelector(`[data-testid='${id}']`)!);
			expect({
				item: gutters("item"),
				selectorItem: gutters("selectorItem"),
				button: gutters("button"),
				selectorButton: gutters("selectorButton"),
			}).toEqual({
				item: [8, 48],
				selectorItem: [0, 48],
				button: [8, 48],
				selectorButton: [0, 48],
			});
		});

		it("[ISSUE-3459-ITEM-1] lets sx set the gutters", () => {
			const { container } = wrap(
				<List>
					<SmallListItem sx={{ px: 3 }} data-testid="item">
						<ListItemText primary="a" />
					</SmallListItem>
					<ListItem disablePadding>
						<SelectorSmallListItemButton sx={{ pl: 2 }} data-testid="button">
							<ListItemText primary="b" />
						</SelectorSmallListItemButton>
					</ListItem>
				</List>,
			);
			const gutters = (id: string) =>
				gutterPx(container.querySelector(`[data-testid='${id}']`)!);
			expect({ item: gutters("item"), button: gutters("button") }).toEqual({
				item: [24, 24],
				button: [16, 8],
			});
		});
	});
});
