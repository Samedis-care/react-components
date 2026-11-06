import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import FilterIcon from "./FilterIcon";
import SignIcon from "./SignIcon";
import TuneIcon from "./TuneIcon";
import ResetIcon from "./ResetIcon";
import ExportIcon from "./ExportIcon";
import AppsIcon from "./AppsIcon";
import SuccessOutlinedIcon from "./SuccessOutlinedIcon";

const ICONS = {
	FilterIcon,
	SignIcon,
	TuneIcon,
	ResetIcon,
	ExportIcon,
	AppsIcon,
	SuccessOutlinedIcon,
};
type IconName = keyof typeof ICONS;

const shapesOf = (svg: SVGSVGElement) =>
	Array.from(svg.querySelectorAll<SVGGraphicsElement>("path, rect"));

// user units; ResetIcon's glyph overshoots its viewBox by 0.01
const VIEWBOX_TOLERANCE = 0.1;
const PIXEL_TOLERANCE = 0.5;

/**
 * Checks that the glyph lies inside the viewBox and is centered in it, and that
 * no part of it is drawn outside the element's box (where it is clipped).
 */
const glyphProblems = (svg: SVGSVGElement) => {
	const name = `${svg.dataset.icon} (${svg.dataset.sizing})`;
	const viewBox = svg.viewBox.baseVal;
	const glyph = {
		left: Infinity,
		top: Infinity,
		right: -Infinity,
		bottom: -Infinity,
	};
	shapesOf(svg).forEach((shape) => {
		const bbox = shape.getBBox();
		glyph.left = Math.min(glyph.left, bbox.x);
		glyph.top = Math.min(glyph.top, bbox.y);
		glyph.right = Math.max(glyph.right, bbox.x + bbox.width);
		glyph.bottom = Math.max(glyph.bottom, bbox.y + bbox.height);
	});
	const problems: string[] = [];
	const t = VIEWBOX_TOLERANCE;
	if (
		glyph.left < viewBox.x - t ||
		glyph.top < viewBox.y - t ||
		glyph.right > viewBox.x + viewBox.width + t ||
		glyph.bottom > viewBox.y + viewBox.height + t
	) {
		problems.push(
			`${name}: glyph ${glyph.left} ${glyph.top} ${glyph.right} ${glyph.bottom} exceeds viewBox ${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`,
		);
	}
	const offsetX =
		(glyph.left + glyph.right) / 2 - (viewBox.x + viewBox.width / 2);
	const offsetY =
		(glyph.top + glyph.bottom) / 2 - (viewBox.y + viewBox.height / 2);
	if (Math.abs(offsetX) > t || Math.abs(offsetY) > t) {
		problems.push(
			`${name}: glyph center is ${offsetX.toFixed(2)}, ${offsetY.toFixed(2)} units off the viewBox center`,
		);
	}
	const box = svg.getBoundingClientRect();
	const p = PIXEL_TOLERANCE;
	shapesOf(svg).forEach((shape, index) => {
		const rect = shape.getBoundingClientRect();
		if (
			rect.left < box.left - p ||
			rect.top < box.top - p ||
			rect.right > box.right + p ||
			rect.bottom > box.bottom + p
		) {
			problems.push(
				`${name}: shape ${index} is drawn outside the ${box.width}x${box.height} box`,
			);
		}
	});
	return problems;
};

const allIcons = [
	{ name: "FilterIcon", Component: FilterIcon },
	{ name: "SignIcon", Component: SignIcon },
	{ name: "TuneIcon", Component: TuneIcon },
	{ name: "ResetIcon", Component: ResetIcon },
	{ name: "ExportIcon", Component: ExportIcon },
	{ name: "AppsIcon", Component: AppsIcon },
	{ name: "SuccessOutlinedIcon", Component: SuccessOutlinedIcon },
];

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

const GlyphFit = React.memo(function GlyphFit(props: { names: IconName[] }) {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "auto 24px 16px",
				gap: 2,
				alignItems: "center",
			}}
		>
			{props.names.map((name) => {
				const Icon = ICONS[name];
				return (
					<React.Fragment key={name}>
						<Typography variant="caption">{name}</Typography>
						<Icon data-icon={name} data-sizing={"font-size"} />
						{/* the sizing of the DataGrid's column-header filter icons */}
						<Icon
							data-icon={name}
							data-sizing={"width only"}
							sx={{ width: 16, height: "auto" }}
						/>
					</React.Fragment>
				);
			})}
		</Box>
	);
});

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

// --- bugs ---

export const Issue3460Item2AppsIconGlyphFitsViewBox: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3460-ITEM-2: AppsIcon's viewBox ends where its second row of squares begins, so the grid sits 3px low at 24px and its bottom row is cut off when sized by width only. Expected: the glyph fits its viewBox and is centered.",
			},
		},
	},
	render: () => <GlyphFit names={["AppsIcon"]} />,
	play: async ({ canvasElement }) => {
		const svgs = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(svgs).toHaveLength(2);
		await expect(svgs.flatMap(glyphProblems)).toEqual([]);
	},
};
