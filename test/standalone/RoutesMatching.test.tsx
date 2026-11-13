import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { createMemoryHistory } from "history";
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
