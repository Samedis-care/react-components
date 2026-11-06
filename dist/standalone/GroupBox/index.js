import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import combineClassNames from "../../utils/combineClassNames";
import { styled, useThemeProps } from "@mui/material";
const GroupBoxRoot = styled("fieldset", { name: "CcGroupBox", slot: "root" })(({ theme }) => ({
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
const GroupBoxLegend = styled("legend", {
    name: "CcGroupBox",
    slot: "legend",
})(({ ownerState: { smallLabel } }) => ({
    paddingInlineStart: 5,
    paddingInlineEnd: 5,
    ...(smallLabel && {
        fontSize: "0.75em",
    }),
}));
const GroupBox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcGroupBox" });
    const { label, children, smallLabel, className, classes, ...fieldsetProps } = props;
    return (_jsxs(GroupBoxRoot, { ...fieldsetProps, className: combineClassNames([className, classes?.root]), children: [label && (_jsx(GroupBoxLegend, { ownerState: { smallLabel: !!smallLabel }, children: label })), children] }));
};
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
 */
export default React.memo(GroupBox);
