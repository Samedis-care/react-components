import { describe, it, expect, expectTypeOf } from "vitest";
import FormPageLayout, {
	FormPageLayoutClassKey,
	FormPageLayoutProps,
} from "../../src/standalone/Form/FormPageLayout";
import type * as PackageRoot from "../../src";

describe("FormPageLayout", () => {
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
