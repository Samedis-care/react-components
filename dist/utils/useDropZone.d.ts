import React from "react";
export declare type UseDropZoneParams = (files: FileList) => Promise<void> | unknown;
export interface UseDropZoneResult {
    handleDragOver: React.DragEventHandler;
    handleDrop: React.DragEventHandler;
    dragging: boolean;
}
declare const useDropZone: (processFiles?: UseDropZoneParams | undefined) => UseDropZoneResult;
export default useDropZone;
