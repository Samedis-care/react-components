import React from "react";
/**
 * Handles the files dropped on a drop zone
 * @param files The dropped files
 */
export type UseDropZoneParams = (files: FileList) => Promise<void> | void;
export interface UseDropZoneResult {
    /**
     * The drop zone's dragover handler: allows the drop
     */
    handleDragOver: React.DragEventHandler;
    /**
     * The drop zone's drop handler: passes the dropped files on
     */
    handleDrop: React.DragEventHandler;
    /**
     * Whether files are dragged over the page, to show "drop here" styles
     * @remarks true while files (e.g. from the desktop) are dragged anywhere over the
     *          page, not only over the drop zone. Dragged text, links and images from the
     *          page don't count. Always false without a drop handler.
     */
    dragging: boolean;
}
/**
 * Drop zone handling: the handlers for the drop zone element and whether files are
 * dragged over the page
 * @param processFiles Handles dropped files. Without it the zone takes no drops and never
 *                     shows dragging (e.g. read-only).
 * @returns The handlers to attach to the drop zone, and the dragging state
 */
declare const useDropZone: (processFiles?: UseDropZoneParams) => UseDropZoneResult;
export default useDropZone;
