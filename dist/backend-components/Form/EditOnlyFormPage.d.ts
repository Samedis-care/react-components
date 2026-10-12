import React from "react";
import { ModelUnknown } from "../../backend-integration";
import { PageProps } from "./Form";
export interface EditOnlyFormPageProps extends PageProps<ModelUnknown, undefined> {
    /**
     * The actual form contents
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: EditOnlyFormPageProps) => React.JSX.Element>;
export default _default;
