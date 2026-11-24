import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import type { PickerChangeHandlerContext } from "@mui/x-date-pickers";
import moment, { type Moment } from "moment";
import usePickerDraft from "../../src/standalone/LocalizedDateTimePickers/usePickerDraft";

/**
 * The picker fields publish a value on every keystroke, so this hook keeps what
 * is being typed apart from what gets reported upstream, and reports a date once
 * the user is done with it.
 *
 * These cover the state machine. Whether the two actually add up to a typable
 * field is a question about real keystrokes and real re-renders, which lives in
 * `src/standalone/LocalizedDateTimePickers/TypedEntry.stories.tsx`.
 */

afterEach(cleanup);

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<LocalizationProvider dateAdapter={AdapterMoment}>
		{children}
	</LocalizationProvider>
);

/** A change the picker considers valid */
const VALID = {} as PickerChangeHandlerContext<unknown>;

/** A change the picker rejects — a half-typed year trips the default `minDate` */
const INVALID = {
	validationError: "minDate",
} as PickerChangeHandlerContext<unknown>;

type Draft = ReturnType<typeof usePickerDraft>;

const renderDraft = (
	value: Moment | null | undefined,
	onChange: (value: Moment | null) => void,
	publishIntermediateValues?: boolean,
	defaultValue?: Moment | null,
) =>
	renderHook(
		(props: { value: Moment | null | undefined }) =>
			usePickerDraft(
				props.value,
				onChange,
				publishIntermediateValues,
				defaultValue,
			),
		{ wrapper, initialProps: { value } },
	);

const emit = (
	result: { current: Draft },
	value: Moment | null,
	context: PickerChangeHandlerContext<unknown>,
) => {
	act(() => {
		result.current.onChange(value, context);
	});
};

const shown = (result: { current: Draft }) =>
	(result.current.value as Moment | null)?.format("YYYY-MM-DD") ?? null;

/** Settles the draft, as the pickers do when the calendar opens */
const settle = (result: { current: Draft }) => {
	act(() => {
		result.current.settle();
	});
};

/**
 * The user is done with the field, as the pickers tell the hook once focus
 * leaves the field and on Enter (which focus moves count as leaving is
 * `useFieldBlur`'s call, tested through the pickers in
 * `LocalizedDateTimePickersWiring.test.tsx`)
 */
const finish = (result: { current: Draft }) => {
	act(() => {
		result.current.finish();
	});
};

/** The picker's onAccept */
const accept = (
	result: { current: Draft },
	value: Moment | null,
	context: PickerChangeHandlerContext<unknown>,
) => {
	act(() => {
		result.current.accept(value, context);
	});
};

/** A change the picker accepts, as its field reports it */
const FROM_FIELD = {
	validationError: null,
	source: "unknown",
} as PickerChangeHandlerContext<unknown>;

/** A change the calendar accepted: a pick, OK */
const FROM_VIEW = {
	validationError: null,
	source: "view",
} as PickerChangeHandlerContext<unknown>;

/** The days of every reported value, `"null"` for `null` */
const reportedDays = (onChange: ReturnType<typeof vi.fn>) =>
	onChange.mock.calls.map(
		(call) => (call[0] as Moment | null)?.format("YYYY-MM-DD") ?? "null",
	);

describe("usePickerDraft", () => {
	it("shows a rejected value but does not report it", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(null, onChange);

		emit(result, moment("0020-08-12"), INVALID);

		expect(onChange).not.toHaveBeenCalled();
		expect(shown(result)).toBe("0020-08-12");
	});

	it("reports a value the picker accepts once the user is done", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(null, onChange);

		// "2", "20", "202" as the year section fills up, then the whole year
		emit(result, moment("0002-08-12"), INVALID);
		emit(result, moment("0020-08-12"), INVALID);
		emit(result, moment("0202-08-12"), INVALID);
		emit(result, moment("2026-08-12"), VALID);
		expect(onChange).not.toHaveBeenCalled();

		finish(result);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect((onChange.mock.calls[0][0] as Moment).format("YYYY-MM-DD")).toBe(
			"2026-08-12",
		);
		// a controlled consumer stores it and hands it back
		rerender({ value: moment("2026-08-12") });
		expect(shown(result)).toBe("2026-08-12");
	});

	it("reports a cleared value once the user is done", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2026-08-12"), onChange);

		// an empty value is valid, so the picker reports no error for it
		emit(result, null, VALID);
		finish(result);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0]).toBeNull();
		rerender({ value: null });
		expect(shown(result)).toBeNull();
	});

	it("keeps the consumer's value when the consumer ignores a reported change", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2024-06-15"), onChange);

		emit(result, moment("2030-01-01"), VALID);
		finish(result);
		expect(onChange).toHaveBeenCalledTimes(1);
		// the consumer heard it and kept its own value, which is its call to make
		rerender({ value: moment("2024-06-15") });

		expect(shown(result)).toBe("2024-06-15");
	});

	it("keeps the draft while the consumer's value stands still", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2024-06-15"), onChange);

		emit(result, moment("0020-06-15"), INVALID);
		// an equal but freshly built value, as `moment(...)` in render produces on
		// every re-render
		rerender({ value: moment("2024-06-15") });

		expect(shown(result)).toBe("0020-06-15");
	});

	it("drops the draft when the consumer's value moves on", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2024-06-15"), onChange);

		emit(result, moment("0020-06-15"), INVALID);
		rerender({ value: moment("2030-01-01") });

		expect(shown(result)).toBe("2030-01-01");
	});

	it("drops a rejected draft when it settles", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2024-06-15"), onChange);

		emit(result, moment("0020-06-15"), INVALID);
		settle(result);

		expect(shown(result)).toBe("2024-06-15");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("keeps an accepted value when it settles", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2024-06-15"), onChange);

		emit(result, moment("2030-01-01"), VALID);
		finish(result);
		rerender({ value: moment("2030-01-01") });
		settle(result);

		expect(shown(result)).toBe("2030-01-01");
	});

	it("passes an uncontrolled picker's value through untouched", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(undefined, onChange);

		// handing an uncontrolled field a value would turn it controlled mid-entry
		expect(result.current.value).toBeUndefined();
		emit(result, moment("0020-08-12"), INVALID);
		expect(result.current.value).toBeUndefined();
		expect(onChange).not.toHaveBeenCalled();
	});

	it("reports everything when publishIntermediateValues is set", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2024-06-15"), onChange, true);

		emit(result, moment("0020-06-15"), INVALID);

		expect(onChange).toHaveBeenCalledTimes(1);
		// and the consumer's value is rendered as-is, with no draft in between
		expect(shown(result)).toBe("2024-06-15");
	});

	it("[ISSUE-3474-ITEM-1] settles on an invalid value instead of looping", () => {
		const invalid = moment.invalid();
		let rendered: { current: Draft } | undefined;
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			rendered = renderDraft(invalid, vi.fn()).result;
		} finally {
			consoleError.mockRestore();
		}

		expect(rendered?.current.value).toBe(invalid);
	});

	it("[ISSUE-3474-ITEM-1] keeps one invalid value, and still follows the consumer to null or a date", () => {
		const first = moment.invalid();
		const { result, rerender } = renderDraft(first, vi.fn());

		// `moment(record.due_date)` in render: a fresh invalid instance each time.
		// The field compares by reference, so a new object would rebuild its sections.
		rerender({ value: moment.invalid() });
		expect(result.current.value).toBe(first);

		// an invalid date is not an empty value
		rerender({ value: null });
		expect(result.current.value).toBeNull();
		rerender({ value: moment.invalid() });
		expect((result.current.value as Moment).isValid()).toBe(false);

		rerender({ value: moment("2024-06-15") });
		expect(shown(result)).toBe("2024-06-15");
	});

	it("[ISSUE-3474-ITEM-8] hands the field the consumer's new representation of the same instant", () => {
		const { result, rerender } = renderDraft(
			moment("2026-08-01T10:00:00Z"),
			vi.fn(),
		);

		// e.g. a "show in UTC" switch: same instant, different display timezone
		rerender({ value: moment.utc("2026-08-01T10:00:00Z") });

		expect((result.current.value as Moment).isUTC()).toBe(true);
	});

	it("[ISSUE-3474-ITEM-8] hands the field local time again when the consumer switches back from UTC", () => {
		const { result, rerender } = renderDraft(
			moment.utc("2026-08-01T10:00:00Z"),
			vi.fn(),
		);

		rerender({ value: moment("2026-08-01T10:00:00Z") });

		expect((result.current.value as Moment).isUTC()).toBe(false);
	});

	it("[ISSUE-3474-ITEM-8] keeps the held object for a fresh value in the new representation", () => {
		const { result, rerender } = renderDraft(
			moment("2026-08-01T10:00:00Z"),
			vi.fn(),
		);
		const utc = moment.utc("2026-08-01T10:00:00Z");
		rerender({ value: utc });

		// `moment.utc(...)` in render: a fresh instance in the same timezone each
		// time. The field compares by reference, so a new object would rebuild its
		// sections.
		rerender({ value: moment.utc("2026-08-01T10:00:00Z") });

		expect(result.current.value).toBe(utc);
	});

	it("[ISSUE-3474-ITEM-8] drops a rejected draft when the consumer's value changes representation", () => {
		const { result, rerender } = renderDraft(
			moment("2026-08-01T10:00:00Z"),
			vi.fn(),
		);

		emit(result, moment("0020-08-01T10:00:00Z"), INVALID);
		rerender({ value: moment.utc("2026-08-01T10:00:00Z") });

		expect({
			utc: (result.current.value as Moment).isUTC(),
			shown: shown(result),
		}).toEqual({ utc: true, shown: "2026-08-01" });
	});

	it("[ISSUE-3474-ITEM-12] holds back the accepted dates and reports the last one when the user is done", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2026-08-05"), onChange);

		// retyping the day: an empty section, then 1, then 12
		emit(result, null, FROM_FIELD);
		emit(result, moment("2026-08-01"), FROM_FIELD);
		emit(result, moment("2026-08-12"), FROM_FIELD);
		const whileTyping = reportedDays(onChange);
		const shownWhileTyping = shown(result);
		finish(result);
		// a controlled consumer stores it and hands it back
		rerender({ value: moment("2026-08-12") });
		// done twice, as Enter and then leaving the field are
		finish(result);

		expect({
			whileTyping,
			shownWhileTyping,
			inAll: reportedDays(onChange),
			shown: shown(result),
		}).toEqual({
			whileTyping: [],
			shownWhileTyping: "2026-08-12",
			inAll: ["2026-08-12"],
			shown: "2026-08-12",
		});
	});

	it("[ISSUE-3474-ITEM-12] reports nothing when the user is done with the date the consumer holds", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2026-08-05"), onChange);

		emit(result, moment("2026-08-06"), FROM_FIELD);
		emit(result, moment("2026-08-05"), FROM_FIELD);
		finish(result);

		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3474-ITEM-12] reports neither a rejected date nor the accepted one before it", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2026-08-05"), onChange);

		emit(result, moment("2026-08-06"), FROM_FIELD);
		emit(result, moment("0020-08-06"), INVALID);
		finish(result);

		expect({ shown: shown(result), reported: reportedDays(onChange) }).toEqual({
			shown: "0020-08-06",
			reported: [],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports a date the calendar accepted at once, and leaves the field's to finish", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2026-08-05"), onChange);

		// MUI calls onAccept for every change of the field too
		emit(result, moment("2026-08-06"), FROM_FIELD);
		accept(result, moment("2026-08-06"), FROM_FIELD);
		const fromField = reportedDays(onChange);
		emit(result, moment("2026-08-20"), FROM_VIEW);
		accept(result, moment("2026-08-20"), FROM_VIEW);
		finish(result);

		expect({ fromField, inAll: reportedDays(onChange) }).toEqual({
			fromField: [],
			inAll: ["2026-08-20"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports no date the calendar hands over with a validation error", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2026-08-05"), onChange);

		accept(result, moment("2026-08-20"), {
			validationError: "maxDate",
			source: "view",
		});

		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3474-ITEM-12] opens the calendar on the date held back", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2026-08-05"), onChange);

		emit(result, moment("2026-08-12"), FROM_FIELD);
		settle(result);
		const shownOnOpen = shown(result);
		finish(result);

		expect({ shownOnOpen, reported: reportedDays(onChange) }).toEqual({
			shownOnOpen: "2026-08-12",
			reported: ["2026-08-12"],
		});
	});

	it("[ISSUE-3474-ITEM-12] drops the date held back when the consumer's value moves on", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2026-08-05"), onChange);

		emit(result, moment("2026-08-12"), FROM_FIELD);
		// e.g. the filter's reset button
		rerender({ value: null });
		finish(result);

		expect({ shown: shown(result), reported: reportedDays(onChange) }).toEqual({
			shown: null,
			reported: [],
		});
	});

	it("[ISSUE-3474-ITEM-12] drops the draft and the date held back on clear, null counting as reported", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(null, onChange);

		emit(result, moment("2026-08-12"), FROM_FIELD);
		act(() => {
			result.current.clear();
		});
		const shownAfterClear = shown(result);
		finish(result);

		expect({ shownAfterClear, reported: reportedDays(onChange) }).toEqual({
			shownAfterClear: null,
			reported: [],
		});
	});

	it("[ISSUE-3474-ITEM-12] shows the consumer's value again after clear when the consumer keeps it", () => {
		const { result, rerender } = renderDraft(moment("2026-08-05"), vi.fn());

		act(() => {
			result.current.clear();
		});
		// the caller reported null, and the consumer kept its date
		rerender({ value: moment("2026-08-05") });

		expect(shown(result)).toBe("2026-08-05");
	});

	it("[ISSUE-3474-ITEM-12] reports an uncontrolled picker's date once the user is done, and nothing for its default", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(
			undefined,
			onChange,
			false,
			moment("2026-08-05"),
		);

		emit(result, moment("2026-08-06"), FROM_FIELD);
		emit(result, moment("2026-08-05"), FROM_FIELD);
		finish(result);
		const backToDefault = reportedDays(onChange);
		emit(result, moment("2026-08-06"), FROM_FIELD);
		const whileTyping = reportedDays(onChange);
		finish(result);

		expect({
			backToDefault,
			whileTyping,
			inAll: reportedDays(onChange),
		}).toEqual({
			backToDefault: [],
			whileTyping: [],
			inAll: ["2026-08-06"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports every change once and holds nothing back when publishIntermediateValues is set", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(moment("2026-08-05"), onChange, true);

		emit(result, moment("2026-08-01"), FROM_FIELD);
		emit(result, moment("2026-08-20"), FROM_VIEW);
		accept(result, moment("2026-08-20"), FROM_VIEW);
		finish(result);

		expect(reportedDays(onChange)).toEqual(["2026-08-01", "2026-08-20"]);
	});
});
