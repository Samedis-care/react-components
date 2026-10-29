import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { CircularProgress, styled, Typography, useThemeProps, } from "@mui/material";
import GroupBox from "../../standalone/GroupBox";
import useCCTranslations from "../../utils/useCCTranslations";
const Message = styled(Typography, {
    name: "CcCrudLoadStatus",
    slot: "message",
})({});
// a backend's message can be a code or a URL without break opportunities
const Detail = styled(Typography, {
    name: "CcCrudLoadStatus",
    slot: "detail",
})({
    overflowWrap: "anywhere",
});
/**
 * The frame of a field whose records are still being loaded, or failed to load
 * @remarks Keeps the field's label in place, so that assistive technology can tell which
 *          field is loading (`aria-busy`, a named spinner) and which one failed (an
 *          alert), and the layout does not jump by the field's height when it is done.
 */
const CrudLoadStatus = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcCrudLoadStatus" });
    const { label, smallLabel, className, kind, error, classes } = props;
    const { t } = useCCTranslations();
    return (_jsx(GroupBox, { label: label, smallLabel: smallLabel, className: className, busy: !error, children: error ? (_jsxs("div", { role: "alert", children: [_jsx(Message, { className: classes?.message, children: t(`backend-components.file-upload.load-failed.${kind}`) }), error.message && (_jsx(Detail, { variant: "body2", color: "textSecondary", className: classes?.detail, children: error.message }))] })) : (_jsx(CircularProgress, { "aria-label": t("backend-components.file-upload.loading") })) }));
};
export default React.memo(CrudLoadStatus);
