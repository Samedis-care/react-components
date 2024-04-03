import React from "react";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";
const Root = styled("div", { name: "CcImageDots", slot: "root" })({
    overflow: "hidden",
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: 16,
});
const Container = styled("div", { name: "CcImageDots", slot: "container" })({
    marginRight: 12,
    marginLeft: 12,
    width: "100%",
    height: "100%",
    position: "absolute",
    whiteSpace: "nowrap",
});
const ImageDot = styled("div", { name: "CcImageDots", slot: "imageDot" })(({ theme }) => ({
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: "100%",
    height: 12,
    width: 12,
    display: "inline-block",
    flex: "0 0 12px",
    marginRight: 12,
    cursor: "pointer",
    "&.Mui-active": {
        backgroundColor: theme.palette.text.primary,
    },
}));
const ImageDots = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcImageDots" });
    const { total, active, setActive, className, classes } = props;
    return (React.createElement(React.Fragment, null, total > 1 && (React.createElement(Root, { className: combineClassNames([className, classes?.root]) },
        React.createElement(Container, { className: classes?.container }, Array.from(Array(total).keys()).map((img, idx) => (React.createElement(ImageDot, { key: idx, className: combineClassNames([
                active === idx && "Mui-active",
                classes?.imageDot,
            ]), onClick: () => setActive(idx) }))))))));
};
export default React.memo(ImageDots);
