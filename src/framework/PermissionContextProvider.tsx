import React, { Dispatch, SetStateAction, useContext, useState } from "react";

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
export const PermissionContext = React.createContext<
	[string[], Dispatch<SetStateAction<string[]>>] | undefined
>(undefined);

/**
 * Provides the current permission context, throwing an error if it's not set
 * @remarks This is a React hook
 */
export const usePermissionContext = (): [
	string[],
	Dispatch<SetStateAction<string[]>>,
] => {
	const ctx = useContext(PermissionContext);
	if (!ctx) throw new Error("PermissionContext is not set");
	return ctx;
};

/**
 * A single permission, multiple permissions (logical OR) or no permission required (null) or never (false)
 */
export type Permission = string | string[] | null | false;

/**
 * Pattern matching permission checking
 * @param perms A list of permissions, usually taken from PermissionContext (usePermissionContext)
 * @param perm Permission(s) to check
 */
export const hasPermission = (perms: string[], perm: Permission): boolean => {
	if (perm === null) return true;
	if (perm === false) return false;

	if (typeof perm !== "string") {
		for (const canDo of perm) {
			if (hasPermission(perms, canDo)) {
				return true;
			}
		}
		return false;
	}

	// return true if perm matches
	const checkSinglePerm = (perm: string): boolean => {
		const checkParts = perm.split(".");
		for (const presentPermission of perms) {
			const presentParts = presentPermission.split(".");

			let okay = false;
			for (let i = 0; i < checkParts.length; ++i) {
				okay = false;
				if (presentParts[i] === undefined) break;
				if (presentParts[i] !== "*" && presentParts[i] !== checkParts[i]) break;
				okay = true;
				if (presentParts[i] === "*") break;
			}

			if (okay) return true;
		}

		return false;
	};

	// if we can't find non-matching perms we have permission
	return (
		perm.split("+").find((singlePerm) => !checkSinglePerm(singlePerm)) ===
		undefined
	);
};

/**
 * Check if the permission is set in the current context
 * @param perm The permission to check
 * @returns Permission present?
 * @remarks React hook version of hasPermission
 */
export const useHasPermission = (perm: Permission) => {
	const [perms] = usePermissionContext();
	return hasPermission(perms, perm);
};

const PermissionContextProvider = (props: PermissionContextProviderProps) => {
	const state = useState<string[]>([]);

	return (
		<PermissionContext.Provider value={state}>
			{props.children}
		</PermissionContext.Provider>
	);
};

export default React.memo(PermissionContextProvider);
