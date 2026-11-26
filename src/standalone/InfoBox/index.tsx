import React, { useCallback, useRef } from "react";
import {
	ErrorOutlined,
	InfoOutlined,
	ReportProblemOutlined,
	TaskAlt,
} from "@mui/icons-material";
import {
	Accordion,
	AccordionDetails,
	AccordionProps,
	AccordionSummary,
	accordionSummaryClasses,
	CSSObject,
	PaletteColor,
	styled,
	Theme,
	Typography,
	typographyClasses,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import { useControlled } from "@mui/material/utils";
import { useTranslation } from "react-i18next";
import combineClassNames from "../../utils/combineClassNames";
import ccI18n from "../../i18n";
import visuallyHidden from "../../utils/internal/visuallyHidden";

/**
 * InfoBox never suspended, and the status it reads out is only heard: while
 * the translations load it uses the English defaults, then re-renders, like the
 * Loader's non-suspending options
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };

/**
 * The box. MUI's Accordion styles accordions as a group: it rounds only the
 * top corners of the first of its element type among its siblings and the
 * bottom corners of the last. Every InfoBox is rounded on all four corners
 * instead, and clips its header to them.
 */
const AccordionStyled = styled(Accordion, { name: "CcInfoBox", slot: "root" })(
	({ theme }) => ({
		boxShadow: "none",
		"&.MuiAccordion-rounded": {
			borderRadius: theme.shape.borderRadius,
			overflow: "hidden",
		},
	}),
);

// state classes of the root and the header, see InfoBoxClassKey
const STATUS_CLASSES: Record<NonNullable<InfoBoxProps["status"]>, string> = {
	info: "CcInfoBox-statusInfo",
	warning: "CcInfoBox-statusWarning",
	success: "CcInfoBox-statusSuccess",
	error: "CcInfoBox-statusError",
};
const ALWAYS_EXPANDED_CLASS = "CcInfoBox-alwaysExpanded";

// The header's colors, set by its status class. The header's own declarations
// read them, so a background or color in the theme's summary override, which
// comes after them, replaces them for every status.
const HEADER_BACKGROUND = "--cc-info-box-header-background";
const HEADER_COLOR = "--cc-info-box-header-color";

/**
 * The header's colors for one status
 * @param color The palette color of the status
 * @returns The custom properties the header's colors read
 */
const headerColors = (color: PaletteColor): CSSObject => ({
	[HEADER_BACKGROUND]: color.main,
	[HEADER_COLOR]: color.contrastText,
});

/**
 * The look of the header, the same for the toggle and for the static header
 * of a forced box: its height and its status colors
 * @param theme The theme
 * @returns The styles of the header
 */
const headerStyles = (theme: Theme): CSSObject => ({
	// a stacking context for the icon column (zIndex -1), so the column is
	// drawn over the header's background, and the focus ring over the column
	// instead of under its shade
	isolation: "isolate",
	minHeight: 48,
	backgroundColor: `var(${HEADER_BACKGROUND})`,
	color: `var(${HEADER_COLOR})`,
	[`&.${STATUS_CLASSES.info}`]: headerColors(theme.palette.primary),
	[`&.${STATUS_CLASSES.error}`]: headerColors(theme.palette.error),
	[`&.${STATUS_CLASSES.warning}`]: headerColors(theme.palette.warning),
	[`&.${STATUS_CLASSES.success}`]: headerColors(theme.palette.success),
});

/**
 * The keyboard focus ring of the header, 2px inside its edges, see the
 * toggle's focus rule
 */
const HEADER_FOCUS_RING: CSSObject = {
	outline: "2px solid currentColor",
	outlineOffset: -4,
};

const AccordionSummaryStyled = styled(AccordionSummary, {
	name: "CcInfoBox",
	slot: "summary",
})(({ theme }) => ({
	...headerStyles(theme),
	// MUI's content wrapper (and the summaryRoot in it) is never wider than
	// the header: the heading wraps anywhere, and heading content that cannot
	// wrap (e.g. `white-space: nowrap`) runs past the header's end, where the
	// root clips it. Otherwise the wrapper grew to that content's width, and
	// the header button, which centers its content, cut off the heading's
	// start under the icon column.
	[`& .${accordionSummaryClasses.content}`]: {
		minWidth: 0,
	},
	// A keyboard-focused header keeps its status color, where MUI's
	// AccordionSummary would replace the background with
	// `palette.action.focus`, and shows a 2px outline in the text color, 2px
	// inside its edges: the text color contrasts with the status color as the
	// heading does (`palette.primary.main` would vanish on the info header),
	// the status color around it sets it off from the page, the root's
	// `overflow: hidden` cannot clip it, and forced colors keep outlines. It
	// also replaces the ring of the theme's `focusVisible` option, which the
	// root would clip.
	[`&.${accordionSummaryClasses.focusVisible}`]: {
		backgroundColor: `var(${HEADER_BACKGROUND})`,
		...HEADER_FOCUS_RING,
	},
}));

/**
 * The header of a forced box (`alwaysExpanded`): the toggle's look without the
 * button, so it is no tab stop, has no `aria-expanded`, and the heading can be
 * selected and copied. It lays out its content as MUI's `AccordionSummary`
 * and its content wrapper do: 16px at the sides, at least 12px above and
 * below, centered vertically. A `span`, as the box's `<h3>` around it takes
 * phrasing content. It is focusable but no tab stop (`tabIndex` -1), so it
 * can take over the keyboard focus from the toggle when the box becomes
 * forced.
 */
const StaticHeader = styled("span", { name: "CcInfoBox", slot: "summary" })(
	({ theme }) => ({
		...headerStyles(theme),
		// the containing block of the icon column
		position: "relative",
		display: "flex",
		alignItems: "center",
		boxSizing: "border-box",
		padding: theme.spacing(1.5, 2),
		textAlign: "start",
		"&:focus-visible": HEADER_FOCUS_RING,
		// The heading's lines are as high as its variant's line height, as in
		// the toggle. Inline, it would share each line with the header's
		// content (summaryRoot), whose line height is the page's (e.g. 24px
		// under CssBaseline): the toggle's content has the button's smaller one.
		[`& > * > .${typographyClasses.root}`]: {
			display: "block",
		},
	}),
);

const SummaryRoot = styled("div", { name: "CcInfoBox", slot: "summaryRoot" })(
	({ theme }) => ({
		margin: 0,
		paddingLeft: theme.spacing(5),
		// never wider than the header, see the summary's content wrapper
		minWidth: 0,
	}),
);

const SummaryHeading = styled(Typography, {
	name: "CcInfoBox",
	slot: "heading",
})({
	// a word wider than the header (a long compound, a file name or a URL on a
	// phone) breaks inside, so it stays in the box, which clips its content
	overflowWrap: "anywhere",
});

/**
 * The status name in front of the heading, with the separator the translation
 * carries. It is only read out and visually hidden (`statusName` slot): the
 * header announces "Warning: Please review", where the icon and the color
 * would be the only sign of the status.
 */
const StatusName = styled("span", {
	name: "CcInfoBox",
	slot: "statusName",
})(visuallyHidden);

const SpanIconButton = styled("span", {
	name: "CcInfoBox",
	slot: "iconButton",
})(({ theme }) => ({
	position: "absolute",
	// below the header's focus ring (the header isolates it)
	zIndex: -1,
	left: 0,
	top: 0,
	bottom: 0,
	alignItems: "center",
	justifyContent: "center",
	display: "flex",
	backgroundColor: "rgba(0,0,0,.2)",
	width: theme.spacing(6),
}));

const AccordionDetailsStyled = styled(AccordionDetails, {
	name: "CcInfoBox",
	slot: "details",
})(({ theme }) => ({
	border: "1px solid grey",
	borderRadius: `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
	padding: "8px 24px",
	whiteSpace: "pre-line",
	// a word wider than the panel (a long compound, a file name or a URL on a
	// phone) breaks inside, so it stays in the box, which clips its content,
	// also where the box sits in a flex row or a grid cell
	overflowWrap: "anywhere",
}));

const DetailsText = styled("div", { name: "CcInfoBox", slot: "detailsText" })(
	{},
);

/**
 * Keys of the theme's `components.CcInfoBox.styleOverrides`, also the keys of
 * the `classes` prop:
 * - `root`: the MUI `Accordion` around everything
 * - `summary`: the header, filled with the status color: the toggle button
 *   (`AccordionSummary`), or, while `alwaysExpanded` is `true`, a static
 *   `<span>` that looks the same, without MUI's `MuiAccordionSummary-*` and
 *   `MuiButtonBase-root` classes
 * - `summaryRoot`: the header content, the icon column and the heading. It
 *   has `min-width: 0`, as has MUI's content wrapper around it, so it never
 *   grows wider than the header
 * - `iconButton`: the column with the status icon at the header's left edge
 * - `heading`: the heading `Typography`. It sets `overflow-wrap: anywhere`,
 *   so a word wider than the header breaks inside it
 * - `statusName`: the visually hidden status name read before the heading
 * - `details`: the bordered message panel (`AccordionDetails`). It sets
 *   `white-space: pre-line` and `overflow-wrap: anywhere`, which the message
 *   inherits
 * - `detailsText`: the `<div>` around `message`
 *
 * No slot receives an `ownerState`, and the theme has no `variants` for
 * InfoBox: a function override is called with the theme. The props are state
 * classes on the root and on the header instead: `CcInfoBox-statusInfo`
 * (`status` `info` or not set), `CcInfoBox-statusWarning`,
 * `CcInfoBox-statusSuccess` or `CcInfoBox-statusError`, and
 * `CcInfoBox-alwaysExpanded` while `alwaysExpanded` is `true`; an open box
 * also has MUI's `Mui-expanded` there. A theme styles a state with a
 * selector, e.g. `summary: { "&.CcInfoBox-statusError": { … } }`, or reaches
 * the other slots from the root, e.g.
 * `root: { "&.CcInfoBox-statusError .MuiAccordionDetails-root": { … } }`.
 *
 * A header background set for a status class stays while the header has
 * keyboard focus. One set for the header alone
 * (`summary: { backgroundColor }`) replaces the status colors, but the
 * focused header (`Mui-focusVisible`) shows the status color unless the
 * theme sets the background for `"&.Mui-focusVisible"` too.
 */
export type InfoBoxClassKey =
	| "root"
	| "summary"
	| "summaryRoot"
	| "iconButton"
	| "heading"
	/** The visually hidden status name read before the heading */
	| "statusName"
	| "details"
	| "detailsText";

export interface InfoBoxProps {
	/**
	 * Title of the info box, shown in the header: text, or any node that may
	 * stand inside a button, such as a `<Trans>` element or text with
	 * emphasis. The whole header is a button, which must not hold a link or
	 * another control (assistive technology reads its content as plain
	 * text): put those into `message`. It names the header button, so it
	 * must not be empty (`""`, `null`, `undefined`).
	 * For a `warning`, `success` or `error` status the translated status is
	 * read before it (e.g. "Warning: Please review"), so don't repeat the
	 * status here.
	 *
	 * The heading wraps at spaces. A word wider than the header, such as a
	 * long compound, a file name or a URL, breaks between any two characters,
	 * so it stays inside the box on a phone. Content that cannot wrap (e.g. an
	 * element with `white-space: nowrap`) runs past the header's end and is
	 * cut off there.
	 */
	heading: React.ReactNode;
	/**
	 * Controlled expanded state, like MUI Accordion's `expanded`: `true`
	 * shows the message, `false` shows only the header. The box shows this
	 * value and follows every change of it. A click on the header does not
	 * change it by itself: it calls `onChange` with the requested state, so
	 * pass that back (`onChange={(_, next) => setOpen(next)}`) to let the
	 * user toggle the box.
	 *
	 * Leave it unset (`undefined`) for a box the user toggles on its own,
	 * starting at `defaultExpanded`. Decide at mount: switching between set
	 * and unset later logs a MUI error in development; a value set later is
	 * ignored, and removing the value closes the box.
	 * While `alwaysExpanded` is `true` the box is open whatever this says.
	 */
	expanded?: boolean;
	/**
	 * Initial expanded state of a box without `expanded` (uncontrolled), like
	 * MUI Accordion's `defaultExpanded`: `true` shows the message, `false`
	 * only the header, until the user toggles it. Read once at mount: a later
	 * change is ignored and logs a MUI error in development. Ignored while
	 * `expanded` is set.
	 * @default false
	 */
	defaultExpanded?: boolean;
	/**
	 * `true` keeps the box open: the message is shown and the user cannot
	 * collapse it. The header is static then: the heading, still the box's
	 * `<h3>`, without a toggle button, so it has no `aria-expanded`, is no
	 * tab stop, its text can be selected and copied, and a click on it calls
	 * no `onChange`. For a box the user may close, pass `expanded` with
	 * `onChange`, or `defaultExpanded`, instead.
	 *
	 * `false` is the same as not set: the box shows `expanded`, or, without
	 * it, the user opens and closes it starting at `defaultExpanded`, so a
	 * condition can be passed directly (`alwaysExpanded={isLocked}`). A
	 * change after mount takes effect: once it is no longer `true`, the box
	 * shows `expanded`, or, without it, the state the user last toggled to
	 * (initially `defaultExpanded`), and the user can toggle it again. A
	 * header that has keyboard focus when it changes passes the focus on to
	 * the header that replaces it.
	 * While it is `true`, the root and the header have the class
	 * `CcInfoBox-alwaysExpanded`.
	 * @default false
	 */
	alwaysExpanded?: boolean;
	/**
	 * The message inside the info box: text or any node. It wraps at spaces.
	 * A word wider than the panel, such as a long compound, a file name or a
	 * URL, breaks between any two characters, so it stays inside the box on a
	 * phone, also where the box sits in a flex row or a grid cell. A `"\n"` in
	 * text starts a new line (the panel has `white-space: pre-line`). Both
	 * rules are inherited by nested elements.
	 */
	message: React.ReactNode;
	/**
	 * Called when the user toggles the header (a click, or Enter or Space on
	 * it), with the requested expanded state. Not called when `expanded`
	 * changes. With `expanded` set, the box changes only once that new state
	 * is passed back into `expanded`. Never called while `alwaysExpanded` is
	 * `true`: the header is static then.
	 * @param event The click event
	 * @param expanded The requested expanded state: `true` to open the box
	 */
	onChange?: AccordionProps["onChange"];
	/**
	 * Typography variant of the heading: any variant MUI's `Typography`
	 * takes, including `"inherit"` and the variants a theme adds through
	 * `TypographyPropsVariantOverrides`.
	 * @default "caption"
	 */
	headingVariant?: TypographyProps["variant"];
	/**
	 * custom class name to apply to root
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<InfoBoxClassKey, string>>;
	/**
	 * For which status InfoBox used. It sets the header's color, which stays
	 * while the header has keyboard focus; the focused header shows a 2px
	 * ring in its text color, 2px inside its edges. `warning`, `success` and
	 * `error` also put the translated status in front of the heading, read
	 * out with it (e.g. "Warning: Please review"), so the status is not
	 * conveyed by color and icon alone. `info` and an unset status announce
	 * nothing: they are the neutral default.
	 *
	 * The root and the header have the state class of the status:
	 * `CcInfoBox-statusInfo` (also while it is not set),
	 * `CcInfoBox-statusWarning`, `CcInfoBox-statusSuccess` or
	 * `CcInfoBox-statusError`.
	 */
	status?: "info" | "warning" | "success" | "error";
}

/**
 * The translated name of a status for the header, with the separator the
 * translation carries (so a locale can set it). `undefined` for `info` and an
 * unset status: they are the neutral default, so announcing "Info" on every
 * notice would only add noise.
 * @param status The `status` prop
 * @param t The library's translate function
 * @returns The status name and separator, or `undefined` when the status is
 * not announced
 */
const statusName = (
	status: InfoBoxProps["status"],
	t: (key: string, options: { defaultValue: string }) => string,
) => {
	switch (status) {
		case "warning":
			return t("standalone.info-box.status.warning", {
				defaultValue: "Warning:",
			});
		case "success":
			return t("standalone.info-box.status.success", {
				defaultValue: "Success:",
			});
		case "error":
			return t("standalone.info-box.status.error", {
				defaultValue: "Error:",
			});
		default:
			return undefined;
	}
};

const InfoBox = (inProps: InfoBoxProps) => {
	const props = useThemeProps({ props: inProps, name: "CcInfoBox" });
	const {
		heading,
		onChange,
		expanded: expandedProp,
		defaultExpanded = false,
		alwaysExpanded,
		message,
		status,
		headingVariant,
		className,
		classes,
	} = props;

	const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
	// The header announces the status in front of the heading, so a screen
	// reader gets what sighted users read from the color and the icon.
	const statusLabel = statusName(status, t);

	const getIcon = useCallback(() => {
		switch (status) {
			case "warning":
				return <ReportProblemOutlined />;
			case "success":
				return <TaskAlt />;
			case "error":
				return <ErrorOutlined />;
			default:
				return <InfoOutlined />;
		}
	}, [status]);

	// `expanded` when set, otherwise the state the user toggles, starting at
	// `defaultExpanded`. The Accordion is always controlled, with a boolean,
	// so `alwaysExpanded` can change after mount, and `expanded` can be
	// removed, without switching it between controlled and uncontrolled.
	const [expanded, setExpanded] = useControlled({
		controlled: expandedProp,
		default: defaultExpanded,
		name: "InfoBox",
		state: "expanded",
	});
	// the state classes of the root and the header, see InfoBoxClassKey
	const stateClasses = combineClassNames([
		STATUS_CLASSES[status ?? "info"],
		alwaysExpanded && ALWAYS_EXPANDED_CLASS,
	]);

	const handleChange = useCallback(
		(event: React.SyntheticEvent, newExpanded: boolean) => {
			setExpanded(newExpanded);
			onChange?.(event, newExpanded);
		},
		[onChange, setExpanded],
	);

	// The header that has keyboard focus keeps it when alwaysExpanded replaces
	// the toggle with the static header, or back: the header that unmounts
	// notes that it had focus, the one that mounts takes it.
	const headerElement = useRef<HTMLElement | null>(null);
	const headerHadFocus = useRef(false);
	const headerRef = useCallback((element: HTMLElement | null) => {
		if (element) {
			headerElement.current = element;
			if (headerHadFocus.current) {
				headerHadFocus.current = false;
				element.focus();
			}
			return;
		}
		const previous = headerElement.current;
		headerHadFocus.current =
			!!previous && previous.contains(previous.ownerDocument.activeElement);
		headerElement.current = null;
	}, []);

	const headerClassName = combineClassNames([classes?.summary, stateClasses]);
	const headerContent = (
		<SummaryRoot className={classes?.summaryRoot}>
			<SpanIconButton className={classes?.iconButton}>
				{getIcon()}
			</SpanIconButton>
			<SummaryHeading
				variant={headingVariant ?? "caption"}
				className={classes?.heading}
			>
				{statusLabel && (
					<>
						<StatusName className={classes?.statusName}>
							{statusLabel}
						</StatusName>{" "}
					</>
				)}
				{heading}
			</SummaryHeading>
		</SummaryRoot>
	);

	return (
		<AccordionStyled
			className={combineClassNames([className, classes?.root, stateClasses])}
			// opening the box keeps the header at 48px and adds no margin around
			// the box, where MUI's gutters grow both
			disableGutters
			expanded={!!alwaysExpanded || !!expanded}
			onChange={handleChange}
		>
			{alwaysExpanded ? (
				// a forced box has nothing to toggle: its header is no button
				<StaticHeader
					ref={headerRef}
					tabIndex={-1}
					// MUI's state class of an open header, as the toggle has it
					className={combineClassNames([
						headerClassName,
						accordionSummaryClasses.expanded,
					])}
				>
					{headerContent}
				</StaticHeader>
			) : (
				<AccordionSummaryStyled ref={headerRef} className={headerClassName}>
					{headerContent}
				</AccordionSummaryStyled>
			)}
			<AccordionDetailsStyled className={classes?.details}>
				<DetailsText className={classes?.detailsText}>{message}</DetailsText>
			</AccordionDetailsStyled>
		</AccordionStyled>
	);
};

export default React.memo(InfoBox);
