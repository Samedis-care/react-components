import React, { useCallback } from "react";
import {
	IconButton,
	InputAdornment,
	styled,
	useThemeProps,
} from "@mui/material";
import { SignIcon } from "../../standalone";
import { Info as InfoIcon } from "@mui/icons-material";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";

export interface SignPadProps {
	/**
	 * Shows the tile as disabled: greys the pen icon and marks its button
	 * `aria-disabled`, so assistive technology announces it as unavailable.
	 * The button stays focusable, so a focused tile that gets disabled keeps
	 * the focus. Default `false`.
	 */
	disabled?: boolean;
	/**
	 * The base64 string of signature, null while unsigned
	 */
	signature: string | null;
	/**
	 * Name of the signer, trimmed; blank means unknown. The tile does not show
	 * it, but adds it to the name its button has for assistive technology,
	 * e.g. "Signature (Alice Müller)". SignaturePad also shows it in the
	 * dialog title.
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
	 * Called with the click event when the tile is clicked anywhere except on
	 * the info button, and when its button is activated by keyboard (Enter or
	 * Space). The button keeps the focus, so a dialog opened from here returns
	 * focus to the tile when it closes.
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

// the tile's activator: fills the tile and resets the native button look,
// the tile itself draws the field
const SignPadButton = styled("button", { name: "CcSignPad", slot: "button" })(
	({ theme }) => ({
		// flex, not block: a block button centers its content vertically
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
		minHeight: "inherit",
		margin: 0,
		padding: 0,
		border: 0,
		appearance: "none",
		background: "none",
		color: "inherit",
		// a button does not inherit text styles by default
		font: "inherit",
		letterSpacing: "inherit",
		wordSpacing: "inherit",
		textTransform: "inherit",
		textAlign: "inherit",
		cursor: "inherit",
		"&:focus-visible": {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
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
	"root" | "button" | "signTextDiv" | "imageDiv" | "signPreview" | "infoDiv";

const SignPad = (inProps: SignPadProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSignPad" });
	const {
		signature,
		signerName: signerNameUntrim,
		disabled,
		openInfo,
		openSignPad,
		className,
		classes,
	} = props;
	const { t } = useCCTranslations();
	const signerName = signerNameUntrim?.trim();
	const prompt = t("standalone.signature-pad.sign-here");
	// what the tile holds (it starts with the visible prompt while unsigned),
	// then whose signature it is
	const state = signature
		? t("standalone.signature-pad.dialog.signature")
		: prompt;
	const label = signerName
		? t("standalone.signature-pad.with-signer", {
				LABEL: state,
				NAME: signerName,
			})
		: state;
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
			// also gets the button's clicks, Enter and Space included
			onClick={openSignPad}
		>
			<SignPadButton
				type="button"
				aria-label={label}
				// not the native disabled: that drops the focus of a focused tile
				// to the page, and takes read-only signatures out of the Tab order
				aria-disabled={disabled || undefined}
				className={classes?.button}
			>
				<SignTextDiv className={classes?.signTextDiv}>
					<SignIcon color={disabled ? "disabled" : "primary"} />
					{!signature && <span>{prompt}</span>}
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
			</SignPadButton>
			<InfoDiv className={classes?.infoDiv}>
				{openInfo && (
					<InputAdornment position={"end"}>
						<IconButton
							onClick={handelOpenInfo}
							size="large"
							aria-label={t("standalone.uikit.info")}
						>
							<InfoIcon color={"disabled"} />
						</IconButton>
					</InputAdornment>
				)}
			</InfoDiv>
		</SignPadDiv>
	);
};
export default React.memo(SignPad);
