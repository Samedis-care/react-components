import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { createBrowserHistory, createMemoryHistory } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route, {
	useRouteInfo,
	useRoutePrefix,
} from "../../src/standalone/Routes/Route";
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
				"/devices/info",
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
