import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, expectTypeOf, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import FormPageLayout, {
	FormPageLayoutClassKey,
	FormPageLayoutProps,
} from "../../src/standalone/Form/FormPageLayout";
import type * as PackageRoot from "../../src";

afterEach(cleanup);

const theme = createTheme();

const renderLayout = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

type Slot = "root" | "wrapper" | "body" | "footer";

// the CcFormPageLayout-<slot> part of emotion's class names exists in development and
// test builds only; fine as a test selector, not as an app selector
const slotOf = (container: HTMLElement, name: Slot) =>
	container.querySelector<HTMLElement>(`[class*="CcFormPageLayout-${name}"]`);

describe("FormPageLayout", () => {
	it.each([
		["null", null],
		["undefined", undefined],
		["false", false],
	] as const)(
		"[ISSUE-3473-ITEM-5] renders no footer and reserves no space for it when footer is %s",
		(_, footer) => {
			const { container } = renderLayout(
				<FormPageLayout body={<span />} footer={footer} />,
			);
			const body = slotOf(container, "body");
			expect(body).not.toBeNull();
			expect(parseFloat(getComputedStyle(body!).paddingBottom || "0")).toBe(0);
			expect(slotOf(container, "footer")).toBeNull();
		},
	);

	it("[ISSUE-3473-ITEM-6] exports FormPageLayout from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		expect(
			root.FormPageLayout,
			"FormPageLayout is missing from the package root",
		).toBe(FormPageLayout);
	}, 90000);

	it("[ISSUE-3473-ITEM-6] exports its props and class key types from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.FormPageLayoutProps>().toEqualTypeOf<FormPageLayoutProps>();
		expectTypeOf<PackageRoot.FormPageLayoutClassKey>().toEqualTypeOf<FormPageLayoutClassKey>();
	});
});
