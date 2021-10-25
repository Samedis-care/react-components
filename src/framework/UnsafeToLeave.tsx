import React, { useContext, useEffect, useRef, useState } from "react";

export interface UnsafeToLeaveDispatchT {
	/**
	 * Marks the current site unsafe to leave
	 * @param reason A reason identifier, useful for debugging
	 * @returns A callback to mark the site safe to leave again
	 */
	lock: (reason?: string) => () => void;
}

const noopLock = () => (): void => {
	return;
};

export const UnsafeToLeaveDispatch: UnsafeToLeaveDispatchT = {
	lock: noopLock,
};

const UnsafeToLeaveContext = React.createContext<boolean>(false);
export const useIsUnsafeToLeave = (): boolean => {
	return useContext(UnsafeToLeaveContext);
};

const UnsafeToLeave = (
	props: React.PropsWithChildren<{ disable?: boolean }>
): React.ReactElement => {
	const { disable } = props;
	const [reasons, setReasons] = useState<string[]>([]);
	const reasonsRef = useRef<string[]>([]);

	useEffect(() => {
		if (disable) return;

		const unloadListener = (evt: BeforeUnloadEvent) => {
			// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#example
			// message customization not possible
			if (reasonsRef.current.length > 0) {
				evt.preventDefault();
				evt.returnValue = "";
			} else {
				delete evt.returnValue;
			}
		};

		window.addEventListener("beforeunload", unloadListener);

		if (UnsafeToLeaveDispatch.lock !== noopLock) {
			throw new Error("More than one instance of UnsafeToLeave loaded");
		}

		UnsafeToLeaveDispatch.lock = (reason) => {
			const uuid = Array.from(crypto.getRandomValues(new Uint8Array(16)))
				.map((e) => e.toString(16))
				.join("");
			const ident = reason ? uuid + "_" + reason : uuid;

			reasonsRef.current = [...reasonsRef.current, ident];
			setReasons(reasonsRef.current);
			return () => {
				reasonsRef.current = reasonsRef.current.filter(
					(entry) => entry !== ident
				);
				setReasons(reasonsRef.current);
			};
		};

		return () => {
			UnsafeToLeaveDispatch.lock = noopLock;
			window.removeEventListener("beforeunload", unloadListener);
		};
	}, [disable]);

	return (
		<UnsafeToLeaveContext.Provider value={reasons.length > 0}>
			{props.children}
		</UnsafeToLeaveContext.Provider>
	);
};

export default React.memo(UnsafeToLeave);
