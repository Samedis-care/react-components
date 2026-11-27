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
    /**
     * Whether a change of the loaded selection is being written (UseCrudSelectResult.writing)
     */
    writing: boolean;
}
declare const _default: React.MemoExoticComponent<(props: CrudSelectLoadStateProps) => React.JSX.Element>;
export default _default;
