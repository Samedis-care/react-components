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
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Tab } from "@mui/material";
import { createMemoryHistory, History, InitialEntry } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import {
	RoutedTabPanelWrapper,
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
});
