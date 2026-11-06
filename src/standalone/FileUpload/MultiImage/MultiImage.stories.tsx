import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import MultiImage, { MultiImageImage, MultiImageProps } from "./MultiImage";

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

const openEditDialog = async (canvasElement: HTMLElement) => {
	within(canvasElement).getByText("Edit").click();
	return within(document.body).findByRole("dialog");
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
	...["Primary", "Replace image", "Remove image"],
	...["Primary", "Replace image", "Remove image"],
	...["Primary", "Replace image", "Remove image"],
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

		const star = within(dialog).getAllByRole("button", { name: /Primary/ })[1];
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
