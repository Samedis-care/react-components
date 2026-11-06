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
import type { DocumentTitleFormatter } from "../../src/standalone/Routes/PageTitle";
import { Framework } from "../../src/framework";
import ccI18n from "../../src/i18n";

// The document title: Route's title prop, usePageTitle and HistoryRouter's
// formatDocumentTitle. The app title is the document's title when the router
// mounts (the <title> of the app's index.html).

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
const Blank = () => <div />;

describe("page titles", () => {
	it("[ISSUE-3475-ITEM-23] names the document after the deepest matched route and follows navigation", () => {
		const history = mem("/devices/7");
		render(
			<HistoryRouter history={history}>
				<Routes>
					{[
						<Route
							key="devices"
							path="/devices/*"
							title="Devices"
							element={
								<Routes>
									{[
										<Route
											key="id"
											path=":id"
											title="Device"
											element={<Blank />}
										/>,
										<Route key="rest" path="*" element={<Blank />} />,
									]}
								</Routes>
							}
						/>,
						<Route key="help" path="/help" element={<Blank />} />,
						<Route
							key="not-found"
							path="*"
							title="Not found"
							element={<Blank />}
						/>,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(document.title).toBe("Device – Test App");
		act(() => history.push("/devices"));
		expect(document.title).toBe("Devices – Test App");
		// a route without a title: no page title left, the app title alone
		act(() => history.push("/help"));
		expect(document.title).toBe("Test App");
		act(() => history.push("/nowhere"));
		expect(document.title).toBe("Not found – Test App");
	});

	it("[ISSUE-3475-ITEM-23] usePageTitle names the page within its route and gives way to a nested route's title", () => {
		let setName: (name: string | null) => void = () => {};
		const RecordPage = () => {
			const [name, set] = useState<string | null>("Infusion pump 7");
			setName = set;
			usePageTitle(name);
			return (
				<Routes>
					{[<Route key="edit" path="edit" title="Edit" element={<Blank />} />]}
				</Routes>
			);
		};
		const history = mem("/devices/7");
		render(
			<HistoryRouter history={history}>
				<Routes>
					{[
						<Route
							key="device"
							path="/devices/:id/*"
							title="Device"
							element={<RecordPage />}
						/>,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(document.title).toBe("Infusion pump 7 – Test App");
		// e.g. reloading: null sets nothing, the route's title applies
		act(() => setName(null));
		expect(document.title).toBe("Device – Test App");
		act(() => setName("Infusion pump 7"));
		expect(document.title).toBe("Infusion pump 7 – Test App");
		act(() => history.push("/devices/7/edit"));
		expect(document.title).toBe("Edit – Test App");
		act(() => history.push("/devices/7"));
		expect(document.title).toBe("Infusion pump 7 – Test App");
		act(() => setName(""));
		expect(document.title).toBe("Device – Test App");
	});

	it("[ISSUE-3475-ITEM-23] between equally specific titles the one set last wins", () => {
		let setSecond: (title: string | null) => void = () => {};
		const First = () => {
			usePageTitle("First");
			return null;
		};
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
							<First />
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

	it("[ISSUE-3475-ITEM-23] a standalone Route sets its title only while it matches", () => {
		const history = mem("/a");
		render(
			<HistoryRouter history={history}>
				<Route path="/b" title="B" element={<Blank />} />
			</HistoryRouter>,
		);
		expect(document.title).toBe("Test App");
		act(() => history.push("/b"));
		expect(document.title).toBe("B – Test App");
		act(() => history.push("/a"));
		expect(document.title).toBe("Test App");
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
						<Route key="a" path="/a" element={<Blank />} />,
						<Route key="c" path="/c" element={<Blank />} />,
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
				<Route path="/b" title="B" element={<Blank />} />
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
				<HistoryRouter history={history}>
					<Routes>
						{[
							<Route
								key="devices"
								path="/devices/*"
								title="Devices"
								element={
									<Routes>
										{[
											<Route
												key="id"
												path=":id"
												title="Device"
												element={<Blank />}
											/>,
										]}
									</Routes>
								}
							/>,
						]}
					</Routes>
				</HistoryRouter>
			</StrictMode>,
		);
		expect(document.title).toBe("Device – Test App");
		act(() => history.push("/devices"));
		expect(document.title).toBe("Devices – Test App");
		unmount();
		expect(document.title).toBe("Test App");
	});

	it("[ISSUE-3475-ITEM-23] builds the title with formatDocumentTitle and follows a changed formatter and title", () => {
		const history = mem("/devices/7");
		const Shell = (props: {
			format?: DocumentTitleFormatter;
			title: string;
		}) => (
			<HistoryRouter history={history} formatDocumentTitle={props.format}>
				<Routes>
					{[
						<Route
							key="devices"
							path="/devices/*"
							title={props.title}
							element={
								<Routes>
									{[
										<Route key="id" path=":id" title="7" element={<Blank />} />,
									]}
								</Routes>
							}
						/>,
					]}
				</Routes>
			</HistoryRouter>
		);
		// most specific first, so a breadcrumb is the reversed list
		const crumbs: DocumentTitleFormatter = (titles, appTitle) =>
			[appTitle, ...[...titles].reverse()].join(" › ");
		const { rerender } = render(<Shell format={crumbs} title="Devices" />);
		expect(document.title).toBe("Test App › Devices › 7");
		// e.g. a language switch
		rerender(<Shell format={crumbs} title="Geräte" />);
		expect(document.title).toBe("Test App › Geräte › 7");
		// back to the default
		rerender(<Shell title="Geräte" />);
		expect(document.title).toBe("7 – Test App");
		// called with an empty list when the last page title goes away
		const seen: string[][] = [];
		rerender(
			<Shell
				format={(titles, appTitle) => {
					seen.push([...titles]);
					return titles.length ? titles.join(", ") : `${appTitle} (home)`;
				}}
				title="Geräte"
			/>,
		);
		expect(document.title).toBe("7, Geräte");
		act(() => history.push("/elsewhere"));
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
				<Route path="/a" title={props.title} element={<Blank />} />
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
		const Step = () => {
			usePageTitle("Step 2");
			return null;
		};
		const { unmount } = render(
			<HistoryRouter
				history={mem("/wizard")}
				formatDocumentTitle={(titles, appTitle) =>
					[...titles, appTitle].join(" / ")
				}
			>
				<Routes>
					{[
						<Route
							key="wizard"
							path="/wizard/*"
							title="Wizard"
							element={
								<HistoryRouter
									history={mem("/step2")}
									formatDocumentTitle={() => "ignored"}
								>
									<Step />
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

	it("[ISSUE-3475-ITEM-23] usePageTitle does nothing outside a HistoryRouter", () => {
		const Page = () => {
			usePageTitle("Lost");
			return <div>page</div>;
		};
		render(<Page />);
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
				<Route path="*" title="Home" element={<div>home page</div>} />
			</Framework>,
		);
		await screen.findByText("home page");
		expect(document.title).toBe("Test App: Home");
	});
});
