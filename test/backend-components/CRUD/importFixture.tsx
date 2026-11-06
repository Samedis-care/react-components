/**
 * Shared scaffolding of the import wizard tests (samedis-care-issues#3508, `src/backend-components/CRUD/Import`):
 * a model with one field per kind the importer treats differently, .xlsx files made with
 * SheetJS, a harness that runs one step hook (or renders one step) with the wizard's state,
 * a connector that applies the update-key lookup, and the real CrudImport inside a
 * disableRouting CRUD (stub grid from crudFixture).
 *
 * One Framework per test: unmount a step harness before mounting the next one.
 *
 * Not a test file itself (no `.test.` in the name), so vitest only runs it through the files
 * that import it.
 */
import React, { useState } from "react";
import { fireEvent, render, renderHook } from "@testing-library/react";
import XLSX from "xlsx";
import { createMemoryHistory } from "history";
import { Framework } from "../../../src/framework";
import { setFrameworkHistory } from "../../../src/framework/History";
import CrudImport, {
	ConversionScriptFn,
	CrudImporterState,
	CrudImporterStepProps,
} from "../../../src/backend-components/CRUD/Import";
import {
	Model,
	ModelDataTypeBooleanCheckboxRendererCC,
	ModelDataTypeDateNullableRendererCC,
	ModelDataTypeEnumMultiSelectRenderer,
	ModelDataTypeEnumSelectRenderer,
	ModelDataTypeIntegerRendererCC,
	ModelDataTypeStringRendererCC,
	ModelFieldDefinitionUnknown,
	ModelUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityGridView,
	ModelVisibilityHidden,
} from "../../../src/backend-integration";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import validatePresence from "../../../src/utils/validations/validatePresence";
import { IDataGridLoadDataParameters } from "../../../src/standalone/DataGrid/DataGrid";
import { ResponseMeta } from "../../../src/backend-integration/Connector/Connector";
import { CP, crudEl } from "./crudFixture";

export const EDIT = {
	overview: ModelVisibilityGridView,
	edit: ModelVisibilityEdit,
	create: ModelVisibilityEdit,
};

let modelCounter = 0;

/**
 * The fields every import model has: id (never importable), first_name (required through
 * validatePresence, filterable), email (filterable), count (integer, filterable), active
 * (boolean), born (date-only, nullable) and dept (enum "eng" = Engineering, "ops" =
 * Operations, filterable)
 */
export const baseFields = (): Record<string, ModelFieldDefinitionUnknown> => ({
	id: {
		type: new ModelDataTypeStringRendererCC(),
		getLabel: () => "ID",
		visibility: {
			overview: ModelVisibilityDisabled,
			edit: ModelVisibilityHidden,
			create: ModelVisibilityDisabled,
		},
		customData: null,
	},
	first_name: {
		type: new ModelDataTypeStringRendererCC(),
		getLabel: () => "First Name",
		visibility: EDIT,
		customData: null,
		filterable: true,
		validate: validatePresence,
	},
	email: {
		type: new ModelDataTypeStringRendererCC(),
		getLabel: () => "Email",
		visibility: EDIT,
		customData: null,
		filterable: true,
	},
	count: {
		type: new ModelDataTypeIntegerRendererCC(),
		getLabel: () => "Count",
		visibility: EDIT,
		customData: null,
		filterable: true,
	},
	active: {
		type: new ModelDataTypeBooleanCheckboxRendererCC(),
		getLabel: () => "Active",
		visibility: EDIT,
		customData: null,
	},
	born: {
		type: new ModelDataTypeDateNullableRendererCC(),
		getLabel: () => "Born",
		visibility: EDIT,
		customData: null,
	},
	dept: {
		type: new ModelDataTypeEnumSelectRenderer(
			[
				{ value: "eng", getLabel: () => "Engineering" },
				{ value: "ops", getLabel: () => "Operations" },
			],
			"eng",
		),
		getLabel: () => "Department",
		visibility: EDIT,
		customData: null,
		filterable: true,
	},
});

/**
 * Fields for the special cases: a multi-enum, a dotted (nested) field, a field writable on
 * edit only (disabled on create), and one disabled in both views
 */
export const extraFields = (): Record<string, ModelFieldDefinitionUnknown> => ({
	tags: {
		type: new ModelDataTypeEnumMultiSelectRenderer([
			{ value: "a", getLabel: () => "A" },
			{ value: "b", getLabel: () => "B" },
		]),
		getLabel: () => "Tags",
		visibility: EDIT,
		customData: null,
	},
	"contact.email": {
		type: new ModelDataTypeStringRendererCC(),
		getLabel: () => "Contact email",
		visibility: EDIT,
		customData: null,
		filterable: true,
	},
	code: {
		type: new ModelDataTypeStringRendererCC(),
		getLabel: () => "Code",
		visibility: {
			overview: ModelVisibilityGridView,
			edit: ModelVisibilityEdit,
			create: ModelVisibilityDisabled,
		},
		customData: null,
	},
	locked: {
		type: new ModelDataTypeStringRendererCC(),
		getLabel: () => "Locked",
		visibility: {
			overview: ModelVisibilityGridView,
			edit: ModelVisibilityDisabled,
			create: ModelVisibilityDisabled,
		},
		customData: null,
	},
});

/**
 * A model over the given fields (baseFields by default) with its own id, so two tests never
 * share react-query cache entries
 */
export const importModel = (
	connector: MockConnector = new MockConnector([]),
	fields: Record<string, ModelFieldDefinitionUnknown> = baseFields(),
): ModelUnknown =>
	new Model("u50-import-" + String(modelCounter++), fields, connector);

/**
 * A MockConnector whose index applies "equals" field filters (MockConnector ignores them)
 * and records the parameters of every index call
 */
export class KeyConnector extends MockConnector {
	indexCalls: Partial<IDataGridLoadDataParameters>[] = [];

	async index(
		params?: Partial<IDataGridLoadDataParameters>,
	): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]> {
		if (params) this.indexCalls.push(params);
		const [all] = await super.index({ rows: 10000, page: 1 });
		const filters = Object.entries(params?.fieldFilter ?? {});
		const hits = all.filter((row) =>
			filters.every(
				([key, filter]) =>
					filter.type !== "equals" || String(row[key]) === filter.value1,
			),
		);
		return [
			hits.slice(0, params?.rows ?? 25),
			{ totalRows: all.length, filteredRows: hits.length },
		];
	}
}

/**
 * A conversion script entry as step 2 leaves it after a successful check
 */
export const script = (fn: ConversionScriptFn) => ({
	scriptFn: fn,
	status: "okay" as const,
	error: null,
});

/**
 * The wizard's state with the given parsed rows and conversion scripts
 */
export const initState = (
	data: Record<string, unknown>[],
	scripts: CrudImporterState["conversionScripts"] = {},
): CrudImporterState => ({
	files: [],
	data,
	conversionScripts: scripts,
	validationPassed: false,
	importDone: false,
});

/**
 * An .xlsx File with the given sheets (in this order), each an array of rows (row 1 = header)
 */
export const xlsxFile = (
	sheets: [name: string, rows: unknown[][]][],
	name = "people.xlsx",
) => {
	const wb = XLSX.utils.book_new();
	for (const [sheetName, rows] of sheets)
		XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sheetName);
	return new File(
		[XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer],
		name,
	);
};

/**
 * An .xlsx File with one sheet "Data" made of raw SheetJS cells (for number formats)
 */
export const xlsxFromCells = (
	cells: Record<string, XLSX.CellObject>,
	range: string,
	name = "cells.xlsx",
) => {
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, { ...cells, "!ref": range }, "Data");
	return new File(
		[XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer],
		name,
	);
};

const FrameworkWrapper = (props: { children: React.ReactNode }) => (
	<Framework>{props.children}</Framework>
);

export interface StepHarness<T> {
	state: CrudImporterState;
	result: T;
}

/**
 * Runs a step hook (useImportStep1FileUploadProps, useImportStep2Logic, …) inside a
 * Framework with the wizard's state in useState, as CrudImport passes it
 * @param hook The step hook
 * @param model The model to import into
 * @param init The initial wizard state
 * @param extra Step props to set (updateKey, validate, …)
 */
export const renderStep = <T,>(
	hook: (props: CrudImporterStepProps) => T,
	model: ModelUnknown,
	init: CrudImporterState,
	extra: Partial<CrudImporterStepProps> = {},
) => {
	setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));
	return renderHook(
		(): StepHarness<T> => {
			const [state, setState] = useState(init);
			return {
				state,
				result: hook({
					model,
					updateKey: undefined,
					additionalUpdateKeyFilters: undefined,
					hasImportConfig: false,
					validate: undefined,
					state,
					setState,
					...extra,
				}),
			};
		},
		{ wrapper: FrameworkWrapper },
	);
};

/**
 * Renders a step component (or GenericDataPreview through a wrapper) inside a Framework in
 * a 500 px tall box, with the wizard's state in useState
 * @returns The render result and getState(), the latest state
 */
export const renderStepComponent = (
	Component: React.ComponentType<CrudImporterStepProps>,
	model: ModelUnknown,
	init: CrudImporterState,
	extra: Partial<CrudImporterStepProps> = {},
) => {
	setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));
	let latest = init;
	const Host = () => {
		const [state, setState] = useState(init);
		latest = state;
		return (
			<div style={{ height: 500, width: 1000 }}>
				<Component
					model={model}
					updateKey={undefined}
					additionalUpdateKeyFilters={undefined}
					hasImportConfig={false}
					validate={undefined}
					state={state}
					setState={setState}
					{...extra}
				/>
			</div>
		);
	};
	const result = render(
		<Framework>
			<Host />
		</Framework>,
	);
	return { ...result, getState: () => latest };
};

/**
 * The real importer (CrudImport, not lazy) in a disableRouting CRUD with enableUserImport,
 * the stub grid and the crud.* permissions
 * @param extra CRUD props to set, e.g. initialView "import" or "devimport", importConfig
 */
export const wizardEl = (model: ModelUnknown, extra: CP = {}) =>
	crudEl(model, {
		disableRouting: true,
		enableUserImport: true,
		importUI: CrudImport as never,
		initialView: "devimport",
		...extra,
	});

/**
 * Picks the file through the upload's hidden file input
 */
export const pickFile = (container: HTMLElement, file: File) => {
	const input = container.querySelector<HTMLInputElement>("input[type=file]");
	if (!input) throw new Error("no file input");
	fireEvent.change(input, { target: { files: [file] } });
};

/**
 * The labels of the stepper's steps, and the active one
 */
export const stepLabels = (container: HTMLElement) =>
	Array.from(container.querySelectorAll(".MuiStepLabel-label")).map(
		(el) => el.textContent,
	);
export const activeStepLabel = (container: HTMLElement) =>
	container.querySelector(".MuiStepLabel-label.Mui-active")?.textContent;

/**
 * Two people, header row "n", "mail"
 */
export const PEOPLE = [
	["n", "mail"],
	["Alice", "alice@example.com"],
	["Bob", "bob@example.com"],
];
