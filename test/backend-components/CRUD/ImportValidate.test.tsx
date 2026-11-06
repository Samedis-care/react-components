/**
 * Step 3 of the import wizard ("Validation & Review", useImportStep3Logic and
 * Step3ValidateReview), the only gate before records are written: which record is built per
 * row, what is validated, how errors are reported and when the step lets the import start.
 * Also GenericDataPreview, the grid of the review and of step 1's preview.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { useImportStep3Logic } from "../../../src/backend-components/CRUD/Import/Step3ValidateReview";
import type { CrudImporterStepProps } from "../../../src/backend-components/CRUD/Import";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { LOAD, setupCrudTests } from "./crudFixture";
import {
	baseFields,
	extraFields,
	importModel,
	initState,
	renderStep,
	script,
} from "./importFixture";

setupCrudTests();

afterEach(() => {
	vi.unstubAllEnvs();
});

const fullModel = () =>
	importModel(new MockConnector([]), { ...baseFields(), ...extraFields() });

/** Runs step 3 over the rows and waits for its records */
const validateRows = async (
	data: Record<string, unknown>[],
	scripts: Parameters<typeof initState>[1],
	extra: Partial<CrudImporterStepProps> = {},
	model = fullModel(),
) => {
	const harness = renderStep(
		useImportStep3Logic,
		model,
		initState(data, scripts),
		extra,
	);
	await waitFor(
		() => expect(harness.result.current.result.records).not.toBeNull(),
		LOAD,
	);
	return harness;
};

describe("Step 3: the records it validates", () => {
	it("[ISSUE-3508-ITEM-8] reviews the calendar day of a date-only field converted with new Date (east of UTC)", async () => {
		vi.stubEnv("TZ", "Europe/Berlin");
		const validate = vi.fn(() => ({}));
		// a date cell as step 1 hands it over: local time, no offset
		const { result } = await validateRows(
			[{ n: "Alice", b: "2024-03-31T00:00:00" }],
			{
				first_name: script((r) => r.n),
				born: script((r) => new Date(r.b as string)),
			},
			{ validate },
		);
		const reviewed = (
			result.current.result.recordsNormalized[0] as Record<string, unknown>
		).born as Date;
		expect(reviewed.toISOString()).toBe("2024-03-31T12:00:00.000Z");
		// validate sees the value the import writes
		expect(validate).toHaveBeenCalledWith({
			first_name: "Alice",
			born: new Date("2024-03-31T12:00:00.000Z"),
		});
	});
});
