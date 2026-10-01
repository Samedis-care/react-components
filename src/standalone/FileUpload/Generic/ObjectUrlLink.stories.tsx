import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import ObjectUrlLink from "./ObjectUrlLink";

const meta: Meta<typeof ObjectUrlLink> = {
	title: "Standalone/FileUpload/ObjectUrlLink",
	component: ObjectUrlLink,
	parameters: { layout: "centered" },
	args: {
		children: "notes.txt",
		target: "_blank",
	},
};
export default meta;

type Story = StoryObj<typeof ObjectUrlLink>;

/**
 * A file the user picked: linked through an object URL
 */
export const FromBlob: Story = {
	args: {
		href: new Blob(["picked locally"], { type: "text/plain" }),
	},
	play: async ({ canvasElement }) => {
		const link = await within(canvasElement).findByRole("link");
		await expect(link.getAttribute("href")).toMatch(/^blob:/);
	},
};

/**
 * A file from the server: its URL is used as it is
 */
export const FromUrl: Story = {
	args: {
		href: "https://example.com/notes.txt",
	},
	play: async ({ canvasElement }) => {
		const link = await within(canvasElement).findByRole("link");
		await expect(link.getAttribute("href")).toBe(
			"https://example.com/notes.txt",
		);
	},
};
