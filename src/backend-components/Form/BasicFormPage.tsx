import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	FORM_SUBMITTING_READ_ONLY_REASON,
	FormContextData,
	PageProps,
	useFormContextLite,
} from "../Form";
import { FormPageGuardContext } from "./FormPageGuard";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { captureError } from "../../framework/ErrorReporting";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import {
	showConfirmDialogBool,
	showErrorDialog,
} from "../../non-standalone/Dialog/Utils";
import FormPageLayout, {
	FormPageLayoutProps,
} from "../../standalone/Form/FormPageLayout";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useCCTranslations from "../../utils/useCCTranslations";
import { RouteContext } from "../../standalone/Routes/Route";
import { useThemeProps } from "@mui/material";
import { CrudFormProps } from "../CRUD";

export interface BasicFormPageRendererProps<CustomPropsT> extends Omit<
	PageProps<ModelUnknown, CustomPropsT>,
	"submit" | "safeSubmit" | "dirty"
> {
	/**
	 * Function to submit everything
	 * @remarks throws if submitting fails
	 */
	submit: () => Promise<void>;
	/**
	 * Function to submit everything, swallowing any error
	 * @returns false if submitting failed, true otherwise
	 * @see FormContextData.safeSubmit
	 */
	safeSubmit: () => Promise<boolean>;
	/**
	 * Is the form dirty?
	 * @see FormContextData.dirty
	 */
	dirty: boolean;
	/**
	 * Is the form read-only
	 */
	readOnly: boolean;
	/**
	 * Optional read-only reasons
	 */
	readOnlyReasons: FormContextData<ModelUnknown>["readOnlyReasons"];
	/**
	 * Show back button only when not enough permission
	 */
	showBackButtonOnly?: boolean;
	/**
	 * Automatically go back after submit
	 */
	autoBack?: boolean;
	/**
	 * Confirm dialog message
	 */
	confirmDialogMessage?: string;
}

export type EnhancedGoBackType = {
	/**
	 * Closes the form page, asking the user for confirmation if the form holds unsaved changes
	 * (dirty or, in flow mode, stagedDirty) at the call, as the form engine sees them: also
	 * right after a save resolved, before React re-rendered, and for a change a control made in
	 * its mount effect
	 * @param forceRefresh Force a refresh of the CRUD data grid after navigating back? (default false)
	 * @param forceNavigate Skip the unsaved changes confirmation dialog and navigate back immediately? (default false).
	 *                      Has no effect if the form isn't dirty or is read-only for a reason other than a
	 *                      pending save, as no dialog is shown then.
	 * @returns A promise which resolves once the user confirmed (or the dialog was skipped) and navigation happened.
	 *          Resolves without navigating if the user cancelled the confirmation dialog (No, Escape, a
	 *          backdrop click). An error thrown by the Form's goBack does not reject it: the error is
	 *          reported (captureError, source "BasicFormPage.goBack") and shown in an error dialog,
	 *          and the promise resolves once that dialog is closed.
	 * @remarks Enhances CrudFormProps.goBack, which only takes forceRefresh and shows no confirmation dialog.
	 *          A navigation the Form's goBack starts synchronously (CRUD's goBack does) passes without
	 *          asking about this form again; it asks once about other dirty forms it leaves. A
	 *          navigation it starts later asks again. When goBack does not leave the form, the form
	 *          stays guarded.
	 * @see CrudFormProps.goBack
	 */
	goBack: (
		forceRefresh?: boolean,
		forceNavigate?: boolean,
	) => Promise<void> | void;
};
/**
 * The Form's customProps as BasicFormPage's footer gets them. Without a goBack function they
 * are the Form's customProps object itself. With one, they are a copy whose goBack is the
 * confirming one (EnhancedGoBackType): the copy has the prototype of the Form's customProps
 * (a class instance's methods stay), and their own properties, getters as getters. The copy is
 * made again when the Form's customProps change, and its goBack stays the same function for
 * the life of the page: when called, it calls the goBack of the Form's latest customProps, as
 * their method (a goBack method keeps its this).
 */
export type EnhancedCustomProps<T> =
	T extends Pick<CrudFormProps, "goBack">
		? Omit<T, "goBack"> & EnhancedGoBackType
		: T;

/**
 * Do the customProps have a goBack function to replace?
 */
const hasGoBack = (
	customProps: unknown,
): customProps is Pick<CrudFormProps, "goBack"> =>
	typeof customProps === "object" &&
	customProps !== null &&
	typeof (customProps as Partial<CrudFormProps>).goBack === "function";

/**
 * The customProps with their goBack replaced, or themselves when they have no goBack function
 * @param customProps The Form's customProps
 * @param goBack The goBack replacing theirs
 * @returns A copy with the prototype and the own properties of customProps and the given
 *          goBack, or customProps themselves
 */
const replaceGoBack = <CustomPropsT,>(
	customProps: CustomPropsT,
	goBack: EnhancedGoBackType["goBack"],
): EnhancedCustomProps<CustomPropsT> => {
	if (!hasGoBack(customProps))
		return customProps as EnhancedCustomProps<CustomPropsT>;
	return Object.create(Object.getPrototypeOf(customProps) as object | null, {
		...Object.getOwnPropertyDescriptors(customProps),
		goBack: {
			value: goBack,
			writable: true,
			enumerable: true,
			configurable: true,
		},
	}) as EnhancedCustomProps<CustomPropsT>;
};

export interface BasicFormPageProps<
	RendererPropsT,
	CustomPropsT,
> extends PageProps<ModelUnknown, CustomPropsT> {
	/**
	 * Called after submit successfully completed
	 */
	postSubmitHandler?: () => Promise<void> | void;
	/**
	 * The form page contents renderer
	 */
	children: React.ComponentType<
		BasicFormPageRendererProps<EnhancedCustomProps<CustomPropsT>> &
			RendererPropsT
	>;
	/**
	 * Additional props passed to children
	 */
	childrenProps: RendererPropsT;
	/**
	 * Actual form
	 */
	form: React.ReactNode;
	/**
	 * read only mode?
	 */
	showBackButtonOnly?: boolean;
	/**
	 * custom form page layout component
	 */
	formPageLayoutComponent?: React.ComponentType<FormPageLayoutProps>;
}

export const BasicFormPageNestingContext = createContext<
	((active: boolean) => void) | null
>(null);

const BasicFormPage = <RendererPropsT, CustomPropsT>(
	inProps: BasicFormPageProps<RendererPropsT, CustomPropsT>,
) => {
	const props = useThemeProps({ props: inProps, name: "CcBasicFormPage" });
	const {
		submit,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		safeSubmit: unusedSafeSubmit, // replaced by handleSafeSubmit below, must not reach the renderer
		dirty,
		stagedDirty,
		disableRouting,
		postSubmitHandler,
		isSubmitting,
		children: FormButtons,
		form,
		childrenProps,
		customProps: originalCustomProps,
		formPageLayoutComponent,
		...otherProps
	} = props;
	const { t } = useCCTranslations();
	const { readOnly, readOnlyReasons } = useFormContextLite<ModelUnknown>();
	// a save makes the form read-only too, but its changes are unsaved until it succeeds and
	// a failed save is shown in the form, so goBack asks while the form saves, like the
	// Form's leave guard. A form which is read-only for another reason is left without asking.
	const readOnlyBesidesSaving = Object.keys(readOnlyReasons).some(
		(reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON,
	);
	const [childActiveCount, setChildActiveCount] = useState(0);
	const childActive = childActiveCount > 0;
	const setChildActive = useCallback((active: boolean) => {
		setChildActiveCount((c) => c + (active ? 1 : -1));
	}, []);
	const hideParent = useContext(BasicFormPageNestingContext);
	useEffect(() => {
		if (!hideParent) return;
		hideParent(true);
		return () => hideParent(false);
	}, [hideParent]);
	const [pushDialog] = useDialogContext();
	const routeCtx = useContext(RouteContext);
	if (!disableRouting && !routeCtx) throw new Error("no route match");
	// the leave guard belongs to the Form, which keeps the changes also while this page is
	// not mounted (a page in a routed tab panel when another tab is open): this page only
	// switches it on, for the rest of the Form's life
	const pageGuard = useContext(FormPageGuardContext);
	useEffect(() => {
		pageGuard?.enable();
	}, [pageGuard]);

	// the confirming goBack reads the page's state and the Form's goBack of the latest render
	// when it is called, so it stays the same function for the life of the page
	const pageState = {
		customProps: originalCustomProps,
		dirty,
		stagedDirty,
		readOnlyBesidesSaving,
		pageGuard,
		pushDialog,
		t,
	};
	const latest = useRef(pageState);
	latest.current = pageState;
	const confirmingGoBack = useCallback(
		async (forceRefresh?: boolean, forceNavigate?: boolean) => {
			const page = latest.current;
			// the changes goBack asks about are the shown values and, in flow mode, the
			// staged ones, as the form engine sees them now. The dirty props are one render
			// behind it, which breaks "submit, then go back" (the record is saved, but they
			// still say dirty). The Form's leave guard follows the engine's dirty event,
			// also for a change a control in this page announced in its mount effect,
			// before this page's own effects ran.
			const unsaved = page.pageGuard
				? page.pageGuard.isUnsaved()
				: page.dirty || page.stagedDirty;
			try {
				if (unsaved && !page.readOnlyBesidesSaving && !forceNavigate) {
					const leave = await showConfirmDialogBool(page.pushDialog, {
						title: page.t("backend-components.form.back-on-dirty.title"),
						message: page.t("backend-components.form.back-on-dirty.message"),
						textButtonYes: page.t("backend-components.form.back-on-dirty.yes"),
						textButtonNo: page.t("backend-components.form.back-on-dirty.no"),
					});
					// the user stays on the form page
					if (!leave) return;
				}
				// the goBack of the customProps of the latest render, called on them, so that
				// a method keeps its this
				const go = () => {
					const { customProps } = latest.current;
					if (hasGoBack(customProps)) customProps.goBack(forceRefresh);
				};
				// the navigation goBack starts does not ask about this form again, and
				// the form stays guarded if goBack does not leave it
				const guard = latest.current.pageGuard;
				if (guard) guard.leave(go);
				else go();
			} catch (e) {
				// only the user's "No" cancels: an error of goBack (or of the prompt) is
				// reported, and shown, so that Back never fails without a word
				captureError(e, { source: "BasicFormPage.goBack" });
				await showErrorDialog(latest.current.pushDialog, e);
			}
		},
		[],
	);
	// the Form's customProps themselves, or a copy with the confirming goBack
	const footerCustomProps = useMemo(
		() => replaceGoBack(originalCustomProps, confirmingGoBack),
		[originalCustomProps, confirmingGoBack],
	);

	const handleSubmit = useCallback(async () => {
		await submit();
		if (postSubmitHandler) {
			try {
				await postSubmitHandler();
			} catch (e) {
				captureError(e, { source: "BasicFormPage.postSubmitHandler" });
				await showErrorDialog(pushDialog, e);
			}
		}
	}, [submit, postSubmitHandler, pushDialog]);

	// note: a postSubmitHandler which throws doesn't make this return false, the record was saved
	// either way and the failure is shown to the user by handleSubmit itself
	const handleSafeSubmit = useCallback(async (): Promise<boolean> => {
		try {
			await handleSubmit();
			return true;
		} catch {
			// ignore, shown to user via ErrorComponent and reported via captureError in submitForm
			return false;
		}
	}, [handleSubmit]);

	const UsedFormPageLayout = formPageLayoutComponent ?? FormPageLayout;

	return (
		<BasicFormPageNestingContext.Provider value={setChildActive}>
			<UsedFormPageLayout
				body={form}
				footer={
					childActive ? null : (
						<FormButtons
							{...childrenProps}
							{...otherProps}
							showBackButtonOnly={
								otherProps.showBackButtonOnly ||
								(readOnly && !Object.values(readOnlyReasons).find((e) => !!e))
							}
							readOnly={readOnly}
							readOnlyReasons={readOnlyReasons}
							isSubmitting={isSubmitting}
							dirty={dirty}
							stagedDirty={stagedDirty}
							disableRouting={disableRouting}
							submit={handleSubmit}
							safeSubmit={handleSafeSubmit}
							customProps={footerCustomProps}
						/>
					)
				}
				other={
					childActive ? undefined : (
						<FormLoaderOverlay
							visible={isSubmitting}
							message={t("backend-components.form.read-only.submitting")}
						/>
					)
				}
			/>
		</BasicFormPageNestingContext.Provider>
	);
};

export default React.memo(BasicFormPage) as typeof BasicFormPage;
