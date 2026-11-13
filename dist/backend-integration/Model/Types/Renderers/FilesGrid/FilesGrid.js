import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { styled, Typography } from "@mui/material";
import useCCTranslations from "../../../../../utils/useCCTranslations";
import FilesGridLink from "./FilesGridLink";
import FilesGridMenu from "./FilesGridMenu";
/**
 * Theme slot `root` of `CcFilesGrid`: the line (a `Typography` with `noWrap`).
 * Its overflow box reaches 2px past the text on every side (padding, taken
 * back by a negative margin), so a focus ring around the link or the button
 * is not clipped where they start at the line's edge.
 */
const FilesGridRoot = styled(Typography, {
    name: "CcFilesGrid",
    slot: "root",
})({
    padding: 2,
    margin: -2,
});
/**
 * The files of a files field in a grid cell (RendererFiles), on the one line a
 * grid row has: "No files present", the only file's name as a link to it
 * (FilesGridLink), or for more files their count ("2 files") as a button that
 * opens a menu of the files (FilesGridMenu)
 */
const FilesGrid = (props) => {
    const { files } = props;
    const { t } = useCCTranslations();
    return (_jsxs(FilesGridRoot, { noWrap: true, children: [files.length === 0 &&
                t("backend-integration.model.types.renderers.files.no-file"), files.length === 1 && _jsx(FilesGridLink, { file: files[0] }), files.length > 1 && _jsx(FilesGridMenu, { files: files })] }));
};
export default React.memo(FilesGrid);
