import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { matrixClasses } from "./matrixClasses";
export const MatrixTileCornerRoot = styled("div", {
    name: "CcMatrixCellTile",
    slot: "corner",
})({
    position: "absolute",
    display: "flex",
    alignItems: "center",
    [`&.${matrixClasses.cornerTopLeft}`]: { top: 1, left: 1 },
    [`&.${matrixClasses.cornerTopRight}`]: { top: 1, right: 1 },
    [`&.${matrixClasses.cornerBottomLeft}`]: { bottom: 1, left: 1 },
    [`&.${matrixClasses.cornerBottomRight}`]: { bottom: 1, right: 1 },
});
const CORNER_CLASS = {
    topLeft: matrixClasses.cornerTopLeft,
    topRight: matrixClasses.cornerTopRight,
    bottomLeft: matrixClasses.cornerBottomLeft,
    bottomRight: matrixClasses.cornerBottomRight,
};
const ALL_CORNERS = [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight",
];
const MatrixTileCorners = (props) => {
    const { corners } = props.item;
    if (!corners)
        return null;
    return (_jsx(_Fragment, { children: (props.only ?? ALL_CORNERS).map((corner) => corners[corner] ? (_jsx(MatrixTileCornerRoot, { className: combineClassNames([
                props.className,
                CORNER_CLASS[corner],
            ]), children: corners[corner] }, corner)) : null) }));
};
export default React.memo(MatrixTileCorners);
