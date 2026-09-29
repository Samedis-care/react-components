import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, waitFor, within } from "storybook/test";
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

// Twice as wide as high, so a quarter turn changes the scale it fits at
const WIDE_IMAGE =
	"data:image/svg+xml;base64," +
	btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
<rect width="400" height="200" fill="#2196f3"/>
<rect width="100" height="100" fill="#ff9800"/>
</svg>`);

/**
 * Reads back what useImageZoomPan wrote into the image's transform. Browsers
 * may shorten `translate(x, 0px)` to `translate(x)`.
 */
const readTransform = (image: HTMLImageElement) => {
	const match =
		/translate\(([-\d.e]+)px(?:, ([-\d.e]+)px)?\) scale\(([-\d.e]+)\) rotate\(([-\d.e]+)deg\)/.exec(
			image.style.transform,
		);
	if (!match) throw new Error(`unexpected transform ${image.style.transform}`);
	const [x, y = "0", scale, rotation] = match.slice(1);
	return {
		x: parseFloat(x),
		y: parseFloat(y),
		scale: parseFloat(scale),
		rotation: parseFloat(rotation),
	};
};

const getDialogImage = async () => {
	const dialog = await within(document.body).findByRole("dialog");
	const image = await within(dialog).findByRole("img");
	if (!(image instanceof HTMLImageElement)) throw new Error("not an img");
	return { dialog: within(dialog), image };
};

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
		const closeButton = await screen.findByRole("button", { name: "Close" });
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

// ---------------------------------------------------------------------------
// Rotation
// ---------------------------------------------------------------------------

export const RotateFitsTurnedImage: Story = {
	args: {
		open: true,
		src: WIDE_IMAGE,
	},
	play: async ({ userEvent }) => {
		const { dialog, image } = await getDialogImage();
		await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0));
		await expect(readTransform(image).rotation).toBe(0);

		await userEvent.click(dialog.getByRole("button", { name: "Rotate right" }));
		const turned = readTransform(image);
		await expect(turned.rotation).toBe(90);

		// the picture as drawn: object-fit contain, scaled, width and height swapped
		const box = { width: image.offsetWidth, height: image.offsetHeight };
		const contain = Math.min(
			box.width / image.naturalWidth,
			box.height / image.naturalHeight,
		);
		const drawn = {
			width: image.naturalHeight * contain * turned.scale,
			height: image.naturalWidth * contain * turned.scale,
		};
		// fits the box, and fills it along one side
		await expect(drawn.width).toBeLessThanOrEqual(box.width + 0.5);
		await expect(drawn.height).toBeLessThanOrEqual(box.height + 0.5);
		await expect(
			Math.max(drawn.width / box.width, drawn.height / box.height),
		).toBeCloseTo(1, 3);

		await userEvent.click(dialog.getByRole("button", { name: "Rotate left" }));
		await userEvent.click(dialog.getByRole("button", { name: "Rotate left" }));
		await expect(readTransform(image).rotation).toBe(270);
	},
};

export const RotateKeepsPartInView: Story = {
	args: {
		open: true,
	},
	play: async ({ userEvent }) => {
		const { dialog, image } = await getDialogImage();
		const container = image.parentElement;
		if (!container) throw new Error("container not found");

		// zoom in and drag 50px to the right
		await userEvent.dblClick(container);
		const drag = (type: string, clientX: number) =>
			container.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					pointerType: "mouse",
					clientX,
					clientY: 100,
				}),
			);
		drag("pointerdown", 100);
		drag("pointermove", 150);
		drag("pointerup", 150);
		let transform = readTransform(image);
		await expect(transform.scale).toBeCloseTo(2);
		await expect(transform.x).toBeCloseTo(50);
		await expect(transform.y).toBeCloseTo(0);

		// a clockwise quarter turn carries the offset from right to below
		await userEvent.click(dialog.getByRole("button", { name: "Rotate right" }));
		transform = readTransform(image);
		await expect(transform.rotation).toBe(90);
		await expect(transform.scale).toBeCloseTo(2);
		await expect(transform.x).toBeCloseTo(0);
		await expect(transform.y).toBeCloseTo(50);

		await userEvent.click(dialog.getByRole("button", { name: "Rotate left" }));
		transform = readTransform(image);
		await expect(transform.rotation).toBe(0);
		await expect(transform.x).toBeCloseTo(50);
		await expect(transform.y).toBeCloseTo(0);
	},
};

export const WithoutRotation: Story = {
	args: {
		open: true,
		disableRotation: true,
	},
	play: async () => {
		const { dialog } = await getDialogImage();
		await expect(
			dialog.getByRole("button", { name: "Close" }),
		).toBeInTheDocument();
		await expect(
			dialog.queryByRole("button", { name: "Rotate left" }),
		).not.toBeInTheDocument();
		await expect(
			dialog.queryByRole("button", { name: "Rotate right" }),
		).not.toBeInTheDocument();
	},
};

export const RotationResetsOnReopen: Story = {
	render: () => <InteractiveTemplate />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(await canvas.findByText("Open preview"));
		const first = await getDialogImage();
		await userEvent.click(
			first.dialog.getByRole("button", { name: "Rotate right" }),
		);
		await expect(readTransform(first.image).rotation).toBe(90);

		await userEvent.click(first.dialog.getByRole("button", { name: "Close" }));
		await waitFor(() =>
			expect(within(document.body).queryByRole("dialog")).toBeNull(),
		);

		await userEvent.click(await canvas.findByText("Open preview"));
		const reopened = await getDialogImage();
		await expect(readTransform(reopened.image).rotation).toBe(0);
	},
};
