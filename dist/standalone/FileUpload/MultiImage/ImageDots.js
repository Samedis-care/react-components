import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { ButtonBase, styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../../../utils/internal/focusRing";
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
const ImageDot = styled(ButtonBase, { name: "CcImageDots", slot: "imageDot" })(({ theme }) => ({
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: "100%",
    height: 12,
    width: 12,
    display: "inline-block",
    verticalAlign: "baseline",
    flex: "0 0 12px",
    marginRight: 12,
    cursor: "pointer",
    "&.Mui-active": {
        backgroundColor: theme.palette.text.primary,
    },
    "&.Mui-focusVisible": focusRing(theme, 2),
}));
const ImageDots = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcImageDots" });
    const { total, active, setActive, className, classes } = props;
    const { t } = useCCTranslations();
    return (_jsx(_Fragment, { children: total > 1 && (_jsx(Root, { className: combineClassNames([className, classes?.root]), children: _jsx(Container, { className: classes?.container, children: Array.from(Array(total).keys()).map((img, idx) => (_jsx(ImageDot, { className: combineClassNames([
                        active === idx && "Mui-active",
                        classes?.imageDot,
                    ]), onClick: () => setActive(idx), "aria-label": t("standalone.file-upload.multi-image.image-position", {
                        INDEX: idx + 1,
                        TOTAL: total,
                    }), "aria-current": active === idx ? "true" : undefined }, idx))) }) })) }));
};
export default React.memo(ImageDots);
