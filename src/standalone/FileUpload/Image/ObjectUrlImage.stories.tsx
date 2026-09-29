import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import ObjectUrlImage from "./ObjectUrlImage";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">
<rect width="120" height="80" fill="#4caf50"/>
</svg>`;

const meta: Meta<typeof ObjectUrlImage> = {
	title: "Standalone/FileUpload/ObjectUrlImage",
	component: ObjectUrlImage,
	parameters: { layout: "centered" },
	args: {
		alt: "Green rectangle",
	},
};
export default meta;

type Story = StoryObj<typeof ObjectUrlImage>;

/**
 * An image the user picked: shown through an object URL
 */
export const FromBlob: Story = {
	args: {
		src: new Blob([SVG], { type: "image/svg+xml" }),
	},
	play: async ({ canvasElement }) => {
		const img = await within(canvasElement).findByRole("img");
		await expect(img.getAttribute("src")).toMatch(/^blob:/);
	},
};

/**
 * An image from the server: its URL is used as it is
 */
export const FromUrl: Story = {
	args: {
		src: "data:image/svg+xml;base64," + btoa(SVG),
	},
	play: async ({ canvasElement }) => {
		const img = await within(canvasElement).findByRole("img");
		await expect(img.getAttribute("src")).toMatch(/^data:image\/svg\+xml/);
	},
};
