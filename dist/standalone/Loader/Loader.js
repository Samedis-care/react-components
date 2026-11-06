import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { CircularProgress, styled, Typography, useThemeProps, } from "@mui/material";
/**
 * What MUI keeps off the DOM of a root slot, plus the Loader's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set([
    "text",
    "typographyVariant",
    "ownerState",
    "theme",
    "sx",
    "as",
    "classes",
]);
const Root = styled("div", {
    name: "CcLoader",
    slot: "root",
    shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})({
    // in flow, so that a parent of automatic height makes room for the content;
    // a parent with a definite height is filled, its content centered
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    width: "100%",
});
const InnerWrapper = styled("div", { name: "CcLoader", slot: "innerWrapper" })({
    textAlign: "center",
    width: "100%",
});
const OuterProgressWrapper = styled("div", {
    name: "CcLoader",
    slot: "outerProgressWrapper",
})({
    height: 70,
    position: "relative",
    width: "100%",
});
const InnerProgressWrapper = styled("div", {
    name: "CcLoader",
    slot: "innerProgressWrapper",
})({
    left: "50%",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
});
const Progress = styled(CircularProgress, {
    name: "CcLoader",
    slot: "progress",
})({});
const Loader = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcLoader" });
    const { text } = props;
    const typographyVariant = props.typographyVariant ?? "h6";
    return (_jsx(Root, { text: text, typographyVariant: typographyVariant, children: _jsxs(InnerWrapper, { children: [text && _jsx(Typography, { variant: typographyVariant, children: text }), _jsx(OuterProgressWrapper, { children: _jsx(InnerProgressWrapper, { children: _jsx(Progress, {}) }) })] }) }));
};
/**
 * Indeterminate loading indicator: a MUI `CircularProgress` with an optional
 * status `text` above it, centered in its parent.
 *
 * Layout: in a parent with a definite height (a fixed height, or a box that a
 * flex or grid layout stretches) it fills the parent and centers text and
 * spinner in it. In a parent of automatic height it is as tall as its
 * content: 70px for the spinner, plus the text.
 *
 * Theme: `components.CcLoader.defaultProps` ({@link LoaderProps}),
 * `components.CcLoader.styleOverrides` per {@link LoaderClassKey} slot, and
 * `components.CcLoader.variants`, which apply to the `root` slot.
 */
export default React.memo(Loader);
