import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React, { StrictMode, useEffect, useLayoutEffect, useState } from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import {
	createBrowserHistory,
	createMemoryHistory,
	MemoryHistory,
} from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route, { useRouteInfo } from "../../src/standalone/Routes/Route";
import useLocation from "../../src/standalone/Routes/useLocation";
import useNavigate, {
	NavigateFunction,
} from "../../src/standalone/Routes/useNavigate";

// HistoryRouter's location propagation and useNavigate. Assertions read the
// rendered location (a useLocation reader), not only the history object.

let scrollTo: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	// useNavigate resets the scroll position; jsdom does not implement scrollTo
	scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
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

/** renders a component that hands out the navigate function */
const renderNavigate = (history: MemoryHistory, extra?: React.ReactNode) => {
	const ref: { navigate: NavigateFunction | null; seen: NavigateFunction[] } = {
		navigate: null,
		seen: [],
	};
	const Grab = () => {
		const navigate = useNavigate();
		useLocation(); // re-render on every navigation
		ref.navigate = navigate;
		if (!ref.seen.includes(navigate)) ref.seen.push(navigate);
		return null;
	};
	const result = render(
		<HistoryRouter history={history}>
			<Grab />
			<ShowLocation />
			{extra}
		</HistoryRouter>,
	);
	return { ...result, ref };
};

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

describe("useNavigate", () => {
	const location = () => screen.getByTestId("location").textContent;

	it("[ISSUE-3475-ITEM-6] keeps a child link built from the root route's url inside the app", () => {
		// what CRUD does for its edit, new and import pages: `${url}/${id}`
		let navigateToChild!: () => void;
		const Page = () => {
			const navigate = useNavigate();
			const { url } = useRouteInfo();
			navigateToChild = () => navigate(`${url}/7`);
			return <div data-testid="url">{url}</div>;
		};
		const history = mem("/");
		render(
			<HistoryRouter history={history}>
				<Routes>{[<Route key="r" path="/*" element={<Page />} />]}</Routes>
			</HistoryRouter>,
		);
		act(() => navigateToChild());
		// "//7" is a protocol-relative URL: a browser history leaves the origin
		expect(history.location.pathname).toBe("/7");
	});

	it("[ISSUE-3475-ITEM-6] collapses the leading slashes of a target, also backslashes, and keeps its search and hash", () => {
		const history = mem("/a");
		const { ref } = renderNavigate(history);
		act(() => ref.navigate!("//b?q=1#h"));
		expect(location()).toBe("/b|?q=1|#h|null");
		// the URL parser reads a backslash as a slash and drops tabs and newlines
		act(() => ref.navigate!("/\\c", { replace: true }));
		expect(location()).toBe("/c|||null");
		act(() => ref.navigate!("/\t/d"));
		expect(location()).toBe("/d|||null");
		act(() => ref.navigate!({ pathname: "///e", search: "?x=1" }));
		expect(location()).toBe("/e|?x=1||null");
		expect(history.index).toBe(3);
	});

	it("[ISSUE-3475-ITEM-6] leaves a target that stays inside the app as it is", () => {
		const history = mem("/a");
		const { ref } = renderNavigate(history);
		act(() => ref.navigate!("/b//c"));
		expect(location()).toBe("/b//c|||null");
		act(() => ref.navigate!("?p=2"));
		expect(location()).toBe("/b//c|?p=2||null");
		act(() => ref.navigate!({ hash: "#h" }));
		expect(location()).toBe("/b//c||#h|null");
	});

	it.each([
		"https://other.example/",
		"javascript:alert(1)",
		"mailto:someone@example.com",
		// what the URL parser drops: leading controls and spaces, tabs and newlines
		" https://other.example/",
		"\tjavascript:alert(1)",
		"java\nscript:alert(1)",
	])(
		"[ISSUE-3475-ITEM-6] refuses %j with push and with replace, without navigating or scrolling",
		(to) => {
			const history = mem("/a");
			const { ref } = renderNavigate(history);
			for (const target of [to, { pathname: to }])
				for (const replace of [false, true])
					expect(() => ref.navigate!(target, { replace })).toThrow(
						"is not a path of this app",
					);
			expect(history.index).toBe(0);
			expect(location()).toBe("/a|||null");
			expect(scrollTo).not.toHaveBeenCalled();
		},
	);

	it("[ISSUE-3475-ITEM-6] keeps a browser history on the app's origin", () => {
		window.history.replaceState(null, "", "/start");
		const history = createBrowserHistory();
		let navigate!: NavigateFunction;
		const Grab = () => {
			navigate = useNavigate();
			return null;
		};
		render(
			<HistoryRouter history={history}>
				<Grab />
				<ShowPath />
			</HistoryRouter>,
		);
		act(() => navigate("//new"));
		expect(window.location.href).toBe(`${window.location.origin}/new`);
		expect(renderedPath()).toBe("/new");
		expect(() => navigate("https://other.example/")).toThrow(
			"is not a path of this app",
		);
		expect(() => navigate("https://other.example/", { replace: true })).toThrow(
			"is not a path of this app",
		);
		expect(window.location.href).toBe(`${window.location.origin}/new`);
		window.history.replaceState(null, "", "/");
	});
});
