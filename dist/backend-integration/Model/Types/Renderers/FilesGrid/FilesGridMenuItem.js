import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { MenuItem } from "@mui/material";
import useObjectUrl from "../../../../../utils/useObjectUrl";
import getLinkProtocol from "../../../../../utils/internal/getLinkProtocol";
/**
 * One file in the menu of a grid cell's files (FilesGridMenu): a menu item that
 * links to the file, or a disabled one with its name if it has no download link
 * @remarks The link opens the file in a new tab that gets no access to the app
 *          window and no referrer, and closes the menu. A Blob link is opened
 *          through an object URL; a link with a scheme that does not count as a
 *          link (e.g. `javascript:`) is no link.
 */
const FilesGridMenuItem = React.forwardRef(function FilesGridMenuItem(props, ref) {
    const { file } = props.file;
    const url = useObjectUrl("downloadLink" in file ? file.downloadLink : null);
    const href = useMemo(() => (getLinkProtocol(url) ? url : undefined), [url]);
    if (!href)
        return (_jsx(MenuItem, { ref: ref, disabled: true, children: file.name }));
    return (_jsx(MenuItem, { ref: ref, component: "a", href: href, target: "_blank", rel: "noopener noreferrer", onClick: props.onClose, children: file.name }));
});
export default React.memo(FilesGridMenuItem);
