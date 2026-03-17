import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import HowToBox from "./index";

// Note: HowToBox internally calls useCCTranslations for the default title.
// The story relies on i18next being initialised (it is, via the library's ccI18n instance).

const meta: Meta<typeof HowToBox> = {
	title: "Standalone/HowToBox",
	component: HowToBox,
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof HowToBox>;

export const ArrayOfStrings: Story = {
	args: {
		titleLabel: "How it works",
		labels: [
			"Open the application.",
			"Fill in the required fields.",
			"Click Save to confirm.",
		],
	},
};

export const SingleStringLabel: Story = {
	args: {
		titleLabel: "Tip",
		labels: "This is a single helpful hint.",
	},
};

export const ArrayOfNodes: Story = {
	args: {
		titleLabel: "Steps",
		labels: [
			<span key="1">
				Step <strong>1</strong>: Register
			</span>,
			<span key="2">
				Step <strong>2</strong>: Verify email
			</span>,
			<span key="3">
				Step <strong>3</strong>: Complete profile
			</span>,
		],
	},
};

export const DefaultTitle: Story = {
	// titleLabel omitted — falls back to i18n key "standalone.how-it-works.title"
	args: {
		labels: ["First step.", "Second step.", "Third step."],
	},
};

export const NoLabels: Story = {
	// labels is undefined — component renders nothing
	args: {
		labels: undefined,
	},
};
