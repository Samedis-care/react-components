import React from "react";
import { styled, Grid2 as Grid, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
const Container = styled(Grid, { name: "CcFormButtons", slot: "root" })(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
}));
const ButtonWrapper = styled(Grid, {
    name: "CcFormButtons",
    slot: "buttonWrapper",
})(({ theme }) => ({
    margin: theme.spacing(0, 1, 0, 0),
    "&:first-of-type": {
        marginLeft: 0,
    },
    "&:last-of-type": {
        marginRight: 0,
    },
}));
const FormButtons = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormButtons" });
    const children = (Array.isArray(props.children) ? props.children : [props.children]).filter((child) => child !== undefined && child !== null && child !== false);
    if (children.length === 0)
        return React.createElement(React.Fragment, null);
    return (React.createElement(Container, { container: true, direction: "row", spacing: 2, wrap: "nowrap", className: combineClassNames([props.classes?.root, props.className]) }, children.map((child, index) => {
        return (React.createElement(ButtonWrapper, { key: index, className: props.classes?.buttonWrapper }, child));
    })));
};
export default React.memo(FormButtons);
