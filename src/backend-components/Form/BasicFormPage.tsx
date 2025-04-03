import React, { useCallback, useContext, useEffect, useRef } from "react";
import { FormContextData, PageProps, useFormContextLite } from "../Form";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import { FrameworkHistory } from "../../framework/History";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ModelFieldName } from "../../backend-integration/Model/Model";
import {
	showConfirmDialog,
	showConfirmDialogBool,
	showErrorDialog,
} from "../../non-standalone/Dialog/Utils";
import { FormDialogDispatchContext } from "./FormDialog";
import FormPageLayout, {
	FormPageLayoutProps,
} from "../../standalone/Form/FormPageLayout";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useCCTranslations from "../../utils/useCCTranslations";
import { Transition } from "history";
import { RouteContext } from "../../standalone/Routes/Route";
import { useThemeProps } from "@mui/material";
import { CrudFormProps } from "../CRUD";

export interface BasicFormPageRendererProps<CustomPropsT>
	extends Omit<PageProps<ModelFieldName, CustomPropsT>, "submit" | "dirty"> {
	/**
	 * Function to submit everything
	 */
	submit: () => Promise<void>;
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
	readOnlyReasons: FormContextData["readOnlyReasons"];
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
	goBack: (
		forceRefresh?: boolean,
		forceNavigate?: boolean,
	) => Promise<void> | void;
};
export type EnhancedCustomProps<T> =
	T extends Pick<CrudFormProps, "goBack">
		? Omit<T, "goBack"> & EnhancedGoBackType
		: T;

export interface BasicFormPageProps<RendererPropsT, CustomPropsT>
	extends PageProps<ModelFieldName, CustomPropsT> {
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

const BasicFormPage = <RendererPropsT, CustomPropsT>(
	inProps: BasicFormPageProps<RendererPropsT, CustomPropsT>,
) => {
	const props = useThemeProps({ props: inProps, name: "CcBasicFormPage" });
	const {
		submit,
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
	const { readOnly, readOnlyReasons } = useFormContextLite();
	const [pushDialog] = useDialogContext();
	const formDialog = useContext(FormDialogDispatchContext);
	const unblock = useRef<(() => void) | undefined>(undefined);
	const routeCtx = useContext(RouteContext);
	if (!disableRouting && !routeCtx) throw new Error("no route match");
	const routeUrl = routeCtx ? routeCtx.url : "";

	useEffect(() => {
		// if the form isn't dirty, don't block submitting
		// if the form is read-only, don't annoy the user
		// if the form is currently submitting we automatically assume the form is no longer dirty
		// otherwise we'd run into a data race, as dirty flag is not updated during submit, only afterwards, which would
		// block the redirect to the edit page here
		if (!dirty || readOnly || isSubmitting) return;
		const blocker = (transition: Transition) => {
			const allowTransition = () => {
				// temp unblock to retry transaction
				if (unblock.current) {
					unblock.current();
					unblock.current = undefined;
				}
				transition.retry();
			};
			//console.log("History.block(", location, ",", action, ")", match);
			// special handling: routing inside form page (e.g. routed tab panels, routed stepper)
			if (
				!disableRouting &&
				transition.location.pathname.startsWith(routeUrl)
			) {
				allowTransition();
				unblock.current = FrameworkHistory.block(blocker);
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
		unblock.current = FrameworkHistory.block(blocker);
		const safeToLeave = UnsafeToLeaveDispatch.lock("form-dirty");
		if (formDialog) formDialog.blockClosing();
		return () => {
			safeToLeave();
			if (unblock.current) {
				unblock.current();
				unblock.current = undefined;
			}
			if (formDialog) formDialog.unblockClosing();
		};
	}, [
		isSubmitting,
		readOnly,
		t,
		dirty,
		formDialog,
		routeUrl,
		pushDialog,
		disableRouting,
	]);

	// go back confirm dialog if form is dirty
	const customPropsWithGoBack:
		| EnhancedCustomProps<CustomPropsT>
		| CustomPropsT =
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
							if (dirty && !readOnly && !forceNavigate) {
								await showConfirmDialog(pushDialog, {
									title: t("backend-components.form.back-on-dirty.title"),
									message: t("backend-components.form.back-on-dirty.message"),
									textButtonYes: t("backend-components.form.back-on-dirty.yes"),
									textButtonNo: t("backend-components.form.back-on-dirty.no"),
								});
							}
							if (unblock.current) {
								unblock.current();
								unblock.current = undefined;
							}
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
				await showErrorDialog(pushDialog, e as Error);
			}
		}
	}, [submit, postSubmitHandler, pushDialog]);

	const UsedFormPageLayout = formPageLayoutComponent ?? FormPageLayout;

	return (
		<UsedFormPageLayout
			body={form}
			footer={
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
					customProps={
						(typeof originalCustomProps === "object" &&
						originalCustomProps != null
							? customPropsWithGoBack
							: originalCustomProps) as EnhancedCustomProps<CustomPropsT>
					}
				/>
			}
			other={<FormLoaderOverlay visible={isSubmitting} />}
		/>
	);
};

export default React.memo(BasicFormPage) as typeof BasicFormPage;
