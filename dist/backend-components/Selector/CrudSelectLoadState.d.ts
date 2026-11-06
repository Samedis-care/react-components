import React from "react";
export interface CrudSelectLoadStateProps {
    /**
     * Whether the selection is still being loaded
     */
    loading: boolean;
    /**
     * The error the load of the selection failed with, or null
     */
    loadError: Error | null;
    /**
     * The field's label, which the failure message names; undefined for a field without
     * a label
     */
    label: string | undefined;
}
declare const _default: React.MemoExoticComponent<(props: CrudSelectLoadStateProps) => React.JSX.Element | null>;
export default _default;
