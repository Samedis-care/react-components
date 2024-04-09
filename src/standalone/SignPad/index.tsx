import React, { useCallback } from "react";
import {
	InputAdornment,
	IconButton,
	styled,
	useThemeProps,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { SignIcon } from "../../standalone";
import { Info as InfoIcon } from "@mui/icons-material";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";

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
	 * Name of the signer
	 */
	signerName?: string | null;
	/**
	 * custom CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<SignPadClassKey, string>>;
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

const SignPadDiv = styled("div", { name: "CcSignPad", slot: "root" })(
	({ theme }) => ({
		position: "relative",
		cursor: "pointer",
		borderBottom: "1px dotted",
		height: "100%",
		width: "100%",
		minHeight: "100px",
		color: theme.palette.grey[700],
		display: "inline-block",
		backgroundColor: theme.palette.action.hover,
	}),
);

const SignTextDiv = styled("div", { name: "CcSignPad", slot: "signTextDiv" })(
	({ theme }) => ({
		position: "absolute",
		left: 5,
		bottom: 5,
		alignItems: "center",
		display: "flex",
		color: theme.palette.text.secondary,
	}),
);

const ImageDiv = styled("div", { name: "CcSignPad", slot: "imageDiv" })(
	({ theme }) => ({
		height: `calc(100% - ${theme.spacing(2)})`,
		width: `calc(100% - ${theme.spacing(2)})`,
	}),
);

const SignPreview = styled("img", { name: "CcSignPad", slot: "signPreview" })({
	height: "100%",
	width: "100%",
	objectFit: "contain",
});

const InfoDiv = styled("div", { name: "CcSignPad", slot: "infoDiv" })({
	position: "absolute",
	right: 5,
	bottom: 20,
});

export type SignPadClassKey =
	| "root"
	| "signTextDiv"
	| "imageDiv"
	| "signPreview"
	| "infoDiv";

const SignPad = (inProps: SignPadProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSignPad" });
	const { signature, disabled, openInfo, openSignPad, className, classes } =
		props;
	const { t } = useCCTranslations();
	const handelOpenInfo = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			if (openInfo) openInfo();
		},
		[openInfo],
	);
	return (
		<SignPadDiv
			className={combineClassNames([className, classes?.root])}
			onClick={openSignPad}
		>
			<SignTextDiv className={classes?.signTextDiv}>
				<SignIcon color={disabled ? "disabled" : "primary"} />
				{!signature && <span>{t("standalone.signature-pad.sign-here")}</span>}
			</SignTextDiv>
			<ImageDiv className={classes?.imageDiv}>
				{signature && (
					<SignPreview
						className={classes?.signPreview}
						src={signature}
						alt={""}
					/>
				)}
			</ImageDiv>
			<InfoDiv className={classes?.infoDiv}>
				{openInfo && (
					<InputAdornment position={"end"}>
						<IconButton onClick={handelOpenInfo} size="large">
							<InfoIcon color={"disabled"} />
						</IconButton>
					</InputAdornment>
				)}
			</InfoDiv>
		</SignPadDiv>
	);
};
export default React.memo(SignPad);
