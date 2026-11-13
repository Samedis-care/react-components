import React, { useCallback, useState } from "react";
import { Link, styled } from "@mui/material";
import type { FileData } from "../../../../../standalone/FileUpload/Generic";
import PopupMenu from "../../../../../standalone/PopupMenu";
import useCCTranslations from "../../../../../utils/useCCTranslations";
import useMenuButton from "../../../../../utils/internal/useMenuButton";
import FilesGridMenuItem from "./FilesGridMenuItem";

export interface FilesGridMenuProps {
	/**
	 * The files to list, two or more
	 */
	files: FileData[];
}

/**
 * Theme slot `menuButton` of `CcFilesGrid`: the button that opens the menu, a
 * MUI `Link` (`component="button"`). On the text's baseline, so it does not
 * make the row's line taller (MUI's link button is middle-aligned).
 */
const FilesGridMenuButton = styled(Link, {
	name: "CcFilesGrid",
	slot: "menuButton",
})({
	verticalAlign: "baseline",
}) as typeof Link;

// the button and the menu act on the files only: their clicks do not reach the
// grid cell (the menu's through the React tree of its portal), which would
// select the row (double click: open the record)
const stopPropagation = (evt: React.SyntheticEvent) => evt.stopPropagation();

/**
 * The files of a files field in a grid cell (RendererFiles) when it has more
 * than one: their count ("2 files"), a button that opens a menu of the files
 * @remarks The button is styled as a link, in the cell's text color (MUI's
 *          primary color lacks contrast on the grid's hovered and selected rows),
 *          and fits the row's line. The menu is named by the button and lists
 *          each file by its name (FilesGridMenuItem).
 */
const FilesGridMenu = (props: FilesGridMenuProps) => {
	const { files } = props;
	const { t } = useCCTranslations();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = anchorEl != null;
	const { buttonProps, slotProps } = useMenuButton(open);

	const openMenu = useCallback((evt: React.MouseEvent<HTMLElement>) => {
		evt.stopPropagation();
		setAnchorEl(evt.currentTarget);
	}, []);
	const closeMenu = useCallback(() => setAnchorEl(null), []);

	return (
		<>
			<FilesGridMenuButton
				component={"button"}
				type={"button"}
				color={"inherit"}
				{...buttonProps}
				onClick={openMenu}
				onDoubleClick={stopPropagation}
			>
				{t("backend-integration.model.types.renderers.files.count", {
					count: files.length,
				})}
			</FilesGridMenuButton>
			<PopupMenu
				anchorEl={anchorEl}
				open={open}
				onClose={closeMenu}
				slotProps={slotProps}
				onClick={stopPropagation}
				onDoubleClick={stopPropagation}
			>
				{files.map((file, index) => (
					<FilesGridMenuItem key={index} file={file} onClose={closeMenu} />
				))}
			</PopupMenu>
		</>
	);
};

export default React.memo(FilesGridMenu);
