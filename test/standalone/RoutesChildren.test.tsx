import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React, { useEffect } from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { createMemoryHistory, History } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route, { useRouteInfo } from "../../src/standalone/Routes/Route";
import {
	getTabPanelId,
	RoutedTabPanelWrapper,
	useRoutedTabPanel,
} from "../../src/non-standalone/RoutedTabs";

// What Routes takes as children (one child, conditional children, fragments,
// arrays) and how a child's key decides whether its element stays mounted.
// Which path matches which location is covered in RoutesMatching.test.tsx.

/** called each time a Page mounts */
const onMount = vi.fn();

/**
 * A route element that reports its mounts
 * @param props.name The text it shows
 */
const Page = (props: { name: string }) => {
	useEffect(() => {
		onMount();
	}, []);
	return <div>{props.name}</div>;
};

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});
beforeEach(() => {
	// useNavigate resets the scroll position; jsdom does not implement scrollTo
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
	onMount.mockClear();
});

const mem = (path: string) => createMemoryHistory({ initialEntries: [path] });

const inRouter = (history: History, ui: React.ReactNode) => (
	<HistoryRouter history={history}>{ui}</HistoryRouter>
);

describe("Routes: children", () => {
	it("[ISSUE-3475-ITEM-17] renders a single child", () => {
		render(
			inRouter(
				mem("/a"),
				<Routes>
					<Route path="/a" element={<div>A</div>} />
				</Routes>,
			),
		);
		expect(screen.getByText("A")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-17] skips false, null and undefined children", () => {
		const Conditional = (props: { admin: boolean }) => (
			<Routes>
				{props.admin && <Route path="/admin" element={<div>ADMIN</div>} />}
				{null}
				{undefined}
				<Route path="/*" element={<div>HOME</div>} />
			</Routes>
		);
		const history = mem("/admin");
		const { rerender } = render(
			inRouter(history, <Conditional admin={false} />),
		);
		expect(screen.getByText("HOME")).toBeInTheDocument();
		rerender(inRouter(history, <Conditional admin={true} />));
		expect(screen.getByText("ADMIN")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-17] skips false, null and undefined entries of an array", () => {
		const routes = (admin: boolean) => (
			<Routes>
				{[
					admin && (
						<Route key="admin" path="/admin" element={<div>ADMIN</div>} />
					),
					null,
					undefined,
					<Route key="home" path="/*" element={<div>HOME</div>} />,
				]}
			</Routes>
		);
		const history = mem("/admin");
		const { rerender } = render(inRouter(history, routes(false)));
		expect(screen.getByText("HOME")).toBeInTheDocument();
		rerender(inRouter(history, routes(true)));
		expect(screen.getByText("ADMIN")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-17] takes the children of fragments, nested ones and arrays in them included, in their place in the order", () => {
		const routes = (
			<Routes>
				<>
					<Route path="/devices/new" element={<div>NEW</div>} />
					<React.Fragment key="import">
						<Route path="/devices/import" element={<div>IMPORT</div>} />
					</React.Fragment>
				</>
				<Route path="/devices/*" element={<div>DEVICES</div>} />
				<>{[<Route key="users" path="/users" element={<div>USERS</div>} />]}</>
			</Routes>
		);
		const cases: [string, string][] = [
			["/devices/new", "NEW"],
			["/devices/import", "IMPORT"],
			["/devices/1", "DEVICES"],
			["/users", "USERS"],
		];
		for (const [path, text] of cases) {
			render(inRouter(mem(path), routes));
			expect(screen.queryByText(text), path).toBeInTheDocument();
			cleanup();
		}
	});

	it("[ISSUE-3475-ITEM-17] takes a conditional group of routes in a fragment", () => {
		const Grouped = (props: { admin: boolean }) => (
			<Routes>
				{props.admin && (
					<>
						<Route path="/admin/users" element={<div>USERS</div>} />
						<Route path="/admin/*" element={<div>ADMIN</div>} />
					</>
				)}
				<Route path="/*" element={<div>HOME</div>} />
			</Routes>
		);
		const history = mem("/admin/users");
		const { rerender } = render(inRouter(history, <Grouped admin={false} />));
		expect(screen.getByText("HOME")).toBeInTheDocument();
		rerender(inRouter(history, <Grouped admin={true} />));
		expect(screen.getByText("USERS")).toBeInTheDocument();
	});

	it("[ISSUE-3475-ITEM-17] answers rendersAt for the children of fragments as well", () => {
		const RendersAt = () => {
			const { rendersAt } = useRouteInfo();
			return (
				<div data-testid="renders-at">
					{JSON.stringify([rendersAt("/rec/new"), rendersAt("/rec/1")])}
				</div>
			);
		};
		render(
			inRouter(
				mem("/rec/1"),
				<Routes>
					<>
						<Route path="/rec/new" element={<div>NEW</div>} />
					</>
					<Route path="/rec/*" element={<RendersAt />} />
				</Routes>,
			),
		);
		// at /rec/new the fragment's route, listed first, is rendered instead
		expect(screen.getByTestId("renders-at")).toHaveTextContent("[false,true]");
	});
});

describe("Routes: keys", () => {
	/**
	 * One route at /t/:id
	 * @param routeKey The key of the Route element
	 */
	const keyed = (routeKey: string) => (
		<Routes>
			{[<Route key={routeKey} path="/t/:id" element={<Page name="PAGE" />} />]}
		</Routes>
	);

	it("[ISSUE-3475-ITEM-17] remounts the rendered child when its key changes", () => {
		const history = mem("/t/1");
		const { rerender } = render(inRouter(history, keyed("A")));
		rerender(inRouter(history, keyed("B")));
		expect(screen.getByText("PAGE")).toBeInTheDocument();
		expect(onMount).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3475-ITEM-17] keeps a child mounted while its key stays the same", () => {
		const history = mem("/t/1");
		const { rerender } = render(inRouter(history, keyed("A")));
		act(() => history.push("/t/2"));
		rerender(inRouter(history, keyed("A")));
		expect(screen.getByText("PAGE")).toBeInTheDocument();
		expect(onMount).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3475-ITEM-17] keys a child without a key by its path, not by its position", () => {
		const Shifting = (props: { admin: boolean }) => (
			<Routes>
				{props.admin && (
					<>
						<Route path="/admin" element={<div>ADMIN</div>} />
						<Route path="/users" element={<div>USERS</div>} />
					</>
				)}
				<Route path="/t/:id" element={<Page name="PAGE" />} />
			</Routes>
		);
		const history = mem("/t/1");
		const { rerender } = render(inRouter(history, <Shifting admin={false} />));
		act(() => history.push("/t/2"));
		// two routes before it now: still the same child
		rerender(inRouter(history, <Shifting admin={true} />));
		expect(screen.getByText("PAGE")).toBeInTheDocument();
		expect(onMount).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3475-ITEM-17] remounts the element when another child takes over, also one with the same element", () => {
		const history = mem("/a");
		render(
			inRouter(
				history,
				<Routes>
					<Route path="/a" element={<Page name="PAGE" />} />
					<Route path="/b" element={<Page name="PAGE" />} />
				</Routes>,
			),
		);
		act(() => history.push("/b"));
		expect(screen.getByText("PAGE")).toBeInTheDocument();
		expect(onMount).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3475-ITEM-17] tells children apart by their paths, also children with the same key", () => {
		const history = mem("/a");
		render(
			inRouter(
				history,
				<Routes>
					{[
						<Route key="same" path="/a" element={<Page name="PAGE" />} />,
						<Route key="same" path="/b" element={<Page name="PAGE" />} />,
					]}
				</Routes>,
			),
		);
		act(() => history.push("/b"));
		expect(screen.getByText("PAGE")).toBeInTheDocument();
		expect(onMount).toHaveBeenCalledTimes(2);
	});
});

describe("RoutedTabPanelWrapper: children", () => {
	it("[ISSUE-3475-ITEM-17] shows and names the panel of an entry inside a fragment, as Routes renders it", () => {
		const Panels = () => {
			const tab = useRoutedTabPanel();
			return (
				<RoutedTabPanelWrapper>
					<>{tab("security", <div>SECURITY PANEL</div>)}</>
					{tab("", <div>MAIN PANEL</div>)}
				</RoutedTabPanelWrapper>
			);
		};
		render(
			inRouter(
				mem("/settings/security"),
				<Routes>
					{[<Route key="settings" path="/settings/*" element={<Panels />} />]}
				</Routes>,
			),
		);
		const panel = screen.getByRole("tabpanel");
		expect(panel).toHaveTextContent("SECURITY PANEL");
		expect(panel).toHaveAttribute("id", getTabPanelId("/settings", "security"));
	});
});
