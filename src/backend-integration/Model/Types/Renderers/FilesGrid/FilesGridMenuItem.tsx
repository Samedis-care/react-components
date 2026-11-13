import React, { useMemo } from "react";
import { MenuItem } from "@mui/material";
import type { FileData } from "../../../../../standalone/FileUpload/Generic";
import useObjectUrl from "../../../../../utils/useObjectUrl";
import getLinkProtocol from "../../../../../utils/internal/getLinkProtocol";

export interface FilesGridMenuItemProps {
	/**
	 * The file to show
	 */
	file: FileData;
	/**
	 * Closes the menu, called when the file is opened
	 */
	onClose: () => void;
}

/**
 * One file in the menu of a grid cell's files (FilesGridMenu): a menu item that
 * links to the file, or a disabled one with its name if it has no download link
 * @remarks The link opens the file in a new tab that gets no access to the app
 *          window and no referrer, and closes the menu. A Blob link is opened
 *          through an object URL; a link with a scheme that does not count as a
 *          link (e.g. `javascript:`) is no link.
 */
const FilesGridMenuItem = React.forwardRef(function FilesGridMenuItem(
	props: FilesGridMenuItemProps,
	ref: React.ForwardedRef<HTMLLIElement>,
) {
	const { file } = props.file;
	const url = useObjectUrl("downloadLink" in file ? file.downloadLink : null);
	const href = useMemo(() => (getLinkProtocol(url) ? url : undefined), [url]);
	if (!href)
		return (
			<MenuItem ref={ref} disabled>
				{file.name}
			</MenuItem>
		);
	return (
		<MenuItem
			ref={ref as React.ForwardedRef<HTMLAnchorElement>}
			component={"a"}
			href={href}
			target={"_blank"}
			rel={"noopener noreferrer"}
			onClick={props.onClose}
		>
			{file.name}
		</MenuItem>
	);
});

export default React.memo(FilesGridMenuItem);
