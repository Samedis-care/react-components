import React, { useEffect } from "react";
var cancelDragAndDrop = function (evt) {
    evt.preventDefault();
};
var DragAndDropPrevention = function () {
    // drag and drop unload prevention
    useEffect(function () {
        document.addEventListener("drop", cancelDragAndDrop);
        document.addEventListener("dragover", cancelDragAndDrop);
        return function () {
            document.removeEventListener("drop", cancelDragAndDrop);
            document.removeEventListener("dragover", cancelDragAndDrop);
        };
    });
    return React.createElement(React.Fragment, null);
};
export default DragAndDropPrevention;
