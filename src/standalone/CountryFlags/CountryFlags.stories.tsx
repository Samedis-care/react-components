import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import CountryFlags from "./index";
import getCountryFlag from "./getCountryFlag";

// CountryFlags is a data module (the flags' URLs by CountryCode), not a React
// component. These stories wrap it in presentational components for visual
// exploration.

const AllFlagsGrid = () => (
	<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
		{Object.entries(CountryFlags).map(([code, src]) => (
			<Box
				key={code}
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: 64,
				}}
			>
				<img
					src={src}
					alt={code}
					width={40}
					height={30}
					style={{ objectFit: "contain" }}
				/>
				<Typography variant="caption">{code}</Typography>
			</Box>
		))}
	</Box>
);

const SingleFlag = ({ countryCode }: { countryCode: string }) => {
	const src = getCountryFlag(countryCode);
	if (!src)
		return <Typography color="error">Unknown code: {countryCode}</Typography>;
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 1,
			}}
		>
			<img
				src={src}
				alt={countryCode}
				width={80}
				height={60}
				style={{ objectFit: "contain" }}
			/>
			<Typography variant="body2">{countryCode}</Typography>
		</Box>
	);
};

const meta: Meta = {
	title: "Standalone/CountryFlags",
};
export default meta;

export const AllFlags: StoryObj = {
	render: () => <AllFlagsGrid />,
};

export const SingleFlagLookup: StoryObj<{ countryCode: string }> = {
	args: { countryCode: "DE" },
	argTypes: {
		countryCode: {
			control: "select",
			options: Object.keys(CountryFlags),
		},
	},
	render: ({ countryCode }) => <SingleFlag countryCode={countryCode} />,
};

// the nearest of the colours a flag stripe or star can have
const FLAG_COLORS: Record<string, [number, number, number]> = {
	green: [0, 122, 61],
	red: [206, 17, 38],
	white: [255, 255, 255],
	black: [0, 0, 0],
};

/**
 * Draws the flag image into a 300x200 canvas and names the colour at each
 * point, given as fractions of the flag's width and height
 */
const flagColorsAt = (
	img: HTMLImageElement,
	points: [number, number][],
): string[] => {
	const ctx = document.createElement("canvas").getContext("2d")!;
	ctx.canvas.width = 300;
	ctx.canvas.height = 200;
	ctx.drawImage(img, 0, 0, 300, 200);
	return points.map(([x, y]) => {
		const [r, g, b, a] = ctx.getImageData(
			Math.floor(x * 300),
			Math.floor(y * 200),
			1,
			1,
		).data;
		if (a < 128) return "transparent";
		const distance = ([cr, cg, cb]: [number, number, number]) =>
			(r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
		return Object.keys(FLAG_COLORS).reduce((best, name) =>
			distance(FLAG_COLORS[name]) < distance(FLAG_COLORS[best]) ? name : best,
		);
	});
};

export const Issue3466Item10SyriaFlag: StoryObj = {
	render: () => <SingleFlag countryCode="SY" />,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"Syria's flag as its government has used it since December 2024: green, white and black stripes with three red stars in the white one.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const img = canvasElement.querySelector("img")!;
		await img.decode();
		await expect({
			green: flagColorsAt(img, [
				[0.01, 0.01],
				[0.5, 1 / 6],
				[0.99, 0.32],
			]),
			stars: flagColorsAt(img, [
				[0.25, 0.5],
				[0.5, 0.5],
				[0.75, 0.5],
			]),
			white: flagColorsAt(img, [
				[0.01, 0.5],
				[0.375, 0.5],
				[0.625, 0.5],
				[0.99, 0.5],
			]),
			black: flagColorsAt(img, [
				[0.01, 0.68],
				[0.5, 5 / 6],
				[0.99, 0.99],
			]),
		}).toEqual({
			green: ["green", "green", "green"],
			stars: ["red", "red", "red"],
			white: ["white", "white", "white", "white"],
			black: ["black", "black", "black"],
		});
	},
};
