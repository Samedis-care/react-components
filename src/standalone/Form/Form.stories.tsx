import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	AppBar,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Snackbar,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import FormLoaderOverlay, { FormLoaderOverlayProps } from "./FormLoaderOverlay";

// --- FormLoaderOverlay ---

const WrappedFormLoaderOverlay = (props: FormLoaderOverlayProps) => (
	<Box
		sx={{
			position: "relative",
			width: 300,
			height: 200,
			border: "1px solid #ccc",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		}}
	>
		<Typography>Form Content</Typography>
		<FormLoaderOverlay {...props} />
	</Box>
);

const overlayMeta: Meta<typeof WrappedFormLoaderOverlay> = {
	title: "Standalone/Form/FormLoaderOverlay",
	component: WrappedFormLoaderOverlay,
	parameters: { layout: "centered" },
	argTypes: {
		visible: { control: "boolean" },
	},
};
export default overlayMeta;

type OverlayStory = StoryObj<typeof WrappedFormLoaderOverlay>;

type Rect = Pick<DOMRect, "top" | "bottom" | "left" | "right">;
const rectOf = (el: Element): Rect => {
	const { top, bottom, left, right } = el.getBoundingClientRect();
	return { top, bottom, left, right };
};
const hitAtCenter = (el: Element) => {
	const r = rectOf(el);
	return document.elementFromPoint(
		(r.left + r.right) / 2,
		(r.top + r.bottom) / 2,
	);
};

export const Visible: OverlayStory = {
	args: { visible: true },
};

export const Hidden: OverlayStory = {
	args: { visible: false },
};

export const Controllable: OverlayStory = {
	args: { visible: false },
};

export const Issue3473Item3DialogAboveBusyOverlay: OverlayStory = {
	args: { visible: true },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-3: a dialog opened while the overlay is shown (e.g. from a post-submit handler) opens above the wash, and its buttons can be clicked.",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<Box sx={{ position: "relative", height: "100vh" }}>
			<Typography>Form Content</Typography>
			<FormLoaderOverlay {...args} />
			<Dialog open aria-labelledby={"bug250-title"}>
				<DialogTitle id={"bug250-title"}>Occurrence info</DialogTitle>
				<DialogContent>
					<Button>Confirm</Button>
				</DialogContent>
			</Dialog>
		</Box>
	),
	play: async () => {
		const confirm = await within(document.body).findByRole("button", {
			name: "Confirm",
		});
		const hit = hitAtCenter(confirm);
		await expect(
			hit?.closest("button"),
			`Confirm's centre hits ${hit?.tagName}.${hit?.getAttribute("class")}`,
		).toBe(confirm);
	},
};

export const Issue3473Item3AppLayersAboveBusyOverlay: OverlayStory = {
	args: { visible: true },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-3: the overlay stays below MUI's app-level layers (`theme.zIndex`): an app bar, a snackbar and a tooltip over the busy area are shown above the wash and can be clicked.",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<Box sx={{ position: "relative", height: "100vh" }}>
			<AppBar position={"fixed"}>
				<Toolbar>
					<Button color={"inherit"}>Menu</Button>
				</Toolbar>
			</AppBar>
			<Box sx={{ pt: 12, pl: 4 }}>
				<Tooltip open title={"Saving the device"} placement={"right"}>
					<Typography component={"span"}>Form Content</Typography>
				</Tooltip>
			</Box>
			<FormLoaderOverlay {...args} />
			<Snackbar
				open
				message={"Changes saved"}
				action={
					<Button size={"small"} color={"inherit"}>
						Undo
					</Button>
				}
			/>
		</Box>
	),
	play: async () => {
		const body = within(document.body);
		const tooltip = await body.findByRole("tooltip");
		const onTop = (el: Element) => el.contains(hitAtCenter(el));
		await expect({
			appBar: onTop(body.getByRole("button", { name: "Menu" })),
			snackbar: onTop(body.getByRole("button", { name: "Undo" })),
			tooltip: onTop(tooltip),
		}).toEqual({ appBar: true, snackbar: true, tooltip: true });
	},
};

export const Issue3473Item3BusyOverlayCoversRaisedContent: OverlayStory = {
	args: { visible: true },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-3: the overlay still covers the content of the area it is placed in that has a z-index of its own, also when it comes before that content: the shrunk label of an outlined field (z-index 1) and a raised button bar (z-index 10).",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<Box sx={{ position: "relative", height: "100vh", p: 4 }}>
			<FormLoaderOverlay {...args} />
			<TextField label={"Device name"} defaultValue={"Infusion pump"} />
			<Box sx={{ position: "relative", zIndex: 10, mt: 4 }}>
				<Button variant={"contained"}>Save</Button>
			</Box>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const overlay = canvasElement.querySelector(
			'[class*="CcFormLoaderOverlay-root"]',
		);
		const label = canvasElement.querySelector("label");
		if (!overlay || !label) throw new Error("overlay or label not rendered");
		const covered = (el: Element) => overlay.contains(hitAtCenter(el));
		await expect({
			label: covered(label),
			buttonBar: covered(canvas.getByRole("button", { name: "Save" })),
		}).toEqual({ label: true, buttonBar: true });
	},
};
