import React, { Dispatch, SetStateAction } from "react";
export interface PermissionContextProviderProps {
    children: React.ReactElement;
}
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
export declare const PermissionContext: React.Context<[string[], React.Dispatch<React.SetStateAction<string[]>>] | undefined>;
/**
 * Provides the current permission context, throwing an error if it's not set
 * @remarks This is a React hook
 */
export declare const usePermissionContext: () => [
    string[],
    Dispatch<SetStateAction<string[]>>
];
/**
 * A single permission, multiple permissions (logical OR) or no permission required (null) or never (false)
 */
export type Permission = string | string[] | null | false;
/**
 * Pattern matching permission checking
 * @param perms A list of permissions, usually taken from PermissionContext (usePermissionContext)
 * @param perm Permission(s) to check
 */
export declare const hasPermission: (perms: string[], perm: Permission) => boolean;
/**
 * Check if the permission is set in the current context
 * @param perm The permission to check
 * @returns Permission present?
 * @remarks React hook version of hasPermission
 */
export declare const useHasPermission: (perm: Permission) => boolean;
declare const _default: React.MemoExoticComponent<(props: PermissionContextProviderProps) => JSX.Element>;
export default _default;
