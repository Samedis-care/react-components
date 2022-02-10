import React, { useEffect } from "react";

const cancelDragAndDrop = (evt: DragEvent) => {
	evt.preventDefault();
};

const DragAndDropPrevention = (): React.ReactElement => {
	// drag and drop unload prevention
	useEffect(() => {
		document.addEventListener("drop", cancelDragAndDrop);
		document.addEventListener("dragover", cancelDragAndDrop);
		return () => {
			document.removeEventListener("drop", cancelDragAndDrop);
			document.removeEventListener("dragover", cancelDragAndDrop);
		};
	});

	return <React.Fragment />;
};

export default DragAndDropPrevention;
