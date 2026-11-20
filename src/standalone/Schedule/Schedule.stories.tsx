import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor } from "storybook/test";
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

const BOUNDED_WRAPPER_CLASS = "story-schedule-bounded-wrapper";

export const Issue3471Item6OpensAtTheCurrentWeek: ScrollableStory = {
	render: () => (
		<Box sx={{ width: 420 }}>
			<style>{`.${BOUNDED_WRAPPER_CLASS} { height: 420px; }`}</style>
			<ScrollableSchedule
				wrapperClass={BOUNDED_WRAPPER_CLASS}
				loadWeekCallback={loadWeekData}
			/>
		</Box>
	),
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"The list opens with the current week at its top, with nothing of it hidden. Once the current week fills the list, the previous week is added above it: first as a spinner, then with its days. The current week stays where it was, and the previous week is out of view above it, reached by scrolling up.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		/** The dividers each week starts with, before today's day */
		const dividersAboveToday = () => {
			const today = canvasElement.querySelector(
				".CcScrollableScheduleDay-today",
			);
			if (!today) return [];
			return Array.from(canvasElement.querySelectorAll("hr")).filter(
				(hr) =>
					hr.compareDocumentPosition(today) & Node.DOCUMENT_POSITION_FOLLOWING,
			);
		};
		// the previous week is added above the current one and loads its days
		await waitFor(() => expect(dividersAboveToday()).toHaveLength(2), {
			timeout: 3000,
		});
		await waitFor(() =>
			expect(
				canvasElement.querySelector(".MuiCircularProgress-root"),
			).toBeNull(),
		);
		// the list's scroll container is the dividers' offsetParent (position: relative)
		const [previousWeek, currentWeek] = dividersAboveToday();
		const scroller = currentWeek.offsetParent as HTMLElement;
		// the current week's divider is where the list's first divider was when
		// it opened; the list follows a week's growth before the next paint, which
		// can be after the frame that shows the days
		await waitFor(() =>
			expect(currentWeek.offsetTop - scroller.scrollTop).toBe(
				previousWeek.offsetTop,
			),
		);
	},
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
