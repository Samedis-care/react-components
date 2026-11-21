import { styled } from "@mui/material";

/**
 * An element that draws no box (display: contents), for the grid structure the
 * CSS grid cannot carry itself: a row around the cells of a row, and a header
 * or cell around a part that is a button. Its children stay items of the CSS
 * grid, so the layout and the sticky headers are unchanged.
 */
const MatrixContents = styled("div")({
	display: "contents",
});

export default MatrixContents;
