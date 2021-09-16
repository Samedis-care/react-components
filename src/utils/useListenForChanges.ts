import { useEffect, useState } from "react";

const useListenForChanges = <T>(getValue: () => T): T => {
	const [val, setVal] = useState<T>(getValue);
	useEffect(() => {
		const handle = window.setInterval(() => {
			const newVal = getValue();
			if (newVal !== val) {
				setVal(newVal);
			}
		}, 1000);
		return () => window.clearInterval(handle);
	}, [val, getValue]);

	return val;
};

export default useListenForChanges;
