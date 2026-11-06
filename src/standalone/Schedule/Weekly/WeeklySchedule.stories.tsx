import React, { useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
/* eslint-disable import/no-unresolved */
import { expect, fn } from "storybook/test";
/* eslint-enable import/no-unresolved */
import WeeklySchedule from "./index";
import type { WeekViewProps } from "./index";
import type { IDayData } from "../Common/DayContents";

// ─── Sample data ──────────────────────────────────────────────────────────────

/**
 * One week of entries in the order loadData returns them: indexed by JS
 * weekday, [0] = Sunday … [6] = Saturday, whatever the first day of the week
 * of the current locale is. WeeklySchedule picks each column's entries by its
 * date's weekday.
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
	[{ id: "3", title: "Design review 14:00", mine: true }],
	// [3] Wednesday
	[
		{ id: "4", title: "Backend sync 11:00" },
		{ id: "5", title: "1:1 with manager 15:00", mine: true, done: true },
	],
	// [4] Thursday
	[{ id: "6", title: "Demo prep 13:00" }],
	// [5] Friday
	[{ id: "7", title: "Weekly retrospective 16:00", mine: true }],
	// [6] Saturday
	[],
];

/**
 * The sample week; entries of other weeks get " (week N)" appended. Honors
 * the sample filters: `mine` (only entries marked mine) and `status`
 * ("open" hides done entries, "done" shows only those).
 */
const loadSampleWeek = (
	weekOffset: number,
	filter: Record<string, string | boolean>,
): IDayData[][] =>
	SAMPLE_WEEK.map((day) =>
		day
			.filter((entry) => !filter.mine || entry.mine)
			.filter(
				(entry) =>
					filter.status == null ||
					filter.status === "all" ||
					(filter.status === "done") === !!entry.done,
			)
			.map((entry) => ({
				id: `${weekOffset}-${entry.id}`,
				title:
					weekOffset === 0
						? entry.title
						: `${entry.title} (week ${weekOffset})`,
			})),
	);

// ─── Story harness ────────────────────────────────────────────────────────────

interface WeeklyScheduleStoryProps extends WeekViewProps {
	/**
	 * Story only: becomes the onClick of every entry that has none, so entry
	 * clicks show up in the Actions panel.
	 */
	onEntryClick?: () => void;
}

/**
 * Renders WeeklySchedule with a loadData that is stable for the story (an
 * inline function would reload on every render) and that wires
 * `onEntryClick` into the entries.
 */
const WeeklyScheduleStory = (props: WeeklyScheduleStoryProps) => {
	const { loadData, onEntryClick, ...other } = props;
	const load = useCallback(
		async (weekOffset: number, filter: Record<string, string | boolean>) => {
			const days = await loadData(weekOffset, filter);
			if (!onEntryClick) return days;
			return days.map((day) =>
				day.map((entry) => ({
					...entry,
					onClick: entry.onClick ?? onEntryClick,
				})),
			);
		},
		[loadData, onEntryClick],
	);
	return <WeeklySchedule {...other} loadData={load} />;
};

const meta: Meta<WeeklyScheduleStoryProps> = {
	title: "standalone/Schedule/WeeklySchedule",
	component: WeeklySchedule,
	render: (args) => <WeeklyScheduleStory {...args} />,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"One week as seven day columns under a header with Today, week navigation, a week picker (click the week label), up to two inline filters and one inline action. The week, the filter values and the loaded entries are internal state; `loadData` is called for every week and filter change. For narrow screens use `ScrollableSchedule`.",
			},
		},
	},
	args: {
		loadData: fn(loadSampleWeek),
		onEntryClick: fn(),
	},
	argTypes: {
		loadData: {
			control: false,
			description:
				"`(weekOffset, filter) => IDayData[][] | Promise<IDayData[][]>`. Called on mount, on every week change and filter change, and whenever its identity changes (memoize it). `weekOffset` counts whole weeks from the current week; `filter` maps each filter name to its value. Returns 7 arrays indexed by JS weekday: [0] = Sunday … [6] = Saturday, in every locale. A rejection shows the error's `message` in place of the week.",
		},
		filters: {
			control: false,
			description:
				"Filters by name. The first renders left of the week navigation; the second right of the first action; with more than two filters or more than one action, all but the first move into a settings menu. `defaultValue` is read on mount only.",
		},
		actions: {
			control: false,
			description:
				"Header buttons. The first renders inline on the right while there is at most one action and at most two filters; otherwise the settings menu lists them.",
		},
		className: {
			control: "text",
			description: "Class of the root (header and day row).",
		},
		classes: {
			control: false,
			description:
				"Classes for the slots `todayBtn`, `filterWrapper`, `week` and `picker`. Day columns and entries are styled through the theme (`CcWeekViewDay`, `CcDayContents`).",
		},
		onEntryClick: {
			control: false,
			description:
				"Story only: becomes the `onClick` of every entry, so clicks show up in the Actions panel.",
		},
	},
};

export default meta;

type Story = StoryObj<WeeklyScheduleStoryProps>;

// ─── Helpers for the play functions ──────────────────────────────────────────

/** the day column (Paper) whose weekday header is `weekday` */
const columnOf = (root: HTMLElement, weekday: string) => {
	const paper = Array.from(
		root.querySelectorAll<HTMLElement>(".MuiPaper-root"),
	).find((p) => p.querySelector("p")?.textContent === weekday);
	if (!paper) throw new Error(`no column for ${weekday}`);
	return paper;
};

const rectOf = (el: Element) => el.getBoundingClientRect();

// ─── Bug stories (fail until the bug is fixed) ───────────────────────────────

export const Issue3477Item4LongWordsWrapInsideEntries: Story = {
	args: {
		loadData: fn(
			(weekOffset: number, filter: Record<string, string | boolean>) => {
				const days = loadSampleWeek(weekOffset, filter);
				days[3] = [
					{
						id: "long",
						title: "Medizinproduktebetreiberverordnungsprüfung",
					},
					...days[3],
				];
				return days;
			},
		),
	},
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3477-ITEM-4: a long word (common in German) runs out of its entry and over the next column; the columns keep their width. Expected: the text wraps inside the entry.",
			},
		},
	},
	play: async ({ canvas }) => {
		const entry = await canvas.findByRole("button", {
			name: "Medizinproduktebetreiberverordnungsprüfung",
		});
		await expect(entry.scrollWidth).toBeLessThanOrEqual(entry.clientWidth);
	},
};

export const Issue3477Item4LongWordsKeepColumnWidths: Story = {
	args: Issue3477Item4LongWordsWrapInsideEntries.args,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3477-ITEM-4: the text of an entry with a long word stays inside its day column, and the seven columns keep the same width.",
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		const entry = await canvas.findByRole("button", {
			name: "Medizinproduktebetreiberverordnungsprüfung",
		});
		const text = document.createRange();
		text.selectNodeContents(entry);
		await expect(text.getBoundingClientRect().right).toBeLessThanOrEqual(
			rectOf(columnOf(canvasElement, "Wednesday")).right,
		);
		const widths = Array.from(
			canvasElement.querySelectorAll(".MuiPaper-root"),
			(paper) => rectOf(paper).width,
		);
		await expect(widths).toHaveLength(7);
		for (const width of widths) await expect(width).toBeCloseTo(widths[0], 0);
	},
};
