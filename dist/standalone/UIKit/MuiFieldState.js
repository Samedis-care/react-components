import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { FormControl, FormHelperText, FormLabel, styled, TextField, } from "@mui/material";
import readableTextColor from "../../utils/internal/readableTextColor";
import useCCTranslations from "../../utils/useCCTranslations";
/**
 * The dot itself, shared by the pseudo element and the element version
 */
const dirtyMarkerBase = (theme) => ({
    display: "inline-block",
    width: 6,
    height: 6,
    marginLeft: 4,
    borderRadius: "50%",
    verticalAlign: "middle",
    backgroundColor: theme.palette.info.main,
});
/**
 * The marker for a field whose value differs from the server-side value: a small dot
 * after the label.
 *
 * @remarks The other obvious markers are taken. An asterisk means required, and tinting
 * the input reads as a state it isn't — yellow is a warning, red an error, blue the
 * focus ring. A dot sits beside the label instead of colouring the control, so it stacks
 * with all three.
 *
 * Restyle or remove it for the whole application through the `CcFieldState` theme slot,
 * which every control wrapped in {@link withMuiFieldState} shares:
 *
 * ```ts
 * CcFieldState: { styleOverrides: { root: { "& > .MuiFormLabel-root::after": { display: "none" } } } }
 * ```
 *
 * That leaves {@link DirtyMarkerText} in the label, so the field's name still says it is
 * modified; it has a theme slot of its own.
 */
export const dirtyMarkerStyles = (theme) => ({
    content: '""',
    ...dirtyMarkerBase(theme),
});
const DirtyMarkerRoot = styled("span", {
    name: "CcDirtyMarker",
    slot: "root",
})(({ theme }) => dirtyMarkerBase(theme));
const DirtyMarkerTextRoot = styled("span", {
    name: "CcDirtyMarker",
    slot: "text",
})({
    // visually hidden, as MUI's visuallyHidden. It follows the label's text, and the
    // -1px margin keeps its 1px box within that text, so it neither widens the label
    // (nor the gap in an outlined field's border, which holds a copy of the label) nor
    // moves the dot. Inline-block keeps that place: a box declared as a block would be
    // placed at the start of the next line instead, and its -1px margin past the
    // label's start edge. Browsers treat the absolutely positioned box as a block and
    // put a space between it and the label's text in the field's name; inline-block
    // does the same in name computations that don't, such as jsdom's.
    border: 0,
    clipPath: "inset(50%)",
    display: "inline-block",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
});
/**
 * What the dot says, for assistive technology: a visually hidden "(modified)" in the
 * user's language. Inside a label it becomes part of the name of the field the label
 * names ("Due (modified)"), so a screen reader user hears which fields are modified.
 *
 * @remarks {@link withMuiFieldState} and {@link labelWithDirtyMarker} add it; render it
 * yourself only in a label that gets the dot from somewhere else. Restyle or remove it
 * for the whole application through the `text` slot of the `CcDirtyMarker` theme
 * component (`display: "none"` removes it from the field's name too).
 */
const DirtyMarkerTextInner = () => {
    const { t } = useCCTranslations();
    return (_jsx(DirtyMarkerTextRoot, { children: t("standalone.uikit.field-state.dirty") }));
};
export const DirtyMarkerText = React.memo(DirtyMarkerTextInner);
/**
 * The same marker as an element rather than a pseudo element, for controls that build
 * their own label instead of rendering a MUI FormLabel: the dot, hidden from assistive
 * technology, and {@link DirtyMarkerText}, which says what the dot means (unless `text`
 * is false)
 * @param props The props
 */
const DirtyMarkerInner = (props) => (_jsxs(_Fragment, { children: [_jsx(DirtyMarkerRoot, { "aria-hidden": "true", className: props.className }), props.text !== false && _jsx(DirtyMarkerText, {})] }));
export const DirtyMarker = React.memo(DirtyMarkerInner);
/**
 * Appends {@link DirtyMarker} to a label when the field is modified
 * @param label The label to mark
 * @param dirty Is the field modified?
 * @returns The label followed by the dot and {@link DirtyMarkerText} where `dirty` is
 *          set, else the label as it is
 */
export const labelWithDirtyMarker = (label, dirty) => dirty ? (_jsxs(_Fragment, { children: [label, _jsx(DirtyMarker, {})] })) : (label);
/**
 * Appends {@link DirtyMarkerText} to a label when the field is modified, for a label
 * whose dot {@link withMuiFieldState} draws: a legend or `FormControlLabel` rendered as
 * a child of {@link FormControlFieldsetCC} or {@link FormControlCC}, which the wrapper
 * cannot hand the text to
 * @param label The label to mark
 * @param dirty Is the field modified?
 * @returns The label followed by the text where `dirty` is set, else the label as it is
 */
export const labelWithDirtyText = (label, dirty) => dirty ? (_jsxs(_Fragment, { children: [label, _jsx(DirtyMarkerText, {})] })) : (label);
/**
 * The colour of a warning's text: `palette.warning.main` as far as it reaches the
 * 4.5:1 that text needs (MUI's default orange has 3.11:1 on white). Outlines and
 * underlines need only 3:1 and keep `palette.warning.main`.
 * @param theme The theme
 * @returns The colour for the label and helper text of a field with a warning
 */
const warningTextColor = (theme) => readableTextColor(theme, theme.palette.warning.main);
/**
 * How much horizontal room {@link dirtyMarkerStyles} takes up (dot plus its margin)
 */
const DIRTY_MARKER_WIDTH = 10;
/**
 * Adds this library's field states — {@link MuiFieldStateProps} — to a MUI form component
 *
 * @param Component The component to wrap
 * @param labelProp The prop that holds the label the component renders, which gets
 * {@link DirtyMarkerText} while the field is dirty: `"label"` (the default) for a text
 * field or a date picker, `"children"` for a label component. A component that gets no
 * label through it, such as a `FormControl` around a legend, is left as it is; its label
 * goes through {@link labelWithDirtyText} where it is rendered.
 * @remarks MUI covers error, required and disabled; warning and dirty are ours, and both
 * are presentational, so they are applied here rather than in every control. The wrapper
 * swallows both props so neither reaches the DOM, and forwards everything else including
 * the ref, which the date pickers use to anchor their popup.
 *
 * Every wrapped component shares the `CcFieldState` theme slot, which is the one place to
 * restyle or remove either state for a whole application.
 */
export const withMuiFieldState = (Component, labelProp = "label") => {
    // the wrapped component is the one with an element to hand out, and callers need it:
    // the date pickers anchor their popup on this ref. Cast back to a plain component
    // type, as forwardRef's PropsWithoutRef<T> cannot be resolved for a generic T.
    const FieldState = React.forwardRef(function FieldStateInner(props, ref) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { warning, dirty, ...other } = props;
        const label = other[labelProp];
        return (_jsx(Component, { ...{
                ...other,
                ref,
                // only stamp the attribute where a dirty state actually exists, so
                // components used outside a form don't all grow a data-cc-dirty="false"
                ...(dirty === undefined ? {} : { "data-cc-dirty": dirty }),
                // only where there is a label: MUI renders none for an empty one, and
                // the text alone would give the field a label it doesn't have
                ...(dirty && label != null && label !== ""
                    ? { [labelProp]: labelWithDirtyText(label, dirty) }
                    : {}),
            } }));
    });
    return styled(FieldState, { name: "CcFieldState", slot: "root" })(({ theme, warning, dirty }) => ({
        ...(dirty && {
            // the label of a text field, and the legend of a fieldset based control
            "& > .MuiFormLabel-root::after": dirtyMarkerStyles(theme),
            // where the wrapped component is the label itself
            "&.MuiFormLabel-root::after": dirtyMarkerStyles(theme),
            // checkboxes and switches label the control, not the FormControl around it
            "& > .MuiFormControlLabel-root > .MuiFormControlLabel-label::after": dirtyMarkerStyles(theme),
            // a text field's label stays on one line and MUI cuts a label too long for
            // the field with an ellipsis, which would cut the dot off with it. The dot
            // goes into room kept free at the end of the label instead, so the ellipsis
            // comes before it; border-box keeps that room inside MUI's max-width. The
            // label is positioned and as wide as its text (up to that maximum), so a
            // label that fits shows the dot right after the text.
            "& > .MuiInputLabel-formControl": {
                boxSizing: "border-box",
                paddingInlineEnd: DIRTY_MARKER_WIDTH,
                "&::after": {
                    position: "absolute",
                    insetInlineEnd: 0,
                    // centred on the line, where vertical-align: middle put it
                    top: "50%",
                    marginTop: -3,
                    marginLeft: 0,
                },
            },
            // the notched outline holds its own copy of the label, which is what sizes
            // the gap in the border — widen it or the dot sits on top of the outline.
            // Only the copy which actually holds a label: MUI renders the legend either
            // way, and the empty one — a control whose label sits outside the input, as
            // every selector's does — would become a gap in the border with nothing in
            // it. Margin rather than padding, to leave MUI's own side padding alone.
            // The pickers draw their own outlined input and legend, which hold the same
            // copy with the same 5px side padding, so the same margin leaves the same gap.
            "& > .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend > span:not(.notranslate), & > .MuiPickersOutlinedInput-root .MuiPickersOutlinedInput-notchedOutline legend > span:not(.notranslate)": {
                marginInlineEnd: DIRTY_MARKER_WIDTH,
            },
        }),
        ...(warning && {
            "& > .MuiFormLabel-root": {
                color: warningTextColor(theme),
            },
            "&.MuiFormLabel-root": {
                color: warningTextColor(theme),
            },
            "& > .MuiFormLabel-root.Mui-error": {
                color: theme.palette.error.main,
            },
            "&.MuiFormLabel-root.Mui-error": {
                color: theme.palette.error.main,
            },
            // standard and filled inputs are drawn as MUI draws an error: the idle 1px
            // underline and the 2px focus underline take the colour, the latter still
            // only while focused, so focus stays visible. With an error MUI's own
            // error styles apply. The date pickers draw their own standard and filled
            // inputs, which share `MuiPickersInputBase-root`; x-date-pickers leaves the
            // standard one without its `MuiPickersInput-underline` class, so the base
            // class is what both are selected by.
            "& > .MuiInput-underline:not(.Mui-error), & > .MuiFilledInput-underline:not(.Mui-error), & > .MuiPickersInputBase-root:not(.MuiPickersOutlinedInput-root, .Mui-error)": {
                "&::before, &::after": {
                    borderBottomColor: theme.palette.warning.main,
                },
            },
            // and hovering keeps the idle underline, as it does on an error. MUI's own
            // hover rule, which exempts errors only, would draw it in the text colour.
            "& > .MuiInput-underline:hover:not(.Mui-disabled, .Mui-error)::before, & > .MuiFilledInput-underline:hover:not(.Mui-disabled, .Mui-error)::before, & > .MuiPickersInputBase-root:not(.MuiPickersOutlinedInput-root):hover:not(.Mui-disabled, .Mui-error)::before": {
                borderBottom: `1px solid ${theme.palette.warning.main}`,
            },
            "& > .MuiFormHelperText-root": {
                color: warningTextColor(theme),
            },
            "&.MuiFormHelperText-root": {
                color: warningTextColor(theme),
            },
            "& > .MuiFormHelperText-root.Mui-error": {
                color: theme.palette.error.main,
            },
            "&.MuiFormHelperText-root.Mui-error": {
                color: theme.palette.error.main,
            },
            // Outranks the input's own focus and hover rules, as MUI's error rule
            // outranks its colour variants. Without that, the warning rule and MUI's
            // focus rule would weigh the same, and the one emotion inserted last would
            // win — x-date-pickers' focus rule weighs more already, so a focused picker
            // would go back to the primary outline. `:not(.Mui-error)` leaves error
            // red, which the rule below draws.
            "& > .MuiInputBase-root.MuiOutlinedInput-root:not(.Mui-error) .MuiOutlinedInput-notchedOutline, & > .MuiPickersInputBase-root.MuiPickersOutlinedInput-root:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline": {
                borderColor: theme.palette.warning.main,
            },
            "& > .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline, & > .MuiPickersOutlinedInput-root.Mui-error .MuiPickersOutlinedInput-notchedOutline": {
                borderColor: theme.palette.error.main,
            },
        }),
    }));
};
export const FormControlCC = withMuiFieldState(FormControl);
export const FormControlFieldsetCC = withMuiFieldState(FormControl);
export const FormLabelCC = withMuiFieldState(FormLabel, "children");
export const FormHelperTextCC = withMuiFieldState(FormHelperText);
export const TextFieldCC = withMuiFieldState(TextField);
