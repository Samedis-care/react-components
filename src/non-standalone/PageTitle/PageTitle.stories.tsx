import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import { Box, Typography } from "@mui/material";
import { createMemoryHistory } from "history";
import { Framework } from "../../framework";
import { setFrameworkHistory } from "../../framework/History";
import FullFormDialog from "../../backend-components/Form/FormDialog";
import PageTitle, { PageTitleProps } from "./PageTitle";

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
