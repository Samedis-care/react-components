import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import MobileScalingFix, { MobileScalingFixProps } from "./MobileScalingFix";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateField } from "@mui/x-date-pickers/DateField";
import moment from "moment";

const WrappedMobileScalingFix = (props: MobileScalingFixProps) => (
	<Box sx={{ textAlign: "center", padding: 2 }}>
		<MobileScalingFix {...props} />
		<Typography variant="body2" sx={{ color: "text.secondary" }}>
			MobileScalingFix renders nothing visible. It sets the viewport meta tag on
			mount.
		</Typography>
	</Box>
);

const meta: Meta<typeof WrappedMobileScalingFix> = {
	title: "Standalone/MobileScalingFix",
	component: WrappedMobileScalingFix,
	parameters: { layout: "centered" },
	argTypes: {
		minWidth: { control: { type: "number" } },
	},
};
export default meta;

type Story = StoryObj<typeof WrappedMobileScalingFix>;

export const Default: Story = {
	args: {},
};

export const WithMinWidth: Story = {
	args: {
		minWidth: 1024,
	},
};

export const DeviceWidth: Story = {
	render: () => (
		<Box sx={{ textAlign: "center", padding: 2 }}>
			<MobileScalingFix />
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				Sets viewport width to device-width (no minWidth prop).
			</Typography>
		</Box>
	),
};

export const Issue3459Item12NoZoomRestrictionOnIPhone: Story = {
	args: {},
	parameters: {
		a11y: {
			test: "error",
			// the viewport meta is in <head>, outside the default <body> context
			context: { include: ["html"] },
			options: { runOnly: { type: "rule", values: ["meta-viewport"] } },
		},
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-12: on iPhone/iPod (`navigator.platform`) the content gets `maximum-scale=1`, which axe reports as `meta-viewport` (zoom restriction). Expected: no `maximum-scale`.",
			},
		},
	},
	beforeEach: () => {
		const meta = document.querySelector<HTMLMetaElement>(
			"meta[name='viewport']",
		);
		const previousContent = meta?.content;
		Object.defineProperty(navigator, "platform", {
			value: "iPhone",
			configurable: true,
		});
		return () => {
			// the own property shadows the prototype getter
			delete (navigator as unknown as Record<string, unknown>).platform;
			if (meta && previousContent !== undefined) meta.content = previousContent;
		};
	},
};

/** Stubs `navigator.platform` as "iPhone" for a story */
const stubIPhonePlatform = () => {
	Object.defineProperty(navigator, "platform", {
		value: "iPhone",
		configurable: true,
	});
	return () => {
		// the own property shadows the prototype getter
		delete (navigator as unknown as Record<string, unknown>).platform;
	};
};

// as an app theme may set them: 13px on the input and the date sections
const smallInput = { "& .MuiInputBase-input": { fontSize: 13 } };
const smallSections = {
	"& .MuiPickersInputBase-sectionsContainer": { fontSize: 13 },
};
const nextInspection = moment("2026-11-12");

const fontSize = (element: Element) => getComputedStyle(element).fontSize;

export const Issue3459Item12TextFieldFontSizeOnIPhone: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-12: on iOS and iPadOS (here `navigator.platform` is stubbed as iPhone) text fields get the font size they inherit, but at least 16px, so focusing one does not zoom the page. These fields set 13px on the input and the date sections themselves.",
			},
		},
	},
	beforeEach: stubIPhonePlatform,
	render: () => (
		<LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="en">
			<MobileScalingFix />
			<Box
				sx={{ display: "flex", flexDirection: "column", gap: 2, width: 280 }}
			>
				<TextField
					label="Name"
					defaultValue="Infusion pump"
					size="small"
					sx={smallInput}
				/>
				<DateField
					label="Next inspection"
					defaultValue={nextInspection}
					size="small"
					sx={smallSections}
				/>
				<TextField
					label="Notes"
					defaultValue="Two lines of notes"
					multiline
					size="small"
					sx={smallInput}
				/>
			</Box>
		</LocalizationProvider>
	),
	play: async ({ canvas, canvasElement }) => {
		await expect(fontSize(canvas.getByRole("textbox", { name: "Name" }))).toBe(
			"16px",
		);
		await expect(fontSize(canvas.getByRole("textbox", { name: "Notes" }))).toBe(
			"16px",
		);
		// the date's sections, and the separators between them
		const sections = canvas.getAllByRole("spinbutton");
		await expect(sections.map(fontSize)).toEqual(["16px", "16px", "16px"]);
		const separators = Array.from(
			canvasElement.querySelectorAll(".MuiPickersInputBase-sectionAfter"),
		).filter((separator) => separator.textContent);
		await expect(separators.map(fontSize)).toEqual(["16px", "16px"]);
	},
};
