import { describe, it, expect } from "vitest";
import { hasPermission } from "../../src/framework/PermissionContextProvider";

describe("hasPermission", () => {
	describe("null permission", () => {
		it("returns true regardless of perms", () => {
			expect(hasPermission([], null)).toBe(true);
			expect(hasPermission(["some.perm"], null)).toBe(true);
		});
	});

	describe("false permission", () => {
		it("returns false regardless of perms", () => {
			expect(hasPermission([], false)).toBe(false);
			expect(hasPermission(["some.perm"], false)).toBe(false);
		});
	});

	describe("simple string permission", () => {
		it("matches exact permission", () => {
			expect(hasPermission(["admin"], "admin")).toBe(true);
		});

		it("returns false when permission is not present", () => {
			expect(hasPermission(["user"], "admin")).toBe(false);
		});
	});

	describe("dot-notation hierarchy", () => {
		it("matches exact dot-notation permission", () => {
			expect(hasPermission(["module.sub.action"], "module.sub.action")).toBe(
				true,
			);
		});

		it("does not match partial path", () => {
			expect(hasPermission(["module.sub"], "module.sub.action")).toBe(false);
		});

		it("does not match different path", () => {
			expect(hasPermission(["module.other.action"], "module.sub.action")).toBe(
				false,
			);
		});
	});

	describe("wildcard matching", () => {
		it("matches with wildcard at end", () => {
			expect(hasPermission(["module.*"], "module.sub.action")).toBe(true);
		});

		it("matches single level with wildcard", () => {
			expect(hasPermission(["module.*"], "module.function")).toBe(true);
		});

		it("matches the base even without sub-path when wildcard is present", () => {
			expect(hasPermission(["module.*"], "module")).toBe(true);
		});

		it("matches everything with top-level wildcard", () => {
			expect(hasPermission(["*"], "anything.here")).toBe(true);
		});

		it("matches nested wildcard", () => {
			expect(
				hasPermission(["module.submodule.*"], "module.submodule.func"),
			).toBe(true);
		});

		it("does not match wildcard in wrong scope", () => {
			expect(hasPermission(["other.*"], "module.sub")).toBe(false);
		});
	});

	describe("logical AND with +", () => {
		it("requires both permissions", () => {
			expect(hasPermission(["perm1", "perm2"], "perm1+perm2")).toBe(true);
		});

		it("fails when one permission is missing", () => {
			expect(hasPermission(["perm1"], "perm1+perm2")).toBe(false);
		});

		it("fails when both permissions are missing", () => {
			expect(hasPermission([], "perm1+perm2")).toBe(false);
		});

		it("works with dot-notation and +", () => {
			expect(
				hasPermission(
					["app.access", "module.function"],
					"app.access+module.function",
				),
			).toBe(true);
		});
	});

	describe("array of permissions (logical OR)", () => {
		it("returns true if any permission matches", () => {
			expect(hasPermission(["perm2"], ["perm1", "perm2"])).toBe(true);
		});

		it("returns false if no permission matches", () => {
			expect(hasPermission(["perm3"], ["perm1", "perm2"])).toBe(false);
		});

		it("returns false for empty permission array", () => {
			expect(hasPermission(["perm1"], [])).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("returns false for empty perms array with string permission", () => {
			expect(hasPermission([], "some.perm")).toBe(false);
		});

		it("handles empty string permission", () => {
			expect(hasPermission([""], "")).toBe(true);
		});

		it("handles empty string in perms matching empty string permission", () => {
			expect(hasPermission(["something"], "")).toBe(false);
		});
	});
});
