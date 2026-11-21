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

// ---------------------------------------------------------------------------
// Bug stories: each asserts the expected behavior and fails until its BUGS.md entry is fixed
// ---------------------------------------------------------------------------

export const Issue3490Item7PreviewDialogHasAName: Story = {
	args: { open: true },
	parameters: {
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["aria-dialog-name"] } },
		},
		docs: {
			description: {
				story:
					'ISSUE-3490-ITEM-7: the preview dialog has no accessible name: MUI points `aria-labelledby` at a title id that no element carries, so a screen reader announces just "dialog" (axe `aria-dialog-name`). The image\'s alt is the obvious name.',
			},
		},
	},
	play: async () => {
		await getDialogImage();
	},
};

/**
 * The open preview passes every axe rule: the dialog is named by the image's alt, and a
 * screen reader announces that name when it opens.
 */
export const Issue3490Item7OpenPreviewPassesAxe: Story = {
	args: { open: true },
	parameters: { a11y: { test: "error" } },
	play: async () => {
		await getDialogImage();
		await expect(
			within(document.body).getByRole("dialog", { name: "Test image" }),
		).toBeInTheDocument();
	},
};

export const Issue3490Item8ZoomsByKeyboard: Story = {
	args: { open: true },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3490-ITEM-8: zoom and pan work by wheel, pinch, double-click and drag only. A keyboard user can rotate the image but never enlarge it. Expected: a zoom-in button, or the + key, zooms in.",
			},
		},
	},
	play: async ({ userEvent }) => {
		const { dialog, image } = await getDialogImage();
		const zoomIn = dialog.queryByRole("button", { name: /zoom in/i });
		if (zoomIn) {
			zoomIn.focus();
			await userEvent.keyboard("{Enter}");
		} else {
			dialog.getByRole("button", { name: "Close" }).focus();
			await userEvent.keyboard("+");
		}
		await expect(readTransform(image).scale).toBeGreaterThan(1);
	},
};

const TOOLBAR = [
	"Rotate left",
	"Rotate right",
	"Zoom in",
	"Zoom out",
	"Reset zoom",
];

/** The toolbar's buttons sit in one row, in this order, apart from each other and from Close */
const expectToolbarRow = async (
	dialog: Awaited<ReturnType<typeof getDialogImage>>["dialog"],
) => {
	const boxes = TOOLBAR.map((name) =>
		dialog.getByRole("button", { name }).getBoundingClientRect(),
	);
	const close = dialog
		.getByRole("button", { name: "Close" })
		.getBoundingClientRect();
	for (let i = 1; i < boxes.length; i++) {
		await expect(boxes[i].top, TOOLBAR[i]).toBeCloseTo(boxes[0].top);
		await expect(boxes[i].left, TOOLBAR[i]).toBeGreaterThanOrEqual(
			boxes[i - 1].right,
		);
	}
	await expect(boxes[0].left).toBeGreaterThanOrEqual(0);
	await expect(boxes[boxes.length - 1].right).toBeLessThanOrEqual(close.left);
	await expect(close.right).toBeLessThanOrEqual(window.innerWidth);
};

/** Dispatches a keydown on the focused element, as the keyboard would */
const pressKey = (key: string, init?: KeyboardEventInit) => {
	const evt = new KeyboardEvent("keydown", {
		key,
		bubbles: true,
		cancelable: true,
		...init,
	});
	(document.activeElement ?? document.body).dispatchEvent(evt);
	return evt;
};

/**
 * With the focus anywhere in the open preview, + and - zoom by 1.5 and keep the centre of the
 * view in view, the arrow keys pan by a tenth of the view while zoomed in, and 0 resets. The
 * grab cursor shows only while zoomed in. At 1× the arrow keys are left to the page, and
 * Ctrl with + to the browser.
 */
export const Issue3490Item8KeysZoomAndPan: Story = {
	args: { open: true },
	parameters: { a11y: { test: "error" } },
	play: async ({ userEvent }) => {
		const { image } = await getDialogImage();
		const dialog = within(document.body).getByRole("dialog");
		const container = image.parentElement;
		if (!container) throw new Error("container not found");
		// the dialog takes the focus when it opens
		await waitFor(() =>
			expect(dialog.parentElement?.contains(document.activeElement)).toBe(true),
		);
		await expect(getComputedStyle(container).cursor).not.toBe("grab");
		await expect(pressKey("ArrowRight").defaultPrevented).toBe(false);
		await expect(pressKey("+", { ctrlKey: true }).defaultPrevented).toBe(false);
		let transform = readTransform(image);
		await expect([transform.scale, transform.x, transform.y]).toEqual([
			1, 0, 0,
		]);

		await userEvent.keyboard("+");
		await expect(readTransform(image).scale).toBeCloseTo(1.5);
		await expect(getComputedStyle(container).cursor).toBe("grab");
		await userEvent.keyboard("+");
		await expect(readTransform(image).scale).toBeCloseTo(2.25);

		const { width, height } = container.getBoundingClientRect();
		// the view moves right and down, so the image moves left and up
		await userEvent.keyboard("{ArrowRight}{ArrowDown}");
		transform = readTransform(image);
		await expect(transform.x).toBeCloseTo(-width / 10);
		await expect(transform.y).toBeCloseTo(-height / 10);
		await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowUp}");
		transform = readTransform(image);
		await expect(transform.x).toBeCloseTo(width / 10);
		await expect(transform.y).toBeCloseTo(0);
		await expect(pressKey("ArrowDown").defaultPrevented).toBe(true);

		// the point in the centre of the view stays there
		await userEvent.keyboard("-");
		transform = readTransform(image);
		await expect(transform.scale).toBeCloseTo(1.5);
		await expect(transform.x).toBeCloseTo(width / 15);

		await userEvent.keyboard("0");
		transform = readTransform(image);
		await expect([transform.scale, transform.x, transform.y]).toEqual([
			1, 0, 0,
		]);
		await expect(getComputedStyle(container).cursor).not.toBe("grab");
	},
};

/**
 * Zoom in, Zoom out and Reset zoom sit right of the rotate buttons, across from Close. Each
 * click zooms one step, between 1× and 10×, and the focus stays on the button.
 */
export const Issue3490Item8ZoomButtons: Story = {
	args: { open: true },
	parameters: { a11y: { test: "error" } },
	play: async ({ userEvent }) => {
		const { dialog, image } = await getDialogImage();
		await expectToolbarRow(dialog);
		const zoomIn = dialog.getByRole("button", { name: "Zoom in" });
		const zoomOut = dialog.getByRole("button", { name: "Zoom out" });
		await userEvent.click(zoomOut);
		await expect(readTransform(image).scale).toBe(1);
		await userEvent.click(zoomIn);
		await expect(readTransform(image).scale).toBeCloseTo(1.5);
		for (let i = 0; i < 10; i++) await userEvent.click(zoomIn);
		await expect(readTransform(image).scale).toBeCloseTo(10);
		await userEvent.click(zoomOut);
		await expect(readTransform(image).scale).toBeCloseTo(10 / 1.5);
		await expect(zoomOut).toHaveFocus();
		await userEvent.click(dialog.getByRole("button", { name: "Reset zoom" }));
		await expect(readTransform(image).scale).toBe(1);
	},
};

/** At phone width the toolbar fits in one row left of Close, and nothing scrolls sideways */
export const Issue3490Item8ToolbarFitsAPhone: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	args: { open: true },
	parameters: { a11y: { test: "error" } },
	play: async () => {
		const { dialog } = await getDialogImage();
		await expect(window.innerWidth).toBe(320);
		await expectToolbarRow(dialog);
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
	},
};
