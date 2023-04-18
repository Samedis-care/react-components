var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from "react";
import { Divider, List, ListItemSecondaryAction, ListItemText, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { SmallIconButton, SmallListItemButton, SmallListItemIcon, } from "../Small";
import { Cancel as RemoveIcon } from "@mui/icons-material";
import { combineClassNames } from "../../utils";
var useStyles = makeStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41;
    return ({
        root: {},
        divider: {},
        container: __assign({ border: (_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.selector) === null || _b === void 0 ? void 0 : _b.selected) === null || _c === void 0 ? void 0 : _c.container) === null || _d === void 0 ? void 0 : _d.border, borderRadius: (_h = (_g = (_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.selector) === null || _f === void 0 ? void 0 : _f.selected) === null || _g === void 0 ? void 0 : _g.container) === null || _h === void 0 ? void 0 : _h.borderRadius, margin: (_m = (_l = (_k = (_j = theme.componentsCare) === null || _j === void 0 ? void 0 : _j.selector) === null || _k === void 0 ? void 0 : _k.selected) === null || _l === void 0 ? void 0 : _l.container) === null || _m === void 0 ? void 0 : _m.margin, padding: (_r = (_q = (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.selector) === null || _p === void 0 ? void 0 : _p.selected) === null || _q === void 0 ? void 0 : _q.container) === null || _r === void 0 ? void 0 : _r.padding, backgroundColor: (_v = (_u = (_t = (_s = theme.componentsCare) === null || _s === void 0 ? void 0 : _s.selector) === null || _t === void 0 ? void 0 : _t.selected) === null || _u === void 0 ? void 0 : _u.container) === null || _v === void 0 ? void 0 : _v.backgroundColor }, (_z = (_y = (_x = (_w = theme.componentsCare) === null || _w === void 0 ? void 0 : _w.selector) === null || _x === void 0 ? void 0 : _x.selected) === null || _y === void 0 ? void 0 : _y.container) === null || _z === void 0 ? void 0 : _z.style),
        selected: __assign({ border: (_2 = (_1 = (_0 = theme.componentsCare) === null || _0 === void 0 ? void 0 : _0.selector) === null || _1 === void 0 ? void 0 : _1.selected) === null || _2 === void 0 ? void 0 : _2.border, borderRadius: (_5 = (_4 = (_3 = theme.componentsCare) === null || _3 === void 0 ? void 0 : _3.selector) === null || _4 === void 0 ? void 0 : _4.selected) === null || _5 === void 0 ? void 0 : _5.borderRadius, margin: (_8 = (_7 = (_6 = theme.componentsCare) === null || _6 === void 0 ? void 0 : _6.selector) === null || _7 === void 0 ? void 0 : _7.selected) === null || _8 === void 0 ? void 0 : _8.margin, padding: (_11 = (_10 = (_9 = theme.componentsCare) === null || _9 === void 0 ? void 0 : _9.selector) === null || _10 === void 0 ? void 0 : _10.selected) === null || _11 === void 0 ? void 0 : _11.padding, backgroundColor: (_14 = (_13 = (_12 = theme.componentsCare) === null || _12 === void 0 ? void 0 : _12.selector) === null || _13 === void 0 ? void 0 : _13.selected) === null || _14 === void 0 ? void 0 : _14.backgroundColor }, (_17 = (_16 = (_15 = theme.componentsCare) === null || _15 === void 0 ? void 0 : _15.selector) === null || _16 === void 0 ? void 0 : _16.selected) === null || _17 === void 0 ? void 0 : _17.style),
        ignored: {
            textDecoration: "line-through",
        },
        label: __assign({ margin: (_21 = (_20 = (_19 = (_18 = theme.componentsCare) === null || _18 === void 0 ? void 0 : _18.selector) === null || _19 === void 0 ? void 0 : _19.selected) === null || _20 === void 0 ? void 0 : _20.label) === null || _21 === void 0 ? void 0 : _21.margin, padding: ((_25 = (_24 = (_23 = (_22 = theme.componentsCare) === null || _22 === void 0 ? void 0 : _22.selector) === null || _23 === void 0 ? void 0 : _23.selected) === null || _24 === void 0 ? void 0 : _24.label) === null || _25 === void 0 ? void 0 : _25.padding) ||
                "0 32px 0 0", color: (_29 = (_28 = (_27 = (_26 = theme.componentsCare) === null || _26 === void 0 ? void 0 : _26.selector) === null || _27 === void 0 ? void 0 : _27.selected) === null || _28 === void 0 ? void 0 : _28.label) === null || _29 === void 0 ? void 0 : _29.color, "& > span": {
                textOverflow: "ellipsis",
                overflow: "hidden",
            } }, (_33 = (_32 = (_31 = (_30 = theme.componentsCare) === null || _30 === void 0 ? void 0 : _30.selector) === null || _31 === void 0 ? void 0 : _31.selected) === null || _32 === void 0 ? void 0 : _32.label) === null || _33 === void 0 ? void 0 : _33.style),
        image: function (props) {
            var _a, _b;
            return ({
                height: (_a = props.iconSize) !== null && _a !== void 0 ? _a : 24,
                width: (_b = props.iconSize) !== null && _b !== void 0 ? _b : 24,
                objectFit: "contain",
            });
        },
        icon: __assign({}, (_37 = (_36 = (_35 = (_34 = theme.componentsCare) === null || _34 === void 0 ? void 0 : _34.selector) === null || _35 === void 0 ? void 0 : _35.selected) === null || _36 === void 0 ? void 0 : _36.icon) === null || _37 === void 0 ? void 0 : _37.style),
        iconSvg: {
            fill: (_41 = (_40 = (_39 = (_38 = theme.componentsCare) === null || _38 === void 0 ? void 0 : _38.selector) === null || _39 === void 0 ? void 0 : _39.selected) === null || _40 === void 0 ? void 0 : _40.icon) === null || _41 === void 0 ? void 0 : _41.color,
        },
    });
}, { name: "CcMultiSelectEntry" });
var MultiSelectEntry = function (props) {
    var enableIcons = props.enableIcons, enableDivider = props.enableDivider, handleDelete = props.handleDelete, data = props.data;
    var classes = useStyles(props);
    return (React.createElement(React.Fragment, null,
        React.createElement(List, { className: combineClassNames([classes.root, classes.container]) },
            React.createElement(SmallListItemButton, { onClick: data.onClick, className: combineClassNames([
                    classes.selected,
                    data.ignore && classes.ignored,
                ]) },
                enableIcons && (React.createElement(SmallListItemIcon, null, typeof data.icon === "string" ? (React.createElement("img", { src: data.icon, alt: "", className: classes.image })) : (data.icon))),
                React.createElement(ListItemText, { className: classes.label }, data.label),
                handleDelete && (React.createElement(ListItemSecondaryAction, null,
                    React.createElement(SmallIconButton, { className: classes.icon, edge: "end", name: data.value, disabled: !handleDelete, onClick: handleDelete },
                        React.createElement(RemoveIcon, { className: classes.iconSvg })))))),
        enableDivider && React.createElement(Divider, { className: classes.divider })));
};
export default React.memo(MultiSelectEntry);
