import React, { useCallback, useContext, useEffect, useRef } from "react";
import { PageProps, useFormContextLite } from "..";
import { UnregisterCallback } from "history";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import { FrameworkHistory, useDialogContext } from "../../framework";
import { ModelFieldName } from "../../backend-integration";
import { showConfirmDialog, showErrorDialog } from "../../non-standalone";
import { FormDialogDispatchContext } from "./FormDialog";
import FormPageLayout from "../../standalone/Form/FormPageLayout";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useCCTranslations from "../../utils/useCCTranslations";
import { useRouteMatch } from "react-router-dom";

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
}

const BasicFormPage = <RendererPropsT extends unknown, CustomPropsT>(
	props: BasicFormPageProps<RendererPropsT, CustomPropsT>
) => {
	const {
		submit,
		dirty,
		postSubmitHandler,
		isSubmitting,
		children: FormButtons,
		form,
		childrenProps,
		customProps: originalCustomProps,
		...otherProps
	} = props;
	const { t } = useCCTranslations();
	const { readOnly } = useFormContextLite();
	const [pushDialog] = useDialogContext();
	const formDialog = useContext(FormDialogDispatchContext);
	const unblock = useRef<UnregisterCallback | undefined>(undefined);
	const match = useRouteMatch();

	useEffect(() => {
		// if the form isn't dirty, don't block submitting
		// if the form is read-only, don't annoy the user
		// if the form is currently submitting we automatically assume the form is no longer dirty
		// otherwise we'd run into a data race, as dirty flag is not updated during submit, only afterwards, which would
		// block the redirect to the edit page here
		if (!dirty || readOnly || isSubmitting) return;
		unblock.current = FrameworkHistory.block((location) => {
			//console.log("History.block(", location, ",", action, ")", match);
			// special handling: routing inside form page (e.g. routed tab panels, routed stepper)
			if (location.pathname.startsWith(match.url)) return;
			return `${t("backend-components.form.back-on-dirty.title")} ${t(
				"backend-components.form.back-on-dirty.message"
			)}`;
		});
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
	}, [isSubmitting, readOnly, t, dirty, formDialog, match]);

	// go back confirm dialog if form is dirty
	const customProps: CustomPropsT & {
		goBack?: () => void;
	} = {
		...originalCustomProps,
	};
	if (originalCustomProps && "goBack" in originalCustomProps) {
		const orgGoBack = ((originalCustomProps as unknown) as Pick<
			typeof customProps,
			"goBack"
		>).goBack;
		customProps.goBack =
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
							if (unblock.current) {
								unblock.current();
								unblock.current = undefined;
							}
							orgGoBack();
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
				showErrorDialog(pushDialog, e);
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
					isSubmitting={isSubmitting}
					dirty={dirty}
					submit={handleSubmit}
					customProps={customProps}
				/>
			}
			other={<FormLoaderOverlay visible={isSubmitting} />}
		/>
	);
};

export default React.memo(BasicFormPage) as typeof BasicFormPage;
