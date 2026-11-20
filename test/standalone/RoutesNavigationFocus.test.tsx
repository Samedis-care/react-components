import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React, { useEffect, useState } from "react";
import { render, act, cleanup, fireEvent } from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import usePageTitle from "../../src/standalone/Routes/usePageTitle";
import useParams from "../../src/standalone/Routes/useParams";

// HistoryRouter announces the new page title after a push or back/forward
// navigation in a polite live region. jsdom has no layout, so the focus part
// (which needs to know what is in view) is covered by the stories in
// Routes.stories.tsx and PageTitle.stories.tsx.

const initialTitle = document.title;
beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	document.title = initialTitle;
});

const mem = (path: string) => createMemoryHistory({ initialEntries: [path] });

const TitledPage = (props: { title: string }) => {
	usePageTitle(props.title);
	return <p>{props.title}</p>;
};

/** finishes loading the record of a page rendered by LoadingPage, by its id */
const loaders = new Map<string, () => void>();

/** A page that sets its title "Record <id>" once the test loads its record */
const LoadingPage = () => {
	const { id } = useParams<"id">();
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		loaders.set(id ?? "", () => setLoaded(true));
	}, [id]);
	usePageTitle(loaded ? `Record ${id}` : null);
	return <p>{loaded ? `Record ${id}` : "Loading"}</p>;
};

const renderPages = (history: MemoryHistory) =>
	render(
		<HistoryRouter history={history}>
			<Routes>
				{[
					<Route key="a" path="/a" element={<TitledPage title="Page A" />} />,
					<Route key="b" path="/b" element={<TitledPage title="Page B" />} />,
					<Route
						key="same"
						path="/same/:n"
						element={<TitledPage title="Same title" />}
					/>,
					<Route key="untitled" path="/untitled" element={<p>Untitled</p>} />,
					<Route key="records" path="/records/:id" element={<LoadingPage />} />,
				]}
			</Routes>
		</HistoryRouter>,
	);

/** the router's live region */
const liveRegion = (container: HTMLElement): HTMLElement => {
	const region = container.querySelector<HTMLElement>("[aria-live]");
	if (!region) throw new Error("no live region");
	return region;
};

/** lets the announcement delay pass */
const settle = () =>
	act(() => {
		vi.advanceTimersByTime(500);
	});

describe("HistoryRouter: announcing the new page", () => {
	it("[ISSUE-3475-ITEM-22] renders an empty polite live region", () => {
		const { container } = renderPages(mem("/a"));
		const region = liveRegion(container);
		expect(region).toHaveAttribute("aria-live", "polite");
		expect(region).toHaveAttribute("aria-atomic", "true");
		expect(region).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3475-ITEM-22] announces the page title after a push and after back/forward", () => {
		const history = mem("/a");
		const { container } = renderPages(history);
		act(() => history.push("/b"));
		settle();
		expect(liveRegion(container)).toHaveTextContent(/^Page B$/);
		act(() => history.back());
		settle();
		expect(liveRegion(container)).toHaveTextContent(/^Page A$/);
		act(() => history.forward());
		settle();
		expect(liveRegion(container)).toHaveTextContent(/^Page B$/);
	});

	it("[ISSUE-3475-ITEM-22] announces nothing after a replace", () => {
		const history = mem("/a");
		const { container } = renderPages(history);
		act(() => history.replace("/b"));
		settle();
		expect(container).toHaveTextContent("Page B");
		expect(liveRegion(container)).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3475-ITEM-22] announces nothing for a navigation made while the router mounts", () => {
		const history = mem("/start");
		const Redirect = () => {
			useEffect(() => {
				history.push("/b");
			}, []);
			return null;
		};
		const { container } = render(
			<HistoryRouter history={history}>
				<Routes>
					{[
						<Route key="start" path="/start" element={<Redirect />} />,
						<Route key="b" path="/b" element={<TitledPage title="Page B" />} />,
					]}
				</Routes>
			</HistoryRouter>,
		);
		settle();
		expect(container).toHaveTextContent("Page B");
		expect(liveRegion(container)).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3475-ITEM-22] announces nothing when the page title stays the same", () => {
		const history = mem("/same/1");
		const { container } = renderPages(history);
		act(() => history.push("/same/2"));
		settle();
		expect(liveRegion(container)).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3475-ITEM-22] clears the previous announcement on the next navigation", () => {
		const history = mem("/a");
		const { container } = renderPages(history);
		act(() => history.push("/b"));
		settle();
		expect(liveRegion(container)).toHaveTextContent(/^Page B$/);
		act(() => history.push("/untitled"));
		settle();
		expect(container).toHaveTextContent("Untitled");
		expect(liveRegion(container)).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3475-ITEM-22] announces a title the new page sets later, once it is set", () => {
		const history = mem("/a");
		const { container } = renderPages(history);
		act(() => history.push("/records/7"));
		settle();
		expect(liveRegion(container)).toHaveTextContent(/^$/);
		act(() => loaders.get("7")?.());
		settle();
		expect(liveRegion(container)).toHaveTextContent(/^Record 7$/);
	});

	it("[ISSUE-3475-ITEM-22] drops the announcement when the user types or clicks before the title is set", () => {
		const history = mem("/a");
		const { container } = renderPages(history);
		act(() => history.push("/records/8"));
		fireEvent.keyDown(document.body, { key: "Tab" });
		act(() => loaders.get("8")?.());
		settle();
		expect(container).toHaveTextContent("Record 8");
		expect(liveRegion(container)).toHaveTextContent(/^$/);

		act(() => history.push("/records/9"));
		fireEvent.pointerDown(document.body);
		act(() => loaders.get("9")?.());
		settle();
		expect(container).toHaveTextContent("Record 9");
		expect(liveRegion(container)).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3475-ITEM-22] leaves no timer behind when it unmounts while waiting", () => {
		const history = mem("/a");
		const { unmount } = renderPages(history);
		act(() => history.push("/b"));
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
