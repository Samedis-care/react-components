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
import { ListItemButton, ListItemIcon, ListItemText, } from "@mui/material";
import { withStyles } from "@mui/styles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
var StyledListItem = withStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
    return ({
        root: __assign({ borderRadius: (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.portal) === null || _b === void 0 ? void 0 : _b.menuItem) === null || _c === void 0 ? void 0 : _c.borderRadius, border: (_f = (_e = (_d = theme.componentsCare) === null || _d === void 0 ? void 0 : _d.portal) === null || _e === void 0 ? void 0 : _e.menuItem) === null || _f === void 0 ? void 0 : _f.border, backgroundColor: (_j = (_h = (_g = theme.componentsCare) === null || _g === void 0 ? void 0 : _g.portal) === null || _h === void 0 ? void 0 : _h.menuItem) === null || _j === void 0 ? void 0 : _j.backgroundColor, color: (_m = (_l = (_k = theme.componentsCare) === null || _k === void 0 ? void 0 : _k.portal) === null || _l === void 0 ? void 0 : _l.menuItem) === null || _m === void 0 ? void 0 : _m.color, padding: (_q = (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.portal) === null || _p === void 0 ? void 0 : _p.menuItem) === null || _q === void 0 ? void 0 : _q.padding, margin: (_t = (_s = (_r = theme.componentsCare) === null || _r === void 0 ? void 0 : _r.portal) === null || _s === void 0 ? void 0 : _s.menuItem) === null || _t === void 0 ? void 0 : _t.margin, "& svg": __assign({ fill: ((_x = (_w = (_v = (_u = theme.componentsCare) === null || _u === void 0 ? void 0 : _u.portal) === null || _v === void 0 ? void 0 : _v.menuItem) === null || _w === void 0 ? void 0 : _w.icon) === null || _x === void 0 ? void 0 : _x.color) ||
                    ((_0 = (_z = (_y = theme.componentsCare) === null || _y === void 0 ? void 0 : _y.portal) === null || _z === void 0 ? void 0 : _z.menuItem) === null || _0 === void 0 ? void 0 : _0.color) }, (_4 = (_3 = (_2 = (_1 = theme.componentsCare) === null || _1 === void 0 ? void 0 : _1.portal) === null || _2 === void 0 ? void 0 : _2.menuItem) === null || _3 === void 0 ? void 0 : _3.icon) === null || _4 === void 0 ? void 0 : _4.style) }, (_7 = (_6 = (_5 = theme.componentsCare) === null || _5 === void 0 ? void 0 : _5.portal) === null || _6 === void 0 ? void 0 : _6.menuItem) === null || _7 === void 0 ? void 0 : _7.style),
    });
})(ListItemButton);
var MenuItemMaterial = function (props) {
    var Icon = props.icon;
    return (React.createElement(StyledListItem, { onClick: props.onClick, onAuxClick: props.onAuxClick, selected: props.active },
        React.createElement(ListItemIcon, null, Icon && React.createElement(Icon, null)),
        React.createElement(ListItemText, { primary: props.title }),
        props.expandable && (props.expanded ? React.createElement(ExpandLess, null) : React.createElement(ExpandMore, null))));
};
export default React.memo(MenuItemMaterial);
