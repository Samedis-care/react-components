import React, { useCallback, useEffect, useRef, useState } from "react";

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
 * Whether a drag carries files
 * @param evt A drag event
 * @returns true for files (e.g. dragged in from the desktop), false for text, links and
 *          images dragged within the page
 */
const isFileDrag = (evt: DragEvent): boolean =>
	!!evt.dataTransfer?.types.includes("Files");

/**
 * Drop zone handling: the handlers for the drop zone element and whether files are
 * dragged over the page
 * @param processFiles Handles dropped files. Without it the zone takes no drops and never
 *                     shows dragging (e.g. read-only).
 * @returns The handlers to attach to the drop zone, and the dragging state
 */
const useDropZone = (processFiles?: UseDropZoneParams): UseDropZoneResult => {
	const dragCounter = useRef<number>(0);
	const [dragging, setDragging] = useState(false);

	const handleDrop = useCallback(
		(evt: React.DragEvent) => {
			if (!processFiles) return;

			evt.preventDefault();

			dragCounter.current = 0;
			setDragging(false);

			const files = evt.dataTransfer?.files;
			if (files) void processFiles(files);
		},
		[processFiles],
	);

	const handleDragOver = useCallback(
		(evt: React.DragEvent) => {
			if (!processFiles) return;

			evt.preventDefault();
		},
		[processFiles],
	);

	const handleDragStart = useCallback(
		(evt: DragEvent) => {
			if (!processFiles || !isFileDrag(evt)) return;

			if (!dragCounter.current) {
				setDragging(true);
			}
			dragCounter.current++;
		},
		[processFiles],
	);

	const handleDragStop = useCallback(
		(evt: DragEvent) => {
			if (!processFiles || !isFileDrag(evt)) return;

			dragCounter.current--;
			if (!dragCounter.current) {
				setDragging(false);
			}
		},
		[processFiles],
	);

	const handleGlobalDrop = useCallback(() => {
		dragCounter.current = 0;
		setDragging(false);
	}, []);

	useEffect(() => {
		document.addEventListener("dragenter", handleDragStart);
		document.addEventListener("dragleave", handleDragStop);
		document.addEventListener("drop", handleGlobalDrop);
		return () => {
			document.removeEventListener("dragenter", handleDragStart);
			document.removeEventListener("dragleave", handleDragStop);
			document.removeEventListener("drop", handleGlobalDrop);
		};
	}, [handleDragStart, handleDragStop, handleGlobalDrop]);

	return {
		handleDrop,
		handleDragOver,
		dragging,
	};
};

export default useDropZone;
