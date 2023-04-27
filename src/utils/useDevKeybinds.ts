import { useEffect, useRef } from "react";

const useDevKeybinds = (handlers: Record<string, () => void>) => {
	const matches = useRef<Record<string, number>>({});

	useEffect(() => {
		const keyHandler = (evt: KeyboardEvent) => {
			for (const key in handlers) {
				const matchOffset = matches.current[key] ?? 0;
				if (key[matchOffset] === evt.key) {
					if (matchOffset === key.length - 1) {
						// full match, call handler
						handlers[key]();
						matches.current[key] = 0;
					} else {
						matches.current[key] = matchOffset + 1;
					}
				} else {
					matches.current[key] = 0;
				}
			}
		};
		document.addEventListener("keypress", keyHandler);
		return () => {
			document.removeEventListener("keypress", keyHandler);
		};
	}, [handlers]);
};

export default useDevKeybinds;
