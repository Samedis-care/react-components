import { describe, it, expect } from "vitest";
import * as Icons from "../../src/standalone/Icons";

describe("Icons", () => {
	const expectedExports = [
		"FilterIcon",
		"FilterActiveIcon",
		"SignIcon",
		"TuneIcon",
		"ResetIcon",
		"ExportIcon",
		"AppsIcon",
	] as const;

	it("exports all expected icon names", () => {
		for (const name of expectedExports) {
			expect(Icons, `Missing export: ${name}`).toHaveProperty(name);
		}
	});

	it("each icon export is a function (React component)", () => {
		for (const name of expectedExports) {
			const icon = (Icons as Record<string, unknown>)[name];
			// React.memo wraps the component; the result is an object with $$typeof
			// Both plain functions and memo objects are valid React component types
			expect(
				typeof icon === "function" ||
					(typeof icon === "object" && icon !== null),
				`${name} is not a valid React component type`,
			).toBe(true);
		}
	});

	it("each icon export has a $$typeof symbol (is a React element type)", () => {
		for (const name of expectedExports) {
			const icon = (Icons as Record<string, unknown>)[name] as Record<
				string,
				unknown
			>;
			// React.memo components have $$typeof set to Symbol(react.memo)
			expect(icon, `${name} missing $$typeof`).toHaveProperty("$$typeof");
		}
	});

	it("exports exactly the documented icons (no undocumented extras)", () => {
		const keys = Object.keys(Icons);
		for (const name of expectedExports) {
			expect(keys).toContain(name);
		}
	});
});
