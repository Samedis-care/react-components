import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Divider, ListItem, ListItemSecondaryAction, ListItemText, styled, useThemeProps, } from "@mui/material";
import { SmallIconButton, SmallListItemButton, SmallListItemIcon, } from "../Small";
import { Cancel as RemoveIcon } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
const Root = styled(ListItem, { name: "CcMultiSelectEntry", slot: "root" })({
    // the row spans the whole width, the remove button sits on its end
    paddingLeft: 0,
    paddingRight: 0,
});
const selectedStyles = ({ ownerState: { unClickable, ignore }, }) => ({
    ...(unClickable && { cursor: "unset" }),
    ...(ignore && { textDecoration: "line-through" }),
});
// the row of an entry with onClick
const Selected = styled(SmallListItemButton, {
    name: "CcMultiSelectEntry",
    slot: "selected",
})(selectedStyles);
// the row of an entry without onClick: laid out like a list item button, but no control
const SelectedText = styled("div", {
    name: "CcMultiSelectEntry",
    slot: "selected",
})((props) => ({
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    position: "relative",
    minWidth: 0,
    boxSizing: "border-box",
    textAlign: "left",
    padding: "8px 16px",
    ...selectedStyles(props),
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
})({
    // along the bottom edge of the list item, outside its flex row
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
});
const StyledImage = styled("img", {
    name: "CcMultiSelectEntry",
    slot: "image",
})(({ ownerState: { iconSize } }) => ({
    height: iconSize ?? 24,
    width: iconSize ?? 24,
    objectFit: "contain",
}));
/**
 * One selected entry of MultiSelect, rendered as a list item (`<li>`, the
 * `root` slot) of the list of selected entries: the row (`selected`) with the
 * optional icon and the label, and beside it the remove button (`icon`) when
 * `handleDelete` is set. With `data.onClick` the row is a button, otherwise
 * plain text.
 */
const MultiSelectEntry = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiSelectEntry" });
    const { t } = useCCTranslations();
    const { enableIcons, enableDivider, handleDelete, data, classes, iconSize, className, } = props;
    const rowContent = (_jsxs(_Fragment, { children: [enableIcons && (_jsx(SmallListItemIcon, { children: typeof data.icon === "string" ? (_jsx(StyledImage, { ownerState: { iconSize }, src: data.icon, alt: "", className: classes?.image })) : (data.icon) })), _jsx(Label, { className: classes?.label, children: data.label })] }));
    const rowOwnerState = { unClickable: !data.onClick, ignore: !!data.ignore };
    return (_jsxs(Root, { className: combineClassNames([className, classes?.root]), children: [data.onClick ? (_jsx(Selected, { ownerState: rowOwnerState, onClick: data.onClick, className: classes?.selected, children: rowContent })) : (_jsx(SelectedText, { ownerState: rowOwnerState, className: classes?.selected, children: rowContent })), handleDelete && (_jsx(ListItemSecondaryAction, { children: _jsx(StyledRemoveButton, { className: classes?.icon, edge: "end", name: data.value, disabled: !handleDelete, onClick: handleDelete, "aria-label": t("standalone.selector.multi-select.remove-item", {
                        ITEM: data.label,
                    }), children: _jsx(StyledRemoveIcon, { className: classes?.iconSvg }) }) })), enableDivider && _jsx(StyledDivider, { className: classes?.divider })] }));
};
export default React.memo(MultiSelectEntry);
