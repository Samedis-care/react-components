import React, { useCallback, useState } from "react";
import { usePickerAdapter } from "@mui/x-date-pickers";
import type {
	PickerChangeHandlerContext,
	PickerValidDate,
} from "@mui/x-date-pickers";

/**
 * What the field shows, and the value the consumer last accepted.
 *
 * Both are kept in one state object so a single render-phase comparison can tell
 * whether the consumer's value moved on behind our back — a reset button, a form
 * reload — and the draft has to give way.
 */
interface PickerDraftState {
	draft: PickerValidDate | null;
	committed: PickerValidDate | null | undefined;
}

export type PickerDraftChangeHandler<TError> = (
	value: PickerValidDate | null,
	context: PickerChangeHandlerContext<TError>,
) => void;

export interface PickerDraftResult<TError> {
	/** The value to render the field from */
	value: PickerValidDate | null | undefined;
	/** The change handler to hand to the picker */
	onChange: PickerDraftChangeHandler<TError>;
	/**
	 * To be called from the text field's `onBlur`, alongside whatever the consumer
	 * passed. Settles the draft once focus really leaves the field, and ignores
	 * focus moves within it.
	 */
	settleOnBlur: (event: React.FocusEvent<Element>) => void;
	/**
	 * Drops an unaccepted draft. To be called from the picker's `onOpen`: the
	 * calendar renders from the value it is given, so a half-typed date would open
	 * it on a year nothing is selectable in.
	 */
	settle: () => void;
}

/**
 * Makes a controlled picker typable, by keeping what is being typed apart from
 * what gets reported upstream.
 *
 * The picker fields publish a value on **every** keystroke once all sections
 * hold something, so typing a year walks through `0002 → 0020 → 0202 → 2026`.
 * Each of those is a real date, which leaves a controlled consumer with no good
 * option: accepting them all commits — and in a filter refetches — three dates
 * the user never meant, while refusing them leaves `value` on the old date, which
 * makes the field re-sync its sections from it and swallow the keystroke, so the
 * year can never grow past its first digit.
 *
 * This hook takes the third option. The field renders from a local draft, so it
 * follows every keystroke and never reverts, while `onChange` only fires for a
 * value that passes the picker's own validation — and a half-typed year fails it,
 * the picker's default `minDate` being 1900-01-01. Clearing the field still
 * reports `null` immediately, an empty value being valid.
 *
 * What it cannot separate is an intermediate that is a plausible date in its own
 * right: retyping the day of a stored date reports the day passed through on the
 * way, because nothing distinguishes it from that day being meant.
 *
 * The draft doubles as the stable object the field wants: consumers derive
 * `value` with `moment(...)` during render and so hand us a fresh instance every
 * time, while the field compares its external value **by reference**. Holding the
 * draft keeps those section rebuilds from firing mid-entry.
 * @param value The value held by the consumer
 * @param onChange The consumer's change handler
 * @param publishIntermediateValues Escape hatch: report every keystroke instead,
 * i.e. the raw picker behaviour
 * @returns The value and handlers to hand to the picker
 */
const usePickerDraft = <TError>(
	value: PickerValidDate | null | undefined,
	onChange: PickerDraftChangeHandler<TError> | undefined,
	publishIntermediateValues?: boolean,
): PickerDraftResult<TError> => {
	const adapter = usePickerAdapter();
	// An uncontrolled picker renders from the field's own state, which nothing
	// reverts, so it needs no draft to render from — and handing it one would turn
	// it controlled mid-entry. Its `onChange` is still gated: a consumer listening
	// to an uncontrolled picker wants the same "a date the user entered" contract.
	const isControlled = value !== undefined;
	const holdsDraft = isControlled && !publishIntermediateValues;
	const [state, setState] = useState<PickerDraftState>({
		draft: value ?? null,
		committed: value,
	});

	// The consumer's value now means a different moment in time than the one the
	// draft was typed over, so the draft is stale. Comparing by value rather than
	// by reference is what tolerates the `moment(...)`-in-render idiom; deriving
	// during render rather than in an effect keeps the stale draft from being
	// painted once first.
	if (holdsDraft && !adapter.isEqual(state.committed ?? null, value ?? null)) {
		setState({ draft: value ?? null, committed: value });
	}

	const handleChange = useCallback(
		(
			newValue: PickerValidDate | null,
			context: PickerChangeHandlerContext<TError>,
		) => {
			if (publishIntermediateValues) {
				onChange?.(newValue, context);
				return;
			}
			// the field follows what was typed either way, so no keystroke is lost
			setState((prev) => ({ ...prev, draft: newValue }));
			if (context.validationError) {
				return;
			}
			setState((prev) => ({ ...prev, committed: newValue }));
			onChange?.(newValue, context);
		},
		[onChange, publishIntermediateValues],
	);

	// A draft the consumer never accepted would otherwise be left standing as a
	// red half-date while the consumer holds something else entirely.
	const settle = useCallback(() => {
		setState((prev) => ({ ...prev, draft: prev.committed ?? null }));
	}, []);

	const settleOnBlur = useCallback(
		(event: React.FocusEvent<Element>) => {
			// The field forwards this from the container holding the sections, whose
			// parent also holds the adornment buttons — so stepping from one section
			// to the next, or reaching for the calendar, is not a blur.
			const field = event.currentTarget.parentElement ?? event.currentTarget;
			if (event.relatedTarget && field.contains(event.relatedTarget)) {
				return;
			}
			settle();
		},
		[settle],
	);

	return {
		value: holdsDraft ? state.draft : value,
		onChange: handleChange,
		settleOnBlur,
		settle,
	};
};

export default usePickerDraft;
