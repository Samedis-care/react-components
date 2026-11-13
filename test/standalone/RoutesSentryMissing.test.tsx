import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// The routing components with the Sentry packages missing. @sentry/react is an
// optional peer dependency. The mocks below make @sentry/core and
// @sentry/browser fail to import for the whole file, so the components are
// imported inside the tests, after the mocks are in place.

vi.mock("@sentry/core", () => {
	throw new Error("Cannot find module '@sentry/core'");
});
vi.mock("@sentry/browser", () => {
	throw new Error("Cannot find module '@sentry/browser'");
});

beforeEach(() => {
	// useNavigate resets the scroll position; jsdom does not implement scrollTo
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const load = async () => ({
	HistoryRouter: (await import("../../src/standalone/Routes/HistoryRouter"))
		.default,
	Routes: (await import("../../src/standalone/Routes/Routes")).default,
	Route: (await import("../../src/standalone/Routes/Route")).default,
});

describe("Routes without the Sentry packages", () => {
	it("[ISSUE-3475-ITEM-4] renders routes and follows navigation", async () => {
		const { HistoryRouter, Routes, Route } = await load();
		const history = createMemoryHistory({ initialEntries: ["/a"] });
		render(
			<HistoryRouter history={history}>
				<Routes>
					{[
						<Route key="a" path="/a" element={<div>PAGE A</div>} />,
						<Route key="b" path="/b" element={<div>PAGE B</div>} />,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(screen.getByText("PAGE A")).toBeInTheDocument();
		act(() => history.push("/b"));
		expect(screen.getByText("PAGE B")).toBeInTheDocument();
	});
});

const ROOT = path.resolve(__dirname, "../..");

// The Sentry packages the published code imports (stories are not published)
const sentryPackagesImported = (): string[] => {
	const found = new Set<string>();
	const src = path.join(ROOT, "src");
	for (const file of readdirSync(src, { recursive: true, encoding: "utf8" })) {
		if (!/\.tsx?$/.test(file) || /\.stories\.tsx?$/.test(file)) continue;
		const source = readFileSync(path.join(src, file), "utf8");
		for (const [, name] of source.matchAll(
			/(?:from|import\()\s*["'](@sentry\/[^/"']+)/g,
		))
			found.add(name);
	}
	return [...found].sort();
};

describe("Sentry peer dependencies", () => {
	it("[ISSUE-3475-ITEM-4] declares every Sentry package it imports as an optional peer dependency", () => {
		const pkg = JSON.parse(
			readFileSync(path.join(ROOT, "package.json"), "utf8"),
		) as {
			peerDependencies: Record<string, string>;
			peerDependenciesMeta: Record<string, { optional?: boolean }>;
		};
		const isSentry = (name: string) => name.startsWith("@sentry/");
		const imported = sentryPackagesImported();
		expect(imported).toContain("@sentry/react");
		expect(Object.keys(pkg.peerDependencies).filter(isSentry).sort()).toEqual(
			imported,
		);
		expect(
			Object.keys(pkg.peerDependenciesMeta).filter(isSentry).sort(),
		).toEqual(imported);
		for (const name of imported)
			expect(pkg.peerDependenciesMeta[name], name).toEqual({ optional: true });
		// @sentry/react depends on exactly its own version of @sentry/core
		expect(pkg.peerDependencies["@sentry/core"]).toBe(
			pkg.peerDependencies["@sentry/react"],
		);
	});
});
