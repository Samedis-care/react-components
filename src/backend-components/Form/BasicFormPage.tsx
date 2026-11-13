import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	FORM_SUBMITTING_READ_ONLY_REASON,
	FormContextData,
	PageProps,
	useFormContextLite,
} from "../Form";
import { FormDirtyEvent } from "./FormEvents";
import { FormPageGuardContext } from "./FormPageGuard";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { captureError } from "../../framework/ErrorReporting";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import {
	showConfirmDialog,
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
	 * Closes the form page, asking the user for confirmation if the form is dirty
	 * @param forceRefresh Force a refresh of the CRUD data grid after navigating back? (default false)
	 * @param forceNavigate Skip the unsaved changes confirmation dialog and navigate back immediately? (default false).
	 *                      Has no effect if the form isn't dirty or is read-only for a reason other than a
	 *                      pending save, as no dialog is shown then.
	 * @returns A promise which resolves once the user confirmed (or the dialog was skipped) and navigation happened.
	 *          Resolves without navigating if the user cancelled the confirmation dialog.
	 * @remarks Enhances CrudFormProps.goBack, which only takes forceRefresh and shows no confirmation dialog
	 * @see CrudFormProps.goBack
	 */
	goBack: (
		forceRefresh?: boolean,
		forceNavigate?: boolean,
	) => Promise<void> | void;
};
export type EnhancedCustomProps<T> =
	T extends Pick<CrudFormProps, "goBack">
		? Omit<T, "goBack"> & EnhancedGoBackType
		: T;

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
	const { readOnly, readOnlyReasons, addEventListener, removeEventListener } =
		useFormContextLite<ModelUnknown>();
	// a save makes the form read-only too, but its changes are unsaved until it succeeds and
	// a failed save is shown in the form, so goBack asks while the form saves, like the
	// Form's leave guard. A form which is read-only for another reason is left without asking.
	const readOnlyBesidesSaving = Object.keys(readOnlyReasons).some(
		(reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON,
	);
	// the dirty prop is one render behind the form engine, which breaks "submit, then
	// go back": the record is saved, but goBack below would still see a dirty form.
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

	// go back confirm dialog if form is dirty
	const customPropsWithGoBack:
		EnhancedCustomProps<CustomPropsT> | CustomPropsT =
		typeof originalCustomProps === "object"
			? ({
					...(typeof originalCustomProps === "object"
						? originalCustomProps
						: null),
				} as CustomPropsT)
			: originalCustomProps;
	if (
		typeof originalCustomProps === "object" &&
		originalCustomProps &&
		"goBack" in originalCustomProps
	) {
		const orgGoBack = (originalCustomProps as unknown as CrudFormProps).goBack;
		(customPropsWithGoBack as EnhancedGoBackType).goBack =
			typeof orgGoBack === "function"
				? async (forceRefresh?: boolean, forceNavigate?: boolean) => {
						try {
							if (
								dirtyRef.current &&
								!readOnlyBesidesSaving &&
								!forceNavigate
							) {
								await showConfirmDialog(pushDialog, {
									title: t("backend-components.form.back-on-dirty.title"),
									message: t("backend-components.form.back-on-dirty.message"),
									textButtonYes: t("backend-components.form.back-on-dirty.yes"),
									textButtonNo: t("backend-components.form.back-on-dirty.no"),
								});
							}
							pageGuard?.releaseHistoryBlock();
							orgGoBack(forceRefresh);
						} catch {
							// user cancelled
						}
					}
				: orgGoBack;
	}

	const handleSubmit = useCallback(async () => {
		await submit();
		if (postSubmitHandler) {
			try {
				await postSubmitHandler();
			} catch (e) {
				captureError(e, { source: "BasicFormPage.postSubmitHandler" });
				await showErrorDialog(pushDialog, e as Error);
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
							disableRouting={disableRouting}
							submit={handleSubmit}
							safeSubmit={handleSafeSubmit}
							customProps={
								(typeof originalCustomProps === "object" &&
								originalCustomProps != null
									? customPropsWithGoBack
									: originalCustomProps) as EnhancedCustomProps<CustomPropsT>
							}
						/>
					)
				}
				other={
					childActive ? undefined : <FormLoaderOverlay visible={isSubmitting} />
				}
			/>
		</BasicFormPageNestingContext.Provider>
	);
};

export default React.memo(BasicFormPage) as typeof BasicFormPage;
