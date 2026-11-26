import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React, { useContext, useEffect, useState } from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { createBrowserHistory, createMemoryHistory } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route, {
	RouteContext,
	useRouteInfo,
	useRoutePrefix,
} from "../../src/standalone/Routes/Route";
import useLocation from "../../src/standalone/Routes/useLocation";
import useParams from "../../src/standalone/Routes/useParams";

// Which child Routes renders, what RouteContext and useParams report, and how
// nested Routes resolve their paths. Navigation itself is covered in
// RoutesNavigation.test.tsx, Link in RoutesLink.test.tsx.

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});
beforeEach(() => {
	// useNavigate resets the scroll position; jsdom does not implement scrollTo
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

const mem = (path: string) => createMemoryHistory({ initialEntries: [path] });

const renderAt = (path: string, ui: React.ReactNode) => {
	const history = mem(path);
	const result = render(<HistoryRouter history={history}>{ui}</HistoryRouter>);
	return { ...result, history };
};

/** a route element that shows its route context, params and prefix as JSON */
const Info = (props: { id: string }) => (
	<div data-testid={props.id}>
		{JSON.stringify({
			...useRouteInfo(),
			params: useParams(),
			prefix: useRoutePrefix(),
		})}
	</div>
);
const infoOf = (id: string) =>
	JSON.parse(screen.getByTestId(id).textContent ?? "null") as {
		url: string;
		path: string;
		params: Record<string, string>;
		prefix: string;
	};

const ShowPath = () => <div data-testid="path">{useLocation().pathname}</div>;

describe("Routes: nesting", () => {
	it("[ISSUE-3475-ITEM-5] resolves a relative child under a parent path without /*", () => {
		// the parent matches /devices/info as a prefix, so it looks like a valid parent
		renderAt(
			"/devices/info",
			<Routes>
				{[
					<Route
						key="d"
						path="/devices"
						element={
							<div>
								PARENT
								<Routes>
									{[<Route key="i" path="info" element={<div>INFO</div>} />]}
								</Routes>
							</div>
						}
					/>,
				]}
			</Routes>,
		);
		expect(screen.getByText(/PARENT/)).toBeInTheDocument();
		expect(screen.getByText("INFO")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-5] gives a child under a parent path without /* its full path, url and params", () => {
		// CRUD's form route ":id/*" under a CRUD routed at "/devices"
		renderAt(
			"/devices/5/edit",
			<Routes>
				{[
					<Route
						key="d"
						path="/devices"
						element={
							<Routes>
								{[<Route key="i" path=":id/*" element={<Info id="form" />} />]}
							</Routes>
						}
					/>,
				]}
			</Routes>,
		);
		expect(infoOf("form")).toMatchObject({
			url: "/devices/5",
			path: "/devices/:id/*",
			params: { id: "5" },
			prefix: "/devices/:id/",
		});
	});

	it("[ISSUE-3475-ITEM-5] joins a child path to its parent path with exactly one slash", () => {
		const cases: [string, string, string][] = [
			// [parent path, child path, expected full path]
			["/devices", "info", "/devices/info"],
			["/devices", "/info", "/devices/info"],
			["/devices", "", "/devices/"],
			["/devices/", "info", "/devices/info"],
			["/devices/", "/info", "/devices/info"],
			["/devices/*", "info", "/devices/info"],
			["/devices/*", "/info", "/devices/info"],
			["/devices/*", "", "/devices/"],
			["/devices/*", "/", "/devices/"],
		];
		for (const [parentPath, childPath, fullPath] of cases) {
			renderAt(
				// a child without segments matches only its parent's own url
				fullPath === "/devices/" ? "/devices" : "/devices/info",
				<Routes>
					{[
						<Route
							key="d"
							path={parentPath}
							element={
								<Routes>
									{[
										<Route
											key="c"
											path={childPath}
											element={<Info id="child" />}
										/>,
									]}
								</Routes>
							}
						/>,
					]}
				</Routes>,
			);
			expect(
				infoOf("child").path,
				`${parentPath} + ${JSON.stringify(childPath)}`,
			).toBe(fullPath);
			cleanup();
		}
	});
});

describe("useParams", () => {
	it("[ISSUE-3475-ITEM-11] decodes params and matches literal non-ASCII segments with browser history", () => {
		window.history.replaceState(null, "", "/");
		const history = createBrowserHistory();
		const Params = () => (
			<div data-testid="params">{JSON.stringify(useParams())}</div>
		);
		render(
			<HistoryRouter history={history}>
				<Routes>
					{[
						<Route key="s" path="/search/:term/:x" element={<Params />} />,
						<Route key="u" path="/über" element={<div>ÜBER</div>} />,
					]}
				</Routes>
			</HistoryRouter>,
		);
		act(() => history.push("/search/foo bar/ä"));
		// the browser keeps the pathname percent-encoded
		expect(history.location.pathname).toBe("/search/foo%20bar/%C3%A4");
		expect(JSON.parse(screen.getByTestId("params").textContent ?? "")).toEqual({
			term: "foo bar",
			x: "ä",
		});
		act(() => history.push("/über"));
		expect(screen.getByText("ÜBER")).toBeInTheDocument();
		window.history.replaceState(null, "", "/");
	});

	/** a parent route "/t/:<param>/*" whose element nests a route ":id" */
	const nested = (parentParam: string) => (
		<Routes>
			{[
				<Route
					key="t"
					path={`/t/:${parentParam}/*`}
					element={
						<>
							<Info id="parent" />
							<Routes>
								{[<Route key="r" path=":id" element={<Info id="nested" />} />]}
							</Routes>
						</>
					}
				/>,
			]}
		</Routes>
	);

	it("[ISSUE-3475-ITEM-18] gives a nested param the nearest Route's value, and the parent's element the parent's", () => {
		renderAt("/t/T1/R9", nested("id"));
		expect(infoOf("nested").params).toEqual({ id: "R9" });
		expect(infoOf("parent").params).toEqual({ id: "T1" });
	});

	it("[ISSUE-3475-ITEM-18] gives a nested Route the params of its parents that have other names", () => {
		renderAt("/t/T1/R9", nested("tenantId"));
		expect(infoOf("nested").params).toEqual({ tenantId: "T1", id: "R9" });
		expect(infoOf("parent").params).toEqual({ tenantId: "T1" });
	});
});

describe("RouteContext rendersAt", () => {
	/** shows, as JSON, whether its route renders at each of the paths */
	const RendersAt = (props: { id: string; paths: string[] }) => {
		const { rendersAt } = useRouteInfo();
		return (
			<div data-testid={props.id}>
				{JSON.stringify(
					Object.fromEntries(
						props.paths.map((path) => [path, rendersAt(path)]),
					),
				)}
			</div>
		);
	};
	const rendersAtOf = (id: string) =>
		JSON.parse(screen.getByTestId(id).textContent ?? "null") as Record<
			string,
			boolean
		>;
	const PATHS = [
		"/rec",
		"/rec/details",
		"/rec/more",
		"/rec/more/x",
		"/rec/new",
		"/other",
	];

	it("[ISSUE-3500-ITEM-24] a route renders at a path only where every Routes around it still picks it", () => {
		// tab panels: the default panel ("/*", listed last) under a record route that
		// an earlier sibling (/rec/new) takes over at its own path
		renderAt(
			"/rec",
			<Routes>
				{[
					<Route key="new" path="/rec/new" element={<div>NEW</div>} />,
					<Route
						key="rec"
						path="/rec/*"
						element={
							<>
								<RendersAt id="record" paths={PATHS} />
								<Routes>
									{[
										<Route
											key="more"
											path="more/*"
											element={<div>MORE</div>}
										/>,
										<Route
											key=""
											path="/*"
											element={<RendersAt id="default" paths={PATHS} />}
										/>,
									]}
								</Routes>
							</>
						}
					/>,
				]}
			</Routes>,
		);
		expect(rendersAtOf("record")).toEqual({
			"/rec": true,
			"/rec/details": true,
			"/rec/more": true,
			"/rec/more/x": true,
			"/rec/new": false,
			"/other": false,
		});
		expect(rendersAtOf("default")).toEqual({
			"/rec": true,
			"/rec/details": true,
			"/rec/more": false,
			"/rec/more/x": false,
			"/rec/new": false,
			"/other": false,
		});
	});

	it("[ISSUE-3500-ITEM-24] a route outside of any Routes renders wherever its path matches", () => {
		renderAt(
			"/rec",
			<Route path="/rec/*" element={<RendersAt id="bare" paths={PATHS} />} />,
		);
		expect(rendersAtOf("bare")).toEqual({
			"/rec": true,
			"/rec/details": true,
			"/rec/more": true,
			"/rec/more/x": true,
			"/rec/new": true,
			"/other": false,
		});
	});

	it("[ISSUE-3500-ITEM-24] follows the entries of the latest render without changing the context", () => {
		const seen: ((pathname: string) => boolean)[] = [];
		const Probe = () => {
			seen.push(useRouteInfo().rendersAt);
			return null;
		};
		const MemoProbe = React.memo(Probe);
		const Panels = (props: { withDetails: boolean }) => (
			<Routes>
				{[
					...(props.withDetails
						? [
								<Route
									key="details"
									path="details"
									element={<div>DETAILS</div>}
								/>,
							]
						: []),
					<Route key="" path="/*" element={<MemoProbe />} />,
				]}
			</Routes>
		);
		const { rerender, history } = renderAt(
			"/start",
			<Panels withDetails={false} />,
		);
		expect(seen).toHaveLength(1);
		expect(seen[0]("/details")).toBe(true);
		rerender(
			<HistoryRouter history={history}>
				<Panels withDetails={true} />
			</HistoryRouter>,
		);
		// the memoized consumer was not rendered again: its context is unchanged
		expect(seen).toHaveLength(1);
		// and it answers for the entries rendered now
		expect(seen[0]("/details")).toBe(false);
		expect(seen[0]("/other")).toBe(true);
	});
});

describe("Routes: invalid children", () => {
	it("[ISSUE-3475-ITEM-14] never matches a child without a path prop", () => {
		renderAt(
			"/undefined/x",
			<Routes>
				{[
					<div key="d">NOT A ROUTE</div>,
					<Route key="404" path="*" element={<div>NOT FOUND</div>} />,
				]}
			</Routes>,
		);
		expect(screen.queryByText("NOT A ROUTE")).toBeNull();
		expect(screen.getByText("NOT FOUND")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-14] leaves /undefined to the next child in rendersAt as well", () => {
		const RendersAt = () => (
			<div data-testid="renders-at">
				{String(useRouteInfo().rendersAt("/undefined/x"))}
			</div>
		);
		renderAt(
			"/other",
			<Routes>
				{[
					<div key="d">NOT A ROUTE</div>,
					<Route key="404" path="*" element={<RendersAt />} />,
				]}
			</Routes>,
		);
		// the not-found route would stay mounted at /undefined/x
		expect(screen.getByTestId("renders-at")).toHaveTextContent("true");
	});
});

describe("HistoryRouter nested in a Route", () => {
	it("[ISSUE-3475-ITEM-13] starts a fresh routing scope for its own routes", () => {
		const inner = mem("/step1");
		renderAt(
			"/devices/5",
			<Routes>
				{[
					<Route
						key="d"
						path="/devices/*"
						element={
							<HistoryRouter history={inner}>
								<ShowPath />
								<Routes>
									{[<Route key="s" path="/step1" element={<div>STEP1</div>} />]}
								</Routes>
							</HistoryRouter>
						}
					/>,
				]}
			</Routes>,
		);
		expect(screen.getByTestId("path")).toHaveTextContent("/step1");
		expect(screen.getByText("STEP1")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-13] gives its content no route and no params of the outer router", () => {
		const Scope = () => (
			<div data-testid="scope">
				{JSON.stringify({
					route: useContext(RouteContext),
					params: useParams(),
				})}
			</div>
		);
		renderAt(
			"/devices/5/wizard",
			<Routes>
				{[
					<Route
						key="d"
						path="/devices/:id/*"
						element={
							<HistoryRouter history={mem("/step/1")}>
								<Scope />
								<Routes>
									{[
										<Route
											key="s"
											path="/step/:n"
											element={<Info id="inner" />}
										/>,
									]}
								</Routes>
							</HistoryRouter>
						}
					/>,
				]}
			</Routes>,
		);
		expect(JSON.parse(screen.getByTestId("scope").textContent ?? "")).toEqual({
			route: null,
			params: {},
		});
		expect(infoOf("inner")).toEqual({
			url: "/step/1",
			path: "/step/:n",
			depth: 0,
			params: { n: "1" },
			prefix: "/step/:n",
		});
	});

	it("[ISSUE-3475-ITEM-13] answers rendersAt for its own routes, not for the Routes of the outer router", () => {
		const RendersAt = () => (
			<div data-testid="renders-at">
				{String(useRouteInfo().rendersAt("/step1"))}
			</div>
		);
		renderAt(
			"/devices/5",
			<Routes>
				{[
					<Route
						key="d"
						path="/devices/*"
						element={
							<HistoryRouter history={mem("/step1")}>
								<Route path="/step1" element={<RendersAt />} />
							</HistoryRouter>
						}
					/>,
				]}
			</Routes>,
		);
		// /step1 is a location of the inner router: the outer Routes, which would
		// render nothing there, has no say in it
		expect(screen.getByTestId("renders-at")).toHaveTextContent("true");
	});
});

describe("Route context identity", () => {
	it("[ISSUE-3475-ITEM-26] keeps the RouteContext value while the route's url and path stay the same", () => {
		const seen: unknown[] = [];
		const Consumer = () => {
			// re-renders on every navigation, as most readers of the context do
			useLocation();
			seen.push(useContext(RouteContext));
			return null;
		};
		const { history } = renderAt(
			"/devices/1",
			<Routes>
				{[
					<Route
						key="d"
						path="/devices/*"
						element={
							<>
								<Consumer />
								<Routes>
									{[<Route key="i" path=":id" element={<div />} />]}
								</Routes>
							</>
						}
					/>,
				]}
			</Routes>,
		);
		act(() => history.push("/devices/2"));
		expect(seen.length).toBeGreaterThan(1);
		// url "/devices" and path "/devices/*" did not change
		expect(seen[seen.length - 1]).toBe(seen[0]);
	});

	it("[ISSUE-3475-ITEM-26] returns the same useParams object while the params do not change", () => {
		const seen: unknown[] = [];
		let rerender!: () => void;
		const Consumer = () => {
			const [, setN] = useState(0);
			rerender = () => setN((n) => n + 1);
			seen.push(useParams());
			return null;
		};
		renderAt(
			"/devices/1",
			<Routes>
				{[<Route key="d" path="/devices/:id" element={<Consumer />} />]}
			</Routes>,
		);
		act(() => rerender());
		expect(seen).toHaveLength(2);
		expect(seen[1]).toEqual({ id: "1" });
		expect(seen[1]).toBe(seen[0]);
	});

	it("[ISSUE-3475-ITEM-26] re-renders a component that reads only its route and params when the route's url changes, not on every navigation", () => {
		let renders = 0;
		const Consumer = () => {
			renders++;
			const { url } = useRouteInfo();
			const { id } = useParams<"id">();
			return <div data-testid="route">{`${url} ${id}`}</div>;
		};
		const { history } = renderAt(
			"/devices/1",
			<Routes>
				{[<Route key="d" path="/devices/:id/*" element={<Consumer />} />]}
			</Routes>,
		);
		act(() => history.push("/devices/1/edit"));
		expect(renders).toBe(1);
		act(() => history.push("/devices/2"));
		expect(renders).toBe(2);
		expect(screen.getByTestId("route")).toHaveTextContent("/devices/2 2");
	});

	it("[ISSUE-3475-ITEM-26] runs an effect that depends on useParams when a param of its route changes, not on every navigation", () => {
		const effectRuns: unknown[] = [];
		const Tenant = () => {
			// re-renders on every navigation, as most route elements do
			useLocation();
			const params = useParams<"tenantId">();
			useEffect(() => {
				effectRuns.push(params);
			}, [params]);
			return (
				<Routes>
					{[<Route key="i" path="devices/:id" element={<div />} />]}
				</Routes>
			);
		};
		const { history } = renderAt(
			"/t/T1/devices/1",
			<Routes>
				{[<Route key="t" path="/t/:tenantId/*" element={<Tenant />} />]}
			</Routes>,
		);
		act(() => history.push("/t/T1/devices/2"));
		expect(effectRuns).toEqual([{ tenantId: "T1" }]);
		act(() => history.push("/t/T2/devices/2"));
		expect(effectRuns).toEqual([{ tenantId: "T1" }, { tenantId: "T2" }]);
	});

	it("[ISSUE-3475-ITEM-26] re-renders no route element on a navigation within its route, also when its route list is built from useParams", () => {
		let pageRenders = 0;
		const Page = () => {
			pageRenders++;
			return null;
		};
		let listRenders = 0;
		const DeviceRoutes = () => {
			listRenders++;
			const { tenantId } = useParams<"tenantId">();
			return (
				<Routes>
					{[
						<Route
							key="d"
							path="devices/*"
							element={<Page key={tenantId} />}
						/>,
					]}
				</Routes>
			);
		};
		const { history } = renderAt(
			"/t/T1/devices/1",
			<Routes>
				{[<Route key="t" path="/t/:tenantId/*" element={<DeviceRoutes />} />]}
			</Routes>,
		);
		act(() => history.push("/t/T1/devices/2"));
		expect(listRenders).toBe(1);
		expect(pageRenders).toBe(1);
	});

	it("[ISSUE-3475-ITEM-26] useParams throws outside a HistoryRouter, naming Framework and HistoryRouter", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const ReadParams = () => {
			useParams();
			return null;
		};
		expect(() => render(<ReadParams />)).toThrow(
			"did you forget to add Components-Care Framework or HistoryRouter?",
		);
	});
});

describe("Routes: which child renders", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	/** shows, as JSON, whether its route renders at each of the paths */
	const RendersAt = (props: { id: string; paths: string[] }) => {
		const { rendersAt } = useRouteInfo();
		return (
			<div data-testid={props.id}>
				{JSON.stringify(props.paths.map((path) => rendersAt(path)))}
			</div>
		);
	};

	it("[ISSUE-3475-ITEM-16] renders the most specific matching child, whatever the order of the children", () => {
		const routes = [
			<Route key="all" path="*" element={<div>NOT FOUND</div>} />,
			<Route key="list" path="/devices/*" element={<div>LIST</div>} />,
			<Route key="record" path="/devices/:id/*" element={<div>RECORD</div>} />,
			<Route key="new" path="/devices/new/*" element={<div>NEW</div>} />,
			<Route key="edit" path="/devices/:id/edit" element={<div>EDIT</div>} />,
		];
		const pages: Record<string, string> = {
			"/devices/new": "NEW",
			"/devices/5": "RECORD",
			"/devices/5/history": "RECORD",
			"/devices/5/edit": "EDIT",
			"/devices/new/edit": "EDIT",
			"/devices": "LIST",
			"/other": "NOT FOUND",
		};
		for (const children of [routes, [...routes].reverse()]) {
			for (const [path, page] of Object.entries(pages)) {
				const { container } = renderAt(path, <Routes>{children}</Routes>);
				expect(container.textContent, path).toBe(page);
				cleanup();
			}
		}
	});

	it("[ISSUE-3475-ITEM-16] prefers a path without a trailing /* to the same path with one, and the child listed first on a tie", () => {
		const atDevice = (children: React.ReactElement[]) => {
			const { container } = renderAt("/devices/1", <Routes>{children}</Routes>);
			const text = container.textContent;
			cleanup();
			return text;
		};
		const plainAndSplat = [
			<Route key="splat" path="/devices/*" element={<div>SPLAT</div>} />,
			<Route key="plain" path="/devices" element={<div>PLAIN</div>} />,
		];
		expect(atDevice(plainAndSplat)).toBe("PLAIN");
		expect(atDevice([...plainAndSplat].reverse())).toBe("PLAIN");
		const tie = [
			<Route key="a" path="/devices/:a" element={<div>A</div>} />,
			<Route key="b" path="/devices/:b" element={<div>B</div>} />,
		];
		expect(atDevice(tie)).toBe("A");
		expect(atDevice([...tie].reverse())).toBe("B");
	});

	it("[ISSUE-3475-ITEM-16] answers rendersAt with the ranking: a more specific child listed later takes over its path", () => {
		renderAt(
			"/rec/1",
			<Routes>
				{[
					<Route
						key="rec"
						path="/rec/*"
						element={<RendersAt id="rec" paths={["/rec/new", "/rec/2"]} />}
					/>,
					<Route key="new" path="/rec/new" element={<div>NEW</div>} />,
				]}
			</Routes>,
		);
		expect(screen.getByTestId("rec")).toHaveTextContent("[false,true]");
	});

	it("[ISSUE-3475-ITEM-16] a Route with end matches only the whole location, in Routes and on its own", () => {
		const ui = (
			<>
				<Routes>
					{[
						<Route key="list" path="/devices" end element={<div>LIST</div>} />,
						<Route key="all" path="*" element={<div>NOT FOUND</div>} />,
					]}
				</Routes>
				<Route
					path="/devices"
					end
					element={<RendersAt id="bare" paths={["/devices", "/devices/1"]} />}
				/>
			</>
		);
		const { history } = renderAt("/devices", ui);
		expect(screen.getByText("LIST")).toBeInTheDocument();
		expect(screen.getByTestId("bare")).toHaveTextContent("[true,false]");
		act(() => history.push("/devices/"));
		expect(screen.getByText("LIST")).toBeInTheDocument();
		expect(screen.getByTestId("bare")).toBeInTheDocument();
		act(() => history.push("/devices/1"));
		expect(screen.getByText("NOT FOUND")).toBeInTheDocument();
		expect(screen.queryByText("LIST")).toBeNull();
		expect(screen.queryByTestId("bare")).toBeNull();
	});

	it('[ISSUE-3475-ITEM-16] a nested "" or "/" matches only the parent\'s own url, as "/" does at the top level, and * takes the rest', () => {
		for (const index of ["", "/"]) {
			const { history } = renderAt(
				"/d",
				<Routes>
					{[
						<Route key="home" path="/" element={<div>HOME</div>} />,
						<Route
							key="d"
							path="/d/*"
							element={
								<Routes>
									{[
										<Route
											key="index"
											path={index}
											element={<div>INDEX</div>}
										/>,
										<Route key="all" path="*" element={<div>NOT FOUND</div>} />,
									]}
								</Routes>
							}
						/>,
					]}
				</Routes>,
			);
			expect(screen.getByText("INDEX"), index).toBeInTheDocument();
			act(() => history.push("/d/"));
			expect(screen.getByText("INDEX"), index).toBeInTheDocument();
			act(() => history.push("/d/x/y"));
			expect(screen.getByText("NOT FOUND"), index).toBeInTheDocument();
			expect(screen.queryByText("INDEX"), index).toBeNull();
			act(() => history.push("/"));
			expect(screen.getByText("HOME"), index).toBeInTheDocument();
			act(() => history.push("/x"));
			expect(screen.queryByText("HOME"), index).toBeNull();
			cleanup();
		}
	});

	it("[ISSUE-3475-ITEM-16] warns in development, once per path, when a Routes outside of every Route matches nothing", () => {
		vi.stubEnv("NODE_ENV", "development");
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const history = mem("/nowhere");
		// StrictMode around the router, where it runs the effects of the first mount twice
		render(
			<React.StrictMode>
				<HistoryRouter history={history}>
					<Routes>
						{[<Route key="a" path="/a" element={<div>A</div>} />]}
					</Routes>
				</HistoryRouter>
			</React.StrictMode>,
		);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(String(warn.mock.calls[0][0])).toContain('"/nowhere"');
		act(() => history.push("/nowhere?tab=2"));
		expect(warn).toHaveBeenCalledTimes(1);
		act(() => history.push("/a"));
		expect(warn).toHaveBeenCalledTimes(1);
		act(() => history.push("/elsewhere"));
		expect(warn).toHaveBeenCalledTimes(2);
		expect(String(warn.mock.calls[1][0])).toContain('"/elsewhere"');
		act(() => history.push("/nowhere"));
		expect(warn).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3475-ITEM-16] stays silent for a nested Routes that matches nothing, and in production", () => {
		vi.stubEnv("NODE_ENV", "development");
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		renderAt(
			"/d",
			<Routes>
				{[
					<Route
						key="d"
						path="/d/*"
						element={
							<Routes>
								{[<Route key="x" path="x" element={<div>X</div>} />]}
							</Routes>
						}
					/>,
				]}
			</Routes>,
		);
		expect(warn).not.toHaveBeenCalled();
		cleanup();
		vi.stubEnv("NODE_ENV", "production");
		renderAt(
			"/nowhere",
			<Routes>{[<Route key="a" path="/a" element={<div>A</div>} />]}</Routes>,
		);
		expect(warn).not.toHaveBeenCalled();
	});
});
