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

describe("matchPath – percent-encoding", () => {
	it("[ISSUE-3475-ITEM-11] decodes params, also of a location with raw text, and keeps the url as the location has it", () => {
		const result = matchPath(
			{ path: "/search/:term/:x/*" },
			"/search/foo%20bar/%C3%A4/more",
		);
		expect(result?.params).toEqual({ term: "foo bar", x: "ä" });
		// paths are built from the url, so it keeps the location's encoding
		expect(result?.url).toBe("/search/foo%20bar/%C3%A4");
		// a memory history keeps the text as pushed
		expect(
			matchPath({ path: "/search/:term/:x" }, "/search/foo bar/ä")?.params,
		).toEqual({ term: "foo bar", x: "ä" });
	});

	it("[ISSUE-3475-ITEM-11] keeps an encoded slash inside its segment", () => {
		const result = matchPath({ path: "/files/:name/*" }, "/files/a%2Fb/c");
		expect(result?.params).toEqual({ name: "a/b" });
		expect(result?.url).toBe("/files/a%2Fb");
		expect(matchPath({ path: "/files/:a/:b" }, "/files/a%2Fb")).toBeNull();
		expect(matchPath({ path: "/files/a/b" }, "/files/a%2Fb")).toBeNull();
	});

	it("[ISSUE-3475-ITEM-11] gives the raw text of a segment with a malformed escape, without throwing", () => {
		const result = matchPath({ path: "/x/:discount/:bad" }, "/x/100%/%E0%A4%A");
		expect(result?.params).toEqual({ discount: "100%", bad: "%E0%A4%A" });
		expect(matchPath({ path: "/100%" }, "/100%")).not.toBeNull();
	});

	it("[ISSUE-3475-ITEM-11] compares literal segments decoded, case-insensitively unless caseSensitive", () => {
		expect(matchPath({ path: "/über" }, "/%C3%BCber")?.url).toBe("/%C3%BCber");
		expect(matchPath({ path: "/über/*" }, "/%C3%9Cber/1")).not.toBeNull();
		expect(
			matchPath({ path: "/über", caseSensitive: true }, "/%C3%9Cber"),
		).toBeNull();
		expect(
			matchPath({ path: "/Über", caseSensitive: true }, "/%C3%9Cber"),
		).not.toBeNull();
		expect(matchPath({ path: "/a b" }, "/a%20b")).not.toBeNull();
	});
});

describe("SentryRoutingInstrumentation exports", () => {
	it("exports the routing hooks without crashing at import time", async () => {
		const mod =
			await import("../../src/standalone/Routes/SentryRoutingInstrumentation");
		expect(typeof mod.setRoutingInstrumentation).toBe("function");
		expect(typeof mod.sentryHandleNavigation).toBe("function");
		expect(typeof mod.sentrySetRoutePath).toBe("function");
	});
});
