import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	createTheme,
	Grid,
	styled,
	TextField,
	ThemeProvider,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import GroupBox from "./index";
import ImageSelector from "../FileUpload/Image/ImageSelector";
import { FormHelperTextCC } from "../UIKit/MuiFieldState";
// the theme augmentation that types components.CcGroupBox
import type {} from "../../theme-def";

const meta: Meta<typeof GroupBox> = {
	title: "Standalone/GroupBox",
	component: GroupBox,
	parameters: { layout: "centered", a11y: { test: "error" } },
	args: {
		label: "Group Label",
	},
};
export default meta;

type Story = StoryObj<typeof GroupBox>;

const rectOf = (el: Element | null) => {
	if (!el) throw new Error("element missing");
	return el.getBoundingClientRect();
};

/** a and b differ by less than half a pixel */
const expectNear = async (a: number, b: number) =>
	expect(Math.abs(a - b)).toBeLessThan(0.5);

export const Default: Story = {
	args: {
		label: "Personal Information",
		children: (
			<div>
				<p style={{ margin: 0 }}>Name: Alice Müller</p>
				<p style={{ margin: 0 }}>Age: 32</p>
			</div>
		),
	},
};

export const SmallLabel: Story = {
	args: {
		label: "Settings",
		smallLabel: true,
		children: <p style={{ margin: 0 }}>Some settings content here.</p>,
	},
};

export const NoLabel: Story = {
	args: {
		label: undefined,
		children: <p style={{ margin: 0 }}>Content without a legend.</p>,
	},
};

export const ReactNodeLabel: Story = {
	args: {
		label: <strong>Rich Label</strong>,
		children: <p style={{ margin: 0 }}>Content with a ReactNode label.</p>,
	},
};

export const Busy: Story = {
	args: {
		label: "Attachments",
		"aria-busy": true,
		children: <p style={{ margin: 0 }}>Loading…</p>,
	},
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("group", { name: "Attachments" }),
		).toHaveAttribute("aria-busy", "true");
	},
};

export const EqualHeightInGridRow: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Each frame fills its Grid item, so frames in one row are as tall as the row's tallest content (the read-only viewer layout).",
			},
		},
	},
	render: () => (
		<div style={{ width: 600 }}>
			<Grid container spacing={2}>
				<Grid size={6} data-testid={"item-short"}>
					<GroupBox id={"short"} label={"Service information"}>
						<div style={{ height: 40 }}>Interval: 12 months</div>
					</GroupBox>
				</Grid>
				<Grid size={6} data-testid={"item-tall"}>
					<GroupBox id={"tall"} label={"Videos"}>
						<div style={{ height: 200 }}>No videos</div>
					</GroupBox>
				</Grid>
			</Grid>
		</div>
	),
	play: async ({ canvasElement }) => {
		const short = rectOf(canvasElement.querySelector("#short"));
		const tall = rectOf(canvasElement.querySelector("#tall"));
		const item = rectOf(
			canvasElement.querySelector("[data-testid=item-short]"),
		);
		await expectNear(short.top, tall.top);
		await expectNear(short.bottom, tall.bottom);
		await expectNear(short.top, item.top);
		await expectNear(short.bottom, item.bottom);
		await expectNear(short.width, item.width);
	},
};

export const FullHeightChild: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"In a parent with a definite height the frame fills it, and a child with `height: 100%` fills the space below the legend.",
			},
		},
	},
	render: () => (
		<div data-testid={"parent"} style={{ width: 400, height: 400 }}>
			<GroupBox id={"gb"} label={"Device types"}>
				<div data-testid={"child"} style={{ height: "100%" }}>
					tree
				</div>
			</GroupBox>
		</div>
	),
	play: async ({ canvasElement }) => {
		const parent = rectOf(canvasElement.querySelector("[data-testid=parent]"));
		const box = rectOf(canvasElement.querySelector("#gb"));
		const legend = rectOf(canvasElement.querySelector("#gb > legend"));
		const child = rectOf(canvasElement.querySelector("[data-testid=child]"));
		await expectNear(box.top, parent.top);
		await expectNear(box.bottom, parent.bottom);
		await expect(child.top).toBeGreaterThanOrEqual(legend.bottom);
		await expect(child.bottom).toBeLessThanOrEqual(box.bottom - 9);
		await expect(child.height).toBeGreaterThan(300);
	},
};

export const Issue3462Item1HelperTextStaysAboveNextField: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-1: an image field with an error, as the library's image renderer lays it out (ImageSelector, whose root is a GroupBox, followed by its helper text in one Grid item). The frame fills the whole item, so the error text is pushed out of the item and drawn over the next field's label.",
			},
		},
	},
	render: () => (
		<div style={{ width: 600 }}>
			<Grid container spacing={2}>
				<Grid size={12} data-testid={"item"}>
					<ImageSelector
						name={"avatar"}
						value={""}
						label={"Profile picture"}
						alt={"Profile picture"}
						capture={false}
						readOnly={false}
						onChange={() => {}}
					/>
					<FormHelperTextCC error>Image is required</FormHelperTextCC>
				</Grid>
				<Grid size={12} data-testid={"next"}>
					<TextField label={"Serial number"} defaultValue={"SN-1"} fullWidth />
				</Grid>
			</Grid>
		</div>
	),
	play: async ({ canvasElement }) => {
		const helper = rectOf(within(canvasElement).getByText("Image is required"));
		const next = rectOf(canvasElement.querySelector("[data-testid=next]"));
		const item = rectOf(canvasElement.querySelector("[data-testid=item]"));
		await expect(helper.bottom).toBeLessThanOrEqual(next.top);
		await expect(helper.bottom).toBeLessThanOrEqual(item.bottom + 0.5);
	},
};

export const Issue3462Item1HeadingAboveKeepsFrameInGridItem: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-1: a heading above the frame in the same Grid item. The frame is as tall as the whole item and starts below the heading, so it overlaps the next row by the heading's height.",
			},
		},
	},
	render: () => (
		<div style={{ width: 600 }}>
			<Grid container spacing={2}>
				<Grid size={12} data-testid={"item"}>
					<Typography variant={"subtitle1"} component={"h2"}>
						Conclusion
					</Typography>
					<GroupBox id={"gb"} label={"Details"}>
						<div style={{ height: 80 }}>details</div>
					</GroupBox>
				</Grid>
				<Grid size={12} data-testid={"next"}>
					<p style={{ margin: 0 }}>next row</p>
				</Grid>
			</Grid>
		</div>
	),
	play: async ({ canvasElement }) => {
		const box = rectOf(canvasElement.querySelector("#gb"));
		const item = rectOf(canvasElement.querySelector("[data-testid=item]"));
		const next = rectOf(canvasElement.querySelector("[data-testid=next]"));
		await expect(box.bottom).toBeLessThanOrEqual(item.bottom + 0.5);
		await expect(box.bottom).toBeLessThanOrEqual(next.top);
	},
};

const FitContentGroupBox = styled(GroupBox)({ height: "fit-content" });
const autoHeightTheme = createTheme({
	components: { CcGroupBox: { styleOverrides: { root: { height: "auto" } } } },
});

export const Issue3462Item1HeightOverrideWinsAsOnlyChild: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"A height from a `styled(GroupBox)` wrapper or from the theme's `styleOverrides.root` replaces the stretch: each frame is the only child of a 200px tall parent and is as tall as its content.",
			},
		},
	},
	render: () => (
		<div style={{ width: 400 }}>
			<div style={{ height: 200 }}>
				<FitContentGroupBox id={"styled"} label={"Styled"}>
					<div data-testid={"styled-content"} style={{ height: 40 }}>
						content
					</div>
				</FitContentGroupBox>
			</div>
			<ThemeProvider theme={autoHeightTheme}>
				<div style={{ height: 200 }}>
					<GroupBox id={"themed"} label={"Themed"}>
						<div data-testid={"themed-content"} style={{ height: 40 }}>
							content
						</div>
					</GroupBox>
				</div>
			</ThemeProvider>
		</div>
	),
	play: async ({ canvasElement }) => {
		for (const name of ["styled", "themed"]) {
			const box = rectOf(canvasElement.querySelector("#" + name));
			const content = rectOf(
				canvasElement.querySelector(`[data-testid=${name}-content]`),
			);
			await expectNear(box.bottom - content.bottom, 9);
		}
	},
};
