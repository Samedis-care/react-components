import React, { useState } from "react";
import "../../../i18n";
import SignaturePad from "../../../non-standalone/SignaturePad/SignaturePad";
import { select, text, boolean, number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { showInfoDialog } from "../../../non-standalone/Dialog";
import { useDialogContext } from "../../../framework";

export const SignaturePadStory = (): React.ReactElement => {
	const penColor = ["blue", "black", "red", "yellow", "pink"];
	const disabled = boolean("disabled", false);
	const signatureUrl = text("signature URL (base64)", "");
	const getSignature = action("getSignature");
	const [signature, setSignatureURL] = useState(signatureUrl || "");

	const setSignature = (imageUrl: string) => {
		getSignature(imageUrl);
		setSignatureURL(imageUrl);
	};
	const [pushDialog] = useDialogContext();
	const previewHeight = number("Preview height", 100, {
		range: true,
		min: 16,
		max: 4096,
		step: 16,
	});
	const previewWidth = number("Preview width", 250, {
		range: true,
		min: 16,
		max: 4096,
		step: 16,
	});
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");

	return (
		<div style={{ height: previewHeight, width: previewWidth }}>
			<SignaturePad
				penColor={select("Pen Color", penColor, "blue")}
				disabled={disabled}
				setSignature={setSignature}
				signature={signature}
				openInfo={() =>
					showInfoDialog(pushDialog, {
						title: dialogTitle,
						message: (
							<div
								dangerouslySetInnerHTML={{
									__html: infoText,
								}}
							/>
						),
						buttons: [
							{
								text: dialogButtonLabel,
								onClick: dialogButtonClick,
								autoFocus: true,
								color: "primary",
							},
						],
					})
				}
			/>
		</div>
	);
};

SignaturePadStory.storyName = "SignaturePad";
