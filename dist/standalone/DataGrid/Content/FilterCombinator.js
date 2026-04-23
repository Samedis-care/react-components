import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Grid, Switch, Typography } from "@mui/material";
import useCCTranslations from "../../../utils/useCCTranslations";
const FilterCombinator = (props) => {
    const { value, onChange } = props;
    const { t } = useCCTranslations();
    const handleChange = useCallback((_evt, newValue) => {
        onChange(newValue ? "or" : "and");
    }, [onChange]);
    return (_jsx(Grid, { size: 12, children: _jsx(Typography, { component: "div", children: _jsxs(Grid, { component: "label", container: true, sx: { justifyContent: "space-between", alignItems: "center" }, spacing: 1, children: [_jsx(Grid, { children: t("standalone.data-grid.content.filter-combination.and") }), _jsx(Grid, { children: _jsx(Switch, { checked: value === "or", onChange: handleChange }) }), _jsx(Grid, { children: t("standalone.data-grid.content.filter-combination.or") })] }) }) }));
};
export default React.memo(FilterCombinator);
