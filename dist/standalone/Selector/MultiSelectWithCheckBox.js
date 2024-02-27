import React from "react";
import { Checkbox, InputBase, InputLabel, ListItemText, MenuItem, Select, } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { cleanClassMap, makeThemeStyles } from "../../utils";
import { makeStyles, withStyles } from "@mui/styles";
import { getStringLabel } from "./BaseSelector";
import uniqueArray from "../../utils/uniqueArray";
const useStyles = makeStyles((theme) => ({
    checkboxStyle: {
        borderRadius: 4,
        width: 16,
        height: 16,
        marginRight: 10,
        ...theme.componentsCare?.selectorWithCheckbox?.checkboxStyle,
    },
    label: {
        marginTop: 1,
    },
}), { name: "CcMultiSelectWithCheckBox" });
const MenuItemCustom = withStyles((theme) => ({
    selected: {
        backgroundColor: "white !important",
        ...theme.componentsCare?.selectorWithCheckbox?.itemSelectedStyle,
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04) !important",
            ...theme.componentsCare?.selectorWithCheckbox?.itemSelectedHoverStyle,
        },
    },
}))(MenuItem);
const MenuItemGroup = withStyles({
    root: {
        paddingTop: 0,
        paddingBottom: 0,
    },
})(MenuItem);
const ListItemTextCustom = withStyles((theme) => ({
    primary: {
        fontSize: 13,
        ...theme.componentsCare?.selectorWithCheckbox?.itemTextPrimaryStyle,
    },
}))(ListItemText);
const GroupItemText = withStyles((theme) => ({
    root: {
        ...theme.typography.caption,
        marginTop: 0,
        marginBottom: 0,
    },
}))(ListItemText);
const InputCustom = withStyles((theme) => ({
    root: {
        ...theme.componentsCare?.selectorWithCheckbox?.inputRootStyle,
    },
    input: {
        borderRadius: theme.shape.borderRadius,
        position: "relative",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid #ced4da",
        fontSize: 13,
        padding: 8,
        transition: theme.transitions.create(["border-color", "box-shadow"]),
        ...theme.componentsCare?.selectorWithCheckbox?.inputStyle,
        "&:focus": {
            borderRadius: theme.shape.borderRadius,
            borderColor: theme.palette.primary.main,
            ...theme.componentsCare?.selectorWithCheckbox?.inputFocusStyle,
        },
    },
}))(InputBase);
const useSelectStyles = makeThemeStyles((theme) => ({
    root: {},
    select: {},
    filled: {},
    outlined: {},
    selectMenu: {},
    disabled: {},
    icon: {},
    iconOpen: {},
    iconFilled: {},
    iconOutlined: {},
    ...theme?.componentsCare?.selectorWithCheckbox?.selectStyle,
}), "CcMultiSelectWithCheckboxSelect");
const MultiSelectWithCheckBox = (props) => {
    const { label, options, values, ...selectProps } = props;
    const classes = useStyles(cleanClassMap(props, false, "checkboxStyle"));
    const selectClasses = useSelectStyles(cleanClassMap(props, true, "checkboxStyle"));
    const groupsEnabled = options.find((opt) => !!opt.group);
    const renderOption = (option) => {
        return (React.createElement(MenuItemCustom, { key: getStringLabel(option), value: option.value },
            React.createElement(Checkbox, { checked: values.indexOf(option.value) > -1, className: classes.checkboxStyle }),
            React.createElement(ListItemTextCustom, { primary: option.label })));
    };
    return (React.createElement(React.Fragment, null,
        props.label && (React.createElement(InputLabel, { shrink: true, className: classes.label }, label)),
        React.createElement(Select, { ...selectProps, multiple: true, displayEmpty: true, classes: selectClasses, value: values, input: React.createElement(InputCustom, null), IconComponent: ExpandMore, MenuProps: {
                anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                },
                transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                },
                PaperProps: {
                    style: {
                        marginTop: 5,
                        border: "1px solid #d3d4d5",
                    },
                },
            } }, groupsEnabled
            ? (() => {
                const groups = uniqueArray(options.map((opt) => opt.group ?? "?" /* handle no group */)).sort();
                return groups.map((group) => [
                    React.createElement(MenuItemGroup, { disabled: true, value: `group-${group}`, key: `group-${group}` },
                        React.createElement(GroupItemText, { disableTypography: true, primary: group })),
                    ...options
                        .filter((opt) => opt.group === group)
                        .map(renderOption),
                ]);
            })()
            : options.map(renderOption))));
};
export default React.memo(MultiSelectWithCheckBox);
