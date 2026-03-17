import { describe, it, expect } from "vitest";
import {
	doesRouteMatch,
	extractRouteParameters,
	insertRouteParameters,
} from "../../src/utils/routeUtils";

/**
 * The RoutedMenu internal functions (getMenuRouteParams, convertDefinition,
 * resolveLocation) are not exported. We test the underlying route utilities
 * that they depend on, since those are the pure-function building blocks.
 */
describe("Portal / RoutedMenu route utilities", () => {
	describe("doesRouteMatch", () => {
		it("matches exact routes", () => {
			expect(doesRouteMatch("/home", "/home", true)).toBe(true);
		});

		it("does not match different exact routes", () => {
			expect(doesRouteMatch("/home", "/about", true)).toBe(false);
		});

		it("matches prefix routes (non-exact)", () => {
			expect(doesRouteMatch("/settings", "/settings/profile", false)).toBe(
				true,
			);
		});

		it("does not match prefix when exact is true", () => {
			expect(doesRouteMatch("/settings", "/settings/profile", true)).toBe(
				false,
			);
		});

		it("matches parameterized routes", () => {
			expect(doesRouteMatch("/user/:id", "/user/123", true)).toBe(true);
		});

		it("does not match parameterized route with extra segments when exact", () => {
			expect(doesRouteMatch("/user/:id", "/user/123/edit", true)).toBe(false);
		});

		it("matches parameterized route with extra segments when non-exact", () => {
			expect(doesRouteMatch("/user/:id", "/user/123/edit", false)).toBe(true);
		});
	});

	describe("extractRouteParameters", () => {
		it("extracts parameters from a matching route", () => {
			const params = extractRouteParameters("/user/:id", "/user/42", true);
			expect(params).toEqual({ id: "42" });
		});

		it("extracts multiple parameters", () => {
			const params = extractRouteParameters(
				"/org/:orgId/user/:userId",
				"/org/10/user/20",
				true,
			);
			expect(params).toEqual({ orgId: "10", userId: "20" });
		});

		it("throws when route does not match", () => {
			expect(() => extractRouteParameters("/user/:id", "/about", true)).toThrow(
				"Route does not match",
			);
		});

		it("extracts parameters with non-exact match", () => {
			const params = extractRouteParameters(
				"/user/:id",
				"/user/42/edit",
				false,
			);
			expect(params).toEqual({ id: "42" });
		});
	});

	describe("insertRouteParameters", () => {
		it("replaces parameter placeholders with values", () => {
			const result = insertRouteParameters("/user/:id", { id: "42" });
			expect(result).toBe("/user/42");
		});

		it("replaces multiple parameters", () => {
			const result = insertRouteParameters("/org/:orgId/user/:userId", {
				orgId: "10",
				userId: "20",
			});
			expect(result).toBe("/org/10/user/20");
		});

		it("leaves non-parameter segments unchanged", () => {
			const result = insertRouteParameters("/static/path", {});
			expect(result).toBe("/static/path");
		});
	});
});
