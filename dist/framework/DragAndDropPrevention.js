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
    return React.createElement(React.Fragment, null);
};
export default DragAndDropPrevention;
