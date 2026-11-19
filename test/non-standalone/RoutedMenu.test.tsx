import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	renderHook,
	screen,
} from "@testing-library/react";
import { createTheme, List, ThemeProvider } from "@mui/material";
import { createBrowserHistory, createMemoryHistory, History } from "history";
import MaterialMenuItem from "../../src/standalone/Portal/MenuItem/Material";
import type { MenuItemProps } from "../../src/standalone/Portal/Menu";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Route from "../../src/standalone/Routes/Route";
import Routes from "../../src/standalone/Routes/Routes";
import useLocation from "../../src/standalone/Routes/useLocation";
import RoutedMenu, {
	IRoutedMenuItemDefinition,
	IRoutedMenuProps,
	useRoutedMenuLogic,
} from "../../src/non-standalone/Portal/Menu";

beforeEach(() => {
	// useNavigate scrolls the window to the top; jsdom does not implement it
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const theme = createTheme();

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<List>{children}</List>
);

/** The entry button whose text is exactly `title` (also inside a collapsed group) */
const entry = (title: string) => {
	const found = screen
		.getAllByRole("button", { hidden: true })
		.filter((b) => b.textContent === title);
	if (found.length !== 1)
		throw new Error(`${found.length} entries titled "${title}"`);
	return found[0];
};

/** The titles of all rendered entries, in DOM order */
const titles = () =>
	screen.getAllByRole("button", { hidden: true }).map((b) => b.textContent);
/** The titles of the highlighted (active) entries */
const selected = () =>
	screen
		.queryAllByRole("button", { hidden: true })
		.filter((b) => b.classList.contains("Mui-selected"))
		.map((b) => b.textContent);
/** "less" for an expanded group, "more" for a collapsed one, "none" for a leaf */
const chevron = (el: HTMLElement) =>
	el.querySelector("[data-testid=ExpandLessIcon]")
		? "less"
		: el.querySelector("[data-testid=ExpandMoreIcon]")
			? "more"
			: "none";

const middleClick = (el: HTMLElement, button = 1) =>
	fireEvent(el, new MouseEvent("auxclick", { bubbles: true, button }));

type MenuOverrides = Partial<Omit<IRoutedMenuProps, "definition">>;

/** Renders RoutedMenu inside a HistoryRouter of `history` */
const mountWith = <H extends History>(
	defs: IRoutedMenuItemDefinition[],
	history: H,
	props: MenuOverrides = {},
) => {
	const result = render(
		<ThemeProvider theme={theme}>
			<HistoryRouter history={history}>
				<RoutedMenu
					definition={defs}
					wrapper={Wrap}
					menuItem={MaterialMenuItem}
					{...props}
				/>
			</HistoryRouter>
		</ThemeProvider>,
	);
	return { history, ...result };
};

/** Renders RoutedMenu with a memory history that starts at `start` */
const mount = (
	defs: IRoutedMenuItemDefinition[],
	start: string,
	props: MenuOverrides = {},
) => mountWith(defs, createMemoryHistory({ initialEntries: [start] }), props);

const leaf = (
	title: string,
	route?: string,
	extra: Partial<IRoutedMenuItemDefinition> = {},
): IRoutedMenuItemDefinition => ({
	title,
	route,
	shouldRender: true,
	...extra,
});

/** Profile and Users, defined once (the hook's definition stays the same) */
const USERS_MENU = [leaf("Profile", "/profile"), leaf("Users", "/users")];

// ---------------------------------------------------------------------------
// Bugs: these tests assert the expected behavior and fail until fixed
// ---------------------------------------------------------------------------

const group = (
	title: string,
	children: IRoutedMenuItemDefinition[],
	extra: Partial<IRoutedMenuItemDefinition> = {},
): IRoutedMenuItemDefinition => ({
	title,
	shouldRender: true,
	children,
	...extra,
});

// ---------------------------------------------------------------------------
// Bugs: these tests assert the expected behavior and fail until fixed
// ---------------------------------------------------------------------------

describe("RoutedMenu bugs", () => {
	it("[ISSUE-3479-ITEM-1] a right click on a routed entry does not open a tab", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		mount([leaf("Profile", "/profile"), leaf("Users", "/users")], "/profile");
		middleClick(entry("Users"), 2);
		expect(open).not.toHaveBeenCalled();
	});
	it("[ISSUE-3479-ITEM-1] useRoutedMenuLogic's entries react to the middle button only, also in a custom rendering", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const onAuxClick = vi.fn();
		// an app's own menu: the converted handlers go onto its elements unfiltered
		const Custom = (props: { definition: IRoutedMenuItemDefinition[] }) => {
			const { definition } = useRoutedMenuLogic(props);
			return (
				<>
					{definition.map((def) => (
						<button
							key={def.title}
							type={"button"}
							onClick={def.onClick}
							onAuxClick={def.onAuxClick}
						>
							{def.title}
						</button>
					))}
				</>
			);
		};
		const history = createMemoryHistory({ initialEntries: ["/profile"] });
		render(
			<HistoryRouter history={history}>
				<Custom
					definition={[
						leaf("Profile", "/profile"),
						leaf("Users", "/users", { onAuxClick }),
					]}
				/>
			</HistoryRouter>,
		);
		// right, back and forward
		for (const button of [2, 3, 4]) middleClick(entry("Users"), button);
		expect(open).not.toHaveBeenCalled();
		expect(onAuxClick).not.toHaveBeenCalled();
		middleClick(entry("Users"));
		expect(open.mock.calls).toEqual([["/users"]]);
		expect(onAuxClick).toHaveBeenCalledTimes(1);
		expect(history.location.pathname).toBe("/profile");
	});
	it("[ISSUE-3498-ITEM-1] params of a route inside a group are filled from the current URL", () => {
		const { history } = mount(
			[
				leaf("Home", "/"),
				group("Project", [
					leaf("Review", "/projects/:id/review"),
					leaf("Capture", "/projects/:id/capture"),
				]),
			],
			"/projects/42/review",
		);
		fireEvent.click(entry("Capture"));
		expect(history.location.pathname).toBe("/projects/42/capture");
	});
	it("[ISSUE-3498-ITEM-1] a param in the first segment is filled from a nested entry, also for the new-tab gestures", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const { history } = mount(
			[
				leaf("Home", "/"),
				group("Tenant", [leaf("A", "/:tenant/a"), leaf("B", "/:tenant/b")]),
			],
			"/t1/a",
		);
		fireEvent.click(entry("B"), { ctrlKey: true });
		middleClick(entry("B"));
		expect(open.mock.calls).toEqual([["/t1/b", "_blank"], ["/t1/b"]]);
		fireEvent.click(entry("B"));
		expect(history.location.pathname).toBe("/t1/b");
	});
	it("[ISSUE-3498-ITEM-1] an entry whose route needs a param that the current URL does not provide is hidden", () => {
		// the development error is tested below
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const defs = [
			leaf("Home", "/"),
			leaf("Tenant page", "/:tenant/page"),
			group("Apps", [
				leaf("Y", "/apps/:app/y"),
				// the URL has a value for :app, none for :appId
				leaf("X", "/apps/:appId/x"),
			]),
			group("Project", [leaf("Review", "/projects/:id/review")], {
				route: "/projects/:id",
			}),
		];
		mount(defs, "/apps/a1/y");
		expect(titles()).toEqual(["Home", "Apps", "Y"]);
		cleanup();
		mount(defs, "/projects/7");
		expect(titles()).toEqual(["Home", "Apps", "Project", "Review"]);
	});
	it("[ISSUE-3498-ITEM-1] useRoutedMenuLogic hides an entry with an unresolved param, and its handlers do not navigate", () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const onClick = vi.fn();
		const onAuxClick = vi.fn();
		const history = createMemoryHistory({ initialEntries: ["/"] });
		const { result } = renderHook(
			() =>
				useRoutedMenuLogic({
					definition: [
						leaf("Home", "/"),
						leaf("Tenant page", "/:tenant/page", { onClick, onAuxClick }),
					],
				}),
			{
				wrapper: ({ children }) => (
					<HistoryRouter history={history}>{children}</HistoryRouter>
				),
			},
		);
		const [home, tenantPage] = result.current.definition;
		expect(home.shouldRender).toBe(true);
		expect(tenantPage.shouldRender).toBe(false);
		// an app's own renderer that shows it anyway
		const click = { button: 0 } as React.MouseEvent;
		act(() => tenantPage.onClick(click));
		act(() => tenantPage.onClick({ ...click, ctrlKey: true }));
		act(() => tenantPage.onAuxClick?.({ ...click, button: 1 }));
		expect(onClick).toHaveBeenCalledTimes(2);
		expect(onAuxClick).toHaveBeenCalledTimes(1);
		expect(open).not.toHaveBeenCalled();
		expect(history.index).toBe(0);
		expect(history.location.pathname).toBe("/");
	});

	/** Entries with unresolved params on "/", and two the app hides itself */
	const UNRESOLVED = (): IRoutedMenuItemDefinition[] => [
		leaf("Home", "/"),
		leaf("Tenant page", "/:tenant/page"),
		group("Project", [leaf("Capture", "/projects/:id/:step")]),
		// hidden with its child; only the group is reported
		group("Tenant", [leaf("Child", "/:tenant/child")], { route: "/:tenant" }),
		leaf("Admin", "/:tenant/admin", { shouldRender: false }),
		group("Hidden", [leaf("X", "/:tenant/x")], { shouldRender: false }),
	];
	it("[ISSUE-3498-ITEM-1] in development, each hidden entry and missing param is reported once per mounted menu", () => {
		vi.stubEnv("NODE_ENV", "development");
		const error = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		const history = createMemoryHistory({ initialEntries: ["/"] });
		const defs = UNRESOLVED();
		const renderMenu = () =>
			render(
				<React.StrictMode>
					<ThemeProvider theme={theme}>
						<HistoryRouter history={history}>
							<RoutedMenu
								definition={defs}
								wrapper={Wrap}
								menuItem={MaterialMenuItem}
							/>
						</HistoryRouter>
					</ThemeProvider>
				</React.StrictMode>,
			);
		const reports = [
			[
				expect.stringMatching(
					/^RoutedMenu: the entry "Tenant page" \(route "\/:tenant\/page"\) is hidden, because the current URL "\/" has no value for its param ":tenant"/,
				),
			],
			[
				expect.stringMatching(
					/the entry "Project > Capture" \(route "\/projects\/:id\/:step"\) .* its param ":id"/,
				),
			],
			[
				expect.stringMatching(
					/the entry "Project > Capture" \(route "\/projects\/:id\/:step"\) .* its param ":step"/,
				),
			],
			[
				expect.stringMatching(
					/the entry "Tenant" \(route "\/:tenant"\) .* its param ":tenant"/,
				),
			],
		];
		try {
			const { rerender } = renderMenu();
			expect(titles()).toEqual(["Home", "Project"]);
			expect(error.mock.calls).toEqual(reports);
			// away (where /:tenant reads the tenant) and back, a rebuilt definition
			act(() => history.push("/other"));
			act(() => history.back());
			defs.splice(0, defs.length, ...UNRESOLVED());
			rerender(
				<React.StrictMode>
					<ThemeProvider theme={theme}>
						<HistoryRouter history={history}>
							<RoutedMenu
								definition={[...defs]}
								wrapper={Wrap}
								menuItem={MaterialMenuItem}
							/>
						</HistoryRouter>
					</ThemeProvider>
				</React.StrictMode>,
			);
			expect(error).toHaveBeenCalledTimes(4);
			// a menu mounted anew reports again
			cleanup();
			renderMenu();
			expect(error).toHaveBeenCalledTimes(8);
		} finally {
			vi.unstubAllEnvs();
		}
	});
	it("[ISSUE-3498-ITEM-1] in production, the entry is only hidden", () => {
		vi.stubEnv("NODE_ENV", "production");
		const error = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		try {
			mount(UNRESOLVED(), "/");
			expect(titles()).toEqual(["Home", "Project"]);
			expect(error).not.toHaveBeenCalled();
		} finally {
			vi.unstubAllEnvs();
		}
	});
	it("[ISSUE-3498-ITEM-2] a path that matches no entry clears the highlight", () => {
		const { history } = mount(
			[leaf("Profile", "/profile"), leaf("Users", "/users")],
			"/users",
		);
		expect(selected()).toEqual(["Users"]);
		act(() => history.push("/not-in-menu"));
		expect(selected()).toEqual([]);
	});
	it("[ISSUE-3498-ITEM-2] an action entry clicked on a path that matches no entry is not left highlighted", () => {
		mount(
			[
				leaf("Profile", "/profile"),
				leaf("Logout", undefined, { onClick: vi.fn() }),
			],
			"/elsewhere",
		);
		fireEvent.click(entry("Logout"));
		expect(selected()).toEqual([]);
	});
	it("[ISSUE-3498-ITEM-2] a click never renders an entry that the URL does not match as active, not even for one render", () => {
		vi.spyOn(window, "open").mockImplementation(() => null);
		const activeRenders: string[] = [];
		const Recording = React.memo(function Recording(props: MenuItemProps) {
			if (props.active) activeRenders.push(props.title);
			return <MaterialMenuItem {...props} />;
		});
		const { history } = mount(
			[
				leaf("Profile", "/profile"),
				leaf("Users", "/users"),
				leaf("Logout", undefined, { onClick: vi.fn() }),
			],
			"/users",
			{ menuItem: Recording },
		);
		activeRenders.length = 0;
		// on a matched path: the URL's entry stays the only active one
		fireEvent.click(entry("Logout"));
		fireEvent.click(entry("Profile"), { ctrlKey: true });
		expect(activeRenders).toEqual([]);
		expect(selected()).toEqual(["Users"]);
		// on a path that matches no entry: nothing becomes active
		act(() => history.push("/elsewhere"));
		activeRenders.length = 0;
		fireEvent.click(entry("Logout"));
		fireEvent.click(entry("Users"), { ctrlKey: true });
		expect(activeRenders).toEqual([]);
		expect(selected()).toEqual([]);
		expect(history.location.pathname).toBe("/elsewhere");
	});
	it("[ISSUE-3498-ITEM-2] after a swap to a menu that matches none of its entries, an entry with the old entry's title is not highlighted", () => {
		const top = [leaf("Profile", "/profile"), leaf("Users", "/users")];
		const admin = [
			leaf("Users", "/admin/users"),
			leaf("Roles", "/admin/roles"),
		];
		const Switching = () => {
			const { pathname } = useLocation();
			return (
				<RoutedMenu
					definition={pathname.startsWith("/admin") ? admin : top}
					wrapper={Wrap}
					menuItem={MaterialMenuItem}
				/>
			);
		};
		const history = createMemoryHistory({ initialEntries: ["/users"] });
		render(
			<ThemeProvider theme={theme}>
				<HistoryRouter history={history}>
					<Switching />
				</HistoryRouter>
			</ThemeProvider>,
		);
		expect(selected()).toEqual(["Users"]);
		act(() => history.push("/admin/unknown"));
		expect(titles()).toEqual(["Users", "Roles"]);
		expect(selected()).toEqual([]);
		act(() => history.push("/admin/roles"));
		expect(selected()).toEqual(["Roles"]);
	});
	it("[ISSUE-3498-ITEM-2] useRoutedMenuLogic's active id follows the URL only: empty on a path that matches no entry, and its setter changes nothing", () => {
		const history = createMemoryHistory({ initialEntries: ["/users"] });
		const { result } = renderHook(
			() =>
				useRoutedMenuLogic({
					definition: USERS_MENU,
				}),
			{
				wrapper: ({ children }: { children: React.ReactNode }) => (
					<HistoryRouter history={history}>{children}</HistoryRouter>
				),
			},
		);
		expect(result.current.controlledState[0]).toBe("Users");
		act(() => result.current.controlledState[1]("Profile"));
		expect(result.current.controlledState[0]).toBe("Users");
		act(() => history.push("/elsewhere"));
		expect(result.current.controlledState[0]).toBe("");
		act(() => result.current.controlledState[1]("Profile"));
		expect(result.current.controlledState[0]).toBe("");
	});
	it("[ISSUE-3498-ITEM-3] an exact match in a later group wins over a prefix match in an earlier group", () => {
		mount(
			[
				group("Settings", [leaf("General", "/settings")]),
				group("Advanced", [leaf("Expert", "/settings/expert")]),
			],
			"/settings/expert",
		);
		expect(selected()).toEqual(["Expert"]);
		expect(chevron(entry("Settings"))).toBe("more");
	});
	it("[ISSUE-3498-ITEM-3] a literal route wins over a param route that matches the same path", () => {
		mount(
			[leaf("New app", "/apps/new"), leaf("App", "/apps/:app")],
			"/apps/new",
		);
		expect(selected()).toEqual(["New app"]);
	});
	it("[ISSUE-3498-ITEM-3] an entry of the level above wins over a less specific match inside a group", () => {
		mount(
			[
				group("Reports", [leaf("Overview", "/reports")]),
				leaf("Device report", "/reports/devices"),
			],
			"/reports/devices",
		);
		expect(selected()).toEqual(["Device report"]);
		expect(chevron(entry("Reports"))).toBe("more");
	});
	it("[ISSUE-3498-ITEM-3] more segments win over a longer route string, and the params come from the same entry", () => {
		// General and Users are hidden (and reported in development): the import
		// page has no value for :application
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		mount(
			[
				leaf("Apps", "/apps"),
				group("Application", [
					leaf("General", "/apps/:application"),
					leaf("Users", "/apps/:application/users"),
				]),
				group("Import", [leaf("Upload", "/apps/new/import")]),
			],
			"/apps/new/import/upload",
		);
		expect(selected()).toEqual(["Upload"]);
		expect(titles()).toEqual(["Apps", "Application", "Import", "Upload"]);
		expect(chevron(entry("Application"))).toBe("more");
		expect(chevron(entry("Import"))).toBe("less");
	});
	it("[ISSUE-3498-ITEM-3] on a tie the deeper entry wins, so a group's entry with the group's own route is highlighted", () => {
		mount(
			[
				leaf("Home", "/"),
				group(
					"Settings",
					[leaf("General", "/settings"), leaf("Profile", "/settings/profile")],
					{ route: "/settings" },
				),
			],
			"/settings",
		);
		expect(selected()).toEqual(["General"]);
		expect(chevron(entry("Settings"))).toBe("less");
	});
	it("[ISSUE-3498-ITEM-4] a route ending in /* navigates to the path, not to a literal *", () => {
		const { history } = mount(
			[leaf("Home", "/"), leaf("Devices", "/devices/*")],
			"/devices/5",
		);
		expect(selected()).toEqual(["Devices"]);
		fireEvent.click(entry("Devices"));
		expect(history.location.pathname).toBe("/devices");
	});
});

describe("RoutedMenu: one reading of a route for the highlight and the navigation", () => {
	it("[ISSUE-3498-ITEM-4] a route ending in /* fills its params and opens the path without * in a new tab", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		mount(
			[
				leaf("Devices", "/devices"),
				leaf("Device", "/devices/:id/*"),
				leaf("Everything", "/*"),
			],
			"/devices/5/edit",
		);
		expect(selected()).toEqual(["Device"]);
		middleClick(entry("Device"));
		fireEvent.click(entry("Everything"), { ctrlKey: true });
		expect(open.mock.calls).toEqual([["/devices/5"], ["/", "_blank"]]);
	});
	it("[ISSUE-3498-ITEM-4] a route with a query string or hash is highlighted by its path and navigates with them", () => {
		// Device is hidden (and reported in development) where the URL has no
		// value for :id
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const { history } = mount(
			[
				leaf("Home", "/"),
				leaf("Open tasks", "/tasks?tab=open#list"),
				leaf("Device", "/devices/:id?tab=info"),
			],
			"/tasks?tab=open",
		);
		expect(selected()).toEqual(["Open tasks"]);
		act(() => history.push("/devices/5"));
		expect(selected()).toEqual(["Device"]);
		fireEvent.click(entry("Device"));
		expect(history.location).toMatchObject({
			pathname: "/devices/5",
			search: "?tab=info",
			hash: "",
		});
		fireEvent.click(entry("Open tasks"));
		expect(history.location).toMatchObject({
			pathname: "/tasks",
			search: "?tab=open",
			hash: "#list",
		});
		expect(selected()).toEqual(["Open tasks"]);
	});
	it("[ISSUE-3498-ITEM-4] outside of a Route, a route without a leading slash is read from the root for the highlight and the click alike", () => {
		window.history.replaceState(null, "", "/apps/a1");
		try {
			const { history } = mountWith(
				[leaf("Apps", "/apps/:app"), leaf("Users", "users")],
				createBrowserHistory(),
			);
			expect(selected()).toEqual(["Apps"]);
			fireEvent.click(entry("Users"));
			expect(history.location.pathname).toBe("/users");
			expect(selected()).toEqual(["Users"]);
		} finally {
			cleanup();
			window.history.replaceState(null, "", "/");
		}
	});
	it("[ISSUE-3498-ITEM-4] inside a Route, a route without a leading slash is resolved against the Route, also on a page without an entry", () => {
		// Role is hidden (and reported in development) where the URL has no
		// value for :role
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const menu = [
			leaf("Apps", "/apps"),
			leaf("Roles", "roles"),
			leaf("Role", "roles/:role/*"),
			leaf("Users", "users?sort=name"),
		];
		const history = createMemoryHistory({
			initialEntries: ["/apps/a%2Fb/roles"],
		});
		render(
			<ThemeProvider theme={theme}>
				<HistoryRouter history={history}>
					<Routes>
						{[
							<Route
								key={"app"}
								path={"/apps/:app/*"}
								element={
									<RoutedMenu
										definition={menu}
										wrapper={Wrap}
										menuItem={MaterialMenuItem}
									/>
								}
							/>,
						]}
					</Routes>
				</HistoryRouter>
			</ThemeProvider>,
		);
		expect(selected()).toEqual(["Roles"]);
		expect(titles()).toEqual(["Apps", "Roles", "Users"]);
		act(() => history.push("/apps/a%2Fb/roles/r9/edit"));
		expect(selected()).toEqual(["Role"]);
		act(() => history.push("/apps/a%2Fb/settings"));
		expect(selected()).toEqual(["Apps"]);
		fireEvent.click(entry("Users"));
		expect(history.location).toMatchObject({
			pathname: "/apps/a%2Fb/users",
			search: "?sort=name",
		});
		expect(selected()).toEqual(["Users"]);
	});
});

describe("RoutedMenu: params with reserved characters", () => {
	it("[ISSUE-3475-ITEM-11] fills a param with an encoded slash, space or percent sign into the targets encoded", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const { history } = mount(
			[
				leaf("Results", "/search/:term/results"),
				leaf("Details", "/search/:term/details"),
			],
			"/search/a%2Fb%20c%25/results",
		);
		expect(selected()).toEqual(["Results"]);
		middleClick(entry("Details"));
		expect(open.mock.calls).toEqual([["/search/a%2Fb%20c%25/details"]]);
		fireEvent.click(entry("Details"));
		expect(history.location.pathname).toBe("/search/a%2Fb%20c%25/details");
		expect(selected()).toEqual(["Details"]);
	});
});

describe("RoutedMenu: focus when the menu is swapped", () => {
	// IMF's admin UI picks a whole flat menu per path: the app menu (with "Back")
	// below /apps/<id>, the top menu elsewhere
	const appMenu = [
		leaf("Back", "/apps"),
		leaf("General", "/apps/:app"),
		leaf("Roles", "/apps/:app/roles"),
	];
	const topMenu = [leaf("Profile", "/profile"), leaf("Apps", "/apps")];
	const SwappingMenu = () => {
		const { pathname } = useLocation();
		return (
			<RoutedMenu
				definition={/^\/apps\/.+/.test(pathname) ? appMenu : topMenu}
				wrapper={Wrap}
				menuItem={MaterialMenuItem}
			/>
		);
	};

	it("[ISSUE-3498-ITEM-8] Enter on an entry that the navigation removes moves focus to the entry of the new location", () => {
		const history = createMemoryHistory({ initialEntries: ["/apps/a1/roles"] });
		render(
			<ThemeProvider theme={theme}>
				<HistoryRouter history={history}>
					<SwappingMenu />
				</HistoryRouter>
			</ThemeProvider>,
		);
		const back = entry("Back");
		back.focus();
		fireEvent.keyDown(back, { key: "Enter" });
		expect(history.location.pathname).toBe("/apps");
		expect(entry("Apps")).toHaveClass("Mui-selected");
		expect(document.activeElement).toBe(entry("Apps"));
	});
});
