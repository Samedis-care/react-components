import React, { useCallback, useState } from "react";
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
	 * Initial expanded state, read once at mount: `true` shows the message,
	 * `false` shows only the header until the user opens it. Later changes
	 * are ignored. While `alwaysExpanded` is `true` the box is open whatever
	 * this says.
	 */
	expanded: boolean;
	/**
	 * `true` keeps the box open: the message is shown and the user cannot
	 * collapse it. `false` is the same as not set: the box starts as
	 * `expanded` says and the user opens and closes it, so a condition can be
	 * passed directly (`alwaysExpanded={isLocked}`). A change after mount
	 * takes effect: once it is no longer `true`, the box shows the state the
	 * user last toggled to (initially `expanded`), and the user can toggle it
	 * again.
	 * @default false
	 */
	alwaysExpanded?: boolean;
	/**
	 * The message inside the info box
	 */
	message: React.ReactNode;
	/**
	 * Change event fired upon expansion/retraction of the info box
	 * @param event The change event
	 * @param expanded The new expanded state
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
		expanded,
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

	// The state the user toggles, starting at `expanded`. The Accordion is
	// always controlled, so `alwaysExpanded` can change after mount without
	// switching it between controlled and uncontrolled.
	const [userExpanded, setUserExpanded] = useState(expanded);
	const handleChange = useCallback(
		(event: React.SyntheticEvent, newExpanded: boolean) => {
			setUserExpanded(newExpanded);
			onChange?.(event, newExpanded);
		},
		[onChange],
	);

	return (
		<AccordionStyled
			className={combineClassNames([className, classes?.root])}
			expanded={!!alwaysExpanded || userExpanded}
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
