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
import { makeStyles, Grid } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";
var useStyles = makeStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25;
    return ({
        container: __assign({ width: (_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.formButtons) === null || _c === void 0 ? void 0 : _c.container) === null || _d === void 0 ? void 0 : _d.width, margin: (_h = (_g = (_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.uiKit) === null || _f === void 0 ? void 0 : _f.formButtons) === null || _g === void 0 ? void 0 : _g.container) === null || _h === void 0 ? void 0 : _h.margin, padding: ((_m = (_l = (_k = (_j = theme.componentsCare) === null || _j === void 0 ? void 0 : _j.uiKit) === null || _k === void 0 ? void 0 : _k.formButtons) === null || _l === void 0 ? void 0 : _l.container) === null || _m === void 0 ? void 0 : _m.padding) ||
                theme.spacing(3), border: ((_r = (_q = (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.uiKit) === null || _p === void 0 ? void 0 : _p.formButtons) === null || _q === void 0 ? void 0 : _q.container) === null || _r === void 0 ? void 0 : _r.border) ||
                undefined, borderRadius: (_v = (_u = (_t = (_s = theme.componentsCare) === null || _s === void 0 ? void 0 : _s.uiKit) === null || _t === void 0 ? void 0 : _t.formButtons) === null || _u === void 0 ? void 0 : _u.container) === null || _v === void 0 ? void 0 : _v.borderRadius, backgroundColor: fade(((_z = (_y = (_x = (_w = theme.componentsCare) === null || _w === void 0 ? void 0 : _w.uiKit) === null || _x === void 0 ? void 0 : _x.formButtons) === null || _y === void 0 ? void 0 : _y.container) === null || _z === void 0 ? void 0 : _z.backgroundColor) ||
                theme.palette.background.paper, ((_3 = (_2 = (_1 = (_0 = theme.componentsCare) === null || _0 === void 0 ? void 0 : _0.uiKit) === null || _1 === void 0 ? void 0 : _1.formButtons) === null || _2 === void 0 ? void 0 : _2.container) === null || _3 === void 0 ? void 0 : _3.backgroundColorOpacity) || 1) }, (_7 = (_6 = (_5 = (_4 = theme.componentsCare) === null || _4 === void 0 ? void 0 : _4.uiKit) === null || _5 === void 0 ? void 0 : _5.formButtons) === null || _6 === void 0 ? void 0 : _6.container) === null || _7 === void 0 ? void 0 : _7.style),
        buttonWrapper: __assign({ margin: ((_11 = (_10 = (_9 = (_8 = theme.componentsCare) === null || _8 === void 0 ? void 0 : _8.uiKit) === null || _9 === void 0 ? void 0 : _9.formButtons) === null || _10 === void 0 ? void 0 : _10.buttonWrapper) === null || _11 === void 0 ? void 0 : _11.margin) ||
                theme.spacing(0, 1, 0, 0), "&:first-child": __assign({ marginLeft: 0 }, (_16 = (_15 = (_14 = (_13 = (_12 = theme.componentsCare) === null || _12 === void 0 ? void 0 : _12.uiKit) === null || _13 === void 0 ? void 0 : _13.formButtons) === null || _14 === void 0 ? void 0 : _14.buttonWrapper) === null || _15 === void 0 ? void 0 : _15.firstChild) === null || _16 === void 0 ? void 0 : _16.style), "&:last-child": __assign({ marginRight: 0 }, (_21 = (_20 = (_19 = (_18 = (_17 = theme.componentsCare) === null || _17 === void 0 ? void 0 : _17.uiKit) === null || _18 === void 0 ? void 0 : _18.formButtons) === null || _19 === void 0 ? void 0 : _19.buttonWrapper) === null || _20 === void 0 ? void 0 : _20.lastChild) === null || _21 === void 0 ? void 0 : _21.style) }, (_25 = (_24 = (_23 = (_22 = theme.componentsCare) === null || _22 === void 0 ? void 0 : _22.uiKit) === null || _23 === void 0 ? void 0 : _23.formButtons) === null || _24 === void 0 ? void 0 : _24.buttonWrapper) === null || _25 === void 0 ? void 0 : _25.style),
    });
}, { name: "CcFormButtons" });
var FormButtons = function (props) {
    var classes = useStyles(props);
    var children = (Array.isArray(props.children)
        ? props.children
        : [props.children]).filter(function (child) { return child !== undefined && child !== null && child !== false; });
    if (children.length === 0)
        return React.createElement(React.Fragment, null);
    return (React.createElement(Grid, { container: true, direction: "row", spacing: 2, className: classes.container, wrap: "nowrap" }, children.map(function (child, index) {
        return (React.createElement(Grid, { item: true, className: classes.buttonWrapper, key: index }, child));
    })));
};
export default React.memo(FormButtons);
