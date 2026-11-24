import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import ImageSelector, { ImageSelectorProps } from "./ImageSelector";

/**
 * Holds the value like a form does: the File onChange delivers is passed back as value
 */
const Controlled = (
	props: ImageSelectorProps & { box?: React.CSSProperties },
) => {
	const { onChange, box, ...rest } = props;
	const [value, setValue] = useState<string | Blob>(props.value);
	const handleChange = useCallback(
		(name: string, file: File) => {
			setValue(file);
			onChange?.(name, file);
		},
		[onChange],
	);
	return (
		<div style={box ?? { width: 300 }}>
			<ImageSelector {...rest} value={value} onChange={handleChange} />
		</div>
	);
};

/**
 * Counts how often the file picker would open, without opening it
 */
const countPickerOpens = (canvasElement: HTMLElement) => {
	const input = canvasElement.querySelector('input[type="file"]');
	let clicks = 0;
	const count = (evt: Event) => {
		clicks++;
		evt.preventDefault();
	};
	input?.addEventListener("click", count);
	return {
		clicks: () => clicks,
		stop: () => input?.removeEventListener("click", count),
	};
};

const fileInput = (canvasElement: HTMLElement) => {
	const input =
		canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
	if (!input) throw new Error("no file input");
	return input;
};

const makePng = async (width: number, height: number, name: string) => {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("no 2d context");
	ctx.fillStyle = "#c00";
	ctx.fillRect(0, 0, width, height);
	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, "image/png"),
	);
	if (!blob) throw new Error("toBlob failed");
	return new File([blob], name, { type: "image/png" });
};

const meta: Meta<typeof ImageSelector> = {
	title: "Standalone/FileUpload/ImageSelector",
	component: ImageSelector,
	parameters: { layout: "centered" },
	args: {
		name: "photo",
		value: "",
		capture: false,
		alt: "Employee photo",
		label: "Photo",
		readOnly: false,
		variant: "normal",
		onChange: fn(),
		onBlur: fn(),
		onError: fn(),
	},
	argTypes: {
		variant: {
			control: "inline-radio",
			options: ["normal", "modern", "profile_picture"],
			description:
				'"normal": framed, Upload button above the image. "modern": framed; empty, the whole area opens the file dialog; with an image, a click opens the preview. "profile_picture": a round avatar button.',
		},
		capture: {
			control: "inline-radio",
			options: [false, "user", "environment"],
			description:
				"Offers the device camera. Desktop browsers (and this Storybook) never show a camera control.",
		},
		value: {
			control: "text",
			description:
				'A URL or a Blob/File. `""` for no image. The stories hold the picked File in state, like a form.',
		},
		placeholder: {
			control: "text",
			description:
				"A URL or data URI drawn where the picture would be while the field is empty: hidden from assistive technology, and a click opens the file dialog, never the preview.",
		},
		convertImagesTo: { control: "text" },
		onChange: {
			description:
				"Called with the field name and the processed File after a pick or drop",
		},
		onError: {
			description:
				"Called when the image cannot be decoded or encoded; replaces the error dialog",
		},
		postEditCallback: { control: false },
	},
	render: (args) => <Controlled {...args} />,
};
export default meta;

type Story = StoryObj<typeof ImageSelector>;

// ---------------------------------------------------------------------------
// Bug stories: each asserts the expected behavior and fails until its BUGS.md entry is fixed
// ---------------------------------------------------------------------------

export const Issue3490Item1ModernEmptyIsKeyboardOperable: Story = {
	args: { variant: "modern" },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3490-ITEM-1: the empty modern field (SCF's default) has no tab stop: Tab from the button before it lands on the button after it, so a keyboard user cannot add an image. Expected: a focusable control inside the field that opens the picker on Enter.",
			},
		},
	},
	render: (args) => (
		<div>
			<button type="button">before</button>
			<Controlled {...args} box={{ width: 300, height: 200 }} />
			<button type="button">after</button>
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		const picker = countPickerOpens(canvasElement);
		try {
			canvas.getByRole("button", { name: "before" }).focus();
			await userEvent.tab();
			const active = document.activeElement;
			await expect(
				canvasElement.querySelector("fieldset")?.contains(active),
				`Tab moved focus to "${active?.textContent ?? ""}"`,
			).toBe(true);
			await userEvent.keyboard("{Enter}");
			await expect(picker.clicks()).toBe(1);
		} finally {
			picker.stop();
		}
	},
};

/**
 * The empty modern field's call to action is a button: Tab reaches it with a visible outline,
 * Enter, Space and a click each open the picker once, and leaving it calls onBlur.
 */
export const Issue3490Item1ModernEmptyUploadButtonKeyboard: Story = {
	args: { variant: "modern" },
	parameters: {
		a11y: {
			test: "error",
			// the call to action's grey text is ISSUE-3490-ITEM-11
			options: { rules: { "color-contrast": { enabled: false } } },
		},
	},
	render: (args) => (
		<div>
			<button type="button">before</button>
			<Controlled {...args} box={{ width: 300, height: 200 }} />
			<button type="button">after</button>
		</div>
	),
	play: async ({ canvas, canvasElement, args }) => {
		const picker = countPickerOpens(canvasElement);
		try {
			canvas.getByRole("button", { name: "before" }).focus();
			await userEvent.tab();
			const cta = canvas.getByRole("button", {
				name: "Drag & drop file here or click for an upload dialog",
			});
			await expect(cta).toHaveFocus();
			await expect(cta).toHaveAttribute("name", "photo");
			const cs = getComputedStyle(cta);
			await expect(
				cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
				`outline ${cs.outlineStyle} ${cs.outlineWidth}`,
			).toBe(true);
			await userEvent.keyboard("{Enter}");
			await expect(picker.clicks()).toBe(1);
			await userEvent.keyboard(" ");
			await expect(picker.clicks()).toBe(2);
			await userEvent.click(cta);
			await expect(picker.clicks()).toBe(3);
			await userEvent.tab();
			await expect(canvas.getByRole("button", { name: "after" })).toHaveFocus();
			await expect(args.onBlur).toHaveBeenCalledTimes(1);
		} finally {
			picker.stop();
		}
	},
};

/**
 * A pick made from the focused button of the empty modern field: the image replaces the
 * button, and focus moves to the image's upload button instead of falling to the page.
 */
export const Issue3490Item1ModernPickKeepsFocusInTheField: Story = {
	args: { variant: "modern" },
	parameters: { a11y: { test: "error" } },
	render: (args) => <Controlled {...args} box={{ width: 300, height: 200 }} />,
	play: async ({ canvas, canvasElement, args }) => {
		canvas
			.getByRole("button", {
				name: "Drag & drop file here or click for an upload dialog",
			})
			.focus();
		await userEvent.upload(
			fileInput(canvasElement),
			await makePng(40, 30, "pic.png"),
		);
		await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(
				canvas.getByRole("button", { name: "Click for an upload dialog" }),
			).toHaveFocus(),
		);
	},
};

const PLACEHOLDER =
	"data:image/svg+xml," +
	encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='240' height='240'><rect width='24' height='24' fill='#eeeeee'/><path fill='#bdbdbd' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4'/></svg>",
	);

/**
 * The empty modern field with a placeholder (left) looks like a field with a picture (right):
 * the placeholder fills the frame, with the upload button in its corner. It is no image for
 * assistive technology, its hover hint does not name it, and a click on it opens the file
 * picker, never the preview.
 */
export const Issue3490Item31PlaceholderWhereThePictureWouldBe: Story = {
	args: { variant: "modern", placeholder: PLACEHOLDER },
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<div style={{ display: "flex", gap: 16 }}>
			<Controlled {...args} box={{ width: 300, height: 200 }} />
			<Controlled
				{...args}
				value={PLACEHOLDER}
				placeholder={undefined}
				box={{ width: 300, height: 200 }}
			/>
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		const [empty, stored] = Array.from(
			canvasElement.querySelectorAll("fieldset"),
		);
		const drawn = empty.querySelector("img");
		const picture = stored.querySelector("img");
		if (!drawn || !picture) throw new Error("no placeholder or picture");
		await expect(drawn.getAttribute("src")).toBe(PLACEHOLDER);
		// only the stored picture is an image for assistive technology
		await expect(canvas.getAllByRole("img")).toEqual([picture]);
		// where the picture would be, with the same button in its corner and no call to action
		const box = (img: HTMLImageElement) => {
			const rect = img.getBoundingClientRect();
			return { top: rect.top, width: rect.width, height: rect.height };
		};
		await expect(box(drawn)).toEqual(box(picture));
		await expect(
			within(empty).getByRole("button", { name: "Click for an upload dialog" }),
		).toBeVisible();
		await expect(
			within(empty).queryByRole("button", {
				name: "Drag & drop file here or click for an upload dialog",
			}),
		).toBe(null);

		// the hover hint shows and leaves the placeholder unnamed
		await userEvent.hover(drawn);
		await expect(
			await within(canvasElement.ownerDocument.body).findByRole("tooltip"),
		).toHaveTextContent("Drag & drop file here");
		await expect(drawn).toHaveAccessibleName("");
		await userEvent.unhover(drawn);

		const picker = countPickerOpens(canvasElement);
		try {
			await userEvent.click(drawn);
			await expect(picker.clicks()).toBe(1);
			await expect(
				canvasElement.ownerDocument.querySelector('[role="dialog"]'),
			).toBe(null);
		} finally {
			picker.stop();
		}
	},
};
