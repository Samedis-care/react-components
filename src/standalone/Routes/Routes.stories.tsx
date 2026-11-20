import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, Link as MuiLink, Typography } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createMemoryHistory, type History } from "history";
import HistoryRouter, { useHistoryRouterContext } from "./HistoryRouter";
import Routes from "./Routes";
import Route from "./Route";
import Link from "./Link";
import useLocation from "./useLocation";
import useNavigate from "./useNavigate";
import useParams from "./useParams";
import usePageTitle from "./usePageTitle";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * A memory history created once per story mount: a history created in render
 * would be replaced on every re-render, and HistoryRouter reads the location of
 * a new history only on its next navigation (ISSUE-3475-ITEM-12).
 */
const useStoryHistory = (initialPath: string) =>
	useMemo(
		() => createMemoryHistory({ initialEntries: [initialPath] }),
		[initialPath],
	);

const Page = (props: { title: string; children?: React.ReactNode }) => (
	<Box>
		<Typography variant="h5" component="h1">
			{props.title}
		</Typography>
		{props.children}
	</Box>
);

const HomeRoute = () => (
	<Box>
		<Typography variant="h5">Home Page</Typography>
		<Typography variant="body2">
			Welcome! Navigate using the links above.
		</Typography>
	</Box>
);

const AboutRoute = () => (
	<Box>
		<Typography variant="h5">About Page</Typography>
		<Typography variant="body2">This is the about page.</Typography>
	</Box>
);

const ContactRoute = () => (
	<Box>
		<Typography variant="h5">Contact Page</Typography>
		<Typography variant="body2">Contact us at hello@example.com</Typography>
	</Box>
);

const NotFoundRoute = () => (
	<Box>
		<Typography variant="h5">404 - Not Found</Typography>
	</Box>
);

const CurrentPath = () => {
	const location = useLocation();
	return (
		<Typography variant="caption" sx={{ color: "text.secondary" }}>
			Current path: <strong>{location.pathname}</strong>
		</Typography>
	);
};

const Nav = () => {
	const navigate = useNavigate();
	return (
		<Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
			<Link to="/" style={{ textDecoration: "none" }}>
				<Button variant="outlined" size="small">
					Home
				</Button>
			</Link>
			<Link to="/about" style={{ textDecoration: "none" }}>
				<Button variant="outlined" size="small">
					About
				</Button>
			</Link>
			<Link to="/contact" style={{ textDecoration: "none" }}>
				<Button variant="outlined" size="small">
					Contact
				</Button>
			</Link>
			<Button variant="text" size="small" onClick={() => navigate("/about")}>
				Navigate programmatically
			</Button>
		</Box>
	);
};

const FRAME_SX = {
	p: 2,
	width: "100%",
	maxWidth: 400,
	border: "1px solid #ccc",
	borderRadius: 1,
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof HistoryRouter> = {
	title: "standalone/Routes/HistoryRouter",
	component: HistoryRouter,
	parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof HistoryRouter>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const BasicRouting: StoryObj<typeof HistoryRouter> = {
	render: () => {
		const history = createMemoryHistory({ initialEntries: ["/"] });
		return (
			<HistoryRouter history={history}>
				<Box
					sx={{ p: 2, width: 400, border: "1px solid #ccc", borderRadius: 1 }}
				>
					<Nav />
					<CurrentPath />
					<Box sx={{ mt: 2 }}>
						<Routes>
							{[
								<Route key="/" path="/" element={<HomeRoute />} />,
								<Route key="/about" path="/about" element={<AboutRoute />} />,
								<Route
									key="/contact"
									path="/contact"
									element={<ContactRoute />}
								/>,
								<Route key="*" path="/*" element={<NotFoundRoute />} />,
							]}
						</Routes>
					</Box>
				</Box>
			</HistoryRouter>
		);
	},
};

export const StartingOnAbout: StoryObj<typeof HistoryRouter> = {
	render: () => {
		const history = createMemoryHistory({ initialEntries: ["/about"] });
		return (
			<HistoryRouter history={history}>
				<Box
					sx={{ p: 2, width: 400, border: "1px solid #ccc", borderRadius: 1 }}
				>
					<Nav />
					<CurrentPath />
					<Box sx={{ mt: 2 }}>
						<Routes>
							{[
								<Route key="/" path="/" element={<HomeRoute />} />,
								<Route key="/about" path="/about" element={<AboutRoute />} />,
								<Route
									key="/contact"
									path="/contact"
									element={<ContactRoute />}
								/>,
							]}
						</Routes>
					</Box>
				</Box>
			</HistoryRouter>
		);
	},
};

// ─── Focus after navigation ─────────────────────────────────────────────────

const FocusDemo = () => {
	const history = useStoryHistory("/a");
	return (
		<HistoryRouter history={history}>
			<Box sx={FRAME_SX}>
				<Box component="main">
					<Routes>
						{[
							<Route
								key="a"
								path="/a"
								element={
									<Page title="Page A">
										<MuiLink component={Link} to="/b">
											Go to page B
										</MuiLink>
									</Page>
								}
							/>,
							<Route
								key="b"
								path="/b"
								element={
									<Page title="Page B">
										<MuiLink component={Link} to="/a">
											Back to page A
										</MuiLink>
									</Page>
								}
							/>,
						]}
					</Routes>
				</Box>
			</Box>
		</HistoryRouter>
	);
};

export const Issue3475Item22FocusMovesToTheNewPage: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-22: following a link that the navigation replaces drops the keyboard focus to `<body>`, and nothing announces the new page (WCAG 2.4.3, 4.1.3).",
			},
		},
	},
	render: () => <FocusDemo />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const link = canvas.getByRole("link", { name: "Go to page B" });
		link.focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByRole("heading", { name: "Page B" });
		await expect(document.activeElement).not.toBe(document.body);
		await expect(
			canvas.getByRole("main").contains(document.activeElement),
		).toBe(true);
	},
};

const LONG_PAGE_SPACER_SX = { height: 2500 };

const ItemPage = () => {
	const { id } = useParams<"id">();
	return (
		<Page title={`Item ${id ?? ""}`}>
			<Box sx={LONG_PAGE_SPACER_SX} />
			<MuiLink component={Link} to={`/items/${Number(id) + 1}`}>
				Next item
			</MuiLink>
		</Page>
	);
};

const LongPageDemo = () => {
	const history = useStoryHistory("/items/1");
	return (
		<HistoryRouter history={history}>
			<Box component="main" sx={{ p: 2 }}>
				<Routes>
					{[<Route key="i" path="/items/:id" element={<ItemPage />} />]}
				</Routes>
			</Box>
		</HistoryRouter>
	);
};

/** whether el lies inside the visible part of the window */
const inViewport = (el: Element) => {
	const rect = el.getBoundingClientRect();
	return rect.bottom > 0 && rect.top < window.innerHeight;
};

export const Issue3475Item22FocusedLinkStaysInView: Story = {
	parameters: {
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-22: a link at the bottom of a long page that leads to the same route with another id keeps the focus, but the navigation scrolls the window to the top, so the focused link ends up out of view.",
			},
		},
	},
	render: () => <LongPageDemo />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const next = canvas.getByRole("link", { name: "Next item" });
		next.focus();
		await expect({ linkInViewBeforeEnter: inViewport(next) }).toEqual({
			linkInViewBeforeEnter: true,
		});
		await userEvent.keyboard("{Enter}");
		await canvas.findByRole("heading", { name: "Item 2" });
		const focused = document.activeElement;
		await expect(focused).not.toBe(document.body);
		await expect({
			focusInViewAfterNavigation: !!focused && inViewport(focused),
		}).toEqual({ focusInViewAfterNavigation: true });
	},
};

/** A page that names itself with usePageTitle and shows the title as its heading */
const TitledPage = (props: { title: string }) => {
	usePageTitle(props.title);
	return <Page title={props.title} />;
};

const MENU_LINK_SX = { mr: 2 };

const MenuDemo = () => {
	const history = useStoryHistory("/a");
	return (
		<HistoryRouter history={history}>
			<Box sx={FRAME_SX}>
				<Box component="nav" aria-label="Main" sx={{ mb: 1 }}>
					<MuiLink component={Link} to="/a" sx={MENU_LINK_SX}>
						Menu A
					</MuiLink>
					<MuiLink component={Link} to="/b">
						Menu B
					</MuiLink>
				</Box>
				<Box component="main">
					<Routes>
						{[
							<Route
								key="a"
								path="/a"
								element={<TitledPage title="Page A" />}
							/>,
							<Route
								key="b"
								path="/b"
								element={<TitledPage title="Page B" />}
							/>,
						]}
					</Routes>
				</Box>
			</Box>
		</HistoryRouter>
	);
};

/** the live region in which the router announces the new page */
const announcement = (canvasElement: HTMLElement) => {
	const region = canvasElement.querySelector('[aria-live="polite"]');
	if (!region) throw new Error("no live region");
	return region;
};

export const Issue3475Item22MenuLinkKeepsTheFocus: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-22: a link outside the content the navigation replaces (a navigation menu) keeps the focus, with the keyboard and with the mouse, and the router announces the new page title in a polite live region. The first render moves no focus.",
			},
		},
	},
	render: () => <MenuDemo />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole("heading", { name: "Page A" }),
		).not.toHaveFocus();
		await expect(announcement(canvasElement)).toHaveTextContent(/^$/);

		const menuB = canvas.getByRole("link", { name: "Menu B" });
		menuB.focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByRole("heading", { name: "Page B" });
		await expect(menuB).toHaveFocus();
		await waitFor(() =>
			expect(announcement(canvasElement)).toHaveTextContent(/^Page B$/),
		);

		const menuA = canvas.getByRole("link", { name: "Menu A" });
		await userEvent.click(menuA);
		await canvas.findByRole("heading", { name: "Page A" });
		await expect(menuA).toHaveFocus();
		await waitFor(() =>
			expect(announcement(canvasElement)).toHaveTextContent(/^Page A$/),
		);
	},
};

/** the history of the story that renders GrabHistory, for a back navigation */
let grabbedHistory: History | null = null;
const GrabHistory = () => {
	grabbedHistory = useHistoryRouterContext().history;
	return null;
};

const BackDemo = () => {
	const history = useStoryHistory("/a");
	return (
		<HistoryRouter history={history}>
			<GrabHistory />
			<Box sx={FRAME_SX}>
				<Box component="main">
					<Routes>
						{[
							<Route
								key="a"
								path="/a"
								element={
									<Page title="Page A">
										<MuiLink component={Link} to="/b">
											Go to page B
										</MuiLink>
									</Page>
								}
							/>,
							<Route key="b" path="/b" element={<Page title="Page B" />} />,
						]}
					</Routes>
				</Box>
			</Box>
		</HistoryRouter>
	);
};

export const Issue3475Item22BackMovesTheFocusToo: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-22: a back navigation (the browser's back button) that replaces the focused content moves the focus to the heading of the page it returns to.",
			},
		},
	},
	render: () => <BackDemo />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		canvas.getByRole("link", { name: "Go to page B" }).focus();
		await userEvent.keyboard("{Enter}");
		await expect(
			await canvas.findByRole("heading", { name: "Page B" }),
		).toHaveFocus();
		grabbedHistory?.back();
		await expect(
			await canvas.findByRole("heading", { name: "Page A" }),
		).toHaveFocus();
	},
};
