import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
import DialogContextProvider from "../../framework/DialogContextProvider";
import SignaturePadCanvas from "./SignaturePad";
import { setFrameworkHistory } from "../../framework/History";
import { createMemoryHistory } from "history";

setFrameworkHistory(createMemoryHistory());

const DialogDecorator = (Story: React.ComponentType) => (
	<DialogContextProvider>
		<Story />
	</DialogContextProvider>
);

const meta: Meta = {
	title: "non-standalone/SignaturePad",
	decorators: [DialogDecorator],
	parameters: { layout: "centered" },
};

export default meta;

// ─── Empty pad ───────────────────────────────────────────────────────────────

const EmptyPadDemo = () => {
	const [signature, setSignature] = useState("");
	return (
		<Box sx={{ width: 400, height: 200 }}>
			<Typography variant="subtitle2" gutterBottom>
				Click the pad to sign
			</Typography>
			<SignaturePadCanvas signature={signature} setSignature={setSignature} />
		</Box>
	);
};

export const EmptyPad: StoryObj = {
	render: () => <EmptyPadDemo />,
};

// ─── With existing signature ─────────────────────────────────────────────────

// A small transparent PNG as placeholder signature
const SAMPLE_SIGNATURE =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYV2P8z8BQz0BBwMgwqpBiSwEACJkFC4MpBzEAAAAASUVORK5CYII=";

const ExistingSignatureDemo = () => {
	const [signature, setSignature] = useState(SAMPLE_SIGNATURE);
	const handleSetSignature = useCallback((url: string) => {
		setSignature(url);
	}, []);
	return (
		<Box sx={{ width: 400, height: 200 }}>
			<Typography variant="subtitle2" gutterBottom>
				Pad with existing signature
			</Typography>
			<SignaturePadCanvas
				signature={signature}
				setSignature={handleSetSignature}
				signerName="John Doe"
			/>
		</Box>
	);
};

export const WithExistingSignature: StoryObj = {
	render: () => <ExistingSignatureDemo />,
};

// ─── Disabled pad ────────────────────────────────────────────────────────────

const DisabledPadDemo = () => (
	<Box sx={{ width: 400, height: 200 }}>
		<Typography variant="subtitle2" gutterBottom>
			Disabled signature pad
		</Typography>
		<SignaturePadCanvas signature="" disabled />
	</Box>
);

export const DisabledPad: StoryObj = {
	render: () => <DisabledPadDemo />,
};
