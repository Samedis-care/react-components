import React, { useCallback } from "react";
import { Grid, Switch, Typography } from "@material-ui/core";
var FilterCombinator = function (props) {
    var value = props.value, onChange = props.onChange;
    var handleChange = useCallback(function (_evt, newValue) {
        onChange(newValue ? "or" : "and");
    }, [onChange]);
    return (React.createElement(Grid, { item: true, xs: 12 },
        React.createElement(Typography, { component: "div" },
            React.createElement(Grid, { component: "label", container: true, justify: "space-between", alignItems: "center", spacing: 1 },
                React.createElement(Grid, { item: true }, "AND"),
                React.createElement(Grid, { item: true },
                    React.createElement(Switch, { checked: value === "or", onChange: handleChange })),
                React.createElement(Grid, { item: true }, "OR")))));
};
export default React.memo(FilterCombinator);
