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
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { useControlled } from "@mui/material/utils";
import combineClassNames from "../../utils/combineClassNames";
import { TypographyVariant } from "@mui/material/styles";

const AccordionStyled = styled(Accordion, { name: "CcInfoBox", slot: "root" })({
	boxShadow: "none",
	"&.MuiAccordion-rounded": {
		overflow: "hidden",
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

		...((status == null || status === "info") && {
			backgroundColor: theme.palette.primary.main,
			borderColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
		}),
		...(status === "error" && {
			backgroundColor: theme.palette.error.main,
			borderColor: theme.palette.error.main,
			color: theme.palette.error.contrastText,
		}),
		...(status === "warning" && {
			backgroundColor: theme.palette.warning.main,
			borderColor: theme.palette.warning.main,
			color: theme.palette.warning.contrastText,
		}),
		...(status === "success" && {
			backgroundColor: theme.palette.success.main,
			borderColor: theme.palette.success.main,
			color: theme.palette.success.contrastText,
		}),
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

const SpanIconButton = styled("span", {
	name: "CcInfoBox",
	slot: "iconButton",
})(({ theme }) => ({
	position: "absolute",
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
	| "details"
	| "detailsText";

export interface InfoBoxProps {
	/**
	 * Title of the info box
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
	 * For which status InfoBox used
	 */
	status?: "info" | "warning" | "success" | "error";
}
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
