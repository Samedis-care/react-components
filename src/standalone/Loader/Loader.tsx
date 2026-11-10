import React from "react";
import {
	CircularProgress,
	styled,
	SxProps,
	Theme,
	Typography,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

/**
 * Props of {@link Loader}. Besides its own props, the Loader takes the HTML
 * attributes of a `div` (`id`, `style`, `data-*`, `aria-*`, event handlers,
 * ...) and passes them to its `root` slot, except `aria-label` and
 * `aria-labelledby`, which name the spinner's progressbar.
 */
export interface LoaderProps extends Omit<
	React.HTMLAttributes<HTMLDivElement>,
	"children"
> {
	/**
	 * Optional status message to show. It wraps to the Loader's width, also
	 * inside a word that is wider than that, so a long translated word does
	 * not make the page scroll sideways.
	 */
	text?: string;
	/**
	 * Typography variant of `text`: any variant MUI's `Typography` takes,
	 * including `"inherit"` and the variants a theme adds through
	 * `TypographyPropsVariantOverrides`. Ignored without `text`.
	 * @default "h6"
	 */
	typographyVariant?: TypographyProps["variant"];
	/**
	 * Class name added to the `root` slot. As on MUI components, the styles
	 * of `styled(Loader)` and of a parent's theme slot that is a Loader
	 * (FormLoaderOverlay's `loader`) arrive this way and win over the Loader's
	 * own `root` styles.
	 */
	className?: string;
	/**
	 * Class names added to the Loader's slots, one per {@link LoaderClassKey}:
	 * `root` (together with `className`), `innerWrapper` and `progress`
	 */
	classes?: Partial<Record<LoaderClassKey, string>>;
	/**
	 * System styles for the `root` slot, as on MUI components
	 */
	sx?: SxProps<Theme>;
	/**
	 * Accessible name of the spinner's progressbar
	 */
	"aria-label"?: string;
	/**
	 * Id (or space-separated ids) of the element(s) whose text names the
	 * spinner's progressbar
	 */
	"aria-labelledby"?: string;
}

/**
 * Props of the root slot: `text` and `typographyVariant`, so that theme
 * `variants` can match them (they do not reach the DOM), and the HTML
 * attributes the Loader passes on
 */
type LoaderRootProps = Pick<LoaderProps, "text" | "typographyVariant">;

/**
 * What MUI keeps off the DOM of a root slot, plus the Loader's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set<PropertyKey>([
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
})<LoaderRootProps>({
	// in flow, so that a parent of automatic height makes room for the content;
	// a parent with a definite height is filled, its content centered
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	height: "100%",
	width: "100%",
});

// text and spinner as one block; the padding is equal above and below, so
// centering the block centers text and spinner
const InnerWrapper = styled("div", { name: "CcLoader", slot: "innerWrapper" })(
	({ theme }) => ({
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing(1),
		// a word wider than the Loader (a German compound on a phone) breaks
		// inside, and does not widen the Loader or the page
		overflowWrap: "anywhere",
		padding: theme.spacing(2, 0),
		textAlign: "center",
		width: "100%",
	}),
);

const Progress = styled(CircularProgress, {
	name: "CcLoader",
	slot: "progress",
})({});

/**
 * Theme style slots of {@link Loader}
 * (`components.CcLoader.styleOverrides.<slot>`), and the keys of its
 * `classes` prop:
 * - `root`: the outermost box, 100% of the parent's width and height, a flex
 *   column that centers `innerWrapper` vertically. It gets `className`, `sx`
 *   and the HTML attributes the Loader passes on. Theme
 *   `components.CcLoader.variants` apply to it. They match the Loader's `text`
 *   and `typographyVariant` after theme `defaultProps`, with
 *   `typographyVariant` `"h6"` when it is not set.
 * - `innerWrapper`: the block of text and spinner: a flex column that
 *   centers them horizontally, with `theme.spacing(1)` between them and
 *   `theme.spacing(2)` of padding above and below. It sets
 *   `overflow-wrap: anywhere`, so the text breaks inside a word that is wider
 *   than the Loader.
 * - `progress`: the MUI `CircularProgress`
 */
export type LoaderClassKey = "root" | "innerWrapper" | "progress";

const Loader = (inProps: LoaderProps) => {
	const props = useThemeProps({ props: inProps, name: "CcLoader" });
	const {
		text,
		typographyVariant: typographyVariantProp,
		className,
		classes,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		...rootProps
	} = props;
	const typographyVariant = typographyVariantProp ?? "h6";

	return (
		<Root
			{...rootProps}
			text={text}
			typographyVariant={typographyVariant}
			className={combineClassNames([className, classes?.root])}
		>
			<InnerWrapper className={classes?.innerWrapper}>
				{text && <Typography variant={typographyVariant}>{text}</Typography>}
				<Progress
					className={classes?.progress}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
				/>
			</InnerWrapper>
		</Root>
	);
};

/**
 * Indeterminate loading indicator: a MUI `CircularProgress` with an optional
 * status `text` above it, centered in its parent.
 *
 * Layout: text and spinner form one block. In a parent with a definite height
 * (a fixed height, or a box that a flex or grid layout stretches) the Loader
 * fills the parent and centers that block in it; a block taller than the
 * parent overflows it equally above and below. In a parent of automatic
 * height the Loader is as tall as the block: 72px without text (the 40px
 * spinner and 16px above and below it), and with text the text's height and
 * 8px more (at MUI's default spacing).
 *
 * Styling: `className`, `sx`, `style` and the other HTML attributes go to
 * the `root` slot, `classes` to the slot of each key, so `styled(Loader)`
 * styles the outer box. `aria-label` and `aria-labelledby` name the spinner's
 * progressbar.
 *
 * Theme: `components.CcLoader.defaultProps` ({@link LoaderProps}),
 * `components.CcLoader.styleOverrides` per {@link LoaderClassKey} slot, and
 * `components.CcLoader.variants`, which apply to the `root` slot.
 */
export default React.memo(Loader);
