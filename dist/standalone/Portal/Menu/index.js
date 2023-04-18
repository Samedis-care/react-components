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
import React, { useState } from "react";
import { MenuContext, toMenuItemComponent } from "./MenuItem";
import { makeStyles } from "@mui/styles";
import { combineClassNames } from "../../../utils";
var useStyles = makeStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    return ({
        root: __assign({ padding: (_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.portal) === null || _b === void 0 ? void 0 : _b.menu) === null || _c === void 0 ? void 0 : _c.container) === null || _d === void 0 ? void 0 : _d.padding, height: ((_h = (_g = (_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.portal) === null || _f === void 0 ? void 0 : _f.menu) === null || _g === void 0 ? void 0 : _g.container) === null || _h === void 0 ? void 0 : _h.height) || "100%", width: ((_m = (_l = (_k = (_j = theme.componentsCare) === null || _j === void 0 ? void 0 : _j.portal) === null || _k === void 0 ? void 0 : _k.menu) === null || _l === void 0 ? void 0 : _l.container) === null || _m === void 0 ? void 0 : _m.width) || "100%", overflow: ((_r = (_q = (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.portal) === null || _p === void 0 ? void 0 : _p.menu) === null || _q === void 0 ? void 0 : _q.container) === null || _r === void 0 ? void 0 : _r.overflow) || "auto" }, (_v = (_u = (_t = (_s = theme.componentsCare) === null || _s === void 0 ? void 0 : _s.portal) === null || _t === void 0 ? void 0 : _t.menu) === null || _u === void 0 ? void 0 : _u.container) === null || _v === void 0 ? void 0 : _v.style),
    });
}, { name: "CcPortalMenu" });
var PortalMenu = function (props) {
    var Wrapper = props.wrapper;
    var state = useState("");
    var classes = useStyles(props);
    return (React.createElement("div", { className: combineClassNames([classes.root, props.className]) },
        React.createElement(Wrapper, null,
            React.createElement(MenuContext.Provider, { value: props.customState || state }, props.definition.map(function (child) {
                return toMenuItemComponent(props, child, 0, null);
            })))));
};
export default React.memo(PortalMenu);
