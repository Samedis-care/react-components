import { useEffect, useMemo, useState } from "react";
import debounce from "./debounce";
const getWindowSize = () => {
    return [window.innerWidth, window.innerHeight];
};
const useWindowSize = () => {
    const [size, setSize] = useState(getWindowSize);
    const handleResize = useMemo(() => debounce(() => {
        setSize(getWindowSize);
    }, 100), []);
    useEffect(() => {
        addEventListener("resize", handleResize);
        return () => {
            removeEventListener("resize", handleResize);
        };
    }, [handleResize]);
    return size;
};
export default useWindowSize;
