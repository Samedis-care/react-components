import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Box, Button, Link as MuiLink, Typography } from "@mui/material";
import { createMemoryHistory } from "history";
import { Framework } from "../../framework";
import { setFrameworkHistory } from "../../framework/History";
import FullFormDialog from "../../backend-components/Form/FormDialog";
import PageTitle, { PageTitleProps } from "./PageTitle";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import Link from "../../standalone/Routes/Link";
import useNavigate from "../../standalone/Routes/useNavigate";

setFrameworkHistory(createMemoryHistory({ initialEntries: ["/devices/4711"] }));

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<Story />
	</Framework>
);

const meta: Meta<PageTitleProps> = {
	title: "non-standalone/PageTitle",
	component: PageTitle,
	decorators: [FrameworkDecorator],
	args: {
		children: "Device 4711",
		variant: "h1",
		disableAutoTitle: false,
	},
	argTypes: {
		children: { control: "text" },
		variant: {
			control: "select",
			options: ["h1", "h2", "h3", "h4", "h5", "h6", "subtitle1", "body1"],
		},
		disableAutoTitle: { control: "boolean" },
	},
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					'The visible title of a page. On a page it renders a heading (`<h1>` by default) and names the document after its text, by default "Device 4711 – <app title>" (the browser tab, the history and screen readers tell the pages apart). Inside a `FullFormDialog` it renders nothing and its content becomes the dialog\'s title. `disableAutoTitle` renders only the heading. Pages without a visible heading call `usePageTitle`.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<PageTitleProps>;

export const OnAPage: Story = {
	render: (args) => (
		<Box sx={{ p: 2 }}>
			<PageTitle {...args} />
			<Typography>The details of the device.</Typography>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole("heading", { level: 1, name: "Device 4711" }),
		).toBeVisible();
		await waitFor(() => expect(document.title).toMatch(/^Device 4711( – |$)/));
	},
};

export const InAFullFormDialog: Story = {
	args: { children: "Edit device" },
	render: (args) => (
		<FullFormDialog maxWidth="sm">
			<PageTitle {...args} />
			<Typography>The form.</Typography>
		</FullFormDialog>
	),
	play: async ({ canvasElement }) => {
		const body = within(canvasElement.ownerDocument.body);
		const dialog = await body.findByRole("dialog", { name: "Edit device" });
		// MUI's dialog fades in
		await waitFor(() => expect(dialog).toBeVisible());
		// the title is in the title bar only, not repeated in the content
		await expect(within(dialog).getAllByText("Edit device")).toHaveLength(1);
		await expect(
			within(dialog).queryByRole("heading", { level: 1 }),
		).toBeNull();
	},
};

export const DisableAutoTitleInADialog: Story = {
	args: {
		children: "Maintenance",
		// below the dialog title, an h2
		variant: "h6",
		component: "h3",
		disableAutoTitle: true,
	},
	render: (args) => (
		<FullFormDialog maxWidth="sm" dialogTitle="Edit device">
			<PageTitle {...args} />
			<Typography>The maintenance part of the form.</Typography>
		</FullFormDialog>
	),
	play: async ({ canvasElement }) => {
		const body = within(canvasElement.ownerDocument.body);
		const dialog = await body.findByRole("dialog", { name: "Edit device" });
		const heading = within(dialog).getByRole("heading", {
			level: 3,
			name: "Maintenance",
		});
		// MUI's dialog fades in
		await waitFor(() => expect(heading).toBeVisible());
	},
};

// ─── Focus after navigation ─────────────────────────────────────────────────

/** How long the device page loads before it shows its title, in ms */
const LOAD_TIME = 300;

/** A device page that shows its PageTitle once its record has loaded */
const LoadingDevicePage = () => {
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => setLoaded(true), LOAD_TIME);
		return () => clearTimeout(timer);
	}, []);
	return loaded ? (
		<PageTitle>Device 2</PageTitle>
	) : (
		<Typography>Loading the device</Typography>
	);
};

const DeviceList = () => (
	<MuiLink component={Link} to="/devices/2">
		Open device 2
	</MuiLink>
);

/**
 * A device list whose link opens a device page in a nested route, inside a
 * HistoryRouter of its own
 * @param props.withListTitle Render a PageTitle "Devices" around the nested route
 * @param props.devicePage The device page
 */
const DeviceNavigation = (props: {
	withListTitle: boolean;
	devicePage: React.ReactElement;
}) => {
	const history = useMemo(
		() => createMemoryHistory({ initialEntries: ["/devices"] }),
		[],
	);
	return (
		<HistoryRouter history={history}>
			<Box sx={{ p: 2 }}>
				<Routes>
					{[
						<Route
							key="devices"
							path="/devices/*"
							element={
								<>
									{props.withListTitle && <PageTitle>Devices</PageTitle>}
									<Routes>
										{[
											<Route key="id" path=":id" element={props.devicePage} />,
											<Route key="list" path="" element={<DeviceList />} />,
										]}
									</Routes>
								</>
							}
						/>,
					]}
				</Routes>
			</Box>
		</HistoryRouter>
	);
};

export const Issue3475Item22FocusWaitsForThePageTitle: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-22: the link that opened the device is gone and the device page shows its PageTitle only once the record has loaded: the focus moves to the PageTitle when it appears.",
			},
		},
	},
	render: () => (
		<DeviceNavigation
			withListTitle={false}
			devicePage={<LoadingDevicePage />}
		/>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		canvas.getByRole("link", { name: "Open device 2" }).focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByText("Loading the device");
		const heading = await canvas.findByRole("heading", { name: "Device 2" });
		await waitFor(() => expect(heading).toHaveFocus());
		await expect(heading).toHaveAttribute("tabindex", "-1");
	},
};

export const Issue3475Item22ClickWhileLoadingKeepsThePlace: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-22: the user clicks into the page while it loads; the PageTitle that appears afterwards does not take the focus.",
			},
		},
	},
	render: () => (
		<DeviceNavigation
			withListTitle={false}
			devicePage={<LoadingDevicePage />}
		/>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		canvas.getByRole("link", { name: "Open device 2" }).focus();
		await userEvent.keyboard("{Enter}");
		await userEvent.click(await canvas.findByText("Loading the device"));
		const heading = await canvas.findByRole("heading", { name: "Device 2" });
		await expect(heading).not.toHaveFocus();
		await expect(document.activeElement).toBe(document.body);
	},
};

export const Issue3475Item22FocusGoesToTheDeepestPageTitle: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3475-ITEM-22: the device list route shows a PageTitle "Devices" above its nested routes; the device page has its own. After the navigation the focus moves to the device page\'s PageTitle, the one of the deepest route.',
			},
		},
	},
	render: () => (
		<DeviceNavigation
			withListTitle
			devicePage={<PageTitle variant="h2">Device 2</PageTitle>}
		/>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		canvas.getByRole("link", { name: "Open device 2" }).focus();
		await userEvent.keyboard("{Enter}");
		await expect(
			await canvas.findByRole("heading", { name: "Device 2" }),
		).toHaveFocus();
	},
};

// ─── A HistoryRouter inside another one ─────────────────────────────────────

/**
 * A step of a wizard whose "Next" button belongs to the step: the step change
 * removes the focused button
 * @param props.text What the step asks
 * @param props.next The path of the next step
 */
const WizardStep = (props: { text: string; next: string }) => {
	const { next } = props;
	const navigate = useNavigate();
	const goNext = useCallback(() => navigate(next), [navigate, next]);
	return (
		<>
			<Typography>{props.text}</Typography>
			<Button onClick={goNext}>Next</Button>
		</>
	);
};

/**
 * A device page (on the Framework's router) with a wizard that routes its
 * steps with a HistoryRouter of its own; its last step has a PageTitle
 */
const DeviceWizardPage = () => {
	const history = useMemo(
		() => createMemoryHistory({ initialEntries: ["/step1"] }),
		[],
	);
	return (
		<Box sx={{ p: 2 }}>
			<PageTitle>Device 4711</PageTitle>
			<HistoryRouter history={history}>
				<Routes>
					{[
						<Route
							key="step1"
							path="/step1"
							element={<WizardStep text="Pick the type" next="/step2" />}
						/>,
						<Route
							key="step2"
							path="/step2"
							element={<WizardStep text="Pick the location" next="/step3" />}
						/>,
						<Route
							key="step3"
							path="/step3"
							element={<PageTitle variant="h2">Summary</PageTitle>}
						/>,
					]}
				</Routes>
			</HistoryRouter>
		</Box>
	);
};

export const Issue3475Item33WizardStepFocusStaysInTheWizard: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3475-ITEM-33: a wizard with a HistoryRouter of its own on a device page. Its "Next" button belongs to the step, so a step change removes the focused button. The focus moves only to a PageTitle of the wizard\'s own steps ("Summary"), never to the page\'s PageTitle outside of the wizard.',
			},
		},
	},
	render: () => <DeviceWizardPage />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const pageHeading = await canvas.findByRole("heading", {
			name: "Device 4711",
		});
		canvas.getByRole("button", { name: "Next" }).focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByText("Pick the location");
		await expect(pageHeading).not.toHaveFocus();
		canvas.getByRole("button", { name: "Next" }).focus();
		await userEvent.keyboard("{Enter}");
		await expect(
			await canvas.findByRole("heading", { name: "Summary" }),
		).toHaveFocus();
		await expect(pageHeading).not.toHaveFocus();
	},
};
