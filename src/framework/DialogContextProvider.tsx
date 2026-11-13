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
import { FrameworkHistory } from "./History";
import {
	PushedDialogClose,
	PushedDialogCloseContext,
} from "./PushedDialogCloseContext";

export type DialogType = React.ReactNode;
/**
 * The dialog functions of the nearest DialogContextProvider: `[pushDialog, popDialog]`.
 * pushDialog shows a dialog and returns a function that closes exactly that dialog;
 * popDialog closes the top-most dialog.
 */
export type DialogContextType = [
	/**
	 * Shows `dialog` above the dialogs that are open already. Navigation is blocked while a
	 * pushed dialog is open, but not by one that closes once the handler of its clicked button
	 * has ended (see PushedDialogClose.allowNavigation).
	 * @returns A function that closes this dialog, and only this one, also while dialogs
	 *          pushed after it are open. It is the function useCloseThisDialog returns inside
	 *          the dialog, the same one for the life of the dialog. Calling it again, or after
	 *          the dialog was closed another way (popDialog, the dialog's own close), does
	 *          nothing.
	 * @remarks Use the returned function to close the dialog from the code that pushed it
	 *          (a timeout, a response, the page that opened it), where useCloseThisDialog is
	 *          not available. Inside the dialog, useCloseThisDialog gives the same function.
	 */
	pushDialog: (dialog: React.ReactNode) => () => void,
	/**
	 * Closes the top-most dialog of this provider; without one, the top-most dialog of the
	 * DialogContextProvider around it.
	 * @throws Error when no dialog is open
	 * @remarks The top-most dialog is a different one when a dialog was pushed after the one
	 *          you mean to close. To close a specific dialog, use the function pushDialog
	 *          returned, or useCloseThisDialog inside the dialog.
	 */
	popDialog: () => void,
];

/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext<DialogContextType | undefined>(
	undefined,
);

/**
 * Returns the dialog functions `[pushDialog, popDialog]` of the nearest
 * DialogContextProvider (part of Framework). pushDialog returns a function that closes the
 * dialog it pushed; see DialogContextType.
 * @throws Error when there is no DialogContextProvider around the calling component
 */
export const useDialogContext = (): DialogContextType => {
	const ctx = useContext(DialogContext);
	if (!ctx)
		throw new Error(
			"DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?",
		);
	return ctx;
};

interface PushedDialog {
	id: number;
	dialog: DialogType;
	/**
	 * Closes this dialog (PushedDialogCloseContext, useCloseThisDialog); its close is what
	 * pushDialog returned
	 */
	close: PushedDialogClose;
}

/**
 * Provides the application with an state to display an dialog
 */
const DialogContextProvider = (props: IFrameworkProps) => {
	const { t } = useCCTranslations();
	// the translation of the latest render, for the navigation block, which outlives it
	const tRef = useRef(t);
	useEffect(() => {
		tRef.current = t;
	}, [t]);
	const navBlock = useRef<null | (() => void)>(null);
	// the ids of the open dialogs in push order, current before the dialogs state renders
	const openIds = useRef<number[]>([]);
	// the open dialogs that let navigation through while they close (allowNavigation), with
	// the number of allowNavigation calls not taken back
	const navAllowed = useRef(new Map<number, number>());
	const nextId = useRef(0);
	const [dialogs, setDialogs] = useState<PushedDialog[]>([]);
	const parentContext = useContext(DialogContext);

	// blocks navigation while an open dialog does not let it through
	const updateNavBlock = useCallback(() => {
		const blocking = openIds.current.some((id) => !navAllowed.current.has(id));
		if (blocking && !navBlock.current) {
			navBlock.current = FrameworkHistory.block(() => {
				alert(tRef.current("framework.dialogs.navblock"));
			});
		} else if (!blocking && navBlock.current) {
			navBlock.current();
			navBlock.current = null;
		}
	}, []);
	// removes a dialog whose id was taken out of openIds
	const removeDialog = useCallback(
		(id: number) => {
			navAllowed.current.delete(id);
			updateNavBlock();
			setDialogs((prevValue) => prevValue.filter((entry) => entry.id !== id));
		},
		[updateNavBlock],
	);
	const closeDialog = useCallback(
		(id: number) => {
			const index = openIds.current.indexOf(id);
			if (index === -1) return; // closed already
			openIds.current.splice(index, 1);
			removeDialog(id);
		},
		[removeDialog],
	);
	// lets navigation through while the dialog closes, see PushedDialogClose.allowNavigation
	const allowNavigation = useCallback(
		(id: number) => {
			if (!openIds.current.includes(id)) return () => {}; // closed already
			navAllowed.current.set(id, (navAllowed.current.get(id) ?? 0) + 1);
			updateNavBlock();
			let takenBack = false;
			return () => {
				if (takenBack) return;
				takenBack = true;
				const count = navAllowed.current.get(id);
				if (count === undefined) return; // closed meanwhile
				if (count > 1) navAllowed.current.set(id, count - 1);
				else navAllowed.current.delete(id);
				updateNavBlock();
			};
		},
		[updateNavBlock],
	);

	const pushDialog = useCallback(
		(dialog: React.ReactNode) => {
			const id = nextId.current++;
			openIds.current.push(id);
			updateNavBlock();

			// one function for the dialog's life: returned here, and the dialog's
			// PushedDialogCloseContext (useCloseThisDialog)
			const close = () => closeDialog(id);
			const entry: PushedDialog = {
				id,
				dialog,
				close: {
					close,
					pushed: true,
					allowNavigation: () => allowNavigation(id),
				},
			};
			setDialogs((prevValue) => [...prevValue, entry]);
			return close;
		},
		[closeDialog, allowNavigation, updateNavBlock],
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
