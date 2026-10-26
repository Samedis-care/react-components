import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, cleanup, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";

afterEach(cleanup);

const SENTRY_MODULES = [
	"@sentry/react",
	"@sentry/browser",
	"@sentry/core",
	"@sentry/conventions/attributes",
];

const notInstalled = () => {
	throw new Error("not installed");
};

// Sentry is an optional peer dependency, the app may not have it installed
describe("without Sentry", () => {
	beforeEach(() => {
		vi.resetModules();
		for (const id of SENTRY_MODULES) vi.doMock(id, notInstalled);
	});

	afterEach(() => {
		for (const id of SENTRY_MODULES) vi.doUnmock(id);
	});

	it("Routes render and navigate", async () => {
		const { HistoryRouter, Route, Routes } =
			await import("../../src/standalone/Routes");
		const history = createMemoryHistory({ initialEntries: ["/a/1"] });
		render(
			<HistoryRouter history={history}>
				<Routes>
					<Route path={"/a/:id"} element={<div>route a</div>} />
					<Route path={"/b"} element={<div>route b</div>} />
				</Routes>
			</HistoryRouter>,
		);
		expect(screen.getByText("route a")).toBeInTheDocument();
		act(() => history.push("/b"));
		expect(screen.getByText("route b")).toBeInTheDocument();
	});
});

describe("with Sentry 10", () => {
	beforeEach(() => {
		vi.resetModules();
		// a bundler that tolerates missing exports leaves Sentry 11's undefined
		vi.doMock(
			"@sentry/conventions/attributes",
			async (importOriginal: () => Promise<Record<string, unknown>>) => ({
				...(await importOriginal()),
				SENTRY_SEGMENT_NAME_SOURCE: undefined,
			}),
		);
	});

	afterEach(() => {
		vi.doUnmock("@sentry/conventions/attributes");
	});

	it("the tracing integration refuses to set up", async () => {
		const { componentsCareBrowserTracingIntegration } =
			await import("../../src/sentry");
		expect(() => componentsCareBrowserTracingIntegration()).toThrow(
			"componentsCareBrowserTracingIntegration requires @sentry/react 11",
		);
	});
});
