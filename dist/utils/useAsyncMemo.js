import { useEffect, useState } from "react";
/**
 * Like useMemo, but supports async factory
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @param keepPreviousResult Cache previous results
 * @returns The value from the factory OR null while the factory is still updating
 */
const useAsyncMemo = (factory, dependencies, keepPreviousResult = false) => {
    const [value, setValue] = useState(null);
    useEffect(() => {
        if (!keepPreviousResult)
            setValue(null);
        void (async () => {
            setValue(await factory());
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
    return value;
};
export default useAsyncMemo;
