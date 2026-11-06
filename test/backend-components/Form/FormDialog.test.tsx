import { describe, it, expect } from "vitest";
import {
	FormDialogDefaultRenderer,
	FormDialogDispatchContext,
	IsInFormDialogContext,
} from "../../../src/backend-components/Form/FormDialog";
import { BasicFormPageNestingContext } from "../../../src/backend-components/Form/BasicFormPage";

describe("FullFormDialog", () => {
	it("[ISSUE-3503-ITEM-15] the FullFormDialog and form page contexts are exported from the package root", async () => {
		const root = (await import("../../../src")) as Record<string, unknown>;
		expect(root.IsInFormDialogContext, "IsInFormDialogContext").toBe(
			IsInFormDialogContext,
		);
		expect(root.FormDialogDispatchContext, "FormDialogDispatchContext").toBe(
			FormDialogDispatchContext,
		);
		expect(root.FormDialogDefaultRenderer, "FormDialogDefaultRenderer").toBe(
			FormDialogDefaultRenderer,
		);
		expect(
			root.BasicFormPageNestingContext,
			"BasicFormPageNestingContext",
		).toBe(BasicFormPageNestingContext);
	}, 90000);
});
