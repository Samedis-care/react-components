import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import {
	Description as MuiDescription,
	Draw as MuiDraw,
	FilterAlt as MuiFilterAlt,
} from "@mui/icons-material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import FilterIcon from "./FilterIcon";
import SignIcon from "./SignIcon";
import ExportIcon from "./ExportIcon";

const allIcons = [
	{ name: "FilterIcon", Component: FilterIcon },
	{ name: "SignIcon", Component: SignIcon },
	{ name: "ExportIcon", Component: ExportIcon },
];

/**
 * The Material keyline shape each glyph is fitted into, in units of the 24-unit
 * grid (width, height): square 18x18, portrait 16x20.
 */
const KEYLINES: Record<string, readonly [number, number]> = {
	FilterIcon: [18, 18],
	SignIcon: [18, 18],
	ExportIcon: [16, 20],
};

/** A Material icon of a similar motif, shown next to each icon (story only). */
const MATERIAL_NEIGHBORS: Record<string, typeof MuiFilterAlt> = {
	FilterIcon: MuiFilterAlt,
	SignIcon: MuiDraw,
	ExportIcon: MuiDescription,
};

const KEYLINE_SIZES = { small: 20, medium: 24, large: 35 } as const;
type KeylineSize = keyof typeof KEYLINE_SIZES;
const KEYLINE_SIZE_NAMES = Object.keys(KEYLINE_SIZES) as KeylineSize[];
// units of the 24-unit grid
const KEYLINE_TOLERANCE = 0.1;

/**
 * Checks that the glyph fills its Material keyline shape (fits inside it and
 * touches it on one axis) and is centered in the icon's box.
 */
const keylineProblems = (svg: SVGSVGElement) => {
	const name = `${svg.dataset.icon} (${svg.dataset.size})`;
	const keyline = KEYLINES[svg.dataset.icon ?? ""];
	if (!keyline) return [`${name}: no keyline`];
	const box = svg.getBoundingClientRect();
	const unit = box.width / 24;
	const glyph = {
		left: Infinity,
		top: Infinity,
		right: -Infinity,
		bottom: -Infinity,
	};
	svg.querySelectorAll("path").forEach((shape) => {
		const rect = shape.getBoundingClientRect();
		glyph.left = Math.min(glyph.left, rect.left);
		glyph.top = Math.min(glyph.top, rect.top);
		glyph.right = Math.max(glyph.right, rect.right);
		glyph.bottom = Math.max(glyph.bottom, rect.bottom);
	});
	const width = (glyph.right - glyph.left) / unit;
	const height = (glyph.bottom - glyph.top) / unit;
	const [keylineWidth, keylineHeight] = keyline;
	const t = KEYLINE_TOLERANCE;
	const problems: string[] = [];
	if (
		width > keylineWidth + t ||
		height > keylineHeight + t ||
		Math.min(keylineWidth - width, keylineHeight - height) > t
	) {
		problems.push(
			`${name}: glyph is ${width.toFixed(2)}x${height.toFixed(2)} units, not fitted into the ${keylineWidth}x${keylineHeight} keyline`,
		);
	}
	const offsetX =
		((glyph.left + glyph.right) / 2 - (box.left + box.right) / 2) / unit;
	const offsetY =
		((glyph.top + glyph.bottom) / 2 - (box.top + box.bottom) / 2) / unit;
	if (Math.abs(offsetX) > t || Math.abs(offsetY) > t) {
		problems.push(
			`${name}: glyph center is ${offsetX.toFixed(2)}, ${offsetY.toFixed(2)} units off the box center`,
		);
	}
	return problems;
};

const KeylineFit = React.memo(function KeylineFit() {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "auto repeat(6, 40px)",
				gap: 1,
				alignItems: "center",
			}}
		>
			{allIcons.map(({ name, Component }) => {
				const Neighbor = MATERIAL_NEIGHBORS[name];
				return (
					<React.Fragment key={name}>
						<Typography variant="caption">{name}</Typography>
						{KEYLINE_SIZE_NAMES.map((size) => (
							<React.Fragment key={size}>
								<Component data-icon={name} data-size={size} fontSize={size} />
								<Neighbor fontSize={size} />
							</React.Fragment>
						))}
					</React.Fragment>
				);
			})}
		</Box>
	);
});

const IconGrid = () => (
	<Box
		sx={{
			display: "grid",
			gridTemplateColumns: "repeat(4, 1fr)",
			gap: 3,
			padding: 2,
		}}
	>
		{allIcons.map(({ name, Component }) => (
			<Box
				key={name}
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 1,
				}}
			>
				<Component sx={{ fontSize: 40 }} />
				<Typography variant="caption">{name}</Typography>
			</Box>
		))}
	</Box>
);

const meta: Meta<typeof IconGrid> = {
	title: "Standalone/Icons",
	component: IconGrid,
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
	},
};
export default meta;

type Story = StoryObj<typeof IconGrid>;

export const AllIcons: Story = {};

export const ColorVariants: Story = {
	render: () => (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: 3,
				padding: 2,
			}}
		>
			{(
				[
					"inherit",
					"primary",
					"secondary",
					"action",
					"disabled",
					"error",
				] as const
			).map((color) => (
				<Box
					key={color}
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 1,
					}}
				>
					<FilterIcon color={color} sx={{ fontSize: 40 }} />
					<Typography variant="caption">{color}</Typography>
				</Box>
			))}
		</Box>
	),
};

interface IconButtonDemoProps {
	onActivate: () => void;
}

const IconButtonDemo = React.memo(function IconButtonDemo(
	props: IconButtonDemoProps,
) {
	return (
		<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
			<button type={"button"}>Before</button>
			<Tooltip title={"Filters"}>
				<IconButton aria-label={"Filters"} onClick={props.onActivate}>
					<FilterIcon />
				</IconButton>
			</Tooltip>
			<button type={"button"}>After</button>
		</Box>
	);
});

export const InIconButton: StoryObj<typeof IconButtonDemo> = {
	args: { onActivate: fn() },
	parameters: {
		docs: {
			description: {
				story:
					"The accessible way to use an icon as a control, as the DataGrid action bar does: an `IconButton` with an `aria-label` (and a `Tooltip` for sighted users). The button is a tab stop with the label as its name; the icon stays hidden from assistive tech. An `onClick`, `aria-label` or `Tooltip` on the icon itself is not: the hidden `<svg>` is skipped by Tab and by screen readers.",
			},
		},
	},
	render: (args) => <IconButtonDemo {...args} />,
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", { name: "Filters" });
		await expect(canvas.queryByRole("img")).toBeNull();
		await expect(button.querySelector("svg")).toHaveAttribute(
			"aria-hidden",
			"true",
		);

		await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Before" })).toHaveFocus();
		await userEvent.tab();
		await expect(button).toHaveFocus();
		await waitFor(() =>
			expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
				"Filters",
			),
		);
		await userEvent.keyboard("{Enter}");
		await expect(args.onActivate).toHaveBeenCalledTimes(1);
		await userEvent.keyboard(" ");
		await expect(args.onActivate).toHaveBeenCalledTimes(2);

		await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
	},
};

// --- bugs ---

export const Issue3460Item7GlyphsOnMaterialKeylines: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3460-ITEM-7: each icon at `fontSize` `small`, `medium` and `large`, next to a Material icon of a similar motif. Like a Material icon, the glyph is drawn on the 24-unit grid with padding: fitted into its keyline shape (FilterIcon and SignIcon the 18x18 square, ExportIcon the 16x20 portrait rectangle) and centered, so at the same `fontSize` it looks as large as the Material icons next to it.",
			},
		},
	},
	render: () => <KeylineFit />,
	play: async ({ canvasElement }) => {
		const svgs = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(svgs).toHaveLength(
			allIcons.length * KEYLINE_SIZE_NAMES.length,
		);
		const wrongSize = svgs
			.filter((svg) => {
				const box = svg.getBoundingClientRect();
				const size = KEYLINE_SIZES[svg.dataset.size as KeylineSize];
				return box.width !== size || box.height !== size;
			})
			.map((svg) => `${svg.dataset.icon} (${svg.dataset.size})`);
		await expect(wrongSize).toEqual([]);
		await expect(svgs.flatMap(keylineProblems)).toEqual([]);
	},
};
