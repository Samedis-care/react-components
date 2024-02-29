import { useEffect, useMemo, useState } from "react";
import debounce from "./debounce";

export type WindowSize = [width: number, height: number];

const getWindowSize = (): WindowSize => {
	return [window.innerWidth, window.innerHeight];
};

const useWindowSize = (): WindowSize => {
	const [size, setSize] = useState<WindowSize>(getWindowSize);
	const handleResize = useMemo(
		() =>
			debounce(() => {
				setSize(getWindowSize);
			}, 100),
		[],
	);

	useEffect(() => {
		addEventListener("resize", handleResize);
		return () => {
			removeEventListener("resize", handleResize);
		};
	}, [handleResize]);

	return size;
};

export default useWindowSize;
