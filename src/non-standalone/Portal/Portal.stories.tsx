import React, { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Box,
	Collapse,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Typography,
} from "@mui/material";
import { createMemoryHistory } from "history";
import {
	ExpandLess,
	ExpandMore,
	Home,
	Info,
	Settings,
} from "@mui/icons-material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import { MaterialMenuItem } from "../../standalone/Portal/MenuItem";
import RoutedMenu, {
	IRoutedMenuEntry,
	IRoutedMenuItemDefinition,
	useRoutedMenuLogic,
} from "./Menu";

const meta: Meta = {
	title: "non-standalone/Portal/RoutedMenu",
	parameters: { layout: "fullscreen" },
};

export default meta;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PageHome = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Home</Typography>
		<Typography>Welcome to the home page.</Typography>
	</Box>
);

const PageAbout = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">About</Typography>
		<Typography>About this application.</Typography>
	</Box>
);

const PageSettings = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Settings</Typography>
		<Typography>Application settings page.</Typography>
	</Box>
);

const PageSettingsProfile = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Profile Settings</Typography>
		<Typography>Edit your profile here.</Typography>
	</Box>
);

const PageSettingsNotifications = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Notification Settings</Typography>
		<Typography>Manage your notification preferences.</Typography>
	</Box>
);

const MenuWrapper = (props: { children: React.ReactNode }) => (
	<List>{props.children}</List>
);

const MenuItem = (props: {
	icon?: React.ComponentType;
	title: string;
	onClick: React.MouseEventHandler;
	onAuxClick: React.MouseEventHandler;
	expandable: boolean;
	active?: boolean;
	expanded?: boolean;
	depth: number;
}) => (
	<ListItem
		onClick={props.onClick}
		sx={{
			pl: 2 + props.depth * 2,
			cursor: "pointer",
			bgcolor: props.active ? "action.selected" : "transparent",
			fontWeight: props.active ? "bold" : "normal",
			"&:hover": { bgcolor: "action.hover" },
		}}
	>
		{props.icon && <Box component={props.icon} sx={{ mr: 1, fontSize: 20 }} />}
		{props.title}
		{props.expandable && (props.expanded ? " [-]" : " [+]")}
	</ListItem>
);

const menuDefinition: IRoutedMenuItemDefinition[] = [
	{
		icon: Home,
		title: "Home",
		route: "/",
		shouldRender: true,
	},
	{
		icon: Info,
		title: "About",
		route: "/about",
		shouldRender: true,
	},
	{
		icon: Settings,
		title: "Settings",
		shouldRender: true,
		// a group only shows and hides its entries; its page is an entry
		children: [
			{
				title: "Overview",
				route: "/settings",
				shouldRender: true,
			},
			{
				title: "Profile",
				route: "/settings/profile",
				shouldRender: true,
			},
			{
				title: "Notifications",
				route: "/settings/notifications",
				shouldRender: true,
			},
		],
	},
];

// ─── Story ───────────────────────────────────────────────────────────────────

export const BasicRoutedMenu: StoryObj = {
	name: "Basic RoutedMenu",
	render: () => {
		const history = createMemoryHistory({ initialEntries: ["/"] });
		return (
			<HistoryRouter history={history}>
				<Box sx={{ display: "flex", height: "100vh" }}>
					<Box
						sx={{
							width: 250,
							borderRight: "1px solid #ccc",
							overflow: "auto",
						}}
					>
						<RoutedMenu
							definition={menuDefinition}
							wrapper={MenuWrapper}
							menuItem={MenuItem}
						/>
					</Box>
					<Box sx={{ flex: 1 }}>
						<Routes>
							{[
								<Route key="home" path="/" element={<PageHome />} />,
								<Route key="about" path="/about" element={<PageAbout />} />,
								<Route
									key="settings"
									path="/settings"
									element={<PageSettings />}
								/>,
								<Route
									key="settings-profile"
									path="/settings/profile"
									element={<PageSettingsProfile />}
								/>,
								<Route
									key="settings-notifications"
									path="/settings/notifications"
									element={<PageSettingsNotifications />}
								/>,
							]}
						</Routes>
					</Box>
				</Box>
			</HistoryRouter>
		);
	},
};

export const StartingOnSettings: StoryObj = {
	name: "Starting on Settings",
	render: () => {
		const history = createMemoryHistory({
			initialEntries: ["/settings/profile"],
		});
		return (
			<HistoryRouter history={history}>
				<Box sx={{ display: "flex", height: "100vh" }}>
					<Box
						sx={{
							width: 250,
							borderRight: "1px solid #ccc",
							overflow: "auto",
						}}
					>
						<RoutedMenu
							definition={menuDefinition}
							wrapper={MenuWrapper}
							menuItem={MenuItem}
						/>
					</Box>
					<Box sx={{ flex: 1 }}>
						<Routes>
							{[
								<Route key="home" path="/" element={<PageHome />} />,
								<Route key="about" path="/about" element={<PageAbout />} />,
								<Route
									key="settings"
									path="/settings"
									element={<PageSettings />}
								/>,
								<Route
									key="settings-profile"
									path="/settings/profile"
									element={<PageSettingsProfile />}
								/>,
								<Route
									key="settings-notifications"
									path="/settings/notifications"
									element={<PageSettingsNotifications />}
								/>,
							]}
						</Routes>
					</Box>
				</Box>
			</HistoryRouter>
		);
	},
};

// ─── Menu swapped by path ────────────────────────────────────────────────────

const NavWrapper = (props: { children: React.ReactNode }) => (
	<List component={"nav"} aria-label={"Main menu"}>
		{props.children}
	</List>
);

const Page = (props: { title: string }) => {
	const location = useLocation();
	return (
		<Box sx={{ p: 2 }}>
			<Typography variant="h5" component="h1">
				{props.title}
			</Typography>
			<Typography data-testid="current-path">{location.pathname}</Typography>
		</Box>
	);
};

const currentPath = () =>
	document.querySelector("[data-testid=current-path]")?.textContent;

const appMenu: IRoutedMenuItemDefinition[] = [
	{ title: "Back", route: "/apps", shouldRender: true },
	{ title: "General", route: "/apps/:app", shouldRender: true },
	{ title: "Roles", route: "/apps/:app/roles", shouldRender: true },
	{ title: "Users", route: "/apps/:app/users", shouldRender: true },
];

// IMF's admin UI picks a whole flat menu per path: the app menu (with "Back")
// below /apps/<id>, the top menu elsewhere
const topMenu: IRoutedMenuItemDefinition[] = [
	{ title: "Profile", route: "/profile", shouldRender: true },
	{ title: "Apps", route: "/apps", shouldRender: true },
];

const SwappingMenu = () => {
	const { pathname } = useLocation();
	return (
		<RoutedMenu
			definition={/^\/apps\/.+/.test(pathname) ? appMenu : topMenu}
			wrapper={NavWrapper}
			menuItem={MaterialMenuItem}
		/>
	);
};

const SwappingDemo = () => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: ["/apps/a1/roles"] }),
	);
	return (
		<HistoryRouter history={history}>
			<SwappingMenu />
			<Box component="main">
				<Page title="Content" />
			</Box>
		</HistoryRouter>
	);
};

export const Issue3498Item8FocusStaysWhenTheMenuIsSwapped: StoryObj = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3498-ITEM-8: the definition depends on the path (as in IMF\'s admin UI). Enter on "Back" navigates to `/apps`, where the menu has no "Back" entry: the focused entry unmounts and keyboard focus falls to the document body.',
			},
		},
	},
	render: () => <SwappingDemo />,
	play: async ({ canvas }) => {
		canvas.getByRole("button", { name: "Back" }).focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Apps" })).toHaveClass(
				"Mui-selected",
			),
		);
		await expect(currentPath()).toBe("/apps");
		await expect(document.activeElement).not.toBe(document.body);
	},
};

// ─── A group only shows and hides its entries ────────────────────────────────

// "Settings" keeps a route here to show that a group ignores it; the group's
// page is its entry "Overview"
const groupWithRouteMenu: IRoutedMenuItemDefinition[] = [
	{ icon: Home, title: "Home", route: "/", shouldRender: true },
	{
		icon: Settings,
		title: "Settings",
		route: "/settings",
		shouldRender: true,
		children: [
			{ title: "Overview", route: "/settings", shouldRender: true },
			{ title: "Profile", route: "/settings/profile", shouldRender: true },
		],
	},
];

const GroupDemo = () => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: ["/"] }),
	);
	return (
		<HistoryRouter history={history}>
			<RoutedMenu
				definition={groupWithRouteMenu}
				wrapper={NavWrapper}
				menuItem={MaterialMenuItem}
			/>
			<Box component="main">
				<Page title="Content" />
			</Box>
		</HistoryRouter>
	);
};

export const Issue3498Item10GroupOnlyExpands: StoryObj = {
	name: "A group only shows and hides its entries",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'A group is a disclosure button: a click, Enter or Space expands or collapses it (`aria-expanded`) and never navigates. "Settings" has a `route` here, which a group ignores; the group\'s page is its entry "Overview".',
			},
		},
	},
	render: () => <GroupDemo />,
	play: async ({ canvas }) => {
		const settings = canvas.getByRole("button", { name: "Settings" });
		settings.focus();
		await userEvent.keyboard("{Enter}");
		await expect(settings).toHaveAttribute("aria-expanded", "true");
		await expect(currentPath()).toBe("/");
		await userEvent.keyboard(" ");
		await expect(settings).toHaveAttribute("aria-expanded", "false");
		await expect(currentPath()).toBe("/");
		await expect(settings).toHaveFocus();

		// the group's page is one of its entries
		await userEvent.keyboard("{Enter}");
		const overview = canvas.getByRole("button", { name: "Overview" });
		await userEvent.click(overview);
		await waitFor(() => expect(currentPath()).toBe("/settings"));
		await expect(overview).toHaveAttribute("aria-current", "page");
		await expect(settings).not.toHaveAttribute("aria-current");
		await expect(settings).toHaveAttribute("aria-expanded", "true");
	},
};

// ─── A menu the app renders itself, from links ───────────────────────────────

// the title of a group that contains the current entry
const BOLD_TITLE = { primary: { sx: { fontWeight: 700 } } };

/**
 * One entry of a menu rendered from useRoutedMenuLogic: a link to the entry's
 * target, a button for an action without route, and a disclosure button
 * (`aria-expanded`) with a nested list for a group
 */
const LinkMenuEntry = (props: { entry: IRoutedMenuEntry; depth: number }) => {
	const { entry, depth } = props;
	const forceExpand = !!entry.forceExpand;
	const [open, setOpen] = useState(forceExpand);
	// the hook keeps the group of the current page expanded
	if (forceExpand && !open) setOpen(true);
	const toggle = useCallback(
		() => setOpen((prev) => forceExpand || !prev),
		[forceExpand],
	);
	const indent = useMemo(() => ({ pl: 2 + depth * 2 }), [depth]);

	if (entry.children) {
		return (
			<ListItem disablePadding sx={{ display: "block" }}>
				<ListItemButton aria-expanded={open} onClick={toggle} sx={indent}>
					<ListItemText
						primary={entry.title}
						// the group of the current page
						slotProps={entry.containsCurrent ? BOLD_TITLE : undefined}
					/>
					{open ? <ExpandLess /> : <ExpandMore />}
				</ListItemButton>
				<Collapse in={open}>
					<List disablePadding>
						{entry.children.map(
							(child) =>
								child.shouldRender && (
									<LinkMenuEntry
										key={child.menuItemId}
										entry={child}
										depth={depth + 1}
									/>
								),
						)}
					</List>
				</Collapse>
			</ListItem>
		);
	}
	return (
		<ListItem disablePadding>
			{entry.href ? (
				// with an href, ListItemButton renders a link
				<ListItemButton
					href={entry.href}
					onClick={entry.onClick}
					onAuxClick={entry.onAuxClick}
					selected={entry.current}
					aria-current={entry.current ? "page" : undefined}
					sx={indent}
				>
					<ListItemText primary={entry.title} />
				</ListItemButton>
			) : (
				// an action
				<ListItemButton onClick={entry.onClick} sx={indent}>
					<ListItemText primary={entry.title} />
				</ListItemButton>
			)}
		</ListItem>
	);
};

/**
 * A navigation menu the app renders itself from useRoutedMenuLogic, with
 * links instead of MenuBase's entries
 */
const LinkMenu = (props: { definition: IRoutedMenuItemDefinition[] }) => {
	const { definition } = useRoutedMenuLogic(props);
	return (
		<Box
			component="nav"
			aria-label="Project menu"
			sx={{ width: 250, borderRight: "1px solid #ccc" }}
		>
			<List>
				{definition.map(
					(entry) =>
						entry.shouldRender && (
							<LinkMenuEntry key={entry.menuItemId} entry={entry} depth={0} />
						),
				)}
			</List>
		</Box>
	);
};

interface LinkMenuDemoArgs {
	/**
	 * The URL the story starts on (a memory history), below
	 * `/projects/:project`
	 */
	initialPath: string;
	/**
	 * onClick of the "Log out" entry, an action without route
	 */
	onLogOut: () => void;
}

const LinkMenuPage = (props: LinkMenuDemoArgs) => {
	const { onLogOut } = props;
	// relative routes are resolved against the Route the menu is rendered in
	const definition = useMemo(
		(): IRoutedMenuItemDefinition[] => [
			{ title: "Tasks", route: "tasks", shouldRender: true },
			{ title: "Devices", route: "devices", shouldRender: true },
			{
				title: "Reports",
				route: "/projects/:project/reports",
				shouldRender: true,
			},
			{
				title: "Settings",
				shouldRender: true,
				children: [
					{ title: "General", route: "settings/general", shouldRender: true },
					{ title: "Members", route: "settings/members", shouldRender: true },
				],
			},
			{ title: "Log out", shouldRender: true, onClick: onLogOut },
		],
		[onLogOut],
	);
	return (
		<Box sx={{ display: "flex", height: "100vh" }}>
			<LinkMenu definition={definition} />
			<Box component="main" sx={{ flex: 1 }}>
				<Page title="Project" />
			</Box>
		</Box>
	);
};

const LinkMenuDemo = (props: LinkMenuDemoArgs) => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: [props.initialPath] }),
	);
	return (
		<HistoryRouter history={history}>
			<Routes>
				{[
					<Route
						key="project"
						path="/projects/:project/*"
						element={<LinkMenuPage {...props} />}
					/>,
				]}
			</Routes>
		</HistoryRouter>
	);
};

export const Issue3498Item9CustomMenuOfLinks: StoryObj<LinkMenuDemoArgs> = {
	name: "Custom menu of links (useRoutedMenuLogic)",
	args: {
		initialPath: "/projects/42/tasks",
		onLogOut: fn(),
	},
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'A menu the app renders itself from `useRoutedMenuLogic`: each entry with a route is a link (`href`, with the params filled in and as the history writes it) that is marked `aria-current="page"` while it is the entry of the current URL (`current`); a plain click navigates in the app, a Ctrl, Shift or middle click opens the link in a new tab as the browser does. An action is a button; a group is a disclosure button with `aria-expanded`, in bold while it contains the current entry (`containsCurrent`).',
			},
		},
	},
	render: (args) => <LinkMenuDemo {...args} />,
	play: async ({ args, canvas }) => {
		const nav = canvas.getByRole("navigation", { name: "Project menu" });
		const tasks = within(nav).getByRole("link", { name: "Tasks" });
		await expect(tasks).toHaveAttribute("href", "/projects/42/tasks");
		await expect(tasks).toHaveAttribute("aria-current", "page");
		await expect(
			within(nav).getByRole("link", { name: "Reports" }),
		).toHaveAttribute("href", "/projects/42/reports");

		// Tab reaches the links; Enter follows one in the app
		tasks.focus();
		await userEvent.tab();
		const devices = within(nav).getByRole("link", { name: "Devices" });
		await expect(devices).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(currentPath()).toBe("/projects/42/devices"));
		await expect(devices).toHaveAttribute("aria-current", "page");
		await expect(tasks).not.toHaveAttribute("aria-current");

		// a group is a disclosure button; its entries are links too
		const settings = within(nav).getByRole("button", { name: "Settings" });
		await expect(settings).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(settings);
		await expect(settings).toHaveAttribute("aria-expanded", "true");
		const members = await within(nav).findByRole("link", { name: "Members" });
		await expect(members).toHaveAttribute(
			"href",
			"/projects/42/settings/members",
		);
		await userEvent.click(members);
		await waitFor(() =>
			expect(currentPath()).toBe("/projects/42/settings/members"),
		);
		await expect(members).toHaveAttribute("aria-current", "page");

		// an action is a button
		await userEvent.click(within(nav).getByRole("button", { name: "Log out" }));
		await expect(args.onLogOut).toHaveBeenCalledTimes(1);
		await expect(currentPath()).toBe("/projects/42/settings/members");
	},
};

// ─── A home entry under a base path ──────────────────────────────────────────

interface BasePathMenuDemoArgs {
	/**
	 * `end` of the entry "Start" (`/tenant/abc/`): with it, "Start" is
	 * highlighted on its own path only, without it on every page below it
	 */
	end: boolean;
	/**
	 * The URL the story starts on (a memory history)
	 */
	initialPath: string;
}

const BasePathMenuDemo = (props: BasePathMenuDemoArgs) => {
	const { end, initialPath } = props;
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: [initialPath] }),
	);
	const definition = useMemo(
		(): IRoutedMenuItemDefinition[] => [
			{
				icon: Home,
				title: "Start",
				route: "/tenant/abc/",
				end,
				shouldRender: true,
			},
			{
				title: "Inventory",
				route: "/tenant/abc/inventory",
				shouldRender: true,
			},
			{ title: "Tasks", route: "/tenant/abc/tasks", shouldRender: true },
		],
		[end],
	);
	return (
		<HistoryRouter history={history}>
			<RoutedMenu
				definition={definition}
				wrapper={NavWrapper}
				menuItem={MaterialMenuItem}
			/>
			<Box component="main">
				<Page title="Content" />
			</Box>
		</HistoryRouter>
	);
};

export const Issue3498Item12HomeEntryUnderABasePath: StoryObj<BasePathMenuDemoArgs> =
	{
		name: "A home entry under a base path (end)",
		args: {
			end: true,
			initialPath: "/tenant/abc/profile",
		},
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						'The home entry "Start" has the route `/tenant/abc/`, which every other route of the menu lies below. Matched as a prefix, it would be highlighted on every page below it that has no entry of its own, such as `/tenant/abc/profile`, where this story starts. With `end` it is highlighted on `/tenant/abc` and `/tenant/abc/` only. Turn `end` off to see the prefix match.',
				},
			},
		},
		render: (args) => <BasePathMenuDemo {...args} />,
		play: async ({ canvas }) => {
			const nav = canvas.getByRole("navigation", { name: "Main menu" });
			const entries = within(nav).getAllByRole("button");
			const start = within(nav).getByRole("button", { name: "Start" });
			const inventory = within(nav).getByRole("button", { name: "Inventory" });

			// a page without an entry of its own: no entry is the current page
			await expect(currentPath()).toBe("/tenant/abc/profile");
			for (const button of entries)
				await expect(button).not.toHaveAttribute("aria-current");

			await userEvent.click(start);
			await waitFor(() => expect(currentPath()).toBe("/tenant/abc/"));
			await expect(start).toHaveAttribute("aria-current", "page");

			await userEvent.click(inventory);
			await waitFor(() => expect(currentPath()).toBe("/tenant/abc/inventory"));
			await expect(inventory).toHaveAttribute("aria-current", "page");
			await expect(start).not.toHaveAttribute("aria-current");
		},
	};
