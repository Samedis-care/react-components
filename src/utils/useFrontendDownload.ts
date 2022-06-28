import { useCallback, useEffect, useRef } from "react";

/**
 * React hook to provide easy frontend generated file downloads
 * @returns a function which accepts a file to download
 */
const useFrontendDownload = () => {
	const link = useRef<HTMLAnchorElement>();
	useEffect(() => {
		const linkEl = document.createElement("a");
		linkEl.style.display = "none";
		document.body.appendChild(linkEl);
		link.current = linkEl;
		return () => {
			document.body.removeChild(linkEl);
		};
	});

	return useCallback((file: File) => {
		const linkEl = link.current;
		if (!linkEl)
			throw new Error("Link not on document yet, wait for first rerender");
		const url = URL.createObjectURL(file);
		try {
			linkEl.href = url;
			linkEl.download = file.name;
			linkEl.click();
		} finally {
			URL.revokeObjectURL(url);
		}
	}, []);
};

export default useFrontendDownload;
