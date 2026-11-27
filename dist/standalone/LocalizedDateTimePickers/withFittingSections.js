import { getPickersInputBaseUtilityClass, pickersInputBaseClasses, } from "@mui/x-date-pickers";
import prependSx from "../../utils/internal/prependSx";
/**
 * The class of a picker field's input root while the field fills its
 * container (`fullWidth`). MUI sets it, but leaves it out of
 * `pickersInputBaseClasses`.
 */
const FULL_WIDTH_CLASS = getPickersInputBaseUtilityClass("fullWidth");
/**
 * A field at its own width is at least as wide as its sections: MUI's 182px,
 * or the sections' width where they need more.
 */
const fittingSections = {
    [`&:not(.${FULL_WIDTH_CLASS}) > .${pickersInputBaseClasses.sectionsContainer}`]: { minWidth: "max-content" },
};
/**
 * Keeps every section of a picker field at its own width in view.
 *
 * MUI gives the sections of a field without `fullWidth` a fixed 182px, the
 * width of a text field's input, and cuts off what does not fit. A date and
 * time with the user's text spacing (WCAG 1.4.12: letter spacing 0.12em, word
 * spacing 0.16em) needs about 200px, so the AM/PM disappeared behind the
 * calendar button; so did the end of a long `format` or of a time with
 * seconds. This lets the sections grow past the 182px, and the field with
 * them; sections that fit keep MUI's 182px. A `fullWidth` field keeps the
 * width of its container, as in MUI.
 *
 * The sections never shrink below the width they need, so a field without
 * `fullWidth` that is given less room (an `sx` width, a narrow container)
 * shows its whole date with the calendar button past its edge; with
 * `fullWidth` the end of the date is cut off instead.
 *
 * The rule goes into the `sx` of the field's input root
 * (`slotProps.input.sx`), in front of an `sx` the caller set there, so the
 * caller's comes after it and wins.
 * @param textFieldProps The props for MUI's `textField` slot
 * @returns The same props, with the rule in the input root's `sx`
 */
const withFittingSections = (textFieldProps) => {
    const slotProps = textFieldProps.slotProps ?? {};
    const input = slotProps.input ?? {};
    return {
        ...textFieldProps,
        slotProps: {
            ...slotProps,
            input: { ...input, sx: prependSx(fittingSections, input.sx) },
        },
    };
};
export default withFittingSections;
