import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import {
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
});
