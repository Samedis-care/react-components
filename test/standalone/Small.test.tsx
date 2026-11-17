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

/** The seven Small components, each with the data-testid of its theme slot */
const allSmall = (
	props: { className?: string; classes?: { root: string } } = {},
	refs: Partial<Record<string, React.Ref<HTMLElement>>> = {},
) => (
	<List>
		<ListItem>
			<SmallIconButton
				aria-label="a"
				data-testid="CcSmallIconButton"
				ref={refs.CcSmallIconButton as React.Ref<HTMLButtonElement>}
				{...props}
			>
				<HomeIcon />
			</SmallIconButton>
			<SmallestIconButton
				aria-label="b"
				data-testid="CcSmallestIconButton"
				ref={refs.CcSmallestIconButton as React.Ref<HTMLButtonElement>}
				{...props}
			>
				<HomeIcon />
			</SmallestIconButton>
			<SmallListItemIcon
				data-testid="CcSmallListItemIcon"
				ref={refs.CcSmallListItemIcon}
				{...props}
			>
				<HomeIcon />
			</SmallListItemIcon>
		</ListItem>
		<SmallListItem
			data-testid="CcSmallListItem"
			ref={refs.CcSmallListItem as React.Ref<HTMLLIElement>}
			{...props}
		>
			<ListItemText primary="c" />
		</SmallListItem>
		<SelectorSmallListItem
			data-testid="CcSelectorSmallListItem"
			ref={refs.CcSelectorSmallListItem as React.Ref<HTMLLIElement>}
			{...props}
		>
			<ListItemText primary="d" />
		</SelectorSmallListItem>
		<ListItem disablePadding>
			<SmallListItemButton
				data-testid="CcSmallListItemButton"
				ref={refs.CcSmallListItemButton as React.Ref<HTMLDivElement>}
				{...props}
			>
				<ListItemText primary="e" />
			</SmallListItemButton>
		</ListItem>
		<ListItem disablePadding>
			<SelectorSmallListItemButton
				data-testid="CcSelectorSmallListItemButton"
				ref={refs.CcSelectorSmallListItemButton as React.Ref<HTMLDivElement>}
				{...props}
			>
				<ListItemText primary="f" />
			</SelectorSmallListItemButton>
		</ListItem>
	</List>
);

const SMALL_SLOTS = [
	"CcSmallIconButton",
	"CcSmallestIconButton",
	"CcSmallListItem",
	"CcSmallListItemButton",
	"CcSelectorSmallListItem",
	"CcSelectorSmallListItemButton",
	"CcSmallListItemIcon",
] as const;

describe("[ISSUE-3459-ITEM-14] theme slots of the Small components", () => {
	it("[ISSUE-3459-ITEM-14] each applies its slot's styleOverrides, over its own padding", () => {
		const themed = createTheme({
			components: {
				CcSmallIconButton: { styleOverrides: { root: { paddingLeft: 11 } } },
				CcSmallestIconButton: {
					styleOverrides: { root: { paddingLeft: 12 } },
				},
				CcSmallListItem: { styleOverrides: { root: { paddingLeft: 13 } } },
				CcSmallListItemButton: {
					styleOverrides: {
						root: ({ theme }) => ({ paddingLeft: theme.spacing(1.75) }),
					},
				},
				CcSelectorSmallListItem: {
					styleOverrides: { root: { paddingLeft: 15 } },
				},
				CcSelectorSmallListItemButton: {
					styleOverrides: { root: { paddingLeft: 16 } },
				},
				CcSmallListItemIcon: { styleOverrides: { root: { paddingLeft: 17 } } },
			},
		});
		render(<ThemeProvider theme={themed}>{allSmall()}</ThemeProvider>);
		const paddings = Object.fromEntries(
			SMALL_SLOTS.map((slot) => [
				slot,
				getComputedStyle(screen.getByTestId(slot)).paddingLeft,
			]),
		);
		expect(paddings).toEqual({
			CcSmallIconButton: "11px",
			CcSmallestIconButton: "12px",
			CcSmallListItem: "13px",
			CcSmallListItemButton: "14px",
			CcSelectorSmallListItem: "15px",
			CcSelectorSmallListItemButton: "16px",
			CcSmallListItemIcon: "17px",
		});
	});

	it("[ISSUE-3459-ITEM-14] each applies its slot's default props", () => {
		const defaultProps = { className: "from-theme" };
		const themed = createTheme({
			components: {
				CcSmallIconButton: { defaultProps },
				CcSmallestIconButton: { defaultProps },
				CcSmallListItem: { defaultProps },
				CcSmallListItemButton: { defaultProps },
				CcSelectorSmallListItem: { defaultProps },
				CcSelectorSmallListItemButton: { defaultProps },
				CcSmallListItemIcon: { defaultProps },
			},
		});
		render(<ThemeProvider theme={themed}>{allSmall()}</ThemeProvider>);
		for (const slot of SMALL_SLOTS)
			expect([slot, screen.getByTestId(slot).className]).toEqual([
				slot,
				expect.stringContaining("from-theme"),
			]);
	});

	it("[ISSUE-3459-ITEM-14] a theme's disableGutters default reaches the list items' gutters", () => {
		const themed = createTheme({
			components: {
				CcSmallListItem: { defaultProps: { disableGutters: true } },
				CcSmallListItemButton: { defaultProps: { disableGutters: true } },
				CcSelectorSmallListItem: { defaultProps: { disableGutters: true } },
				CcSelectorSmallListItemButton: {
					defaultProps: { disableGutters: true },
				},
			},
		});
		render(<ThemeProvider theme={themed}>{allSmall()}</ThemeProvider>);
		expect({
			item: gutterPx(screen.getByTestId("CcSmallListItem")),
			button: gutterPx(screen.getByTestId("CcSmallListItemButton")),
			selectorItem: gutterPx(screen.getByTestId("CcSelectorSmallListItem")),
			selectorButton: gutterPx(
				screen.getByTestId("CcSelectorSmallListItemButton"),
			),
		}).toEqual({
			item: [0, 0],
			button: [0, 0],
			selectorItem: [0, 0],
			selectorButton: [0, 0],
		});
	});

	it("[ISSUE-3459-ITEM-14] applies its slot's variants, matched against its own props", () => {
		const themed = createTheme({
			components: {
				CcSmallIconButton: {
					variants: [{ props: { size: "large" }, style: { paddingLeft: 21 } }],
				},
				CcSmallListItemButton: {
					variants: [
						{
							props: ({ dense }) => dense === true,
							style: { paddingLeft: 22 },
						},
					],
				},
			},
		});
		render(
			<ThemeProvider theme={themed}>
				<SmallIconButton aria-label="large" size="large">
					<HomeIcon />
				</SmallIconButton>
				<SmallIconButton aria-label="medium">
					<HomeIcon />
				</SmallIconButton>
				<List>
					<ListItem disablePadding>
						<SmallListItemButton dense data-testid="dense">
							<ListItemText primary="a" />
						</SmallListItemButton>
					</ListItem>
				</List>
			</ThemeProvider>,
		);
		const paddingLeft = (el: Element) => getComputedStyle(el).paddingLeft;
		expect({
			large: paddingLeft(screen.getByRole("button", { name: "large" })),
			medium: paddingLeft(screen.getByRole("button", { name: "medium" })),
			dense: paddingLeft(screen.getByTestId("dense")),
		}).toEqual({ large: "21px", medium: "4px", dense: "22px" });
	});

	it("[ISSUE-3459-ITEM-14] each passes classes on to the MUI component", () => {
		wrap(allSmall({ classes: { root: "from-classes" } }));
		for (const slot of SMALL_SLOTS)
			expect([slot, screen.getByTestId(slot).className]).toEqual([
				slot,
				expect.stringContaining("from-classes"),
			]);
	});

	it("[ISSUE-3459-ITEM-14] each forwards a ref to its element", () => {
		const refs = Object.fromEntries(
			SMALL_SLOTS.map((slot) => [slot, React.createRef<HTMLElement>()]),
		);
		wrap(allSmall({}, refs));
		for (const slot of SMALL_SLOTS)
			expect([slot, refs[slot].current]).toEqual([
				slot,
				screen.getByTestId(slot),
			]);
	});

	it("[ISSUE-3459-ITEM-14] keeps MUI's component prop", () => {
		wrap(
			<List>
				<SelectorSmallListItemButton component={"li"} data-testid="option">
					<ListItemText primary="a" />
				</SelectorSmallListItemButton>
				<SmallIconButton component={"span"} aria-label="span">
					<HomeIcon />
				</SmallIconButton>
			</List>,
		);
		expect(screen.getByTestId("option").tagName).toBe("LI");
		expect(screen.getByRole("button", { name: "span" }).tagName).toBe("SPAN");
	});
});
