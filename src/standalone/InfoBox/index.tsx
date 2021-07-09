import React, { useCallback } from "react";
import {
	ErrorOutlined,
	InfoOutlined,
	ReportProblemOutlined,
} from "@material-ui/icons";
import {
	makeStyles,
	Theme,
	Accordion,
	AccordionSummary as MuiAccordionSummary,
	AccordionDetails,
	Typography,
	withStyles,
	AccordionProps,
} from "@material-ui/core";
import SuccessOutlinedIcon from "../Icons/SuccessOutlinedIcon";

const AccordionSummary = withStyles({
	root: {
		minHeight: 48,
		"&$expanded": {
			minHeight: 48,
		},
	},
	content: {
		"&$expanded": {
			margin: "12px 0",
		},
	},
	expanded: {},
})(MuiAccordionSummary);

export const useStyles = makeStyles(
	(theme: Theme) => ({
		noShadow: {
			"box-shadow": "none",
		},
		panelDetails: {
			border: "1px solid grey",
			borderRadius: "0px 0px 4px 4px",
			padding: "8px 24px",
		},
		root: {
			margin: 0,
			paddingLeft: theme.spacing(5),
		},
		iconButton: {
			position: "absolute",
			left: 0,
			top: 0,
			bottom: 0,
			alignItems: "center",
			justifyContent: "center",
			display: "flex",
			backgroundColor: "rgba(0,0,0,.2)",
			width: theme.spacing(6),
		},
		accordionPrimary: {
			backgroundColor: theme.palette.primary.main,
			borderColor: theme.palette.primary.main,
			color: theme.palette.getContrastText(theme.palette.primary.main),
		},
		accordionWarning: {
			backgroundColor: theme.palette.warning.main,
			borderColor: theme.palette.warning.main,
			color: theme.palette.getContrastText(theme.palette.warning.main),
		},
		accordionSuccess: {
			backgroundColor: theme.palette.success.main,
			borderColor: theme.palette.success.main,
			color: theme.palette.getContrastText(theme.palette.success.main),
		},
		accordionError: {
			backgroundColor: theme.palette.error.main,
			borderColor: theme.palette.error.main,
			color: theme.palette.getContrastText(theme.palette.error.main),
		},
	}),
	{ name: "CcInfoBox" }
);

interface InfoBoxProps {
	/**
	 * Title of the info box
	 */
	heading: string;
	/**
	 * Is the info box expanded by default
	 */
	expanded: boolean;
	/**
	 * Is the InfoBox force expanded or force collapsed?
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
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
	/**
	 * For which status InfoBox used
	 */
	status?: "info" | "warning" | "success" | "error";
}
// .MuiAccordionSummary-content.Mui-expanded => margin => unset
// .MuiAccordionSummary-root.Mui-expanded => min-height => unset
const InfoBox = (props: InfoBoxProps) => {
	const {
		heading,
		onChange,
		expanded,
		alwaysExpanded,
		message,
		status,
	} = props;

	const classes = useStyles(props);

	const getIcon = useCallback(() => {
		switch (status) {
			case "warning":
				return <ReportProblemOutlined />;
			case "success":
				return <SuccessOutlinedIcon />;
			case "error":
				return <ErrorOutlined />;
			default:
				return <InfoOutlined />;
		}
	}, [status]);

	const getAccordionClass = useCallback(() => {
		switch (status) {
			case "warning":
				return classes.accordionWarning;
			case "success":
				return classes.accordionSuccess;
			case "error":
				return classes.accordionError;
			default:
				return classes.accordionPrimary;
		}
	}, [classes, status]);

	return (
		<Accordion
			className={classes.noShadow}
			defaultExpanded={expanded}
			expanded={alwaysExpanded}
			onChange={onChange}
		>
			<AccordionSummary className={getAccordionClass()}>
				<div className={classes.root}>
					<span className={classes.iconButton}>{getIcon()}</span>
					<Typography variant="caption">{heading}</Typography>
				</div>
			</AccordionSummary>
			<AccordionDetails className={classes.panelDetails}>
				<div>{message}</div>
			</AccordionDetails>
		</Accordion>
	);
};

export default React.memo(InfoBox);
