import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import { Box, IconButton } from "@mui/material";
import {
	Build as BuildIcon,
	Delete as DeleteIcon,
	GetApp as ExportIcon,
	School as SchoolIcon,
} from "@mui/icons-material";
import ComponentWithLabel from "./ComponentWithLabel";
import Checkbox from "./Checkbox";

const meta: Meta<typeof ComponentWithLabel> = {
	title: "Standalone/UIKit/ComponentWithLabel",
	component: ComponentWithLabel,
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"A control with a caption, rendered as a `<label>` around both, so the caption names the control and a click on it activates the control. The DataGrid header and footer use it for their icon buttons.",
			},
		},
	},
	args: {
		labelText: "Export",
		labelPlacement: "bottom",
		control: (
			<IconButton aria-label={"Export"} color={"primary"}>
				<ExportIcon />
			</IconButton>
		),
	},
};
export default meta;

type Story = StoryObj<typeof ComponentWithLabel>;

export const Default: Story = {};

export const WithCheckbox: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The caption names the checkbox; Space and a click on the caption both toggle it.",
			},
		},
	},
	render: () => (
		<ComponentWithLabel control={<Checkbox />} labelText={"Show archived"} />
	),
	play: async ({ canvas, userEvent }) => {
		const box = canvas.getByRole("checkbox", { name: "Show archived" });
		await userEvent.tab();
		await expect(box).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(box).toBeChecked();
		await userEvent.click(canvas.getByText("Show archived"));
		await expect(box).not.toBeChecked();
	},
};

export const Placements: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The caption is aligned away from the control: right for `start`, left for `end`, centred for `top` and `bottom`.",
			},
		},
	},
	render: () => (
		<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
			<ComponentWithLabel
				control={<Checkbox />}
				labelText={"Start"}
				labelPlacement={"start"}
			/>
			<ComponentWithLabel
				control={<Checkbox />}
				labelText={"End"}
				labelPlacement={"end"}
			/>
			<ComponentWithLabel
				control={<Checkbox />}
				labelText={"Top"}
				labelPlacement={"top"}
			/>
			<ComponentWithLabel
				control={<Checkbox />}
				labelText={"Bottom"}
				labelPlacement={"bottom"}
			/>
		</Box>
	),
};

const ACTIONS = [
	["Wartungsauftrag erstellen", <BuildIcon key={"icon"} />],
	["Einweisung dokumentieren", <SchoolIcon key={"icon"} />],
	["Löschen", <DeleteIcon key={"icon"} />],
] as const;

export const Issue3482Item5CaptionsWrapOnPhone: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-5: long captions wrap at their spaces, so a row of labelled actions fits a 320px phone and the page does not scroll sideways (WCAG 1.4.10).",
			},
		},
	},
	render: () => (
		<Box sx={{ display: "flex", width: "100%" }}>
			{ACTIONS.map(([label, icon]) => (
				<ComponentWithLabel
					key={label}
					control={
						<IconButton aria-label={label} color={"primary"}>
							{icon}
						</IconButton>
					}
					labelText={label}
					labelPlacement={"bottom"}
				/>
			))}
		</Box>
	),
	play: async () => {
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			document.documentElement.clientWidth,
		);
	},
};

export const Issue3482Item5LineBreakKept: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3482-ITEM-5: a `"\\n"` in the caption starts a new line, also where the caption has room for its text on one line.',
			},
		},
	},
	render: () => (
		<Box sx={{ display: "flex", gap: 2 }}>
			<ComponentWithLabel
				control={
					<IconButton aria-label={"Export"} color={"primary"}>
						<ExportIcon />
					</IconButton>
				}
				labelText={"Export"}
				labelPlacement={"bottom"}
			/>
			<ComponentWithLabel
				control={
					<IconButton aria-label={"Export all"} color={"primary"}>
						<ExportIcon />
					</IconButton>
				}
				labelText={"Export\nall"}
				labelPlacement={"bottom"}
			/>
		</Box>
	),
	play: async ({ canvas }) => {
		const oneLine = canvas.getByText("Export").getBoundingClientRect();
		const twoLines = canvas.getByText(/^Export\s+all$/).getBoundingClientRect();
		await expect(twoLines.height).toBeGreaterThan(1.5 * oneLine.height);
	},
};
