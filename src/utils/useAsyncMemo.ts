import { useEffect, useState } from "react";

/**
 * Like useMemo, but supports async factory
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @returns The value from the factory OR null while the factory is still updating
 */
const useAsyncMemo = <T>(
	factory: () => Promise<T> | T,
	dependencies: unknown[]
): T | null => {
	const [value, setValue] = useState<T | null>(null);

	useEffect(() => {
		setValue(null);
		void (async () => {
			setValue(await factory());
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	return value;
};

export default useAsyncMemo;
