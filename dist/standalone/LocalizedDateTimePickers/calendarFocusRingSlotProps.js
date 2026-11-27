import { buttonBaseClasses, menuItemClasses, tabClasses, } from "@mui/material";
import { monthCalendarClasses, pickerDayClasses, pickersCalendarHeaderClasses, yearCalendarClasses, } from "@mui/x-date-pickers";
import focusRing from "../../utils/internal/focusRing";
import prependSx from "../../utils/internal/prependSx";
/**
 * The keyboard focus ring of every control in a picker's calendar: a 2px
 * outline in `palette.primary.main`, as MUI draws it when the theme sets
 * `focusVisible`, which forced colors keep. MUI marks a focused control only
 * by a faint tint (a day, a time option, a year) or a pulsing ripple (the
 * header's and the action bar's buttons), about 1.2:1 to 1.6:1 against the
 * calendar, and a selected day or time option by a darker shade of its fill.
 *
 * - Buttons (the header's month arrows, the year and month buttons, the
 *   toolbar's and the action bar's buttons) are ringed 2px outside their
 *   edge, as MUI rings them, so the ring stands clear of a selected year's
 *   fill.
 * - The days, the time options and the header's view switch sit in a
 *   container that clips what lies outside them (the month, a scrolling
 *   column, the header's label): theirs runs along their edge, as MUI insets
 *   its ring on a menu item. A selected day or time option is filled in the
 *   ring's colour, so its ring is drawn in its text colour, 2px inside the
 *   edge.
 * - The tabs of the mobile date and time dialog are ringed 6px inside, clear
 *   of the tab indicator, as in `RoutedTabs`.
 *
 * When the theme sets `focusVisible`, MUI's ring is the one shown, as on
 * every other MUI control, and this adds nothing.
 * @param theme The theme
 * @returns The ring's styles, for the picker layout's `sx`
 */
const calendarFocusRing = (theme) => theme.focusVisible
    ? {}
    : {
        [`& .${buttonBaseClasses.focusVisible}, & .${yearCalendarClasses.button}:focus-visible, & .${monthCalendarClasses.button}:focus-visible`]: focusRing(theme, 2),
        [`& .${pickerDayClasses.root}.${buttonBaseClasses.focusVisible}, & .${menuItemClasses.root}.${menuItemClasses.focusVisible}, & .${pickersCalendarHeaderClasses.switchViewButton}.${buttonBaseClasses.focusVisible}`]: {
            ...focusRing(theme, -2),
            [`&.${pickerDayClasses.selected}, &.${menuItemClasses.selected}`]: {
                outlineColor: theme.palette.primary.contrastText,
                outlineOffset: -4,
            },
        },
        [`& .${tabClasses.root}.${buttonBaseClasses.focusVisible}`]: focusRing(theme, -6),
    };
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
const calendarFocusRingSlotProps = (slotProps) => {
    return {
        layout: {
            ...slotProps?.layout,
            sx: prependSx(calendarFocusRing, slotProps?.layout?.sx),
        },
    };
};
export default calendarFocusRingSlotProps;
