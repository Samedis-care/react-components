import React from "react";
import { FormContextData, PageProps } from "../Form";
import { ModelFieldName } from "../../backend-integration/Model/Model";
import { FormPageLayoutProps } from "../../standalone/Form/FormPageLayout";
import { CrudFormProps } from "../CRUD";
export interface BasicFormPageRendererProps<CustomPropsT> extends Omit<PageProps<ModelFieldName, CustomPropsT>, "submit" | "dirty"> {
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
    goBack: (forceRefresh?: boolean, forceNavigate?: boolean) => Promise<void> | void;
};
export type EnhancedCustomProps<T> = T extends Pick<CrudFormProps, "goBack"> ? Omit<T, "goBack"> & EnhancedGoBackType : T;
export interface BasicFormPageProps<RendererPropsT, CustomPropsT> extends PageProps<ModelFieldName, CustomPropsT> {
    /**
     * Called after submit successfully completed
     */
    postSubmitHandler?: () => Promise<void> | void;
    /**
     * The form page contents renderer
     */
    children: React.ComponentType<BasicFormPageRendererProps<EnhancedCustomProps<CustomPropsT>> & RendererPropsT>;
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
declare const BasicFormPage: <RendererPropsT, CustomPropsT>(inProps: BasicFormPageProps<RendererPropsT, CustomPropsT>) => React.JSX.Element;
declare const _default: typeof BasicFormPage;
export default _default;
