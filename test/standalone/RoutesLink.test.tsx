import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import {
	render,
	screen,
	fireEvent,
	act,
	cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	Action,
	createBrowserHistory,
	createMemoryHistory,
	createPath,
	type History,
} from "history";
import {
	Breadcrumbs,
	Button,
	IconButton,
	Link as MuiLink,
	ListItemButton,
	MenuItem,
	MenuList,
	Tab,
	Tabs,
} from "@mui/material";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Link from "../../src/standalone/Routes/Link";
import useLocation from "../../src/standalone/Routes/useLocation";

// Link: what it renders and which clicks it routes. fireEvent.click returns
// false when the default action was prevented, i.e. the click was routed by
// the app instead of loading a document.

beforeEach(() => {
	// useNavigate resets the scroll position; jsdom does not implement scrollTo
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
	// a click that is left to the browser makes jsdom log "Not implemented:
	// navigation to another Document"
	vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const ShowPath = () => <div data-testid="path">{useLocation().pathname}</div>;
const renderedPath = () => screen.getByTestId("path").textContent;

const renderAt = (path: string, ui: React.ReactNode) => {
	const history = createMemoryHistory({ initialEntries: [path] });
	const result = render(
		<HistoryRouter history={history}>
			<ShowPath />
			{ui}
		</HistoryRouter>,
	);
	return { ...result, history };
};

const MODIFIERS = ["ctrlKey", "metaKey", "shiftKey", "altKey"] as const;

/**
 * For each link, click it and check that the href is where the click landed,
 * i.e. that Ctrl-click, middle-click, "copy link address" and a new tab open
 * the same location a plain click navigates to. Going back restores the start
 * location for the next link.
 * @param history The router's history
 * @param names Accessible names of the links to check
 */
const expectHrefsMatchClicks = (
	history: ReturnType<typeof createMemoryHistory>,
	names: string[],
) => {
	for (const name of names) {
		const link = screen.getByRole("link", { name });
		fireEvent.click(link);
		expect(link).toHaveAttribute("href", createPath(history.location));
		act(() => history.back());
	}
};

describe("Link: clicks", () => {
	it("routes a plain click as a push", () => {
		const { history } = renderAt("/", <Link to="/x">go</Link>);
		expect(fireEvent.click(screen.getByRole("link", { name: "go" }))).toBe(
			false,
		);
		expect(history.index).toBe(1);
		expect(renderedPath()).toBe("/x");
	});

	it.each(MODIFIERS)("leaves a click with %s to the browser", (modifier) => {
		const { history } = renderAt("/", <Link to="/x">go</Link>);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "go" }), {
				[modifier]: true,
			}),
		).toBe(true);
		expect(history.index).toBe(0);
		expect(renderedPath()).toBe("/");
	});

	it("replaces the entry with replace and passes state", () => {
		const Show = () => (
			<div data-testid="state">{JSON.stringify(useLocation().state)}</div>
		);
		const { history } = renderAt(
			"/",
			<>
				<Link to="/r" replace state={{ s: 1 }}>
					rep
				</Link>
				<Show />
			</>,
		);
		fireEvent.click(screen.getByRole("link", { name: "rep" }));
		expect(history.index).toBe(0);
		expect(renderedPath()).toBe("/r");
		expect(screen.getByTestId("state")).toHaveTextContent('{"s":1}');
	});

	it("routes when activated with Enter", async () => {
		const user = userEvent.setup();
		renderAt("/", <Link to="/x">go</Link>);
		await user.tab();
		expect(screen.getByRole("link", { name: "go" })).toHaveFocus();
		await user.keyboard("{Enter}");
		expect(renderedPath()).toBe("/x");
	});

	it("routes as the component of MUI's Link", () => {
		const { history } = renderAt(
			"/",
			<MuiLink component={Link} to="/x">
				mui link
			</MuiLink>,
		);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "mui link" })),
		).toBe(false);
		expect(history.index).toBe(1);
		expect(renderedPath()).toBe("/x");
	});

	it("does not route when the consumer's onClick prevents the default", () => {
		// SCF opens a dialog instead of navigating this way, and leaves modified
		// clicks to the href
		const onClick = vi.fn((evt: React.MouseEvent) => {
			if (evt.ctrlKey) return;
			evt.preventDefault();
		});
		const { history } = renderAt(
			"/",
			<MuiLink component={Link} to="/x" onClick={onClick}>
				task
			</MuiLink>,
		);
		const link = screen.getByRole("link", { name: "task" });
		expect(fireEvent.click(link)).toBe(false);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
		expect(onClick).toHaveBeenCalledTimes(2);
		expect(history.index).toBe(0);
		expect(renderedPath()).toBe("/");
	});

	it("leaves a ctrl-click on a MUI Button rendered as Link to the browser", () => {
		const { history } = renderAt(
			"/",
			<Button component={Link} to="/x">
				button link
			</Button>,
		);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "button link" }), {
				ctrlKey: true,
			}),
		).toBe(true);
		expect(history.index).toBe(0);
	});

	it("[ISSUE-3475-ITEM-1] routes a plain click and also calls the consumer's onClick", () => {
		const onClick = vi.fn();
		const { history } = renderAt(
			"/",
			<Link to="/x" onClick={onClick}>
				go
			</Link>,
		);
		const notPrevented = fireEvent.click(
			screen.getByRole("link", { name: "go" }),
		);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(notPrevented).toBe(false);
		expect(history.index).toBe(1);
		expect(renderedPath()).toBe("/x");
	});

	it.each<[string, string, () => React.ReactElement]>([
		[
			"Button",
			"link",
			() => (
				<Button component={Link} to="/x">
					target
				</Button>
			),
		],
		[
			"ListItemButton",
			"link",
			() => (
				<ListItemButton component={Link} to="/x">
					target
				</ListItemButton>
			),
		],
		[
			"MenuItem",
			"menuitem",
			() => (
				<MenuList>
					<MenuItem component={Link} to="/x">
						target
					</MenuItem>
				</MenuList>
			),
		],
		[
			"Tab",
			"tab",
			() => (
				<Tabs value={false}>
					<Tab component={Link} to="/x" label="target" />
				</Tabs>
			),
		],
		[
			"IconButton",
			"link",
			() => (
				<IconButton component={Link} to="/x" aria-label="target">
					<svg />
				</IconButton>
			),
		],
	])(
		"[ISSUE-3475-ITEM-1] routes a plain click on a MUI %s rendered as Link",
		(_name, role, ui) => {
			renderAt("/", ui());
			const link = screen.getByRole(role, { name: "target" });
			expect(link.tagName).toBe("A");
			expect(fireEvent.click(link)).toBe(false);
			expect(renderedPath()).toBe("/x");
		},
	);

	it("[ISSUE-3475-ITEM-1] does not route a click on a disabled MUI Button rendered as Link", () => {
		const { history } = renderAt(
			"/",
			<Button component={Link} to="/x" disabled>
				target
			</Button>,
		);
		// ButtonBase prevents the default of a click on a disabled link
		expect(fireEvent.click(screen.getByRole("link", { name: "target" }))).toBe(
			false,
		);
		expect(history.index).toBe(0);
		expect(renderedPath()).toBe("/");
	});

	it("[ISSUE-3475-ITEM-1] routes a MUI Button rendered as Link once when activated with Enter", async () => {
		const user = userEvent.setup();
		const { history } = renderAt(
			"/",
			<Button component={Link} to="/x">
				target
			</Button>,
		);
		await user.tab();
		expect(screen.getByRole("link", { name: "target" })).toHaveFocus();
		await user.keyboard("{Enter}");
		expect(history.index).toBe(1);
		expect(renderedPath()).toBe("/x");
	});

	it("[ISSUE-3475-ITEM-1] calls the onClick of the latest render", () => {
		const first = vi.fn();
		const second = vi.fn();
		const { history, rerender } = renderAt(
			"/",
			<Link to="/x" onClick={first}>
				go
			</Link>,
		);
		rerender(
			<HistoryRouter history={history}>
				<ShowPath />
				<Link to="/x" onClick={second}>
					go
				</Link>
			</HistoryRouter>,
		);
		fireEvent.click(screen.getByRole("link", { name: "go" }));
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
		expect(renderedPath()).toBe("/x");
	});

	it("[ISSUE-3475-ITEM-8] leaves a click on a link with target or download to the browser", () => {
		const { history } = renderAt(
			"/",
			<>
				<Link to="/x" target="_blank">
					new tab
				</Link>
				<Link to="/report.csv" download>
					download
				</Link>
				<Link to="/y" target="_self">
					same tab
				</Link>
			</>,
		);
		expect(fireEvent.click(screen.getByRole("link", { name: "new tab" }))).toBe(
			true,
		);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "download" })),
		).toBe(true);
		expect(history.index).toBe(0);
		// target="_self" is a normal link
		expect(
			fireEvent.click(screen.getByRole("link", { name: "same tab" })),
		).toBe(false);
		expect(renderedPath()).toBe("/y");
	});

	it("[ISSUE-3475-ITEM-8] leaves a click on a link with a named target or a file name to download to the browser", () => {
		const onClick = vi.fn();
		const { history } = renderAt(
			"/",
			<>
				<Link to="/x" target="report" onClick={onClick}>
					named window
				</Link>
				<Link to="/export" download="devices.csv">
					named download
				</Link>
				<Button component={Link} to="/z" target="_blank">
					button link
				</Button>
			</>,
		);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "named window" })),
		).toBe(true);
		// the consumer's onClick still runs first
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "named download" })),
		).toBe(true);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "button link" })),
		).toBe(true);
		expect(history.index).toBe(0);
		expect(renderedPath()).toBe("/");
	});

	it("[ISSUE-3475-ITEM-8] routes a link whose target is empty or _self in any case, or whose download is false", () => {
		const { history } = renderAt(
			"/",
			<>
				<Link to="/a" target="">
					empty target
				</Link>
				<Link to="/b" target="_SELF">
					upper case self
				</Link>
				<Link to="/c" download={false}>
					no download
				</Link>
			</>,
		);
		expect(
			fireEvent.click(screen.getByRole("link", { name: "empty target" })),
		).toBe(false);
		expect(renderedPath()).toBe("/a");
		expect(
			fireEvent.click(screen.getByRole("link", { name: "upper case self" })),
		).toBe(false);
		expect(renderedPath()).toBe("/b");
		expect(
			fireEvent.click(screen.getByRole("link", { name: "no download" })),
		).toBe(false);
		expect(renderedPath()).toBe("/c");
		expect(history.index).toBe(3);
	});

	it("[ISSUE-3475-ITEM-8] follows a target that changes after mount", () => {
		const { history, rerender } = renderAt(
			"/",
			<Link to="/x" target="_blank">
				go
			</Link>,
		);
		const link = screen.getByRole("link", { name: "go" });
		expect(fireEvent.click(link)).toBe(true);
		rerender(
			<HistoryRouter history={history}>
				<ShowPath />
				<Link to="/x">go</Link>
			</HistoryRouter>,
		);
		expect(fireEvent.click(link)).toBe(false);
		expect(renderedPath()).toBe("/x");
	});
});

describe("Link: targets", () => {
	it("[ISSUE-3475-ITEM-6] collapses the leading slashes of the target in its href and when routed", () => {
		// `${useRouteInfo().url}/7` under a route that matches at the root
		const { history } = renderAt(
			"/",
			<>
				<Link to="//7?q=1#h">string target</Link>
				<Link to={{ pathname: "/\\8", search: "?a=1" }}>object target</Link>
			</>,
		);
		const stringLink = screen.getByRole("link", { name: "string target" });
		const objectLink = screen.getByRole("link", { name: "object target" });
		expect(stringLink).toHaveAttribute("href", "/7?q=1#h");
		expect(objectLink).toHaveAttribute("href", "/8?a=1");
		expect(fireEvent.click(stringLink)).toBe(false);
		expect(renderedPath()).toBe("/7");
		expect(fireEvent.click(objectLink)).toBe(false);
		expect(renderedPath()).toBe("/8");
		expect(history.index).toBe(2);
	});

	it("[ISSUE-3475-ITEM-6] leaves a link to a URL with a scheme to the browser", () => {
		const onClick = vi.fn();
		const { history } = renderAt(
			"/",
			<>
				<Link to="https://other.example/page" onClick={onClick} replace>
					other site
				</Link>
				<MuiLink
					component={Link}
					to={{ pathname: "mailto:someone@example.com" }}
				>
					mail
				</MuiLink>
			</>,
		);
		const other = screen.getByRole("link", { name: "other site" });
		const mail = screen.getByRole("link", { name: "mail" });
		expect(other).toHaveAttribute("href", "https://other.example/page");
		expect(mail).toHaveAttribute("href", "mailto:someone@example.com");
		expect(fireEvent.click(other)).toBe(true);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(fireEvent.click(mail)).toBe(true);
		expect(history.index).toBe(0);
		expect(renderedPath()).toBe("/");
	});

	it("[ISSUE-3475-ITEM-9] points href at the location a click navigates to, for a target without pathname", () => {
		const { history } = renderAt(
			"/devices?page=1",
			<>
				<Link to={{ search: "?page=2" }}>next page</Link>
				<Link to={{ hash: "#notes" }}>notes</Link>
			</>,
		);
		expectHrefsMatchClicks(history, ["next page", "notes"]);
	});

	it("[ISSUE-3475-ITEM-9] points href at the location a click navigates to, for a string target without pathname", () => {
		const { history } = renderAt(
			"/devices?page=1",
			<>
				<Link to="?page=2">next page</Link>
				<Link to="#notes">notes</Link>
			</>,
		);
		expectHrefsMatchClicks(history, ["next page", "notes"]);
	});

	it("[ISSUE-3475-ITEM-9] follows the current location when the target has no pathname", () => {
		const { history } = renderAt(
			"/devices?page=1",
			<Link to={{ search: "?page=2" }}>next page</Link>,
		);
		const next = screen.getByRole("link", { name: "next page" });
		expect(next).toHaveAttribute("href", "/devices?page=2");
		act(() => history.push("/settings"));
		expect(next).toHaveAttribute("href", "/settings?page=2");
	});
});

describe("Link: a link to the current location", () => {
	/**
	 * Records the action of every navigation of the history
	 * @param history The router's history
	 * @returns The actions so far, oldest first
	 */
	const recordActions = (history: History) => {
		const actions: Action[] = [];
		history.listen(({ action }) => actions.push(action));
		return actions;
	};

	it("[ISSUE-3475-ITEM-19] replaces the entry, so a single Back leaves the page", () => {
		const history = createMemoryHistory({
			initialEntries: ["/devices", "/x"],
		});
		render(
			<HistoryRouter history={history}>
				<ShowPath />
				<Link to="/x">current page</Link>
			</HistoryRouter>,
		);
		const actions = recordActions(history);
		const link = screen.getByRole("link", { name: "current page" });
		expect(fireEvent.click(link)).toBe(false);
		expect(fireEvent.click(link)).toBe(false);
		expect(actions).toEqual([Action.Replace, Action.Replace]);
		expect(history.index).toBe(1);
		expect(renderedPath()).toBe("/x");
		act(() => history.back());
		expect(renderedPath()).toBe("/devices");
	});

	it.each([
		["/devices?page=2#notes", Action.Replace],
		["?page=2#notes", Action.Replace],
		[{ search: "?page=2", hash: "#notes" }, Action.Replace],
		["//devices?page=2#notes", Action.Replace],
		["/devices?page=2", Action.Push],
		["/devices#notes", Action.Push],
		["/devices", Action.Push],
		["#notes", Action.Push],
		["/devices/?page=2#notes", Action.Push],
	])(
		"[ISSUE-3475-ITEM-19] compares pathname, search and hash: at /devices?page=2#notes, a link to %j makes a %s",
		(to, action) => {
			const { history } = renderAt(
				"/devices?page=2#notes",
				<Link to={to}>go</Link>,
			);
			const actions = recordActions(history);
			fireEvent.click(screen.getByRole("link", { name: "go" }));
			expect(actions).toEqual([action]);
		},
	);

	it("[ISSUE-3475-ITEM-19] stores the link's state in the replaced entry", () => {
		const Show = () => (
			<div data-testid="state">{JSON.stringify(useLocation().state)}</div>
		);
		const { history } = renderAt(
			"/x",
			<>
				<Link to="/x" state={{ s: 1 }}>
					current page
				</Link>
				<Show />
			</>,
		);
		const actions = recordActions(history);
		fireEvent.click(screen.getByRole("link", { name: "current page" }));
		expect(actions).toEqual([Action.Replace]);
		expect(screen.getByTestId("state")).toHaveTextContent('{"s":1}');
	});

	it("[ISSUE-3475-ITEM-19] pushes a link to the current location with replace={false}", () => {
		const { history } = renderAt(
			"/x",
			<Link to="/x" replace={false}>
				current page
			</Link>,
		);
		const actions = recordActions(history);
		fireEvent.click(screen.getByRole("link", { name: "current page" }));
		expect(actions).toEqual([Action.Push]);
		expect(history.index).toBe(1);
	});

	it("[ISSUE-3475-ITEM-19] recognizes the current location in a browser history, which keeps it percent-encoded", () => {
		window.history.replaceState(null, "", "/search/foo bar/über?q=a b#c d");
		const history = createBrowserHistory();
		expect(createPath(history.location)).toBe(
			"/search/foo%20bar/%C3%BCber?q=a%20b#c%20d",
		);
		render(
			<HistoryRouter history={history}>
				<Link to="/search/foo bar/über?q=a b#c d">current page</Link>
				<Link to="/search/foo bar/über?q=a b">other page</Link>
			</HistoryRouter>,
		);
		const actions = recordActions(history);
		fireEvent.click(screen.getByRole("link", { name: "current page" }));
		fireEvent.click(screen.getByRole("link", { name: "other page" }));
		expect(actions).toEqual([Action.Replace, Action.Push]);
	});
});

describe("Link: markCurrent", () => {
	it('[ISSUE-3475-ITEM-25] marks the link to the current page with aria-current="page", only with markCurrent', () => {
		renderAt(
			"/devices",
			<>
				<Link to="/devices" markCurrent>
					Devices
				</Link>
				<Link to="/settings" markCurrent>
					Settings
				</Link>
				<Link to="/devices">Devices, not marked</Link>
			</>,
		);
		expect(screen.getByRole("link", { name: "Devices" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByRole("link", { name: "Settings" })).not.toHaveAttribute(
			"aria-current",
		);
		expect(
			screen.getByRole("link", { name: "Devices, not marked" }),
		).not.toHaveAttribute("aria-current");
	});

	it("[ISSUE-3475-ITEM-25] moves the mark with the location", () => {
		const { history } = renderAt(
			"/devices",
			<>
				<Link to="/devices" markCurrent>
					Devices
				</Link>
				<Link to="/settings" markCurrent>
					Settings
				</Link>
			</>,
		);
		const devices = screen.getByRole("link", { name: "Devices" });
		const settings = screen.getByRole("link", { name: "Settings" });
		fireEvent.click(settings);
		expect(renderedPath()).toBe("/settings");
		expect(settings).toHaveAttribute("aria-current", "page");
		expect(devices).not.toHaveAttribute("aria-current");
		act(() => history.back());
		expect(devices).toHaveAttribute("aria-current", "page");
		expect(settings).not.toHaveAttribute("aria-current");
	});

	it.each([
		["/devices", true],
		["//devices", true],
		["/devices?page=2", true],
		["/devices?sort=name&page=2", true],
		["/devices?page=2&sort=name#notes", true],
		["?page=2", true],
		[{ search: "?page=2" }, true],
		["#notes", true],
		[{ hash: "#notes" }, true],
		["/devices?page=1", false],
		["/devices?page=2&q=x", false],
		["/devices#other", false],
		["?page=2#other", false],
		["/devices/5", false],
		["/", false],
		["/settings", false],
	])(
		"[ISSUE-3475-ITEM-25] compares the pathname, and the search params and hash the target names: at /devices?page=2&sort=name#notes, a link to %j is current: %s",
		(to, current) => {
			renderAt(
				"/devices?page=2&sort=name#notes",
				<Link to={to} markCurrent>
					go
				</Link>,
			);
			const link = screen.getByRole("link", { name: "go" });
			if (current) expect(link).toHaveAttribute("aria-current", "page");
			else expect(link).not.toHaveAttribute("aria-current");
		},
	);

	it.each([
		[true, "page"],
		["page", "page"],
		["step", "step"],
		["location", "location"],
	] as const)(
		"[ISSUE-3475-ITEM-25] with markCurrent=%j, the link to the current location gets aria-current=%j",
		(markCurrent, token) => {
			renderAt(
				"/wizard/2",
				<>
					<Link to="/wizard/2" markCurrent={markCurrent}>
						current
					</Link>
					<Link to="/wizard/3" markCurrent={markCurrent}>
						other
					</Link>
				</>,
			);
			expect(screen.getByRole("link", { name: "current" })).toHaveAttribute(
				"aria-current",
				token,
			);
			expect(screen.getByRole("link", { name: "other" })).not.toHaveAttribute(
				"aria-current",
			);
		},
	);

	it("[ISSUE-3475-ITEM-25] marks nothing with markCurrent={false}", () => {
		renderAt(
			"/devices",
			<Link to="/devices" markCurrent={false}>
				Devices
			</Link>,
		);
		expect(screen.getByRole("link", { name: "Devices" })).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("[ISSUE-3475-ITEM-25] keeps an aria-current passed to the link", () => {
		renderAt(
			"/devices",
			<>
				<Link to="/devices" markCurrent aria-current="step">
					current, step
				</Link>
				<Link to="/devices" markCurrent aria-current={false}>
					current, false
				</Link>
				<Link to="/settings" markCurrent aria-current="page">
					other, page
				</Link>
				<Link to="/devices" markCurrent aria-current={undefined}>
					current, undefined
				</Link>
			</>,
		);
		const link = (name: string) => screen.getByRole("link", { name });
		expect(link("current, step")).toHaveAttribute("aria-current", "step");
		expect(link("current, false")).toHaveAttribute("aria-current", "false");
		expect(link("other, page")).toHaveAttribute("aria-current", "page");
		expect(link("current, undefined")).toHaveAttribute("aria-current", "page");
	});

	it("[ISSUE-3475-ITEM-25] never marks a link to a URL with a scheme", () => {
		window.history.replaceState(null, "", "/devices");
		const history = createBrowserHistory();
		render(
			<HistoryRouter history={history}>
				<Link to={window.location.href} markCurrent>
					absolute
				</Link>
				<Link to="mailto:help@example.com" markCurrent>
					mail
				</Link>
			</HistoryRouter>,
		);
		expect(screen.getByRole("link", { name: "absolute" })).not.toHaveAttribute(
			"aria-current",
		);
		expect(screen.getByRole("link", { name: "mail" })).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("[ISSUE-3475-ITEM-25] recognizes the current page in a browser history, which keeps it percent-encoded", () => {
		window.history.replaceState(null, "", "/search/foo bar/über?q=a b#c d");
		const history = createBrowserHistory();
		render(
			<HistoryRouter history={history}>
				<Link to="/search/foo bar/über" markCurrent>
					path
				</Link>
				<Link to="/search/foo bar/über?q=a b#c d" markCurrent>
					full
				</Link>
				<Link to="/search/foo bar/über?q=a" markCurrent>
					other search
				</Link>
			</HistoryRouter>,
		);
		expect(screen.getByRole("link", { name: "path" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByRole("link", { name: "full" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(
			screen.getByRole("link", { name: "other search" }),
		).not.toHaveAttribute("aria-current");
	});

	it("[ISSUE-3475-ITEM-25] marks the current crumb as the component of MUI's Link and keeps markCurrent out of the DOM", () => {
		renderAt(
			"/devices",
			<Breadcrumbs aria-label="breadcrumb">
				<MuiLink component={Link} to="/" markCurrent="page">
					Home
				</MuiLink>
				<MuiLink component={Link} to="/devices" markCurrent="page">
					Devices
				</MuiLink>
			</Breadcrumbs>,
		);
		const home = screen.getByRole("link", { name: "Home" });
		const devices = screen.getByRole("link", { name: "Devices" });
		expect(devices).toHaveAttribute("aria-current", "page");
		expect(home).not.toHaveAttribute("aria-current");
		for (const link of [home, devices])
			expect(link).not.toHaveAttribute("markcurrent");
	});
});
