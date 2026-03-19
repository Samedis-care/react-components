import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, within } from "storybook/test";
import ImagePreviewDialog from "./ImagePreviewDialog";
import { Button } from "@mui/material";

// A small checkerboard SVG so zooming is visually meaningful
const CHECKER_IMAGE =
	"data:image/svg+xml;base64," +
	btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
<rect width="200" height="200" fill="#fff"/>
<rect x="0" y="0" width="50" height="50" fill="#4caf50"/>
<rect x="100" y="0" width="50" height="50" fill="#4caf50"/>
<rect x="50" y="50" width="50" height="50" fill="#4caf50"/>
<rect x="150" y="50" width="50" height="50" fill="#4caf50"/>
<rect x="0" y="100" width="50" height="50" fill="#4caf50"/>
<rect x="100" y="100" width="50" height="50" fill="#4caf50"/>
<rect x="50" y="150" width="50" height="50" fill="#4caf50"/>
<rect x="150" y="150" width="50" height="50" fill="#4caf50"/>
</svg>`);

const meta: Meta<typeof ImagePreviewDialog> = {
	title: "Standalone/FileUpload/ImagePreviewDialog",
	component: ImagePreviewDialog,
	parameters: { layout: "centered" },
	args: {
		src: CHECKER_IMAGE,
		alt: "Test image",
		open: false,
		onClose: fn(),
	},
};
export default meta;

type Story = StoryObj<typeof ImagePreviewDialog>;

// ---------------------------------------------------------------------------
// Interactive story — user opens/closes the dialog
// ---------------------------------------------------------------------------

const InteractiveTemplate = () => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="contained" onClick={() => setOpen(true)}>
				Open preview
			</Button>
			<ImagePreviewDialog
				src={CHECKER_IMAGE}
				alt="Checkerboard"
				open={open}
				onClose={() => setOpen(false)}
			/>
		</>
	);
};

export const Interactive: Story = {
	render: () => <InteractiveTemplate />,
};

// ---------------------------------------------------------------------------
// Wheel zoom — tests the real open-from-closed flow
// ---------------------------------------------------------------------------

export const WheelZoom: Story = {
	render: () => <InteractiveTemplate />,
	play: async ({ canvas, userEvent }) => {
		// Open the dialog via button click (starts closed, like real usage)
		const openBtn = await canvas.findByText("Open preview");
		await userEvent.click(openBtn);

		const body = within(document.body);
		const dialog = await body.findByRole("dialog");
		const image = dialog.querySelector("img");
		if (!image) throw new Error("img not found in dialog");

		// Initial state: zoom 1
		await expect(image.style.transform).toContain("scale(1)");

		// Dispatch a native wheel event (zoom in) on the container
		const container = image.parentElement;
		if (!container) throw new Error("image parent not found");
		container.dispatchEvent(
			new WheelEvent("wheel", {
				deltaY: -120,
				bubbles: true,
				cancelable: true,
			}),
		);

		await new Promise((r) => setTimeout(r, 100));

		// Should be zoomed in (scale > 1)
		const match = image.style.transform.match(/scale\(([^)]+)\)/);
		const scale = match ? parseFloat(match[1]) : 1;
		await expect(scale).toBeGreaterThan(1);
	},
};

// ---------------------------------------------------------------------------
// Opens the dialog and verifies close button works
// ---------------------------------------------------------------------------

export const OpensAndCloses: Story = {
	args: {
		open: true,
	},
	play: async ({ userEvent, args }) => {
		// Dialog renders in a portal, so query from document body
		const body = within(document.body);
		const dialog = await body.findByRole("dialog");
		const screen = within(dialog);
		const closeButton = await screen.findByRole("button");
		await userEvent.click(closeButton);
		await expect(args.onClose).toHaveBeenCalled();
	},
};

// ---------------------------------------------------------------------------
// Verifies the image is rendered
// ---------------------------------------------------------------------------

export const RendersImage: Story = {
	args: {
		open: true,
	},
	play: async () => {
		const body = within(document.body);
		const dialog = await body.findByRole("dialog");
		const screen = within(dialog);
		const image = await screen.findByRole("img");
		await expect(image).toBeInTheDocument();
		await expect(image).toHaveAttribute("alt", "Test image");
		await expect(image).toHaveAttribute("src");
	},
};

// ---------------------------------------------------------------------------
// Double-click toggles zoom
// ---------------------------------------------------------------------------

export const DoubleClickZoom: Story = {
	args: {
		open: true,
	},
	play: async ({ userEvent }) => {
		const body = within(document.body);
		const dialog = await body.findByRole("dialog");
		const screen = within(dialog);
		const image = await screen.findByRole("img");
		const container = image.parentElement;
		if (!container) throw new Error("container not found");

		// Initial state: no zoom (scale 1)
		await expect(image.style.transform).toContain("scale(1)");

		// Double-click the container to zoom in
		await userEvent.dblClick(container);

		// Should now be zoomed to 2x
		await expect(image.style.transform).toContain("scale(2)");

		// Double-click again to zoom back out
		await userEvent.dblClick(container);
		await expect(image.style.transform).toContain("scale(1)");
	},
};
