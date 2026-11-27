import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, createTheme, Grid, ThemeProvider } from "@mui/material";
import { createMemoryHistory } from "history";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor } from "storybook/test";
import SignalPortlet from "./index";
import { HistoryRouter, useLocation } from "../Routes";
import {
	edgesPast,
	pageScrollsSideways,
} from "../../stories/test-utils/hiddenTextLayout";

const meta: Meta<typeof SignalPortlet> = {
	title: "Standalone/SignalPortlet",
	component: SignalPortlet,
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof SignalPortlet>;

const MINUTE = 60 * 1000;

const ROW_SX = { width: 720 };

const darkTheme = createTheme({ palette: { mode: "dark" } });

const WithRouter = ({ children }: { children: React.ReactNode }) => {
	const history = useMemo(() => createMemoryHistory(), []);
	return (
		<HistoryRouter history={history}>
			<Box sx={{ width: 320 }}>{children}</Box>
		</HistoryRouter>
	);
};

/** The current path and search of the story's router */
const CurrentPath = () => {
	const { pathname, search } = useLocation();
	return <p data-testid="path">{pathname + search}</p>;
};

export const Default: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="System Status"
				items={[
					{ count: 5, text: "Open Incidents" },
					{ count: 0, text: "Warnings" },
					{ count: 12, text: "Resolved Today" },
				]}
			/>
		</WithRouter>
	),
};

export const WithRefresh: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Dashboard"
				items={[
					{ count: 3, text: "Pending Tasks" },
					{ count: 1, text: "Critical Alerts" },
					{ count: 0, text: "Errors" },
				]}
				updatedAt={new Date(Date.now() - 5 * 60 * 1000)}
				onRefresh={() => alert("Refreshing...")}
			/>
		</WithRouter>
	),
};

export const WithLinks: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Linked Items"
				items={[
					{ count: 7, text: "Active Users", link: "/users" },
					{ count: 2, text: "Failed Jobs", link: "/jobs" },
					{ count: 0, text: "Queue Empty", link: "/queue" },
				]}
			/>
		</WithRouter>
	),
};

export const Loading: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Loading State"
				items={[
					{ count: null, text: "Fetching data..." },
					{ count: null, text: "Also loading..." },
				]}
			/>
		</WithRouter>
	),
};

export const LargeCount: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="High Volume"
				items={[
					{ count: 1500, text: "Total Records" },
					{ count: 42, text: "Processed" },
				]}
			/>
		</WithRouter>
	),
};

/**
 * A count above 999 shows "999+" within its round 40px avatar, and the full
 * number for assistive technology
 */
export const Issue3469Item1CappedCountFitsItsAvatar: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="High Volume"
				items={[
					{ count: 999, text: "Exactly 999" },
					{ count: 1500, text: "Total Records" },
					{ count: 123456, text: "Archived" },
				]}
			/>
		</WithRouter>
	),
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas, canvasElement }) => {
		const avatars = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(".MuiAvatar-root"),
		);
		await expect(avatars).toHaveLength(3);
		await expect(avatars[0]).toHaveTextContent(/^999$/);
		// every glyph box of "999+" lies inside the circle, so nothing is clipped
		for (const av of avatars.slice(1)) {
			const circle = av.getBoundingClientRect();
			const radius = circle.width / 2;
			const cx = circle.left + radius;
			const cy = circle.top + radius;
			const text = av.querySelector<HTMLElement>("[aria-hidden='true']");
			if (!text) throw new Error("no visible capped count");
			await expect(text).toHaveTextContent(/^999\+$/);
			const box = text.getBoundingClientRect();
			const dy = Math.max(Math.abs(box.top - cy), Math.abs(box.bottom - cy));
			const halfChord = Math.sqrt(radius * radius - dy * dy);
			await expect(box.left).toBeGreaterThanOrEqual(cx - halfChord);
			await expect(box.right).toBeLessThanOrEqual(cx + halfChord);
		}
		// the full numbers, for assistive technology
		for (const full of ["1500", "123456"]) {
			await expect(canvas.getByText(full)).not.toHaveAttribute("aria-hidden");
		}
	},
};

/**
 * A linked row is a link to its path, named by its count and text: Tab
 * reaches it, and Enter opens the page in the app. Space, which activates
 * buttons, does nothing on a link
 */
export const Issue3469Item12RowIsALink: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Linked Items"
				items={[
					{ count: 7, text: "Active Users", link: "/users?state=active" },
				]}
			/>
			<CurrentPath />
		</WithRouter>
	),
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const row = canvas.getByRole("link", { name: "7 Active Users" });
		await expect(row).toHaveAttribute("href", "/users?state=active");
		const path = canvas.getByTestId("path");
		await userEvent.tab();
		await expect(row).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(path).toHaveTextContent(/^\/$/);
		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(path).toHaveTextContent(/^\/users\?state=active$/),
		);
	},
};

/**
 * Every row is a list item: a linked row's link sits inside its `<li>`,
 * fills it and is laid out like a plain row
 */
export const Issue3469Item13RowsAreListItems: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Linked Items"
				items={[
					{ count: 7, text: "Active Users", link: "/users" },
					{ count: 2, text: "Plain row" },
				]}
			/>
		</WithRouter>
	),
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const rows = canvas.getAllByRole("listitem");
		await expect(rows).toHaveLength(2);
		const [linked, plain] = rows;
		// the link fills its list item, so the whole row reacts to hover and focus
		const btn = canvas.getByRole("link", { name: "7 Active Users" });
		const rowBox = linked.getBoundingClientRect();
		const btnBox = btn.getBoundingClientRect();
		await expect([btnBox.width, btnBox.height]).toEqual([
			rowBox.width,
			rowBox.height,
		]);
		// a linked row is laid out like a plain one: same height, avatar and text
		// at the same place
		const layout = (row: HTMLElement) => {
			const box = row.getBoundingClientRect();
			const at = (selector: string) => {
				const el = row.querySelector(selector);
				if (!el) throw new Error(`no ${selector}`);
				const r = el.getBoundingClientRect();
				return [r.left - box.left, r.top - box.top];
			};
			return {
				height: box.height,
				avatar: at(".MuiAvatar-root"),
				text: at(".MuiListItemText-root"),
			};
		};
		await expect(layout(linked)).toEqual(layout(plain));
	},
};

type Rgba = { r: number; g: number; b: number; a: number };
const parseRgba = (color: string): Rgba => {
	const p = (color.match(/[\d.]+/g) ?? []).map(Number);
	return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
};
/** fg composited over an opaque bg */
const over = (fg: Rgba, bg: Rgba): Rgba => ({
	r: fg.r * fg.a + bg.r * (1 - fg.a),
	g: fg.g * fg.a + bg.g * (1 - fg.a),
	b: fg.b * fg.a + bg.b * (1 - fg.a),
	a: 1,
});
const luminance = ({ r, g, b }: Rgba) =>
	[r, g, b]
		.map((v) => {
			const c = v / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		})
		.reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a: Rgba, b: Rgba) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

/** The Paper's color, including the elevation overlay of the dark palette */
const paperColor = (paper: Element | null): Rgba => {
	if (!paper) throw new Error("no Paper");
	const cs = getComputedStyle(paper);
	const base = over(parseRgba(cs.backgroundColor), {
		r: 255,
		g: 255,
		b: 255,
		a: 1,
	});
	const overlay = cs.backgroundImage.match(/rgba?\([^)]+\)/);
	return overlay ? over(parseRgba(overlay[0]), base) : base;
};

const ZERO_CARD = {
	title: "Zero",
	items: [
		{ count: 0, text: "Nothing to do" },
		{ count: 3, text: "Open" },
	],
};

export const Issue3469Item15ZeroCountIsReadable: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3469-ITEM-15: the "0" of a zero count is white on a translucent grey, 1.88:1 on the default light Paper; in the dark palette it is 3.16:1. Expected: at least 4.5:1 in both palettes. The non-zero avatar next to it passes.',
			},
		},
	},
	render: () => (
		<Box sx={ROW_SX}>
			<Grid container spacing={2}>
				<Grid size={6} data-palette="light">
					<SignalPortlet {...ZERO_CARD} />
				</Grid>
				<ThemeProvider theme={darkTheme}>
					<Grid size={6} data-palette="dark">
						<SignalPortlet {...ZERO_CARD} />
					</Grid>
				</ThemeProvider>
			</Grid>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const ratios = Array.from(
			canvasElement.querySelectorAll("[data-palette]"),
		).flatMap((cell) => {
			const paper = paperColor(cell.querySelector(".MuiPaper-root"));
			return Array.from(cell.querySelectorAll(".MuiAvatar-root")).map((av) => {
				const cs = getComputedStyle(av);
				const bg = over(parseRgba(cs.backgroundColor), paper);
				const fg = over(parseRgba(cs.color), bg);
				return `${cell.getAttribute("data-palette")} ${av.textContent}: ${
					contrast(fg, bg) >= 4.5 ? "ok" : contrast(fg, bg).toFixed(2)
				}`;
			});
		});
		await expect(ratios, "count contrast below 4.5:1").toEqual([
			"light 0: ok",
			"light 3: ok",
			"dark 0: ok",
			"dark 3: ok",
		]);
	},
};

// CSS variables with both color schemes; an element with the class
// `scheme-dark` gives its subtree the dark scheme's variables
const cssVarsTheme = createTheme({
	cssVariables: { colorSchemeSelector: ".scheme-%s" },
	colorSchemes: { light: true, dark: true },
});
// keep the provider's color scheme off the page and out of the storage; MUI types
// colorSchemeNode only for apps that declare their CSS variables in its types
const SCHEME_IN_STORY_ONLY = { colorSchemeNode: null, storageManager: null };

/** The text and background color of the zero count in the cell `data-cell={id}` */
const zeroCountColors = (canvasElement: HTMLElement, id: string) => {
	const avatar = Array.from(
		canvasElement.querySelectorAll(`[data-cell="${id}"] .MuiAvatar-root`),
	).find((av) => av.textContent === "0");
	if (!avatar) throw new Error(`no zero count in ${id}`);
	const cs = getComputedStyle(avatar);
	return { color: cs.color, backgroundColor: cs.backgroundColor };
};

/**
 * With a theme of CSS variables, the zero count in the dark color scheme
 * (right) has the colors of the dark palette (left)
 */
export const Issue3469Item15ZeroCountFollowsTheColorScheme: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<Box sx={ROW_SX}>
			<Grid container spacing={2}>
				<ThemeProvider theme={darkTheme}>
					<Grid size={6} data-cell="palette">
						<SignalPortlet {...ZERO_CARD} />
					</Grid>
				</ThemeProvider>
				<ThemeProvider theme={cssVarsTheme} {...SCHEME_IN_STORY_ONLY}>
					<Grid size={6} data-cell="scheme" className="scheme-dark">
						<SignalPortlet {...ZERO_CARD} />
					</Grid>
				</ThemeProvider>
			</Grid>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const palette = zeroCountColors(canvasElement, "palette");
		await expect(palette).toEqual({
			color: "rgb(255, 255, 255)",
			backgroundColor: "rgb(117, 117, 117)",
		});
		await expect(zeroCountColors(canvasElement, "scheme")).toEqual(palette);
	},
};

// an app's own colors for the zero count, in its theme
const INACTIVE_OVERRIDE = {
	components: {
		CcSignalPortletItem: {
			styleOverrides: {
				itemColorInactive: {
					color: "rgb(255, 255, 255)",
					backgroundColor: "rgb(89, 86, 85)",
				},
			},
		},
	},
};
const darkOverrideTheme = createTheme({
	palette: { mode: "dark" },
	...INACTIVE_OVERRIDE,
});
const cssVarsOverrideTheme = createTheme({
	cssVariables: { colorSchemeSelector: ".scheme-%s" },
	colorSchemes: { light: true, dark: true },
	...INACTIVE_OVERRIDE,
});

/**
 * A theme's `styleOverrides.itemColorInactive` sets the zero count's colors
 * in a dark palette and in the dark scheme of a theme of CSS variables too
 */
export const Issue3469Item15ThemeOverridesZeroCountColors: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<Box sx={ROW_SX}>
			<Grid container spacing={2}>
				<ThemeProvider theme={darkOverrideTheme}>
					<Grid size={6} data-cell="palette">
						<SignalPortlet {...ZERO_CARD} />
					</Grid>
				</ThemeProvider>
				<ThemeProvider theme={cssVarsOverrideTheme} {...SCHEME_IN_STORY_ONLY}>
					<Grid size={6} data-cell="scheme" className="scheme-dark">
						<SignalPortlet {...ZERO_CARD} />
					</Grid>
				</ThemeProvider>
			</Grid>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const override = {
			color: "rgb(255, 255, 255)",
			backgroundColor: "rgb(89, 86, 85)",
		};
		await expect({
			palette: zeroCountColors(canvasElement, "palette"),
			scheme: zeroCountColors(canvasElement, "scheme"),
		}).toEqual({ palette: override, scheme: override });
	},
};

const focusStyle = (el: Element) => {
	const cs = getComputedStyle(el);
	return `outline ${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}; box-shadow ${cs.boxShadow}`;
};
/** A focus ring: an outline of 2px or more with 3:1 against white, or a box-shadow */
const hasFocusRing = (el: Element) => {
	const cs = getComputedStyle(el);
	if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) {
		const white = { r: 255, g: 255, b: 255, a: 1 };
		return contrast(over(parseRgba(cs.outlineColor), white), white) >= 3;
	}
	return cs.boxShadow !== "none";
};

export const Issue3469Item14RowAndRefreshShowFocusRing: Story = {
	args: {
		title: "Focus",
		items: [{ count: 5, text: "Open", link: "/open" }],
		updatedAt: Date.now() - 5 * MINUTE,
		onRefresh: fn(),
	},
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3469-ITEM-14: a keyboard-focused row only turns light grey (1.32:1 against the card) and the focused Refresh button only shows MUI's faint focus ripple; neither has an outline, so in forced-colors mode focus is not shown at all. Expected: a focus ring of at least 2px and 3:1 on both.",
			},
		},
	},
	render: (args) => (
		<WithRouter>
			<SignalPortlet {...args} />
		</WithRouter>
	),
	play: async ({ canvas }) => {
		const row = canvas.getByText("Open").closest(".MuiListItemButton-root");
		if (!row) throw new Error("no linked row");
		const refresh = canvas.getByRole("button", { name: "Refresh" });
		await userEvent.tab();
		await expect(row).toHaveFocus();
		await waitFor(() => expect(row).toHaveClass("Mui-focusVisible"));
		const rowRing = hasFocusRing(row);
		const rowStyle = focusStyle(row);
		await userEvent.tab();
		await expect(refresh).toHaveFocus();
		await waitFor(() => expect(refresh).toHaveClass("Mui-focusVisible"));
		await expect(
			{ row: rowRing, refresh: hasFocusRing(refresh) },
			`row: ${rowStyle} | Refresh: ${focusStyle(refresh)}`,
		).toEqual({ row: true, refresh: true });
	},
};

/**
 * The focused Refresh button shows the ring alone: MUI's pulsating focus
 * ripple, which would cover the ring inside the button, is off
 */
export const Issue3469Item14RefreshRingIsNotCovered: Story = {
	args: {
		title: "Focus",
		items: [{ count: 5, text: "Open" }],
		onRefresh: fn(),
	},
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<WithRouter>
			<SignalPortlet {...args} />
		</WithRouter>
	),
	play: async ({ canvas }) => {
		const refresh = canvas.getByRole("button", { name: "Refresh" });
		await userEvent.tab();
		await expect(refresh).toHaveFocus();
		await waitFor(() => expect(refresh).toHaveClass("Mui-focusVisible"));
		await expect(
			refresh.querySelectorAll(".MuiTouchRipple-ripplePulsate"),
		).toHaveLength(0);
	},
};

// an app's theme ring, as MUI's createTheme({ focusVisible }) takes it
const GREEN_RING = createTheme({
	focusVisible: { outlineColor: "rgb(0, 128, 0)" },
});

/**
 * With MUI's `focusVisible` theme ring, the row and Refresh show the theme's
 * ring, as every MUI ListItemButton and IconButton does, and no ring of
 * their own
 */
export const Issue3469Item14ThemeFocusVisibleRing: Story = {
	args: {
		title: "Focus",
		items: [{ count: 5, text: "Open", link: "/open" }],
		onRefresh: fn(),
	},
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<ThemeProvider theme={GREEN_RING}>
			<WithRouter>
				<SignalPortlet {...args} />
			</WithRouter>
		</ThemeProvider>
	),
	play: async ({ canvas }) => {
		const row = canvas.getByRole("link", { name: "5 Open" });
		const refresh = canvas.getByRole("button", { name: "Refresh" });
		await userEvent.tab();
		await expect(row).toHaveFocus();
		await waitFor(() => expect(row).toHaveClass("Mui-focusVisible"));
		const rowRing = getComputedStyle(row).outlineColor;
		await userEvent.tab();
		await expect(refresh).toHaveFocus();
		await waitFor(() => expect(refresh).toHaveClass("Mui-focusVisible"));
		await expect({
			row: rowRing,
			refresh: getComputedStyle(refresh).outlineColor,
		}).toEqual({ row: "rgb(0, 128, 0)", refresh: "rgb(0, 128, 0)" });
	},
};

export const Issue3473Item16HiddenFullCountStaysInside: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3473-ITEM-16: at 320px in a right-to-left part of a left-to-right page, the visually hidden full number of a count shown as "999+" lies inside the box it is placed in (the nearest positioned ancestor), so it never makes the page scroll sideways. With MUI\'s visually hidden style, its -1px margin put it 1px past the top and start edges of its container wherever it began the container.',
			},
		},
	},
	render: () => (
		<Box dir={"rtl"}>
			<WithRouter>
				<SignalPortlet
					title="High Volume"
					items={[{ count: 1500, text: "Total Records" }]}
				/>
			</WithRouter>
		</Box>
	),
	play: async ({ canvas }) => {
		await expect(edgesPast(canvas.getByText("1500"))).toEqual([]);
		await expect(pageScrollsSideways()).toBe(false);
	},
};
