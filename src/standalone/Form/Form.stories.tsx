import React, { useCallback, useState } from "react";
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
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
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

/**
 * An import step: a file name and a Start button that makes the step busy until "Finish
 * import", outside the busy area, is pressed. The overlay wraps the step.
 */
const BusyImportStep = () => {
	const [busy, setBusy] = useState(false);
	const start = useCallback(() => setBusy(true), []);
	const finish = useCallback(() => setBusy(false), []);
	return (
		<Box sx={{ p: 4 }}>
			<Button>Help</Button>
			<FormLoaderOverlay visible={busy}>
				<Box
					data-testid={"step"}
					sx={{ display: "flex", gap: 2, alignItems: "center", py: 2 }}
				>
					<TextField label={"File name"} defaultValue={"devices.csv"} />
					<Button variant={"contained"} onClick={start}>
						Start
					</Button>
				</Box>
			</FormLoaderOverlay>
			<Button onClick={finish}>Finish import</Button>
		</Box>
	);
};

export const Issue3473Item8WrappedContentIsInert: OverlayStory = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-8: the overlay wraps the content it covers (`children`) and makes it inert while it is shown, so the keyboard reaches none of the controls the pointer cannot reach. Keyboard focus in the content moves to the wash when the overlay shows, and back when it hides.",
			},
		},
		a11y: { test: "error" },
	},
	render: () => <BusyImportStep />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const field = canvas.getByRole("textbox", { name: "File name" });
		const start = canvas.getByRole("button", { name: "Start" });
		start.focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByRole("progressbar");
		const overlay = canvasElement.querySelector<HTMLElement>(
			'[class*="CcFormLoaderOverlay-root"]',
		);
		if (!overlay) throw new Error("overlay not rendered");

		// the wash covers the wrapped content and nothing else
		await expect(rectOf(overlay)).toEqual(rectOf(canvas.getByTestId("step")));
		// keyboard focus moved to the wash, not to the page
		await expect(overlay).toHaveFocus();
		// no enabled control under the wash: the keyboard cannot reach what the
		// pointer cannot
		const coveredButOperable = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(
				"a[href], button, input, select, textarea, [tabindex]",
			),
		)
			.filter(
				(el) =>
					!overlay.contains(el) &&
					!(el as HTMLButtonElement).disabled &&
					!el.closest("[inert]") &&
					overlay.contains(hitAtCenter(el)),
			)
			.map((el) => el.textContent || el.tagName);
		await expect(coveredButOperable).toEqual([]);
		await expect(field.closest("[inert]")).not.toBeNull();
		for (const control of [field, start]) {
			control.focus();
			await expect(control).not.toHaveFocus();
		}

		// a click that leaves the focus where it is
		await fireEvent.click(
			canvas.getByRole("button", { name: "Finish import" }),
		);
		await waitFor(() => expect(start).toHaveFocus());
		await expect(start.closest("[inert]")).toBeNull();
	},
};
