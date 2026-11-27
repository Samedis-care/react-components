import { Dialog, dialogClasses, styled } from "@mui/material";

/**
 * MUI's Dialog whose paper keeps its edge in forced-colors mode (Windows High
 * Contrast): a 1px `CanvasText` border, drawn there only. Forced colors drop
 * the paper's shadow, which otherwise is all that sets the dialog apart from
 * the page behind the backdrop.
 *
 * Takes MUI's Dialog props.
 */
const ForcedColorsEdgeDialog = styled(Dialog)({
	[`& .${dialogClasses.paper}`]: {
		"@media (forced-colors: active)": {
			border: "1px solid CanvasText",
		},
	},
});

export default ForcedColorsEdgeDialog;
