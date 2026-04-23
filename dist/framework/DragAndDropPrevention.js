import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect } from "react";
const cancelDragAndDrop = (evt) => {
    evt.preventDefault();
};
const DragAndDropPrevention = () => {
    // drag and drop unload prevention
    useEffect(() => {
        document.addEventListener("drop", cancelDragAndDrop);
        document.addEventListener("dragover", cancelDragAndDrop);
        return () => {
            document.removeEventListener("drop", cancelDragAndDrop);
            document.removeEventListener("dragover", cancelDragAndDrop);
        };
    });
    return _jsx(React.Fragment, {});
};
export default DragAndDropPrevention;
