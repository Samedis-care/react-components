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
import {
	NavigationGuard,
	NavigationGuardContext,
	NavigationGuardEntry,
} from "../../framework/NavigationGuard";
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
	 * Runs go, which leaves the form after the user has confirmed it (the form page's
	 * goBack): a navigation go starts while it runs passes without asking about this form's
	 * changes again. It still asks about the changes of other dirty forms it leaves. When go
	 * does not leave the form, the form stays guarded.
	 * @param go Starts the navigation, synchronously
	 */
	leave: (go: () => void) => void;
}

/**
 * The leave guard of the Form a form page is rendered in; null outside of a Form's page
 */
export const FormPageGuardContext = React.createContext<FormPageGuard | null>(
	null,
);

export interface UseFormPageGuardParams {
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
 * The history state of a navigation that moves a form page to another url rather than
 * leaving it: CRUD's REPLACE from the create form to the record it has just saved
 * (<url>/new → <url>/<id>), which keeps the Form and everything on it. The leave guard lets
 * it pass, whatever the form's dirty state, and keeps guarding the page at its new url.
 */
export const FORM_PAGE_MOVE_STATE = Object.freeze({
	formPageMove: true,
});

/**
 * Does a navigation to pathname stay inside the form page (routed tab panels, a routed
 * stepper)? It does when the Form's nearest Route is still rendered at pathname, so the
 * Form stays mounted, with the same url: the url itself or a path below it
 * (/rec/1 → /rec/1/more), not one that only starts with the same characters (/rec/10,
 * /rec/1-archive).
 * A Route "/" renders only at "/", so every other path leaves the page. A Route "/*", such
 * as the default panel of routed tabs (tab("", …)), renders at every path below its parent,
 * except where the Routes it is an entry of renders an entry listed before it: opening
 * another tab unmounts a Form in the default panel, so that leaves the page.
 * The nearest Route of a disableRouting Form is the one of the page around it, as the Form
 * has no url of its own; it stays mounted all the same while that Route is rendered, e.g.
 * when routed tabs in its form page switch. A Form outside of every Route has none, so
 * every navigation leaves it.
 * @param routePath The full path of the Form's nearest Route (RouteContext path)
 * @param routeUrl The url the Route currently matches (RouteContext url)
 * @param routeRendersAt Is the Route rendered at a pathname (RouteContext rendersAt)
 * @param pathname The navigation's target
 */
const isInsideFormPage = (
	routePath: string,
	routeUrl: string,
	routeRendersAt: (pathname: string) => boolean,
	pathname: string,
): boolean =>
	routeRendersAt(pathname) &&
	matchPath({ path: routePath }, pathname)?.url === routeUrl;

/**
 * The leave guard of a Form's unsaved changes: while the form is dirty, a navigation asks
 * "Leave form page?" (a navigation that keeps the form's Route rendered at the same url
 * passes, also for a disableRouting Form, and so does a move of the page marked with
 * FORM_PAGE_MOVE_STATE),
 * closing the browser tab asks (UnsafeToLeave), and so does closing the FullFormDialog the
 * Form is in. A form that is read-only for a reason other than a save takes no guard.
 *
 * The Form holds it, because the changes are the Form's: once a form page has switched it on
 * (FormPageGuard.enable), it lasts until the Form unmounts, also while no form page is
 * mounted (a form page in a routed tab panel when another tab is open).
 *
 * The guards of all Forms in a Framework, those in pushed dialogs included, block the history
 * together (the Framework's NavigationGuard): a navigation that leaves several dirty forms asks
 * once, and after "Yes" the forms it did not leave stay guarded. A Form outside of a Framework
 * blocks the history on its own.
 * @param params The Form's state
 * @returns The guard, which the Form provides to its pages through FormPageGuardContext
 */
const useFormPageGuard = (params: UseFormPageGuardParams): FormPageGuard => {
	const {
		readOnlyBesidesSaving,
		dirty,
		addEventListener,
		removeEventListener,
	} = params;
	const { t } = useCCTranslations();
	const [pushDialog] = useDialogContext();
	const formDialog = useContext(FormDialogDispatchContext);
	const frameworkNavigationGuard = useContext(NavigationGuardContext);
	const navigationGuard = useMemo(
		() => frameworkNavigationGuard ?? new NavigationGuard(),
		[frameworkNavigationGuard],
	);
	const routeCtx = useContext(RouteContext);
	const routeUrl = routeCtx ? routeCtx.url : null;
	const routePath = routeCtx ? routeCtx.path : null;
	const routeRendersAt = routeCtx ? routeCtx.rendersAt : null;
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
	// the form's entry in the navigation guard; null while the form takes no guard
	const entryRef = useRef<NavigationGuardEntry | null>(null);

	useEffect(() => {
		// if the form is read-only, don't annoy the user
		if (readOnlyBesidesSaving) return;
		// does a navigation leave the form's unsaved changes behind?
		const leaves = (transition: Transition): boolean => {
			// the form may have gone clean since the guards were applied (a submit resolves
			// before React re-renders), so never ask about changes which no longer exist
			if (!dirtyRef.current) return false;
			// the form page moves to another url and stays (CRUD's move to the saved record):
			// nothing is left, even if a control's own dirty state lags behind the save. Only
			// the REPLACE counts: a later POP back to that history entry carries the state too.
			if (
				transition.action === Action.Replace &&
				transition.location.state === FORM_PAGE_MOVE_STATE
			) {
				return false;
			}
			// special handling: routing inside form page (e.g. routed tab panels, routed stepper)
			if (
				routePath != null &&
				routeUrl != null &&
				routeRendersAt != null &&
				isInsideFormPage(
					routePath,
					routeUrl,
					routeRendersAt,
					transition.location.pathname,
				)
			) {
				return false;
			}
			// otherwise the navigation leaves the form page
			return true;
		};
		// set while the navigation guard has the entry
		let removeEntry: (() => void) | null = null;
		const entry: NavigationGuardEntry = {
			leaves,
			ask: () =>
				showConfirmDialogBool(pushDialog, {
					title: t("backend-components.form.back-on-dirty.title"),
					message: t("backend-components.form.back-on-dirty.message"),
					textButtonYes: t("backend-components.form.back-on-dirty.yes"),
					textButtonNo: t("backend-components.form.back-on-dirty.no"),
				}),
			// a navigation the user confirmed has left the changes: the entry is added again by
			// the form's next change of dirty state
			onLeft: () => {
				removeEntry = null;
			},
		};
		entryRef.current = entry;
		// the guards are driven by the form engine's dirty event rather than by rendered
		// state, so that submitting and then leaving in one go isn't stopped by a dirty
		// flag which a pending re-render would have cleared. Idempotent in both directions.
		let releaseLocks: (() => void) | null = null;
		const applyGuards = (isDirty: boolean) => {
			if (isDirty) {
				if (!removeEntry) removeEntry = navigationGuard.add(entry);
				if (releaseLocks) return;
				const safeToLeave = UnsafeToLeaveDispatch.lock("form-dirty");
				if (formDialog) formDialog.blockClosing();
				releaseLocks = () => {
					safeToLeave();
					if (formDialog) formDialog.unblockClosing();
				};
			} else {
				if (removeEntry) {
					removeEntry();
					removeEntry = null;
				}
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
			if (entryRef.current === entry) entryRef.current = null;
			applyGuards(false);
		};
	}, [
		readOnlyBesidesSaving,
		t,
		formDialog,
		routePath,
		routeUrl,
		routeRendersAt,
		pushDialog,
		addEventListener,
		removeEventListener,
		navigationGuard,
	]);

	const enable = useCallback(() => {
		if (enabled.current) return;
		enabled.current = true;
		// a page mounts before the Form's effects run when both mount together; the effect
		// above applies the guards then
		applyGuardsRef.current?.(dirtyRef.current);
	}, []);

	const leave = useCallback(
		(go: () => void) => navigationGuard.leave(entryRef.current, go),
		[navigationGuard],
	);

	return useMemo((): FormPageGuard => ({ enable, leave }), [enable, leave]);
};

export default useFormPageGuard;
