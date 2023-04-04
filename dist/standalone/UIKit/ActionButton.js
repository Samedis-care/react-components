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
import { Box, Button, Tooltip, withStyles, } from "@material-ui/core";
import { combineColors } from "../../utils";
var StyledButton = withStyles(function (theme) { return ({
    root: function (props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
        return (__assign({ border: (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.actionButton) === null || _c === void 0 ? void 0 : _c.border, backgroundColor: props.color
                ? undefined
                : props.backgroundColor ||
                    ((_f = (_e = (_d = theme.componentsCare) === null || _d === void 0 ? void 0 : _d.uiKit) === null || _e === void 0 ? void 0 : _e.actionButton) === null || _f === void 0 ? void 0 : _f.backgroundColor) ||
                    theme.palette.primary.main, color: props.textColor ||
                props.color ||
                ((_j = (_h = (_g = theme.componentsCare) === null || _g === void 0 ? void 0 : _g.uiKit) === null || _h === void 0 ? void 0 : _h.actionButton) === null || _j === void 0 ? void 0 : _j.color) ||
                theme.palette.primary.contrastText, fontSize: (_m = (_l = (_k = theme.componentsCare) === null || _k === void 0 ? void 0 : _k.uiKit) === null || _l === void 0 ? void 0 : _l.actionButton) === null || _m === void 0 ? void 0 : _m.fontSize, textTransform: "unset", "&:hover": __assign({ border: ((_r = (_q = (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.uiKit) === null || _p === void 0 ? void 0 : _p.actionButton) === null || _q === void 0 ? void 0 : _q.hover) === null || _r === void 0 ? void 0 : _r.border) ||
                    ((_u = (_t = (_s = theme.componentsCare) === null || _s === void 0 ? void 0 : _s.uiKit) === null || _t === void 0 ? void 0 : _t.actionButton) === null || _u === void 0 ? void 0 : _u.border), backgroundColor: props.color
                    ? undefined
                    : "rgba(".concat(combineColors(props.backgroundColor ||
                        ((_x = (_w = (_v = theme.componentsCare) === null || _v === void 0 ? void 0 : _v.uiKit) === null || _w === void 0 ? void 0 : _w.actionButton) === null || _x === void 0 ? void 0 : _x.backgroundColor) ||
                        theme.palette.primary.main, theme.palette.action.hover).join(), ")") }, __assign(__assign({}, (_0 = (_z = (_y = theme.componentsCare) === null || _y === void 0 ? void 0 : _y.uiKit) === null || _z === void 0 ? void 0 : _z.actionButton) === null || _0 === void 0 ? void 0 : _0.style), (_4 = (_3 = (_2 = (_1 = theme.componentsCare) === null || _1 === void 0 ? void 0 : _1.uiKit) === null || _2 === void 0 ? void 0 : _2.actionButton) === null || _3 === void 0 ? void 0 : _3.hover) === null || _4 === void 0 ? void 0 : _4.style)), "&.Mui-disabled": __assign({ backgroundColor: theme.palette.action.disabled }, __assign(__assign({}, (_7 = (_6 = (_5 = theme.componentsCare) === null || _5 === void 0 ? void 0 : _5.uiKit) === null || _6 === void 0 ? void 0 : _6.actionButton) === null || _7 === void 0 ? void 0 : _7.style), (_11 = (_10 = (_9 = (_8 = theme.componentsCare) === null || _8 === void 0 ? void 0 : _8.uiKit) === null || _9 === void 0 ? void 0 : _9.actionButton) === null || _10 === void 0 ? void 0 : _10.disabled) === null || _11 === void 0 ? void 0 : _11.style)), minWidth: props.small ? 0 : undefined, padding: (_14 = (_13 = (_12 = theme.componentsCare) === null || _12 === void 0 ? void 0 : _12.uiKit) === null || _13 === void 0 ? void 0 : _13.actionButton) === null || _14 === void 0 ? void 0 : _14.padding, paddingLeft: props.small ? theme.spacing(3) : undefined, paddingRight: props.small ? theme.spacing(3) : undefined }, (_17 = (_16 = (_15 = theme.componentsCare) === null || _15 === void 0 ? void 0 : _15.uiKit) === null || _16 === void 0 ? void 0 : _16.actionButton) === null || _17 === void 0 ? void 0 : _17.style));
    },
    startIcon: function (props) { return ({
        margin: props.small ? 0 : undefined,
    }); },
    outlined: function (props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return (__assign({ borderRadius: ((_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.actionButton) === null || _c === void 0 ? void 0 : _c.borderRadius) ||
                theme.shape.borderRadius, "&.Mui-disabled": {
                border: (_f = (_e = (_d = theme.componentsCare) === null || _d === void 0 ? void 0 : _d.uiKit) === null || _e === void 0 ? void 0 : _e.actionButton) === null || _f === void 0 ? void 0 : _f.border,
                color: theme.palette.background.paper,
                backgroundColor: (_k = (_j = (_h = (_g = theme.componentsCare) === null || _g === void 0 ? void 0 : _g.uiKit) === null || _h === void 0 ? void 0 : _h.actionButton) === null || _j === void 0 ? void 0 : _j.disabled) === null || _k === void 0 ? void 0 : _k.backgroundColor,
            }, padding: (_o = (_m = (_l = theme.componentsCare) === null || _l === void 0 ? void 0 : _l.uiKit) === null || _m === void 0 ? void 0 : _m.actionButton) === null || _o === void 0 ? void 0 : _o.padding, paddingLeft: props.small ? theme.spacing(3) : undefined, paddingRight: props.small ? theme.spacing(3) : undefined }, (_r = (_q = (_p = theme.componentsCare) === null || _p === void 0 ? void 0 : _p.uiKit) === null || _q === void 0 ? void 0 : _q.actionButton) === null || _r === void 0 ? void 0 : _r.style));
    },
    contained: function (props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return (__assign({ borderRadius: ((_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.actionButton) === null || _c === void 0 ? void 0 : _c.borderRadius) ||
                theme.shape.borderRadius, "&.Mui-disabled": {
                border: (_f = (_e = (_d = theme.componentsCare) === null || _d === void 0 ? void 0 : _d.uiKit) === null || _e === void 0 ? void 0 : _e.actionButton) === null || _f === void 0 ? void 0 : _f.border,
                color: theme.palette.background.paper,
                backgroundColor: (_k = (_j = (_h = (_g = theme.componentsCare) === null || _g === void 0 ? void 0 : _g.uiKit) === null || _h === void 0 ? void 0 : _h.actionButton) === null || _j === void 0 ? void 0 : _j.disabled) === null || _k === void 0 ? void 0 : _k.backgroundColor,
            }, padding: (_o = (_m = (_l = theme.componentsCare) === null || _l === void 0 ? void 0 : _l.uiKit) === null || _m === void 0 ? void 0 : _m.actionButton) === null || _o === void 0 ? void 0 : _o.padding, paddingLeft: props.small ? theme.spacing(3) : undefined, paddingRight: props.small ? theme.spacing(3) : undefined }, (_r = (_q = (_p = theme.componentsCare) === null || _p === void 0 ? void 0 : _p.uiKit) === null || _q === void 0 ? void 0 : _q.actionButton) === null || _r === void 0 ? void 0 : _r.style));
    },
    label: function (props) {
        var _a, _b, _c, _d;
        return (__assign({ padding: 0, justifyContent: props.small ? "center" : "flex-start" }, (_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.actionButton) === null || _c === void 0 ? void 0 : _c.label) === null || _d === void 0 ? void 0 : _d.style));
    },
}); }, { name: "CcActionButtonStyledButton" })(Button);
var StyledIconBox = withStyles(function () { return ({
    root: {
        overflow: "hidden",
        width: 0,
    },
}); })(Box);
var ActionButton = function (props) {
    var icon = props.icon, fullWidth = props.fullWidth, small = props.small, children = props.children, otherProps = __rest(props, ["icon", "fullWidth", "small", "children"]);
    var renderButton = function () { return (React.createElement(StyledButton, __assign({ variant: "contained", disableElevation: true, fullWidth: fullWidth !== null && fullWidth !== void 0 ? fullWidth : !small, startIcon: icon, 
        // to suppress warning
        small: small ? "true" : undefined }, otherProps), small ? React.createElement(StyledIconBox, null, "\u00A0") : React.createElement(Box, null, children))); };
    if (props.disabled || !small)
        return renderButton();
    return React.createElement(Tooltip, { title: React.createElement("span", null, children) }, renderButton());
};
export default React.memo(ActionButton);
