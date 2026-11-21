/**
 * Step 3 of the import wizard ("Validation & Review", useImportStep3Logic and
 * Step3ValidateReview), the only gate before records are written: which record is built per
 * row, what is validated, how errors are reported and when the step lets the import start.
 * Also GenericDataPreview, the grid of the review and of step 1's preview.
 */
import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { useImportStep3Logic } from "../../../src/backend-components/CRUD/Import/Step3ValidateReview";
import GenericDataPreview, {
	GenericDataPreviewProps,
} from "../../../src/backend-components/CRUD/Import/GenericDataPreview";
import type { CrudImporterStepProps } from "../../../src/backend-components/CRUD/Import";
import { ModelDataTypeEnumSelectRenderer } from "../../../src/backend-integration";
import { Framework } from "../../../src/framework";
import { setFrameworkHistory } from "../../../src/framework/History";
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

	it("[ISSUE-3508-ITEM-1] validates the record the import writes: falsy results are kept and checked", async () => {
		const { result } = await validateRows([{ a: "" }], {
			first_name: script((r) => r.a || null),
			active: script(() => false),
			count: script(() => 0),
		});
		const [record, validation] = result.current.result.records![0];
		expect(record).toEqual({ first_name: null, active: false, count: 0 });
		expect(validation).toEqual({
			first_name: expect.stringMatching(/First Name/) as string,
		});
		expect(result.current.result.everythingOkay).toBe(false);
	});

	it("[ISSUE-3508-ITEM-1] runs each conversion once per row", async () => {
		const convert = vi.fn((r: Record<string, unknown>) => r.n);
		await validateRows([{ n: "Alice" }], { first_name: script(convert) });
		expect(convert).toHaveBeenCalledTimes(1);
	});
});

describe("GenericDataPreview", () => {
	it("[ISSUE-3508-ITEM-20] shows the rows of new data", async () => {
		setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));
		const Swap = () => {
			const [data, setData] = useState([{ a: "A-one" }]);
			return (
				<div style={{ height: 500, width: 1000 }}>
					<button type={"button"} onClick={() => setData([{ a: "B-one" }])}>
						Swap
					</button>
					<GenericDataPreview data={data} />
				</div>
			);
		};
		render(
			<Framework>
				<Swap />
			</Framework>,
		);
		expect(await screen.findByText("A-one", undefined, LOAD)).toBeVisible();
		fireEvent.click(screen.getByRole("button", { name: "Swap" }));
		expect(
			await screen.findByText("B-one", undefined, { timeout: 3000 }),
		).toBeVisible();
	});

	it("[ISSUE-3508-ITEM-20] renders the rows with a new model", async () => {
		setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));
		// the same rows: only the model changes, as after a language change
		const rows = [{ dept: "eng" }];
		const deptModel = (label: string) => {
			const fields = baseFields();
			fields.dept = {
				...fields.dept,
				type: new ModelDataTypeEnumSelectRenderer(
					[{ value: "eng", getLabel: () => label }],
					"eng",
				),
			};
			return importModel(new MockConnector([]), fields);
		};
		const Swap = () => {
			const [model, setModel] = useState(() => deptModel("Engineering"));
			return (
				<div style={{ height: 500, width: 1000 }}>
					<button
						type={"button"}
						onClick={() => setModel(deptModel("Technik"))}
					>
						Swap
					</button>
					<GenericDataPreview data={rows} model={model} />
				</div>
			);
		};
		render(
			<Framework>
				<Swap />
			</Framework>,
		);
		expect(
			await screen.findByText("Engineering", undefined, LOAD),
		).toBeVisible();
		fireEvent.click(screen.getByRole("button", { name: "Swap" }));
		expect(
			await screen.findByText("Technik", undefined, { timeout: 3000 }),
		).toBeVisible();
		expect(screen.queryByText("Engineering")).toBeNull();
	});

	it("[ISSUE-3508-ITEM-20] keeps its filter on new data", async () => {
		setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));
		// the review's filter on the rows with errors, rebuilt in another language
		const filter: GenericDataPreviewProps["defaultFilter"] = [
			{ field: "e", filter: { type: "notEqual", value1: "-", value2: "" } },
		];
		const Swap = () => {
			const [data, setData] = useState([
				{ n: "Alice", e: "-" },
				{ n: "Bob", e: "Name: ungültig" },
			]);
			return (
				<div style={{ height: 500, width: 1000 }}>
					<button
						type={"button"}
						onClick={() =>
							setData([
								{ n: "Alice", e: "-" },
								{ n: "Bob", e: "Name: invalid" },
							])
						}
					>
						Swap
					</button>
					<GenericDataPreview data={data} defaultFilter={filter} />
				</div>
			);
		};
		render(
			<Framework>
				<Swap />
			</Framework>,
		);
		expect(
			await screen.findByText("Name: ungültig", undefined, LOAD),
		).toBeVisible();
		fireEvent.click(screen.getByRole("button", { name: "Swap" }));
		expect(
			await screen.findByText("Name: invalid", undefined, { timeout: 3000 }),
		).toBeVisible();
		expect(screen.queryByText("Alice")).toBeNull();
		expect(screen.getByText(/Filtered: 1/)).toBeInTheDocument();
	});
});
