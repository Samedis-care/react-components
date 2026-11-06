/**
 * Step 2 of the unguided import wizard ("Connect data", useImportStep2Logic and
 * Step2ConnectData): the source columns, one script card per importable field, and the
 * debounced check of each typed conversion script with its status.
 */
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import Step2ConnectData from "../../../src/backend-components/CRUD/Import/Step2ConnectData";
import { ModelDataTypeEnumSelectRenderer } from "../../../src/backend-integration";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { LOAD, setupCrudTests } from "./crudFixture";
import {
	baseFields,
	EDIT,
	extraFields,
	importModel,
	initState,
	renderStepComponent,
} from "./importFixture";

setupCrudTests();

const DATA = [{ n: "Alice" }, { n: "Bob" }];

describe("Step2ConnectData", () => {
	const renderStep2 = (data: Record<string, unknown>[] = DATA) =>
		renderStepComponent(
			Step2ConnectData,
			importModel(new MockConnector([]), {
				...baseFields(),
				...extraFields(),
			}),
			initState(data),
		);

	it("[ISSUE-3508-ITEM-27] names each script field after the field it converts", async () => {
		const { container } = renderStep2();
		await screen.findByText("First Name (first_name)", undefined, LOAD);
		expect(screen.getByRole("textbox", { name: /First Name/ })).toBe(
			container.querySelector('textarea[name="first_name"]'),
		);
	});

	it("[ISSUE-3508-ITEM-27] gives every script field its own name, and the type it expects as its description", async () => {
		const { container } = renderStep2();
		await screen.findByText("First Name (first_name)", undefined, LOAD);
		const field = (name: string) =>
			container.querySelector<HTMLTextAreaElement>(`textarea[name="${name}"]`)!;
		for (const [name, label] of [
			["first_name", "First Name"],
			["email", "Email"],
			["count", "Count"],
			["active", "Active"],
			["born", "Born"],
			["dept", "Department"],
			["tags", "Tags"],
			["contact.email", "Contact email"],
			["code", "Code"],
		])
			expect(field(name)).toHaveAccessibleName(
				`${label}: Conversion Script (JavaScript)`,
			);
		expect(field("first_name")).toHaveAccessibleDescription("string");
		expect(field("count")).toHaveAccessibleDescription("number");
		expect(field("born")).toHaveAccessibleDescription("date");
		// an enum's values, as the script has to return them
		expect(field("dept")).toHaveAccessibleDescription(
			'enum "eng" (Engineering), "ops" (Operations)',
		);
		expect(field("tags")).toHaveAccessibleDescription('enum "a" (A), "b" (B)');
		expect(
			screen.getByText('"eng" (Engineering), "ops" (Operations)'),
		).toBeVisible();
	});

	it("[ISSUE-3508-ITEM-27] lists an enum's values as string literals, without dividers and invisible values, and names a field without a label by its key", async () => {
		const { container } = renderStepComponent(
			Step2ConnectData,
			importModel(new MockConnector([]), {
				status: {
					type: new ModelDataTypeEnumSelectRenderer(
						[
							{ value: "", getLabel: () => "None" },
							{ value: "open", getLabel: () => "Open" },
							{ value: "div", getLabel: () => "", isDivider: true },
							{ value: "old", getLabel: () => "Old", invisible: true },
							{ value: 'say "hi"', getLabel: () => 'say "hi"' },
						],
						"",
					),
					getLabel: () => "",
					visibility: EDIT,
					customData: null,
				},
			}),
			initState(DATA),
		);
		const field = await screen.findByRole(
			"textbox",
			{ name: "status: Conversion Script (JavaScript)" },
			LOAD,
		);
		expect(field).toBe(container.querySelector('textarea[name="status"]'));
		expect(field).toHaveAccessibleDescription(
			'enum "" (None), "open" (Open), "say \\"hi\\""',
		);
	});
});
