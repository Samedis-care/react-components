import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import { ScrollableSchedule, WeeklySchedule } from "./index";
import type { IDayData } from "./Common/DayContents";
import type { LoadWeekCallback } from "./Scrollable";
import type { WeekViewProps } from "./Weekly";

// ─── Sample data helpers ─────────────────────────────────────────────────────

const SAMPLE_DAY_DATA: IDayData[][] = [
	// Monday
	[
		{ id: "1", title: "Team standup 09:00" },
		{
			id: "2",
			title: "Sprint planning 10:00",
			onClick: () => alert("Sprint planning clicked"),
		},
	],
	// Tuesday
	[{ id: "3", title: "Design review 14:00" }],
	// Wednesday
	[
		{ id: "4", title: "Backend sync 11:00" },
		{ id: "5", title: "1:1 with manager 15:00" },
	],
	// Thursday
	[{ id: "6", title: "Demo prep 13:00" }],
	// Friday
	[{ id: "7", title: "Weekly retrospective 16:00" }],
	// Saturday
	[],
	// Sunday
	[],
];

const loadWeekData: LoadWeekCallback = async () => {
	// simulate a brief network delay
	await new Promise((r) => setTimeout(r, 50));
	return SAMPLE_DAY_DATA;
};

const loadWeekDataForWeeklySchedule: WeekViewProps["loadData"] = async () => {
	await new Promise((r) => setTimeout(r, 50));
	return SAMPLE_DAY_DATA;
};

// ─── ScrollableSchedule ───────────────────────────────────────────────────────

const ScrollableMeta: Meta<typeof ScrollableSchedule> = {
	title: "standalone/Schedule/ScrollableSchedule",
	component: ScrollableSchedule,
	parameters: { layout: "fullscreen" },
};

export default ScrollableMeta;

type ScrollableStory = StoryObj<typeof ScrollableSchedule>;

const ScrollableWrapper = () => {
	return (
		<Box sx={{ height: 500 }}>
			<ScrollableSchedule
				wrapperClass="schedule-wrapper"
				loadWeekCallback={loadWeekData}
			/>
		</Box>
	);
};

export const Default: ScrollableStory = {
	render: () => <ScrollableWrapper />,
};

const ScrollableWithFilterWrapper = () => {
	return (
		<Box sx={{ height: 500 }}>
			<ScrollableSchedule
				wrapperClass="schedule-wrapper"
				loadWeekCallback={loadWeekData}
				filters={{
					category: {
						type: "select",
						options: { all: "All", work: "Work", personal: "Personal" },
						defaultValue: "all",
					},
				}}
				actions={[
					{
						id: "add",
						label: "Add event",
						onClick: () => alert("Add event"),
					},
				]}
			/>
		</Box>
	);
};

export const WithFilterAndAction: ScrollableStory = {
	render: () => <ScrollableWithFilterWrapper />,
};

// ─── WeeklySchedule ───────────────────────────────────────────────────────────

export const WeeklyDefault: StoryObj<typeof WeeklySchedule> = {
	render: () => (
		<Box sx={{ height: 500, width: "100%" }}>
			<WeeklySchedule loadData={loadWeekDataForWeeklySchedule} />
		</Box>
	),
	parameters: { layout: "fullscreen" },
};

export const WeeklyWithFilter: StoryObj<typeof WeeklySchedule> = {
	render: () => (
		<Box sx={{ height: 500, width: "100%" }}>
			<WeeklySchedule
				loadData={loadWeekDataForWeeklySchedule}
				filters={{
					showWeekends: {
						type: "checkbox",
						defaultValue: false,
						label: "Show weekends",
					},
				}}
			/>
		</Box>
	),
	parameters: { layout: "fullscreen" },
};
