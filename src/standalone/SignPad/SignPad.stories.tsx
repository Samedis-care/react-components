import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { fn, expect } from "storybook/test";
import SignPad, { SignPadProps } from "./index";

const SAMPLE_SIGNATURE =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const WrappedSignPad = (props: SignPadProps) => (
	<Box sx={{ width: 300, height: 150 }}>
		<SignPad {...props} />
	</Box>
);

const meta: Meta<typeof WrappedSignPad> = {
	title: "Standalone/SignPad",
	component: WrappedSignPad,
	parameters: { layout: "centered" },
	argTypes: {
		disabled: { control: "boolean" },
		signature: { control: "text" },
		signerName: { control: "text" },
	},
};
export default meta;

type Story = StoryObj<typeof WrappedSignPad>;

export const Empty: Story = {
	args: {
		signature: "",
		disabled: false,
	},
};

export const WithSignature: Story = {
	args: {
		signature: SAMPLE_SIGNATURE,
		disabled: false,
		signerName: "Alice Müller",
	},
};

export const Disabled: Story = {
	args: {
		signature: "",
		disabled: true,
	},
};

export const DisabledWithSignature: Story = {
	args: {
		signature: SAMPLE_SIGNATURE,
		disabled: true,
		signerName: "Bob Smith",
	},
};

export const WithInfoButton: Story = {
	args: {
		signature: SAMPLE_SIGNATURE,
		disabled: false,
		openInfo: () => alert("Info clicked"),
		openSignPad: () => alert("SignPad clicked"),
	},
};

/** WCAG contrast of two CSS colors, the first composited over the second */
const parseColor = (css: string) => {
	const match = /rgba?\(([^)]+)\)/.exec(css);
	if (!match) throw new Error(`not an rgb(a) color: ${css}`);
	const parts = match[1]
		.split(/[ ,/]+/)
		.filter(Boolean)
		.map(Number);
	return [parts[0], parts[1], parts[2], parts[3] ?? 1];
};
const over = (fg: number[], bg: number[]) =>
	[0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const luminance = (c: number[]) => {
	const f = (v: number) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const contrast = (a: number[], b: number[]) => {
	const [x, y] = [luminance(a), luminance(b)];
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const WHITE = [255, 255, 255, 1];

export const Issue3467Item14KeyboardFocusShowsRing: Story = {
	args: { signature: "", openInfo: fn(), openSignPad: fn() },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3467-ITEM-14: Tab reaches the tile, a button named by its prompt, which shows a focus ring of at least 2px and 3:1 against the tile. Enter opens the pad; the info button is the next Tab stop.",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<>
			<button>Before</button>
			<WrappedSignPad {...args} />
		</>
	),
	play: async ({ canvas, userEvent, args }) => {
		canvas.getByRole("button", { name: "Before" }).focus();
		await userEvent.tab();
		const tile = canvas.getByRole("button", { name: /sign/i });
		await expect(tile).toHaveFocus();
		await expect(tile.matches(":focus-visible")).toBe(true);
		const ring = getComputedStyle(tile);
		await expect(ring.outlineStyle).toBe("solid");
		await expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2);
		const tileParent = tile.parentElement;
		if (!tileParent) throw new Error("the tile has no parent");
		const background = over(
			parseColor(getComputedStyle(tileParent).backgroundColor),
			WHITE,
		);
		await expect(
			contrast(parseColor(ring.outlineColor), background),
			`focus ring ${ring.outlineColor} on the tile`,
		).toBeGreaterThanOrEqual(3);

		await userEvent.keyboard("{Enter}");
		await expect(args.openSignPad).toHaveBeenCalledTimes(1);
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: "More information" }),
		).toHaveFocus();
		await expect(args.openInfo).not.toHaveBeenCalled();
	},
};
