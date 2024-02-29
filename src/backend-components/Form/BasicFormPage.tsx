import React, { useCallback, useContext, useEffect } from "react";
import {
	FormContextData,
	PageProps,
	useFormContextLite,
	ValidationError,
} from "../Form";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ModelFieldName } from "../../backend-integration/Model/Model";
import {
	showConfirmDialog,
	showConfirmDialogBool,
	showErrorDialog,
} from "../../non-standalone/Dialog/Utils";
import { FormDialogDispatchContext } from "./FormDialog";
import FormPageLayout from "../../standalone/Form/FormPageLayout";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useCCTranslations from "../../utils/useCCTranslations";
import { useRouteInfo } from "../../utils/routeUtils";
import { useBlocker } from "react-router-dom";
import { BlockerFunction } from "@remix-run/router/router";

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
	 * Confirm dialog message
	 */
	confirmDialogMessage?: string;
}

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
		BasicFormPageRendererProps<CustomPropsT> & RendererPropsT
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
}

const BasicFormPage = <RendererPropsT, CustomPropsT>(
	props: BasicFormPageProps<RendererPropsT, CustomPropsT>,
) => {
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
		...otherProps
	} = props;
	const { t } = useCCTranslations();
	const { readOnly, readOnlyReasons } = useFormContextLite();
	const [pushDialog] = useDialogContext();
	const formDialog = useContext(FormDialogDispatchContext);
	const { url: routeUrl } = useRouteInfo(disableRouting);

	const askForLeaveConfirmation: BlockerFunction = useCallback(
		({ nextLocation }) => {
			return !(!disableRouting && nextLocation.pathname.startsWith(routeUrl));
		},
		[disableRouting, routeUrl],
	);
	const blocker = useBlocker(
		dirty && !readOnly && !isSubmitting && askForLeaveConfirmation,
	);

	useEffect(() => {
		if (blocker.state != "blocked") return;
		void (async () => {
			const leave = await showConfirmDialogBool(pushDialog, {
				title: t("backend-components.form.back-on-dirty.title"),
				message: t("backend-components.form.back-on-dirty.message"),
				textButtonYes: t("backend-components.form.back-on-dirty.yes"),
				textButtonNo: t("backend-components.form.back-on-dirty.no"),
			});
			if (leave) {
				return blocker.proceed();
			} else {
				blocker.reset();
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blocker.state]);

	useEffect(() => {
		// if the form isn't dirty, don't block submitting
		// if the form is read-only, don't annoy the user
		// if the form is currently submitting we automatically assume the form is no longer dirty
		// otherwise we'd run into a data race, as dirty flag is not updated during submit, only afterwards, which would
		// block the redirect to the edit page here
		if (!dirty || readOnly || isSubmitting) return;
		const safeToLeave = UnsafeToLeaveDispatch.lock("form-dirty");
		if (formDialog) formDialog.blockClosing();
		return () => {
			safeToLeave();
			if (blocker.reset) {
				blocker.reset();
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
		blocker,
	]);

	// go back confirm dialog if form is dirty
	const customPropsWithGoBack: {
		goBack?: () => void | Promise<void>;
	} = {
		...(typeof originalCustomProps === "object" ? originalCustomProps : null),
	};
	if (
		typeof originalCustomProps === "object" &&
		originalCustomProps &&
		"goBack" in originalCustomProps
	) {
		const orgGoBack = (
			originalCustomProps as unknown as Pick<
				typeof customPropsWithGoBack,
				"goBack"
			>
		).goBack;
		customPropsWithGoBack.goBack =
			typeof orgGoBack === "function"
				? async () => {
						try {
							if (dirty && !readOnly) {
								await showConfirmDialog(pushDialog, {
									title: t("backend-components.form.back-on-dirty.title"),
									message: t("backend-components.form.back-on-dirty.message"),
									textButtonYes: t("backend-components.form.back-on-dirty.yes"),
									textButtonNo: t("backend-components.form.back-on-dirty.no"),
								});
							}
							if (blocker.reset) {
								blocker.reset();
							}
							await orgGoBack();
						} catch (e) {
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
				await showErrorDialog(pushDialog, e as Error | ValidationError);
			}
		}
	}, [submit, postSubmitHandler, pushDialog]);

	return (
		<FormPageLayout
			body={form}
			footer={
				<FormButtons
					{...childrenProps}
					{...otherProps}
					showBackButtonOnly={
						otherProps.showBackButtonOnly ||
						(readOnly && !!Object.values(readOnlyReasons).find((e) => !!e))
					}
					readOnly={readOnly}
					readOnlyReasons={readOnlyReasons}
					isSubmitting={isSubmitting}
					dirty={dirty}
					disableRouting={disableRouting}
					submit={handleSubmit}
					customProps={
						typeof originalCustomProps === "object" &&
						originalCustomProps != null
							? (customPropsWithGoBack as CustomPropsT)
							: originalCustomProps
					}
				/>
			}
			other={<FormLoaderOverlay visible={isSubmitting} />}
		/>
	);
};

export default React.memo(BasicFormPage) as typeof BasicFormPage;
