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
import {
	PushedDialogClose,
	PushedDialogCloseContext,
} from "./PushedDialogCloseContext";
import { HistoryRouterContext } from "../standalone/Routes/HistoryRouter";
import { FrameworkHistory } from "./History";

export type DialogType = React.ReactNode;
/**
 * The dialog functions of the nearest DialogContextProvider: `[pushDialog, popDialog]`.
 * pushDialog shows a dialog and returns a function that closes exactly that dialog;
 * popDialog closes the top-most dialog.
 */
export type DialogContextType = [
	/**
	 * Shows `dialog` above the dialogs that are open already. The dialog closes when a
	 * navigation leads to another path, see DialogContextProvider.
	 * @returns A function that closes this dialog, and only this one, also while dialogs
	 *          pushed after it are open. It is the function useCloseThisDialog returns inside
	 *          the dialog, the same one for the life of the dialog. Calling it again, or after
	 *          the dialog was closed another way (popDialog, the dialog's own close, a
	 *          navigation), does nothing.
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
	 *          you mean to close, or when a navigation closed that one meanwhile (code that
	 *          runs after an `await`). To close a specific dialog, use the function pushDialog
	 *          returned, or useCloseThisDialog inside the dialog: they do nothing once the
	 *          dialog is closed.
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
 * Provides pushDialog and popDialog (useDialogContext) to its children, and shows the dialogs
 * they push after the children. Framework renders one around the app; CRUD and
 * CrudMultiSelect render their own, whose dialogs see their contexts.
 *
 * The dialogs belong to the page they were pushed on: a navigation to another path closes
 * them, a link or `navigate()` in a dialog as well as browser Back and Forward, so that the
 * new page is not covered by the dialogs of the old one. A push, a replace and a back/forward
 * navigation count when their pathname differs from the one before. The provider follows the
 * history of the HistoryRouter around it (in Framework that is FrameworkHistory), and
 * FrameworkHistory outside a HistoryRouter.
 * - A navigation that changes only the search or the hash keeps the dialogs open (the page
 *   stays), and so does one that a blocker stops, e.g. "Leave form page?" answered with No.
 *   After Yes, the navigation closes the dialog the form is in.
 * - The dialogs that are open when the navigation happens close, also one pushed right
 *   before it. Push a dialog meant for the new page after navigating.
 * - A dialog closes as with popDialog: it unmounts, without calling its onClose. The promise
 *   of a `show…Dialog` helper whose dialog closes this way does not settle, so the code
 *   awaiting it does not continue.
 */
const DialogContextProvider = (props: IFrameworkProps) => {
	// the ids of the open dialogs in push order, current before the dialogs state renders
	const openIds = useRef<number[]>([]);
	const nextId = useRef(0);
	const [dialogs, setDialogs] = useState<PushedDialog[]>([]);
	const parentContext = useContext(DialogContext);
	const routerHistory = useContext(HistoryRouterContext)?.history;

	// removes a dialog whose id was taken out of openIds
	const removeDialog = useCallback((id: number) => {
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
			const id = nextId.current++;
			openIds.current.push(id);

			// one function for the dialog's life: returned here, and the dialog's
			// PushedDialogCloseContext (useCloseThisDialog)
			const close = () => closeDialog(id);
			const entry: PushedDialog = {
				id,
				dialog,
				close: { close, pushed: true },
			};
			setDialogs((prevValue) => [...prevValue, entry]);
			return close;
		},
		[closeDialog],
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

	// a navigation to another path closes the dialogs that are open at that moment; one pushed
	// after it (by the new page) stays
	useEffect(() => {
		const history = routerHistory ?? FrameworkHistory;
		let pathname = history.location.pathname;
		return history.listen(({ location }) => {
			if (location.pathname === pathname) return;
			pathname = location.pathname;
			const closing = openIds.current;
			if (closing.length === 0) return;
			openIds.current = [];
			setDialogs((prevValue) =>
				prevValue.filter((entry) => !closing.includes(entry.id)),
			);
		});
	}, [routerHistory]);

	const dialogActions: DialogContextType = useMemo(
		() => [pushDialog, popDialog],
		[pushDialog, popDialog],
	);

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
