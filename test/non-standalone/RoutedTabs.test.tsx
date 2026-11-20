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
} from "@testing-library/react";
import { Tab } from "@mui/material";
import { createMemoryHistory, History, InitialEntry } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import {
	RoutedTabPanelWrapper,
	RoutedTabPanelWrapperProps,
	RoutedTabs,
	RoutedTabsProps,
	useRoutedTabPanel,
} from "../../src/non-standalone/RoutedTabs";

let errSpy: MockInstance<typeof console.error>;

beforeEach(() => {
	// useNavigate scrolls the window to the top on every tab click; jsdom does not implement it
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

	it("[ISSUE-3500-ITEM-6] the current panel is a tabpanel named and controlled by its tab, and takes focus when it has no focusable content", () => {
		renderAt(mem("/settings/security"));
		const panel = screen.getByRole("tabpanel", { name: "Security" });
		expect(panel).toHaveTextContent("SECURITY PANEL");
		expect(panel.id).not.toBe("");
		expect(tabEl("Security")).toHaveAttribute("aria-controls", panel.id);
		expect(panel).toHaveAttribute("tabindex", "0");
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
});
