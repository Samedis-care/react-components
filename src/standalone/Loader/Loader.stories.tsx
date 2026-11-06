import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import Loader from "./index";

const meta: Meta<typeof Loader> = {
	title: "Standalone/Loader",
	component: Loader,
	parameters: { layout: "centered" },
	argTypes: {
		typographyVariant: {
			control: "select",
			options: [
				"h4",
				"h5",
				"h6",
				"subtitle1",
				"subtitle2",
				"body1",
				"body2",
				"caption",
			],
		},
	},
};
export default meta;

type Story = StoryObj<typeof Loader>;

const rectOf = (el: Element) => el.getBoundingClientRect();

/**
 * The spinner rotates, so its bounding rect grows and shrinks with the angle
 * (40 to 56.6px); its center and its 40px offsetHeight do not.
 */
const spinnerBox = (bar: HTMLElement) => {
	const rect = bar.getBoundingClientRect();
	const cx = (rect.left + rect.right) / 2;
	const cy = (rect.top + rect.bottom) / 2;
	const half = bar.offsetHeight / 2;
	return { cx, cy, top: cy - half, bottom: cy + half };
};

export const NoText: Story = {
	args: {},
};

export const WithText: Story = {
	args: {
		text: "Loading, please wait…",
	},
};

export const WithTextBodyVariant: Story = {
	args: {
		text: "Fetching data…",
		typographyVariant: "body1",
	},
};

export const WithTextCaptionVariant: Story = {
	args: {
		text: "Almost there…",
		typographyVariant: "caption",
	},
};

export const Issue3461Item1ReservesHeightInBlockFlow: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3461-ITEM-1: between two lines of text in normal block flow (a form field, a Grid item, `DialogContent`), the Loader is 0px tall and the spinner is drawn over both lines.",
			},
		},
	},
	render: () => (
		<div style={{ width: 400, paddingTop: 100 }}>
			<p data-testid={"above"} style={{ margin: 0 }}>
				Field label above
			</p>
			<Loader />
			<p data-testid={"below"} style={{ margin: 0 }}>
				Content below
			</p>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const above = rectOf(canvas.getByTestId("above"));
		const below = rectOf(canvas.getByTestId("below"));
		const spinner = spinnerBox(canvas.getByRole("progressbar"));
		await expect(spinner.top).toBeGreaterThanOrEqual(above.bottom);
		await expect(spinner.bottom).toBeLessThanOrEqual(below.top);
	},
};
