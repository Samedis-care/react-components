import React from "react";
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"legend" | "smallLabel" | "fieldSetRoot">;
export interface GroupBoxProps {
    /**
     * The HTML id of the fieldset
     */
    id?: string;
    /**
     * The label of the box
     */
    label: React.ReactNode;
    /**
     * The label type of the box
     */
    smallLabel?: boolean;
    /**
     * Box contents
     */
    children?: React.ReactNode;
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const _default: React.MemoExoticComponent<(props: GroupBoxProps) => JSX.Element>;
export default _default;
