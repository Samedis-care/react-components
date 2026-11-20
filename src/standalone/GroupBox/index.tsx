import React from "react";
import combineClassNames from "../../utils/combineClassNames";
import { styled, SxProps, Theme, useThemeProps } from "@mui/material";

/**
 * The props the root slot gets besides the fieldset's attributes: GroupBox's
 * `label` and `smallLabel`, so that theme `variants` can match them. They do
 * not reach the DOM.
 */
type GroupBoxRootProps = Pick<GroupBoxProps, "label"> &
	Required<Pick<GroupBoxProps, "smallLabel">>;

/**
 * What MUI keeps off the DOM of a root slot, plus GroupBox's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set<PropertyKey>([
	"label",
	"smallLabel",
	"ownerState",
	"theme",
	"sx",
	"as",
	"classes",
]);

const GroupBoxRoot = styled("fieldset", {
	name: "CcGroupBox",
	slot: "root",
	shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})<GroupBoxRootProps>(({ theme }) => ({
	padding: "8px",
	borderStyle: "solid",
	borderColor: "lightgrey",
	borderRadius: theme.shape.borderRadius,
	borderWidth: 1,
	position: "relative",
	maxHeight: "inherit",
	// Fills the parent only as its only child: a full-height frame would push
	// a heading or helper text next to it out of the parent. :where() keeps
	// the rule at zero specificity, so a height from the theme or a styled()
	// wrapper wins. The leading * stops emotion from reading the selector as
	// a pseudo-class of the frame (which would add the frame's class again).
	"*:where(&:only-child)": {
		height: "100%",
	},
	marginLeft: 0,
	marginRight: 0,
	minWidth: 0,
	width: "100%",
}));

/**
 * State class of the legend while `smallLabel` is set
 */
const SMALL_LABEL_CLASS = "CcGroupBox-smallLabel";

const GroupBoxLegend = styled("legend", {
	name: "CcGroupBox",
	slot: "legend",
	// A legend with the state class gets the theme's smallLabel overrides
	// after its legend overrides.
	overridesResolver: (props: { className?: string }, styles) => [
		styles.legend,
		!!props.className?.split(" ").includes(SMALL_LABEL_CLASS) &&
			styles.smallLabel,
	],
})({
	paddingInlineStart: 5,
	paddingInlineEnd: 5,
	// :where() keeps the rule at zero specificity, so a font size from the
	// theme (legend or smallLabel), from classes.smallLabel or from app CSS
	// wins. The leading * stops emotion from reading the selector as a
	// pseudo-class of the legend.
	[`*:where(&.${SMALL_LABEL_CLASS})`]: {
		fontSize: "0.75em",
	},
});

/**
 * Keys of the theme's `components.CcGroupBox.styleOverrides`, also the keys
 * of the `classes` prop:
 * - `root`: the `<fieldset>` frame
 * - `legend`: the `<legend>` title
 * - `smallLabel`: the legend while `smallLabel` is set. Its theme overrides
 *   apply after those of `legend`.
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. The small legend has the class `CcGroupBox-smallLabel`, so a
 * `legend` override can also style it with `"&.CcGroupBox-smallLabel"`.
 */
export type GroupBoxClassKey = "root" | "legend" | "smallLabel";

/**
 * The HTML attributes of the GroupBox's fieldset, e.g. `aria-busy` or `aria-describedby`
 */
export type GroupBoxHTMLProps = Omit<
	React.ComponentPropsWithoutRef<"fieldset">,
	"children"
>;

/**
 * @remarks Every HTML attribute the box does not take itself is set on its fieldset, e.g.
 *          `aria-describedby` for an error shown next to the frame, or `aria-labelledby`
 *          for a frame without a title. A `ref` gets the fieldset.
 */
export interface GroupBoxProps extends GroupBoxHTMLProps {
	/**
	 * The label of the box
	 */
	label: React.ReactNode;
	/**
	 * Renders the legend at 0.75em of the inherited font size. The legend
	 * then has the class `CcGroupBox-smallLabel` and `classes.smallLabel`, and
	 * gets the theme's `styleOverrides.smallLabel`; a font size from the theme
	 * replaces the 0.75em. Theme `variants` keyed on `smallLabel` match, and
	 * style the fieldset (the legend through `"& > legend"`).
	 * @default false
	 */
	smallLabel?: boolean;
	/**
	 * Box contents
	 */
	children?: React.ReactNode;
	/**
	 * CSS class to apply to fieldset
	 */
	className?: string;
	/**
	 * Additional class names: `root` is added to the `<fieldset>`,
	 * `smallLabel` to the legend while `smallLabel` is set
	 */
	classes?: Partial<Record<GroupBoxClassKey, string>>;
	/**
	 * System styles for the `<fieldset>`, as on MUI components. They apply after
	 * GroupBox's own styles and the theme's `styleOverrides.root`.
	 */
	sx?: SxProps<Theme>;
}

const GroupBox = React.forwardRef(function GroupBox(
	inProps: GroupBoxProps,
	ref: React.ForwardedRef<HTMLFieldSetElement>,
) {
	const props = useThemeProps({ props: inProps, name: "CcGroupBox" });
	const {
		label,
		children,
		smallLabel = false,
		className,
		classes,
		...fieldsetProps
	} = props;
	return (
		<GroupBoxRoot
			{...fieldsetProps}
			ref={ref}
			label={label}
			smallLabel={smallLabel}
			className={combineClassNames([className, classes?.root])}
		>
			{label && (
				<GroupBoxLegend
					className={combineClassNames([
						smallLabel && SMALL_LABEL_CLASS,
						smallLabel && classes?.smallLabel,
					])}
				>
					{label}
				</GroupBoxLegend>
			)}
			{children}
		</GroupBoxRoot>
	);
});

/**
 * A frame with an optional title: a native `<fieldset>` whose `label` is drawn
 * as a `<legend>` in its top border.
 *
 * The frame is as wide as its parent. When it is its parent's only element
 * child, it is also as tall as the parent wherever the parent's height is
 * definite, e.g. a Grid item stretched to its row, so frames in one Grid row
 * are equally tall. Next to other elements (a heading above it, helper text
 * below it) it is as tall as its content, and the siblings stay inside the
 * parent. A `height` set by the theme or a `styled(GroupBox)` wrapper
 * replaces this rule.
 *
 * Every other HTML attribute, `sx` and `ref` reach the fieldset. A framed
 * form control ties its error to the group with `aria-describedby`: screen
 * readers read it when focus enters the group. A frame without a title can be
 * named by a heading inside it with `aria-labelledby`.
 *
 * Theme: `components.CcGroupBox.defaultProps` ({@link GroupBoxProps}),
 * `styleOverrides` per {@link GroupBoxClassKey} slot, and `variants`, which
 * apply to the fieldset. A variant's `props` match `label`, `smallLabel` and
 * the fieldset's HTML attributes after the theme's default props, with
 * `smallLabel` `false` when it is not set. A `props` function gets these
 * props directly: there is no `ownerState`. A variant reaches the legend
 * through a nested selector.
 *
 * @example
 * <GroupBox label={t("files")} aria-describedby={"files-error"}>…</GroupBox>
 * <FormHelperTextCC id={"files-error"} error>{errorMsg}</FormHelperTextCC>
 *
 * @example
 * // a theme that gives frames with a small legend a tighter frame
 * createTheme({ components: { CcGroupBox: { variants: [{
 *   props: { smallLabel: true },
 *   style: { padding: 4, "& > legend": { paddingInline: 2 } },
 * }] } } });
 */
export default React.memo(GroupBox);
