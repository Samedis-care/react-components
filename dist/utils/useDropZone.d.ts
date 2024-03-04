import React from "react";
export type UseDropZoneParams = (files: FileList) => Promise<void> | void;
export interface UseDropZoneResult {
    handleDragOver: React.DragEventHandler;
    handleDrop: React.DragEventHandler;
    dragging: boolean;
}
declare const useDropZone: (processFiles?: UseDropZoneParams) => UseDropZoneResult;
export default useDropZone;