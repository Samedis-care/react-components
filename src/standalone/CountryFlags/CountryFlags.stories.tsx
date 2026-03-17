import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
import CountryFlags from "./index";

// CountryFlags is a data module (Record<string, string>), not a React component.
// These stories wrap it in presentational components for visual exploration.

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
	const src = CountryFlags[countryCode];
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
