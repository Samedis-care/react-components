import React, { Dispatch, SetStateAction, useContext, useState } from "react";

export interface PermissionContextProviderProps {
	children: React.ReactElement;
}

/**
 * General information regarding permission format:
 * Each permission is specified as path using . (dot) as seperation character, ex:
 * - module.submodule.function.subfunction
 * - module.submodule.function
 * - module.function
 * - module
 *
 * Permissions support the * (asterisk) character als wildcard matching character, ex:
 * - module.* => matches module.submodule.function.subfunction, module.submodul.function and module.function, but not module
 * - module.submodule.* => matches module.submodule.function.subfunction, module.submodul.function
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
 * Pattern matching permission checking
 * @param perms A list of permissions, usually taken from PermissionContext (usePermissionContext)
 * @param perm A permission to check
 */
export const hasPermission = (perms: string[], perm: string): boolean => {
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
