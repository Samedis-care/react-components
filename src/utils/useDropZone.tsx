import React, { useCallback, useEffect, useRef, useState } from "react";

export type UseDropZoneParams = (files: FileList) => Promise<void> | unknown;

export interface UseDropZoneResult {
	handleDragOver: React.DragEventHandler;
	handleDrop: React.DragEventHandler;
	dragging: boolean;
}

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
		[processFiles]
	);

	const handleDragOver = useCallback(
		(evt: React.DragEvent) => {
			if (!processFiles) return;

			evt.preventDefault();
		},
		[processFiles]
	);

	const handleDragStart = useCallback(() => {
		if (!processFiles) return;

		if (!dragCounter.current) {
			setDragging(true);
		}
		dragCounter.current++;
	}, [processFiles]);

	const handleDragStop = useCallback(() => {
		if (!processFiles) return;

		dragCounter.current--;
		if (!dragCounter.current) {
			setDragging(false);
		}
	}, [processFiles]);

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
