import React from "react";
import {
	CSSObject,
	FormControl,
	FormControlProps,
	FormHelperText,
	FormHelperTextProps,
	FormLabel,
	FormLabelProps,
	styled,
	TextField,
	TextFieldProps,
	Theme,
} from "@mui/material";

/**
 * What a component must accept to be wrapped by {@link withMuiFieldState}
 */
export interface MuiFieldStateSourceProps {
	className?: string;
}

/**
 * The field states this library adds on top of MUI's own error/required/disabled
 */
export interface MuiFieldStateProps {
	/**
	 * Is there a warning on the field?
	 * @remarks A step below error: colours the label, underline and outline in
	 *          `palette.warning.main`, and yields to `error` where both are set.
	 */
	warning?: boolean;
	/**
	 * Does the value differ from the server-side value?
	 * @remarks Draws {@link dirtyMarkerStyles} after the control's label, and exposes a
	 *          `data-cc-dirty` attribute for anything the marker doesn't reach.
	 */
	dirty?: boolean;
}

/**
 * The dot itself, shared by the pseudo element and the element version
 */
const dirtyMarkerBase = (theme: Theme): CSSObject => ({
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
 */
export const dirtyMarkerStyles = (theme: Theme): CSSObject => ({
	content: '""',
	...dirtyMarkerBase(theme),
});

const DirtyMarkerRoot = styled("span", {
	name: "CcDirtyMarker",
	slot: "root",
})(({ theme }) => dirtyMarkerBase(theme));

export type DirtyMarkerClassKey = "root";

/**
 * The same marker as an element rather than a pseudo element, for controls that build
 * their own label instead of rendering a MUI FormLabel
 */
const DirtyMarkerInner = () => <DirtyMarkerRoot aria-hidden={"true"} />;
export const DirtyMarker = React.memo(DirtyMarkerInner);

/**
 * Appends {@link DirtyMarker} to a label when the field is modified
 * @param label The label to mark
 * @param dirty Is the field modified?
 */
export const labelWithDirtyMarker = (
	label: React.ReactNode,
	dirty?: boolean,
): React.ReactNode =>
	dirty ? (
		<>
			{label}
			<DirtyMarker />
		</>
	) : (
		label
	);

/**
 * How much horizontal room {@link dirtyMarkerStyles} takes up (dot plus its margin)
 */
const DIRTY_MARKER_WIDTH = 10;

export type FieldStateClassKey = "root";

/**
 * Adds this library's field states — {@link MuiFieldStateProps} — to a MUI form component
 *
 * @param Component The component to wrap
 * @remarks MUI covers error, required and disabled; warning and dirty are ours, and both
 * are presentational, so they are applied here rather than in every control. The wrapper
 * swallows both props so neither reaches the DOM, and forwards everything else including
 * the ref, which the date pickers use to anchor their popup.
 *
 * Every wrapped component shares the `CcFieldState` theme slot, which is the one place to
 * restyle or remove either state for a whole application.
 */
export const withMuiFieldState = <T extends MuiFieldStateSourceProps>(
	Component: React.ComponentType<T>,
): React.ComponentType<T & MuiFieldStateProps> => {
	// the wrapped component is the one with an element to hand out, and callers need it:
	// the date pickers anchor their popup on this ref. Cast back to a plain component
	// type, as forwardRef's PropsWithoutRef<T> cannot be resolved for a generic T.
	const FieldState = React.forwardRef<unknown, T & MuiFieldStateProps>(
		function FieldStateInner(props, ref) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { warning, dirty, ...other } = props;
			// only stamp the attribute where a dirty state actually exists, so components
			// used outside a form don't all grow a data-cc-dirty="false"
			return (
				<Component
					{...({
						...other,
						ref,
						...(dirty === undefined ? {} : { "data-cc-dirty": dirty }),
					} as unknown as T)}
				/>
			);
		},
	) as unknown as React.ComponentType<T & MuiFieldStateProps>;
	return styled(FieldState, { name: "CcFieldState", slot: "root" })<
		T & MuiFieldStateProps
	>(({ theme, warning, dirty }) => ({
		...(dirty && {
			// the label of a text field, and the legend of a fieldset based control
			"& > .MuiFormLabel-root::after": dirtyMarkerStyles(theme),
			// where the wrapped component is the label itself
			"&.MuiFormLabel-root::after": dirtyMarkerStyles(theme),
			// checkboxes and switches label the control, not the FormControl around it
			"& > .MuiFormControlLabel-root > .MuiFormControlLabel-label::after":
				dirtyMarkerStyles(theme),
			// the notched outline holds its own copy of the label, which is what sizes
			// the gap in the border — widen it or the dot sits on top of the outline.
			// Only the copy which actually holds a label: MUI renders the legend either
			// way, and the empty one — a control whose label sits outside the input, as
			// every selector's does — would become a gap in the border with nothing in
			// it. Margin rather than padding, to leave MUI's own side padding alone.
			"& > .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend > span:not(.notranslate)":
				{
					marginInlineEnd: DIRTY_MARKER_WIDTH,
				},
		}),
		...(warning && {
			"& > .MuiFormLabel-root": {
				color: theme.palette.warning.main,
			},
			"&.MuiFormLabel-root": {
				color: theme.palette.warning.main,
			},
			"& > .MuiFormLabel-root.Mui-error": {
				color: theme.palette.error.main,
			},
			"&.MuiFormLabel-root.Mui-error": {
				color: theme.palette.error.main,
			},
			"& > .MuiInput-underline::after": {
				transform: "scaleX(1)",
				borderBottomColor: theme.palette.warning.main,
			},
			"& > .MuiInput-underline.Mui-error::after": {
				transform: "scaleX(1)",
				borderBottomColor: theme.palette.error.main,
			},
			"& > .MuiFormHelperText-root": {
				color: theme.palette.warning.main,
			},
			"&.MuiFormHelperText-root": {
				color: theme.palette.warning.main,
			},
			"& > .MuiFormHelperText-root.Mui-error": {
				color: theme.palette.error.main,
			},
			"&.MuiFormHelperText-root.Mui-error": {
				color: theme.palette.error.main,
			},
			"& > .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
				borderColor: theme.palette.warning.main,
			},
			"& > .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
				borderColor: theme.palette.error.main,
			},
			"& > .MuiFilledInput-underline::after": {
				transform: "scaleX(1)",
				borderBottomColor: theme.palette.warning.main,
			},
			"& > .MuiFilledInput-underline.Mui-error::after": {
				transform: "scaleX(1)",
				borderBottomColor: theme.palette.error.main,
			},
		}),
	}));
};

export const FormControlCC = withMuiFieldState<FormControlProps>(FormControl);
export const FormControlFieldsetCC =
	withMuiFieldState<FormControlProps<"fieldset", { component: "fieldset" }>>(
		FormControl,
	);
export const FormLabelCC = withMuiFieldState<FormLabelProps>(FormLabel);
export const FormHelperTextCC =
	withMuiFieldState<FormHelperTextProps>(FormHelperText);
export const TextFieldCC = withMuiFieldState<TextFieldProps>(TextField);
