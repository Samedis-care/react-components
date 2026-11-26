import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import MultiImage, { MultiImageImage, MultiImageProps } from "./MultiImage";
import ImageBox from "./ImageBox";
import {
	edgesPast,
	pageScrollsSideways,
} from "../../../stories/test-utils/hiddenTextLayout";

const svg = (width: number, height: number, body: string) =>
	"data:image/svg+xml;base64," +
	btoa(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`,
	);

const solid = (color: string, width = 160, height = 120) =>
	svg(
		width,
		height,
		`<rect width="${width}" height="${height}" fill="${color}"/>`,
	);

// graphics of the add and camera tiles: the library ships none, apps pass their own
const ADD_TILE = svg(
	64,
	64,
	'<rect width="64" height="64" fill="#eeeeee"/><path d="M32 16v32M16 32h32" stroke="#616161" stroke-width="6"/>',
);

const CAMERA_TILE = svg(
	64,
	64,
	'<rect width="64" height="64" fill="#eeeeee"/><circle cx="32" cy="34" r="12" fill="#616161"/>',
);

const COLORS = ["#e53935", "#43a047", "#1e88e5", "#fdd835", "#8e24aa"];

const makeImages = (count: number): MultiImageImage[] =>
	Array.from({ length: count }, (_, i) => ({
		id: `img-${i}`,
		image: solid(COLORS[i % COLORS.length]),
		name: `photo-${i + 1}.png`,
	}));

type OwnerArgs = Omit<MultiImageProps, "images" | "primary"> & {
	/** the images the owner starts with */
	initialImages: MultiImageImage[];
	/** the primary image id the owner starts with */
	initialPrimary: string | null;
	/** style of the box around the field */
	box?: React.CSSProperties;
};

/**
 * Holds images and primary like a form does: what the callbacks deliver is passed back
 */
const Owner = (args: OwnerArgs) => {
	const {
		initialImages,
		initialPrimary,
		box,
		onChange,
		onPrimaryChange,
		...rest
	} = args;
	const [images, setImages] = useState(initialImages);
	const [primary, setPrimary] = useState(initialPrimary);
	return (
		<div style={box ?? { width: 300 }}>
			<MultiImage
				{...rest}
				images={images}
				primary={primary}
				onChange={(name, list) => {
					onChange?.(name, list);
					setImages(list);
				}}
				onPrimaryChange={(name, id) => {
					onPrimaryChange?.(name, id);
					setPrimary(id);
				}}
			/>
		</div>
	);
};

// Every ImageBox image is alt="" but gets an aria-label from its file-name Tooltip, which
// axe reports as presentation-role-conflict (ISSUE-3491-ITEM-27, pinned by Issue3491Item27ImagesHaveNoRoleConflict).
// The other rules gate these stories.
const AXE_GATE = {
	a11y: {
		test: "error",
		config: { rules: [{ id: "presentation-role-conflict", enabled: false }] },
	},
} as const;

const pageBox = (canvasElement: HTMLElement) => {
	const box = canvasElement.querySelector<HTMLElement>(
		'[class*="CcMultiImage-root"] [class*="CcImageBox-root"]',
	);
	if (!box) throw new Error("no page preview");
	return box;
};

const openFullScreen = async (canvasElement: HTMLElement) => {
	pageBox(canvasElement).click();
	return within(document.body).findByRole("dialog");
};

const openEditDialog = async (canvasElement: HTMLElement) => {
	within(canvasElement).getByText("Edit").click();
	return within(document.body).findByRole("dialog");
};

const rectOf = (element: Element | null) => {
	if (!element) throw new Error("element not found");
	return element.getBoundingClientRect();
};

/**
 * Reads back what the zoom hook wrote into the image's transform. Browsers may shorten
 * `translate(x, 0px)` to `translate(x)`.
 */
const readScale = (image: HTMLImageElement) => {
	const match = /scale\(([-\d.e]+)\)/.exec(image.style.transform);
	return match ? parseFloat(match[1]) : 1;
};

const meta: Meta<OwnerArgs> = {
	title: "Standalone/FileUpload/MultiImage",
	parameters: {
		docs: {
			description: {
				component:
					"A gallery field: the page shows one image at a time (the primary one first) with Previous/Next, swipe and dots, and a click opens a full-screen view with zoom and rotation. When editable, Edit opens a dialog to add, remove, replace (Replace, or drop a file onto an image) and choose the primary image. Fully controlled: every change goes through onChange/onPrimaryChange. The stories hold the images in state, like a form.",
			},
		},
	},
	args: {
		label: "Device photos",
		name: "photos",
		uploadImage: ADD_TILE,
		captureImage: CAMERA_TILE,
		initialImages: makeImages(3),
		initialPrimary: "img-0",
		previewSize: 256,
		readOnly: false,
		disableRotation: false,
		onChange: fn(),
		onPrimaryChange: fn(),
		onError: fn(),
	},
	argTypes: {
		label: { control: "text", description: "Frame title and group name" },
		editLabel: {
			control: "text",
			description:
				'Text of the control that opens the edit dialog. Default "Edit"',
		},
		previewSize: {
			control: "number",
			description:
				"Width and height in px of each tile in the edit dialog (not the page preview). Default 256",
		},
		maxImages: {
			control: "number",
			description:
				"Maximum number of images. Currently inverted and not enforced (ISSUE-3491-ITEM-4)",
		},
		capture: {
			control: "inline-radio",
			options: [false, "user", "environment"],
			description:
				"Adds a camera tile to the edit dialog on devices that support capture. Desktop browsers (and this Storybook) never show it.",
		},
		convertImagesTo: { control: "text" },
		readOnly: {
			control: "boolean",
			description: "Hides Edit and the edit dialog and ignores drops",
		},
		disableRotation: {
			control: "boolean",
			description: "Hides the rotate buttons of the full-screen views",
		},
		uploadImage: {
			control: false,
			description:
				"URL of the add tile's graphic; also the empty field's picture",
		},
		captureImage: {
			control: false,
			description: "URL of the camera tile's graphic",
		},
		placeholderImage: { control: "text" },
		initialImages: { control: false },
		initialPrimary: { control: "text" },
		onChange: {
			description:
				"Called with the field name and the whole new list after an add, remove or replace",
		},
		onPrimaryChange: {
			description: "Called with the field name and the new primary image id",
		},
		onError: {
			description:
				"Called when a picked image cannot be decoded or encoded; replaces the error dialog",
		},
		onDelete: { control: false },
		additionalDialogContent: { control: false },
		classes: { control: false },
		subClasses: { control: false },
	},
	render: (args) => <Owner {...args} />,
};
export default meta;

type Story = StoryObj<OwnerArgs>;

// ---------------------------------------------------------------------------
// Bug stories: each asserts the expected behavior and fails until its BUGS.md entry is fixed
// ---------------------------------------------------------------------------

export const Issue3491Item1EditDialogIsKeyboardOperable: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-1: in the edit dialog the Remove buttons are visibility: hidden until the mouse hovers the tile, the add and camera tiles are images in divs, and make primary is a clickable div. Keyboard and screen-reader users can only close the dialog. Expected: a visible, focusable Remove button per image that works with Enter.",
			},
		},
	},
	play: async ({ canvasElement, args }) => {
		const dialog = await openEditDialog(canvasElement);
		const remove = within(dialog).getAllByLabelText("Remove image")[1];
		// the dialog fades in
		await waitFor(() => expect(remove).toBeVisible());
		remove.focus();
		await expect(remove).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
	},
};

export const Issue3491Item2PageIsKeyboardOperable: Story = {
	args: { readOnly: true, initialPrimary: "img-1" },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-2: the page preview opens the full-screen view on click only (a div), Previous and Next are hidden until hovered, and the dots are divs. Expected: a button named after the shown image opens the view with Enter, and focus returns to it on close.",
			},
		},
	},
	play: async ({ canvas }) => {
		const opener = canvas.getByRole("button", { name: /photo-2\.png/ });
		opener.focus();
		await userEvent.keyboard("{Enter}");
		await within(document.body).findByRole("dialog");
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(within(document.body).queryByRole("dialog")).toBeNull(),
		);
		await expect(opener).toHaveFocus();
		await expect(
			canvas.getByRole("button", { name: "Next image" }),
		).toBeVisible();
	},
};

/** The edit dialog's actions, in tab order, as their visible text or aria-label reads */
/**
 * Width in px of the focus ring a control shows: its outline, or a border or outline drawn
 * by its ::after over what the control contains
 */
const focusRingWidth = (element: Element) => {
	const own = getComputedStyle(element);
	const after = getComputedStyle(element, "::after");
	return Math.max(
		own.outlineStyle === "none" ? 0 : parseFloat(own.outlineWidth),
		after.outlineStyle === "none" ? 0 : parseFloat(after.outlineWidth),
		after.borderTopStyle === "none" ? 0 : parseFloat(after.borderTopWidth),
	);
};

const EDIT_DIALOG_STOPS = [
	"Close",
	...["Primary image", "Replace image", "Remove image"],
	...["Set as primary image", "Replace image", "Remove image"],
	...["Set as primary image", "Replace image", "Remove image"],
	"Add image",
];

export const Issue3491Item1EveryActionIsATabStop: Story = {
	parameters: {
		...AXE_GATE,
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-1: Tab reaches every action of the edit dialog, each one visible and with a focus outline: per image make primary, Replace and Remove, then the add tile. Space on another image's star makes that image primary, and focus stays on the star.",
			},
		},
	},
	play: async ({ canvasElement, args }) => {
		const dialog = await openEditDialog(canvasElement);
		// the dialog fades in and takes focus
		await waitFor(() =>
			expect(
				within(dialog).getByRole("button", { name: "Close" }),
			).toBeVisible(),
		);
		await waitFor(() =>
			expect(dialog.parentElement?.contains(document.activeElement)).toBe(true),
		);
		const reached: string[] = [];
		for (let step = 0; step < 30; step++) {
			await userEvent.tab();
			const focused = document.activeElement as HTMLElement;
			await expect(dialog.contains(focused)).toBe(true);
			await expect(focused).toBeVisible();
			const text = focused.getAttribute("aria-label") ?? focused.textContent;
			if (!text || !EDIT_DIALOG_STOPS.includes(text)) continue;
			reached.push(text);
			if (text !== "Close") {
				await expect(
					focusRingWidth(focused),
					`${text}: focus ring`,
				).toBeGreaterThanOrEqual(2);
			}
			if (text === "Add image") break;
		}
		await expect(reached).toEqual(EDIT_DIALOG_STOPS);

		const star = within(dialog).getAllByRole("button", { name: /primary/i })[1];
		await expect(star).toHaveAttribute("aria-pressed", "false");
		star.focus();
		await userEvent.keyboard(" ");
		await waitFor(() =>
			expect(args.onPrimaryChange).toHaveBeenCalledWith("photos", "img-1"),
		);
		await expect(star).toHaveAttribute("aria-pressed", "true");
		await expect(star).toHaveFocus();
	},
};

/** The element a pointer at the centre of the given element would hit */
const hitAtCentre = (element: Element) => {
	const rect = element.getBoundingClientRect();
	return document.elementFromPoint(
		rect.left + rect.width / 2,
		rect.top + rect.height / 2,
	);
};

const PAGE_STOPS = [
	"Open photo-2.png in full screen",
	"Previous image",
	"Next image",
	"Image 1 of 3",
	"Image 2 of 3",
	"Image 3 of 3",
	"Edit",
];

export const Issue3491Item2EveryViewingControlIsATabStop: Story = {
	args: { initialPrimary: "img-1" },
	parameters: {
		...AXE_GATE,
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-2: Tab reaches every viewing control of the page, each one visible: the button that opens the shown image in full screen, Previous, Next and a dot per image. The open button and the dots show a focus ring. Enter on a dot shows its image. In the full-screen view the dots are buttons too, and Escape gives focus back to the open button.",
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		const root = canvasElement.querySelector<HTMLElement>(
			'[class*="CcMultiImage-root"]',
		);
		if (!root) throw new Error("no field");
		// Previous and Next lie over the open button, so a click on them reaches them
		for (const name of ["Previous image", "Next image"]) {
			const button = canvas.getByRole("button", { name });
			await expect(button.contains(hitAtCentre(button))).toBe(true);
		}
		const reached: string[] = [];
		for (let step = 0; step < PAGE_STOPS.length; step++) {
			await userEvent.tab();
			const focused = document.activeElement as HTMLElement;
			await expect(root.contains(focused)).toBe(true);
			await expect(focused).toBeVisible();
			const text = focused.getAttribute("aria-label") ?? focused.textContent;
			reached.push(text ?? "");
			if (text?.startsWith("Open") || text?.startsWith("Image")) {
				await expect(
					focusRingWidth(focused),
					`${text}: focus ring`,
				).toBeGreaterThanOrEqual(2);
			}
		}
		await expect(reached).toEqual(PAGE_STOPS);

		const lastDot = canvas.getByRole("button", { name: "Image 3 of 3" });
		lastDot.focus();
		await userEvent.keyboard("{Enter}");
		await expect(lastDot).toHaveAttribute("aria-current", "true");
		const opener = canvas.getByRole("button", {
			name: "Open photo-3.png in full screen",
		});

		opener.focus();
		await userEvent.keyboard("{Enter}");
		const view = await within(document.body).findByRole("dialog");
		const dot = within(view).getByRole("button", { name: "Image 1 of 3" });
		// the dialog fades in
		await waitFor(() => expect(dot).toBeVisible());
		dot.focus();
		await userEvent.keyboard("{Enter}");
		await expect(dot).toHaveAttribute("aria-current", "true");
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(within(document.body).queryByRole("dialog")).toBeNull(),
		);
		await expect(
			canvas.getByRole("button", { name: "Open photo-1.png in full screen" }),
		).toHaveFocus();
	},
};

export const Issue3491Item2ImageBoxOpensByKeyboard: StoryObj = {
	parameters: {
		...AXE_GATE,
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-2: ImageBox on its own, as SCF shows a walk photo, is a button named after the image: Tab shows its focus ring, Enter opens the full-screen view, and Escape gives focus back to it.",
			},
		},
	},
	render: () => (
		<ImageBox
			image={solid("#43a047")}
			fileName={"Type plate"}
			width={96}
			height={96}
		/>
	),
	play: async ({ canvas }) => {
		await userEvent.tab();
		const opener = canvas.getByRole("button", {
			name: "Open Type plate in full screen",
		});
		await expect(opener).toHaveFocus();
		await expect(focusRingWidth(opener)).toBeGreaterThanOrEqual(2);
		await userEvent.keyboard("{Enter}");
		await within(document.body).findByRole("dialog");
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(within(document.body).queryByRole("dialog")).toBeNull(),
		);
		await expect(opener).toHaveFocus();
	},
};

export const Issue3491Item37ActiveDotStaysVisible: Story = {
	args: {
		readOnly: true,
		initialImages: makeImages(30),
		initialPrimary: "img-25",
	},
	parameters: {
		...AXE_GATE,
		docs: {
			description: {
				story:
					'ISSUE-3491-ITEM-37: with 30 images in a 300px field the dots do not fit in one row, so a counter shows the position of the shown image instead ("26 / 30", read as "Image 26 of 30") and Next moves it on. In a field wide enough for all of them the dots come back, the shown image\'s dot filled and in view.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const dots = () =>
			Array.from(
				canvasElement.querySelectorAll('[class*="CcImageDots-imageDot"]'),
			);
		const root = () =>
			rectOf(canvasElement.querySelector('[class*="CcImageDots-root"]'));
		await expect(dots()).toHaveLength(30);
		for (const dot of dots()) await expect(dot).not.toBeVisible();
		await expect(canvas.queryAllByRole("button", { name: /^Image / })).toEqual(
			[],
		);
		const counter = canvas.getByText("26 / 30");
		await expect(counter).toBeVisible();
		await expect(counter).toHaveAttribute("aria-hidden", "true");
		await expect(canvas.getByText("Image 26 of 30")).toBeInTheDocument();
		const text = rectOf(counter);
		await expect(text.left).toBeGreaterThanOrEqual(root().left);
		await expect(text.right).toBeLessThanOrEqual(root().right);

		await userEvent.click(canvas.getByRole("button", { name: "Next image" }));
		await expect(await canvas.findByText("27 / 30")).toBeVisible();
		await expect(canvas.getByText("Image 27 of 30")).toBeInTheDocument();

		// a field wide enough for 30 dots shows them again
		const field = canvasElement.querySelector<HTMLElement>(
			'[class*="CcMultiImage-root"]',
		)?.parentElement;
		if (!field) throw new Error("no field box");
		field.style.width = "900px";
		await waitFor(() => expect(dots()[26]).toBeVisible());
		await expect(canvas.queryByText("27 / 30")).toBeNull();
		await expect(
			canvas.getByRole("button", { name: "Image 27 of 30" }),
		).toHaveAttribute("aria-current", "true");
		const active = rectOf(dots()[26]);
		await expect(active.left).toBeGreaterThanOrEqual(root().left);
		await expect(active.right).toBeLessThanOrEqual(root().right);
		const last = rectOf(dots()[29]);
		await expect(last.right).toBeLessThanOrEqual(root().right);

		// and narrowed again, the counter
		field.style.width = "300px";
		await expect(await canvas.findByText("27 / 30")).toBeVisible();
		await expect(dots()[26]).not.toBeVisible();
	},
};

/** The full-screen view the page preview opens */
const openPageFullScreen = async (canvasElement: HTMLElement) => {
	await userEvent.click(
		within(canvasElement).getByRole("button", { name: /in full screen$/ }),
	);
	return within(document.body).findByRole("dialog");
};

export const Issue3491Item37FullScreenDotsFitTheView: Story = {
	args: {
		readOnly: true,
		initialImages: makeImages(30),
		initialPrimary: "img-25",
	},
	parameters: {
		// the full-screen view fails scrollable-region-focusable (ISSUE-3491-ITEM-30)
		a11y: { test: "todo" },
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-37: the full-screen view is wider than the field: the 30 dots fit in it, all inside the view, the shown image's filled.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const dialog = await openPageFullScreen(canvasElement);
		const view = rectOf(
			dialog.querySelector('[class*="CcImageBox-fullScreenImageWrapper"]'),
		);
		const dots = Array.from(
			dialog.querySelectorAll('[class*="CcImageDots-imageDot"]'),
		);
		await expect(dots).toHaveLength(30);
		await waitFor(() => expect(dots[25]).toBeVisible());
		await expect(dots[25]).toHaveAttribute("aria-current", "true");
		await expect(rectOf(dots[0]).left).toBeGreaterThanOrEqual(view.left);
		await expect(rectOf(dots[29]).right).toBeLessThanOrEqual(view.right);
		await expect(within(dialog).queryByText("26 / 30")).toBeNull();
		// the row spans the view, but beside the dots the pointer reaches the image's pane
		const dot = rectOf(dots[0]);
		const y = (dot.top + dot.bottom) / 2;
		const beside = document.elementFromPoint(view.left + 8, y);
		await expect(
			beside?.closest('[class*="CcImageBox-imageDotsWrapper"]'),
		).toBeNull();
		await expect(document.elementFromPoint((dot.left + dot.right) / 2, y)).toBe(
			dots[0],
		);
	},
};

export const Issue3491Item37FullScreenCounterWhenDotsDoNotFit: Story = {
	args: {
		readOnly: true,
		initialImages: makeImages(80),
		initialPrimary: "img-25",
	},
	parameters: {
		// the full-screen view fails scrollable-region-focusable (ISSUE-3491-ITEM-30)
		a11y: { test: "todo" },
		docs: {
			description: {
				story:
					'ISSUE-3491-ITEM-37: 80 dots do not fit in the full-screen view either: its counter, centred under the image, shows "26 / 80", and the hidden dots do not make the view scroll sideways.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const dialog = await openPageFullScreen(canvasElement);
		const view = rectOf(
			dialog.querySelector('[class*="CcImageBox-fullScreenImageWrapper"]'),
		);
		const counter = await within(dialog).findByText("26 / 80");
		// the dialog fades in
		await waitFor(() => expect(counter).toBeVisible());
		await expect(
			within(dialog).getByText("Image 26 of 80"),
		).toBeInTheDocument();
		const text = rectOf(counter);
		const centre = (text.left + text.right) / 2;
		await expect(
			Math.abs(centre - (view.left + view.width / 2)),
		).toBeLessThanOrEqual(1);
		for (const dot of dialog.querySelectorAll(
			'[class*="CcImageDots-imageDot"]',
		))
			await expect(dot).not.toBeVisible();
		const content = dialog.querySelector<HTMLElement>(
			'[class*="MuiDialogContent-root"]',
		);
		if (!content) throw new Error("no dialog content");
		await expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth);
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Next image" }),
		);
		await expect(await within(dialog).findByText("27 / 80")).toBeVisible();
	},
};

export const Issue3491Item12ZoomsByKeyboard: Story = {
	args: { readOnly: true },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-12: the full-screen view zooms and pans by wheel, pinch and drag only. A keyboard user can rotate the image but never enlarge it, e.g. to read a type plate. Expected: a zoom-in button, or the + key, zooms in.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const dialog = await openFullScreen(canvasElement);
		const image = dialog.querySelector("img");
		if (!image) throw new Error("no image");
		const zoomIn = within(dialog).queryByRole("button", { name: /zoom in/i });
		if (zoomIn) {
			zoomIn.focus();
			await userEvent.keyboard("{Enter}");
		} else {
			within(dialog).getByRole("button", { name: "Close" }).focus();
			await userEvent.keyboard("+");
		}
		await expect(readScale(image)).toBeGreaterThan(1);
	},
};

const FULL_SCREEN_TOOLBAR = [
	"Rotate left",
	"Rotate right",
	"Zoom in",
	"Zoom out",
	"Reset zoom",
];

/** The full-screen toolbar's buttons sit in one row, apart from each other and from Close */
const expectFullScreenToolbarRow = async (dialog: HTMLElement) => {
	const view = within(dialog);
	const boxes = FULL_SCREEN_TOOLBAR.map((name) =>
		view.getByRole("button", { name }).getBoundingClientRect(),
	);
	const close = view
		.getByRole("button", { name: "Close" })
		.getBoundingClientRect();
	for (let i = 1; i < boxes.length; i++) {
		await expect(boxes[i].top, FULL_SCREEN_TOOLBAR[i]).toBeCloseTo(
			boxes[0].top,
		);
		await expect(boxes[i].left, FULL_SCREEN_TOOLBAR[i]).toBeGreaterThanOrEqual(
			boxes[i - 1].right,
		);
	}
	await expect(boxes[0].left).toBeGreaterThanOrEqual(0);
	await expect(boxes[boxes.length - 1].right).toBeLessThanOrEqual(close.left);
	await expect(close.right).toBeLessThanOrEqual(window.innerWidth);
};

const readTranslateX = (image: HTMLImageElement) => {
	const match = /translate\(([-\d.e]+)px/.exec(image.style.transform);
	return match ? parseFloat(match[1]) : 0;
};

/**
 * The full-screen view zooms and pans like the image preview: Zoom in, Zoom out and Reset
 * zoom right of the rotate buttons, + and - zoom, the arrow keys pan while zoomed in (and
 * leave the shown image alone), 0 resets. The grab cursor shows only while zoomed in, and
 * the next image starts at 1× again.
 */
export const Issue3490Item8FullScreenZoomsAndPansByKeyboard: Story = {
	args: { readOnly: true },
	parameters: {
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["button-name"] } },
		},
	},
	play: async ({ canvasElement }) => {
		const dialog = await openFullScreen(canvasElement);
		const view = within(dialog);
		const image = dialog.querySelector("img");
		if (!image?.parentElement) throw new Error("no image");
		const container = image.parentElement;
		// the dialog fades in and takes focus
		await waitFor(() =>
			expect(dialog.parentElement?.contains(document.activeElement)).toBe(true),
		);
		await expectFullScreenToolbarRow(dialog);
		await expect(getComputedStyle(container).cursor).not.toBe("grab");

		await userEvent.keyboard("+");
		await expect(readScale(image)).toBeCloseTo(1.5);
		await expect(getComputedStyle(container).cursor).toBe("grab");
		await userEvent.keyboard("{ArrowRight}");
		await expect(readTranslateX(image)).toBeLessThan(0);
		await expect(
			view.getByRole("button", { name: "Image 1 of 3" }),
		).toHaveAttribute("aria-current", "true");
		await userEvent.keyboard("-");
		await expect(readScale(image)).toBe(1);
		await expect(getComputedStyle(container).cursor).not.toBe("grab");

		await userEvent.click(view.getByRole("button", { name: "Zoom in" }));
		await userEvent.click(view.getByRole("button", { name: "Zoom in" }));
		await expect(readScale(image)).toBeCloseTo(2.25);
		await userEvent.click(view.getByRole("button", { name: "Zoom out" }));
		await expect(readScale(image)).toBeCloseTo(1.5);
		await userEvent.click(view.getByRole("button", { name: "Reset zoom" }));
		await expect(readScale(image)).toBe(1);

		await userEvent.keyboard("+");
		await userEvent.click(view.getByRole("button", { name: "Next image" }));
		await waitFor(() =>
			expect(
				view.getByRole("button", { name: "Image 2 of 3" }),
			).toHaveAttribute("aria-current", "true"),
		);
		const next = dialog.querySelector("img");
		if (!next?.parentElement) throw new Error("no image");
		await expect(readScale(next)).toBe(1);
		await expect(getComputedStyle(next.parentElement).cursor).not.toBe("grab");
	},
};

/** At phone width the full-screen toolbar fits in one row left of Close */
export const Issue3490Item8FullScreenToolbarFitsAPhone: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	args: { readOnly: true },
	play: async ({ canvasElement }) => {
		const dialog = await openFullScreen(canvasElement);
		await expect(window.innerWidth).toBe(320);
		await expectFullScreenToolbarRow(dialog);
	},
};

export const Issue3491Item29EditDialogEntriesFormAList: Story = {
	parameters: {
		...AXE_GATE,
		docs: {
			description: {
				story:
					"ISSUE-3491-ITEM-29: the edit dialog's images form a list, so a screen reader says how many there are. The add tile is not an item of it, and still follows the last image in the same row.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const dialog = await openEditDialog(canvasElement);
		const list = within(dialog).getByRole("list");
		const items = within(list).getAllByRole("listitem");
		await expect(items).toHaveLength(3);
		const add = within(dialog).getByRole("button", { name: "Add image" });
		await expect(list.contains(add)).toBe(false);
		// the dialog fades in
		await waitFor(() => expect(add).toBeVisible());
		const first = items[0].getBoundingClientRect();
		const last = items[2].getBoundingClientRect();
		const tile = add.getBoundingClientRect();
		await expect(last.top).toBe(first.top);
		await expect(last.left).toBeGreaterThan(first.right);
		await expect(tile.top).toBe(first.top);
		await expect(tile.left).toBeGreaterThan(last.right);
	},
};

export const Issue3473Item16HiddenCounterLabelStaysInside: Story = {
	args: {
		readOnly: true,
		initialImages: makeImages(80),
		initialPrimary: "img-25",
		box: { width: "100%" },
	},
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		layout: "fullscreen",
		...AXE_GATE,
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-16: at 320px in a right-to-left part of a left-to-right page, the visually hidden text of the image counter shown when the dots do not fit lies inside the box it is placed in (the nearest positioned ancestor), so it never makes the page scroll sideways. With MUI's visually hidden style, its -1px margin put it 1px past the top and start edges of its container wherever it began the container.",
			},
		},
	},
	render: (args) => (
		<div dir={"rtl"}>
			<Owner {...args} />
		</div>
	),
	play: async ({ canvas }) => {
		const label = await canvas.findByText("Image 26 of 80");
		await expect(edgesPast(label)).toEqual([]);
		await expect(pageScrollsSideways()).toBe(false);
	},
};
