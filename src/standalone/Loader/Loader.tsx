import React from "react";
import {
	CircularProgress,
	styled,
	Typography,
	TypographyProps,
	useThemeProps,
} from "@mui/material";

export interface LoaderProps {
	/**
	 * Optional status message to show
	 */
	text?: string;
	/**
	 * Typography variant of `text`: any variant MUI's `Typography` takes,
	 * including `"inherit"` and the variants a theme adds through
	 * `TypographyPropsVariantOverrides`. Ignored without `text`.
	 * @default "h6"
	 */
	typographyVariant?: TypographyProps["variant"];
}

/**
 * Props of the root slot: the Loader's own props, so that theme `variants`
 * can match them. They do not reach the DOM.
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
	height: "100%",
	position: "relative",
	width: "100%",
});

const InnerWrapper = styled("div", { name: "CcLoader", slot: "innerWrapper" })({
	height: 70,
	left: "50%",
	position: "absolute",
	textAlign: "center",
	top: "50%",
	transform: "translate(-50%, -50%)",
	width: "100%",
});

const OuterProgressWrapper = styled("div", {
	name: "CcLoader",
	slot: "outerProgressWrapper",
})({
	height: "100%",
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

/**
 * Theme style slots of {@link Loader}
 * (`components.CcLoader.styleOverrides.<slot>`):
 * - `root`: the outermost box, 100% of the parent's width and height. Theme
 *   `components.CcLoader.variants` apply to it. They match the Loader's `text`
 *   and `typographyVariant` after theme `defaultProps`, with
 *   `typographyVariant` `"h6"` when it is not set.
 * - `innerWrapper`: the box holding text and spinner
 * - `outerProgressWrapper`: the box below the text
 * - `innerProgressWrapper`: the box that centers the spinner
 * - `progress`: the MUI `CircularProgress`
 */
export type LoaderClassKey =
	| "root"
	| "innerWrapper"
	| "outerProgressWrapper"
	| "innerProgressWrapper"
	| "progress";

const Loader = (inProps: LoaderProps) => {
	const props = useThemeProps({ props: inProps, name: "CcLoader" });
	const { text } = props;
	const typographyVariant = props.typographyVariant ?? "h6";

	return (
		<Root text={text} typographyVariant={typographyVariant}>
			<InnerWrapper>
				{text && <Typography variant={typographyVariant}>{text}</Typography>}
				<OuterProgressWrapper>
					<InnerProgressWrapper>
						<Progress />
					</InnerProgressWrapper>
				</OuterProgressWrapper>
			</InnerWrapper>
		</Root>
	);
};

/**
 * Indeterminate loading indicator: a MUI `CircularProgress` with an optional
 * status `text` above it, centered in its parent.
 *
 * Theme: `components.CcLoader.defaultProps` ({@link LoaderProps}),
 * `components.CcLoader.styleOverrides` per {@link LoaderClassKey} slot, and
 * `components.CcLoader.variants`, which apply to the `root` slot.
 */
export default React.memo(Loader);
