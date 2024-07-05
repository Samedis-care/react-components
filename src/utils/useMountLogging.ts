import { useEffect, useId } from "react";

/**
 * Debug utility for logging mounts/unmounts
 */
const useMountLogging = (comp: { name: string }): void => {
	const { name } = comp;
	const id = useId();
	useEffect(() => {
		// eslint-disable-next-line no-console
		console.log(name, "mounted", id);
		return () => {
			// eslint-disable-next-line no-console
			console.log(name, "unmounted", id);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};

export default useMountLogging;
