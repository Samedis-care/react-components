import { describe, expect, expectTypeOf, it } from "vitest";
import type * as PackageRoot from "../../../src";
import type { FormCrudMultiSelectProps } from "../../../src/backend-components/Form/CrudControls/FormCrudMultiSelect";
import type { CrudSelectDispatch } from "../../../src/backend-components/Selector/useCrudSelect";
import { useCrudSelectContext } from "../../../src/backend-components/Selector/CrudMultiSelect";
import useLazyCrudConnector from "../../../src/backend-components/Form/useLazyCrudConnector";
import type { ModelUnknown } from "../../../src/backend-integration";
import type { MultiSelectorData } from "../../../src/standalone";

// Type-level checks: tsc (tsconfig-test.json) fails on a type that is not exported, and on an
// expected error that does not occur. The runtime assertions only keep the values used.

describe("useLazyCrudConnector and FormCrudMultiSelect: the API apps build on", () => {
	it("[ISSUE-3505-ITEM-13] exports useCrudSelectContext from the package root", async () => {
		const root = (await import("../../../src")) as Record<string, unknown>;
		expect(root.useCrudSelectContext).toBe(useCrudSelectContext);
	}, 90000);

	it("[ISSUE-3505-ITEM-13] exports FormCrudMultiSelectProps and CrudSelectDispatch from the package root", () => {
		expectTypeOf<
			PackageRoot.FormCrudMultiSelectProps<ModelUnknown, MultiSelectorData>
		>().toEqualTypeOf<
			FormCrudMultiSelectProps<ModelUnknown, MultiSelectorData>
		>();
		expectTypeOf<
			PackageRoot.CrudSelectDispatch<MultiSelectorData>
		>().toEqualTypeOf<CrudSelectDispatch<MultiSelectorData>>();
	});

	it("[ISSUE-3505-ITEM-13] extraParams take a record, as the default connector factory does", () => {
		expectTypeOf(useLazyCrudConnector<{ variant: string }>).toBeFunction();
		expectTypeOf(useLazyCrudConnector<undefined>).toBeFunction();
		// @ts-expect-error the default connector factory gets extraParams, and takes a record
		expectTypeOf(useLazyCrudConnector<string>).toBeFunction();
	});
});
