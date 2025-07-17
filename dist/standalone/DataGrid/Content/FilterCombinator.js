import React, { useCallback } from "react";
import { Grid, Switch, Typography } from "@mui/material";
import useCCTranslations from "../../../utils/useCCTranslations";
const FilterCombinator = (props) => {
    const { value, onChange } = props;
    const { t } = useCCTranslations();
    const handleChange = useCallback((_evt, newValue) => {
        onChange(newValue ? "or" : "and");
    }, [onChange]);
    return (React.createElement(Grid, { size: 12 },
        React.createElement(Typography, { component: "div" },
            React.createElement(Grid, { component: "label", container: true, justifyContent: "space-between", alignItems: "center", spacing: 1 },
                React.createElement(Grid, null, t("standalone.data-grid.content.filter-combination.and")),
                React.createElement(Grid, null,
                    React.createElement(Switch, { checked: value === "or", onChange: handleChange })),
                React.createElement(Grid, null, t("standalone.data-grid.content.filter-combination.or"))))));
};
export default React.memo(FilterCombinator);
