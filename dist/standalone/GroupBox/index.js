import React from "react";
import combineClassNames from "../../utils/combineClassNames";
import { styled, useThemeProps } from "@mui/material";
const GroupBoxRoot = styled("fieldset", { name: "CcGroupBox", slot: "root" })(({ theme }) => ({
    padding: "8px",
    borderStyle: "solid",
    borderColor: "lightgrey",
    borderRadius: theme.shape.borderRadius,
    borderWidth: 1,
    position: "relative",
    maxHeight: "inherit",
    height: "100%",
    marginLeft: 0,
    marginRight: 0,
    minWidth: 0,
    width: "100%",
}));
const GroupBoxLegend = styled("legend", {
    name: "CcGroupBox",
    slot: "legend",
})(({ ownerState: { smallLabel } }) => ({
    paddingInlineStart: 5,
    paddingInlineEnd: 5,
    ...(smallLabel && {
        fontSize: "0.75em",
    }),
}));
const GroupBox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcGroupBox" });
    const { id, label, children, smallLabel, className, classes } = props;
    return (React.createElement(GroupBoxRoot, { id: id, className: combineClassNames([className, classes?.root]) },
        label && (React.createElement(GroupBoxLegend, { ownerState: { smallLabel: !!smallLabel } }, label)),
        children));
};
export default React.memo(GroupBox);
