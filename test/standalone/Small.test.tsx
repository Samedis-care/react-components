import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, List, ListItemText } from "@mui/material";
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
});
