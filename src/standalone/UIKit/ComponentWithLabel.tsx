import React, { useCallback, useEffect, useRef } from "react";
import {
	FormControlLabel,
	FormControlLabelProps,
	styled,
	Typography,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

export interface ComponentWithLabelProps extends Omit<
	FormControlLabelProps,
	"label"
> {
	/**
	 * The caption, as a plain string. It wraps at its spaces where it has less
	 * room than its text needs (e.g. in a row of captioned buttons on a phone),
	 * and a `"\n"` in it starts a new line (`white-space: pre-line`).
	 */
	labelText: string;
	/**
	 * Label variant
	 */
	labelVariant?: TypographyProps["variant"];
	/**
	 * Label location
	 */
	labelDisplay?: "block" | "inline";
	/**
	 * Label alignment
	 */
	labelAlign?: TypographyProps["align"];
	/**
	 * custom class name to apply to root
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<ComponentWithLabelClassKey, string>>;
	/**
	 * Called once per click on the control or on its caption (a keyboard
	 * activation of the control is a click too), with that click; its
	 * `currentTarget` is the `<label>` root. For a click on the caption, the
	 * label then forwards a click to the control (it toggles a checkbox, it
	 * clicks a button): that click doesn't call `onClick` again and is stopped
	 * at the label if `onClick` stopped the first one. `preventDefault()` keeps
	 * the label from forwarding the click.
	 */
	onClick?: React.MouseEventHandler<HTMLLabelElement>;
}

const StyledFormControlLabel = styled(FormControlLabel, {
	name: "CcComponentWithLabel",
	slot: "root",
})({});

const Label = styled(Typography, {
	name: "CcComponentWithLabel",
	slot: "label",
})({
	// wraps at spaces where the caption has less room than its text needs;
	// keeps the line breaks of the text
	whiteSpace: "pre-line",
});

/**
 * Keys of the theme's `components.CcComponentWithLabel.styleOverrides`, also
 * the keys of the `classes` prop:
 * - `root`: the `<label>` (MUI's FormControlLabel)
 * - `label`: the caption shown for `labelText`
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. Theme `variants` style the root and match its props, which are all
 * of ComponentWithLabel's but `labelText`, `labelVariant`, `labelDisplay`
 * and `labelAlign`; a `props` function gets them directly.
 */
export type ComponentWithLabelClassKey = "root" | "label";

/** What the click on the caption did, for the click the label forwards */
interface ForwardedClick {
	/**
	 * `onClick` stopped the click on the caption, so the forwarded click
	 * stops at the label as well
	 */
	stopped: boolean;
}

const ComponentWithLabel = (
	inProps: ComponentWithLabelProps | FormControlLabelProps,
) => {
	let props = useThemeProps({ props: inProps, name: "CcComponentWithLabel" });
	const { onClick } = props;

	// A click on the caption reaches the <label> twice: as itself, and as the
	// click the label's activation behavior then sends to its control, which
	// bubbles back up. onClick gets the first one only. The browser sends the
	// second click in the same task, but after the microtasks of the first
	// one's handlers have run, so the mark is dropped by a timeout.
	const forwardedClick = useRef<ForwardedClick | null>(null);
	const forwardedClickTimeout = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(forwardedClickTimeout.current), []);
	const handleClick = useCallback(
		(evt: React.MouseEvent<HTMLLabelElement>) => {
			const label = evt.currentTarget;
			const control = label.control;
			const forwarded = forwardedClick.current;
			if (forwarded && evt.target === control) {
				forwardedClick.current = null;
				if (forwarded.stopped) evt.stopPropagation();
				return;
			}
			onClick?.(evt);
			if (
				control &&
				label.contains(control) &&
				!control.contains(evt.target as Node) &&
				!evt.isDefaultPrevented()
			) {
				// the label forwards this click to the control, unless a later
				// handler cancels it, the control is disabled or the click is on
				// other interactive content in the label
				forwardedClick.current = { stopped: evt.isPropagationStopped() };
				window.clearTimeout(forwardedClickTimeout.current);
				forwardedClickTimeout.current = window.setTimeout(() => {
					forwardedClick.current = null;
				});
			}
		},
		[onClick],
	);

	let label: FormControlLabelProps["label"];

	if ("labelText" in props) {
		let {
			// eslint-disable-next-line prefer-const
			labelText,
			labelVariant,
			labelDisplay,
			labelAlign,
			// eslint-disable-next-line prefer-const
			...propsCopy
		} = props;
		const labelPlacement = props.labelPlacement || "end";
		labelVariant = labelVariant ?? "caption";
		labelDisplay = labelDisplay ?? "block";
		labelAlign =
			labelAlign ??
			({
				start: "right",
				end: "left",
				top: "center",
				bottom: "center",
			}[labelPlacement] as TypographyProps["align"]);
		label = (
			<Label
				variant={labelVariant}
				sx={{ display: labelDisplay }}
				align={labelAlign}
				className={propsCopy.classes?.label}
			>
				{labelText}
			</Label>
		);
		props = { ...propsCopy, label: "" };
	} else {
		label = props.label;
	}
	return (
		<StyledFormControlLabel
			{...props}
			className={combineClassNames([props.className, props.classes?.root])}
			label={label}
			onClick={onClick && handleClick}
		/>
	);
};

export default React.memo(ComponentWithLabel);
