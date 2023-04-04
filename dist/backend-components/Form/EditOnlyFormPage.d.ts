import React from "react";
import { ModelFieldName } from "../../backend-integration";
import { PageProps } from "./Form";
export interface EditOnlyFormPageProps extends PageProps<ModelFieldName, undefined> {
    /**
     * The actual form contents
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: EditOnlyFormPageProps) => JSX.Element>;
export default _default;
