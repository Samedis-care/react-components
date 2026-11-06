import React, {
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { IFrameworkProps } from "./Framework";
import useCCTranslations from "../utils/useCCTranslations";
import type { TFunction } from "i18next";
import { FrameworkHistory } from "./History";
import {
	PushedDialogClose,
	PushedDialogCloseContext,
} from "./PushedDialogCloseContext";

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

interface PushedDialog {
	id: number;
	dialog: DialogType;
	/**
	 * Closes this dialog (PushedDialogCloseContext, useCloseThisDialog)
	 */
	close: PushedDialogClose;
}

/**
 * Provides the application with an state to display an dialog
 */
const DialogContextProvider = (props: IFrameworkProps) => {
	const { t } = useCCTranslations();
	const navBlock = useRef<null | (() => void)>(null);
	// the ids of the open dialogs in push order, current before the dialogs state renders
	const openIds = useRef<number[]>([]);
	const nextId = useRef(0);
	const [dialogs, setDialogs] = useState<PushedDialog[]>([]);
	const parentContext = useContext(DialogContext);

	// removes a dialog whose id was taken out of openIds
	const removeDialog = useCallback((id: number) => {
		// if all dialogs closed, remove callback
		if (openIds.current.length === 0 && navBlock.current) {
			navBlock.current();
			navBlock.current = null;
		}
		setDialogs((prevValue) => prevValue.filter((entry) => entry.id !== id));
	}, []);
	const closeDialog = useCallback(
		(id: number) => {
			const index = openIds.current.indexOf(id);
			if (index === -1) return; // closed already
			openIds.current.splice(index, 1);
			removeDialog(id);
		},
		[removeDialog],
	);

	const pushDialog = useCallback(
		(dialog: React.ReactNode) => {
			// if no dialogs were present, add callback
			if (openIds.current.length === 0) {
				navBlock.current = FrameworkHistory.block(navBlockFn(t));
			}
			const id = nextId.current++;
			openIds.current.push(id);

			setDialogs((prevValue) => [
				...prevValue,
				{ id, dialog, close: { close: () => closeDialog(id), pushed: true } },
			]);
		},
		[t, closeDialog],
	);
	const popDialog = useCallback(() => {
		const id = openIds.current.pop();
		if (id === undefined) {
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
		removeDialog(id);
	}, [parentContext, removeDialog]);

	const dialogActions: DialogContextType = useMemo(
		() => [pushDialog, popDialog],
		[pushDialog, popDialog],
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
				// eslint-disable-next-line no-console
				console.warn(
					// eslint-disable-next-line react-hooks/exhaustive-deps
					`[Components-Care] [DialogContextProvder] Unmounting with ${openIds.current.length} dialogs open`,
				);
			}
		};
	}, []);

	return (
		<>
			<DialogContext.Provider value={dialogActions}>
				<>{props.children}</>
				<>
					{dialogs.map((entry) => (
						<PushedDialogCloseContext.Provider
							key={entry.id}
							value={entry.close}
						>
							<Suspense>{entry.dialog}</Suspense>
						</PushedDialogCloseContext.Provider>
					))}
				</>
			</DialogContext.Provider>
		</>
	);
};

export default React.memo(DialogContextProvider);
