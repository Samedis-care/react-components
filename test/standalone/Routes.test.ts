import { describe, it, expect } from "vitest";
import matchPath, {
	normalizePath,
} from "../../src/standalone/Routes/matchPath";

describe("normalizePath", () => {
	it("removes double slashes", () => {
		expect(normalizePath("//foo//bar")).toBe("/foo/bar");
	});

	it("leaves single slashes untouched", () => {
		expect(normalizePath("/foo/bar")).toBe("/foo/bar");
	});

	it("handles triple slashes", () => {
		expect(normalizePath("///a")).toBe("/a");
	});
});

describe("matchPath – exact segment matches", () => {
	it("matches identical paths", () => {
		const result = matchPath({ path: "/home" }, "/home");
		expect(result).not.toBeNull();
		expect(result?.url).toBe("/home");
		expect(result?.params).toEqual({});
	});

	it("returns null for different paths", () => {
		expect(matchPath({ path: "/home" }, "/about")).toBeNull();
	});

	it("matches root path against root location", () => {
		expect(matchPath({ path: "/" }, "/")).not.toBeNull();
	});

	it("returns null for root path against non-root location", () => {
		expect(matchPath({ path: "/" }, "/home")).toBeNull();
	});
});

describe("matchPath – end option", () => {
	it("does NOT match a prefix path when end=true and location is longer", () => {
		expect(
			matchPath({ path: "/hello/world", end: true }, "/hello/world/good"),
		).toBeNull();
	});

	it("matches when location equals path and end=true", () => {
		const result = matchPath(
			{ path: "/hello/world", end: true },
			"/hello/world",
		);
		expect(result).not.toBeNull();
		expect(result?.url).toBe("/hello/world");
	});

	it("matches prefix when end is false (default)", () => {
		const result = matchPath({ path: "/hello/world" }, "/hello/world/good");
		expect(result).not.toBeNull();
	});
});

describe("matchPath – wildcard *", () => {
	it("matches any suffix with wildcard", () => {
		const result = matchPath({ path: "/hello/world/*" }, "/hello/world/good");
		expect(result).not.toBeNull();
	});

	it("wildcard with end=true still matches longer paths", () => {
		const result = matchPath(
			{ path: "/hello/world/*", end: true },
			"/hello/world/good",
		);
		expect(result).not.toBeNull();
	});

	it("bare wildcard path matches any location", () => {
		const result = matchPath({ path: "/*" }, "/anything/here");
		expect(result).not.toBeNull();
	});
});

describe("matchPath – named parameters", () => {
	it("extracts a single parameter", () => {
		const result = matchPath({ path: "/users/:id" }, "/users/42");
		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ id: "42" });
		expect(result?.url).toBe("/users/42");
	});

	it("extracts multiple parameters", () => {
		const result = matchPath(
			{ path: "/org/:orgId/team/:teamId" },
			"/org/acme/team/devs",
		);
		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ orgId: "acme", teamId: "devs" });
	});

	it("returns null when a param segment is missing", () => {
		expect(matchPath({ path: "/users/:id/settings" }, "/users")).toBeNull();
	});
});

describe("matchPath – case sensitivity", () => {
	it("is case-insensitive by default", () => {
		expect(matchPath({ path: "/Home" }, "/home")).not.toBeNull();
	});

	it("is case-sensitive when caseSensitive=true", () => {
		expect(
			matchPath({ path: "/Home", caseSensitive: true }, "/home"),
		).toBeNull();
	});

	it("matches when case is the same and caseSensitive=true", () => {
		expect(
			matchPath({ path: "/Home", caseSensitive: true }, "/Home"),
		).not.toBeNull();
	});
});

describe("SentryRoutingInstrumentation exports", () => {
	it("exports componentsCareBrowserTracingIntegration without crashing at import time", async () => {
		const mod =
			await import("../../src/standalone/Routes/SentryRoutingInstrumentation");
		expect(typeof mod.componentsCareBrowserTracingIntegration).toBe("function");
		expect(typeof mod.sentryHandleNavigation).toBe("function");
		expect(typeof mod.sentrySetRoutePath).toBe("function");
	});
});
