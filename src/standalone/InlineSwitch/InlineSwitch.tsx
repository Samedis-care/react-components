import React, { useCallback, useMemo } from "react";
import { styled, Switch, Typography, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import addSlotAttributes from "../../utils/internal/addSlotAttributes";
import { DistributiveOmit } from "../../utils/distributiveOmit";

/**
 * Props of {@link InlineSwitch}. Theme defaults go in
 * `theme.components.CcInlineSwitch.defaultProps`; see
 * {@link InlineSwitchThemeProps} for the props a theme can set.
 *
 * `onChange` is required unless `disabled` is true: a switch without a handler
 * has to be disabled, or it would look and be announced as operable while it
 * ignores every toggle.
 */
export type InlineSwitchProps = {
	/**
	 * Value for switch position. While true, the root has the class
	 * `CcInlineSwitch-checked`.
	 */
	value: boolean;
	/**
	 * Display switch control? While true, the root has the class
	 * `CcInlineSwitch-visible`. Required on each InlineSwitch: a theme cannot set
	 * it (see {@link InlineSwitchThemeProps}).
	 */
	visible: boolean;
	/**
	 * Label for switch control (only used if visible is truthy). It is also the
	 * switch's accessible name; without a label, name the switch with `aria-label`
	 * or `aria-labelledby`. A label too long for the space beside the switch wraps
	 * there, at a space or, inside a word longer than that space, at any character;
	 * its first line is centered beside the switch. It is rendered inside the
	 * switch's `<label>`, so it takes phrasing content only: text and inline
	 * elements such as `<span>` or `<strong>`, no `<div>` or `<p>`.
	 */
	label?: React.ReactNode;
	/**
	 * Accessible name of the switch, replacing the text of `label` as its name. Use it
	 * for a switch without `label`; with a visible label, this text should contain the
	 * label's words (WCAG 2.5.3 Label in Name).
	 * @default none
	 */
	"aria-label"?: string;
	/**
	 * Ids (space separated) of the elements that name the switch, replacing the text
	 * of `label` as its name. It wins over `aria-label`.
	 * @default none
	 */
	"aria-labelledby"?: string;
	/**
	 * Ids (space separated) of the elements that describe the switch, such as its help
	 * text or an error message; they become its accessible description.
	 * @default none
	 */
	"aria-describedby"?: string;
	/**
	 * Content of the container, rendered in a `<div>` whether or not `visible` is
	 * set. Any React node, as on MUI's containers: an element, text, a number,
	 * several children or a fragment; `false`, `null` and `undefined` render
	 * nothing, so a conditional child is written `{show && <List />}`. The switch
	 * and its label float at the top right of the content, so inline content flows
	 * to their left. They are never wider than the container: with a label too long
	 * for the space, they take the container's width and the content starts below
	 * them.
	 * The container is as high as the switch row and the content together, so what
	 * follows it starts below both, also below floated content. A child with a
	 * border or a background of its own starts at the switch's top, so the switch
	 * sits inside its frame; give such a child `clear: "both"` to start it below the
	 * switch row.
	 * @default none
	 */
	children?: React.ReactNode;
	/**
	 * custom styles
	 */
	className?: string;
	/**
	 * Class names per slot: `root` (the outer div, combined with `className`),
	 * `switchWrapper` (the wrapper of switch and label) and `switch` (the
	 * switch's root, MUI's `.MuiSwitch-root`). They are added to the slots' static
	 * classes, see {@link InlineSwitchClassKey}.
	 */
	classes?: Partial<Record<InlineSwitchClassKey, string>>;
	/**
	 * Attributes for the switch's slots, as on MUI's `Switch`. `input` is the
	 * `<input role="switch">`: `id` and `name` give it its form identity, and it takes
	 * any other input attribute. It can override `checked`, `disabled` and `role`; the
	 * `aria-label`, `aria-labelledby` and `aria-describedby` props above win over it,
	 * replacing its own values, and `aria-describedby` is appended to its own.
	 * @default none
	 */
	slotProps?: {
		input?: React.InputHTMLAttributes<HTMLInputElement>;
	};
} & (
	| {
			/**
			 * Called when the user toggles the switch (a click on the switch or its
			 * label, or Space while it has focus), with the new state; not called when
			 * `value` changes. Required unless `disabled` is true.
			 * @param checked The new state of the switch (`!value`)
			 */
			onChange: (checked: boolean) => void;
			/**
			 * Disables the switch: it cannot be focused or toggled, also not through
			 * its label, `onChange` is not called, and switch and label are greyed out.
			 * While true, the root and the switch wrapper have the class
			 * `CcInlineSwitch-disabled`.
			 * @default false
			 */
			disabled?: boolean;
	  }
	| {
			/**
			 * Called when the user toggles the switch, with the new state. Optional while
			 * `disabled` is true, as a disabled switch is not toggled.
			 * @param checked The new state of the switch (`!value`)
			 * @default none
			 */
			onChange?: (checked: boolean) => void;
			/**
			 * Disables the switch: it cannot be focused or toggled, also not through
			 * its label, and switch and label are greyed out. The root and the switch
			 * wrapper have the class `CcInlineSwitch-disabled`. A switch without
			 * `onChange` must be disabled.
			 */
			disabled: true;
	  }
);

/**
 * The InlineSwitch props a theme can set (`components.CcInlineSwitch.defaultProps`,
 * where each is optional): how switches show and what they are called. It leaves out
 * the props of a single switch: its `value` and `onChange`, `visible` (whether this
 * container shows its switch, which each InlineSwitch passes), its `children`, and
 * `aria-labelledby` and `aria-describedby`, the ids of elements next to one switch.
 */
export type InlineSwitchThemeProps = DistributiveOmit<
	InlineSwitchProps,
	| "value"
	| "onChange"
	| "visible"
	| "children"
	| "aria-labelledby"
	| "aria-describedby"
>;

const AntSwitch = styled(Switch, { name: "CcInlineSwitch", slot: "switch" })(
	({ theme }) => ({
		width: 35,
		height: 16,
		padding: 0,
		display: "flex",
		// the track fills the root, so the focus ring around it lies outside the root
		overflow: "visible",
		"& .MuiSwitch-switchBase": {
			padding: 2,
			// the thumb, the only cue of the off state, in the color of MUI's unchecked
			// Checkbox: at least 3:1 against the track. Colors are read through the CSS
			// variables if the theme has them, so they follow a color scheme switch
			color: (theme.vars || theme).palette.text.secondary,
			// MUI widens the input past the thumb and lets the root clip it to the
			// track; the root no longer clips, so the input covers just the track
			"& .MuiSwitch-input": { left: 0, width: 35 },
			"&.Mui-checked": {
				transform: "translateX(18px)",
				// the color for content on primary.main: at least 3:1 against the track
				color: (theme.vars || theme).palette.primary.contrastText,
				"& .MuiSwitch-input": { left: -18 },
				"& + .MuiSwitch-track": {
					opacity: 1,
					backgroundColor: (theme.vars || theme).palette.primary.main,
					borderColor: (theme.vars || theme).palette.primary.main,
				},
				// as faint as the unchecked track while disabled, like MUI's Switch
				"&.Mui-disabled + .MuiSwitch-track": {
					opacity: theme.vars
						? theme.vars.opacity.switchTrackDisabled
						: theme.palette.mode === "light"
							? 0.12
							: 0.2,
				},
			},
			// keyboard focus: with the theme's focusVisible MUI draws its own ring on
			// the track; otherwise this one (MUI's default shows only the focus ripple)
			...(!theme.focusVisible && {
				"&.Mui-focusVisible + .MuiSwitch-track": {
					outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
					outlineOffset: 2,
				},
			}),
		},
		"& .MuiSwitch-thumb": {
			width: 12,
			height: 12,
			boxShadow: "none",
		},
		"& .MuiSwitch-track": {
			// the track's edge: at least 3:1 against the page
			border: `1px solid ${(theme.vars || theme).palette.text.secondary}`,
			borderRadius: 16 / 2,
			opacity: 1,
			backgroundColor: (theme.vars || theme).palette.background.paper,
		},
	}),
);

// static classes of the slots and state classes of the root, see InlineSwitchClassKey
const ROOT_CLASS = "CcInlineSwitch-root";
const SWITCH_WRAPPER_CLASS = "CcInlineSwitch-switchWrapper";
const SWITCH_CLASS = "CcInlineSwitch-switch";
const CHECKED_CLASS = "CcInlineSwitch-checked";
const VISIBLE_CLASS = "CcInlineSwitch-visible";
const DISABLED_CLASS = "CcInlineSwitch-disabled";

// the root holds the floated switch row and floated children, so what follows it
// starts below them instead of flowing beside them. No margin: the surrounding layout
// spaces it
const StyledRoot = styled("div", { name: "CcInlineSwitch", slot: "root" })({
	display: "flow-root",
});

// the height of the switch's row: the switch and the first line of its label are
// centered in it
const ROW_HEIGHT = 30;

const StyledSwitchWrapper = styled(Typography, {
	name: "CcInlineSwitch",
	slot: "switchWrapper",
})(({ theme }) => ({
	float: "right",
	[`&.${DISABLED_CLASS}`]: {
		color: (theme.vars || theme).palette.text.disabled,
	},
})) as typeof Typography;

// the row of switch and label, a flex row that does not wrap. A `<label>` holds
// phrasing content only, so its cells are spans. A label too long for the space
// beside the switch wraps there, at a space or, inside a word longer than that
// space, at any character, so the float is never wider than the root and the switch
// never leaves it. Both start at the row's top. A click anywhere on it toggles the
// switch, so it shows the pointer cursor, as MUI's FormControlLabel does
const StyledLabel = styled("label")(({ theme }) => ({
	display: "flex",
	alignItems: "flex-start",
	gap: theme.spacing(1),
	cursor: "pointer",
	[`.${DISABLED_CLASS} > &`]: {
		cursor: "default",
	},
	// without a label (a switch named by `aria-label`) the row is as high as the switch
	"&:has(> :last-child:empty) > *": {
		height: "auto",
		paddingBlock: 0,
	},
}));

// the switch keeps its width, centered in the row's height
const StyledSwitchCell = styled("span")({
	display: "flex",
	alignItems: "center",
	flexShrink: 0,
	height: ROW_HEIGHT,
});

// the label's lines have the caption's line height; the first one is centered in the
// row's height, beside the switch
const StyledLabelText = styled("span")({
	minWidth: 0,
	overflowWrap: "anywhere",
	paddingBlock: `calc((${ROW_HEIGHT}px - 1lh) / 2)`,
});

/**
 * Keys of the theme's `components.CcInlineSwitch.styleOverrides`, also the
 * keys of the `classes` prop:
 * - `root`: the outer `<div>`
 * - `switchWrapper`: the wrapper of switch and label
 * - `switch`: the switch's root (MUI's `.MuiSwitch-root`)
 *
 * Each slot also has the static class `CcInlineSwitch-<key>`
 * (`CcInlineSwitch-root`, `CcInlineSwitch-switchWrapper`,
 * `CcInlineSwitch-switch`), as MUI's slots have their `Mui<Name>-<slot>`
 * classes, so a stylesheet or the style of a parent can select them, e.g.
 * `styled(InlineSwitch)({ "& .CcInlineSwitch-switchWrapper": { … } })`.
 *
 * No slot receives an `ownerState`, and the theme has no `variants` for
 * InlineSwitch: a function override is called with the theme. The props are
 * state classes on the root instead: `CcInlineSwitch-checked` while `value`
 * is true, `CcInlineSwitch-visible` while `visible` is true and
 * `CcInlineSwitch-disabled` while `disabled` is true (the switch wrapper has
 * that one too). A theme styles a state with a selector in the root's
 * override, e.g. `root: { "&.CcInlineSwitch-checked": { … } }`.
 */
export type InlineSwitchClassKey = "switch" | "root" | "switchWrapper";

const InlineSwitch = (inProps: InlineSwitchProps) => {
	const props = useThemeProps({ props: inProps, name: "CcInlineSwitch" });
	const {
		label,
		value,
		onChange,
		visible,
		disabled,
		children,
		classes,
		className,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		slotProps,
	} = props;

	// name, description and form identity belong to the input, not the switch's root
	// span; the typed aria props win over the caller's input slot props
	const switchSlotProps = useMemo(
		() => ({
			input: addSlotAttributes(slotProps, "input", {
				"aria-label": ariaLabel,
				"aria-labelledby": ariaLabelledBy,
				"aria-describedby": ariaDescribedBy,
			})?.input,
		}),
		[slotProps, ariaLabel, ariaLabelledBy, ariaDescribedBy],
	);

	const handleSwitchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			// a click event dispatched on the disabled input by a script can still reach React
			if (disabled) return;
			if (onChange) onChange(event.target.checked);
		},
		[onChange, disabled],
	);

	return (
		<StyledRoot
			className={combineClassNames([
				ROOT_CLASS,
				className,
				classes?.root,
				value && CHECKED_CLASS,
				visible && VISIBLE_CLASS,
				disabled && DISABLED_CLASS,
			])}
		>
			{visible && (
				<StyledSwitchWrapper
					component="div"
					className={combineClassNames([
						SWITCH_WRAPPER_CLASS,
						classes?.switchWrapper,
						disabled && DISABLED_CLASS,
					])}
					variant={"caption"}
				>
					<StyledLabel>
						<StyledSwitchCell>
							<AntSwitch
								className={combineClassNames([SWITCH_CLASS, classes?.switch])}
								checked={value}
								onChange={handleSwitchChange}
								disabled={disabled}
								// the focus ring shows focus; the ripple would pulse under it endlessly
								disableFocusRipple
								slotProps={switchSlotProps}
							/>
						</StyledSwitchCell>
						<StyledLabelText>{label}</StyledLabelText>
					</StyledLabel>
				</StyledSwitchWrapper>
			)}
			<div>{children}</div>
		</StyledRoot>
	);
};

/**
 * A container with an optional compact switch (35x16) and its label, floated
 * at the top right of `children`. `BaseSelector` renders every selector field
 * inside one (its `displaySwitch`/`switchLabel`), and `MultiSelectWithoutGroup`
 * one around its chips, mostly with `visible={false}`.
 *
 * It is the selectors' filter switch: the switch and its caption-sized label are
 * small enough to share the row of a field's label, beside the content they
 * filter. For a labeled switch of its own, in a filter bar, a toolbar or a form,
 * use MUI's `FormControlLabel` with a `Switch` (`size="small"` for a compact one).
 *
 * A click anywhere on the label toggles the switch, and the label shows the
 * pointer cursor (the default one while `disabled`), as MUI's
 * `FormControlLabel` does.
 *
 * The switch is controlled: pass `value` and `onChange`, or `disabled` for a
 * switch the user cannot toggle.
 *
 * The root is as high as the switch row and the children together: what follows
 * it starts below both. It has no margin of its own; the surrounding layout spaces
 * it (`styled(InlineSwitch)` or `styleOverrides.root` can add one).
 *
 * The switch takes its colors from the theme's palette, through its CSS
 * variables if it has them: off, a `text.secondary` thumb on a
 * `background.paper` track with a `text.secondary` edge; on, a
 * `primary.contrastText` thumb on a `primary.main` track. `styleOverrides.switch`
 * can change them.
 */
export default React.memo(InlineSwitch) as typeof InlineSwitch;
