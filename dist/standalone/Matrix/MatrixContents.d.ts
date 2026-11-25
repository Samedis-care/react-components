/**
 * An element that draws no box (display: contents), for the grid structure the
 * CSS grid cannot carry itself: a row around the cells of a row, and a header
 * or cell around a part that is a button. Its children stay items of the CSS
 * grid, so the layout and the sticky headers are unchanged.
 */
declare const MatrixContents: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export default MatrixContents;
