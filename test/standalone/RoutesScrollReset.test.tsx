import {
	describe,
	it,
	expect,
	vi,
	afterEach,
	beforeEach,
	type MockInstance,
} from "vitest";
import React, { useRef } from "react";
import {
	render,
	screen,
	act,
	cleanup,
	fireEvent,
} from "@testing-library/react";
import { createMemoryHistory, MemoryHistory, Transition } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Link from "../../src/standalone/Routes/Link";
import useLocation from "../../src/standalone/Routes/useLocation";
import useNavigate, {
	NavigateFunction,
} from "../../src/standalone/Routes/useNavigate";
import useResetScrollOnNavigation from "../../src/standalone/Routes/useResetScrollOnNavigation";
import PortalLayout from "../../src/standalone/Portal/Layout";

// Which navigations scroll the page and the registered scroll containers to the
// top. jsdom keeps the scrollTop an element is given, so the tests set it and
// read it back.

let scrollTo: MockInstance<Window["scrollTo"]>;
beforeEach(() => {
	// jsdom does not implement scrollTo
	scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	document.documentElement.scrollTop = 0;
});

const mem = (path: string) => createMemoryHistory({ initialEntries: [path] });

/** A scroll container registered with the router, e.g. the main pane of a layout */
const Pane = (props: { children?: React.ReactNode }) => {
	const ref = useRef<HTMLDivElement>(null);
	useResetScrollOnNavigation(ref);
	return (
		<div data-testid="pane" ref={ref}>
			{props.children}
		</div>
	);
};

const ShowPath = () => <div data-testid="path">{useLocation().pathname}</div>;

/** renders a router with a registered pane and hands out the navigate function */
const renderRouter = (history: MemoryHistory, content?: React.ReactNode) => {
	const ref: { navigate: NavigateFunction | null } = { navigate: null };
	const Grab = () => {
		ref.navigate = useNavigate();
		return null;
	};
	const result = render(
		<HistoryRouter history={history}>
			<Grab />
			<ShowPath />
			<Pane>{content}</Pane>
		</HistoryRouter>,
	);
	return { ...result, ref };
};

const pane = () => screen.getByTestId("pane");
const path = () => screen.getByTestId("path").textContent;

/** scrolls the page and the pane down, as a user reading the page has */
const scrollDown = () => {
	document.documentElement.scrollTop = 300;
	pane().scrollTop = 200;
	pane().scrollLeft = 20;
	scrollTo.mockClear();
};

/** where the page and the pane are scrolled to */
const scrolled = () => ({
	page: document.documentElement.scrollTop,
	pane: pane().scrollTop,
	paneLeft: pane().scrollLeft,
	scrollTo: scrollTo.mock.calls.length,
});
const AT_TOP = { page: 0, pane: 0, paneLeft: 0, scrollTo: 1 };
const KEPT = { page: 300, pane: 200, paneLeft: 20, scrollTo: 0 };

describe("[ISSUE-3475-ITEM-20] scroll reset after a navigation", () => {
	it.each([false, true])(
		"[ISSUE-3475-ITEM-20] scrolls the page and the registered scroll containers to the top (replace: %s)",
		(replace) => {
			const { ref } = renderRouter(mem("/a"));
			scrollDown();
			act(() => ref.navigate!("/b", { replace }));
			expect(path()).toBe("/b");
			expect(scrollTo).toHaveBeenCalledWith(0, 0);
			expect(scrolled()).toEqual(AT_TOP);
		},
	);

	it("[ISSUE-3475-ITEM-20] resets a registered scroll container also for a push called on the history directly", () => {
		const history = mem("/a");
		renderRouter(history);
		scrollDown();
		act(() => history.push("/b"));
		expect(scrolled()).toEqual(AT_TOP);
	});

	it("[ISSUE-3475-ITEM-20] leaves the registered scroll containers alone on back and forward", () => {
		const history = mem("/a");
		const { ref } = renderRouter(history);
		act(() => ref.navigate!("/b"));
		scrollDown();
		act(() => history.back());
		expect(path()).toBe("/a");
		act(() => history.forward());
		expect(path()).toBe("/b");
		expect(scrolled()).toEqual(KEPT);
	});

	it.each([false, true])(
		"[ISSUE-3475-ITEM-20] keeps the scroll positions of a navigation with preventScrollReset (replace: %s)",
		(replace) => {
			const { ref } = renderRouter(mem("/a"));
			scrollDown();
			act(() =>
				ref.navigate!("/b?tab=2#x", { replace, preventScrollReset: true }),
			);
			expect(path()).toBe("/b");
			expect(scrolled()).toEqual(KEPT);
		},
	);

	it("[ISSUE-3475-ITEM-20] keeps the scroll positions of a navigation with preventScrollReset to the current path completed from the location", () => {
		const { ref } = renderRouter(mem("/a/%C3%BCber"));
		scrollDown();
		// no pathname: the current one; "ü" as the URL parser encodes it
		act(() =>
			ref.navigate!({ search: "?page=2" }, { preventScrollReset: true }),
		);
		expect(scrolled()).toEqual(KEPT);
		act(() => ref.navigate!("/a/über", { preventScrollReset: true }));
		expect(path()).toBe("/a/über");
		expect(scrolled()).toEqual(KEPT);
	});

	it("[ISSUE-3475-ITEM-20] preventScrollReset applies to its own navigation only", () => {
		const history = mem("/a");
		const { ref } = renderRouter(history);
		scrollDown();
		act(() => ref.navigate!("/a/tab", { preventScrollReset: true }));
		expect(scrolled()).toEqual(KEPT);
		act(() => ref.navigate!("/b"));
		expect(scrolled()).toEqual(AT_TOP);
		scrollDown();
		act(() => ref.navigate!("/c", { preventScrollReset: true }));
		expect(scrolled()).toEqual(KEPT);
		// to the same location again, without the option
		act(() => ref.navigate!("/c"));
		expect(scrolled()).toEqual(AT_TOP);
		scrollDown();
		act(() => ref.navigate!("/d", { preventScrollReset: true }));
		expect(scrolled()).toEqual(KEPT);
		// and on the history itself
		act(() => history.push("/d"));
		expect(scrolled()).toEqual(AT_TOP);
	});

	it("[ISSUE-3475-ITEM-20] keeps the scroll positions when a blocker holds a navigation with preventScrollReset back and lets it go ahead", () => {
		const history = mem("/form");
		const { ref } = renderRouter(history);
		scrollDown();
		// the unsaved-changes guard, where the user confirms leaving
		let transition: Transition | null = null;
		const unblock = history.block((tx) => (transition = tx));
		act(() => ref.navigate!("/form/tab", { preventScrollReset: true }));
		expect(transition).not.toBeNull();
		expect(path()).toBe("/form");
		unblock();
		act(() => transition!.retry());
		expect(path()).toBe("/form/tab");
		expect(scrolled()).toEqual(KEPT);
	});

	it("[ISSUE-3475-ITEM-20] resets the scroll for the next navigation elsewhere after a blocker cancelled one with preventScrollReset", () => {
		const history = mem("/form");
		const { ref } = renderRouter(history);
		scrollDown();
		// the unsaved-changes guard, where the user stays
		const unblock = history.block(() => {});
		act(() => ref.navigate!("/form/tab", { preventScrollReset: true }));
		unblock();
		expect(path()).toBe("/form");
		expect(scrolled()).toEqual(KEPT);
		// a navigation the app starts on the history itself, e.g. a list entry
		act(() => history.push("/elsewhere"));
		expect(scrolled()).toEqual(AT_TOP);
	});

	it("[ISSUE-3475-ITEM-20] a Link with preventScrollReset keeps the scroll positions, one without scrolls to the top", () => {
		renderRouter(
			mem("/a"),
			<>
				<Link to="/a/tab" preventScrollReset>
					Tab
				</Link>
				<Link to="/b">Page B</Link>
			</>,
		);
		scrollDown();
		fireEvent.click(screen.getByRole("link", { name: "Tab" }));
		expect(path()).toBe("/a/tab");
		expect(scrolled()).toEqual(KEPT);
		fireEvent.click(screen.getByRole("link", { name: "Page B" }));
		expect(path()).toBe("/b");
		expect(scrolled()).toEqual(AT_TOP);
	});

	it("[ISSUE-3475-ITEM-20] stops resetting a scroll container once the component that registered it unmounts", () => {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const containerRef = { current: container };
		const Register = () => {
			useResetScrollOnNavigation(containerRef);
			return null;
		};
		const history = mem("/a");
		const { rerender } = render(
			<HistoryRouter history={history}>
				<Register />
			</HistoryRouter>,
		);
		container.scrollTop = 200;
		act(() => history.push("/b"));
		expect(container.scrollTop).toBe(0);
		rerender(<HistoryRouter history={history}>{null}</HistoryRouter>);
		container.scrollTop = 200;
		act(() => history.push("/c"));
		expect(container.scrollTop).toBe(200);
		container.remove();
	});

	it("[ISSUE-3475-ITEM-20] useResetScrollOnNavigation does nothing outside a HistoryRouter", () => {
		render(<Pane />);
		expect(pane()).toBeInTheDocument();
	});
});

describe("[ISSUE-3475-ITEM-20] PortalLayout", () => {
	it("[ISSUE-3475-ITEM-20] a navigation scrolls the main pane to the top, a tab switch keeps it", () => {
		const history = mem("/a");
		const ref: { navigate: NavigateFunction | null } = { navigate: null };
		const Content = () => {
			ref.navigate = useNavigate();
			return <ShowPath />;
		};
		render(
			<HistoryRouter history={history}>
				<PortalLayout
					variant="no-top-left"
					headerContent={null}
					menuContent={null}
					content={<Content />}
					mainId="main"
				/>
			</HistoryRouter>,
		);
		const main = document.getElementById("main")!;
		main.scrollTop = 200;
		act(() => ref.navigate!("/a/tab", { preventScrollReset: true }));
		expect(main.scrollTop).toBe(200);
		act(() => ref.navigate!("/b"));
		expect(path()).toBe("/b");
		expect(main.scrollTop).toBe(0);
	});
});
