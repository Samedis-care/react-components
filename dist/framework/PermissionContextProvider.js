import React, { useContext, useState } from "react";
/**
 * General information regarding permission format:
 * Each permission is specified as path using . (dot) as separation character, ex:
 * - module.submodule.function.sub-function
 * - module.submodule.function
 * - module.function
 * - module
 *
 * Permissions support the * (asterisk) character als wildcard matching character, ex:
 * - module.* => matches module.submodule.function.sub-function, module.submodule.function and module.function, but not module
 * - module.submodule.* => matches module.submodule.function.sub-function, module.submodule.function
 * - * => matches everything
 *
 * Permissions can be combined in a logical AND using a plus sign, ex:
 * - app.access+module.function
 */
export var PermissionContext = React.createContext(undefined);
/**
 * Provides the current permission context, throwing an error if it's not set
 * @remarks This is a React hook
 */
export var usePermissionContext = function () {
    var ctx = useContext(PermissionContext);
    if (!ctx)
        throw new Error("PermissionContext is not set");
    return ctx;
};
/**
 * Pattern matching permission checking
 * @param perms A list of permissions, usually taken from PermissionContext (usePermissionContext)
 * @param perm Permission(s) to check
 */
export var hasPermission = function (perms, perm) {
    if (perm === null)
        return true;
    if (perm === false)
        return false;
    if (typeof perm !== "string") {
        for (var _i = 0, perm_1 = perm; _i < perm_1.length; _i++) {
            var canDo = perm_1[_i];
            if (hasPermission(perms, canDo)) {
                return true;
            }
        }
        return false;
    }
    // return true if perm matches
    var checkSinglePerm = function (perm) {
        var checkParts = perm.split(".");
        for (var _i = 0, perms_1 = perms; _i < perms_1.length; _i++) {
            var presentPermission = perms_1[_i];
            var presentParts = presentPermission.split(".");
            var okay = false;
            for (var i = 0; i < checkParts.length; ++i) {
                okay = false;
                if (presentParts[i] === undefined)
                    break;
                if (presentParts[i] !== "*" && presentParts[i] !== checkParts[i])
                    break;
                okay = true;
                if (presentParts[i] === "*")
                    break;
            }
            if (okay)
                return true;
        }
        return false;
    };
    // if we can't find non-matching perms we have permission
    return (perm.split("+").find(function (singlePerm) { return !checkSinglePerm(singlePerm); }) ===
        undefined);
};
/**
 * Check if the permission is set in the current context
 * @param perm The permission to check
 * @returns Permission present?
 * @remarks React hook version of hasPermission
 */
export var useHasPermission = function (perm) {
    var perms = usePermissionContext()[0];
    return hasPermission(perms, perm);
};
var PermissionContextProvider = function (props) {
    var state = useState([]);
    return (React.createElement(PermissionContext.Provider, { value: state }, props.children));
};
export default React.memo(PermissionContextProvider);
