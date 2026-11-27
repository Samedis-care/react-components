/**
 * MUI's Dialog whose paper keeps its edge in forced-colors mode (Windows High
 * Contrast): a 1px `CanvasText` border, drawn there only. Forced colors drop
 * the paper's shadow, which otherwise is all that sets the dialog apart from
 * the page behind the backdrop.
 *
 * Takes MUI's Dialog props.
 */
declare const ForcedColorsEdgeDialog: import("@emotion/styled").StyledComponent<import("@mui/material").DialogProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export default ForcedColorsEdgeDialog;
