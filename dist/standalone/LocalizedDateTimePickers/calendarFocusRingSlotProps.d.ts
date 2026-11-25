import { SxProps, Theme } from "@mui/material";
/** The part of a picker's slot props this helper reads and extends */
interface LayoutSlotProps {
    layout?: {
        sx?: SxProps<Theme>;
    };
}
/**
 * Shows the keyboard focus in a picker's open calendar, the desktop popup and
 * the mobile dialog alike, by a focus ring (see {@link calendarFocusRing}).
 *
 * The ring goes into the styles of the picker's layout (`slotProps.layout`),
 * the element both of them render the calendar, the time options, the toolbar
 * and the action bar in. The layout itself differs per picker and variant
 * (the desktop date and time picker has one of its own), so it is styled
 * rather than replaced. The caller's layout slot props are kept, and so is its
 * `sx`, which comes after the ring and wins over it.
 * @param slotProps The picker's slot props, as the caller gave them
 * @returns The `layout` slot props with the ring, to spread into the picker's
 * slot props
 */
declare const calendarFocusRingSlotProps: (slotProps: LayoutSlotProps | undefined) => LayoutSlotProps;
export default calendarFocusRingSlotProps;
