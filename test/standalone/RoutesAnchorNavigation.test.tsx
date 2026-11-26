import {
	describe,
	it,
	expect,
	vi,
	afterEach,
	beforeEach,
	type Mock,
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
import { createMemoryHistory, MemoryHistory } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import Link from "../../src/standalone/Routes/Link";
import useLocation from "../../src/standalone/Routes/useLocation";
import useNavigate, {
	NavigateFunction,
} from "../../src/standalone/Routes/useNavigate";
import useResetScrollOnNavigation from "../../src/standalone/Routes/useResetScrollOnNavigation";

// A navigation to a hash scrolls the element with that id into view and moves
// the focus to it, as a link to a fragment does in a browser. jsdom has no
// layout: the tests record the scrollIntoView calls and read back the scroll
// positions they set; Routes.stories.tsx checks the real scrolling.

let scrollTo: MockInstance<Window["scrollTo"]>;
let scrollIntoView: Mock<(arg?: boolean | ScrollIntoViewOptions) => void>;
beforeEach(() => {
	// jsdom implements neither
	scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
	scrollIntoView = vi.fn();
	Object.defineProperty(Element.prototype, "scrollIntoView", {
		configurable: true,
		writable: true,
		value: scrollIntoView,
	});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	delete (Element.prototype as Partial<Element>).scrollIntoView;
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

const ShowLocation = () => {
	const { pathname, hash } = useLocation();
	return <div data-testid="location">{pathname + hash}</div>;
};

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
			<ShowLocation />
			<Pane>{content}</Pane>
		</HistoryRouter>,
	);
	return { ...result, ref };
};

const pane = () => screen.getByTestId("pane");
const shownLocation = () => screen.getByTestId("location").textContent;

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

/** the elements scrollIntoView was called on, with its options */
const scrolledIntoView = () =>
	scrollIntoView.mock.contexts.map((element, i) => [
		(element as Element).id,
		scrollIntoView.mock.calls[i][0],
	]);
/** scrollIntoView as a browser scrolls to the target of a fragment */
const FRAGMENT_SCROLL = { block: "start", inline: "nearest" };

/** a page with a skip link above a section that is not focusable by itself */
const SkipLinkPage = () => (
	<>
		<Link to="#details">Skip to details</Link>
		<section id="details">
			<h2>Details</h2>
		</section>
	</>
);

describe("[ISSUE-3475-ITEM-24] navigation to an anchor of the page", () => {
	it("[ISSUE-3475-ITEM-24] a link to a hash of the page scrolls its element into view instead of to the top", () => {
		renderRouter(mem("/page"), <SkipLinkPage />);
		scrollDown();
		fireEvent.click(screen.getByRole("link", { name: "Skip to details" }));
		expect(shownLocation()).toBe("/page#details");
		expect(scrolledIntoView()).toEqual([["details", FRAGMENT_SCROLL]]);
		expect(scrolled()).toEqual(KEPT);
	});

	it("[ISSUE-3475-ITEM-24] the element gets the focus; one that is not focusable gets tabindex -1 for it", () => {
		renderRouter(mem("/page"), <SkipLinkPage />);
		const link = screen.getByRole("link", { name: "Skip to details" });
		link.focus();
		fireEvent.click(link);
		const target = document.getElementById("details")!;
		expect(document.activeElement).toBe(target);
		expect(target).toHaveAttribute("tabindex", "-1");
	});

	it("[ISSUE-3475-ITEM-24] a focusable element gets the focus as it is, without a tabindex", () => {
		const { ref } = renderRouter(
			mem("/page"),
			<>
				<button id="save">Save</button>
				<a id="help" href="/help">
					Help
				</a>
				<div id="notes" tabIndex={0}>
					Notes
				</div>
			</>,
		);
		act(() => ref.navigate!("#save"));
		expect(document.activeElement).toBe(screen.getByRole("button"));
		expect(screen.getByRole("button")).not.toHaveAttribute("tabindex");
		act(() => ref.navigate!("#help"));
		expect(document.activeElement).toBe(screen.getByRole("link"));
		expect(screen.getByRole("link")).not.toHaveAttribute("tabindex");
		act(() => ref.navigate!("#notes"));
		expect(document.activeElement).toBe(document.getElementById("notes"));
		expect(document.getElementById("notes")).toHaveAttribute("tabindex", "0");
	});

	it("[ISSUE-3475-ITEM-24] an element that cannot take the focus is scrolled to, keeps its attributes and leaves the focus where it is", () => {
		const { ref } = renderRouter(
			mem("/page"),
			<>
				<button>Start</button>
				<button id="send" disabled>
					Send
				</button>
			</>,
		);
		const start = screen.getByRole("button", { name: "Start" });
		start.focus();
		act(() => ref.navigate!("#send"));
		expect(scrolledIntoView()).toEqual([["send", FRAGMENT_SCROLL]]);
		expect(document.activeElement).toBe(start);
		expect(screen.getByRole("button", { name: "Send" })).not.toHaveAttribute(
			"tabindex",
		);
	});

	it("[ISSUE-3475-ITEM-24] a second click on the link scrolls to the element again", () => {
		const history = mem("/page");
		renderRouter(history, <SkipLinkPage />);
		const link = screen.getByRole("link", { name: "Skip to details" });
		fireEvent.click(link);
		link.focus();
		scrollIntoView.mockClear();
		fireEvent.click(link);
		// the link leads to the current location: it replaces the entry
		expect(history.index).toBe(1);
		expect(scrolledIntoView()).toEqual([["details", FRAGMENT_SCROLL]]);
		expect(document.activeElement).toBe(document.getElementById("details"));
	});

	it("[ISSUE-3475-ITEM-24] a hash of the page that names no element leaves the page where it is and the focus on the link", () => {
		renderRouter(mem("/page"), <Link to="#nowhere">Nowhere</Link>);
		scrollDown();
		const link = screen.getByRole("link", { name: "Nowhere" });
		link.focus();
		fireEvent.click(link);
		expect(shownLocation()).toBe("/page#nowhere");
		expect(scrolledIntoView()).toEqual([]);
		expect(scrolled()).toEqual(KEPT);
		expect(document.activeElement).toBe(link);
	});

	it.each(["#top", "#TOP"])(
		"[ISSUE-3475-ITEM-24] %s scrolls the page to the top when no element has that id",
		(hash) => {
			const { ref } = renderRouter(mem("/page#details"), <SkipLinkPage />);
			scrollDown();
			act(() => ref.navigate!(hash));
			expect(scrolled()).toEqual(AT_TOP);
			expect(scrolledIntoView()).toEqual([]);
		},
	);

	it("[ISSUE-3475-ITEM-24] #top scrolls to the element with the id top when there is one", () => {
		const { ref } = renderRouter(mem("/page"), <div id="top">Top</div>);
		scrollDown();
		act(() => ref.navigate!("#top"));
		expect(scrolledIntoView()).toEqual([["top", FRAGMENT_SCROLL]]);
		expect(scrolled()).toEqual(KEPT);
	});

	it("[ISSUE-3475-ITEM-24] finds the element of a percent-encoded hash, and a hash that is not valid percent-encoding by its text", () => {
		const { ref } = renderRouter(
			mem("/page"),
			<>
				<div id="über">Über</div>
				<div id="100%">Full</div>
			</>,
		);
		// a browser history keeps the hash encoded
		act(() => ref.navigate!("#%C3%BCber"));
		act(() => ref.navigate!("#100%"));
		expect(scrolledIntoView()).toEqual([
			["über", FRAGMENT_SCROLL],
			["100%", FRAGMENT_SCROLL],
		]);
	});

	it("[ISSUE-3475-ITEM-24] a location object with a hash without # scrolls to its element", () => {
		const { ref } = renderRouter(mem("/page"), <SkipLinkPage />);
		act(() => ref.navigate!({ hash: "details" }));
		expect(scrolledIntoView()).toEqual([["details", FRAGMENT_SCROLL]]);
	});

	it("[ISSUE-3475-ITEM-24] a navigation to another page with a hash scrolls to the top, then to the element on the new page", () => {
		const history = mem("/list");
		renderRouter(
			history,
			<Routes>
				{[
					<Route key="list" path="/list" element={<p>List</p>} />,
					<Route
						key="record"
						path="/record"
						element={<section id="notes">Notes</section>}
					/>,
				]}
			</Routes>,
		);
		scrollDown();
		act(() => history.push("/record#notes"));
		expect(scrolled()).toEqual(AT_TOP);
		expect(scrolledIntoView()).toEqual([["notes", FRAGMENT_SCROLL]]);
		expect(document.activeElement).toBe(document.getElementById("notes"));
	});

	it("[ISSUE-3475-ITEM-24] the element has the focus before the router checks where it is, so the page heading does not take it", () => {
		// a layout in which every element is rendered and in view
		vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
			new DOMRect(10, 10, 10, 10),
		] as unknown as DOMRectList);
		vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(
			new DOMRect(10, 10, 10, 10),
		);
		renderRouter(
			mem("/list"),
			<Routes>
				{[
					<Route
						key="list"
						path="/list"
						element={<Link to="/record#notes">Notes of the record</Link>}
					/>,
					<Route
						key="record"
						path="/record"
						element={
							<main>
								<h1>Record</h1>
								<section id="notes">Notes</section>
							</main>
						}
					/>,
				]}
			</Routes>,
		);
		const link = screen.getByRole("link", { name: "Notes of the record" });
		link.focus();
		// the link is part of the page the navigation replaces
		fireEvent.click(link);
		expect(document.activeElement).toBe(document.getElementById("notes"));
		expect(screen.getByRole("heading", { name: "Record" })).not.toHaveAttribute(
			"tabindex",
		);
	});

	it.each(["/other#nowhere", "/page?tab=2#details"])(
		"[ISSUE-3475-ITEM-24] a navigation to %s, another page, scrolls to the top when the hash names no element there",
		(to) => {
			const { ref } = renderRouter(mem("/page"));
			scrollDown();
			act(() => ref.navigate!(to));
			expect(scrolled()).toEqual(AT_TOP);
			expect(scrolledIntoView()).toEqual([]);
		},
	);

	it("[ISSUE-3475-ITEM-24] a navigation to the page without a hash scrolls to the top", () => {
		const { ref } = renderRouter(mem("/page#details"), <SkipLinkPage />);
		scrollDown();
		act(() => ref.navigate!("/page"));
		expect(scrolled()).toEqual(AT_TOP);
		expect(scrolledIntoView()).toEqual([]);
	});

	it.each([false, true])(
		"[ISSUE-3475-ITEM-24] preventScrollReset scrolls to no element and leaves the focus (other page: %s)",
		(otherPage) => {
			const { ref } = renderRouter(mem("/page"), <SkipLinkPage />);
			scrollDown();
			const link = screen.getByRole("link", { name: "Skip to details" });
			link.focus();
			act(() =>
				ref.navigate!(otherPage ? "/page/tab#details" : "#details", {
					preventScrollReset: true,
				}),
			);
			expect(scrolledIntoView()).toEqual([]);
			expect(scrolled()).toEqual(KEPT);
			expect(document.activeElement).toBe(link);
		},
	);

	it("[ISSUE-3475-ITEM-24] back and forward to an entry with a hash leave the scrolling to the browser", () => {
		const history = mem("/page");
		renderRouter(history, <SkipLinkPage />);
		act(() => history.push("#details"));
		act(() => history.push("/page"));
		scrollDown();
		scrollIntoView.mockClear();
		act(() => history.back());
		expect(shownLocation()).toBe("/page#details");
		act(() => history.forward());
		act(() => history.back());
		expect(scrolledIntoView()).toEqual([]);
		expect(scrolled()).toEqual(KEPT);
	});

	it("[ISSUE-3475-ITEM-24] only the last of two navigations before a render counts", () => {
		const history = mem("/page");
		renderRouter(history, <SkipLinkPage />);
		scrollDown();
		act(() => {
			history.push("#details");
			history.push("/other");
		});
		expect(shownLocation()).toBe("/other");
		expect(scrolledIntoView()).toEqual([]);
		expect(scrolled()).toEqual(AT_TOP);
	});

	it("[ISSUE-3475-ITEM-24] compares the page as the URL parser reads it", () => {
		// a memory history keeps the path as pushed
		const { ref } = renderRouter(mem("/über"), <SkipLinkPage />);
		scrollDown();
		act(() => ref.navigate!("/%C3%BCber#nowhere"));
		expect(scrolled()).toEqual(KEPT);
	});
});
