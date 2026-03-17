import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, Typography } from "@mui/material";
import { createMemoryHistory } from "history";
import HistoryRouter from "./HistoryRouter";
import Routes from "./Routes";
import Route from "./Route";
import Link from "./Link";
import useLocation from "./useLocation";
import useNavigate from "./useNavigate";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof HistoryRouter> = {
	title: "standalone/Routes/HistoryRouter",
	component: HistoryRouter,
	parameters: { layout: "centered" },
};

export default meta;

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
