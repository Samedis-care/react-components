import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
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

const centerY = (rect: DOMRect) => (rect.top + rect.bottom) / 2;

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

export const Issue3461Item8CentersTextAndSpinnerAsGroup: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3461-ITEM-8: in a 400x300 box the text and spinner are not centered as a group (6.75px low), and without text the spinner sits 3.5px above the center.",
			},
		},
	},
	render: () => (
		<>
			<Box data-testid={"with-text"} sx={{ width: 400, height: 300 }}>
				<Loader text={"Loading"} />
			</Box>
			<Box data-testid={"without-text"} sx={{ width: 400, height: 300 }}>
				<Loader />
			</Box>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const withText = canvas.getByTestId("with-text");
		const withoutText = canvas.getByTestId("without-text");
		const text = rectOf(within(withText).getByText("Loading"));
		const spinner = spinnerBox(within(withText).getByRole("progressbar"));
		const groupCenter = (text.top + spinner.bottom) / 2;
		await expect(
			Math.abs(groupCenter - centerY(rectOf(withText))),
		).toBeLessThanOrEqual(2);
		const alone = spinnerBox(within(withoutText).getByRole("progressbar"));
		await expect(
			Math.abs(alone.cy - centerY(rectOf(withoutText))),
		).toBeLessThanOrEqual(1);
	},
};

export const Issue3461Item8LongTextKeepsSpinnerInBox: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3461-ITEM-8: a status text of four lines pushes the spinner below a 240x200 box that hides its overflow, so only the text is visible.",
			},
		},
	},
	render: () => (
		<Box
			data-testid={"box"}
			sx={{ width: 240, height: 200, overflow: "hidden" }}
		>
			<Loader
				text={
					"Die Datei wurde hochgeladen und wird nun von unserem System analysiert. Bitte warten..."
				}
			/>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const box = rectOf(canvas.getByTestId("box"));
		const spinner = spinnerBox(canvas.getByRole("progressbar"));
		await expect(spinner.top).toBeGreaterThanOrEqual(box.top);
		await expect(spinner.bottom).toBeLessThanOrEqual(box.bottom);
	},
};

export const Issue3461Item5AddsNoScrollRegionToDialogContent: Story = {
	parameters: {
		a11y: {
			test: "error",
			options: {
				runOnly: { type: "rule", values: ["scrollable-region-focusable"] },
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3461-ITEM-5: as the only content of a `DialogContent` (FormDialog's Suspense fallback), the Loader's content overflows the 20px content box, which becomes an unnamed, focusable scroll region (axe `scrollable-region-focusable`).",
			},
		},
	},
	render: () => (
		<Dialog open aria-labelledby={"bug039-title"}>
			<DialogTitle id={"bug039-title"}>Edit device</DialogTitle>
			<DialogContent>
				<Loader />
			</DialogContent>
		</Dialog>
	),
	play: async () => {
		await within(document.body).findByRole("progressbar");
	},
};
