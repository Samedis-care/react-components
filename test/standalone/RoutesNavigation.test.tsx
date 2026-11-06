import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React, { StrictMode, useEffect, useLayoutEffect, useState } from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { createMemoryHistory } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import useLocation from "../../src/standalone/Routes/useLocation";
import useNavigate from "../../src/standalone/Routes/useNavigate";

// HistoryRouter's location propagation and useNavigate. Assertions read the
// rendered location (a useLocation reader), not only the history object.

beforeEach(() => {
	// useNavigate resets the scroll position; jsdom does not implement scrollTo
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const mem = (path: string) => createMemoryHistory({ initialEntries: [path] });

const ShowLocation = () => {
	const { pathname, search, hash, state } = useLocation();
	return (
		<div data-testid="location">
			{`${pathname}|${search}|${hash}|${JSON.stringify(state)}`}
		</div>
	);
};
const ShowPath = () => <div data-testid="path">{useLocation().pathname}</div>;
const renderedPath = () => screen.getByTestId("path").textContent;

describe("HistoryRouter", () => {
	it("re-renders location readers and the matched route on push, replace and back", () => {
		const history = mem("/a");
		render(
			<HistoryRouter history={history}>
				<ShowLocation />
				<Routes>
					{[
						<Route key="a" path="/a" element={<div>PAGE A</div>} />,
						<Route key="b" path="/b" element={<div>PAGE B</div>} />,
						<Route key="c" path="/c" element={<div>PAGE C</div>} />,
					]}
				</Routes>
			</HistoryRouter>,
		);
		const location = () => screen.getByTestId("location").textContent;
		expect(location()).toBe("/a|||null");
		act(() => history.push("/b?q=1#h", { s: 1 }));
		expect(location()).toBe('/b|?q=1|#h|{"s":1}');
		expect(screen.getByText("PAGE B")).toBeInTheDocument();
		act(() => history.replace("/c"));
		expect(location()).toBe("/c|||null");
		expect(screen.getByText("PAGE C")).toBeInTheDocument();
		act(() => history.back());
		expect(location()).toBe("/a|||null");
		expect(screen.getByText("PAGE A")).toBeInTheDocument();
	});

	it("keeps the route element mounted on a search-only navigation", () => {
		let mounts = 0;
		const Page = () => {
			useState(() => ++mounts);
			return <div data-testid="search">{useLocation().search}</div>;
		};
		const history = mem("/a");
		render(
			<HistoryRouter history={history}>
				<Routes>{[<Route key="a" path="/a" element={<Page />} />]}</Routes>
			</HistoryRouter>,
		);
		act(() => history.push("?page=2"));
		expect(screen.getByTestId("search")).toHaveTextContent("?page=2");
		expect(mounts).toBe(1);
	});

	it("listens once under StrictMode and stops listening on unmount", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const history = mem("/a");
		let active = 0;
		const listen = history.listen.bind(history);
		history.listen = (cb) => {
			active++;
			const unlisten = listen(cb);
			return () => {
				active--;
				unlisten();
			};
		};
		const { unmount } = render(
			<StrictMode>
				<HistoryRouter history={history}>
					<ShowPath />
				</HistoryRouter>
			</StrictMode>,
		);
		expect(active).toBe(1);
		act(() => history.push("/b"));
		expect(renderedPath()).toBe("/b");
		unmount();
		expect(active).toBe(0);
		expect(() => history.push("/c")).not.toThrow();
		expect(consoleError).not.toHaveBeenCalled();
	});

	it("picks up a redirect made by a route that mounts after the first commit", () => {
		// a "*" route that redirects on mount, entered by a later navigation
		const Redirect = () => {
			const navigate = useNavigate();
			useEffect(() => navigate("/target", { replace: true }), [navigate]);
			return null;
		};
		const history = mem("/");
		render(
			<HistoryRouter history={history}>
				<ShowPath />
				<Routes>
					{[
						<Route key="t" path="/target" element={<div>TARGET</div>} />,
						<Route key="r" path="/" element={<div>ROOT</div>} />,
						<Route key="x" path="*" element={<Redirect />} />,
					]}
				</Routes>
			</HistoryRouter>,
		);
		act(() => history.push("/unknown"));
		expect(renderedPath()).toBe("/target");
		expect(screen.getByText("TARGET")).toBeInTheDocument();
		expect(history.index).toBe(1);
	});

	it("[ISSUE-3475-ITEM-2] picks up a navigation a child makes while the router mounts", () => {
		const Redirect = () => {
			const navigate = useNavigate();
			useEffect(() => navigate("/target", { replace: true }), [navigate]);
			return null;
		};
		const history = mem("/");
		render(
			<HistoryRouter history={history}>
				<Redirect />
				<ShowPath />
				<Routes>
					{[
						<Route key="t" path="/target" element={<div>TARGET</div>} />,
						<Route key="r" path="/" element={<div>ROOT</div>} />,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(history.location.pathname).toBe("/target");
		expect(renderedPath()).toBe("/target");
		expect(screen.getByText("TARGET")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-2] picks up a navigation a child makes in a layout effect while the router mounts", () => {
		// a child's layout effect runs before the router's own effects
		const Redirect = () => {
			const navigate = useNavigate();
			useLayoutEffect(
				() => navigate("/target?q=1", { state: { s: 1 } }),
				[navigate],
			);
			return null;
		};
		const history = mem("/");
		render(
			<HistoryRouter history={history}>
				<Redirect />
				<ShowLocation />
			</HistoryRouter>,
		);
		const location = () => screen.getByTestId("location").textContent;
		expect(history.location.pathname).toBe("/target");
		expect(location()).toBe('/target|?q=1||{"s":1}');
		// and keeps following the history
		act(() => history.back());
		expect(location()).toBe("/|||null");
	});

	it("throws outside a HistoryRouter", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<ShowPath />)).toThrow("Location context missing");
		const Nav = () => {
			useNavigate();
			return null;
		};
		expect(() => render(<Nav />)).toThrow("HistoryRouterContext missing");
	});
});
