import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { matrixClasses } from "./matrixClasses";
import { highlightRing } from "./matrixTints";
import { MatrixCellTilePropsContext, } from "./MatrixCellTileContext";
import MatrixTileItem from "./MatrixTileItem";
import MatrixTileDiagonalPair from "./MatrixTileDiagonalPair";
import MatrixTileOverflow from "./MatrixTileOverflow";
export const MatrixCellTileRoot = styled("div", {
    name: "CcMatrixCellTile",
    slot: "root",
})({
    // the "+N" marker is placed in it
    position: "relative",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    padding: 2,
    display: "flex",
    flexDirection: "row",
    gap: 2,
    [`&.${matrixClasses.directionColumn}`]: { flexDirection: "column" },
});
/**
 * The attention ring around a highlighted entry (see highlightRing).
 */
export const MatrixTileHighlight = styled("div", {
    name: "CcMatrixCellTile",
    slot: "highlight",
})(({ theme }) => ({
    width: "100%",
    height: "100%",
    borderRadius: theme.shape.borderRadius,
    ...highlightRing(theme),
}));
export const MatrixTilePlaceholder = styled("div", {
    name: "CcMatrixCellTile",
    slot: "placeholder",
})(({ theme }) => ({
    width: "100%",
    height: "100%",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.action.hover,
    display: "flex",
    alignItems: "flex-end",
    padding: 2,
    boxSizing: "border-box",
}));
const MatrixCellTile = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMatrixCellTile" });
    const { items, pairLayout = "split", splitDirection = "row", placeholder, onItemClick, renderItem, className, classes, } = props;
    // A plain function on purpose: this is called while rendering, never passed
    // to a memoized child, so a useCallback around it would buy nothing.
    const wrap = (item, node, ringed = !!item.highlighted) => {
        const highlighted = ringed ? (_jsx(MatrixTileHighlight, { className: classes?.highlight, children: node })) : (node);
        return renderItem ? renderItem(item, highlighted) : highlighted;
    };
    let content;
    if (items.length === 0) {
        // != null, not truthiness: 0 is a placeholder a consumer may well pass
        content =
            placeholder != null ? (_jsx(MatrixTilePlaceholder, { className: classes?.placeholder, children: placeholder })) : null;
    }
    else if (items.length === 1 || pairLayout === "split") {
        const stacked = items.length > 1 && splitDirection === "column";
        content = items
            .slice(0, 2)
            .map((item) => (_jsx(React.Fragment, { children: wrap(item, _jsx(MatrixTileItem, { item: item, stacked: stacked })) }, item.key)));
    }
    else {
        // One box: one ring if either entry is highlighted, and one renderItem
        // call, as the first entry (the one a click on the pair reports)
        content = wrap(items[0], _jsx(MatrixTileDiagonalPair, { a: items[0], b: items[1] }), !!(items[0].highlighted || items[1].highlighted));
    }
    // The entries the tile has no room for, drawn as one "+N" marker
    const leftOut = useMemo(() => items.slice(2), [items]);
    // Only what an entry reads, so a consumer mapping its items fresh on every
    // render (the normal case) does not invalidate this and re-render them.
    const context = useMemo(() => ({ onItemClick, classes }), [onItemClick, classes]);
    return (_jsx(MatrixCellTilePropsContext.Provider, { value: context, children: _jsxs(MatrixCellTileRoot, { className: combineClassNames([
                className,
                classes?.root,
                splitDirection === "column" && matrixClasses.directionColumn,
            ]), children: [content, leftOut.length > 0 && _jsx(MatrixTileOverflow, { items: leftOut })] }) }));
};
export default React.memo(MatrixCellTile);
