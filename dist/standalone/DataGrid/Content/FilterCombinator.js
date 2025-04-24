import React, { useCallback } from "react";
import { Grid2 as Grid, Switch, Typography } from "@mui/material";
const FilterCombinator = (props) => {
    const { value, onChange } = props;
    const handleChange = useCallback((_evt, newValue) => {
        onChange(newValue ? "or" : "and");
    }, [onChange]);
    return (React.createElement(Grid, { size: 12 },
        React.createElement(Typography, { component: "div" },
            React.createElement(Grid, { component: "label", container: true, justifyContent: "space-between", alignItems: "center", spacing: 1 },
                React.createElement(Grid, null, "AND"),
                React.createElement(Grid, null,
                    React.createElement(Switch, { checked: value === "or", onChange: handleChange })),
                React.createElement(Grid, null, "OR")))));
};
export default React.memo(FilterCombinator);
