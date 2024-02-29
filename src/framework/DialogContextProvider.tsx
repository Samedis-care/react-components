import React, {
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import type { IFrameworkProps } from "./Framework";
import useCCTranslations from "../utils/useCCTranslations";
import type { TFunction } from "i18next";
import { useBlocker } from "react-router-dom";

export type DialogType = React.ReactNode;
export type DialogContextType = [
	pushDialog: (dialog: React.ReactNode) => void,
	popDialog: () => void,
];

/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext<DialogContextType | undefined>(
	undefined,
);

export const useDialogContext = (): DialogContextType => {
	const ctx = useContext(DialogContext);
	if (!ctx)
		throw new Error(
			"DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?",
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
	const dialogCount = useRef(0);
	const [dialogs, setDialogs] = useState<DialogType[]>([]);
	const parentContext = useContext(DialogContext);

	const blocker = useBlocker(
		dialogs.length > 0 && dialogCount.current > 0 && navBlockFn(t),
	);

	const pushDialog = useCallback((dialog: React.ReactNode) => {
		dialogCount.current++;

		setDialogs((prevValue) => [...prevValue, dialog]);
	}, []);
	const popDialog = useCallback(() => {
		if (dialogCount.current === 0) {
			if (parentContext) {
				// call parent popDialog and return
				return parentContext[1]();
			}
			const err = new Error(
				"[Components-Care] Trying to close non-existing dialog",
			);
			// eslint-disable-next-line no-console
			console.error(err);
			throw err;
		}
		// if all dialogs closed, remove callback
		dialogCount.current--;
		if (dialogCount.current === 0 && blocker.reset) {
			blocker.reset();
		}

		setDialogs((prevValue) => {
			prevValue.pop();
			return [...prevValue];
		});
	}, [blocker, parentContext]);

	const dialogActions: DialogContextType = useMemo(
		() => [pushDialog, popDialog],
		[pushDialog, popDialog],
	);

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
