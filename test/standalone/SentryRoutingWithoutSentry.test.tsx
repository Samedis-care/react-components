import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, cleanup, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";

afterEach(cleanup);

const notInstalled = () => {
	throw new Error("not installed");
};

// Sentry is an optional peer dependency (version 11), the app may have none or an older one
describe.each([
	[
		"without Sentry",
		() => {
			vi.doMock("@sentry/browser", notInstalled);
			vi.doMock("@sentry/core", notInstalled);
			vi.doMock("@sentry/conventions/attributes", notInstalled);
		},
	],
	[
		"with Sentry 10",
		() => {
			vi.doMock(
				"@sentry/conventions/attributes",
				async (importOriginal: () => Promise<Record<string, unknown>>) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars -- not in Sentry 10's conventions
					const { SENTRY_SEGMENT_NAME_SOURCE, ...sentry10 } =
						await importOriginal();
					return sentry10;
				},
			);
		},
	],
])("Routes %s", (_, mockSentry) => {
	beforeEach(() => {
		vi.resetModules();
		mockSentry();
	});

	afterEach(() => {
		vi.doUnmock("@sentry/browser");
		vi.doUnmock("@sentry/core");
		vi.doUnmock("@sentry/conventions/attributes");
	});

	it("render and navigate", async () => {
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

	it("refuse to set up the tracing integration", async () => {
		const { componentsCareBrowserTracingIntegration } =
			await import("../../src/standalone/Routes");
		expect(() => componentsCareBrowserTracingIntegration()).toThrow(
			"componentsCareBrowserTracingIntegration requires @sentry/react 11",
		);
	});
});
