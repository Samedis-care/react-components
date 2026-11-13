import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
	AppBar,
	Box,
	Button,
	createTheme,
	Tab,
	TabProps,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { createMemoryHistory } from "history";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import RoutedTabs, { RoutedTabsProps } from "./RoutedTabs";
import RoutedTabPanelWrapper from "./RoutedTabPanelWrapper";
import useRoutedTabPanel from "./useRoutedTabPanel";

type Args = Omit<RoutedTabsProps, "children">;

const meta: Meta<Args> = {
	title: "non-standalone/RoutedTabs",
	parameters: { layout: "fullscreen" },
	args: {
		"aria-label": "Settings",
		variant: "standard",
	},
};

export default meta;
type Story = StoryObj<Args>;

// ─── Tab content components ──────────────────────────────────────────────────

const GeneralPanel = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h6">General</Typography>
		<Typography>General settings and preferences.</Typography>
	</Box>
);

const SecurityPanel = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h6">Security</Typography>
		<Typography>Password, two-factor authentication, and more.</Typography>
	</Box>
);

const NotificationsPanel = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h6">Notifications</Typography>
		<Typography>Configure email and push notification settings.</Typography>
	</Box>
);

// ─── RoutedTabs demo (needs to be inside a Route context) ────────────────────

const TabsDemo = () => {
	const createTab = useRoutedTabPanel();
	return (
		<Box sx={{ width: "100%" }}>
			<RoutedTabs>
				<Tab label="General" value="general" />
				<Tab label="Security" value="security" />
				<Tab label="Notifications" value="notifications" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					createTab("general", <GeneralPanel />),
					createTab("security", <SecurityPanel />),
					createTab("notifications", <NotificationsPanel />),
				]}
			</RoutedTabPanelWrapper>
		</Box>
	);
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * A router with its own memory history, created once (not on every render)
 */
const Host = (props: {
	at: string;
	path?: string;
	children: React.ReactElement;
}) => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: [props.at] }),
	);
	return (
		<HistoryRouter history={history}>
			<Routes>
				{[
					<Route
						key="page"
						path={props.path ?? "/settings/*"}
						element={props.children}
					/>,
				]}
			</Routes>
		</HistoryRouter>
	);
};

/** Shows the current URL, so play functions and readers can see the navigation */
const UrlCaption = () => {
	const { pathname, search } = useLocation();
	return (
		<Typography variant="caption" component="p" sx={{ px: 2 }}>
			URL: {pathname}
			{search}
		</Typography>
	);
};

const Panel = (props: { name: string; text: string }) => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h6" component="h2">
			{props.name}
		</Typography>
		<Typography>{props.text}</Typography>
		<Button variant="outlined" sx={{ mt: 1 }}>
			Edit {props.name.toLowerCase()}
		</Button>
	</Box>
);

/** The consumer shape: "" first in the bar, its panel last in the wrapper */
const SettingsTabs = (props: {
	tabsProps: Args;
	before?: React.ReactNode;
	securityPanel?: React.ReactElement;
}) => {
	const tab = useRoutedTabPanel();
	return (
		<Box sx={{ width: "100%" }}>
			{props.before}
			<RoutedTabs {...props.tabsProps}>
				<Tab label="General" value="" />
				<Tab label="Security" value="security" />
				<Tab label="Notifications" value="notifications" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab(
						"security",
						props.securityPanel ?? (
							<Panel
								name="Security"
								text="Password, two-factor authentication, and more."
							/>
						),
					),
					tab(
						"notifications",
						<Panel
							name="Notifications"
							text="Configure email and push notification settings."
						/>,
					),
					tab(
						"",
						<Panel name="General" text="General settings and preferences." />,
					),
				]}
			</RoutedTabPanelWrapper>
			<UrlCaption />
		</Box>
	);
};

const tabsOf = (canvasElement: HTMLElement, name = "Settings") =>
	within(within(canvasElement).getByRole("tablist", { name })).getAllByRole(
		"tab",
	);

// ─── Stories ─────────────────────────────────────────────────────────────────

export const DefaultTab: StoryObj = {
	name: "Default Tab (General)",
	render: () => {
		const history = createMemoryHistory({
			initialEntries: ["/settings/general"],
		});
		return (
			<HistoryRouter history={history}>
				<Routes>
					{[<Route key="settings" path="/settings/*" element={<TabsDemo />} />]}
				</Routes>
			</HistoryRouter>
		);
	},
};

export const SecurityTab: StoryObj = {
	name: "Security Tab Selected",
	render: () => {
		const history = createMemoryHistory({
			initialEntries: ["/settings/security"],
		});
		return (
			<HistoryRouter history={history}>
				<Routes>
					{[<Route key="settings" path="/settings/*" element={<TabsDemo />} />]}
				</Routes>
			</HistoryRouter>
		);
	},
};

// ─── Bug stories (fail until the bug is fixed) ──────────────────────────────

export const Issue3500Item8FocusShowsVisibleRing: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3500-ITEM-8: Tab into the tablist. The only focus cue is MUI's pulsating 30% ripple (about 1.5:1), with no outline, and nothing at all in forced-colors mode. Expected: a static focus ring of at least 2px and 3:1.",
			},
		},
	},
	render: (args) => (
		<Host at="/settings">
			<SettingsTabs tabsProps={args} />
		</Host>
	),
	play: async ({ canvasElement }) => {
		const [general] = tabsOf(canvasElement);
		await userEvent.tab();
		await expect(general).toHaveFocus();
		await waitFor(() => expect(general).toHaveClass("Mui-focusVisible"));
		const cs = getComputedStyle(general);
		const ring =
			(cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) ||
			cs.boxShadow !== "none";
		await expect(
			ring,
			`outline ${cs.outlineStyle} ${cs.outlineWidth}, box-shadow ${cs.boxShadow}`,
		).toBe(true);
	},
};

/** `[r, g, b, alpha]` of a computed `rgb()` or `rgba()` color */
const rgba = (color: string) => {
	const [r, g, b, alpha = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
	return [r, g, b, alpha];
};

/** WCAG contrast ratio of two opaque colors, given as `[r, g, b]` */
const contrast = (a: number[], b: number[]) => {
	const luminance = (color: number[]) => {
		const [r, g, bl] = color.slice(0, 3).map((value) => {
			const c = value / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
	};
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
};

/** The color painted behind `el`: the first ancestor's opaque background */
const backgroundBehind = (el: HTMLElement) => {
	for (let node = el.parentElement; node; node = node.parentElement) {
		const color = rgba(getComputedStyle(node).backgroundColor);
		if (color[3] === 1) return color;
	}
	return [255, 255, 255, 1];
};

/** IMF's palette, and its Tabs defaults for tabs on the AppBar */
const imfTheme = createTheme({
	palette: { primary: { main: "#425159" }, secondary: { main: "#eb6a28" } },
	components: {
		MuiTabs: {
			defaultProps: { indicatorColor: "secondary", textColor: "inherit" },
		},
	},
});

const focusVisibleTheme = createTheme({ focusVisible: true });

/** A tab bar (no panels) with a button before it to Tab from */
const Bar = (props: {
	name: string;
	tabsProps?: Omit<Args, "aria-label">;
	appBar?: boolean;
	lastTabProps?: Partial<TabProps>;
}) => {
	const tabs = (
		<RoutedTabs {...props.tabsProps} aria-label={props.name}>
			<Tab label="General" value="" />
			<Tab label="Security" value="security" {...props.lastTabProps} />
		</RoutedTabs>
	);
	return (
		<Host at="/settings">
			<Box sx={{ p: 1, bgcolor: "background.paper" }}>
				<Button>Before {props.name}</Button>
				{props.appBar ? (
					<AppBar position="static" component="div">
						{tabs}
					</AppBar>
				) : (
					tabs
				)}
			</Box>
		</Host>
	);
};

/** Tabs from the button before the bar to its selected tab */
const tabInto = async (canvasElement: HTMLElement, name: string) => {
	const canvas = within(canvasElement);
	canvas.getByRole("button", { name: `Before ${name}` }).focus();
	await userEvent.tab();
	const tabs = tabsOf(canvasElement, name);
	await expect(tabs[0]).toHaveFocus();
	await waitFor(() => expect(tabs[0]).toHaveClass("Mui-focusVisible"));
	return tabs;
};

export const Issue3500Item8FocusRingContrast: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3500-ITEM-8: the focus ring of a keyboard-focused tab, selected or not, is a 2px outline (forced colors keep outlines, they drop tints and box shadows), drawn inside the tab so the scroller cannot clip it, and at least 3:1 against the bar: on the page with the primary color, and on an AppBar (MUI's default theme, and IMF's palette with `textColor=\"inherit\"`) in the tab's text color.",
			},
		},
	},
	render: () => (
		<>
			<Bar name="Page" />
			<Bar
				name="AppBar"
				appBar
				tabsProps={{ textColor: "inherit", indicatorColor: "secondary" }}
			/>
			<ThemeProvider theme={imfTheme}>
				<Bar name="IMF AppBar" appBar />
			</ThemeProvider>
		</>
	),
	play: async ({ canvasElement }) => {
		/** the ring of the focused tab: an outline inside the tab, 3:1 or more */
		const checkRing = async (tab: HTMLElement, label: string) => {
			const cs = getComputedStyle(tab);
			await expect(cs.outlineStyle, label).toBe("solid");
			const width = parseFloat(cs.outlineWidth);
			await expect(width, label).toBeGreaterThanOrEqual(2);
			await expect(parseFloat(cs.outlineOffset), label).toBeLessThanOrEqual(
				-width,
			);
			const behind = backgroundBehind(tab);
			const ring = rgba(cs.outlineColor);
			const alpha = ring[3] * parseFloat(cs.opacity);
			const seen = behind.map(
				(value, i) => alpha * ring[i] + (1 - alpha) * value,
			);
			await expect(
				contrast(seen, behind),
				`${label}: ${cs.outlineColor} at opacity ${cs.opacity} on rgb(${behind.slice(0, 3).join(", ")})`,
			).toBeGreaterThanOrEqual(3);
		};
		for (const name of ["Page", "AppBar", "IMF AppBar"]) {
			const [selected, other] = await tabInto(canvasElement, name);
			await checkRing(selected, `${name}, selected tab`);
			await userEvent.keyboard("{ArrowRight}");
			await waitFor(() => expect(other).toHaveClass("Mui-focusVisible"));
			await checkRing(other, `${name}, unselected tab`);
		}
	},
};

export const Issue3500Item8FocusDoesNotPulse: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3500-ITEM-8: keyboard focus shows the static ring only. MUI's pulsating focus ripple, which covered the label and lowered its contrast, is off, also with a theme that sets `focusVisible`. A Tab that sets `disableFocusRipple={false}` itself keeps the ripple.",
			},
		},
	},
	render: () => (
		<>
			<Bar name="Default" />
			<ThemeProvider theme={focusVisibleTheme}>
				<Bar name="focusVisible theme" />
			</ThemeProvider>
			<Bar name="Own ripple" lastTabProps={{ disableFocusRipple: false }} />
		</>
	),
	play: async ({ canvasElement }) => {
		/** the ripple is added by an effect after the focus-visible render */
		const frames = async () => {
			for (let frame = 0; frame < 3; ++frame) {
				await new Promise((resolve) => requestAnimationFrame(resolve));
			}
		};
		for (const name of ["Default", "focusVisible theme", "Own ripple"]) {
			const tabs = await tabInto(canvasElement, name);
			await frames();
			await expect(
				tabs[0].querySelector(".MuiTouchRipple-ripplePulsate"),
				`${name}, first tab`,
			).toBeNull();
			await userEvent.keyboard("{ArrowRight}");
			await waitFor(() => expect(tabs[1]).toHaveClass("Mui-focusVisible"));
			await frames();
			const pulse = tabs[1].querySelector(".MuiTouchRipple-ripplePulsate");
			if (name === "Own ripple") {
				await expect(pulse, `${name}, second tab`).not.toBeNull();
			} else {
				await expect(pulse, `${name}, second tab`).toBeNull();
			}
			tabs[1].blur();
		}
	},
};
