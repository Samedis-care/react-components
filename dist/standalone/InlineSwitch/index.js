import React, { useCallback } from "react";
import { Grid, styled, Switch, Typography, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
const AntSwitch = styled(Switch, { name: "CcInlineSwitch", slot: "switch" })(({ theme }) => ({
    width: 35,
    height: 16,
    padding: 0,
    display: "flex",
    "& .MuiSwitch-switchBase": {
        padding: 2,
        color: theme.palette.grey[500],
        "&.Mui-checked": {
            transform: "translateX(18px)",
            color: theme.palette.common.white,
            "& + .MuiSwitch-track": {
                opacity: 1,
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
            },
        },
    },
    "& .MuiSwitch-thumb": {
        width: 12,
        height: 12,
        boxShadow: "none",
    },
    "& .MuiSwitch-track": {
        border: `1px solid ${theme.palette.grey[500]}`,
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: theme.palette.common.white,
    },
}));
const StyledRoot = styled("div", { name: "CcInlineSwitch", slot: "root" })({
    marginTop: 15,
});
const StyledSwitchWrapper = styled(Typography, {
    name: "CcInlineSwitch",
    slot: "switchWrapper",
})({
    lineHeight: "30px",
    float: "right",
});
const InlineSwitch = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcInlineSwitch" });
    const { label, value, onChange, visible, children, classes, className } = props;
    const handleSwitchChange = useCallback((event) => {
        if (onChange)
            onChange(event.target.checked);
    }, [onChange]);
    return (React.createElement(StyledRoot, { className: combineClassNames([className, classes?.root]) },
        visible && (React.createElement(StyledSwitchWrapper, { component: "div", className: classes?.switchWrapper, variant: "caption" },
            React.createElement(Grid, { component: "label", container: true, alignItems: "center", spacing: 1 },
                React.createElement(Grid, { item: true },
                    React.createElement(AntSwitch, { checked: value, onChange: handleSwitchChange })),
                React.createElement(Grid, { item: true }, label)))),
        React.createElement("div", null, children)));
};
export default React.memo(InlineSwitch);
