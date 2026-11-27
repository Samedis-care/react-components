import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Button,
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
import { FormHelperTextCC, TextFieldCC } from "../UIKit/MuiFieldState";
// the theme augmentation that types components.CcGroupBox
import type {} from "../../theme-def";

const meta: Meta<typeof GroupBox> = {
	title: "Standalone/GroupBox",
	component: GroupBox,
	parameters: { layout: "centered", a11y: { test: "error" } },
	args: {
		label: "Group Label",
		smallLabel: false,
		required: false,
		dirty: false,
	},
};
export default meta;

type Story = StoryObj<typeof GroupBox>;

const MOBILE = { viewport: { value: "mobile1", isRotated: false } };

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

export const DescribedByErrorText: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"A framed form control ties the error shown below the frame to its group with `aria-describedby`, so a screen reader reads it when focus enters the group.",
			},
		},
	},
	render: () => (
		<div style={{ width: 400 }}>
			<GroupBox label={"Attachments"} aria-describedby={"attachments-error"}>
				<Button variant={"contained"}>Upload</Button>
			</GroupBox>
			<FormHelperTextCC id={"attachments-error"} error>
				At least one file is required
			</FormHelperTextCC>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("group", { name: "Attachments" }),
		).toHaveAccessibleDescription("At least one file is required");
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

export const Issue3462Item6EnclosesContentInMaxHeightParent: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-6: in a scrolling parent with `max-height: 200px`, the frame inherits the max-height and stays 200px tall while its 400px content runs out of it; the paragraph after the frame is drawn over the content.",
			},
		},
	},
	render: () => (
		<div
			role={"region"}
			aria-label={"Scrolling panel"}
			tabIndex={0}
			style={{ width: 300, maxHeight: 200, overflow: "auto" }}
		>
			<GroupBox id={"gb"} label={"Label"}>
				<div data-testid={"content"} style={{ height: 400 }}>
					tall
				</div>
			</GroupBox>
			<p data-testid={"after"} style={{ margin: 0 }}>
				after
			</p>
		</div>
	),
	play: async ({ canvasElement }) => {
		const box = rectOf(canvasElement.querySelector("#gb"));
		const content = rectOf(
			canvasElement.querySelector("[data-testid=content]"),
		);
		const after = rectOf(canvasElement.querySelector("[data-testid=after]"));
		await expect(box.bottom).toBeGreaterThanOrEqual(content.bottom);
		await expect(after.top).toBeGreaterThanOrEqual(content.bottom);
	},
};

export const Issue3462Item7WidthWithoutBorderBox: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-7: where `box-sizing` is `content-box` (a page without MUI's CssBaseline), the frame is its parent's width plus 18px of padding and border, and sticks out on the right.",
			},
		},
	},
	render: () => (
		<div
			data-testid={"parent"}
			style={{ width: 300, boxSizing: "content-box" }}
		>
			<GroupBox id={"gb"} label={"Label"}>
				<span>content</span>
			</GroupBox>
		</div>
	),
	play: async ({ canvasElement }) => {
		const parent = rectOf(canvasElement.querySelector("[data-testid=parent]"));
		const box = rectOf(canvasElement.querySelector("#gb"));
		await expect(box.right).toBeLessThanOrEqual(parent.right + 0.5);
		await expectNear(box.width, parent.width);
	},
};

export const Issue3462Item7HeightWithoutBorderBox: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-7: where `box-sizing` is `content-box`, the frame as the only child of a 200px tall parent is taller than the parent by its padding and border, and sticks out at the bottom.",
			},
		},
	},
	render: () => (
		<div
			data-testid={"parent"}
			style={{ width: 300, height: 200, boxSizing: "content-box" }}
		>
			<GroupBox id={"gb"} label={"Label"}>
				<span>content</span>
			</GroupBox>
		</div>
	),
	play: async ({ canvasElement }) => {
		const parent = rectOf(canvasElement.querySelector("[data-testid=parent]"));
		const box = rectOf(canvasElement.querySelector("#gb"));
		await expectNear(box.top, parent.top);
		await expectNear(box.bottom, parent.bottom);
	},
};

export const Issue3462Item9LongWordLabelWrapsOnPhone: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-9: at 320px a title with a long compound word does not wrap: it runs over the frame's right border and the page scrolls sideways.",
			},
		},
	},
	render: () => (
		<div style={{ padding: "0 16px" }}>
			<GroupBox
				id={"gb"}
				label={"Medizinproduktebetreiberverordnungsanforderungen"}
			>
				<span>content</span>
			</GroupBox>
		</div>
	),
	play: async ({ canvasElement }) => {
		const box = rectOf(canvasElement.querySelector("#gb"));
		const legend = rectOf(canvasElement.querySelector("#gb > legend"));
		await expect(legend.right).toBeLessThanOrEqual(box.right);
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			document.documentElement.clientWidth,
		);
	},
};

export const Issue3462Item9LongWordLabelWrapsInFlexRow: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-9: at 320px, in a flex row whose item keeps the default `min-width: auto`, a title with a long compound word or a file name still wraps inside the frame: the frame does not widen the row or the page.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", padding: "0 16px" }}>
			<div>
				<GroupBox
					id={"gb"}
					smallLabel
					label={"Konformitätserklärung_Medizinproduktebetreiber.pdf"}
				>
					<span>content</span>
				</GroupBox>
			</div>
		</div>
	),
	play: async ({ canvasElement }) => {
		const viewport = document.documentElement.clientWidth;
		const box = rectOf(canvasElement.querySelector("#gb"));
		const legend = rectOf(canvasElement.querySelector("#gb > legend"));
		// the frame stays inside the row's 16px gutter
		await expect(box.right).toBeLessThanOrEqual(viewport - 16);
		await expect(legend.right).toBeLessThanOrEqual(box.right);
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			viewport,
		);
	},
};

export const Issue3462Item11RequiredAndModified: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3462-ITEM-11: a required frame shows MUI's asterisk after its title, and its group is described as required before its error. A modified one shows the dirty marker's dot after the asterisk, as the outlined field above it does.",
			},
		},
	},
	render: () => (
		<div style={{ width: 400, display: "grid", gap: 16 }}>
			<TextFieldCC label={"Title"} required dirty fullWidth />
			<div>
				<GroupBox
					label={"Attachments"}
					required
					dirty
					aria-describedby={"attachments-error"}
				>
					<Button variant={"contained"}>Upload</Button>
				</GroupBox>
				<FormHelperTextCC id={"attachments-error"} error>
					At least one file is required
				</FormHelperTextCC>
			</div>
		</div>
	),
	play: async ({ canvas }) => {
		const group = await canvas.findByRole("group", {
			name: "Attachments (modified)",
		});
		await expect(group).toHaveAccessibleDescription(
			"Required At least one file is required",
		);
		const asterisk = group.querySelector("legend > .CcGroupBox-asterisk");
		await expect(asterisk).toBeVisible();
		await expect(asterisk).toHaveAttribute("aria-hidden", "true");
		// the dot follows the asterisk on the title's line, as on the text field
		const dot = asterisk?.nextElementSibling ?? null;
		await expect(dot).toBeVisible();
		await expect(rectOf(dot).left).toBeGreaterThanOrEqual(
			rectOf(asterisk).right,
		);
		await expect(rectOf(dot).top).toBeLessThan(rectOf(asterisk).bottom);
	},
};
