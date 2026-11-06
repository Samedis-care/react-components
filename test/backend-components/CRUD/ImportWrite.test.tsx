/**
 * Step 4 of the import wizard ("Import data", useImportStep4Logic and Step4Import): which
 * fields of a row are written, when a row creates or updates a record (update key), how many
 * requests run at once, the counters and the last error, and when Finish may be pressed.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { useImportStep4Logic } from "../../../src/backend-components/CRUD/Import/Step4Import";
import type { CrudImporterState } from "../../../src/backend-components/CRUD/Import";
import {
	ModelDataTypeDateTimeNullableRendererCC,
	ModelDataTypeDateTimeRendererCC,
	ModelFieldDefinitionUnknown,
} from "../../../src/backend-integration";
import type FilterType from "../../../src/backend-integration/Model/FilterType";
import { toDateOnly } from "../../../src/utils/dateOnlyUtils";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { LOAD, setupCrudTests } from "./crudFixture";
import {
	baseFields,
	EDIT,
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

/** Runs step 4 over the rows and waits until the import is done */
const importRows = async (
	connector: MockConnector,
	data: Record<string, unknown>[],
	scripts: CrudImporterState["conversionScripts"],
	extra: Parameters<typeof renderStep>[3] = {},
	fields = { ...baseFields(), ...extraFields() },
) => {
	const harness = renderStep(
		useImportStep4Logic,
		importModel(connector, fields),
		initState(data, scripts),
		extra,
	);
	await waitFor(
		() => expect(harness.result.current.state.importDone).toBe(true),
		LOAD,
	);
	return harness;
};

describe("Step 4: what a row writes", () => {
	it("[ISSUE-3508-ITEM-8] keeps the calendar day of a date-only field converted with new Date (east of UTC)", async () => {
		vi.stubEnv("TZ", "Europe/Berlin");
		const connector = new MockConnector([]);
		const create = vi.spyOn(connector, "create");
		// a date cell as step 1 hands it over: local time, no offset
		await importRows(connector, [{ n: "Alice", b: "2024-03-31T00:00:00" }], {
			first_name: script((r) => r.n),
			born: script((r) => new Date(r.b as string)),
		});
		const born = create.mock.calls[0][0].born as string;
		expect(born.slice(0, 10)).toBe("2024-03-31");
	});

	it.each([
		// a date cell (step 1: local time without an offset) through new Date
		["Pacific/Kiritimati", "new Date(cell)", (r) => new Date(r.b as string)],
		["Asia/Tokyo", "new Date(cell)", (r) => new Date(r.b as string)],
		["America/New_York", "new Date(cell)", (r) => new Date(r.b as string)],
		["Pacific/Pago_Pago", "new Date(cell)", (r) => new Date(r.b as string)],
		// the library's date-only helper, also where local midnight is 12:00 UTC
		["Pacific/Fiji", "toDateOnly(cell)", (r) => toDateOnly(r.b as string)],
		["Europe/Berlin", "toDateOnly(cell)", (r) => toDateOnly(r.b as string)],
		// a date without a time is parsed as UTC midnight
		[
			"America/New_York",
			'new Date("2024-03-31")',
			() => new Date("2024-03-31"),
		],
		[
			"Pacific/Fiji",
			"new Date(cell.slice(0, 10))",
			(r) => new Date((r.b as string).slice(0, 10)),
		],
		["Europe/Berlin", "Date.UTC", () => new Date(Date.UTC(2024, 2, 31))],
	] as [string, string, (r: Record<string, unknown>) => unknown][])(
		"[ISSUE-3508-ITEM-8] writes a date-only field as the day the Date names (%s, %s)",
		async (tz, _conversion, convert) => {
			vi.stubEnv("TZ", tz);
			const connector = new MockConnector([]);
			const create = vi.spyOn(connector, "create");
			await importRows(connector, [{ n: "Alice", b: "2024-03-31T00:00:00" }], {
				first_name: script((r) => r.n),
				born: script(convert),
			});
			// the date-only value the date pickers write: 12:00 UTC of the day
			expect(create.mock.calls[0][0].born).toBe("2024-03-31T12:00:00.000Z");
		},
	);

	it("[ISSUE-3508-ITEM-8] keeps the time of a date-time field, also of one filtered by day", async () => {
		vi.stubEnv("TZ", "Europe/Berlin");
		class DateTimeFilteredByDay extends ModelDataTypeDateTimeNullableRendererCC {
			getFilterType(): FilterType {
				return "date";
			}
		}
		const field = (
			type: ModelFieldDefinitionUnknown["type"],
		): ModelFieldDefinitionUnknown => ({
			type,
			getLabel: () => "At",
			visibility: EDIT,
			customData: null,
		});
		const connector = new MockConnector([]);
		const create = vi.spyOn(connector, "create");
		await importRows(
			connector,
			[{ n: "Alice", t: "2024-03-31T08:30:00" }],
			{
				first_name: script((r) => r.n),
				at: script((r) => new Date(r.t as string)),
				day_at: script((r) => new Date(r.t as string)),
			},
			{},
			{
				...baseFields(),
				at: field(new ModelDataTypeDateTimeRendererCC()),
				day_at: field(new DateTimeFilteredByDay()),
			},
		);
		// 08:30 in Berlin (CEST since 02:00 that day)
		expect(create.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				at: "2024-03-31T06:30:00.000Z",
				day_at: "2024-03-31T06:30:00.000Z",
			}),
		);
	});
});
