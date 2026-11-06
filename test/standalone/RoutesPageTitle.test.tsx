import {
	describe,
	it,
	expect,
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	vi,
} from "vitest";
import React, { StrictMode, useState } from "react";
import { render, act, cleanup, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import usePageTitle from "../../src/standalone/Routes/usePageTitle";
import type { DocumentTitleFormatter } from "../../src/standalone/Routes/DocumentTitle";
import { Framework } from "../../src/framework";
import ccI18n from "../../src/i18n";

// The document title: usePageTitle and HistoryRouter's formatDocumentTitle.
// The app title is the document's title when the router mounts (the <title>
// of the app's index.html).

const APP = "Test App";
const initialTitle = document.title;
beforeEach(() => {
	document.title = APP;
});
afterEach(() => {
	cleanup();
});
afterAll(() => {
	document.title = initialTitle;
});

const mem = (path: string) => createMemoryHistory({ initialEntries: [path] });

/** A page that names itself */
const Titled = (props: {
	title: string | null;
	children?: React.ReactNode;
}) => {
	usePageTitle(props.title);
	return <>{props.children}</>;
};

/** A list page under /devices/* with a record page routed below it */
const devicesRoutes = (listTitle = "Devices", recordTitle = "Device 7") => (
	<Routes>
		{[
			<Route
				key="devices"
				path="/devices/*"
				element={
					<Titled title={listTitle}>
						<Routes>
							{[
								<Route
									key="id"
									path=":id"
									element={<Titled title={recordTitle} />}
								/>,
							]}
						</Routes>
					</Titled>
				}
			/>,
			<Route key="help" path="/help" element={<div />} />,
		]}
	</Routes>
);

describe("usePageTitle", () => {
	it("[ISSUE-3475-ITEM-23] names the document after the title set in the deepest route, and follows navigation", () => {
		const history = mem("/devices/7");
		render(<HistoryRouter history={history}>{devicesRoutes()}</HistoryRouter>);
		expect(document.title).toBe("Device 7 – Test App");
		act(() => history.push("/devices"));
		expect(document.title).toBe("Devices – Test App");
		// a page without a title: the app title alone
		act(() => history.push("/help"));
		expect(document.title).toBe("Test App");
		act(() => history.push("/devices/7"));
		expect(document.title).toBe("Device 7 – Test App");
	});

	it("[ISSUE-3475-ITEM-23] a deeper title wins whatever the mount order", () => {
		// the record page's title is set first, the list's later (e.g. after loading)
		let setList: (title: string | null) => void = () => {};
		const List = (props: { children: React.ReactNode }) => {
			const [title, set] = useState<string | null>(null);
			setList = set;
			usePageTitle(title);
			return <>{props.children}</>;
		};
		render(
			<HistoryRouter history={mem("/devices/7")}>
				<Routes>
					{[
						<Route
							key="devices"
							path="/devices/*"
							element={
								<List>
									<Routes>
										{[
											<Route
												key="id"
												path=":id"
												element={<Titled title="Device 7" />}
											/>,
										]}
									</Routes>
								</List>
							}
						/>,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(document.title).toBe("Device 7 – Test App");
		act(() => setList("Devices"));
		expect(document.title).toBe("Device 7 – Test App");
	});

	it("[ISSUE-3475-ITEM-23] follows a changed title, and null or empty sets none", () => {
		let setName: (name: string | null) => void = () => {};
		const Record = () => {
			const [name, set] = useState<string | null>(null);
			setName = set;
			usePageTitle(name);
			return null;
		};
		render(
			<HistoryRouter history={mem("/devices/7")}>
				<Routes>
					{[
						<Route
							key="devices"
							path="/devices/*"
							element={
								<Titled title="Devices">
									<Routes>
										{[<Route key="id" path=":id" element={<Record />} />]}
									</Routes>
								</Titled>
							}
						/>,
					]}
				</Routes>
			</HistoryRouter>,
		);
		// still loading: the list's title applies
		expect(document.title).toBe("Devices – Test App");
		act(() => setName("Infusion pump 7"));
		expect(document.title).toBe("Infusion pump 7 – Test App");
		act(() => setName("Infusionspumpe 7"));
		expect(document.title).toBe("Infusionspumpe 7 – Test App");
		act(() => setName(""));
		expect(document.title).toBe("Devices – Test App");
	});

	it("[ISSUE-3475-ITEM-23] between titles in the same route the one set last wins", () => {
		let setSecond: (title: string | null) => void = () => {};
		const Second = () => {
			const [title, set] = useState<string | null>(null);
			setSecond = set;
			usePageTitle(title);
			return null;
		};
		render(
			<HistoryRouter history={mem("/a")}>
				<Route
					path="/a"
					element={
						<>
							<Titled title="First" />
							<Second />
						</>
					}
				/>
			</HistoryRouter>,
		);
		expect(document.title).toBe("First – Test App");
		act(() => setSecond("Second"));
		expect(document.title).toBe("Second – Test App");
		act(() => setSecond(null));
		expect(document.title).toBe("First – Test App");
	});

	it("[ISSUE-3475-ITEM-23] leaves the document title alone while no page title is set", () => {
		const history = mem("/a");
		render(
			<HistoryRouter
				history={history}
				formatDocumentTitle={(titles, appTitle) => `${appTitle} (formatted)`}
			>
				<Routes>
					{[
						<Route key="a" path="/a" element={<Titled title={null} />} />,
						<Route key="c" path="/c" element={<div />} />,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(document.title).toBe("Test App");
		// e.g. the app shows a count in the title
		document.title = "(3) Test App";
		act(() => history.push("/c"));
		expect(document.title).toBe("(3) Test App");
	});

	it("[ISSUE-3475-ITEM-23] restores the app title when the router unmounts", () => {
		const { unmount } = render(
			<HistoryRouter history={mem("/b")}>
				<Titled title="B" />
			</HistoryRouter>,
		);
		expect(document.title).toBe("B – Test App");
		unmount();
		expect(document.title).toBe("Test App");
	});

	it("[ISSUE-3475-ITEM-23] sets the title under StrictMode", () => {
		const history = mem("/devices/7");
		const { unmount } = render(
			<StrictMode>
				<HistoryRouter history={history}>{devicesRoutes()}</HistoryRouter>
			</StrictMode>,
		);
		expect(document.title).toBe("Device 7 – Test App");
		act(() => history.push("/devices"));
		expect(document.title).toBe("Devices – Test App");
		unmount();
		expect(document.title).toBe("Test App");
	});

	it("[ISSUE-3475-ITEM-23] usePageTitle does nothing outside a HistoryRouter", () => {
		render(<Titled title="Lost" />);
		expect(document.title).toBe("Test App");
	});
});

describe("formatDocumentTitle", () => {
	it("[ISSUE-3475-ITEM-23] builds the title from the page titles, most specific first, and follows a changed formatter", () => {
		const history = mem("/devices/7");
		const Shell = (props: {
			format?: DocumentTitleFormatter;
			listTitle: string;
		}) => (
			<HistoryRouter history={history} formatDocumentTitle={props.format}>
				{devicesRoutes(props.listTitle, "7")}
			</HistoryRouter>
		);
		// most specific first, so a breadcrumb is the reversed list
		const crumbs: DocumentTitleFormatter = (titles, appTitle) =>
			[appTitle, ...[...titles].reverse()].join(" › ");
		const { rerender } = render(<Shell format={crumbs} listTitle="Devices" />);
		expect(document.title).toBe("Test App › Devices › 7");
		// e.g. a language switch
		rerender(<Shell format={crumbs} listTitle="Geräte" />);
		expect(document.title).toBe("Test App › Geräte › 7");
		// back to the default
		rerender(<Shell listTitle="Geräte" />);
		expect(document.title).toBe("7 – Test App");
		// called with an empty list when the last page title goes away
		const seen: string[][] = [];
		rerender(
			<Shell
				format={(titles, appTitle) => {
					seen.push([...titles]);
					return titles.length ? titles.join(", ") : `${appTitle} (home)`;
				}}
				listTitle="Geräte"
			/>,
		);
		expect(document.title).toBe("7, Geräte");
		act(() => history.push("/help"));
		expect(document.title).toBe("Test App (home)");
		expect(seen.at(-1)).toEqual([]);
	});

	it("[ISSUE-3475-ITEM-23] never calls a replaced formatDocumentTitle, and applies a new one also without page titles", () => {
		const history = mem("/a");
		const Shell = (props: {
			format: DocumentTitleFormatter;
			title: string;
		}) => (
			<HistoryRouter history={history} formatDocumentTitle={props.format}>
				<Route path="/a" element={<Titled title={props.title} />} />
			</HistoryRouter>
		);
		const first = vi.fn<DocumentTitleFormatter>(
			(titles) => `first: [${titles.join()}]`,
		);
		const second: DocumentTitleFormatter = (titles, appTitle) =>
			`second: ${titles.join() || appTitle}`;
		const { rerender } = render(<Shell format={first} title="A" />);
		expect(document.title).toBe("first: [A]");
		first.mockClear();
		// formatter and title change in the same render
		rerender(<Shell format={second} title="B" />);
		expect(document.title).toBe("second: B");
		expect(first).not.toHaveBeenCalled();
		act(() => history.push("/z"));
		expect(document.title).toBe("second: Test App");
		rerender(<Shell format={first} title="B" />);
		expect(document.title).toBe("first: []");
	});

	it("[ISSUE-3475-ITEM-23] a HistoryRouter inside another one hands its titles to the outer one", () => {
		const { unmount } = render(
			<HistoryRouter
				history={mem("/wizard")}
				formatDocumentTitle={(titles, appTitle) =>
					[...titles, appTitle].join(" / ")
				}
			>
				<Titled title="Wizard" />
				<Routes>
					{[
						<Route
							key="wizard"
							path="/wizard/*"
							element={
								<HistoryRouter
									history={mem("/step2")}
									formatDocumentTitle={() => "ignored"}
								>
									<Titled title="Step 2" />
								</HistoryRouter>
							}
						/>,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(document.title).toBe("Step 2 / Wizard / Test App");
		unmount();
		expect(document.title).toBe("Test App");
	});
});

describe("Framework", () => {
	const initialLanguage = ccI18n.language;
	// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
	beforeAll(async () => {
		if (!window.matchMedia) {
			window.matchMedia = (query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: () => {},
				removeListener: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false,
			});
		}
		await ccI18n.init();
		await ccI18n.changeLanguage("en-US");
	});
	afterAll(async () => {
		await ccI18n.changeLanguage(initialLanguage);
	});

	it("[ISSUE-3475-ITEM-23] passes formatDocumentTitle to its router", async () => {
		render(
			<Framework
				formatDocumentTitle={(titles, appTitle) =>
					`${appTitle}: ${titles.join(", ")}`
				}
			>
				<Titled title="Home">
					<div>home page</div>
				</Titled>
			</Framework>,
		);
		await screen.findByText("home page");
		expect(document.title).toBe("Test App: Home");
	});
});
