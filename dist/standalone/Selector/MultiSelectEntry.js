import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { Divider, List, ListItemSecondaryAction, ListItemText, styled, useThemeProps, } from "@mui/material";
import { SmallIconButton, SmallListItemButton, SmallListItemIcon, } from "../Small";
import { Cancel as RemoveIcon } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
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
    const { t } = useCCTranslations();
    const { enableIcons, enableDivider, handleDelete, data, classes, iconSize, className, } = props;
    return (_jsxs(_Fragment, { children: [_jsx(Root, { className: combineClassNames([className, classes?.root]), children: _jsxs(Selected, { ownerState: { unClickable: !data.onClick, ignore: !!data.ignore }, onClick: data.onClick, className: classes?.selected, disableRipple: !data.onClick, disableTouchRipple: !data.onClick, children: [enableIcons && (_jsx(SmallListItemIcon, { children: typeof data.icon === "string" ? (_jsx(StyledImage, { ownerState: { iconSize }, src: data.icon, alt: "", className: classes?.image })) : (data.icon) })), _jsx(Label, { className: classes?.label, children: data.label }), handleDelete && (_jsx(ListItemSecondaryAction, { children: _jsx(StyledRemoveButton, { className: classes?.icon, edge: "end", name: data.value, disabled: !handleDelete, onClick: handleDelete, "aria-label": t("standalone.selector.multi-select.remove-item", {
                                    ITEM: data.label,
                                }), children: _jsx(StyledRemoveIcon, { className: classes?.iconSvg }) }) }))] }) }), enableDivider && _jsx(StyledDivider, { className: classes?.divider })] }));
};
export default React.memo(MultiSelectEntry);
