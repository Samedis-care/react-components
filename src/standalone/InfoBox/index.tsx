import React from "react";
import { Info } from "@material-ui/icons";
import {
	makeStyles,
	Theme,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
} from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
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
}));

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
	message: string;
	/**
	 * Change event fired upon expansion/retraction of the info box
	 * @param event The change event
	 * @param expanded The new expanded state
	 */
	onChange?: (
		event: React.ChangeEvent<Record<string, unknown>>,
		expanded: boolean
	) => void;
}

const InfoBox = (props: InfoBoxProps) => {
	const { heading, onChange, expanded, alwaysExpanded, message } = props;

	const classes = useStyles();

	return (
		<Accordion
			className={classes.noShadow}
			defaultExpanded={expanded}
			expanded={alwaysExpanded}
			onChange={onChange}
		>
			<AccordionSummary className="gx-btn-primary">
				<div className={classes.root}>
					<span className={classes.iconButton}>
						<Info />
					</span>
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
