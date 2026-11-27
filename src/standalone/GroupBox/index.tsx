import React from "react";
import combineClassNames from "../../utils/combineClassNames";
import { styled, SxProps, Theme, useThemeProps } from "@mui/material";
import GroupBoxRequiredText from "./GroupBoxRequiredText";
import { DirtyMarker } from "../UIKit/MuiFieldState";

/**
 * The props the root slot gets besides the fieldset's attributes: GroupBox's
 * `label`, `smallLabel`, `required` and `dirty`, so that theme `variants` can
 * match them. They do not reach the DOM.
 */
type GroupBoxRootProps = Pick<GroupBoxProps, "label"> &
	Required<Pick<GroupBoxProps, "smallLabel" | "required" | "dirty">>;

/**
 * What MUI keeps off the DOM of a root slot, plus GroupBox's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set<PropertyKey>([
	"label",
	"smallLabel",
	"required",
	"dirty",
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
	// The width and the only-child height include padding and border, so the
	// frame fits its parent also where box-sizing is content-box (a page
	// without CssBaseline, or a subtree that resets it).
	boxSizing: "border-box",
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
	// A word wider than the frame (a German compound, a file name or a URL on
	// a phone) breaks inside, so the title stays in the frame and does not
	// widen the page, also where the frame sits in a flex row or a grid cell.
	// The element of a ReactNode label inherits it.
	overflowWrap: "anywhere",
	// :where() keeps the rule at zero specificity, so a font size from the
	// theme (legend or smallLabel), from classes.smallLabel or from app CSS
	// wins. The leading * stops emotion from reading the selector as a
	// pseudo-class of the legend.
	[`*:where(&.${SMALL_LABEL_CLASS})`]: {
		fontSize: "0.75em",
	},
});

/**
 * Class of the asterisk of a required frame's legend
 */
const ASTERISK_CLASS = "CcGroupBox-asterisk";

/**
 * The asterisk after a required frame's title. It has no style of its own, as
 * MUI's FormLabel asterisk, and takes the legend's font and colour.
 */
const GroupBoxAsterisk = styled("span", {
	name: "CcGroupBox",
	slot: "asterisk",
})({});

/**
 * Keys of the theme's `components.CcGroupBox.styleOverrides`, also the keys
 * of the `classes` prop:
 * - `root`: the `<fieldset>` frame
 * - `legend`: the `<legend>` title. It sets `overflow-wrap: anywhere`, so a
 *   word wider than the frame breaks inside it.
 * - `smallLabel`: the legend while `smallLabel` is set. Its theme overrides
 *   apply after those of `legend`.
 * - `asterisk`: the asterisk after the title while `required` is set, a
 *   `<span>` in the legend with the class `CcGroupBox-asterisk`
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. The small legend has the class `CcGroupBox-smallLabel`, so a
 * `legend` override can also style it with `"&.CcGroupBox-smallLabel"`.
 */
export type GroupBoxClassKey = "root" | "legend" | "smallLabel" | "asterisk";

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
	 * Title drawn as the `<legend>` in the frame's top border, already
	 * translated. It is also the group's accessible name.
	 *
	 * The values React renders as nothing, `null`, `undefined`, `false`,
	 * `true` and `""`, render no legend: the frame has no title and the
	 * group no name (name it with `aria-label` or `aria-labelledby`). Pass
	 * `null` for a frame without a title, as `undefined` is replaced by a
	 * `label` from the theme's `defaultProps`. Any other value is the legend,
	 * as React renders it: `0` shows "0", `NaN` shows "NaN". An element always
	 * renders a legend, even one that renders nothing, so a label that is only
	 * the dirty marker of `labelWithDirtyMarker("", true)` keeps its legend, as
	 * does a frame without a title while `dirty` is set.
	 *
	 * A title wider than the frame wraps at spaces. A word wider than the
	 * frame, such as a long compound, a file name or a URL, breaks between any
	 * two characters, so it stays inside the frame and the page does not
	 * scroll sideways on a phone.
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
	 * Marks the frame as the frame of a required field, as MUI's `required` marks
	 * a FormLabel: an asterisk after the title (`classes.asterisk`), hidden from
	 * assistive technology like MUI's, and a hidden "Required" in the user's
	 * language that the fieldset's `aria-describedby` names before the ids passed
	 * in `aria-describedby`, so a screen reader hears it when focus enters the
	 * group. ARIA allows `aria-required` on neither a group nor a button, so the
	 * frame says it this way. A frame without a title gets the description but no
	 * asterisk. The text is a translation of the library, which suspends the frame
	 * until it has loaded (the Framework's `Suspense` shows its fallback meanwhile).
	 *
	 * It is display only, like MUI's `required`: it neither validates nor blocks a
	 * submit. Theme `variants` keyed on `required` match, with `required` `false`
	 * when it is not set.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Marks the frame as the frame of a modified field, one whose value differs
	 * from the server-side value: the library's dirty marker, a dot after the
	 * title, and "(modified)" in the user's language in the group's name
	 * ("Attachments (modified)"), as `labelWithDirtyMarker` adds them to a
	 * label. The dot follows the asterisk of a required frame, as on a MUI field
	 * with `dirty`. A frame without a title gets a legend with only the dot.
	 * Pass the plain title in `label`: a label from `labelWithDirtyMarker` would
	 * draw a second dot. Restyle the dot through the `CcDirtyMarker` theme
	 * component. Theme `variants` keyed on `dirty` match, with `dirty` `false`
	 * when it is not set.
	 * @default false
	 */
	dirty?: boolean;
	/**
	 * Box contents
	 */
	children?: React.ReactNode;
	/**
	 * CSS class to apply to fieldset
	 */
	className?: string;
	/**
	 * Additional class names per {@link GroupBoxClassKey}: `root` is added to
	 * the `<fieldset>`, `legend` to the `<legend>`, `smallLabel` to the
	 * legend while `smallLabel` is set, and `asterisk` to the asterisk of a
	 * required frame. As on MUI components, a `classes` prop
	 * replaces the `classes` of the theme's `defaultProps` rather than adding
	 * to them.
	 */
	classes?: Partial<Record<GroupBoxClassKey, string>>;
	/**
	 * System styles for the `<fieldset>`, as on MUI components. They apply after
	 * GroupBox's own styles and the theme's `styleOverrides.root`.
	 */
	sx?: SxProps<Theme>;
}

/** whether React renders the label as nothing, so that no legend is drawn */
const isEmptyLabel = (label: React.ReactNode) =>
	label == null || typeof label === "boolean" || label === "";

const GroupBox = React.forwardRef(function GroupBox(
	inProps: GroupBoxProps,
	ref: React.ForwardedRef<HTMLFieldSetElement>,
) {
	const props = useThemeProps({ props: inProps, name: "CcGroupBox" });
	const {
		label,
		children,
		smallLabel = false,
		required = false,
		dirty = false,
		className,
		classes,
		...fieldsetProps
	} = props;
	const generatedId = React.useId();
	const requiredId = `${fieldsetProps.id ?? generatedId}-required`;
	const describedBy = fieldsetProps["aria-describedby"];
	const hasTitle = !isEmptyLabel(label);
	return (
		<GroupBoxRoot
			{...fieldsetProps}
			// "Required" first, then what the caller describes the frame with
			aria-describedby={
				required
					? describedBy
						? `${requiredId} ${describedBy}`
						: requiredId
					: describedBy
			}
			ref={ref}
			label={label}
			smallLabel={smallLabel}
			required={required}
			dirty={dirty}
			className={combineClassNames([className, classes?.root])}
		>
			{(hasTitle || dirty) && (
				<GroupBoxLegend
					className={combineClassNames([
						classes?.legend,
						smallLabel && SMALL_LABEL_CLASS,
						smallLabel && classes?.smallLabel,
					])}
				>
					{label}
					{required && hasTitle && (
						<GroupBoxAsterisk
							aria-hidden={"true"}
							className={combineClassNames([ASTERISK_CLASS, classes?.asterisk])}
						>
							{"\u2009*"}
						</GroupBoxAsterisk>
					)}
					{dirty && <DirtyMarker />}
				</GroupBoxLegend>
			)}
			{required && <GroupBoxRequiredText id={requiredId} />}
			{children}
		</GroupBoxRoot>
	);
});

/**
 * A frame with an optional title: a native `<fieldset>` whose `label` is drawn
 * as a `<legend>` in its top border.
 *
 * The frame is as wide as its parent. Its width and height include its
 * padding and border (`box-sizing: border-box`), so it fits its parent also
 * where `box-sizing` is `content-box`, e.g. on a page without MUI's
 * `CssBaseline`. When it is its parent's only element child, it is also as
 * tall as the parent wherever the parent's height is definite, e.g. a Grid
 * item stretched to its row, so frames in one Grid row are equally tall.
 * Next to other elements (a heading above it, helper text
 * below it) it is as tall as its content, and the siblings stay inside the
 * parent. A `height` set by the theme or a `styled(GroupBox)` wrapper
 * replaces this rule. A `max-height` on the parent does not limit the frame:
 * it encloses its content, and a parent with `overflow: auto` scrolls.
 *
 * Every other HTML attribute, `sx` and `ref` reach the fieldset. A framed
 * form control ties its error to the group with `aria-describedby`: screen
 * readers read it when focus enters the group. It marks a required field with
 * `required` and a modified one with `dirty`, drawn after the title in the
 * order of a MUI field: "Attachments *" and then the dirty marker's dot. A
 * frame without a title can be named by a heading inside it with
 * `aria-labelledby`.
 *
 * Theme: `components.CcGroupBox.defaultProps` ({@link GroupBoxProps}),
 * `styleOverrides` per {@link GroupBoxClassKey} slot, and `variants`, which
 * apply to the fieldset. A variant's `props` match `label`, `smallLabel`,
 * `required`, `dirty` and the fieldset's HTML attributes after the theme's
 * default props, with `smallLabel`, `required` and `dirty` `false` when they
 * are not set. A `props` function gets these
 * props directly: there is no `ownerState`. A variant reaches the legend
 * through a nested selector.
 *
 * @example
 * <GroupBox
 *   label={t("files")}
 *   required
 *   dirty={dirty}
 *   aria-describedby={"files-error"}
 * >…</GroupBox>
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
