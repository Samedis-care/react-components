import React from "react";
import {
	describe,
	it,
	expect,
	vi,
	afterEach,
	beforeEach,
	type MockInstance,
} from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createTheme, Tab, ThemeProvider } from "@mui/material";
import { createMemoryHistory, History, InitialEntry } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import {
	getTabId,
	getTabPanelId,
	RoutedTabPanelWrapper,
	RoutedTabPanelWrapperProps,
	RoutedTabs,
	RoutedTabsProps,
	useRoutedTabPanel,
} from "../../src/non-standalone/RoutedTabs";

let errSpy: MockInstance<typeof console.error>;

beforeEach(() => {
	// a navigation scrolls the window to the top; jsdom does not implement it
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
	errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const mem = (...entries: InitialEntry[]) =>
	createMemoryHistory({ initialEntries: entries });

interface DemoProps {
	tabsProps?: Partial<RoutedTabsProps>;
	mainPanel?: React.ReactElement;
	securityPanel?: React.ReactElement;
}

/**
 * The consumer shape (SCF and IMF forms): the default tab ("") first in the
 * bar and its panel last in the wrapper.
 */
const Demo = (props: DemoProps) => {
	const tab = useRoutedTabPanel();
	return (
		<>
			<RoutedTabs aria-label="Settings" {...props.tabsProps}>
				<Tab label="Main" value="" />
				<Tab label="Security" value="security" />
				<Tab label="Notifications" value="notifications" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("security", props.securityPanel ?? <div>SECURITY PANEL</div>),
					tab("notifications", <div>NOTIF PANEL</div>),
					tab("", props.mainPanel ?? <div>MAIN PANEL</div>),
				]}
			</RoutedTabPanelWrapper>
		</>
	);
};

const routed = (
	history: History,
	element: React.ReactElement,
	routePath = "/settings/*",
) => (
	<HistoryRouter history={history}>
		<Routes>{[<Route key="page" path={routePath} element={element} />]}</Routes>
	</HistoryRouter>
);

const renderAt = (
	history: History,
	element: React.ReactElement = <Demo />,
	routePath = "/settings/*",
) => render(routed(history, element, routePath));

/** The labels of the tabs with aria-selected="true" */
const selected = () =>
	screen
		.getAllByRole("tab")
		.filter((t) => t.getAttribute("aria-selected") === "true")
		.map((t) => t.textContent);
const tabEl = (name: string) => screen.getByRole("tab", { name });
/** The console.error messages MUI logged (e.g. an invalid Tabs value) */
const muiErrors = () =>
	errSpy.mock.calls
		.map((call) => String(call[0]))
		.filter((message) => message.includes("MUI:"));

describe("RoutedTabs: bugs", () => {
	it("[ISSUE-3500-ITEM-2] a segment that no tab has selects the default tab, whose panel is shown, without a MUI error", () => {
		renderAt(mem("/settings/unknown"));
		expect(screen.getByText("MAIN PANEL")).toBeInTheDocument();
		expect(muiErrors()).toEqual([]);
		expect(selected()).toEqual(["Main"]);
	});

	it("[ISSUE-3500-ITEM-2] without a default tab, the route's own url logs no MUI error", () => {
		const NoDefault = () => {
			const tab = useRoutedTabPanel();
			return (
				<>
					<RoutedTabs aria-label="Settings">
						<Tab label="General" value="general" />
						<Tab label="Security" value="security" />
					</RoutedTabs>
					<RoutedTabPanelWrapper>
						{[
							tab("general", <div>GENERAL PANEL</div>),
							tab("security", <div>SECURITY PANEL</div>),
						]}
					</RoutedTabPanelWrapper>
				</>
			);
		};
		renderAt(mem("/settings"), <NoDefault />);
		expect(
			screen.getByRole("tablist", { name: "Settings" }),
		).toBeInTheDocument();
		expect(muiErrors()).toEqual([]);
	});

	it("[ISSUE-3500-ITEM-2] without a default tab, a segment that no tab has selects no tab, the first tab keeps the tab stop and a click still opens a tab", () => {
		const NoDefault = () => {
			const tab = useRoutedTabPanel();
			return (
				<>
					<RoutedTabs aria-label="Settings">
						<Tab label="General" value="general" />
						<Tab label="Security" value="security" />
					</RoutedTabs>
					<RoutedTabPanelWrapper>
						{[
							tab("general", <div>GENERAL PANEL</div>),
							tab("security", <div>SECURITY PANEL</div>),
						]}
					</RoutedTabPanelWrapper>
				</>
			);
		};
		const h = mem("/settings/unknown");
		renderAt(h, <NoDefault />);
		expect(selected()).toEqual([]);
		expect(
			screen.getAllByRole("tab").map((t) => t.getAttribute("tabindex")),
		).toEqual(["0", "-1"]);
		expect(muiErrors()).toEqual([]);
		fireEvent.click(tabEl("Security"));
		expect(h.location.pathname).toBe("/settings/security");
		expect(selected()).toEqual(["Security"]);
		expect(screen.getByText("SECURITY PANEL")).toBeInTheDocument();
	});

	it("[ISSUE-3500-ITEM-2] a path inside the default panel selects the default tab, and a click on another tab opens it", () => {
		const h = mem("/settings/records/5");
		renderAt(h);
		expect(selected()).toEqual(["Main"]);
		expect(screen.getByText("MAIN PANEL")).toBeInTheDocument();
		fireEvent.click(tabEl("Security"));
		expect(h.location.pathname).toBe("/settings/security");
		expect(selected()).toEqual(["Security"]);
		expect(muiErrors()).toEqual([]);
	});

	it("[ISSUE-3500-ITEM-2] a tab removed while current selects the default tab, without a MUI error", () => {
		const Dyn = (props: { billing: boolean }) => {
			const tab = useRoutedTabPanel();
			return (
				<>
					<RoutedTabs aria-label="Contract">
						<Tab label="Main" value="" />
						{props.billing && <Tab label="Billing" value="billing" />}
					</RoutedTabs>
					<RoutedTabPanelWrapper>
						{[
							...(props.billing ? [tab("billing", <div>BILLING</div>)] : []),
							tab("", <div>MAIN PANEL</div>),
						]}
					</RoutedTabPanelWrapper>
				</>
			);
		};
		const h = mem("/settings/billing");
		const { rerender } = renderAt(h, <Dyn billing />);
		expect(selected()).toEqual(["Billing"]);
		rerender(routed(h, <Dyn billing={false} />));
		expect(selected()).toEqual(["Main"]);
		expect(screen.getByText("MAIN PANEL")).toBeInTheDocument();
		expect(muiErrors()).toEqual([]);
	});

	it("[ISSUE-3500-ITEM-14] the panel wrapper renders a single tab entry", () => {
		const Single = () => {
			const tab = useRoutedTabPanel();
			// typed as an array today (TS2745 for one child); the cast keeps this compiling after the fix
			const only = tab(
				"",
				<div>ONLY PANEL</div>,
			) as unknown as RoutedTabPanelWrapperProps["children"];
			return <RoutedTabPanelWrapper>{only}</RoutedTabPanelWrapper>;
		};
		renderAt(mem("/settings"), <Single />);
		expect(screen.getByText("ONLY PANEL")).toBeInTheDocument();
	});

	it("[ISSUE-3500-ITEM-14] the panel wrapper skips a false entry of a conditional tab", () => {
		const Conditional = (props: { admin: boolean }) => {
			const tab = useRoutedTabPanel();
			// `cond && tab(…)` is TS2322 today; the cast keeps this compiling after the fix
			const entries = [
				props.admin && tab("sync", <div>SYNC PANEL</div>),
				tab("", <div>MAIN PANEL</div>),
			] as unknown as RoutedTabPanelWrapperProps["children"];
			return <RoutedTabPanelWrapper>{entries}</RoutedTabPanelWrapper>;
		};
		renderAt(mem("/settings"), <Conditional admin={false} />);
		expect(screen.getByText("MAIN PANEL")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-16] the panel wrapper shows a tab's panel also when the default tab's entry is listed first", () => {
		const DefaultFirst = () => {
			const tab = useRoutedTabPanel();
			return (
				<>
					<RoutedTabs aria-label="Settings">
						<Tab label="Main" value="" />
						<Tab label="Security" value="security" />
					</RoutedTabs>
					<RoutedTabPanelWrapper>
						{[
							tab("", <div>MAIN PANEL</div>),
							tab("security", <div>SECURITY PANEL</div>),
						]}
					</RoutedTabPanelWrapper>
				</>
			);
		};
		renderAt(mem("/settings/security"), <DefaultFirst />);
		const panel = screen.getByRole("tabpanel", { name: "Security" });
		expect(panel).toHaveTextContent("SECURITY PANEL");
		expect(screen.queryByText("MAIN PANEL")).toBeNull();
	});

	it("[ISSUE-3500-ITEM-6] the current panel is a tabpanel named and controlled by its tab, and takes focus when it has no focusable content", () => {
		renderAt(mem("/settings/security"));
		const panel = screen.getByRole("tabpanel", { name: "Security" });
		expect(panel).toHaveTextContent("SECURITY PANEL");
		expect(panel.id).not.toBe("");
		expect(tabEl("Security")).toHaveAttribute("aria-controls", panel.id);
		expect(panel).toHaveAttribute("tabindex", "0");
	});

	it("[FOLLOWUP-ROUTED-TABS-ROOT-IDS] under a Route at /*, every tab and its panel reference each other", () => {
		renderAt(mem("/security"), <Demo />, "/*");
		const panel = screen.getByRole("tabpanel", { name: "Security" });
		expect(tabEl("Security")).toHaveAttribute("aria-controls", panel.id);
		expect(panel).toHaveAttribute("aria-labelledby", tabEl("Security").id);
		// the exported helpers give the same ids for the url "/" and without it
		expect(getTabPanelId("/", "security")).toBe(panel.id);
		expect(getTabId("/", "security")).toBe(tabEl("Security").id);
		expect(getTabPanelId("/settings/", "a")).toBe(
			getTabPanelId("/settings", "a"),
		);
	});

	it("[ISSUE-3500-ITEM-6] the tabpanel is labelled by its tab, and every tab names and controls its own panel", () => {
		renderAt(mem("/settings/security"));
		const panel = screen.getByRole("tabpanel", { name: "Security" });
		const tabs = screen.getAllByRole("tab");
		expect(panel).toHaveAttribute("aria-labelledby", tabEl("Security").id);
		// every Tab is identifiable and points at its panel, also the one not shown
		for (const tab of tabs) expect(tab.id).not.toBe("");
		expect(new Set(tabs.map((tab) => tab.id)).size).toBe(tabs.length);
		const controls = tabs.map((tab) => tab.getAttribute("aria-controls"));
		expect(controls.every((id) => !!id)).toBe(true);
		expect(new Set(controls).size).toBe(tabs.length);
		expect(tabEl("Security")).toHaveAttribute("aria-controls", panel.id);
	});

	it("[ISSUE-3500-ITEM-6] the default panel is a tabpanel named by the default tab, and the wiring follows the tab that opens", () => {
		const h = mem("/settings");
		renderAt(h);
		const main = screen.getByRole("tabpanel", { name: "Main" });
		expect(main).toHaveTextContent("MAIN PANEL");
		expect(tabEl("Main")).toHaveAttribute("aria-controls", main.id);
		const mainId = main.id;
		fireEvent.click(tabEl("Security"));
		const security = screen.getByRole("tabpanel", { name: "Security" });
		expect(security.id).not.toBe(mainId);
		expect(tabEl("Security")).toHaveAttribute("aria-controls", security.id);
		expect(tabEl("Security").id).not.toBe(tabEl("Main").id);
	});

	it("[ISSUE-3500-ITEM-6] a panel with focusable content is no tab stop, so Tab reaches its first control", () => {
		renderAt(
			mem("/settings/security"),
			<Demo securityPanel={<button type="button">Edit security</button>} />,
		);
		const panel = screen.getByRole("tabpanel", { name: "Security" });
		expect(panel).not.toHaveAttribute("tabindex");
		expect(panel).toContainElement(
			screen.getByRole("button", { name: "Edit security" }),
		);
	});

	it("[ISSUE-3500-ITEM-6] nested bar: each panel is named and controlled by the tab of its own bar", () => {
		const Inner = () => {
			const tab = useRoutedTabPanel();
			return (
				<>
					<RoutedTabs aria-label="Security">
						<Tab label="Password" value="" />
						<Tab label="2FA" value="2fa" />
					</RoutedTabs>
					<RoutedTabPanelWrapper>
						{[tab("2fa", <div>2FA PANEL</div>), tab("", <div>PW PANEL</div>)]}
					</RoutedTabPanelWrapper>
				</>
			);
		};
		renderAt(mem("/settings/security/2fa"), <Demo securityPanel={<Inner />} />);
		const outer = screen.getByRole("tabpanel", { name: "Security" });
		const inner = screen.getByRole("tabpanel", { name: "2FA" });
		expect(outer).toContainElement(inner);
		expect(outer.id).not.toBe(inner.id);
		expect(tabEl("Security")).toHaveAttribute("aria-controls", outer.id);
		expect(tabEl("2FA")).toHaveAttribute("aria-controls", inner.id);
	});

	it("[ISSUE-3500-ITEM-6] a panel that gains or loses its control after mount follows it in the tab order", async () => {
		let setControl: (value: boolean) => void = () => undefined;
		const Content = () => {
			const [control, set] = React.useState(false);
			setControl = set;
			return control ? (
				<button type="button">Edit</button>
			) : (
				<div>TEXT ONLY</div>
			);
		};
		const OnlyPanel = () => {
			const tab = useRoutedTabPanel();
			return (
				<RoutedTabPanelWrapper>{[tab("", <Content />)]}</RoutedTabPanelWrapper>
			);
		};
		renderAt(mem("/settings"), <OnlyPanel />);
		const panel = screen.getByRole("tabpanel");
		expect(panel).toHaveAttribute("tabindex", "0");

		// the content changes by itself: the wrapper does not re-render
		act(() => setControl(true));
		await waitFor(() => expect(panel).not.toHaveAttribute("tabindex"));

		act(() => setControl(false));
		await waitFor(() => expect(panel).toHaveAttribute("tabindex", "0"));
	});

	it("[ISSUE-3500-ITEM-6] a focused panel keeps its tab stop until it loses focus", async () => {
		let setControl: (value: boolean) => void = () => undefined;
		const Content = () => {
			const [control, set] = React.useState(false);
			setControl = set;
			return control ? (
				<button type="button">Edit</button>
			) : (
				<div>TEXT ONLY</div>
			);
		};
		const OnlyPanel = () => {
			const tab = useRoutedTabPanel();
			return (
				<RoutedTabPanelWrapper>{[tab("", <Content />)]}</RoutedTabPanelWrapper>
			);
		};
		renderAt(mem("/settings"), <OnlyPanel />);
		const panel = screen.getByRole("tabpanel");
		panel.focus();
		expect(panel).toHaveFocus();

		act(() => setControl(true));
		await screen.findByRole("button", { name: "Edit" });
		await act(async () => {
			await Promise.resolve();
		});
		// dropping the tab stop now would drop focus to the body
		expect(panel).toHaveAttribute("tabindex", "0");

		panel.blur();
		await waitFor(() => expect(panel).not.toHaveAttribute("tabindex"));
	});

	it("[ISSUE-3500-ITEM-6] controls Tab does not reach do not take the panel out of the tab order", () => {
		const OnlyPanel = () => {
			const tab = useRoutedTabPanel();
			return (
				<RoutedTabPanelWrapper>
					{[
						tab(
							"",
							<>
								<button type="button" tabIndex={-1}>
									Skipped
								</button>
								<button type="button" tabIndex={-2}>
									Skipped too
								</button>
								<div hidden>
									<button type="button">Hidden</button>
								</div>
								<div inert>
									<input />
								</div>
								<fieldset disabled>
									<input />
								</fieldset>
							</>,
						),
					]}
				</RoutedTabPanelWrapper>
			);
		};
		renderAt(mem("/settings"), <OnlyPanel />);
		expect(screen.getByRole("tabpanel")).toHaveAttribute("tabindex", "0");
	});

	it("[ISSUE-3500-ITEM-6] the panel is a CcRoutedTabPanelWrapper root that takes a className and the theme's styles", () => {
		const theme = createTheme({
			components: {
				CcRoutedTabPanelWrapper: {
					styleOverrides: { root: { display: "flex" } },
				},
			},
		});
		const Styled = () => {
			const tab = useRoutedTabPanel();
			return (
				<RoutedTabPanelWrapper className="panel-extra">
					{[tab("", <div>MAIN PANEL</div>)]}
				</RoutedTabPanelWrapper>
			);
		};
		render(
			<ThemeProvider theme={theme}>
				{routed(mem("/settings"), <Styled />)}
			</ThemeProvider>,
		);
		const panel = screen.getByRole("tabpanel");
		expect(panel.className).toContain("CcRoutedTabPanelWrapper-root");
		expect(panel).toHaveClass("panel-extra");
		expect(panel).toHaveStyle({ display: "flex" });
	});

	it("[ISSUE-3500-ITEM-6] linkTabsToPanels={false} leaves the tabs without an id or aria-controls", () => {
		const Navigation = () => (
			<RoutedTabs aria-label="Navigation" linkTabsToPanels={false}>
				<Tab label="Main" value="" />
				<Tab label="Security" value="security" />
			</RoutedTabs>
		);
		renderAt(mem("/settings"), <Navigation />);
		for (const tab of screen.getAllByRole("tab")) {
			expect(tab).not.toHaveAttribute("id");
			expect(tab).not.toHaveAttribute("aria-controls");
		}
	});

	it("[ISSUE-3500-ITEM-6] the ids encode the url and the value so that different pairs never collide", () => {
		// an outer tab "security-2fa" and a nested "2fa" under "security" used to share an id
		expect(getTabPanelId("/settings", "security-2fa")).not.toBe(
			getTabPanelId("/settings/security", "2fa"),
		);
		expect(getTabId("/a-b", "")).not.toBe(getTabId("/a/b", ""));
		expect(getTabId("/settings", "über")).not.toBe(
			getTabId("/settings", "uber"),
		);
	});

	it("[ISSUE-3500-ITEM-14] the panel wrapper takes conditional entries as separate JSX children, and tab takes any element", () => {
		const Sync = (props: { interval: number }) => (
			<div>SYNC PANEL {props.interval}</div>
		);
		const Conditional = (props: { admin: boolean }) => {
			const tab = useRoutedTabPanel();
			return (
				<RoutedTabPanelWrapper>
					{props.admin &&
						tab("sync", React.createElement(Sync, { interval: 5 }))}
					{props.admin ? tab("audit", <div>AUDIT PANEL</div>) : null}
					{tab("", <div>MAIN PANEL</div>)}
				</RoutedTabPanelWrapper>
			);
		};
		const h = mem("/settings/sync");
		const { rerender } = renderAt(h, <Conditional admin />);
		expect(screen.getByText("SYNC PANEL 5")).toBeInTheDocument();
		act(() => h.push("/settings/audit"));
		expect(screen.getByText("AUDIT PANEL")).toBeInTheDocument();
		rerender(routed(h, <Conditional admin={false} />));
		expect(screen.getByText("MAIN PANEL")).toBeInTheDocument();
		expect(screen.queryByText("AUDIT PANEL")).toBeNull();
	});

	/** The Tabs root of the bar */
	const tabsRoot = () => document.querySelector(".MuiTabs-root") as HTMLElement;

	it("[ISSUE-3500-ITEM-10] the bar scrolls by default instead of cutting off the tabs that do not fit", () => {
		renderAt(mem("/settings"));
		const scroller = document.querySelector(".MuiTabs-scroller");
		expect(scroller).toHaveClass("MuiTabs-scrollableX");
		expect(scroller).not.toHaveClass("MuiTabs-fixed");
	});

	it("[ISSUE-3500-ITEM-10] centered works with the scrolling default and logs no MUI error", () => {
		renderAt(mem("/settings"), <Demo tabsProps={{ centered: true }} />);
		const root = tabsRoot();
		expect(root).toHaveClass("CcRoutedTabs-centered");
		expect(root.querySelector(".MuiTabs-scroller")).toHaveClass(
			"MuiTabs-scrollableX",
		);
		expect(muiErrors()).toEqual([]);
	});

	it("[ISSUE-3500-ITEM-10] fullWidth is a scrolling bar whose tabs grow; a vertical one stays MUI's", () => {
		renderAt(mem("/settings"), <Demo tabsProps={{ variant: "fullWidth" }} />);
		let root = tabsRoot();
		expect(root).toHaveClass("CcRoutedTabs-fullWidth");
		expect(root.querySelector(".MuiTabs-scroller")).toHaveClass(
			"MuiTabs-scrollableX",
		);
		cleanup();
		renderAt(
			mem("/settings"),
			<Demo tabsProps={{ variant: "fullWidth", orientation: "vertical" }} />,
		);
		root = tabsRoot();
		expect(root).not.toHaveClass("CcRoutedTabs-fullWidth");
		expect(root.querySelector(".MuiTabs-scroller")).toHaveClass(
			"MuiTabs-fixed",
		);
		expect(tabEl("Main")).toHaveClass("MuiTab-fullWidth");
	});

	it("[ISSUE-3500-ITEM-10] the theme sets the defaults under CcRoutedTabs, and a prop overrides them", () => {
		const theme = createTheme({
			components: {
				CcRoutedTabs: {
					defaultProps: { variant: "fullWidth", centered: true },
				},
			},
		});
		const root = tabsRoot;
		render(
			<ThemeProvider theme={theme}>
				{routed(mem("/settings"), <Demo />)}
			</ThemeProvider>,
		);
		expect(root()).toHaveClass("CcRoutedTabs-fullWidth");
		expect(root()).toHaveClass("CcRoutedTabs-centered");
		cleanup();
		render(
			<ThemeProvider theme={theme}>
				{routed(
					mem("/settings"),
					<Demo tabsProps={{ variant: "standard", centered: false }} />,
				)}
			</ThemeProvider>,
		);
		expect(root()).not.toHaveClass("CcRoutedTabs-fullWidth");
		expect(root()).not.toHaveClass("CcRoutedTabs-centered");
		expect(root().querySelector(".MuiTabs-scroller")).toHaveClass(
			"MuiTabs-fixed",
		);
	});

	it("[ISSUE-3500-ITEM-10] a focused tab is scrolled fully into view, and the bar's onFocus still runs", () => {
		// jsdom has no scrollIntoView
		const scrollIntoView = vi.fn();
		Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
			value: scrollIntoView,
			configurable: true,
		});
		try {
			const onFocus = vi.fn();
			renderAt(mem("/settings"), <Demo tabsProps={{ onFocus }} />);
			act(() => tabEl("Security").focus());
			expect(scrollIntoView).toHaveBeenCalledTimes(1);
			expect(scrollIntoView).toHaveBeenCalledWith({
				block: "nearest",
				inline: "nearest",
			});
			expect(scrollIntoView.mock.contexts[0]).toBe(tabEl("Security"));
			expect(onFocus).toHaveBeenCalledTimes(1);
		} finally {
			delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
		}
	});
});

describe("RoutedTabs: scroll position", () => {
	it.each([
		["a click", false],
		["an arrow key with selectionFollowsFocus", true],
	])(
		"[ISSUE-3475-ITEM-20] opening a tab with %s keeps the page where it is",
		(_how, selectionFollowsFocus) => {
			const history = mem("/settings");
			renderAt(history, <Demo tabsProps={{ selectionFollowsFocus }} />);
			const scrollTo = vi
				.spyOn(window, "scrollTo")
				.mockImplementation(() => undefined);
			document.documentElement.scrollTop = 300;
			try {
				if (selectionFollowsFocus) {
					act(() => tabEl("Main").focus());
					fireEvent.keyDown(tabEl("Main"), { key: "ArrowRight" });
				} else {
					fireEvent.click(tabEl("Security"));
				}
				expect(history.location.pathname).toBe("/settings/security");
				expect(selected()).toEqual(["Security"]);
				expect(scrollTo).not.toHaveBeenCalled();
				expect(document.documentElement.scrollTop).toBe(300);
			} finally {
				document.documentElement.scrollTop = 0;
			}
		},
	);
});
