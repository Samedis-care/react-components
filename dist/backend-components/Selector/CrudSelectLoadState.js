import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { FormHelperText } from "@mui/material";
import useCCTranslations from "../../utils/useCCTranslations";
/**
 * The line under a CRUD select's field that says its selection is loading (a status), or
 * that loading it failed (an alert, announced once). Renders nothing once the selection
 * is loaded. The error itself is not shown: its message is technical.
 */
const CrudSelectLoadState = (props) => {
    const { loading, loadError, label } = props;
    const { t } = useCCTranslations();
    if (loading)
        return (_jsx(FormHelperText, { role: "status", children: t("backend-components.selector.loading") }));
    if (loadError)
        return (_jsx(FormHelperText, { error: true, role: "alert", children: label
                ? t("backend-components.selector.selection-load-error", {
                    LABEL: label,
                })
                : t("backend-components.selector.selection-load-error-unlabelled") }));
    return null;
};
export default React.memo(CrudSelectLoadState);
