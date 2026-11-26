import React from "react";
import {
	describe,
	it,
	expect,
	beforeAll,
	afterAll,
	afterEach,
	beforeEach,
	vi,
} from "vitest";
import {
	render,
	act,
	cleanup,
	fireEvent,
	screen,
} from "@testing-library/react";
import * as Sentry from "@sentry/react";
import { createBrowserHistory, createMemoryHistory, History } from "history";
import {
	HistoryRouter,
	Link,
	Route,
	Routes,
} from "../../src/standalone/Routes";
import { componentsCareBrowserTracingIntegration } from "../../src/sentry";

afterEach(cleanup);

// keeps the pageload and navigation spans open for the whole file, they are ended in afterAll
const SPAN_TIMEOUTS = {
	idleTimeout: 600000,
	finalTimeout: 600000,
	childSpanTimeout: 600000,
};

const initSentry = (options: Partial<Sentry.BrowserOptions>) =>
	Sentry.init({
		dsn: "https://public@sentry.invalid/1",
		// nothing leaves the test
		transport: () => ({
			send: () => Promise.resolve({}),
			flush: () => Promise.resolve(true),
		}),
		defaultIntegrations: false,
		integrations: [componentsCareBrowserTracingIntegration(SPAN_TIMEOUTS)],
		tracesSampleRate: 1,
		...options,
	});

const closeSentry = async () => {
	Sentry.getActiveSpan()?.end();
	await Sentry.close(0);
};

const rootSpan = () => {
	const span = Sentry.getActiveSpan();
	if (!span) return undefined;
	const json = Sentry.spanToJSON(Sentry.getRootSpan(span));
	return {
		name: json.name,
		op: json.attributes["sentry.op"],
		origin: json.attributes["sentry.origin"],
		source: json.attributes["sentry.segment.name.source"],
		urlTemplate: json.attributes["url.template"],
	};
};

const activeRootSpanId = () => {
	const span = Sentry.getActiveSpan();
	return span && Sentry.spanToJSON(Sentry.getRootSpan(span)).span_id;
};

const transactionName = () =>
	Sentry.getCurrentScope().getScopeData().transactionName;

/** a wizard on a memory history of its own, as a page may render one */
const wizard = (wizardHistory: History) => (
	<HistoryRouter history={wizardHistory}>
		<Routes>
			<Route path={"/step1"} element={<div>step 1</div>} />
			<Route path={"/step2"} element={<div>step 2</div>} />
		</Routes>
	</HistoryRouter>
);

/** the app of renderApp with the wizard rendered on the device page */
const appWithWizard = (history: History, wizardHistory: History | null) => (
	<HistoryRouter history={history}>
		<Routes>
			<Route
				path={"/tenant/:tenantId/*"}
				element={
					<Routes>
						<Route
							path={"devices/:deviceId"}
							element={wizardHistory ? wizard(wizardHistory) : <div />}
						/>
					</Routes>
				}
			/>
		</Routes>
	</HistoryRouter>
);

const renderApp = (history: History) =>
	render(
		<HistoryRouter history={history}>
			<Routes>
				<Route
					path={"/tenant/:tenantId/*"}
					element={
						<Routes>
							<Route path={"devices/:deviceId"} element={<div />} />
							<Route path={"settings"} element={<div />} />
						</Routes>
					}
				/>
				<Route path={"/about"} element={<div />} />
			</Routes>
		</HistoryRouter>,
	);

describe("componentsCareBrowserTracingIntegration (span streaming)", () => {
	let history: History;

	beforeAll(() => {
		window.history.replaceState(null, "", "/tenant/1/devices/2");
		initSentry({});
		history = createBrowserHistory();
	});

	afterAll(closeSentry);

	it("names the pageload span after the deepest matched route", () => {
		renderApp(history);
		expect(rootSpan()).toEqual({
			name: "/tenant/:tenantId/devices/:deviceId",
			op: "pageload",
			origin: "auto.pageload.react.components_care",
			source: "route",
			urlTemplate: "/tenant/:tenantId/devices/:deviceId",
		});
	});

	it("names a navigation span after the route it lands on", () => {
		renderApp(history);
		act(() => history.push("/tenant/1/settings"));
		expect(rootSpan()).toEqual({
			name: "/tenant/:tenantId/settings",
			op: "navigation",
			origin: "auto.navigation.react.components_care",
			source: "route",
			urlTemplate: "/tenant/:tenantId/settings",
		});
	});

	it("names the transaction of the scope after the deepest matched route", () => {
		renderApp(history);
		act(() => history.push("/tenant/1/devices/6"));
		expect(Sentry.getCurrentScope().getScopeData().transactionName).toBe(
			"/tenant/:tenantId/devices/:deviceId",
		);
	});

	it("names a navigation span that only changes the query", () => {
		renderApp(history);
		act(() => history.push("/tenant/1/settings"));
		act(() => history.push("/tenant/1/settings?tab=2"));
		expect(rootSpan()).toMatchObject({
			name: "/tenant/:tenantId/settings",
			op: "navigation",
			source: "route",
		});
	});

	it("names a navigation span that stays on the same route", () => {
		renderApp(history);
		act(() => history.push("/tenant/1/devices/3"));
		act(() => history.push("/tenant/1/devices/4"));
		expect(rootSpan()).toMatchObject({
			name: "/tenant/:tenantId/devices/:deviceId",
			op: "navigation",
			source: "route",
		});
	});

	it("names a navigation span the outer route keeps after the inner one unmounts", () => {
		renderApp(history);
		act(() => history.push("/tenant/1/devices/5"));
		act(() => history.push("/tenant/1/"));
		expect(rootSpan()).toMatchObject({
			name: "/tenant/:tenantId/*",
			op: "navigation",
			source: "route",
		});
	});

	it("keeps the low-cardinality fallback name when no route matches", () => {
		renderApp(history);
		act(() => history.push("/nowhere/1"));
		expect(rootSpan()).toEqual({
			name: "Navigation",
			op: "navigation",
			origin: "auto.navigation.react.components_care",
			source: "url",
			urlTemplate: undefined,
		});
	});

	it("[ISSUE-3475-ITEM-19] starts no navigation span for a click on a Link to the current location", () => {
		// useNavigate resets the scroll position; jsdom does not implement scrollTo
		const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
		const rootSpanId = () => {
			const span = Sentry.getActiveSpan();
			return span && Sentry.spanToJSON(Sentry.getRootSpan(span)).span_id;
		};
		render(
			<HistoryRouter history={history}>
				<Link to="/tenant/1/settings">settings</Link>
			</HistoryRouter>,
		);
		act(() => history.push("/tenant/1/settings"));
		const navigationSpan = rootSpanId();
		expect(navigationSpan).toBeDefined();
		fireEvent.click(screen.getByRole("link", { name: "settings" }));
		expect(history.location.pathname).toBe("/tenant/1/settings");
		expect(rootSpanId()).toBe(navigationSpan);
		scrollTo.mockRestore();
	});

	describe("a HistoryRouter inside a Route of another one", () => {
		beforeEach(() => {
			// a push resets the scroll position; jsdom does not implement scrollTo
			vi.spyOn(window, "scrollTo").mockImplementation(() => {});
		});
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("[ISSUE-3475-ITEM-31] starts no navigation span and keeps the transaction name when it navigates", () => {
			const wizardHistory = createMemoryHistory({ initialEntries: ["/step1"] });
			render(appWithWizard(history, wizardHistory));
			act(() => history.push("/tenant/1/devices/7"));
			expect(screen.getByText("step 1")).toBeInTheDocument();
			const pageSpanId = activeRootSpanId();
			const pageSpan = rootSpan();
			expect(pageSpan).toMatchObject({
				name: "/tenant/:tenantId/devices/:deviceId",
				op: "navigation",
				source: "route",
			});
			act(() => wizardHistory.push("/step2"));
			expect(screen.getByText("step 2")).toBeInTheDocument();
			expect(activeRootSpanId()).toBe(pageSpanId);
			expect(rootSpan()).toEqual(pageSpan);
			expect(transactionName()).toBe("/tenant/:tenantId/devices/:deviceId");
			act(() => wizardHistory.back());
			expect(screen.getByText("step 1")).toBeInTheDocument();
			expect(activeRootSpanId()).toBe(pageSpanId);
			expect(transactionName()).toBe("/tenant/:tenantId/devices/:deviceId");
		});

		it("[ISSUE-3475-ITEM-31] its routes keep the transaction name when it mounts after the page", () => {
			const { rerender } = render(appWithWizard(history, null));
			act(() => history.push("/tenant/1/devices/8"));
			expect(transactionName()).toBe("/tenant/:tenantId/devices/:deviceId");
			// the page opens its wizard, e.g. on a click
			rerender(
				appWithWizard(
					history,
					createMemoryHistory({ initialEntries: ["/step1"] }),
				),
			);
			expect(screen.getByText("step 1")).toBeInTheDocument();
			expect(transactionName()).toBe("/tenant/:tenantId/devices/:deviceId");
			expect(rootSpan()).toMatchObject({
				name: "/tenant/:tenantId/devices/:deviceId",
				source: "route",
			});
		});

		it("[ISSUE-3475-ITEM-31] leaves the outer one naming its navigations after its routes", () => {
			render(
				appWithWizard(
					history,
					createMemoryHistory({ initialEntries: ["/step1"] }),
				),
			);
			act(() => history.push("/tenant/1/devices/9"));
			const pageSpanId = activeRootSpanId();
			act(() => history.push("/tenant/1/devices/10"));
			expect(activeRootSpanId()).not.toBe(pageSpanId);
			expect(rootSpan()).toMatchObject({
				name: "/tenant/:tenantId/devices/:deviceId",
				op: "navigation",
				source: "route",
			});
			expect(transactionName()).toBe("/tenant/:tenantId/devices/:deviceId");
		});
	});
});

describe("componentsCareBrowserTracingIntegration (transaction mode)", () => {
	let history: History;

	beforeAll(() => {
		window.history.replaceState(null, "", "/nowhere/2");
		initSentry({ traceLifecycle: "static" });
		history = createBrowserHistory();
	});

	afterAll(closeSentry);

	it("names spans without a matching route after the URL", () => {
		renderApp(history);
		expect(rootSpan()).toMatchObject({
			name: "/nowhere/2",
			op: "pageload",
			source: "url",
		});
		act(() => history.push("/nowhere/3"));
		expect(rootSpan()).toMatchObject({
			name: "/nowhere/3",
			op: "navigation",
			source: "url",
		});
	});

	it("names spans after the matched route", () => {
		renderApp(history);
		act(() => history.push("/tenant/1/settings"));
		expect(rootSpan()).toMatchObject({
			name: "/tenant/:tenantId/settings",
			op: "navigation",
			source: "route",
		});
	});
});
