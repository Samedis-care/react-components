import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Box,
	IconButton,
	SvgIconProps,
	ThemeProvider,
	Tooltip,
	Typography,
	createTheme,
} from "@mui/material";
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

const ICONS = {
	FilterIcon,
	SignIcon,
	ExportIcon,
};
type IconName = keyof typeof ICONS;
const ICON_NAMES = Object.keys(ICONS) as IconName[];

const COLORS = [
	"inherit",
	"action",
	"disabled",
	"primary",
	"secondary",
	"error",
	"info",
	"success",
	"warning",
] as const;
type IconColor = (typeof COLORS)[number];

const FONT_SIZES = ["small", "medium", "large", "inherit"] as const;

// the theme of .storybook/preview.ts
const lightTheme = createTheme();
const darkTheme = createTheme({ palette: { mode: "dark" } });

/** The computed (rgb) form of a CSS color, for comparing with getComputedStyle. */
const cssColor = (value: string) => {
	const probe = document.createElement("span");
	probe.style.color = value;
	document.body.appendChild(probe);
	const color = getComputedStyle(probe).color;
	probe.remove();
	return color;
};

const shapesOf = (svg: SVGSVGElement) =>
	Array.from(svg.querySelectorAll<SVGGraphicsElement>("path"));

/** Icons whose glyph is not filled with the svg's own (computed) color. */
const fillMismatches = (canvasElement: HTMLElement) =>
	Array.from(canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"))
		.filter((svg) => {
			const color = getComputedStyle(svg).color;
			return shapesOf(svg).some(
				(shape) => getComputedStyle(shape).fill !== color,
			);
		})
		.map((svg) => `${svg.dataset.icon} (${svg.dataset.color})`);

// user units of the viewBox
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
			{ICON_NAMES.map((name) => {
				const Icon = ICONS[name];
				const Neighbor = MATERIAL_NEIGHBORS[name];
				return (
					<React.Fragment key={name}>
						<Typography variant="caption">{name}</Typography>
						{KEYLINE_SIZE_NAMES.map((size) => (
							<React.Fragment key={size}>
								<Icon data-icon={name} data-size={size} fontSize={size} />
								<Neighbor fontSize={size} />
							</React.Fragment>
						))}
					</React.Fragment>
				);
			})}
		</Box>
	);
});

interface IconPreviewProps extends SvgIconProps {
	/**
	 * The icon of the set to show (story only).
	 */
	icon: IconName;
}

const IconPreview = React.memo(function IconPreview(props: IconPreviewProps) {
	const { icon, ...svgIconProps } = props;
	const Icon = ICONS[icon];
	return <Icon {...svgIconProps} />;
});

const IconGrid = React.memo(function IconGrid() {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
				gap: 3,
				padding: 2,
			}}
		>
			{ICON_NAMES.map((name) => {
				const Icon = ICONS[name];
				return (
					<Box
						key={name}
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Icon data-icon={name} sx={{ fontSize: 40 }} />
						<Typography variant="caption">{name}</Typography>
					</Box>
				);
			})}
		</Box>
	);
});

const GlyphFit = React.memo(function GlyphFit() {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "auto 24px 16px",
				gap: 2,
				alignItems: "center",
			}}
		>
			{ICON_NAMES.map((name) => {
				const Icon = ICONS[name];
				return (
					<React.Fragment key={name}>
						<Typography variant="caption">{name}</Typography>
						<Icon data-icon={name} data-sizing={"font-size"} />
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

const meta: Meta<typeof IconPreview> = {
	title: "Standalone/Icons",
	component: IconPreview,
	args: { icon: "FilterIcon", color: "inherit", fontSize: "medium" },
	argTypes: {
		icon: {
			control: "select",
			options: ICON_NAMES,
			description: "The icon to show (story only, not a prop).",
		},
		color: {
			control: "select",
			options: COLORS,
			description:
				"Palette key for the glyph color. Default `inherit`: the parent's text color.",
		},
		fontSize: {
			control: "select",
			options: FONT_SIZES,
			description:
				"`small` 20px, `medium` 24px (default), `large` 35px, `inherit` 1em of the parent's font size.",
		},
		htmlColor: {
			control: "color",
			description:
				"Any CSS color. Only takes effect while `color` is `inherit`.",
		},
		titleAccess: {
			control: "text",
			description:
				'Accessible name: adds `role="img"` and a `<title>`. Without it the icon is decorative (`aria-hidden="true"`).',
		},
		viewBox: {
			control: "text",
			description:
				"Replaces the icon's own viewBox (its glyph padded on Material's 24-unit grid), as on a Material icon.",
		},
	},
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"Custom icons built on MUI `SvgIcon` that behave like Material icons: they take MUI `SvgIconProps` (a caller's `viewBox` replaces their own), pass a `ref` to the `<svg>`, are typed `SvgIconComponent`, and their glyphs are padded on Material's 24-unit grid, so they look as large as a Material icon of the same `fontSize`. They are decorative by default; used as a control, an icon goes inside an `IconButton` with an `aria-label`. The FileUpload file-type icons (`ExcelFileIcon`, ...) are a separate set.",
			},
		},
	},
};
export default meta;

type Story = StoryObj<typeof IconPreview>;

export const Playground: Story = {
	play: async ({ canvasElement }) => {
		const svg = canvasElement.querySelector("svg") as SVGSVGElement;
		await expect(svg).toHaveAttribute("aria-hidden", "true");
		const box = svg.getBoundingClientRect();
		await expect([box.width, box.height]).toEqual([24, 24]);
	},
};

export const AllIcons: Story = {
	parameters: {
		docs: {
			description: {
				story: "Every icon of the set at `sx={{ fontSize: 40 }}`.",
			},
		},
	},
	render: () => <IconGrid />,
	play: async ({ canvasElement }) => {
		const svgs = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(svgs.map((svg) => svg.dataset.icon)).toEqual(ICON_NAMES);
		for (const svg of svgs) {
			const box = svg.getBoundingClientRect();
			await expect([box.width, box.height]).toEqual([40, 40]);
			// a malformed path draws nothing and has an empty box
			const empty = shapesOf(svg).filter((shape) => {
				const bbox = shape.getBBox();
				return bbox.width === 0 || bbox.height === 0;
			});
			await expect(empty).toEqual([]);
		}
	},
};

export const AllIconsOnPhone: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		docs: {
			description: {
				story: "The overview reflows to two columns at 320px.",
			},
		},
	},
	render: () => <IconGrid />,
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll("svg[data-icon]")).toHaveLength(
			ICON_NAMES.length,
		);
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			window.innerWidth,
		);
	},
};

export const FontSizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`fontSize` `small`, `medium`, `large` and `inherit` (under a 30px parent). The box is square at every size.",
			},
		},
	},
	render: () => (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "auto repeat(4, 40px)",
				gap: 1,
				alignItems: "center",
				fontSize: 30,
			}}
		>
			{ICON_NAMES.map((name) => {
				const Icon = ICONS[name];
				return (
					<React.Fragment key={name}>
						<Typography variant="caption">{name}</Typography>
						{FONT_SIZES.map((size) => (
							<Icon
								key={size}
								data-icon={name}
								data-size={size}
								fontSize={size}
							/>
						))}
					</React.Fragment>
				);
			})}
		</Box>
	),
	play: async ({ canvasElement }) => {
		const expected = { small: 20, medium: 24, large: 35, inherit: 30 };
		const svgs = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(svgs).toHaveLength(ICON_NAMES.length * FONT_SIZES.length);
		const wrong = svgs
			.filter((svg) => {
				const box = svg.getBoundingClientRect();
				const size = expected[svg.dataset.size as keyof typeof expected];
				return box.width !== size || box.height !== size;
			})
			.map((svg) => `${svg.dataset.icon} (${svg.dataset.size})`);
		await expect(wrong).toEqual([]);
	},
};

export const ColorVariants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Every `color` on every icon, under a parent with color `rgb(10, 20, 30)` (which `inherit` takes). The glyph is filled with the icon's color through MUI's `fill: currentColor`.",
			},
		},
	},
	render: () => (
		<Box
			sx={{
				color: "rgb(10, 20, 30)",
				display: "grid",
				gridTemplateColumns: `auto repeat(${COLORS.length}, 32px)`,
				gap: 1,
				alignItems: "center",
			}}
		>
			{ICON_NAMES.map((name) => {
				const Icon = ICONS[name];
				return (
					<React.Fragment key={name}>
						<Typography variant="caption">{name}</Typography>
						{COLORS.map((color) => (
							<Icon
								key={color}
								data-icon={name}
								data-color={color}
								color={color}
							/>
						))}
					</React.Fragment>
				);
			})}
		</Box>
	),
	play: async ({ canvasElement }) => {
		const palette = lightTheme.palette;
		const expected: Record<IconColor, string> = {
			inherit: "rgb(10, 20, 30)",
			action: palette.action.active,
			disabled: palette.action.disabled,
			primary: palette.primary.main,
			secondary: palette.secondary.main,
			error: palette.error.main,
			info: palette.info.main,
			success: palette.success.main,
			warning: palette.warning.main,
		};
		const svgs = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(svgs).toHaveLength(ICON_NAMES.length * COLORS.length);
		const wrongColor = svgs
			.filter(
				(svg) =>
					getComputedStyle(svg).color !==
					cssColor(expected[svg.dataset.color as IconColor]),
			)
			.map((svg) => `${svg.dataset.icon} (${svg.dataset.color})`);
		await expect(wrongColor).toEqual([]);
		await expect(fillMismatches(canvasElement)).toEqual([]);
	},
};

export const DarkTheme: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"In a dark theme `inherit` follows the light text color and `primary` the dark palette; no icon keeps a dark fill of its own.",
			},
		},
	},
	render: () => (
		<ThemeProvider theme={darkTheme}>
			<Box
				sx={{
					bgcolor: "background.default",
					color: "text.primary",
					display: "flex",
					flexWrap: "wrap",
					gap: 2,
					padding: 2,
				}}
			>
				{ICON_NAMES.map((name) => {
					const Icon = ICONS[name];
					return (
						<React.Fragment key={name}>
							<Icon data-icon={name} data-color={"inherit"} />
							<Icon data-icon={name} data-color={"primary"} color={"primary"} />
						</React.Fragment>
					);
				})}
			</Box>
		</ThemeProvider>
	),
	play: async ({ canvasElement }) => {
		const expected = {
			inherit: cssColor(darkTheme.palette.text.primary),
			primary: cssColor(darkTheme.palette.primary.main),
		};
		const svgs = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(svgs).toHaveLength(2 * ICON_NAMES.length);
		const wrongColor = svgs
			.filter(
				(svg) =>
					getComputedStyle(svg).color !==
					expected[svg.dataset.color as keyof typeof expected],
			)
			.map((svg) => `${svg.dataset.icon} (${svg.dataset.color})`);
		await expect(wrongColor).toEqual([]);
		await expect(fillMismatches(canvasElement)).toEqual([]);
	},
};

export const HtmlColor: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`htmlColor` sets any CSS color, but only while `color` is `inherit`: a palette `color` wins over it.",
			},
		},
	},
	render: () => (
		<Box sx={{ display: "flex", gap: 2 }}>
			<FilterIcon
				data-icon={"FilterIcon"}
				data-color={"htmlColor"}
				htmlColor={"#ff0000"}
			/>
			<FilterIcon
				data-icon={"FilterIcon"}
				data-color={"primary + htmlColor"}
				color={"primary"}
				htmlColor={"#ff0000"}
			/>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const [html, palette] = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(getComputedStyle(html).color).toBe("rgb(255, 0, 0)");
		await expect(getComputedStyle(palette).color).toBe(
			cssColor(lightTheme.palette.primary.main),
		);
		await expect(fillMismatches(canvasElement)).toEqual([]);
	},
};

export const GlyphsFitTheirViewBox: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Each glyph lies inside its own viewBox and is centered in it, at the default size and when sized by width only (`width: 16, height: "auto"`): the box stays square and no part of the glyph is clipped.',
			},
		},
	},
	render: () => <GlyphFit />,
	play: async ({ canvasElement }) => {
		const svgs = Array.from(
			canvasElement.querySelectorAll<SVGSVGElement>("svg[data-icon]"),
		);
		await expect(svgs).toHaveLength(2 * ICON_NAMES.length);
		await expect(svgs.flatMap(glyphProblems)).toEqual([]);
	},
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

export const WithTitleAccess: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'An icon that carries meaning on its own gets `titleAccess`: it becomes `role="img"` named by a `<title>`. A long title does not change its size.',
			},
		},
	},
	render: () => (
		<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
			<SignIcon titleAccess={"Unterschrieben"} />
			<ExportIcon
				color={"success"}
				titleAccess={
					"Erfolgreich exportiert: alle Datensätze dieser Ansicht wurden mit den sichtbaren Spalten als Excel-Datei heruntergeladen"
				}
			/>
		</Box>
	),
	play: async ({ canvas }) => {
		const signed = canvas.getByRole("img", { name: "Unterschrieben" });
		await expect(signed).not.toHaveAttribute("aria-hidden");
		const exported = canvas.getByRole("img", { name: /^Erfolgreich/ });
		for (const img of [signed, exported]) {
			const box = img.getBoundingClientRect();
			await expect([box.width, box.height]).toEqual([24, 24]);
		}
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
			ICON_NAMES.length * KEYLINE_SIZE_NAMES.length,
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
