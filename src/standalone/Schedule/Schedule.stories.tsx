import React, { useCallback, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
/* eslint-disable import/no-unresolved */
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
/* eslint-enable import/no-unresolved */
import { Box } from "@mui/material";
import { ScrollableSchedule, WeeklySchedule } from "./index";
import type { IDayData, ScheduleFilterDefinition } from "./Common/DayContents";
import type { LoadWeekCallback, ScrollableScheduleProps } from "./Scrollable";
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

/**
 * One week of entries in the order loadWeekCallback returns them. The stories
 * run in English, where the week starts on Sunday, so [0] is Sunday's row and
 * [6] Saturday's (ScrollableSchedule reads [0] as the first day of the
 * locale's week).
 */
const SAMPLE_WEEK: {
	id: string;
	title: string;
	mine?: boolean;
	done?: boolean;
}[][] = [
	// [0] Sunday
	[],
	// [1] Monday
	[
		{ id: "1", title: "Team standup 09:00", mine: true },
		{ id: "2", title: "Sprint planning 10:00", done: true },
	],
	// [2] Tuesday
	[
		{ id: "3", title: "Design review 14:00", mine: true },
		{ id: "4", title: "Pump check 16:00" },
	],
	// [3] Wednesday
	[
		{ id: "5", title: "Backend sync 11:00" },
		{ id: "6", title: "1:1 with manager 15:00", mine: true, done: true },
	],
	// [4] Thursday
	[
		{ id: "7", title: "Demo prep 13:00" },
		{ id: "8", title: "Calibration 15:00", mine: true },
	],
	// [5] Friday
	[
		{ id: "9", title: "Weekly retrospective 16:00", mine: true },
		{ id: "10", title: "Infusion pump service 17:00" },
	],
	// [6] Saturday
	[],
];

/**
 * The sample week, synchronously (so a week shows its rows before the scroll
 * container checks again whether it is full); entries of other weeks get
 * " (week N)" appended. Honors the sample filters: `mine` (only entries marked
 * mine) and `status` ("open" hides done entries, "done" shows only those).
 */
const loadSampleWeek = (
	weekOffset: number,
	filters: Record<string, string | boolean>,
): IDayData[][] =>
	SAMPLE_WEEK.map((day) =>
		day
			.filter((entry) => !filters.mine || entry.mine)
			.filter(
				(entry) =>
					filters.status == null ||
					filters.status === "all" ||
					(filters.status === "done") === !!entry.done,
			)
			.map((entry) => ({
				id: `${weekOffset}-${entry.id}`,
				title:
					weekOffset === 0
						? entry.title
						: `${entry.title} (week ${weekOffset})`,
			})),
	);

const MINE_FILTER: ScheduleFilterDefinition = {
	type: "checkbox",
	label: "Only mine",
	defaultValue: false,
};

// ─── Story harness ────────────────────────────────────────────────────────────

/** class that gives the scroll container its height (see wrapperClass) */
const HEIGHT_CLASS = "scrollable-schedule-story";
const HOST_SX = { [`& .${HEIGHT_CLASS}`]: { height: 400 } };

interface ScrollableScheduleStoryProps extends ScrollableScheduleProps {
	/**
	 * Story only: becomes the onClick of every entry that has none, so entry
	 * clicks show up in the Actions panel.
	 */
	onEntryClick?: () => void;
}

/**
 * Renders ScrollableSchedule below a box that defines HEIGHT_CLASS, with a
 * loadWeekCallback that is stable for the story and wires `onEntryClick`
 * into the entries.
 */
const ScrollableScheduleStory = (props: ScrollableScheduleStoryProps) => {
	const { loadWeekCallback, onEntryClick, ...other } = props;
	const load = useCallback(
		(weekOffset: number, filters: Record<string, string | boolean>) => {
			const withClick = (days: IDayData[][]) =>
				onEntryClick
					? days.map((day) =>
							day.map((entry) => ({
								...entry,
								onClick: entry.onClick ?? onEntryClick,
							})),
						)
					: days;
			const days = loadWeekCallback(weekOffset, filters);
			return days instanceof Promise ? days.then(withClick) : withClick(days);
		},
		[loadWeekCallback, onEntryClick],
	);
	return (
		<Box sx={HOST_SX}>
			<ScrollableSchedule {...other} loadWeekCallback={load} />
		</Box>
	);
};

const meta: Meta<ScrollableScheduleStoryProps> = {
	title: "standalone/Schedule/ScrollableSchedule",
	component: ScrollableSchedule,
	render: (args) => <ScrollableScheduleStory {...args} />,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"An endless list of weeks for narrow screens, below a header bar with today's date (click: scroll to today's row) and the filters and actions. Each week starts with a heading (level 3) with its dates and year, and each day is a group named by its full date. Weeks are requested one at a time through `loadWeekCallback` while the list fills and whenever the user scrolls to its top or bottom. The scroll container's height must come from `wrapperClass` (here a class with `height: 400px`). For wide screens use `WeeklySchedule`.",
			},
		},
	},
	args: {
		wrapperClass: HEIGHT_CLASS,
		loadWeekCallback: fn(loadSampleWeek),
		onEntryClick: fn(),
	},
	argTypes: {
		wrapperClass: {
			control: false,
			description:
				"Class of the scroll container. It must give it a definite height (px, vh).",
		},
		loadWeekCallback: {
			control: false,
			description:
				"`(weekOffset, filters) => IDayData[][] | Promise<IDayData[][]>`. Called once per week as it is added: on open for week 0, 1, … until the list is full, then for -1, -2, … at the top and the following weeks at the bottom; again after a filter or language change, which starts the list over as on open. Returns 7 arrays, [0] = the first day of the locale's week. A rejection shows an alert in place of the week's rows that names the week, with the error's `message` (or the string rejected with) and a Retry button.",
		},
		filters: {
			control: false,
			description:
				"Filters by name; their values are passed to `loadWeekCallback`. A single filter (and no action) renders inline in the header bar; with two or more filters and actions in total, all of them are listed in a settings menu. `defaultValue` is read on mount only.",
		},
		actions: {
			control: false,
			description:
				"Header buttons: inline if it is the only filter or action, otherwise in the settings menu.",
		},
		className: {
			control: "text",
			description: "Class of the root (header bar and scroll container).",
		},
		classes: {
			control: false,
			description:
				"Classes for the slots `today` (the header bar), `todayBtn` (the date button), `scroller` (the scroll container), `filterWrapper` and `filterSettingsBtn` (the gear icon). Day rows and entries are styled through the theme (`CcScrollableScheduleDay`, `CcDayContents`).",
		},
		onEntryClick: {
			control: false,
			description:
				"Story only: becomes the `onClick` of every entry, so clicks show up in the Actions panel.",
		},
	},
};

export default meta;

type Story = StoryObj<ScrollableScheduleStoryProps>;

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

/** loads like loadWeekData, but the current week fails on its first load */
const FailingOnceWrapper = () => {
	const failed = useRef(false);
	const load = useCallback<LoadWeekCallback>(async (weekOffset) => {
		await new Promise((r) => setTimeout(r, 50));
		if (weekOffset === 0 && !failed.current) {
			failed.current = true;
			throw new Error("Request failed with status code 500");
		}
		return SAMPLE_DAY_DATA;
	}, []);
	// the scroll container gets a height, so the list stops loading once it is full
	return (
		<Box sx={{ "& .failing-week-wrapper": { height: 400 } }}>
			<ScrollableSchedule
				wrapperClass="failing-week-wrapper"
				loadWeekCallback={load}
			/>
		</Box>
	);
};

// a focus indicator: an outline on the element
const outlineOf = (el: Element) => {
	const style = getComputedStyle(el);
	return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0
		? style.outlineColor
		: null;
};

export const Issue3478Item16FailedWeekCanBeRetried: ScrollableStory = {
	render: () => <FailingOnceWrapper />,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3478-ITEM-16: a week whose load fails keeps its week line and shows an alert naming the week, with the error's message and a Retry button. Retry loads the week again; the focus moves to the week line, which stays when the week's rows arrive.",
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const alert = await canvas.findByRole("alert", {}, { timeout: 3000 });
		await expect(alert).toHaveTextContent(/^Week \d+ could not be loaded/);
		await expect(alert).toHaveTextContent(
			"Request failed with status code 500",
		);
		const weekNo = /^Week (\d+)/.exec(alert.textContent ?? "")![1];
		const weekLine = canvas.getByText(new RegExp(`^Week ${weekNo}, `));
		const retry = within(alert).getByRole("button", { name: "Retry" });
		await expect(retry).toHaveAccessibleDescription(
			`Week ${weekNo} could not be loaded Request failed with status code 500`,
		);
		retry.focus();
		await waitFor(() => expect(retry).toHaveClass("Mui-focusVisible"));
		await expect(outlineOf(retry), "Retry shows no focus ring").not.toBeNull();
		await userEvent.keyboard("{Enter}");
		await expect(weekLine).toHaveFocus();
		await waitFor(() => expect(canvas.queryByRole("alert")).toBeNull());
		await waitFor(() =>
			expect(within(canvasElement).queryByRole("progressbar")).toBeNull(),
		);
		await expect(weekLine).toHaveFocus();
		await expect(weekLine.isConnected).toBe(true);
		await expect(
			outlineOf(weekLine),
			"the week line shows no focus ring",
		).not.toBeNull();
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

// ─── Helpers for the play functions ──────────────────────────────────────────

const rectOf = (el: Element) => el.getBoundingClientRect();
const scrollerOf = (root: HTMLElement) => {
	const scroller = root.querySelector<HTMLElement>(`.${HEIGHT_CLASS}`);
	if (!scroller) throw new Error("no scroll container");
	return scroller;
};
const todayRowOf = (root: HTMLElement) =>
	root.querySelector<HTMLElement>(".CcScrollableScheduleDay-today");
/**
 * the weeks in the list, in document order: a week starts with its divider
 * row, followed by its "Week N, …" line and its day rows
 */
const weeksOf = (scroller: HTMLElement) => {
	const weeks: { number: number; rows: HTMLElement[] }[] = [];
	for (const row of Array.from(
		scroller.querySelectorAll<HTMLElement>(".MuiGrid-container > *"),
	)) {
		if (row.querySelector("hr")) weeks.push({ number: NaN, rows: [] });
		const week = weeks[weeks.length - 1];
		if (!week) continue;
		week.rows.push(row);
		const number = /^Week (\d+), /.exec(row.textContent ?? "")?.[1];
		if (number != null) week.number = Number(number);
	}
	return weeks;
};
/** the number of the week whose rows are the first ones in view */
const weekAtTopOf = (scroller: HTMLElement) => {
	const viewTop = rectOf(scroller).top;
	return weeksOf(scroller).find((week) =>
		week.rows.some((row) => rectOf(row).bottom > viewTop + 1),
	)?.number;
};
/** the number of the week that holds today's row */
const currentWeekOf = (scroller: HTMLElement) => {
	const today = todayRowOf(scroller);
	return weeksOf(scroller).find((week) =>
		week.rows.some((row) => today != null && row.contains(today)),
	)?.number;
};
/**
 * no week is loading, and the weeks overflow the list by more than the 250px
 * up to which InfiniteScroll keeps filling it (its default threshold)
 */
const isFull = (scroller: HTMLElement) =>
	!scroller.querySelector(".MuiCircularProgress-root") &&
	scroller.scrollHeight > scroller.clientHeight + 250;
/** waits until the initial fill is done: the weeks have loaded and overflow */
const waitForFill = async (
	canvasElement: HTMLElement,
	loadWeekCallback: ScrollableScheduleProps["loadWeekCallback"],
) => {
	const scroller = scrollerOf(canvasElement);
	await waitFor(() => expect(loadWeekCallback).toHaveBeenCalled());
	await waitFor(() => expect(isFull(scroller)).toBe(true), { timeout: 3000 });
	return scroller;
};

// ─── Bug stories (fail until the bug is fixed) ───────────────────────────────

export const Issue3478Item2RestartsAtTheCurrentWeek: Story = {
	args: { filters: { mine: MINE_FILTER } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3478-ITEM-2: a filter change empties the list; the browser clamps the scroll position to 0, which counts as reaching the top, so last week is requested and shown first. Expected: the list restarts at the current week, as after mount.",
			},
		},
	},
	play: async ({ canvas, canvasElement, args }) => {
		const { mock } = args.loadWeekCallback as unknown as {
			mock: { calls: unknown[][] };
		};
		const scroller = await waitForFill(canvasElement, args.loadWeekCallback);
		// on mount, the current week is the first one in view
		const currentWeek = currentWeekOf(scroller);
		await expect(currentWeek).toBeGreaterThan(0);
		await expect(weekAtTopOf(scroller)).toBe(currentWeek);
		// the user has scrolled down into the list
		scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) / 2;
		await expect(scroller.scrollTop).toBeGreaterThan(0);
		const callsBefore = mock.calls.length;
		await userEvent.click(canvas.getByRole("checkbox", { name: "Only mine" }));
		await waitFor(() =>
			expect(args.loadWeekCallback).toHaveBeenCalledWith(0, { mine: true }),
		);
		const afterChange = mock.calls.slice(callsBefore);
		await expect(afterChange[0]).toEqual([0, { mine: true }]);
		// once the list is full again, the current week is the first one in view
		const list = () => scrollerOf(canvasElement);
		await waitFor(() => expect(isFull(list())).toBe(true), { timeout: 3000 });
		await waitFor(() => expect(weekAtTopOf(list())).toBe(currentWeek));
	},
};

export const Issue3478Item17WeeksAndDaysHaveStructure: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3478-ITEM-17: each week starts with a heading of level 3, "Week N, DD MMM - DD MMM YYYY", which looks like the text around it. Each day is a group named by its full date ("Wednesday, October 14, 2026"). The full date is visually hidden inside the day\'s label, so a screen reader that brings it into view keeps the list at that day.',
			},
		},
	},
	play: async ({ canvasElement, args }) => {
		const scroller = await waitForFill(canvasElement, args.loadWeekCallback);
		const headings = within(scroller).getAllByRole("heading", { level: 3 });
		await expect(headings.length).toBeGreaterThan(0);
		for (const heading of headings) {
			await expect(heading).toHaveAccessibleName(
				/^Week \d+, \d{2} \w{3}( \d{4})? - \d{2} \w{3} \d{4}$/,
			);
			// no heading font or margins: it looks as the week line did
			const style = getComputedStyle(heading);
			const around = getComputedStyle(heading.parentElement!);
			await expect(style.fontSize).toBe(around.fontSize);
			await expect(style.fontWeight).toBe(around.fontWeight);
			await expect(style.marginTop).toBe("0px");
			await expect(style.marginBottom).toBe("0px");
		}
		const groups = within(scroller).getAllByRole("group");
		await expect(groups).toHaveLength(headings.length * 7);
		for (const group of groups) {
			await expect(group).toHaveAccessibleName(
				/^[A-Z][a-z]+day, [A-Z][a-z]+ \d{1,2}, \d{4}$/,
			);
			// the visually hidden full date lies inside the day's label
			const label = canvasElement.ownerDocument.getElementById(
				group.getAttribute("aria-labelledby")!,
			)!;
			const fullDate = label.querySelector(":scope > :not([aria-hidden])")!;
			const inner = fullDate.getBoundingClientRect();
			const outer = label.getBoundingClientRect();
			await expect(
				inner.top >= outer.top &&
					inner.bottom <= outer.bottom &&
					inner.left >= outer.left &&
					inner.right <= outer.right,
				"the full date is outside the day's label",
			).toBe(true);
		}
	},
};
