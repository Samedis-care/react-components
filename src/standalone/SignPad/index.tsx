import React, { useCallback } from "react";
import { makeStyles, InputAdornment, IconButton } from "@material-ui/core";
import { SignIcon } from "../../standalone";
import { Info as InfoIcon } from "@material-ui/icons";
import ccI18n from "../../i18n";
export interface SignPadProps {
	/**
	 * Boolean flag to disable edit signature
	 */
	disabled: boolean;
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
}

const useStyles = makeStyles((theme) => ({
	signPadDiv: {
		position: "relative",
		cursor: "pointer",
		borderBottom: "1px dotted",
		height: 150,
		width: 400,
		color: theme.palette.grey[700],
		display: "inline-block",
		backgroundColor: theme.palette.background.paper,
	},
	textDiv: {
		position: "absolute",
		display: "inline-block",
		bottom: 0,
		left: 5,
	},
	imageDiv: {
		display: "inline-block",
		margin: "0px 20px",
	},
	signText: {
		display: "inline-block",
		marginLeft: 10,
		position: "fixed",
		color: theme.palette.text.secondary,
	},
	infoDiv: {
		position: "absolute",
		right: 5,
		bottom: 20,
	},
}));
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
			<div className={classes.textDiv}>
				<SignIcon color={disabled ? "disabled" : "primary"} />
				{signature ? (
					<div className={classes.imageDiv}>
						<img src={signature} />
					</div>
				) : (
					<span className={classes.signText}>
						{ccI18n.t("standalone.signature-pad.sign-here")}
					</span>
				)}
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
