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
import { Button, Tooltip, withStyles } from "@material-ui/core";
var StyledButton = withStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return ({
        root: function (props) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90;
            return props.small
                ? __assign({ borderRadius: (_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.subActionButton) === null || _c === void 0 ? void 0 : _c.small) === null || _d === void 0 ? void 0 : _d.borderRadius, backgroundColor: ((_h = (_g = (_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.uiKit) === null || _f === void 0 ? void 0 : _f.subActionButton) === null || _g === void 0 ? void 0 : _g.small) === null || _h === void 0 ? void 0 : _h.backgroundColor) ||
                        ((_l = (_k = (_j = theme.componentsCare) === null || _j === void 0 ? void 0 : _j.uiKit) === null || _k === void 0 ? void 0 : _k.subActionButton) === null || _l === void 0 ? void 0 : _l.backgroundColor) ||
                        theme.palette.background.default, color: ((_p = (_o = (_m = theme.componentsCare) === null || _m === void 0 ? void 0 : _m.uiKit) === null || _o === void 0 ? void 0 : _o.subActionButton) === null || _p === void 0 ? void 0 : _p.color) ||
                        theme.palette.text.primary, textTransform: "unset", "&:hover": __assign({ borderRadius: (_u = (_t = (_s = (_r = (_q = theme.componentsCare) === null || _q === void 0 ? void 0 : _q.uiKit) === null || _r === void 0 ? void 0 : _r.subActionButton) === null || _s === void 0 ? void 0 : _s.small) === null || _t === void 0 ? void 0 : _t.hover) === null || _u === void 0 ? void 0 : _u.borderRadius, backgroundColor: ((_y = (_x = (_w = (_v = theme.componentsCare) === null || _v === void 0 ? void 0 : _v.uiKit) === null || _w === void 0 ? void 0 : _w.subActionButton) === null || _x === void 0 ? void 0 : _x.hover) === null || _y === void 0 ? void 0 : _y.backgroundColor) ||
                            ((_3 = (_2 = (_1 = (_0 = (_z = theme.componentsCare) === null || _z === void 0 ? void 0 : _z.uiKit) === null || _0 === void 0 ? void 0 : _0.subActionButton) === null || _1 === void 0 ? void 0 : _1.small) === null || _2 === void 0 ? void 0 : _2.hover) === null || _3 === void 0 ? void 0 : _3.backgroundColor) ||
                            theme.palette.primary.light, color: ((_8 = (_7 = (_6 = (_5 = (_4 = theme.componentsCare) === null || _4 === void 0 ? void 0 : _4.uiKit) === null || _5 === void 0 ? void 0 : _5.subActionButton) === null || _6 === void 0 ? void 0 : _6.small) === null || _7 === void 0 ? void 0 : _7.hover) === null || _8 === void 0 ? void 0 : _8.color) ||
                            ((_12 = (_11 = (_10 = (_9 = theme.componentsCare) === null || _9 === void 0 ? void 0 : _9.uiKit) === null || _10 === void 0 ? void 0 : _10.subActionButton) === null || _11 === void 0 ? void 0 : _11.hover) === null || _12 === void 0 ? void 0 : _12.color) ||
                            theme.palette.primary.main }, __assign(__assign({}, (_16 = (_15 = (_14 = (_13 = theme.componentsCare) === null || _13 === void 0 ? void 0 : _13.uiKit) === null || _14 === void 0 ? void 0 : _14.subActionButton) === null || _15 === void 0 ? void 0 : _15.hover) === null || _16 === void 0 ? void 0 : _16.style), (_21 = (_20 = (_19 = (_18 = (_17 = theme.componentsCare) === null || _17 === void 0 ? void 0 : _17.uiKit) === null || _18 === void 0 ? void 0 : _18.subActionButton) === null || _19 === void 0 ? void 0 : _19.small) === null || _20 === void 0 ? void 0 : _20.hover) === null || _21 === void 0 ? void 0 : _21.style)), "&.Mui-disabled": __assign({ backgroundColor: (_25 = (_24 = (_23 = (_22 = theme.componentsCare) === null || _22 === void 0 ? void 0 : _22.uiKit) === null || _23 === void 0 ? void 0 : _23.subActionButton) === null || _24 === void 0 ? void 0 : _24.disabled) === null || _25 === void 0 ? void 0 : _25.backgroundColor, color: ((_29 = (_28 = (_27 = (_26 = theme.componentsCare) === null || _26 === void 0 ? void 0 : _26.uiKit) === null || _27 === void 0 ? void 0 : _27.subActionButton) === null || _28 === void 0 ? void 0 : _28.disabled) === null || _29 === void 0 ? void 0 : _29.color) ||
                            theme.palette.text.disabled }, (_33 = (_32 = (_31 = (_30 = theme.componentsCare) === null || _30 === void 0 ? void 0 : _30.uiKit) === null || _31 === void 0 ? void 0 : _31.subActionButton) === null || _32 === void 0 ? void 0 : _32.disabled) === null || _33 === void 0 ? void 0 : _33.style), minWidth: ((_37 = (_36 = (_35 = (_34 = theme.componentsCare) === null || _34 === void 0 ? void 0 : _34.uiKit) === null || _35 === void 0 ? void 0 : _35.subActionButton) === null || _36 === void 0 ? void 0 : _36.small) === null || _37 === void 0 ? void 0 : _37.minWidth) ||
                        "unset", padding: ((_41 = (_40 = (_39 = (_38 = theme.componentsCare) === null || _38 === void 0 ? void 0 : _38.uiKit) === null || _39 === void 0 ? void 0 : _39.subActionButton) === null || _40 === void 0 ? void 0 : _40.small) === null || _41 === void 0 ? void 0 : _41.padding) ||
                        theme.spacing(1) }, (_45 = (_44 = (_43 = (_42 = theme.componentsCare) === null || _42 === void 0 ? void 0 : _42.uiKit) === null || _43 === void 0 ? void 0 : _43.subActionButton) === null || _44 === void 0 ? void 0 : _44.small) === null || _45 === void 0 ? void 0 : _45.style) : __assign({ padding: ((_48 = (_47 = (_46 = theme.componentsCare) === null || _46 === void 0 ? void 0 : _46.uiKit) === null || _47 === void 0 ? void 0 : _47.subActionButton) === null || _48 === void 0 ? void 0 : _48.padding) ||
                    theme.spacing(1, 3), borderRadius: ((_51 = (_50 = (_49 = theme.componentsCare) === null || _49 === void 0 ? void 0 : _49.uiKit) === null || _50 === void 0 ? void 0 : _50.subActionButton) === null || _51 === void 0 ? void 0 : _51.borderRadius) || 0, backgroundColor: ((_54 = (_53 = (_52 = theme.componentsCare) === null || _52 === void 0 ? void 0 : _52.uiKit) === null || _53 === void 0 ? void 0 : _53.subActionButton) === null || _54 === void 0 ? void 0 : _54.backgroundColor) ||
                    theme.palette.background.default, color: ((_57 = (_56 = (_55 = theme.componentsCare) === null || _55 === void 0 ? void 0 : _55.uiKit) === null || _56 === void 0 ? void 0 : _56.subActionButton) === null || _57 === void 0 ? void 0 : _57.color) ||
                    theme.palette.text.primary, textTransform: "unset", "&:hover": __assign({ backgroundColor: ((_61 = (_60 = (_59 = (_58 = theme.componentsCare) === null || _58 === void 0 ? void 0 : _58.uiKit) === null || _59 === void 0 ? void 0 : _59.subActionButton) === null || _60 === void 0 ? void 0 : _60.hover) === null || _61 === void 0 ? void 0 : _61.backgroundColor) || theme.palette.background.default, color: ((_65 = (_64 = (_63 = (_62 = theme.componentsCare) === null || _62 === void 0 ? void 0 : _62.uiKit) === null || _63 === void 0 ? void 0 : _63.subActionButton) === null || _64 === void 0 ? void 0 : _64.hover) === null || _65 === void 0 ? void 0 : _65.color) ||
                        theme.palette.primary.main }, (_69 = (_68 = (_67 = (_66 = theme.componentsCare) === null || _66 === void 0 ? void 0 : _66.uiKit) === null || _67 === void 0 ? void 0 : _67.subActionButton) === null || _68 === void 0 ? void 0 : _68.hover) === null || _69 === void 0 ? void 0 : _69.style), "&.Mui-disabled": __assign({ backgroundColor: (_73 = (_72 = (_71 = (_70 = theme.componentsCare) === null || _70 === void 0 ? void 0 : _70.uiKit) === null || _71 === void 0 ? void 0 : _71.subActionButton) === null || _72 === void 0 ? void 0 : _72.disabled) === null || _73 === void 0 ? void 0 : _73.backgroundColor, color: ((_77 = (_76 = (_75 = (_74 = theme.componentsCare) === null || _74 === void 0 ? void 0 : _74.uiKit) === null || _75 === void 0 ? void 0 : _75.subActionButton) === null || _76 === void 0 ? void 0 : _76.disabled) === null || _77 === void 0 ? void 0 : _77.color) ||
                        theme.palette.text.disabled }, __assign(__assign({}, (_80 = (_79 = (_78 = theme.componentsCare) === null || _78 === void 0 ? void 0 : _78.uiKit) === null || _79 === void 0 ? void 0 : _79.subActionButton) === null || _80 === void 0 ? void 0 : _80.style), (_84 = (_83 = (_82 = (_81 = theme.componentsCare) === null || _81 === void 0 ? void 0 : _81.uiKit) === null || _82 === void 0 ? void 0 : _82.subActionButton) === null || _83 === void 0 ? void 0 : _83.disabled) === null || _84 === void 0 ? void 0 : _84.style)), minWidth: (_87 = (_86 = (_85 = theme.componentsCare) === null || _85 === void 0 ? void 0 : _85.uiKit) === null || _86 === void 0 ? void 0 : _86.subActionButton) === null || _87 === void 0 ? void 0 : _87.minWidth }, (_90 = (_89 = (_88 = theme.componentsCare) === null || _88 === void 0 ? void 0 : _88.uiKit) === null || _89 === void 0 ? void 0 : _89.subActionButton) === null || _90 === void 0 ? void 0 : _90.style);
        },
        outlined: function (props) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104, _105, _106, _107, _108, _109, _110, _111, _112, _113, _114, _115, _116, _117;
            return props.small
                ? {
                    "& svg": __assign({ fill: ((_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.subActionButton) === null || _c === void 0 ? void 0 : _c.small) === null || _d === void 0 ? void 0 : _d.color) ||
                            theme.palette.primary.main }, (_j = (_h = (_g = (_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.uiKit) === null || _f === void 0 ? void 0 : _f.subActionButton) === null || _g === void 0 ? void 0 : _g.small) === null || _h === void 0 ? void 0 : _h.icon) === null || _j === void 0 ? void 0 : _j.style),
                    "&:hover svg": __assign({ fill: ((_p = (_o = (_m = (_l = (_k = theme.componentsCare) === null || _k === void 0 ? void 0 : _k.uiKit) === null || _l === void 0 ? void 0 : _l.subActionButton) === null || _m === void 0 ? void 0 : _m.small) === null || _o === void 0 ? void 0 : _o.hover) === null || _p === void 0 ? void 0 : _p.color) || theme.palette.background.default }, (_v = (_u = (_t = (_s = (_r = (_q = theme.componentsCare) === null || _q === void 0 ? void 0 : _q.uiKit) === null || _r === void 0 ? void 0 : _r.subActionButton) === null || _s === void 0 ? void 0 : _s.small) === null || _t === void 0 ? void 0 : _t.hover) === null || _u === void 0 ? void 0 : _u.icon) === null || _v === void 0 ? void 0 : _v.style),
                    borderLeftWidth: 0,
                    borderRightWidth: 0,
                    borderTopWidth: props.disabledivider ? 0 : undefined,
                    borderRadius: 0,
                    "&:first-child": __assign({ borderLeftWidth: 1, borderTopLeftRadius: (_z = (_y = (_x = (_w = theme.componentsCare) === null || _w === void 0 ? void 0 : _w.uiKit) === null || _x === void 0 ? void 0 : _x.subActionButton) === null || _y === void 0 ? void 0 : _y.small) === null || _z === void 0 ? void 0 : _z.borderRadius, borderBottomLeftRadius: (_3 = (_2 = (_1 = (_0 = theme.componentsCare) === null || _0 === void 0 ? void 0 : _0.uiKit) === null || _1 === void 0 ? void 0 : _1.subActionButton) === null || _2 === void 0 ? void 0 : _2.small) === null || _3 === void 0 ? void 0 : _3.borderRadius }, (_8 = (_7 = (_6 = (_5 = (_4 = theme.componentsCare) === null || _4 === void 0 ? void 0 : _4.uiKit) === null || _5 === void 0 ? void 0 : _5.subActionButton) === null || _6 === void 0 ? void 0 : _6.small) === null || _7 === void 0 ? void 0 : _7.firstChild) === null || _8 === void 0 ? void 0 : _8.style),
                    "&:last-child": __assign({ borderRightWidth: 1, borderTopRightRadius: (_12 = (_11 = (_10 = (_9 = theme.componentsCare) === null || _9 === void 0 ? void 0 : _9.uiKit) === null || _10 === void 0 ? void 0 : _10.subActionButton) === null || _11 === void 0 ? void 0 : _11.small) === null || _12 === void 0 ? void 0 : _12.borderRadius, borderBottomRightRadius: (_16 = (_15 = (_14 = (_13 = theme.componentsCare) === null || _13 === void 0 ? void 0 : _13.uiKit) === null || _14 === void 0 ? void 0 : _14.subActionButton) === null || _15 === void 0 ? void 0 : _15.small) === null || _16 === void 0 ? void 0 : _16.borderRadius }, (_21 = (_20 = (_19 = (_18 = (_17 = theme.componentsCare) === null || _17 === void 0 ? void 0 : _17.uiKit) === null || _18 === void 0 ? void 0 : _18.subActionButton) === null || _19 === void 0 ? void 0 : _19.small) === null || _20 === void 0 ? void 0 : _20.lastChild) === null || _21 === void 0 ? void 0 : _21.style),
                    "&.Mui-disabled": {
                        "& svg": {
                            fill: ((_25 = (_24 = (_23 = (_22 = theme.componentsCare) === null || _22 === void 0 ? void 0 : _22.uiKit) === null || _23 === void 0 ? void 0 : _23.subActionButton) === null || _24 === void 0 ? void 0 : _24.disabled) === null || _25 === void 0 ? void 0 : _25.color) ||
                                theme.palette.text.disabled,
                        },
                        borderRadiusWidth: 0,
                        borderLeftWidth: 0,
                        borderRightWidth: 0,
                        color: ((_29 = (_28 = (_27 = (_26 = theme.componentsCare) === null || _26 === void 0 ? void 0 : _26.uiKit) === null || _27 === void 0 ? void 0 : _27.subActionButton) === null || _28 === void 0 ? void 0 : _28.disabled) === null || _29 === void 0 ? void 0 : _29.color) ||
                            theme.palette.text.disabled,
                        "&:first-child": __assign({ borderLeftWidth: 1 }, (_35 = (_34 = (_33 = (_32 = (_31 = (_30 = theme.componentsCare) === null || _30 === void 0 ? void 0 : _30.uiKit) === null || _31 === void 0 ? void 0 : _31.subActionButton) === null || _32 === void 0 ? void 0 : _32.small) === null || _33 === void 0 ? void 0 : _33.disabled) === null || _34 === void 0 ? void 0 : _34.firstChild) === null || _35 === void 0 ? void 0 : _35.style),
                        "&:last-child": __assign({ borderRightWidth: 1 }, (_41 = (_40 = (_39 = (_38 = (_37 = (_36 = theme.componentsCare) === null || _36 === void 0 ? void 0 : _36.uiKit) === null || _37 === void 0 ? void 0 : _37.subActionButton) === null || _38 === void 0 ? void 0 : _38.small) === null || _39 === void 0 ? void 0 : _39.disabled) === null || _40 === void 0 ? void 0 : _40.lastChild) === null || _41 === void 0 ? void 0 : _41.style),
                    },
                    padding: theme.spacing(2),
                }
                : __assign({ "& svg": __assign({ fill: ((_45 = (_44 = (_43 = (_42 = theme.componentsCare) === null || _42 === void 0 ? void 0 : _42.uiKit) === null || _43 === void 0 ? void 0 : _43.subActionButton) === null || _44 === void 0 ? void 0 : _44.icon) === null || _45 === void 0 ? void 0 : _45.color) ||
                            ((_48 = (_47 = (_46 = theme.componentsCare) === null || _46 === void 0 ? void 0 : _46.uiKit) === null || _47 === void 0 ? void 0 : _47.subActionButton) === null || _48 === void 0 ? void 0 : _48.color) ||
                            theme.palette.primary.main, marginRight: ((_52 = (_51 = (_50 = (_49 = theme.componentsCare) === null || _49 === void 0 ? void 0 : _49.uiKit) === null || _50 === void 0 ? void 0 : _50.subActionButton) === null || _51 === void 0 ? void 0 : _51.icon) === null || _52 === void 0 ? void 0 : _52.marginRight) ||
                            theme.spacing(3) }, (_56 = (_55 = (_54 = (_53 = theme.componentsCare) === null || _53 === void 0 ? void 0 : _53.uiKit) === null || _54 === void 0 ? void 0 : _54.subActionButton) === null || _55 === void 0 ? void 0 : _55.icon) === null || _56 === void 0 ? void 0 : _56.style), "&:hover svg": __assign({ fill: (_61 = (_60 = (_59 = (_58 = (_57 = theme.componentsCare) === null || _57 === void 0 ? void 0 : _57.uiKit) === null || _58 === void 0 ? void 0 : _58.subActionButton) === null || _59 === void 0 ? void 0 : _59.hover) === null || _60 === void 0 ? void 0 : _60.icon) === null || _61 === void 0 ? void 0 : _61.color }, (_66 = (_65 = (_64 = (_63 = (_62 = theme.componentsCare) === null || _62 === void 0 ? void 0 : _62.uiKit) === null || _63 === void 0 ? void 0 : _63.subActionButton) === null || _64 === void 0 ? void 0 : _64.hover) === null || _65 === void 0 ? void 0 : _65.icon) === null || _66 === void 0 ? void 0 : _66.style), borderRadius: (_69 = (_68 = (_67 = theme.componentsCare) === null || _67 === void 0 ? void 0 : _67.uiKit) === null || _68 === void 0 ? void 0 : _68.subActionButton) === null || _69 === void 0 ? void 0 : _69.borderRadius, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopWidth: props.disabledivider ? 0 : undefined, "&:first-child": (_73 = (_72 = (_71 = (_70 = theme.componentsCare) === null || _70 === void 0 ? void 0 : _70.uiKit) === null || _71 === void 0 ? void 0 : _71.subActionButton) === null || _72 === void 0 ? void 0 : _72.firstChild) === null || _73 === void 0 ? void 0 : _73.style, "&:last-child": (_77 = (_76 = (_75 = (_74 = theme.componentsCare) === null || _74 === void 0 ? void 0 : _74.uiKit) === null || _75 === void 0 ? void 0 : _75.subActionButton) === null || _76 === void 0 ? void 0 : _76.lastChild) === null || _77 === void 0 ? void 0 : _77.style, "&.Mui-disabled": __assign({ "& svg": __assign({ fill: ((_81 = (_80 = (_79 = (_78 = theme.componentsCare) === null || _78 === void 0 ? void 0 : _78.uiKit) === null || _79 === void 0 ? void 0 : _79.subActionButton) === null || _80 === void 0 ? void 0 : _80.disabled) === null || _81 === void 0 ? void 0 : _81.color) ||
                                theme.palette.text.disabled }, (_86 = (_85 = (_84 = (_83 = (_82 = theme.componentsCare) === null || _82 === void 0 ? void 0 : _82.uiKit) === null || _83 === void 0 ? void 0 : _83.subActionButton) === null || _84 === void 0 ? void 0 : _84.disabled) === null || _85 === void 0 ? void 0 : _85.icon) === null || _86 === void 0 ? void 0 : _86.style), borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, border: ((_90 = (_89 = (_88 = (_87 = theme.componentsCare) === null || _87 === void 0 ? void 0 : _87.uiKit) === null || _88 === void 0 ? void 0 : _88.subActionButton) === null || _89 === void 0 ? void 0 : _89.disabled) === null || _90 === void 0 ? void 0 : _90.border) ||
                            ((_93 = (_92 = (_91 = theme.componentsCare) === null || _91 === void 0 ? void 0 : _91.uiKit) === null || _92 === void 0 ? void 0 : _92.subActionButton) === null || _93 === void 0 ? void 0 : _93.border), color: ((_97 = (_96 = (_95 = (_94 = theme.componentsCare) === null || _94 === void 0 ? void 0 : _94.uiKit) === null || _95 === void 0 ? void 0 : _95.subActionButton) === null || _96 === void 0 ? void 0 : _96.disabled) === null || _97 === void 0 ? void 0 : _97.color) ||
                            theme.palette.text.disabled, "&:first-child": (_102 = (_101 = (_100 = (_99 = (_98 = theme.componentsCare) === null || _98 === void 0 ? void 0 : _98.uiKit) === null || _99 === void 0 ? void 0 : _99.subActionButton) === null || _100 === void 0 ? void 0 : _100.disabled) === null || _101 === void 0 ? void 0 : _101.firstChild) === null || _102 === void 0 ? void 0 : _102.style, "&:last-child": (_107 = (_106 = (_105 = (_104 = (_103 = theme.componentsCare) === null || _103 === void 0 ? void 0 : _103.uiKit) === null || _104 === void 0 ? void 0 : _104.subActionButton) === null || _105 === void 0 ? void 0 : _105.disabled) === null || _106 === void 0 ? void 0 : _106.lastChild) === null || _107 === void 0 ? void 0 : _107.style }, (_111 = (_110 = (_109 = (_108 = theme.componentsCare) === null || _108 === void 0 ? void 0 : _108.uiKit) === null || _109 === void 0 ? void 0 : _109.subActionButton) === null || _110 === void 0 ? void 0 : _110.disabled) === null || _111 === void 0 ? void 0 : _111.style), padding: ((_114 = (_113 = (_112 = theme.componentsCare) === null || _112 === void 0 ? void 0 : _112.uiKit) === null || _113 === void 0 ? void 0 : _113.subActionButton) === null || _114 === void 0 ? void 0 : _114.padding) ||
                        theme.spacing(2, 3) }, (_117 = (_116 = (_115 = theme.componentsCare) === null || _115 === void 0 ? void 0 : _115.uiKit) === null || _116 === void 0 ? void 0 : _116.subActionButton) === null || _117 === void 0 ? void 0 : _117.style);
        },
        label: __assign({ justifyContent: ((_d = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.subActionButton) === null || _c === void 0 ? void 0 : _c.label) === null || _d === void 0 ? void 0 : _d.justifyContent) ||
                "flex-start" }, (_h = (_g = (_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.uiKit) === null || _f === void 0 ? void 0 : _f.subActionButton) === null || _g === void 0 ? void 0 : _g.label) === null || _h === void 0 ? void 0 : _h.style),
    });
})(Button);
var SubActionButton = function (props) {
    var icon = props.icon, small = props.small, children = props.children, disableDivider = props.disableDivider, otherProps = __rest(props, ["icon", "small", "children", "disableDivider"]);
    var renderButton = function () { return (React.createElement(StyledButton, __assign({ variant: "outlined", fullWidth: !small, 
        // suppress warning
        disabledivider: disableDivider ? "true" : undefined }, otherProps),
        icon,
        " ",
        !small && children)); };
    if (props.disabled || !small)
        return renderButton();
    return React.createElement(Tooltip, { title: children }, renderButton());
};
export default React.memo(SubActionButton);
