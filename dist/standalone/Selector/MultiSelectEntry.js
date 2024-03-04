import React from "react";
import { Divider, List, ListItemSecondaryAction, ListItemText, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { SmallIconButton, SmallListItemButton, SmallListItemIcon, } from "../Small";
import { Cancel as RemoveIcon } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
const useStyles = makeStyles((theme) => ({
    root: {},
    divider: {},
    container: {
        border: theme.componentsCare?.selector?.selected?.container?.border,
        borderRadius: theme.componentsCare?.selector?.selected?.container?.borderRadius,
        margin: theme.componentsCare?.selector?.selected?.container?.margin,
        padding: theme.componentsCare?.selector?.selected?.container?.padding,
        backgroundColor: theme.componentsCare?.selector?.selected?.container?.backgroundColor,
        ...theme.componentsCare?.selector?.selected?.container?.style,
    },
    selected: {
        border: theme.componentsCare?.selector?.selected?.border,
        borderRadius: theme.componentsCare?.selector?.selected?.borderRadius,
        margin: theme.componentsCare?.selector?.selected?.margin,
        padding: theme.componentsCare?.selector?.selected?.padding,
        backgroundColor: theme.componentsCare?.selector?.selected?.backgroundColor,
        ...theme.componentsCare?.selector?.selected?.style,
    },
    unClickable: {
        cursor: "unset",
    },
    ignored: {
        textDecoration: "line-through",
    },
    label: {
        margin: theme.componentsCare?.selector?.selected?.label?.margin,
        padding: theme.componentsCare?.selector?.selected?.label?.padding ||
            "0 32px 0 0",
        color: theme.componentsCare?.selector?.selected?.label?.color,
        "& > span": {
            textOverflow: "ellipsis",
            overflow: "hidden",
        },
        ...theme.componentsCare?.selector?.selected?.label?.style,
    },
    image: (props) => ({
        height: props.iconSize ?? 24,
        width: props.iconSize ?? 24,
        objectFit: "contain",
    }),
    icon: {
        ...theme.componentsCare?.selector?.selected?.icon?.style,
    },
    iconSvg: {
        fill: theme.componentsCare?.selector?.selected?.icon?.color,
    },
}), { name: "CcMultiSelectEntry" });
const MultiSelectEntry = (props) => {
    const { enableIcons, enableDivider, handleDelete, data } = props;
    const classes = useStyles(props);
    return (React.createElement(React.Fragment, null,
        React.createElement(List, { className: combineClassNames([classes.root, classes.container]) },
            React.createElement(SmallListItemButton, { onClick: data.onClick, className: combineClassNames([
                    classes.selected,
                    !data.onClick && classes.unClickable,
                    data.ignore && classes.ignored,
                ]), disableRipple: !data.onClick, disableTouchRipple: !data.onClick },
                enableIcons && (React.createElement(SmallListItemIcon, null, typeof data.icon === "string" ? (React.createElement("img", { src: data.icon, alt: "", className: classes.image })) : (data.icon))),
                React.createElement(ListItemText, { className: classes.label }, data.label),
                handleDelete && (React.createElement(ListItemSecondaryAction, null,
                    React.createElement(SmallIconButton, { className: classes.icon, edge: "end", name: data.value, disabled: !handleDelete, onClick: handleDelete },
                        React.createElement(RemoveIcon, { className: classes.iconSvg })))))),
        enableDivider && React.createElement(Divider, { className: classes.divider })));
};
export default React.memo(MultiSelectEntry);
