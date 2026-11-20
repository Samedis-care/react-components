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

/** IMF's user form: five tabs with German labels, wider than a phone */
const UserTabs = (props: { tabsProps: Args }) => {
	const tab = useRoutedTabPanel();
	const panel = (name: string) => (
		<Panel name={name} text={`Inhalt von ${name}.`} />
	);
	return (
		<Box sx={{ width: "100%" }}>
			<RoutedTabs {...props.tabsProps}>
				<Tab label="Hauptseite" value="" />
				<Tab label="Mandanten" value="tenants" />
				<Tab label="Akteure" value="actors" />
				<Tab label="Rollen" value="roles" />
				<Tab label="Berechtigungen" value="permissions" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("tenants", panel("Mandanten")),
					tab("actors", panel("Akteure")),
					tab("roles", panel("Rollen")),
					tab("permissions", panel("Berechtigungen")),
					tab("", panel("Hauptseite")),
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

/** A bar whose General panel has text only and whose Security panel has a button */
const TabStopTabs = () => {
	const tab = useRoutedTabPanel();
	return (
		<Box sx={{ width: "100%" }}>
			<RoutedTabs aria-label="Settings">
				<Tab label="General" value="" />
				<Tab label="Security" value="security" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab(
						"security",
						<Panel
							name="Security"
							text="Password and two-factor authentication."
						/>,
					),
					tab(
						"",
						<Typography sx={{ p: 2 }}>
							General settings and preferences.
						</Typography>,
					),
				]}
			</RoutedTabPanelWrapper>
			<Button sx={{ m: 2 }}>After the panels</Button>
		</Box>
	);
};

export const Issue3500Item6PanelTakesFocus: Story = {
	name: "Panel is a tab stop when it has no focusable content",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3500-ITEM-6: the content below the bar is a tabpanel named by its tab. A text-only panel is a tab stop, so Tab from the selected tab reaches the panel and the next Tab leaves it. A panel with a button is no tab stop, so Tab goes from the tab straight to that button.",
			},
		},
	},
	render: () => (
		<Host at="/settings">
			<TabStopTabs />
		</Host>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const [general, security] = tabsOf(canvasElement);
		const generalPanel = canvas.getByRole("tabpanel", { name: "General" });
		await expect(generalPanel).toHaveAttribute("tabindex", "0");

		general.focus();
		await userEvent.tab();
		await expect(generalPanel).toHaveFocus();
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: "After the panels" }),
		).toHaveFocus();

		await userEvent.click(security);
		const securityPanel = canvas.getByRole("tabpanel", { name: "Security" });
		await expect(securityPanel).not.toHaveAttribute("tabindex");
		await expect(security).toHaveFocus();
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: "Edit security" }),
		).toHaveFocus();
	},
};

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

/** The panels of a {@link Bar}: a Tab's `aria-controls` names one of them */
const BarPanels = () => {
	const tab = useRoutedTabPanel();
	return (
		<RoutedTabPanelWrapper>
			{[
				tab(
					"security",
					<Panel
						name="Security"
						text="Password and two-factor authentication."
					/>,
				),
				tab(
					"",
					<Panel name="General" text="General settings and preferences." />,
				),
			]}
		</RoutedTabPanelWrapper>
	);
};

/** A tab bar with its panels and a button before it to Tab from */
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
	// Each bar needs its own Route: two bars under one Route would give their
	// tabs and panels the same ids
	const route = `/${props.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
	return (
		<Host at={route} path={`${route}/*`}>
			<Box sx={{ p: 1, bgcolor: "background.paper" }}>
				<Button>Before {props.name}</Button>
				{props.appBar ? (
					<AppBar position="static" component="div">
						{tabs}
					</AppBar>
				) : (
					tabs
				)}
				<BarPanels />
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

export const Issue3500Item10AllTabsReachableOnPhone: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	args: { "aria-label": "Benutzer" },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3500-ITEM-10: IMF's user form (five German tabs, 609px) at 320px with the default variant. The scroller has `overflow-x: hidden`, so Rollen and Berechtigungen are off screen and touch users cannot reach them. Expected: every tab can be scrolled into view (e.g. `scrollable` by default).",
			},
		},
	},
	render: (args) => (
		<Host at="/users/1" path="/users/1/*">
			<UserTabs tabsProps={args} />
		</Host>
	),
	play: async ({ canvasElement }) => {
		const tabs = tabsOf(canvasElement, "Benutzer");
		await expect(tabs).toHaveLength(5);
		const scroller = canvasElement.querySelector<HTMLElement>(
			".MuiTabs-scroller",
		) as HTMLElement;
		const overflowX = getComputedStyle(scroller).overflowX;
		const overflows = scroller.scrollWidth > scroller.clientWidth;
		await expect(
			!overflows || overflowX === "auto" || overflowX === "scroll",
			`tabs ${scroller.scrollWidth}px in a ${scroller.clientWidth}px scroller with overflow-x ${overflowX}`,
		).toBe(true);
	},
};

/**
 * The bars of ISSUE-3500-ITEM-10, each under its own route and without
 * panels: IMF's user form (the default variant), IMF's former profile page
 * (`centered`) and SCF's facility form (`fullWidth`)
 */
const ITEM10_BARS: { name: string; props: Partial<Args>; labels: string[] }[] =
	[
		{
			name: "Benutzer",
			props: {},
			labels: [
				"Hauptseite",
				"Mandanten",
				"Akteure",
				"Rollen",
				"Berechtigungen",
			],
		},
		{
			name: "Profil",
			props: { centered: true },
			labels: ["Konto", "Apps", "Anmeldungen", "Aktivität"],
		},
		{
			name: "Einrichtung",
			props: { variant: "fullWidth" },
			labels: [
				"Einrichtung",
				"Kontakte",
				"Einstellungen",
				"Sync-Einstellungen",
				"Abonnement",
			],
		},
	];

const Item10Bars = () => (
	<>
		{ITEM10_BARS.map((bar) => {
			const route = `/${bar.name.toLowerCase()}`;
			return (
				<Host key={bar.name} at={route} path={`${route}/*`}>
					<RoutedTabs
						aria-label={bar.name}
						linkTabsToPanels={false}
						{...bar.props}
					>
						{bar.labels.map((label, index) => (
							<Tab
								key={label}
								label={label}
								value={index === 0 ? "" : label.toLowerCase()}
							/>
						))}
					</RoutedTabs>
				</Host>
			);
		})}
	</>
);

/** The parts of a bar of {@link Item10Bars} */
const item10Bar = (canvasElement: HTMLElement, name: string) => {
	const tabs = tabsOf(canvasElement, name);
	const root = tabs[0].closest(".MuiTabs-root") as HTMLElement;
	return {
		tabs,
		scroller: root.querySelector(".MuiTabs-scroller") as HTMLElement,
		scrollButtons: Array.from(
			root.querySelectorAll<HTMLElement>(".MuiTabs-scrollButtons"),
		),
	};
};

export const Issue3500Item10EveryTabComesIntoViewOnPhone: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3500-ITEM-10: three bars at 320px, none of which fits: the default variant, `centered` and `fullWidth`. Each one scrolls and shows its scroll buttons, its first tab starts inside the bar (a centered bar used to push it past the start edge), no label is cut off inside its tab (`fullWidth` used to squeeze the tabs to 90px), and the arrow keys bring every tab fully into view.",
			},
		},
	},
	render: () => <Item10Bars />,
	play: async ({ canvasElement }) => {
		for (const { name } of ITEM10_BARS) {
			const { tabs, scroller } = item10Bar(canvasElement, name);
			await expect(getComputedStyle(scroller).overflowX, name).toBe("auto");
			await expect(
				scroller.scrollWidth,
				`${name}: the tabs overflow the bar`,
			).toBeGreaterThan(scroller.clientWidth);
			await waitFor(async () => {
				const buttons = item10Bar(canvasElement, name).scrollButtons;
				await expect(buttons, `${name}: scroll buttons`).toHaveLength(2);
				await expect(getComputedStyle(buttons[1]).display).not.toBe("none");
			});
			const inBar = (tab: HTMLElement) => {
				const box = tab.getBoundingClientRect();
				const bar = scroller.getBoundingClientRect();
				return (
					box.left >= bar.left - 1 &&
					box.right <= bar.right + 1 &&
					bar.left >= 0 &&
					bar.right <= window.innerWidth
				);
			};
			await expect(inBar(tabs[0]), `${name}: first tab`).toBe(true);
			for (const tab of tabs) {
				await expect(
					tab.scrollWidth,
					`${name}: label of "${tab.textContent}" fits its tab`,
				).toBeLessThanOrEqual(tab.clientWidth);
			}
			tabs[0].focus();
			for (const tab of tabs.slice(1)) {
				await userEvent.keyboard("{ArrowRight}");
				await expect(tab).toHaveFocus();
				await waitFor(() =>
					expect(inBar(tab), `${name}: "${tab.textContent}" in view`).toBe(
						true,
					),
				);
			}
			tabs[tabs.length - 1].blur();
		}
	},
};

export const Issue3500Item10WideBarsLookAsBefore: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3500-ITEM-10: the same three bars at 1200px, where they fit, look as MUI draws them: no scroll buttons, the default bar's tabs at the start, the centered bar's tabs in the middle and the `fullWidth` bar's tabs sharing its width equally.",
			},
		},
	},
	render: () => <Item10Bars />,
	play: async ({ canvasElement }) => {
		const near = (a: number, b: number) => Math.abs(a - b) <= 1;
		for (const { name } of ITEM10_BARS) {
			const { tabs, scroller, scrollButtons } = item10Bar(canvasElement, name);
			await expect(scrollButtons, `${name}: scroll buttons`).toHaveLength(0);
			await expect(scroller.scrollWidth).toBe(scroller.clientWidth);
			const bar = scroller.getBoundingClientRect();
			const first = tabs[0].getBoundingClientRect();
			const last = tabs[tabs.length - 1].getBoundingClientRect();
			const before = first.left - bar.left;
			const after = bar.right - last.right;
			if (name === "Benutzer") {
				await expect(near(before, 0), `${name}: starts at ${before}`).toBe(
					true,
				);
				await expect(after, name).toBeGreaterThan(100);
			} else if (name === "Profil") {
				await expect(before, name).toBeGreaterThan(100);
				await expect(
					near(before, after),
					`${name}: ${before}px before, ${after}px after`,
				).toBe(true);
			} else {
				await expect(near(before, 0) && near(after, 0), name).toBe(true);
				const widths = tabs.map((tab) => tab.getBoundingClientRect().width);
				await expect(
					widths.every((width) => near(width, widths[0])),
					`${name}: ${widths.join(", ")}`,
				).toBe(true);
			}
		}
	},
};
