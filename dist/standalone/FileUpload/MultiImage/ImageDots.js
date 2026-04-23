import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
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
    return (_jsx(_Fragment, { children: total > 1 && (_jsx(Root, { className: combineClassNames([className, classes?.root]), children: _jsx(Container, { className: classes?.container, children: Array.from(Array(total).keys()).map((img, idx) => (_jsx(ImageDot, { className: combineClassNames([
                        active === idx && "Mui-active",
                        classes?.imageDot,
                    ]), onClick: () => setActive(idx) }, idx))) }) })) }));
};
export default React.memo(ImageDots);
