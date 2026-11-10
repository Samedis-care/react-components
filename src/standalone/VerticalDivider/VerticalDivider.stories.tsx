import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Toolbar, Typography } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import VerticalDivider from "./index";

const meta: Meta = {
	title: "Standalone/VerticalDivider",
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj;

export const InlineWithText: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "center", height: 32 }}>
			<Typography variant="body2">Left</Typography>
			<VerticalDivider />
			<Typography variant="body2">Right</Typography>
		</div>
	),
};

export const MultipleItems: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "center", height: 32 }}>
			<Typography variant="body2">File</Typography>
			<VerticalDivider />
			<Typography variant="body2">Edit</Typography>
			<VerticalDivider />
			<Typography variant="body2">View</Typography>
			<VerticalDivider />
			<Typography variant="body2">Help</Typography>
		</div>
	),
};

export const Issue3459Item6FlexItemTakesTheRowHeight: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'With `flexItem` the divider sits directly in a flex row that has no height of its own, as MUI `<Divider orientation="vertical" flexItem />` does: it takes the row\'s height, also when the row centers its items, and in a MUI `Toolbar`.',
			},
		},
	},
	render: () => (
		<div>
			<div
				data-testid={"row"}
				style={{ display: "flex", alignItems: "center" }}
			>
				<Button>Undo</Button>
				<VerticalDivider flexItem data-testid={"row-divider"} />
				<Button>Redo</Button>
			</div>
			<Toolbar data-testid={"toolbar"}>
				<Typography>Title</Typography>
				<VerticalDivider flexItem data-testid={"toolbar-divider"} />
				<Button>Save</Button>
			</Toolbar>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const rect = (testId: string) =>
			canvas.getByTestId(testId).getBoundingClientRect();
		await expect(rect("row").height).toBeGreaterThan(30);
		await expect(rect("row-divider").height).toBe(rect("row").height);
		await expect(rect("row-divider").width).toBe(1);
		await expect(rect("toolbar").height).toBe(64);
		await expect(rect("toolbar-divider").height).toBe(64);
		await expect(rect("toolbar-divider").width).toBe(1);
	},
};
