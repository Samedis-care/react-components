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
	Dispatch<SetStateAction<string[]>>
] => {
	const ctx = useContext(PermissionContext);
	if (!ctx) throw new Error("PermissionContext is not set");
	return ctx;
};

/**
 * A single permission, multiple permissions or no permission required (null)
 */
export type Permission = string | string[] | null;

/**
 * Pattern matching permission checking
 * @param perms A list of permissions, usually taken from PermissionContext (usePermissionContext)
 * @param perm Permission(s) to check
 */
export const hasPermission = (perms: string[], perm: Permission): boolean => {
	if (perm === null) return true;
	if (typeof perm !== "string") {
		return (
			perm.map((canDo) => hasPermission(perms, canDo)).filter((res) => !res)
				.length > 0
		);
	}

	const parts = perm.split(".");
	for (const presentPerm of perms) {
		const presentParts = presentPerm.split(".");

		let okay = false;
		for (let i = 0; i < parts.length; ++i) {
			if (presentParts[i] === undefined) break;
			if (presentParts[i] !== "*" && presentParts[i] !== parts[i]) break;
			okay = true;
			if (presentParts[i] === "*") break;
		}

		if (okay) return true;
	}

	return false;
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
