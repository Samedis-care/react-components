import React from "react";
import { PageProps } from "./Form";
import { CrudFormProps } from "../CRUD";
import { ModelFieldName } from "../../backend-integration";
export interface DefaultFormPageProps extends PageProps<ModelFieldName, CrudFormProps> {
    /**
     * The actual form contents
     */
    children: React.ReactNode;
    /**
     * Show back button only when not enough permission
     */
    showBackButtonOnly?: boolean;
    /**
     * Confirm dialog message
     */
    confirmDialogMessage?: string;
}
declare const _default: React.MemoExoticComponent<(props: DefaultFormPageProps) => React.JSX.Element>;
export default _default;
