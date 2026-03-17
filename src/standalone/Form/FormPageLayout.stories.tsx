import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, TextField, Typography } from "@mui/material";
import FormPageLayout from "./FormPageLayout";

const meta: Meta<typeof FormPageLayout> = {
	title: "Standalone/Form/FormPageLayout",
	component: FormPageLayout,
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof FormPageLayout>;

export const Default: Story = {
	render: () => (
		<Box
			sx={{
				position: "relative",
				width: 500,
				height: 400,
				border: "1px solid #ccc",
			}}
		>
			<FormPageLayout
				body={
					<Box sx={{ padding: 2 }}>
						<Typography variant="h6" gutterBottom>
							User Information
						</Typography>
						<TextField label="First Name" fullWidth sx={{ mb: 2 }} />
						<TextField label="Last Name" fullWidth sx={{ mb: 2 }} />
						<TextField label="Email" fullWidth />
					</Box>
				}
				footer={
					<Box sx={{ display: "flex", gap: 1 }}>
						<Button variant="contained" color="primary">
							Save
						</Button>
						<Button variant="outlined">Cancel</Button>
					</Box>
				}
			/>
		</Box>
	),
};

export const WithOther: Story = {
	render: () => (
		<Box
			sx={{
				position: "relative",
				width: 500,
				height: 400,
				border: "1px solid #ccc",
			}}
		>
			<FormPageLayout
				body={
					<Box sx={{ padding: 2 }}>
						<Typography variant="body1">
							Main form body content goes here.
						</Typography>
					</Box>
				}
				footer={<Button variant="contained">Submit</Button>}
				other={
					<Box
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							padding: 1,
							backgroundColor: "info.light",
							borderRadius: 1,
						}}
					>
						<Typography variant="caption">Extra content</Typography>
					</Box>
				}
			/>
		</Box>
	),
};
