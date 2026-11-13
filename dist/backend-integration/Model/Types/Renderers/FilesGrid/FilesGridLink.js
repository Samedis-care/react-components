import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Link } from "@mui/material";
import useObjectUrl from "../../../../../utils/useObjectUrl";
import getLinkProtocol from "../../../../../utils/internal/getLinkProtocol";
// the link acts on the file only: the click does not reach the grid cell, which
// would select the row (double click: open the record)
const stopPropagation = (evt) => evt.stopPropagation();
/**
 * The only file of a files field in a grid cell (RendererFiles): its name, as a
 * link to the file if it has a download link
 * @remarks The link has the cell's text color and is underlined: MUI's primary
 *          color lacks contrast on the grid's hovered and selected rows.
 *
 *          The link opens the file in a new tab that gets no access to the app
 *          window and no referrer. A Blob link is opened through an object URL;
 *          a link with a scheme that does not count as a link (e.g.
 *          `javascript:`) shows the name as plain text.
 */
const FilesGridLink = (props) => {
    const { file } = props.file;
    const url = useObjectUrl("downloadLink" in file ? file.downloadLink : null);
    const href = useMemo(() => (getLinkProtocol(url) ? url : undefined), [url]);
    if (!href)
        return _jsx(_Fragment, { children: file.name });
    return (_jsx(Link, { href: href, color: "inherit", target: "_blank", rel: "noopener noreferrer", onClick: stopPropagation, onDoubleClick: stopPropagation, children: file.name }));
};
export default React.memo(FilesGridLink);
