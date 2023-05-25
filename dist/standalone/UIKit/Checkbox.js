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
import { Checkbox as MuiCheckbox, SvgIcon, } from "@mui/material";
import { withStyles } from "@mui/styles";
var StyledCheckbox = withStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    return ({
        root: function (props) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48;
            return (__assign({ padding: (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.checkbox) === null || _c === void 0 ? void 0 : _c.padding, margin: (_f = (_e = (_d = theme.componentsCare) === null || _d === void 0 ? void 0 : _d.uiKit) === null || _e === void 0 ? void 0 : _e.checkbox) === null || _f === void 0 ? void 0 : _f.margin, border: (_j = (_h = (_g = theme.componentsCare) === null || _g === void 0 ? void 0 : _g.uiKit) === null || _h === void 0 ? void 0 : _h.checkbox) === null || _j === void 0 ? void 0 : _j.border, borderRadius: (_m = (_l = (_k = theme.componentsCare) === null || _k === void 0 ? void 0 : _k.uiKit) === null || _l === void 0 ? void 0 : _l.checkbox) === null || _m === void 0 ? void 0 : _m.borderRadius, backgroundColor: (_q = (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.uiKit) === null || _p === void 0 ? void 0 : _p.checkbox) === null || _q === void 0 ? void 0 : _q.backgroundColor, "& > svg": __assign({ color: (_u = (_t = (_s = (_r = theme.componentsCare) === null || _r === void 0 ? void 0 : _r.uiKit) === null || _s === void 0 ? void 0 : _s.checkbox) === null || _t === void 0 ? void 0 : _t.box) === null || _u === void 0 ? void 0 : _u.color, fill: (_y = (_x = (_w = (_v = theme.componentsCare) === null || _v === void 0 ? void 0 : _v.uiKit) === null || _w === void 0 ? void 0 : _w.checkbox) === null || _x === void 0 ? void 0 : _x.box) === null || _y === void 0 ? void 0 : _y.fill, fontSize: props.size == "small"
                        ? ((_2 = (_1 = (_0 = (_z = theme.componentsCare) === null || _z === void 0 ? void 0 : _z.uiKit) === null || _0 === void 0 ? void 0 : _0.checkbox) === null || _1 === void 0 ? void 0 : _1.small) === null || _2 === void 0 ? void 0 : _2.fontSize) || "1em"
                        : (_5 = (_4 = (_3 = theme.componentsCare) === null || _3 === void 0 ? void 0 : _3.uiKit) === null || _4 === void 0 ? void 0 : _4.checkbox) === null || _5 === void 0 ? void 0 : _5.fontSize, borderWidth: ((_9 = (_8 = (_7 = (_6 = theme.componentsCare) === null || _6 === void 0 ? void 0 : _6.uiKit) === null || _7 === void 0 ? void 0 : _7.checkbox) === null || _8 === void 0 ? void 0 : _8.box) === null || _9 === void 0 ? void 0 : _9.borderWidth) || "1px", borderStyle: ((_13 = (_12 = (_11 = (_10 = theme.componentsCare) === null || _10 === void 0 ? void 0 : _10.uiKit) === null || _11 === void 0 ? void 0 : _11.checkbox) === null || _12 === void 0 ? void 0 : _12.box) === null || _13 === void 0 ? void 0 : _13.borderStyle) || "solid", borderColor: ((_17 = (_16 = (_15 = (_14 = theme.componentsCare) === null || _14 === void 0 ? void 0 : _14.uiKit) === null || _15 === void 0 ? void 0 : _15.checkbox) === null || _16 === void 0 ? void 0 : _16.box) === null || _17 === void 0 ? void 0 : _17.borderColor) ||
                        theme.palette.divider, borderRadius: ((_21 = (_20 = (_19 = (_18 = theme.componentsCare) === null || _18 === void 0 ? void 0 : _18.uiKit) === null || _19 === void 0 ? void 0 : _19.checkbox) === null || _20 === void 0 ? void 0 : _20.box) === null || _21 === void 0 ? void 0 : _21.borderRadius) || "2px", backgroundColor: ((_25 = (_24 = (_23 = (_22 = theme.componentsCare) === null || _22 === void 0 ? void 0 : _22.uiKit) === null || _23 === void 0 ? void 0 : _23.checkbox) === null || _24 === void 0 ? void 0 : _24.box) === null || _25 === void 0 ? void 0 : _25.backgroundColor) ||
                        theme.palette.background.paper }, (props.size == "small"
                    ? __assign(__assign({}, (_29 = (_28 = (_27 = (_26 = theme.componentsCare) === null || _26 === void 0 ? void 0 : _26.uiKit) === null || _27 === void 0 ? void 0 : _27.checkbox) === null || _28 === void 0 ? void 0 : _28.box) === null || _29 === void 0 ? void 0 : _29.style), (_34 = (_33 = (_32 = (_31 = (_30 = theme.componentsCare) === null || _30 === void 0 ? void 0 : _30.uiKit) === null || _31 === void 0 ? void 0 : _31.checkbox) === null || _32 === void 0 ? void 0 : _32.box) === null || _33 === void 0 ? void 0 : _33.small) === null || _34 === void 0 ? void 0 : _34.style) : (_38 = (_37 = (_36 = (_35 = theme.componentsCare) === null || _35 === void 0 ? void 0 : _35.uiKit) === null || _36 === void 0 ? void 0 : _36.checkbox) === null || _37 === void 0 ? void 0 : _37.box) === null || _38 === void 0 ? void 0 : _38.style)) }, (props.size == "small"
                ? __assign(__assign({}, (_41 = (_40 = (_39 = theme.componentsCare) === null || _39 === void 0 ? void 0 : _39.uiKit) === null || _40 === void 0 ? void 0 : _40.checkbox) === null || _41 === void 0 ? void 0 : _41.style), (_45 = (_44 = (_43 = (_42 = theme.componentsCare) === null || _42 === void 0 ? void 0 : _42.uiKit) === null || _43 === void 0 ? void 0 : _43.checkbox) === null || _44 === void 0 ? void 0 : _44.small) === null || _45 === void 0 ? void 0 : _45.style) : (_48 = (_47 = (_46 = theme.componentsCare) === null || _46 === void 0 ? void 0 : _46.uiKit) === null || _47 === void 0 ? void 0 : _47.checkbox) === null || _48 === void 0 ? void 0 : _48.style)));
        },
        disabled: __assign({ backgroundColor: (_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.checkbox) === null || _c === void 0 ? void 0 : _c.disabled) === null || _d === void 0 ? void 0 : _d.backgroundColor, "& > svg": __assign({ color: (_j = (_h = (_g = (_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.uiKit) === null || _f === void 0 ? void 0 : _f.checkbox) === null || _g === void 0 ? void 0 : _g.disabled) === null || _h === void 0 ? void 0 : _h.box) === null || _j === void 0 ? void 0 : _j.color, fill: (_p = (_o = (_m = (_l = (_k = theme.componentsCare) === null || _k === void 0 ? void 0 : _k.uiKit) === null || _l === void 0 ? void 0 : _l.checkbox) === null || _m === void 0 ? void 0 : _m.disabled) === null || _o === void 0 ? void 0 : _o.box) === null || _p === void 0 ? void 0 : _p.fill }, (_u = (_t = (_s = (_r = (_q = theme.componentsCare) === null || _q === void 0 ? void 0 : _q.uiKit) === null || _r === void 0 ? void 0 : _r.checkbox) === null || _s === void 0 ? void 0 : _s.disabled) === null || _t === void 0 ? void 0 : _t.box) === null || _u === void 0 ? void 0 : _u.style) }, (_y = (_x = (_w = (_v = theme.componentsCare) === null || _v === void 0 ? void 0 : _v.uiKit) === null || _w === void 0 ? void 0 : _w.checkbox) === null || _x === void 0 ? void 0 : _x.disabled) === null || _y === void 0 ? void 0 : _y.style),
    });
})(MuiCheckbox);
var _uncheckedIcon = (React.createElement(SvgIcon, { viewBox: "-3.5 -4.5 24 24" },
    React.createElement("polyline", { id: "check", fill: "transparent", stroke: "transparent", strokeWidth: "3.5", points: "1 7 6 12 16.5 1.5" })));
var _checkedIcon = (React.createElement(SvgIcon, { viewBox: "-3.5 -4.5 24 24" },
    React.createElement("polyline", { id: "check", fill: "transparent", stroke: "currentColor", strokeWidth: "3.5", points: "1 7 6 12 16.5 1.5" })));
var Checkbox = function (props) {
    return (React.createElement(StyledCheckbox, __assign({ color: "primary", icon: _uncheckedIcon, checkedIcon: _checkedIcon }, props)));
};
export default React.memo(Checkbox);