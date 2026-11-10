import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
import FilterIcon from "./FilterIcon";
import SignIcon from "./SignIcon";
import ExportIcon from "./ExportIcon";

const allIcons = [
	{ name: "FilterIcon", Component: FilterIcon },
	{ name: "SignIcon", Component: SignIcon },
	{ name: "ExportIcon", Component: ExportIcon },
];

const IconGrid = () => (
	<Box
		sx={{
			display: "grid",
			gridTemplateColumns: "repeat(4, 1fr)",
			gap: 3,
			padding: 2,
		}}
	>
		{allIcons.map(({ name, Component }) => (
			<Box
				key={name}
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 1,
				}}
			>
				<Component sx={{ fontSize: 40 }} />
				<Typography variant="caption">{name}</Typography>
			</Box>
		))}
	</Box>
);

const meta: Meta<typeof IconGrid> = {
	title: "Standalone/Icons",
	component: IconGrid,
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
	},
};
export default meta;

type Story = StoryObj<typeof IconGrid>;

export const AllIcons: Story = {};

export const ColorVariants: Story = {
	render: () => (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: 3,
				padding: 2,
			}}
		>
			{(
				[
					"inherit",
					"primary",
					"secondary",
					"action",
					"disabled",
					"error",
				] as const
			).map((color) => (
				<Box
					key={color}
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 1,
					}}
				>
					<FilterIcon color={color} sx={{ fontSize: 40 }} />
					<Typography variant="caption">{color}</Typography>
				</Box>
			))}
		</Box>
	),
};
