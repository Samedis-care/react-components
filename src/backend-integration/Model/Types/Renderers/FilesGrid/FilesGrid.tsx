import React from "react";
import { styled, Typography } from "@mui/material";
import type { FileData } from "../../../../../standalone/FileUpload/Generic";
import useCCTranslations from "../../../../../utils/useCCTranslations";
import FilesGridLink from "./FilesGridLink";
import FilesGridMenu from "./FilesGridMenu";

export type FilesGridClassKey = "root" | "menuButton";

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
}) as typeof Typography;

export interface FilesGridProps {
	/**
	 * The files to show
	 */
	files: FileData[];
}

/**
 * The files of a files field in a grid cell (RendererFiles), on the one line a
 * grid row has: "No files present", the only file's name as a link to it
 * (FilesGridLink), or for more files their count ("2 files") as a button that
 * opens a menu of the files (FilesGridMenu)
 */
const FilesGrid = (props: FilesGridProps) => {
	const { files } = props;
	const { t } = useCCTranslations();
	return (
		<FilesGridRoot noWrap>
			{files.length === 0 &&
				t("backend-integration.model.types.renderers.files.no-file")}
			{files.length === 1 && <FilesGridLink file={files[0]} />}
			{files.length > 1 && <FilesGridMenu files={files} />}
		</FilesGridRoot>
	);
};

export default React.memo(FilesGrid);
