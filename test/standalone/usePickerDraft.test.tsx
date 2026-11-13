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
 * is being typed apart from what gets reported upstream.
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
) =>
	renderHook(
		(props: { value: Moment | null | undefined }) =>
			usePickerDraft(props.value, onChange, publishIntermediateValues),
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

/**
 * Settles the draft, as the pickers do once focus leaves the field (which focus
 * moves count as leaving is `useFieldBlur`'s call, tested through the pickers in
 * `LocalizedDateTimePickersWiring.test.tsx`)
 */
const settle = (result: { current: Draft }) => {
	act(() => {
		result.current.settle();
	});
};

describe("usePickerDraft", () => {
	it("shows a rejected value but does not report it", () => {
		const onChange = vi.fn();
		const { result } = renderDraft(null, onChange);

		emit(result, moment("0020-08-12"), INVALID);

		expect(onChange).not.toHaveBeenCalled();
		expect(shown(result)).toBe("0020-08-12");
	});

	it("reports a value the picker accepts", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(null, onChange);

		// "2", "20", "202" as the year section fills up, then the whole year
		emit(result, moment("0002-08-12"), INVALID);
		emit(result, moment("0020-08-12"), INVALID);
		emit(result, moment("0202-08-12"), INVALID);
		expect(onChange).not.toHaveBeenCalled();

		emit(result, moment("2026-08-12"), VALID);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect((onChange.mock.calls[0][0] as Moment).format("YYYY-MM-DD")).toBe(
			"2026-08-12",
		);
		// a controlled consumer stores it and hands it back
		rerender({ value: moment("2026-08-12") });
		expect(shown(result)).toBe("2026-08-12");
	});

	it("reports a cleared value right away", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2026-08-12"), onChange);

		// an empty value is valid, so the picker reports no error for it
		emit(result, null, VALID);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0]).toBeNull();
		rerender({ value: null });
		expect(shown(result)).toBeNull();
	});

	it("keeps the consumer's value when the consumer ignores a reported change", () => {
		const onChange = vi.fn();
		const { result, rerender } = renderDraft(moment("2024-06-15"), onChange);

		emit(result, moment("2030-01-01"), VALID);
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
});
