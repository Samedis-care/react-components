import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	TextField,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import FormPageLayout from "./FormPageLayout";
import FormLoaderOverlay from "./FormLoaderOverlay";
import ActionButton from "../UIKit/ActionButton";
import FormButtons from "../UIKit/FormButtons";

const meta: Meta<typeof FormPageLayout> = {
	title: "Standalone/Form/FormPageLayout",
	component: FormPageLayout,
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
	},
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

/**
 * Outlined fields with values: their shrunk labels have z-index 1, like in every
 * DefaultFormPage.
 */
const Fields = ({ count }: { count: number }) => (
	<Grid container spacing={2}>
		{Array.from({ length: count }, (_, i) => (
			<Grid size={12} key={i}>
				<TextField
					label={`A rather long label for field number ${i}`}
					defaultValue={`value ${i}`}
					fullWidth
				/>
			</Grid>
		))}
	</Grid>
);

const SaveBackButtons = () => (
	<FormButtons>
		<ActionButton>Save</ActionButton>
		<ActionButton>Back</ActionButton>
	</FormButtons>
);

/**
 * The supported host: the Dialog paper is positioned, DialogContent scrolls.
 */
const DialogForm = ({ count }: { count: number }) => (
	<Dialog open maxWidth={"sm"} fullWidth aria-labelledby={"form-title"}>
		<DialogTitle id={"form-title"}>Edit device</DialogTitle>
		<DialogContent data-testid={"content"}>
			<FormPageLayout
				body={<Fields count={count} />}
				footer={<SaveBackButtons />}
				other={<FormLoaderOverlay visible={false} />}
			/>
		</DialogContent>
	</Dialog>
);

type Rect = Pick<DOMRect, "top" | "bottom" | "left" | "right">;
const rectOf = (el: Element): Rect => {
	const { top, bottom, left, right } = el.getBoundingClientRect();
	return { top, bottom, left, right };
};
const overlapY = (a: Rect, b: Rect) =>
	Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
const overlapsX = (a: Rect, b: Rect) => a.left < b.right && a.right > b.left;
const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export const Issue3473Item1FooterAboveFieldLabels: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-1: the footer has no z-index, so an outlined field's label (z-index 1) scrolled under the Save button is painted over it and takes the click.",
			},
		},
	},
	render: () => <DialogForm count={15} />,
	play: async () => {
		const screen = within(document.body);
		const save = await screen.findByRole("button", { name: "Save" });
		const content = screen.getByTestId("content");
		const saveRect = rectOf(save);
		const label = Array.from(content.querySelectorAll("label")).find((el) => {
			const r = rectOf(el);
			return r.top >= saveRect.bottom && overlapsX(r, saveRect);
		});
		if (!label) throw new Error("no field label below the Save button");
		// scroll the label's centre onto the Save button's centre
		const labelRect = rectOf(label);
		content.scrollTop +=
			(labelRect.top + labelRect.bottom) / 2 -
			(saveRect.top + saveRect.bottom) / 2;
		await nextFrame();

		const l = rectOf(label);
		const s = rectOf(save);
		await expect(overlapY(l, s)).toBeGreaterThan(0);
		const x = (Math.max(l.left, s.left) + Math.min(l.right, s.right)) / 2;
		const y = (s.top + s.bottom) / 2;
		const hit = document.elementFromPoint(x, y);
		await expect(
			hit?.closest("button"),
			`the point on Save hits ${hit?.tagName} "${hit?.textContent}"`,
		).toBe(save);
	},
};

export const Issue3473Item1FooterAboveRaisedBodyContent: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-1: body content with a z-index far above a label's, like the DataGrid's settings panel (z-index 1000), scrolled under the Save button still stays below the footer and does not take its clicks.",
			},
		},
	},
	render: () => (
		<Dialog open maxWidth={"sm"} fullWidth aria-labelledby={"form-title"}>
			<DialogTitle id={"form-title"}>Edit device</DialogTitle>
			<DialogContent data-testid={"content"}>
				<FormPageLayout
					body={
						<>
							<Fields count={12} />
							<Box
								data-testid={"raised"}
								sx={{
									position: "relative",
									zIndex: 1000,
									height: 120,
									mt: 2,
									bgcolor: "background.paper",
									border: 1,
								}}
							>
								<Typography>Grid settings</Typography>
							</Box>
							<Fields count={8} />
						</>
					}
					footer={<SaveBackButtons />}
					other={<FormLoaderOverlay visible={false} />}
				/>
			</DialogContent>
		</Dialog>
	),
	play: async () => {
		const screen = within(document.body);
		const save = await screen.findByRole("button", { name: "Save" });
		const content = screen.getByTestId("content");
		const raised = screen.getByTestId("raised");
		// scroll the raised panel's centre onto the Save button's centre
		const saveRect = rectOf(save);
		const raisedRect = rectOf(raised);
		content.scrollTop +=
			(raisedRect.top + raisedRect.bottom) / 2 -
			(saveRect.top + saveRect.bottom) / 2;
		await nextFrame();

		// the panel lies under the whole Save button
		const r = rectOf(raised);
		const s = rectOf(save);
		await expect(r.top).toBeLessThanOrEqual(s.top);
		await expect(r.bottom).toBeGreaterThanOrEqual(s.bottom);
		await expect(r.left).toBeLessThanOrEqual(s.left);
		await expect(r.right).toBeGreaterThanOrEqual(s.right);
		const hit = document.elementFromPoint(
			(s.left + s.right) / 2,
			(s.top + s.bottom) / 2,
		);
		await expect(
			hit?.closest("button"),
			`the point on Save hits ${hit?.tagName} "${hit?.textContent}"`,
		).toBe(save);
	},
};
