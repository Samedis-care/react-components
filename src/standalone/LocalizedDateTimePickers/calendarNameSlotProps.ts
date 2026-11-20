/** The part of a picker's slot props this helper reads and extends */
interface CalendarSlotProps {
	popper?: object;
	mobilePaper?: object;
}

/** How {@link calendarNameSlotProps} names a picker's calendar */
export interface CalendarNameOptions {
	/**
	 * The picker's `aria-label`, the name of its field; undefined or empty for
	 * none
	 */
	name: string | undefined;
	/** Whether the picker has a visible `label`, which names the calendar */
	hasLabel: boolean;
	/**
	 * The name for the calendar of a picker with neither a `label` nor a
	 * `name`: MUI's title of the mobile dialog ("Select date"), in the
	 * picker's language
	 */
	fallbackName: string | undefined;
}

/**
 * Names a picker's open calendar for assistive technology, after its field.
 *
 * MUI labels the calendar (`role="dialog"`) by the picker's `label`, and the
 * mobile dialog by its title while the toolbar shows it. A picker without a
 * label opens an unnamed desktop popup. This names the popup
 * (`slotProps.popper`) and the mobile dialog (`slotProps.mobilePaper`) after
 * the field: its `name` (the picker's `aria-label`, see `withFieldName`), or,
 * for a picker with neither a label nor a name, `fallbackName`, so the
 * calendar is never an unnamed dialog. The label and the mobile dialog's
 * title still name the calendar where MUI uses them: its `aria-labelledby`
 * wins. An `aria-label` the caller set in one of these slot props is kept.
 * @param slotProps The picker's slot props, as the caller gave them
 * @param options The field's name, and what to fall back to
 * @returns The `popper` and `mobilePaper` slot props with the name, to spread
 * into the picker's slot props; none for a labelled picker without a name
 */
const calendarNameSlotProps = (
	slotProps: CalendarSlotProps | undefined,
	options: CalendarNameOptions,
): CalendarSlotProps => {
	const { name, hasLabel, fallbackName } = options;
	const calendarName = name || (hasLabel ? undefined : fallbackName);
	if (!calendarName) return {};
	return {
		// MUI merges the popper's slot props into an object of its own, which
		// drops a function given there, so they are handed on as an object
		popper: { "aria-label": calendarName, ...slotProps?.popper },
		mobilePaper: { "aria-label": calendarName, ...slotProps?.mobilePaper },
	};
};

export default calendarNameSlotProps;
