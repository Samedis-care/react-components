import React, { useMemo } from "react";
import { styled, SxProps, Theme, useThemeProps } from "@mui/material";
import getCountryFlag from "../CountryFlags/getCountryFlag";
import combineClassNames from "../../utils/combineClassNames";
import CountryFlagImage from "./CountryFlagImage";
import CountryFlagNamedImage from "./CountryFlagNamedImage";

/**
 * Props of {@link CountryFlag}. Besides its own props, CountryFlag takes the
 * HTML attributes of a `span` (`id`, `title`, `style`, `data-*`, `aria-*`,
 * event handlers, ...) and passes them to its `root` slot.
 */
export interface CountryFlagProps extends Omit<
	React.HTMLAttributes<HTMLSpanElement>,
	"children"
> {
	/**
	 * The country: an upper-case ISO 3166-1 alpha-2 code, a key of
	 * `CountryFlags` (`"DE"`; not `"de"`, not `"UK"`). For a code without a
	 * flag the box stays empty, so a list of flags stays aligned.
	 */
	code: string;
	/**
	 * The flag's height: a number of px, or a CSS length (`"1em"` follows the
	 * text around the flag). The box is twice as wide as it is high. A flag
	 * fills the height and is as wide as its aspect ratio needs, at the start of
	 * the box. The flags of `CountryFlags` are all 3:2, so they take three
	 * quarters of the width.
	 * @default `theme.typography.pxToRem(16)` (`1rem` in MUI's default theme)
	 */
	size?: number | string;
	/**
	 * `false`: the flag is decorative (`alt=""`), for a flag next to the
	 * country's name, such as a select option or a list row; a named flag would
	 * make screen readers read the country twice.
	 * `true`: the flag is named after the country, in components-care's current
	 * language (`useCCCountryTranslations()`), for a flag shown without the
	 * name. A named flag suspends until the names have loaded.
	 * @default false
	 */
	named?: boolean;
	/**
	 * Class name added to the `root` slot. The styles of `styled(CountryFlag)`
	 * arrive this way and win over the root's own styles.
	 */
	className?: string;
	/**
	 * Class names added to the slots, one per {@link CountryFlagClassKey}:
	 * `root` (together with `className`) and `image`
	 */
	classes?: Partial<Record<CountryFlagClassKey, string>>;
	/**
	 * System styles for the `root` slot, as on MUI components
	 */
	sx?: SxProps<Theme>;
}

/**
 * Theme style slots of {@link CountryFlag}
 * (`components.CcCountryFlag.styleOverrides.<slot>`), and the keys of its
 * `classes` prop:
 * - `root`: the box, a `span` with `display: inline-flex`, twice as wide as
 *   the flag's height (the CSS custom property `--cc-country-flag-size`,
 *   which `size` sets). It gets `className`, `sx` and the HTML attributes.
 *   Theme `components.CcCountryFlag.variants` apply to it and match `code`,
 *   `size` and `named`.
 * - `image`: the flag's `img`, as large as fits into the box in its own
 *   aspect ratio, with a 1px outline in `theme.palette.divider`, so a flag
 *   whose edge has the color of the background keeps its shape
 */
export type CountryFlagClassKey = "root" | "image";

/** The CSS custom property that holds the flag's height */
const SIZE_VAR = "--cc-country-flag-size";

/**
 * Props of the root slot: CountryFlag's own props, so that theme `variants`
 * can match them (they do not reach the DOM)
 */
type CountryFlagRootProps = Pick<CountryFlagProps, "code" | "size" | "named">;

/** What MUI keeps off the DOM of a root slot, plus CountryFlag's own props */
const ROOT_PROPS_NOT_FORWARDED = new Set<PropertyKey>([
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
})<CountryFlagRootProps>(({ theme }) => ({
	[SIZE_VAR]: theme.typography.pxToRem(16),
	display: "inline-flex",
	alignItems: "center",
	flexShrink: 0,
	verticalAlign: "middle",
	height: `var(${SIZE_VAR})`,
	width: `calc(2 * var(${SIZE_VAR}))`,
}));

const CountryFlag = React.forwardRef(function CountryFlag(
	inProps: CountryFlagProps,
	ref: React.ForwardedRef<HTMLSpanElement>,
) {
	const props = useThemeProps({ props: inProps, name: "CcCountryFlag" });
	const { code, size, named, className, classes, style, ...rootProps } = props;
	const src = getCountryFlag(code);

	const rootStyle = useMemo(
		() =>
			size == null
				? style
				: ({
						...style,
						[SIZE_VAR]: typeof size === "number" ? `${size}px` : size,
					} as React.CSSProperties),
		[size, style],
	);

	return (
		<Root
			{...rootProps}
			ref={ref}
			code={code}
			size={size}
			named={named}
			style={rootStyle}
			className={combineClassNames([className, classes?.root])}
		>
			{src &&
				(named ? (
					<CountryFlagNamedImage
						code={code}
						src={src}
						className={classes?.image}
					/>
				) : (
					<CountryFlagImage src={src} alt="" className={classes?.image} />
				))}
		</Root>
	);
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
