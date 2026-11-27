import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import combineClassNames from "../../utils/combineClassNames";
import { styled, useThemeProps } from "@mui/material";
import GroupBoxRequiredText from "./GroupBoxRequiredText";
import { DirtyMarker } from "../UIKit/MuiFieldState";
/**
 * What MUI keeps off the DOM of a root slot, plus GroupBox's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set([
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
})(({ theme }) => ({
    padding: "8px",
    borderStyle: "solid",
    borderColor: "lightgrey",
    borderRadius: theme.shape.borderRadius,
    borderWidth: 1,
    position: "relative",
    // No height: the frame is as tall as its content in every parent, as
    // MUI's Card and Paper are. A caller stretches it with a height of its own.
    marginLeft: 0,
    marginRight: 0,
    minWidth: 0,
    width: "100%",
    // The width and a height set by the caller include padding and border, so
    // the frame fits its parent also where box-sizing is content-box (a page
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
    overridesResolver: (props, styles) => [
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
/** whether React renders the label as nothing, so that no legend is drawn */
const isEmptyLabel = (label) => label == null || typeof label === "boolean" || label === "";
const GroupBox = React.forwardRef(function GroupBox(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: "CcGroupBox" });
    const { label, children, smallLabel = false, required = false, dirty = false, className, classes, ...fieldsetProps } = props;
    const generatedId = React.useId();
    const requiredId = `${fieldsetProps.id ?? generatedId}-required`;
    const describedBy = fieldsetProps["aria-describedby"];
    const hasTitle = !isEmptyLabel(label);
    return (_jsxs(GroupBoxRoot, { ...fieldsetProps, "aria-describedby": required
            ? describedBy
                ? `${requiredId} ${describedBy}`
                : requiredId
            : describedBy, ref: ref, label: label, smallLabel: smallLabel, required: required, dirty: dirty, className: combineClassNames([className, classes?.root]), children: [(hasTitle || dirty) && (_jsxs(GroupBoxLegend, { className: combineClassNames([
                    classes?.legend,
                    smallLabel && SMALL_LABEL_CLASS,
                    smallLabel && classes?.smallLabel,
                ]), children: [label, required && hasTitle && (_jsx(GroupBoxAsterisk, { "aria-hidden": "true", className: combineClassNames([ASTERISK_CLASS, classes?.asterisk]), children: "\u2009*" })), dirty && _jsx(DirtyMarker, {})] })), required && _jsx(GroupBoxRequiredText, { id: requiredId }), children] }));
});
/**
 * A frame with an optional title: a native `<fieldset>` whose `label` is drawn
 * as a `<legend>` in its top border.
 *
 * The frame is as wide as its parent and as tall as its content, in every
 * parent, as MUI's `Card` and `Paper` are: a frame in a side panel that is
 * stretched to the height of the form next to it ends below its last line.
 * To make it fill its parent, give it a height, as a `Card`:
 * `sx={{ height: "100%" }}` fills a parent of definite height, such as a Grid
 * item, which is stretched to its row, so frames in one Grid row are equally
 * tall. In a Grid item with `display: "flex"` the frame is stretched as a flex
 * item, without a height of its own. Its width and height include its
 * padding and border (`box-sizing: border-box`), so it fits its parent also
 * where `box-sizing` is `content-box`, e.g. on a page without MUI's
 * `CssBaseline`. A `max-height` on the parent does not limit the frame: it
 * encloses its content, and a parent with `overflow: auto` scrolls.
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
 * // frames of equal height in one Grid row
 * <Grid container spacing={2}>
 *   <Grid size={{ xs: 12, md: 6 }}>
 *     <GroupBox label={t("service")} sx={{ height: "100%" }}>…</GroupBox>
 *   </Grid>
 *   <Grid size={{ xs: 12, md: 6 }}>
 *     <GroupBox label={t("contract")} sx={{ height: "100%" }}>…</GroupBox>
 *   </Grid>
 * </Grid>
 *
 * @example
 * // a theme that gives frames with a small legend a tighter frame
 * createTheme({ components: { CcGroupBox: { variants: [{
 *   props: { smallLabel: true },
 *   style: { padding: 4, "& > legend": { paddingInline: 2 } },
 * }] } } });
 */
export default React.memo(GroupBox);
