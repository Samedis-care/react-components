import React, { useCallback } from "react";
import { makeStyles, InputAdornment, IconButton } from "@material-ui/core";
import { SignIcon } from "../../standalone";
import { Info as InfoIcon } from "@material-ui/icons";
import ccI18n from "../../i18n";
export interface SignPadProps {
	/**
	 * Boolean flag to disable edit signature
	 */
	disabled?: boolean;
	/**
	 * The base64 string of signature
	 */
	signature: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
	/**
	 * Open info dialog
	 */
	openInfo?: () => void;
	/**
	 * Open sign pad
	 */
	openSignPad?: () => void;
	/**
	 * Blur event
	 */
	onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

const useStyles = makeStyles(
	(theme) => ({
		signPadDiv: {
			position: "relative",
			cursor: "pointer",
			borderBottom: "1px dotted",
			height: "100%",
			width: "100%",
			minHeight: "100px",
			color: theme.palette.grey[700],
			display: "inline-block",
			backgroundColor: theme.palette.action.hover,
		},
		imageDiv: {
			height: `calc(100% - ${theme.spacing(2)}px)`,
			width: `calc(100% - ${theme.spacing(2)}px)`,
		},
		signPreview: {
			height: "100%",
			width: "100%",
		},
		signTextDiv: {
			position: "absolute",
			left: 5,
			bottom: 5,
			alignItems: "center",
			display: "flex",
			color: theme.palette.text.secondary,
		},
		infoDiv: {
			position: "absolute",
			right: 5,
			bottom: 20,
		},
	}),
	{ name: "CcSignPad" }
);
const SignPad = (props: SignPadProps) => {
	const { signature, disabled, openInfo, openSignPad } = props;
	const classes = useStyles(props);
	const handelOpenInfo = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			if (openInfo) openInfo();
		},
		[openInfo]
	);
	return (
		<div className={classes.signPadDiv} onClick={openSignPad}>
			<div className={classes.signTextDiv}>
				<SignIcon color={disabled ? "disabled" : "primary"} />
				{!signature && (
					<span>{ccI18n.t("standalone.signature-pad.sign-here")}</span>
				)}
			</div>
			<div className={classes.imageDiv}>
				{signature && <img className={classes.signPreview} src={signature} />}
			</div>
			<div className={classes.infoDiv}>
				{openInfo && (
					<InputAdornment position={"end"}>
						<IconButton onClick={handelOpenInfo}>
							<InfoIcon color={"disabled"} />
						</IconButton>
					</InputAdornment>
				)}
			</div>
		</div>
	);
};
export default React.memo(SignPad);
