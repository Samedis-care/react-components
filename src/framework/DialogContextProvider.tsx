import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { IFrameworkProps } from "./Framework";
import { FrameworkHistory } from "./History";
import useCCTranslations from "../utils/useCCTranslations";
import { TFunction } from "i18next";

export type DialogType = React.ReactNode;
export type DialogContextType = [
	pushDialog: (dialog: React.ReactNode) => void,
	popDialog: () => void
];

/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext<DialogContextType | undefined>(
	undefined
);

export const useDialogContext = (): DialogContextType => {
	const ctx = useContext(DialogContext);
	if (!ctx)
		throw new Error(
			"DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?"
		);
	return ctx;
};

const navBlockFn = (t: TFunction) => (): false => {
	alert(t("framework.dialogs.navblock"));
	return false;
};
/**
 * Provides the application with an state to display an dialog
 */
const DialogContextProvider = (props: IFrameworkProps) => {
	const { t } = useCCTranslations();
	const navBlock = useRef<null | (() => void)>(null);
	const dialogCount = useRef(0);
	const [dialogs, setDialogs] = useState<DialogType[]>([]);

	const pushDialog = useCallback(
		(dialog: React.ReactNode) => {
			// if no dialogs were present, add callback
			if (dialogCount.current === 0) {
				navBlock.current = FrameworkHistory.block(navBlockFn(t));
			}
			dialogCount.current++;

			setDialogs((prevValue) => [...prevValue, dialog]);
		},
		[setDialogs, t]
	);
	const popDialog = useCallback(() => {
		// if all dialogs closed, remove callback
		dialogCount.current--;
		if (dialogCount.current === 0 && navBlock.current) {
			navBlock.current();
		}

		setDialogs((prevValue) => {
			prevValue.pop();
			return [...prevValue];
		});
	}, [setDialogs]);

	const dialogActions: DialogContextType = useMemo(
		() => [pushDialog, popDialog],
		[pushDialog, popDialog]
	);

	// update callback if locale changes
	useEffect(() => {
		if (!navBlock.current) return;

		navBlock.current(); // unblock
		navBlock.current = FrameworkHistory.block(navBlockFn(t)); // reblock
	}, [t]);

	// remove callback on unmount
	useEffect(() => {
		return () => {
			if (navBlock.current) {
				navBlock.current();
				navBlock.current = null;
			}
		};
	});

	return (
		<>
			<DialogContext.Provider value={dialogActions}>
				<>{props.children}</>
				<>
					{dialogs.map((dialog, index) => (
						<React.Fragment key={index.toString()}>{dialog}</React.Fragment>
					))}
				</>
			</DialogContext.Provider>
		</>
	);
};

export default React.memo(DialogContextProvider);
