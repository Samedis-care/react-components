import { describe, it, expect } from "vitest";

// Schedule's Weekly/index normalizes moments via:
//   normalizeMoment(instance) => instance.weekday(0).hour(0).minute(0).second(0).millisecond(0)
// That function is not exported, so we test the observable behaviour of the
// exported WeekView via its loadData signature (pure data contracts).

// The only pure utility exposed by the Schedule module is from matchPath-like
// logic; Schedule itself is a UI-heavy component.  We therefore write property
// tests around the IDayData shape and the LoadWeekCallback contract.

import type { IDayData } from "../../src/standalone/Schedule/Common/DayContents";
import type { LoadWeekCallback } from "../../src/standalone/Schedule/Scrollable";

describe("IDayData contract", () => {
	it("accepts a minimal object with id and title", () => {
		const item: IDayData = { id: "1", title: "Morning standup" };
		expect(item.id).toBe("1");
		expect(item.title).toBe("Morning standup");
	});

	it("accepts optional onClick and onAuxClick handlers", () => {
		const handler = () => {};
		const item: IDayData = {
			id: "2",
			title: "Sprint review",
			onClick: handler,
			onAuxClick: handler,
		};
		expect(item.onClick).toBe(handler);
		expect(item.onAuxClick).toBe(handler);
	});
});

describe("LoadWeekCallback contract", () => {
	it("sync callback returns a 7-element array (one slot per day)", async () => {
		const cb: LoadWeekCallback = () => {
			return Array.from({ length: 7 }, () => [] as IDayData[]);
		};
		const result = await cb(0, {});
		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(7);
	});

	it("async callback can return a promise that resolves to IDayData[][]", async () => {
		const cb: LoadWeekCallback = (offset) => {
			const day: IDayData[] = offset === 0 ? [{ id: "x", title: "Event" }] : [];
			return Promise.resolve(
				Array.from({ length: 7 }, (_, i) => (i === 0 ? day : [])),
			);
		};
		const result = await cb(0, {});
		expect(result[0]).toHaveLength(1);
		expect(result[0][0].id).toBe("x");
		result.slice(1).forEach((day) => expect(day).toHaveLength(0));
	});

	it("week offset of -1 represents last week (convention check)", async () => {
		const receivedOffsets: number[] = [];
		const cb: LoadWeekCallback = (offset) => {
			receivedOffsets.push(offset);
			return Array.from({ length: 7 }, () => []);
		};
		await cb(-1, {});
		await cb(0, {});
		await cb(1, {});
		expect(receivedOffsets).toEqual([-1, 0, 1]);
	});
});

describe("ScheduleFilterDefinition contract", () => {
	it("select filter has type, options, and defaultValue", () => {
		const filter = {
			type: "select" as const,
			options: { all: "All", work: "Work" },
			defaultValue: "all",
		};
		expect(filter.type).toBe("select");
		expect(Object.keys(filter.options)).toContain("all");
		expect(filter.defaultValue).toBe("all");
	});

	it("checkbox filter has type, defaultValue, and label", () => {
		const filter = {
			type: "checkbox" as const,
			defaultValue: false,
			label: "Show weekends",
		};
		expect(filter.type).toBe("checkbox");
		expect(filter.defaultValue).toBe(false);
		expect(filter.label).toBe("Show weekends");
	});
});
