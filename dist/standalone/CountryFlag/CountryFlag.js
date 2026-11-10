import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { styled, useThemeProps } from "@mui/material";
import CountryFlags from "../CountryFlags";
import combineClassNames from "../../utils/combineClassNames";
import CountryFlagImage from "./CountryFlagImage";
import CountryFlagNamedImage from "./CountryFlagNamedImage";
/** The CSS custom property that holds the flag's height */
const SIZE_VAR = "--cc-country-flag-size";
/** What MUI keeps off the DOM of a root slot, plus CountryFlag's own props */
const ROOT_PROPS_NOT_FORWARDED = new Set([
    "code",
    "size",
    "named",
    "ownerState",
    "theme",
    "sx",
    "as",
    "classes",
]);
const Root = styled("span", {
    name: "CcCountryFlag",
    slot: "root",
    shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})(({ theme }) => ({
    [SIZE_VAR]: theme.typography.pxToRem(16),
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    verticalAlign: "middle",
    height: `var(${SIZE_VAR})`,
    width: `calc(2 * var(${SIZE_VAR}))`,
}));
const CountryFlag = React.forwardRef(function CountryFlag(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: "CcCountryFlag" });
    const { code, size, named, className, classes, style, ...rootProps } = props;
    const src = CountryFlags[code];
    const rootStyle = useMemo(() => size == null
        ? style
        : {
            ...style,
            [SIZE_VAR]: typeof size === "number" ? `${size}px` : size,
        }, [size, style]);
    return (_jsx(Root, { ...rootProps, ref: ref, code: code, size: size, named: named, style: rootStyle, className: combineClassNames([className, classes?.root]), children: src &&
            (named ? (_jsx(CountryFlagNamedImage, { code: code, src: src, className: classes?.image })) : (_jsx(CountryFlagImage, { src: src, alt: "", className: classes?.image }))) }));
});
/**
 * A country's flag, the way components-care shows flags everywhere: at a fixed
 * height in a box twice as wide (so the names beside a column of flags line
 * up), in the flag's own aspect ratio, with a thin outline in the theme's
 * divider color that keeps white-edged flags (Japan, South Korea, Cyprus, ...)
 * and, in dark mode, black-edged ones (Germany) in shape.
 *
 * Decorative by default (`alt=""`), for a flag next to the country's name;
 * `named` names it after the country in components-care's current language.
 *
 * Use it wherever an app shows a flag: as the `icon` of a Selector option
 * (`useCountryOptions()` does), in a list row, beside a name in text.
 * `CountryFlags` gives the bare image URLs.
 *
 * Theme: `components.CcCountryFlag.defaultProps` ({@link CountryFlagProps}),
 * `components.CcCountryFlag.styleOverrides` per {@link CountryFlagClassKey}
 * slot, and `components.CcCountryFlag.variants`, which apply to the `root`
 * slot.
 *
 * @example
 * // a select option
 * { value: "JP", label: t("JP"), icon: <CountryFlag code="JP" /> }
 * @example
 * // a flag on its own, named "Japan"
 * <CountryFlag code="JP" size={24} named />
 */
export default React.memo(CountryFlag);
