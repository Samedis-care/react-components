import { useCallback, useEffect, useRef, useState } from "react";
var useDropZone = function (processFiles) {
    var dragCounter = useRef(0);
    var _a = useState(false), dragging = _a[0], setDragging = _a[1];
    var handleDrop = useCallback(function (evt) {
        var _a;
        if (!processFiles)
            return;
        evt.preventDefault();
        dragCounter.current = 0;
        setDragging(false);
        var files = (_a = evt.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
        if (files)
            void processFiles(files);
    }, [processFiles]);
    var handleDragOver = useCallback(function (evt) {
        if (!processFiles)
            return;
        evt.preventDefault();
    }, [processFiles]);
    var handleDragStart = useCallback(function () {
        if (!processFiles)
            return;
        if (!dragCounter.current) {
            setDragging(true);
        }
        dragCounter.current++;
    }, [processFiles]);
    var handleDragStop = useCallback(function () {
        if (!processFiles)
            return;
        dragCounter.current--;
        if (!dragCounter.current) {
            setDragging(false);
        }
    }, [processFiles]);
    var handleGlobalDrop = useCallback(function () {
        dragCounter.current = 0;
        setDragging(false);
    }, []);
    useEffect(function () {
        document.addEventListener("dragenter", handleDragStart);
        document.addEventListener("dragleave", handleDragStop);
        document.addEventListener("drop", handleGlobalDrop);
        return function () {
            document.removeEventListener("dragenter", handleDragStart);
            document.removeEventListener("dragleave", handleDragStop);
            document.removeEventListener("drop", handleGlobalDrop);
        };
    }, [handleDragStart, handleDragStop, handleGlobalDrop]);
    return {
        handleDrop: handleDrop,
        handleDragOver: handleDragOver,
        dragging: dragging,
    };
};
export default useDropZone;
