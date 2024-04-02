import React from "react";
import { Divider, List, ListItemSecondaryAction, ListItemText, styled, useThemeProps, } from "@mui/material";
import { SmallIconButton, SmallListItemButton, SmallListItemIcon, } from "../Small";
import { Cancel as RemoveIcon } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
const Root = styled(List, { name: "CcMultiSelectEntry", slot: "root" })({});
const Selected = styled(SmallListItemButton, {
    name: "CcMultiSelectEntry",
    slot: "selected",
})(({ ownerState: { unClickable, ignore } }) => ({
    ...(unClickable && { cursor: "unset" }),
    ...(ignore && { textDecoration: "line-through" }),
}));
const Label = styled(ListItemText, {
    name: "CcMultiSelectEntry",
    slot: "label",
})({
    padding: "0 32px 0 0",
    "& > span": {
        textOverflow: "ellipsis",
        overflow: "hidden",
    },
});
const StyledRemoveButton = styled(SmallIconButton, {
    name: "CcMultiSelectEntry",
    slot: "icon",
})({});
const StyledRemoveIcon = styled(RemoveIcon, {
    name: "CcMultiSelectEntry",
    slot: "iconSvg",
})({});
const StyledDivider = styled(Divider, {
    name: "CcMultiSelectEntry",
    slot: "divider",
})({});
const StyledImage = styled("img", {
    name: "CcMultiSelectEntry",
    slot: "image",
})(({ ownerState: { iconSize } }) => ({
    height: iconSize ?? 24,
    width: iconSize ?? 24,
    objectFit: "contain",
}));
const MultiSelectEntry = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiSelectEntry" });
    const { enableIcons, enableDivider, handleDelete, data, classes, iconSize, className, } = props;
    return (React.createElement(React.Fragment, null,
        React.createElement(Root, { className: combineClassNames([className, classes?.root]) },
            React.createElement(Selected, { ownerState: { unClickable: !data.onClick, ignore: !!data.ignore }, onClick: data.onClick, className: classes?.selected, disableRipple: !data.onClick, disableTouchRipple: !data.onClick },
                enableIcons && (React.createElement(SmallListItemIcon, null, typeof data.icon === "string" ? (React.createElement(StyledImage, { ownerState: { iconSize }, src: data.icon, alt: "", className: classes?.image })) : (data.icon))),
                React.createElement(Label, { className: classes?.label }, data.label),
                handleDelete && (React.createElement(ListItemSecondaryAction, null,
                    React.createElement(StyledRemoveButton, { className: classes?.icon, edge: "end", name: data.value, disabled: !handleDelete, onClick: handleDelete },
                        React.createElement(StyledRemoveIcon, { className: classes?.iconSvg })))))),
        enableDivider && React.createElement(StyledDivider, { className: classes?.divider })));
};
export default React.memo(MultiSelectEntry);
