import React, { useCallback } from "react";
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
	Typography,
	useThemeProps,
} from "@mui/material";
import { useControlled } from "@mui/material/utils";
import { TypographyVariant } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import combineClassNames from "../../utils/combineClassNames";
import ccI18n from "../../i18n";

/**
 * InfoBox never suspended, and the status it reads out is only heard: while
 * the translations load it uses the English defaults, then re-renders, like the
 * Loader's non-suspending options
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };

const AccordionStyled = styled(Accordion, { name: "CcInfoBox", slot: "root" })({
	boxShadow: "none",
	"&.MuiAccordion-rounded": {
		overflow: "hidden",
	},
});

/**
 * The header's colors for one status. A keyboard-focused header
 * (`Mui-focusVisible`) keeps them, where MUI's AccordionSummary would replace
 * the background with `palette.action.focus`, and shows a 2px outline in the
 * text color, 2px inside its edges: the text color contrasts with the status
 * color as the heading does (`palette.primary.main` would vanish on the info
 * header), the status color around it sets it off from the page, the root's
 * `overflow: hidden` cannot clip it, and forced colors keep outlines. It also
 * replaces the ring of the theme's `focusVisible` option, which the root
 * would clip.
 * @param color The palette color of the status
 * @returns The header's color styles
 */
const headerColors = (color: PaletteColor): CSSObject => ({
	backgroundColor: color.main,
	borderColor: color.main,
	color: color.contrastText,
	[`&.${accordionSummaryClasses.focusVisible}`]: {
		backgroundColor: color.main,
		outline: "2px solid currentColor",
		outlineOffset: -4,
	},
});

export interface InfoBoxSummaryOwnerState {
	status?: "info" | "warning" | "success" | "error";
	alwaysExpanded: boolean;
}
const AccordionSummaryStyled = styled(AccordionSummary, {
	name: "CcInfoBox",
	slot: "summary",
})<{ ownerState: InfoBoxSummaryOwnerState }>(
	({ theme, ownerState: { status, alwaysExpanded } }) => ({
		// a stacking context for the icon column (zIndex -1), so the focus ring
		// is drawn over the column instead of under its shade
		isolation: "isolate",
		minHeight: 48,
		"&.Mui-expanded": {
			minHeight: 48,
		},
		"&.MuiAccordionSummary-content": {
			"&.Mui-expanded": {
				margin: "12px 0",
			},
		},
		...(alwaysExpanded && {
			cursor: "default",
			"&:hover:not(.Mui-disabled)": {
				cursor: "default",
			},
		}),

		...((status == null || status === "info") &&
			headerColors(theme.palette.primary)),
		...(status === "error" && headerColors(theme.palette.error)),
		...(status === "warning" && headerColors(theme.palette.warning)),
		...(status === "success" && headerColors(theme.palette.success)),
	}),
);

const SummaryRoot = styled("div", { name: "CcInfoBox", slot: "summaryRoot" })(
	({ theme }) => ({
		margin: 0,
		paddingLeft: theme.spacing(5),
	}),
);

const SummaryHeading = styled(Typography, {
	name: "CcInfoBox",
	slot: "heading",
})({});

/**
 * The status name in front of the heading, with the separator the translation
 * carries. It is only read out and visually hidden (`statusName` slot): the
 * header announces "Warning: Please review", where the icon and the color
 * would be the only sign of the status.
 */
const StatusName = styled("span", {
	name: "CcInfoBox",
	slot: "statusName",
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
}));

const DetailsText = styled("div", { name: "CcInfoBox", slot: "detailsText" })(
	{},
);

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
	 * Title of the info box. For a `warning`, `success` or `error` status the
	 * translated status is read before it (e.g. "Warning: Please review"), so
	 * don't repeat the status here.
	 */
	heading: string;
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
	 * collapse it. `false` is the same as not set: the box shows `expanded`,
	 * or, without it, the user opens and closes it starting at
	 * `defaultExpanded`, so a condition can be passed directly
	 * (`alwaysExpanded={isLocked}`). A change after mount takes effect: once
	 * it is no longer `true`, the box shows `expanded`, or, without it, the
	 * state the user last toggled to (initially `defaultExpanded`), and the
	 * user can toggle it again.
	 * @default false
	 */
	alwaysExpanded?: boolean;
	/**
	 * The message inside the info box
	 */
	message: React.ReactNode;
	/**
	 * Called when the user toggles the header (a click, or Enter or Space on
	 * it), with the requested expanded state. Not called when `expanded`
	 * changes. With `expanded` set, the box changes only once that new state
	 * is passed back into `expanded`.
	 * @param event The click event
	 * @param expanded The requested expanded state: `true` to open the box
	 */
	onChange?: AccordionProps["onChange"];
	/**
	 * typography variant to use for heading
	 * @default "caption"
	 */
	headingVariant?: TypographyVariant;
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
// .MuiAccordionSummary-content.Mui-expanded => margin => unset
// .MuiAccordionSummary-root.Mui-expanded => min-height => unset
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
	const handleChange = useCallback(
		(event: React.SyntheticEvent, newExpanded: boolean) => {
			setExpanded(newExpanded);
			onChange?.(event, newExpanded);
		},
		[onChange, setExpanded],
	);

	return (
		<AccordionStyled
			className={combineClassNames([className, classes?.root])}
			expanded={!!alwaysExpanded || !!expanded}
			onChange={handleChange}
		>
			<AccordionSummaryStyled
				ownerState={{ status, alwaysExpanded: !!alwaysExpanded }}
				className={classes?.summary}
			>
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
			</AccordionSummaryStyled>
			<AccordionDetailsStyled className={classes?.details}>
				<DetailsText className={classes?.detailsText}>{message}</DetailsText>
			</AccordionDetailsStyled>
		</AccordionStyled>
	);
};

export default React.memo(InfoBox);
