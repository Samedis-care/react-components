import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, mocked, waitFor, within } from "storybook/test";
import DialogContextProvider from "../../framework/DialogContextProvider";
import SignaturePadCanvas, { SignaturePadCanvasProps } from "./SignaturePad";
import { setFrameworkHistory } from "../../framework/History";
import { createMemoryHistory } from "history";

setFrameworkHistory(createMemoryHistory());

const DialogDecorator = (Story: React.ComponentType) => (
	<DialogContextProvider>
		<Story />
	</DialogContextProvider>
);

// A small transparent PNG as placeholder signature
const SAMPLE_SIGNATURE =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYV2P8z8BQz0BBwMgwqpBiSwEACJkFC4MpBzEAAAAASUVORK5CYII=";

const PAD_BOX = { width: 400, height: 200 };

interface PadHostProps extends Omit<
	SignaturePadCanvasProps,
	"signature" | "setSignature"
> {
	/**
	 * The value the host starts with
	 */
	initial: string | null;
	/**
	 * Spy for SignaturePad's setSignature; the host also stores the value
	 */
	setSignature: (value: string) => void;
}

/** a controlled host, the way an app holds the value */
const PadHost = ({ initial, setSignature, ...props }: PadHostProps) => {
	const [signature, setStored] = useState(initial);
	const save = useCallback(
		(value: string) => {
			setSignature(value);
			setStored(value);
		},
		[setSignature],
	);
	return (
		<Box sx={PAD_BOX}>
			<SignaturePadCanvas
				{...props}
				signature={signature}
				setSignature={save}
			/>
		</Box>
	);
};

const meta: Meta<typeof PadHost> = {
	title: "non-standalone/SignaturePad",
	component: PadHost,
	decorators: [DialogDecorator],
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"A signature field: the SignPad tile, which opens the drawing dialog (SignDialog) through `useDialogContext`, so it needs the Framework or a `DialogContextProvider` above it. Controlled: pass the value as `signature`; `setSignature` is called when the user presses Save in the dialog. These stories wrap it in a host that stores what it saves. Inside a model Form use `ModelDataTypeSignatureRenderer` instead.",
			},
		},
	},
	args: {
		initial: "",
		setSignature: fn(),
	},
	argTypes: {
		initial: {
			control: "text",
			description:
				'The host\'s starting value, passed to SignaturePad as `signature`: a `data:image/png;base64,...` URL, or `""`/`null` while unsigned.',
		},
		setSignature: {
			description:
				'Called once when the user presses Save in the dialog: with the drawn signature as a trimmed PNG data URL, with `""` for an empty or cleared canvas, or with the unchanged value when the stored signature was shown and not cleared. Never while drawing, never on close.',
		},
		signerName: {
			control: "text",
			description:
				'Shown in the dialog title ("Sign here (NAME)") and in the clear confirmation; trimmed. Not shown on the tile.',
		},
		disabled: {
			control: "boolean",
			description: "When true, a click on the tile does not open the dialog.",
		},
		penColor: {
			control: "color",
			description:
				'Ink color for new strokes, any CSS color; it is baked into the saved PNG. Default "blue".',
		},
		name: {
			control: "text",
			description:
				"Field name for a Form's blur handling: set on the dialog's hidden input and as `data-name` on its sign area while the dialog is open.",
		},
		openInfo: {
			description:
				'When set, the tile shows an info button ("More information") that calls it.',
		},
	},
};

export default meta;

type Story = StoryObj<typeof PadHost>;

// ─── helpers (the dialog is portaled to document.body) ────────────────────────

const tileIn = (canvasElement: HTMLElement) => {
	const el = canvasElement.querySelector('[class*="CcSignPad-root"]');
	if (!(el instanceof HTMLElement)) throw new Error("tile missing");
	return el;
};

const dialogEl = () => document.querySelector<HTMLElement>('[role="dialog"]');

const signDivEl = () => {
	const el = document.querySelector('[class*="CcSignPadDialog-signDiv"]');
	if (!(el instanceof HTMLElement)) throw new Error("sign area missing");
	return el;
};

const signCanvas = () =>
	waitFor(() => {
		const el = document.querySelector('[role="dialog"] canvas');
		if (!(el instanceof HTMLCanvasElement)) throw new Error("no canvas yet");
		return el;
	});

const page = () => within(document.body);

const closeDialog = async () => {
	page().getByRole("button", { name: "Close" }).click();
	await waitFor(() => expect(dialogEl()).toBeNull());
};

/** the bitmap is the CSS box times the device pixel ratio, so ink lands under the pen */
const bitmapMatchesBox = (c: HTMLCanvasElement) => {
	const box = c.getBoundingClientRect();
	const dpr = Math.max(window.devicePixelRatio || 1, 1);
	return [
		[c.width, c.height],
		[Math.round(box.width * dpr), Math.round(box.height * dpr)],
	];
};

const pointer = (
	type: string,
	c: HTMLCanvasElement,
	[x, y]: [number, number],
	buttons: number,
) => {
	const r = c.getBoundingClientRect();
	return new PointerEvent(type, {
		clientX: r.left + x,
		clientY: r.top + y,
		buttons,
		button: 0,
		pointerId: 7,
		pointerType: "mouse",
		isPrimary: true,
		bubbles: true,
		cancelable: true,
		pressure: 0.5,
	});
};

/**
 * One pen stroke through three points (CSS px inside the canvas): press, move,
 * release. Dispatched at once; signature_pad throttles moves to one per 16ms,
 * so a single move per stroke is what it draws.
 */
const drawStroke = (
	c: HTMLCanvasElement,
	from: [number, number],
	via: [number, number],
	to: [number, number],
) => {
	c.dispatchEvent(pointer("pointerdown", c, from, 1));
	c.dispatchEvent(pointer("pointermove", c, via, 1));
	c.dispatchEvent(pointer("pointerup", c, to, 0));
};

const inkPixels = (c: HTMLCanvasElement) => {
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("the pad canvas has no 2d context");
	const d = ctx.getImageData(0, 0, c.width, c.height).data;
	let n = 0;
	for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
	return n;
};

const decodePng = async (src: string) => {
	const img = new Image();
	img.src = src;
	await img.decode();
	const k = document.createElement("canvas");
	k.width = img.naturalWidth;
	k.height = img.naturalHeight;
	const ctx = k.getContext("2d");
	if (!ctx) throw new Error("no 2d context to decode the PNG");
	ctx.drawImage(img, 0, 0);
	const d = ctx.getImageData(0, 0, k.width, k.height).data;
	let opaque = 0;
	let strongest = [0, 0, 0, 0];
	for (let i = 0; i < d.length; i += 4) {
		if (d[i + 3]) opaque++;
		if (d[i + 3] > strongest[3])
			strongest = [d[i], d[i + 1], d[i + 2], d[i + 3]];
	}
	return { width: k.width, height: k.height, opaque, strongest };
};

// ─── stories ─────────────────────────────────────────────────────────────────

export const EmptyPad: Story = {};

export const WithExistingSignature: Story = {
	args: {
		initial: SAMPLE_SIGNATURE,
		signerName: "John Doe",
	},
};

export const DisabledPad: Story = {
	args: { disabled: true },
};

// ─── bug pins ────────────────────────────────────────────────────────────────

export const Issue3467Item14KeyboardOpensPadAndRestoresFocus: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3467-ITEM-14: Tab skips the tile (a plain div with only onClick), so the dialog cannot be opened by keyboard, and after a mouse user closes it focus falls to the page body. Expected: Tab reaches a button named by the prompt, Enter opens the dialog, and closing it returns focus to that button.",
			},
		},
	},
	render: (args) => (
		<>
			<button>Before</button>
			<PadHost {...args} />
		</>
	),
	play: async ({ canvas, userEvent }) => {
		canvas.getByRole("button", { name: "Before" }).focus();
		await userEvent.tab();
		const activator = canvas.getByRole("button", { name: /sign/i });
		await expect(activator).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(dialogEl()).not.toBeNull());
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(dialogEl()).toBeNull());
		await expect(activator, "focus after closing the dialog").toHaveFocus();
	},
};

export const Issue3467Item14MouseCloseReturnsFocusToTile: Story = {
	args: { initial: SAMPLE_SIGNATURE, signerName: "Alice Müller" },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3467-ITEM-14: the tile's button is named after the stored signature and its signer. A click opens the dialog, and closing it with the close button returns focus to the tile instead of the page body.",
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const activator = canvas.getByRole("button", {
			name: "Signature (Alice Müller)",
		});
		await userEvent.click(activator);
		await waitFor(() => expect(dialogEl()).not.toBeNull());
		await userEvent.click(
			await waitFor(() => {
				const dialog = dialogEl();
				if (!dialog) throw new Error("the sign dialog is not open");
				return within(dialog).getByRole("button", { name: "Close" });
			}),
		);
		await waitFor(() => expect(dialogEl()).toBeNull());
		await expect(activator, "focus after closing the dialog").toHaveFocus();
	},
};

export const Issue3467Item1ResizeAfterDrawingNeverSavesBlankImage: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3467-ITEM-1: draw, then the sign area changes size (phone rotated, window resized): the canvas is re-dimensioned and blank, but the pad still counts as signed, so Save stores a 1x1 transparent PNG. Expected: the ink survives the resize, or a blank pad saves "".',
			},
		},
		// the play leaves no dialog open when it passes; on failure it may
		a11y: { test: "todo" },
	},
	play: async ({ canvasElement, args }) => {
		tileIn(canvasElement).click();
		const c = await signCanvas();
		drawStroke(c, [40, 40], [120, 80], [200, 90]);
		await expect(inkPixels(c)).toBeGreaterThan(0);

		signDivEl().style.width = "300px";
		window.dispatchEvent(new Event("resize"));
		// wait until the canvas has been re-dimensioned to its new box
		await waitFor(
			async () => {
				const [bitmap, box] = bitmapMatchesBox(await signCanvas());
				await expect(bitmap).toEqual(box);
			},
			{ timeout: 2000 },
		);

		page().getByRole("button", { name: "Save Changes" }).click();
		await waitFor(() => expect(dialogEl()).toBeNull());
		await expect(args.setSignature).toHaveBeenCalledTimes(1);
		const saved = mocked(args.setSignature).mock.calls[0][0];
		if (saved !== "") {
			const png = await decodePng(saved);
			await expect(
				png.opaque,
				`ink pixels in the saved ${png.width}x${png.height} PNG`,
			).toBeGreaterThan(0);
		}
	},
};

export const Issue3467Item1BlankBitmapSavesEmptyValue: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3467-ITEM-1: the pad has strokes, but its bitmap is blank (the browser dropped the canvas content): Save stores "", as for an empty pad, never a blank image.',
			},
		},
		// the play leaves no dialog open when it passes; on failure it may
		a11y: { test: "todo" },
	},
	play: async ({ canvasElement, args }) => {
		tileIn(canvasElement).click();
		const c = await signCanvas();
		drawStroke(c, [40, 40], [120, 80], [200, 90]);
		await expect(inkPixels(c)).toBeGreaterThan(0);
		// setting the size clears the bitmap; the pad keeps its strokes
		// eslint-disable-next-line no-self-assign
		c.width = c.width;
		await expect(inkPixels(c)).toBe(0);

		page().getByRole("button", { name: "Save Changes" }).click();
		await waitFor(() => expect(dialogEl()).toBeNull());
		await expect(args.setSignature).toHaveBeenCalledTimes(1);
		await expect(args.setSignature).toHaveBeenCalledWith("");
		await expect(tileIn(canvasElement).querySelector("img")).toBeNull();
	},
};

export const Issue3467Item1ResizeRedrawsInk: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3467-ITEM-1: draw, then the sign area changes size: the strokes are drawn again, in their pen color, into the re-dimensioned canvas, and Save stores them.",
			},
		},
		// the play leaves no dialog open when it passes; on failure it may
		a11y: { test: "todo" },
	},
	play: async ({ canvasElement, args }) => {
		tileIn(canvasElement).click();
		const c = await signCanvas();
		drawStroke(c, [40, 40], [120, 80], [200, 90]);
		await expect(inkPixels(c)).toBeGreaterThan(0);

		signDivEl().style.width = "300px";
		window.dispatchEvent(new Event("resize"));
		await waitFor(
			async () => {
				const [bitmap, box] = bitmapMatchesBox(c);
				await expect(bitmap).toEqual(box);
			},
			{ timeout: 2000 },
		);
		await expect(inkPixels(c), "ink after the resize").toBeGreaterThan(0);

		page().getByRole("button", { name: "Save Changes" }).click();
		await waitFor(() => expect(dialogEl()).toBeNull());
		await expect(args.setSignature).toHaveBeenCalledTimes(1);
		const png = await decodePng(mocked(args.setSignature).mock.calls[0][0]);
		await expect(png.opaque).toBeGreaterThan(0);
		await expect(png.strongest).toEqual([0, 0, 255, 255]);
	},
};

export const Issue3467Item2ResizeAfterClearKeepsInkUnderPen: Story = {
	args: { initial: SAMPLE_SIGNATURE },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3467-ITEM-2: on a stored signature press Clear, Yes, then the sign area changes size: the canvas keeps its old bitmap while its box shrinks, so the bitmap is scaled into the box and strokes land away from the pen. Expected: the bitmap follows the box (box size times devicePixelRatio).",
			},
		},
		a11y: { test: "todo" }, // the failing play leaves the dialog open
	},
	play: async ({ canvasElement, userEvent }) => {
		tileIn(canvasElement).click();
		await waitFor(() => expect(dialogEl()).not.toBeNull());
		await userEvent.click(
			page().getByRole("button", { name: "Clear signature" }),
		);
		await userEvent.click(
			within(
				await page().findByRole("dialog", { name: "Clear signature" }),
			).getByRole("button", { name: "Yes" }),
		);
		const c = await signCanvas();
		const [before, beforeBox] = bitmapMatchesBox(c);
		await expect(before).toEqual(beforeBox);

		signDivEl().style.width = "300px";
		window.dispatchEvent(new Event("resize"));
		await waitFor(
			async () => {
				const [bitmap, box] = bitmapMatchesBox(await signCanvas());
				await expect(
					bitmap,
					"canvas bitmap vs. its box after the resize",
				).toEqual(box);
			},
			{ timeout: 2000 },
		);
		await closeDialog();
	},
};

/**
 * Where the ink shows on screen: the bounding box of the inked pixels, in CSS
 * px from the canvas's top left corner, for a bitmap that fills its box
 */
const inkBounds = (c: HTMLCanvasElement) => {
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("no 2d context");
	const d = ctx.getImageData(0, 0, c.width, c.height).data;
	const box = c.getBoundingClientRect();
	const [sx, sy] = [box.width / c.width, box.height / c.height];
	let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
	for (let y = 0; y < c.height; y++)
		for (let x = 0; x < c.width; x++)
			if (d[(y * c.width + x) * 4 + 3]) {
				left = Math.min(left, x * sx);
				top = Math.min(top, y * sy);
				right = Math.max(right, (x + 1) * sx);
				bottom = Math.max(bottom, (y + 1) * sy);
			}
	return { left, top, right, bottom };
};

/** a stroke's ink reaches about 3 CSS px beyond the points it went through */
const expectNear = (actual: number, expected: number, what: string) =>
	expect(Math.abs(actual - expected), `${what}: ${actual}`).toBeLessThan(5);

export const Issue3467Item2ResizeAfterClearDrawsUnderPen: Story = {
	args: { initial: SAMPLE_SIGNATURE },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3467-ITEM-2: on a stored signature press Clear, Yes and draw, then the sign area narrows: the stroke drawn before stays where it was drawn, and a new stroke shows under the pen.",
			},
		},
		// the play leaves no dialog open when it passes; on failure it may
		a11y: { test: "todo" },
	},
	play: async ({ canvasElement, userEvent }) => {
		tileIn(canvasElement).click();
		await waitFor(() => expect(dialogEl()).not.toBeNull());
		await userEvent.click(
			page().getByRole("button", { name: "Clear signature" }),
		);
		await userEvent.click(
			within(
				await page().findByRole("dialog", { name: "Clear signature" }),
			).getByRole("button", { name: "Yes" }),
		);
		const c = await signCanvas();
		// signature_pad draws a stroke from its first point to its second
		drawStroke(c, [20, 40], [60, 60], [100, 80]);

		signDivEl().style.width = "300px";
		window.dispatchEvent(new Event("resize"));
		await waitFor(
			async () => {
				const [bitmap, box] = bitmapMatchesBox(c);
				await expect(bitmap).toEqual(box);
			},
			{ timeout: 2000 },
		);
		const first = inkBounds(c);
		await expectNear(first.left, 20, "left edge of the first stroke");
		await expectNear(first.top, 40, "top edge of the first stroke");
		await expectNear(first.right, 60, "right edge of the first stroke");
		await expectNear(first.bottom, 60, "bottom edge of the first stroke");

		drawStroke(c, [200, 120], [260, 180], [280, 200]);
		const both = inkBounds(c);
		await expectNear(both.right, 260, "right edge of the second stroke");
		await expectNear(both.bottom, 180, "bottom edge of the second stroke");
		await closeDialog();
	},
};
