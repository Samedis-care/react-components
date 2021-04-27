import React, { useCallback, useEffect, useRef, useState } from "react";

export interface UseDropZoneParams {
	disabled?: boolean;
	processFiles: (files: FileList) => void;
}

export interface UseDropZoneResult {
	handleDragOver: React.DragEventHandler;
	handleDrop: React.DragEventHandler;
	dragging: boolean;
}

const useDropZone = (props: UseDropZoneParams): UseDropZoneResult => {
	const { disabled, processFiles } = props;

	const dragCounter = useRef<number>(0);
	const [dragging, setDragging] = useState(false);

	const handleDrop = useCallback(
		(evt: React.DragEvent) => {
			if (disabled) return;

			evt.preventDefault();

			dragCounter.current = 0;
			setDragging(false);

			const files = evt.dataTransfer?.files;
			if (files) processFiles(files);
		},
		[disabled, processFiles]
	);

	const handleDragOver = useCallback(
		(evt: React.DragEvent) => {
			if (disabled) return;

			evt.preventDefault();
		},
		[disabled]
	);

	const handleDragStart = useCallback(() => {
		if (disabled) return;

		if (!dragCounter.current) {
			setDragging(true);
		}
		dragCounter.current++;
	}, [disabled]);

	const handleDragStop = useCallback(() => {
		if (disabled) return;

		dragCounter.current--;
		if (!dragCounter.current) {
			setDragging(false);
		}
	}, [disabled]);

	useEffect(() => {
		document.addEventListener("dragenter", handleDragStart);
		document.addEventListener("dragleave", handleDragStop);
		return () => {
			document.removeEventListener("dragenter", handleDragStart);
			document.removeEventListener("dragleave", handleDragStop);
		};
	});

	return {
		handleDrop,
		handleDragOver,
		dragging,
	};
};

export default useDropZone;
