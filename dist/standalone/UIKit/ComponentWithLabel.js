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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from "react";
import { FormControlLabel, Typography, makeStyles, } from "@material-ui/core";
var useStyles = makeStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
    return ({
        label: __assign({ whiteSpace: ((_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.label) === null || _c === void 0 ? void 0 : _c.whiteSpace) || "pre", padding: (_f = (_e = (_d = theme.componentsCare) === null || _d === void 0 ? void 0 : _d.uiKit) === null || _e === void 0 ? void 0 : _e.label) === null || _f === void 0 ? void 0 : _f.padding, margin: (_j = (_h = (_g = theme.componentsCare) === null || _g === void 0 ? void 0 : _g.uiKit) === null || _h === void 0 ? void 0 : _h.label) === null || _j === void 0 ? void 0 : _j.margin, border: (_m = (_l = (_k = theme.componentsCare) === null || _k === void 0 ? void 0 : _k.uiKit) === null || _l === void 0 ? void 0 : _l.label) === null || _m === void 0 ? void 0 : _m.border, borderRadius: (_q = (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.uiKit) === null || _p === void 0 ? void 0 : _p.label) === null || _q === void 0 ? void 0 : _q.borderRadius, backgroundColor: (_t = (_s = (_r = theme.componentsCare) === null || _r === void 0 ? void 0 : _r.uiKit) === null || _s === void 0 ? void 0 : _s.label) === null || _t === void 0 ? void 0 : _t.backgroundColor, color: (_w = (_v = (_u = theme.componentsCare) === null || _u === void 0 ? void 0 : _u.uiKit) === null || _v === void 0 ? void 0 : _v.label) === null || _w === void 0 ? void 0 : _w.color, fontSize: (_z = (_y = (_x = theme.componentsCare) === null || _x === void 0 ? void 0 : _x.uiKit) === null || _y === void 0 ? void 0 : _y.label) === null || _z === void 0 ? void 0 : _z.fontSize, fontWeight: (_2 = (_1 = (_0 = theme.componentsCare) === null || _0 === void 0 ? void 0 : _0.uiKit) === null || _1 === void 0 ? void 0 : _1.label) === null || _2 === void 0 ? void 0 : _2.fontWeight }, (_5 = (_4 = (_3 = theme.componentsCare) === null || _3 === void 0 ? void 0 : _3.uiKit) === null || _4 === void 0 ? void 0 : _4.label) === null || _5 === void 0 ? void 0 : _5.style),
    });
}, { name: "CcComponentWithLabel" });
var ComponentWithLabel = function (props) {
    var classes = useStyles(props);
    var label;
    if ("labelText" in props) {
        var 
        // eslint-disable-next-line prefer-const
        labelText = props.labelText, labelVariant = props.labelVariant, labelDisplay = props.labelDisplay, labelAlign = props.labelAlign, 
        // eslint-disable-next-line prefer-const
        propsCopy = __rest(props, ["labelText", "labelVariant", "labelDisplay", "labelAlign"]);
        var labelPlacement = props.labelPlacement || "end";
        labelVariant = labelVariant !== null && labelVariant !== void 0 ? labelVariant : "caption";
        labelDisplay = labelDisplay !== null && labelDisplay !== void 0 ? labelDisplay : "block";
        labelAlign =
            labelAlign !== null && labelAlign !== void 0 ? labelAlign : {
                start: "right",
                end: "left",
                top: "center",
                bottom: "center",
            }[labelPlacement];
        label = (React.createElement(Typography, { variant: labelVariant, display: labelDisplay, align: labelAlign, className: classes.label }, labelText));
        props = __assign(__assign({}, propsCopy), { label: "" });
    }
    else {
        label = props.label;
    }
    return React.createElement(FormControlLabel, __assign({}, props, { label: label }));
};
export default React.memo(ComponentWithLabel);
