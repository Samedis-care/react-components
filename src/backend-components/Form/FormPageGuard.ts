import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { Action, Transition } from "history";
import { FormDirtyEvent, FormEventTarget } from "./FormEvents";
import { FormDialogDispatchContext } from "./FormDialog";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import { FrameworkHistory } from "../../framework/History";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { showConfirmDialogBool } from "../../non-standalone/Dialog/Utils";
import { RouteContext } from "../../standalone/Routes/Route";
import matchPath from "../../standalone/Routes/matchPath";
import useCCTranslations from "../../utils/useCCTranslations";

/**
 * The leave guard of a Form, which its form pages switch on
 * @see useFormPageGuard
 */
export interface FormPageGuard {
	/**
	 * Guards the form's unsaved changes from now on, until the Form unmounts. A form page
	 * calls it when it mounts; calling it again does nothing.
	 */
	enable: () => void;
	/**
	 * Lifts the history block, for a navigation the user has already confirmed (the form
	 * page's goBack). The block is set again by the form's next change of dirty state.
	 */
	releaseHistoryBlock: () => void;
}

/**
 * The leave guard of the Form a form page is rendered in; null outside of a Form's page
 */
export const FormPageGuardContext = React.createContext<FormPageGuard | null>(
	null,
);

export interface UseFormPageGuardParams {
	/**
	 * The Form's disableRouting: every navigation leaves the form
	 */
	disableRouting: boolean;
	/**
	 * Is the form read-only for a reason other than a save? Then it takes no guard.
	 */
	readOnlyBesidesSaving: boolean;
	/**
	 * The Form's rendered dirty state, read once as the start value; the "dirty" event
	 * keeps the guard current from then on
	 */
	dirty: boolean;
	/**
	 * The Form's addEventListener
	 */
	addEventListener: FormEventTarget["addEventListener"];
	/**
	 * The Form's removeEventListener
	 */
	removeEventListener: FormEventTarget["removeEventListener"];
}

/**
 * Does a navigation to pathname stay inside the form page (routed tab panels, a routed
 * stepper)? It does when the Form's nearest Route still renders at pathname with the same
 * url: the url itself or a path below it (/rec/1 → /rec/1/more), not one that only starts
 * with the same characters (/rec/10, /rec/1-archive).
 * At the root this follows the Route too: a Route "/" renders only at "/", so every other
 * path leaves the page; a Route "/*" renders at every path, so for it no path leaves the
 * page.
 * @param routePath The full path of the Form's nearest Route (RouteContext path)
 * @param routeUrl The url the Route currently matches (RouteContext url)
 * @param pathname The navigation's target
 */
const isInsideFormPage = (
	routePath: string,
	routeUrl: string,
	pathname: string,
): boolean => matchPath({ path: routePath }, pathname)?.url === routeUrl;

/**
 * The leave guard of a Form's unsaved changes: while the form is dirty, a navigation asks
 * "Leave form page?" (a navigation inside the form's Route passes, unless disableRouting),
 * closing the browser tab asks (UnsafeToLeave), and so does closing the FullFormDialog the
 * Form is in. A form that is read-only for a reason other than a save takes no guard.
 *
 * The Form holds it, because the changes are the Form's: once a form page has switched it on
 * (FormPageGuard.enable), it lasts until the Form unmounts, also while no form page is
 * mounted (a form page in a routed tab panel when another tab is open).
 * @param params The Form's state
 * @returns The guard, which the Form provides to its pages through FormPageGuardContext
 */
const useFormPageGuard = (params: UseFormPageGuardParams): FormPageGuard => {
	const {
		disableRouting,
		readOnlyBesidesSaving,
		dirty,
		addEventListener,
		removeEventListener,
	} = params;
	const { t } = useCCTranslations();
	const [pushDialog] = useDialogContext();
	const formDialog = useContext(FormDialogDispatchContext);
	const routeCtx = useContext(RouteContext);
	const routeUrl = routeCtx ? routeCtx.url : null;
	const routePath = routeCtx ? routeCtx.path : null;
	// the rendered dirty state is one render behind the form engine, which breaks "submit,
	// then navigate away": the record is saved, but the guards below still see a dirty form.
	// The dirty event fires as soon as the form engine sees the change, so this ref is
	// current even while a re-render is still pending.
	const dirtyRef = useRef(dirty);
	useEffect(() => {
		const handleDirtyChange = (event: FormDirtyEvent) => {
			dirtyRef.current = event.dirty;
		};
		addEventListener("dirty", handleDirtyChange);
		return () => removeEventListener("dirty", handleDirtyChange);
	}, [addEventListener, removeEventListener]);
	// switched on by the first form page, for the rest of the Form's life
	const enabled = useRef(false);
	// applies or releases the guards; null while the form takes none
	const applyGuardsRef = useRef<((isDirty: boolean) => void) | null>(null);
	const unblock = useRef<(() => void) | undefined>(undefined);
	const releaseHistoryBlock = useCallback(() => {
		if (unblock.current) {
			unblock.current();
			unblock.current = undefined;
		}
	}, []);

	useEffect(() => {
		// if the form is read-only, don't annoy the user
		if (readOnlyBesidesSaving) return;
		// set while the history block is lifted for a POP inside the form page, see passThrough
		let stopWaitingForPop: (() => void) | null = null;
		const blocker = (transition: Transition) => {
			const allowTransition = () => {
				// temp unblock to retry transaction
				releaseHistoryBlock();
				transition.retry();
			};
			// lets a navigation inside the form page through and keeps the page guarded
			const passThrough = () => {
				releaseHistoryBlock();
				if (transition.action === Action.Pop) {
					// A browser history reverts every POP while a blocker is set and retries
					// it asynchronously (history.go), so block again only once the retried POP
					// has arrived: blocking at once would revert it again, and so on forever.
					stopWaitingForPop = FrameworkHistory.listen(() =>
						applyGuards(dirtyRef.current),
					);
					transition.retry();
				} else {
					// PUSH and REPLACE are retried synchronously
					transition.retry();
					applyGuards(dirtyRef.current);
				}
			};
			// the form may have gone clean since the guards were applied (a submit resolves
			// before React re-renders), so never ask about changes which no longer exist
			if (!dirtyRef.current) {
				applyGuards(false);
				transition.retry();
				return;
			}
			// special handling: routing inside form page (e.g. routed tab panels, routed stepper)
			if (
				!disableRouting &&
				routePath != null &&
				routeUrl != null &&
				isInsideFormPage(routePath, routeUrl, transition.location.pathname)
			) {
				passThrough();
				return;
			}
			// otherwise: ask user for confirmation
			void (async () => {
				const leave = await showConfirmDialogBool(pushDialog, {
					title: t("backend-components.form.back-on-dirty.title"),
					message: t("backend-components.form.back-on-dirty.message"),
					textButtonYes: t("backend-components.form.back-on-dirty.yes"),
					textButtonNo: t("backend-components.form.back-on-dirty.no"),
				});
				if (leave) {
					allowTransition();
				}
			})();
		};
		// the guards are driven by the form engine's dirty event rather than by rendered
		// state, so that submitting and then leaving in one go isn't stopped by a dirty
		// flag which a pending re-render would have cleared. Idempotent in both directions.
		let releaseLocks: (() => void) | null = null;
		const applyGuards = (isDirty: boolean) => {
			if (stopWaitingForPop) {
				stopWaitingForPop();
				stopWaitingForPop = null;
			}
			if (isDirty) {
				if (!unblock.current) unblock.current = FrameworkHistory.block(blocker);
				if (releaseLocks) return;
				const safeToLeave = UnsafeToLeaveDispatch.lock("form-dirty");
				if (formDialog) formDialog.blockClosing();
				releaseLocks = () => {
					safeToLeave();
					if (formDialog) formDialog.unblockClosing();
				};
			} else {
				releaseHistoryBlock();
				if (releaseLocks) {
					releaseLocks();
					releaseLocks = null;
				}
			}
		};
		const handleDirtyChange = (event: FormDirtyEvent) => {
			if (enabled.current) applyGuards(event.dirty);
		};
		applyGuardsRef.current = applyGuards;
		if (enabled.current) applyGuards(dirtyRef.current);
		addEventListener("dirty", handleDirtyChange);
		return () => {
			removeEventListener("dirty", handleDirtyChange);
			applyGuardsRef.current = null;
			applyGuards(false);
		};
	}, [
		readOnlyBesidesSaving,
		t,
		formDialog,
		routePath,
		routeUrl,
		pushDialog,
		disableRouting,
		addEventListener,
		removeEventListener,
		releaseHistoryBlock,
	]);

	const enable = useCallback(() => {
		if (enabled.current) return;
		enabled.current = true;
		// a page mounts before the Form's effects run when both mount together; the effect
		// above applies the guards then
		applyGuardsRef.current?.(dirtyRef.current);
	}, []);

	return useMemo(
		(): FormPageGuard => ({ enable, releaseHistoryBlock }),
		[enable, releaseHistoryBlock],
	);
};

export default useFormPageGuard;
