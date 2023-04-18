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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useState } from "react";
import { doesRouteMatch, extractRouteParameters, insertRouteParameters, MenuBase, } from "../../..";
import { useLocation, useNavigate } from "react-router-dom";
/**
 * Extract current route params
 * @param definitions The route definitions
 * @param path The current location.pathname
 */
var getMenuRouteParams = function (definitions, path) {
    // first try and find an exact match
    var exact = true;
    var match = definitions.find(function (entry) { return entry.route && doesRouteMatch(entry.route, path, true); });
    if (!match) {
        // if this fails, get the closest match we can get
        exact = false;
        match = definitions
            .sort(function (a, b) { var _a, _b, _c, _d; return ((_b = (_a = b.route) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = a.route) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0); })
            .find(function (entry) { return entry.route && doesRouteMatch(entry.route, path); });
    }
    if (!match)
        return {};
    var route = match.route;
    return extractRouteParameters(route, path, exact);
};
/**
 * Converts the routed menu item definitions to normal menu item definitions
 * @param definitions All menu items
 * @param definition The routed menu item definition
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @param navigate The react-router navigate function
 * @return a normal menu item definition
 */
var convertDefinition = function (definitions, definition, path, depth, navigate) {
    var _a;
    return (__assign(__assign({}, definition), { forceExpand: definition.children &&
            !!resolveLocation(definition.children, path, depth + 1, null), children: (_a = definition.children) === null || _a === void 0 ? void 0 : _a.map(function (entry) {
            return convertDefinition(definitions, entry, path, depth + 1, navigate);
        }), onClick: function (evt) {
            if (definition.onClick) {
                definition.onClick(evt);
            }
            if (definition.route) {
                // keep URL parameters
                var target = insertRouteParameters(definition.route, getMenuRouteParams(definitions, path));
                if (evt.ctrlKey || evt.metaKey || evt.shiftKey)
                    window.open(target, "_blank");
                else
                    navigate(target);
            }
        }, onAuxClick: function (evt) {
            if (definition.onAuxClick) {
                definition.onAuxClick(evt);
            }
            if (definition.route) {
                // keep URL parameters
                var target = insertRouteParameters(definition.route, getMenuRouteParams(definitions, path));
                window.open(target);
            }
        } }));
};
/**
 * Returns the internal name used by the menu to set the active state based off the given path
 * @param definitions The menu item definitions
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @param itemId The menu item id
 * @return The menu item "identifier" used to set the menu item active or undefined if no match has been found
 */
var resolveLocation = function (definitions, path, depth, itemId) {
    // first recurse to find the deepest matching link
    for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
        var def = definitions_1[_i];
        if (def.children) {
            var nextLevel = resolveLocation(def.children, path, depth + 1, itemId ? "".concat(itemId, "@").concat(def.title) : def.title);
            if (nextLevel)
                return nextLevel;
        }
    }
    // then try this level
    var matchDef = __spreadArray([], definitions, true).sort(function (a, b) { var _a, _b, _c, _d; return ((_b = (_a = b.route) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = a.route) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0); })
        .find(function (def) { return def.route && doesRouteMatch(def.route, path, false); });
    return matchDef
        ? itemId
            ? "".concat(itemId, "@").concat(matchDef.title)
            : matchDef.title
        : null;
};
var RoutedMenu = function (props) {
    var controlledState = useState("");
    var activeMenuItem = controlledState[0], setActiveMenuItem = controlledState[1];
    var location = useLocation();
    var path = location.pathname;
    var navigate = useNavigate();
    // set the currently active item based off location
    useEffect(function () {
        var menuEntry = resolveLocation(props.definition, path, 0, null);
        if (menuEntry && activeMenuItem !== menuEntry) {
            setActiveMenuItem(menuEntry);
        }
    }, [activeMenuItem, path, props.definition, setActiveMenuItem]);
    // convert routed menu definitions to normal menu definitions
    var rawDef = props.definition;
    var definition = React.useMemo(function () {
        return rawDef.map(function (entry) {
            return convertDefinition(rawDef, entry, path, 0, navigate);
        });
    }, [rawDef, path, navigate]);
    return (React.createElement(MenuBase, __assign({}, props, { definition: definition, customState: controlledState })));
};
export default React.memo(RoutedMenu);
