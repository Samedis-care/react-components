import React from "react";
import { FormContextData, PageProps } from "..";
import { ModelFieldName } from "../../backend-integration";
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
     * Confirm dialog message
     */
    confirmDialogMessage?: string;
}
export interface BasicFormPageProps<RendererPropsT, CustomPropsT> extends PageProps<ModelFieldName, CustomPropsT> {
    /**
     * Called after submit successfully completed
     */
    postSubmitHandler?: () => Promise<void> | void;
    /**
     * The form page contents renderer
     */
    children: React.ComponentType<BasicFormPageRendererProps<CustomPropsT> & RendererPropsT>;
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
declare const _default: <RendererPropsT, CustomPropsT>(props: BasicFormPageProps<RendererPropsT, CustomPropsT>) => JSX.Element;
export default _default;
