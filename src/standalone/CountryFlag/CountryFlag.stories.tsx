import React, { Suspense } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	createTheme,
	Paper,
	styled,
	ThemeProvider,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor } from "storybook/test";
import CountryFlag, { CountryFlagProps } from "./index";
import CountryFlags from "../CountryFlags";
import ccI18n from "../../i18n";
import countryNamesEn from "../../assets/i18n/en/countries.json";

const countryName = (code: string): string =>
	(countryNamesEn as Record<string, string>)[code] ?? code;

/** waits until every image has decoded */
const decoded = (imgs: HTMLImageElement[]) =>
	waitFor(
		() =>
			expect(
				imgs
					.filter((img) => !img.complete || img.naturalWidth === 0)
					.map((img) => img.getAttribute("src")),
			).toEqual([]),
		{ timeout: 30000 },
	);

/** the outline of an element, as `<style> <width> <color>` */
const outlineOf = (element: Element) => {
	const style = getComputedStyle(element);
	return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
};

const lightDivider = createTheme().palette.divider;
const darkTheme = createTheme({ palette: { mode: "dark" } });

const meta: Meta<CountryFlagProps> = {
	title: "Standalone/CountryFlag",
	component: CountryFlag,
	// a named flag needs the country names, a namespace that loads on first use
	loaders: [
		async () => {
			await ccI18n.changeLanguage("en");
			await ccI18n.loadNamespaces(["translation", "countries"]);
			return {};
		},
	],
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"A country's flag at a fixed height in a box twice as wide, in the flag's own aspect ratio, with a 1px outline in `theme.palette.divider`, so white-edged flags (Japan, South Korea, Cyprus) and, in dark mode, black-edged ones (Germany) keep their shape. Decorative (`alt=\"\"`) unless `named`.",
			},
		},
	},
	args: { code: "JP", named: false },
	argTypes: {
		code: {
			description:
				'Upper-case ISO 3166-1 alpha-2 code, a key of `CountryFlags` ("DE"). A code without a flag leaves the box empty.',
			control: "select",
			options: Object.keys(CountryFlags),
		},
		size: {
			description:
				'The flag\'s height: px, or a CSS length such as "1em". The box is twice as wide. Default `theme.typography.pxToRem(16)`.',
			control: "number",
		},
		named: {
			description:
				'`true`: the image is named after the country in components-care\'s language; `false`: decorative (`alt=""`)',
			control: "boolean",
		},
	},
	render: (args) => (
		<Suspense fallback="Loading…">
			<CountryFlag {...args} />
		</Suspense>
	),
};
export default meta;

type Story = StoryObj<CountryFlagProps>;

export const Decorative: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The default: a decorative flag (`alt=""`) for a place where the country\'s name is shown beside it, so assistive technology skips the image.',
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		const img = canvasElement.querySelector("img");
		await expect(img).toHaveAttribute("src", CountryFlags.JP);
		await expect(img).toHaveAttribute("alt", "");
		await expect(canvas.queryByRole("img")).toBeNull();
	},
};

export const Named: Story = {
	args: { code: "DE", named: true, size: 24 },
	parameters: {
		docs: {
			description: {
				story:
					"`named`: a flag shown without the country's name is an image named after the country, in components-care's current language.",
			},
		},
	},
	play: async ({ canvas }) => {
		const img = await canvas.findByRole("img", { name: "Germany" });
		await expect(img).toHaveAttribute("src", CountryFlags.DE);
	},
};

const NameList = styled("ul")({
	listStyle: "none",
	margin: 0,
	padding: 0,
	columns: "220px",
});

const NameListItem = styled("li")({
	display: "flex",
	alignItems: "center",
	gap: 8,
	height: 24,
	breakInside: "avoid",
});

const CODES = Object.keys(CountryFlags);

/** every flag beside its English name; the name makes the flag decorative */
const FlagsBesideNames = () => (
	<NameList>
		{CODES.map((code) => (
			<NameListItem key={code}>
				<CountryFlag code={code} data-code={code} />
				<Typography variant="body2" noWrap data-name={code}>
					{countryName(code)}
				</Typography>
			</NameListItem>
		))}
	</NameList>
);

export const Issue3466Item8EveryFlagFitsItsBox: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Every flag beside its name, at the default size: each one is 16px high and as wide as its aspect ratio needs (all flags are 3:2, so 24px), in a 32x16 box, so the names line up. Each flag has the theme's divider color as its outline.",
			},
		},
	},
	render: () => <FlagsBesideNames />,
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.queryAllByRole("img")).toHaveLength(0);
		const boxes = Array.from(
			canvasElement.querySelectorAll<HTMLElement>("[data-code]"),
		);
		await expect(boxes).toHaveLength(CODES.length);
		const imgs = boxes.map((box) => box.querySelector("img")!);
		await expect(imgs.filter((img) => !img)).toEqual([]);
		await decoded(imgs);

		// the box: 32x16, so the names beside it line up
		await expect(
			boxes
				.map((box) => box.getBoundingClientRect())
				.filter((rect) => rect.width !== 32 || rect.height !== 16),
		).toEqual([]);
		const nameStarts = new Set(
			Array.from(canvasElement.querySelectorAll("[data-name]")).map(
				(name) =>
					name.getBoundingClientRect().left -
					name.parentElement!.getBoundingClientRect().left,
			),
		);
		await expect([...nameStarts]).toEqual([40]);

		// the flag: as large as fits into the box, in its own aspect ratio
		const missized = imgs
			.map((img, index) => {
				const ratio = img.naturalWidth / img.naturalHeight;
				const rect = img.getBoundingClientRect();
				const [width, height] = ratio > 2 ? [32, 32 / ratio] : [16 * ratio, 16];
				return Math.abs(rect.width - width) > 0.5 ||
					Math.abs(rect.height - height) > 0.5
					? `${boxes[index].dataset.code} ${rect.width}x${rect.height}`
					: null;
			})
			.filter((entry) => entry !== null);
		await expect(missized).toEqual([]);

		// the outline in the theme's divider color
		await expect(
			new Set(imgs.map((img) => outlineOf(img))).size === 1 &&
				outlineOf(imgs[0]),
		).toBe(`solid 1px ${lightDivider}`);
	},
};

export const Issue3466Item8DarkMode: Story = {
	args: { code: "DE", size: 24 },
	parameters: {
		docs: {
			description: {
				story:
					"In dark mode the outline takes the dark palette's divider color, so the black top stripe of Germany's flag stays apart from a dark background.",
			},
		},
	},
	render: (args) => (
		<ThemeProvider theme={darkTheme}>
			<Paper sx={{ p: 2 }}>
				<CountryFlag {...args} />
			</Paper>
		</ThemeProvider>
	),
	play: async ({ canvasElement }) => {
		const img = canvasElement.querySelector("img")!;
		await decoded([img]);
		await expect(outlineOf(img)).toBe(`solid 1px ${darkTheme.palette.divider}`);
		// 24px high, 3:2
		const rect = img.getBoundingClientRect();
		await expect([Math.round(rect.width), rect.height]).toEqual([36, 24]);
	},
};
