import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useLayoutEffect, useRef, useState } from "react";
import { ButtonBase, styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../../../utils/internal/focusRing";
const Root = styled("div", { name: "CcImageDots", slot: "root" })({
    position: "relative",
    // the row of dots that does not fit is cut off, the focus ring above and below is not
    overflowX: "clip",
    display: "flex",
    alignItems: "center",
    // where the dots and the counter start; the full-screen view centres them
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
    minHeight: 16,
});
/**
 * State class of the container: the dots do not all fit in one row, so the counter is shown
 * instead. The dots stay laid out, invisible, to tell when they fit again.
 */
const containerClasses = {
    hidden: "CcImageDots-hidden",
};
const Container = styled("div", { name: "CcImageDots", slot: "container" })({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 12,
    right: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "inherit",
    columnGap: 12,
    [`&.${containerClasses.hidden}`]: {
        visibility: "hidden",
    },
});
const ImageDot = styled(ButtonBase, { name: "CcImageDots", slot: "imageDot" })(({ theme }) => ({
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: "100%",
    height: 12,
    width: 12,
    flex: "0 0 12px",
    cursor: "pointer",
    "&.Mui-active": {
        backgroundColor: theme.palette.text.primary,
    },
    "&.Mui-focusVisible": focusRing(theme, 2),
}));
const Counter = styled("div", { name: "CcImageDots", slot: "counter" })(({ theme }) => ({
    ...theme.typography.body2,
    lineHeight: "16px",
    color: theme.palette.text.primary,
    paddingLeft: 12,
    paddingRight: 12,
    whiteSpace: "nowrap",
}));
const CounterLabel = styled("span", {
    name: "CcImageDots",
    slot: "counterLabel",
})({
    // visually hidden, as MUI's visuallyHidden
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
});
/**
 * Whether every dot lies inside the container (the row of dots fits), in either direction
 * @param container The container of the dots
 */
const dotsFit = (container) => {
    const dots = container.children;
    if (dots.length === 0)
        return true;
    const box = container.getBoundingClientRect();
    const first = dots[0].getBoundingClientRect();
    const last = dots[dots.length - 1].getBoundingClientRect();
    // half a pixel for rounding
    return (Math.min(first.left, last.left) >= box.left - 0.5 &&
        Math.max(first.right, last.right) <= box.right + 0.5);
};
/**
 * A row of dots, one per image, the active one filled; activating a dot shows its image.
 * When the dots do not all fit in one row, a counter ("2 / 30", read as "Image 2 of 30")
 * takes their place, and the images are reached through Previous, Next and swiping. It
 * switches back when the room grows (or the number of images shrinks) so that they fit.
 */
const ImageDots = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcImageDots" });
    const { total, active, setActive, className, classes } = props;
    const { t } = useCCTranslations();
    const containerRef = useRef(null);
    const [fit, setFit] = useState(true);
    const shown = total > 1;
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!shown || !container)
            return;
        const measure = () => setFit(dotsFit(container));
        measure();
        // no ResizeObserver (jsdom): the dots stay
        if (typeof ResizeObserver === "undefined")
            return;
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        return () => observer.disconnect();
    }, [shown, total]);
    const inRange = active >= 0 && active < total;
    return (_jsx(_Fragment, { children: shown && (_jsxs(Root, { className: combineClassNames([className, classes?.root]), children: [_jsx(Container, { ref: containerRef, className: combineClassNames([
                        !fit && containerClasses.hidden,
                        classes?.container,
                    ]), children: Array.from(Array(total).keys()).map((img, idx) => (_jsx(ImageDot, { className: combineClassNames([
                            active === idx && "Mui-active",
                            classes?.imageDot,
                        ]), onClick: () => setActive(idx), "aria-label": t("standalone.file-upload.multi-image.image-position", {
                            INDEX: idx + 1,
                            TOTAL: total,
                        }), "aria-current": active === idx ? "true" : undefined }, idx))) }), !fit && inRange && (_jsxs(Counter, { className: classes?.counter, children: [_jsxs("span", { "aria-hidden": "true", children: [active + 1, " / ", total] }), _jsx(CounterLabel, { className: classes?.counterLabel, children: t("standalone.file-upload.multi-image.image-position", {
                                INDEX: active + 1,
                                TOTAL: total,
                            }) })] }))] })) }));
};
export default React.memo(ImageDots);
