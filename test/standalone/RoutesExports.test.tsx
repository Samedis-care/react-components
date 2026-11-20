import { describe, it, expect, expectTypeOf, vi, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Action, createMemoryHistory } from "history";
import type * as HistoryPackage from "history";
import type * as PackageRoot from "../../src";
import HistoryRouter, {
	HistoryRouterContext,
	useHistoryRouterContext,
	type HistoryRouterContextType,
	type HistoryRouterProps,
} from "../../src/standalone/Routes/HistoryRouter";
import {
	RouteContext,
	useRouteInfo,
	type RouteContextType,
	type RouteProps,
} from "../../src/standalone/Routes/Route";
import type { RoutesProps } from "../../src/standalone/Routes/Routes";
import type { LinkProps } from "../../src/standalone/Routes/Link";
import useLocation, {
	LocationContext,
} from "../../src/standalone/Routes/useLocation";
import type {
	NavigateFunction,
	NavigateOptions,
} from "../../src/standalone/Routes/useNavigate";
import {
	normalizePath,
	type PathMatch,
	type PathPattern,
} from "../../src/standalone/Routes/matchPath";
import type { DocumentTitleFormatter } from "../../src/standalone/Routes/DocumentTitle";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("Routes exports", () => {
	it("[ISSUE-3475-ITEM-27] exports the routing contexts and normalizePath from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		const expected: Record<string, unknown> = {
			HistoryRouterContext,
			useHistoryRouterContext,
			LocationContext,
			RouteContext,
			useRouteInfo,
			normalizePath,
			// the enum of Update.action and History.action, a value to compare with
			Action,
		};
		for (const [name, value] of Object.entries(expected)) {
			expect(root[name], `${name} is missing from the package root`).toBe(
				value,
			);
		}
	}, 90000);

	it("[ISSUE-3475-ITEM-27] keeps the router's internals out of the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		for (const name of [
			"useRoutePrefix",
			"sentrySetRoutePath",
			"sentryHandleNavigation",
			"setRoutingInstrumentation",
		]) {
			expect(
				root,
				`${name} is exported from the package root`,
			).not.toHaveProperty(name);
		}
	}, 90000);

	it("[ISSUE-3475-ITEM-29] no longer exports SentryHistory from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		expect(root).not.toHaveProperty("SentryHistory");
		// FrameworkHistory, which it wrapped, stays
		expect(root).toHaveProperty("FrameworkHistory");
		expect(root).toHaveProperty("setFrameworkHistory");
	}, 90000);

	it("[ISSUE-3475-ITEM-27] exports the props, option and context types from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.RouteProps>().toEqualTypeOf<RouteProps>();
		expectTypeOf<PackageRoot.RoutesProps>().toEqualTypeOf<RoutesProps>();
		expectTypeOf<PackageRoot.LinkProps>().toEqualTypeOf<LinkProps>();
		expectTypeOf<PackageRoot.HistoryRouterProps>().toEqualTypeOf<HistoryRouterProps>();
		expectTypeOf<PackageRoot.HistoryRouterContextType>().toEqualTypeOf<HistoryRouterContextType>();
		expectTypeOf<PackageRoot.RouteContextType>().toEqualTypeOf<RouteContextType>();
		expectTypeOf<PackageRoot.NavigateOptions>().toEqualTypeOf<NavigateOptions>();
		expectTypeOf<PackageRoot.NavigateFunction>().toEqualTypeOf<NavigateFunction>();
		expectTypeOf<PackageRoot.PathPattern>().toEqualTypeOf<PathPattern>();
		expectTypeOf<PackageRoot.PathMatch>().toEqualTypeOf<PathMatch>();
		expectTypeOf<PackageRoot.DocumentTitleFormatter>().toEqualTypeOf<DocumentTitleFormatter>();
		// the type of useRouteInfo() can be named
		expectTypeOf<
			ReturnType<typeof PackageRoot.useRouteInfo>
		>().toEqualTypeOf<PackageRoot.RouteContextType>();
		// @ts-expect-error the instrumentation hook is internal to the Sentry integration
		expectTypeOf<PackageRoot.RoutingInstrumentation>();
	});

	it("[ISSUE-3475-ITEM-27] exports the history types its API is written in from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.History>().toEqualTypeOf<HistoryPackage.History>();
		expectTypeOf<PackageRoot.Location>().toEqualTypeOf<HistoryPackage.Location>();
		expectTypeOf<PackageRoot.To>().toEqualTypeOf<HistoryPackage.To>();
		expectTypeOf<PackageRoot.Path>().toEqualTypeOf<HistoryPackage.Path>();
		expectTypeOf<PackageRoot.Update>().toEqualTypeOf<HistoryPackage.Update>();
		expectTypeOf<PackageRoot.Transition>().toEqualTypeOf<HistoryPackage.Transition>();
		expectTypeOf<PackageRoot.Action>().toEqualTypeOf<HistoryPackage.Action>();
	});
});

describe("Routes errors", () => {
	it("[ISSUE-3475-ITEM-27] names Framework and HistoryRouter when a hook is used outside a HistoryRouter", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const ReadLocation = () => {
			useLocation();
			return null;
		};
		const ReadHistory = () => {
			useHistoryRouterContext();
			return null;
		};
		expect(() => render(<ReadLocation />)).toThrow(
			"Location context missing, did you forget to add Components-Care Framework or HistoryRouter?",
		);
		expect(() => render(<ReadHistory />)).toThrow(
			"HistoryRouterContext missing, did you forget to add Components-Care Framework or HistoryRouter?",
		);
	});

	it("[ISSUE-3475-ITEM-27] names Route when useRouteInfo is used outside a Route", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const ReadRoute = () => {
			useRouteInfo();
			return null;
		};
		expect(() =>
			render(
				<HistoryRouter history={createMemoryHistory()}>
					<ReadRoute />
				</HistoryRouter>,
			),
		).toThrow(
			"RouteContext missing, did you forget to render this inside a Route? Dialogs pushed with useDialogContext and toasts render outside of every Route.",
		);
	});
});
