import { useEffect } from "react";
/**
 * Debug utility for logging mounts/unmounts
 */
const useMountLogging = (comp) => {
    const { name } = comp;
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log(name, "mounted");
        return () => {
            // eslint-disable-next-line no-console
            console.log(name, "unmounted");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
export default useMountLogging;
