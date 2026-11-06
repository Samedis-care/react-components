import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { styled, Grid, useThemeProps } from "@mui/material";
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
    // flat, without null, undefined and booleans, each element keyed by its own key
    // or its original position, so a removed button does not shift the others' slots
    const children = React.Children.toArray(props.children);
    if (children.length === 0)
        return _jsx(_Fragment, {});
    return (_jsx(Container, { container: true, direction: "row", spacing: 2, wrap: "nowrap", className: combineClassNames([props.classes?.root, props.className]), children: children.map((child, index) => (_jsx(ButtonWrapper, { className: props.classes?.buttonWrapper, children: child }, React.isValidElement(child) ? child.key : index))) }));
};
export default React.memo(FormButtons);
