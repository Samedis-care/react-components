import React, {
	lazy,
	Suspense,
	useCallback,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import { Framework } from "../../framework";
import createTestModel, {
	sampleData,
} from "../../stories/test-utils/TestModel";
import MockConnector from "../../stories/test-utils/MockConnector";
import type { BaseSelectorData, MultiSelectorData } from "../../standalone";
import type { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import type { ErrorComponentProps } from "../Form";
import { Model } from "../../backend-integration";
import type {
	ModelGetResponse,
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration";
import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import type { ResponseMeta } from "../../backend-integration/Connector/Connector";
import type BackendDataGridMultiSelectType from "./BackendDataGridMultiSelect";
import type CrudMultiSelectWithGroupsType from "./CrudMultiSelectWithGroups";

// Lazy-import to avoid circular dependency at module evaluation time
const BackendSingleSelect = lazy(() => import("./BackendSingleSelect"));
const BackendMultiSelect = lazy(() => import("./BackendMultiSelect"));
const CrudMultiSelect = lazy(() => import("./CrudMultiSelect"));
const CrudMultiSelectWithGroups = lazy(
	() => import("./CrudMultiSelectWithGroups"),
) as unknown as typeof CrudMultiSelectWithGroupsType;
const BackendDataGridMultiSelect = lazy(
	() => import("./BackendDataGridMultiSelect"),
) as unknown as typeof BackendDataGridMultiSelectType;

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<Suspense fallback={<div>Loading…</div>}>
			<div style={{ padding: 24, maxWidth: 400 }}>
				<Story />
			</div>
		</Suspense>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/Selector",
	decorators: [FrameworkDecorator],
};

export default meta;

const modelToSelectorData = (
	data: Record<string, unknown>,
): BaseSelectorData => ({
	value: data.id as string,
	label: `${data.first_name as string} ${data.last_name as string}`,
});

const modelToMultiSelectorData = (
	data: Record<string, unknown>,
): MultiSelectorData => ({
	value: data.id as string,
	label: `${data.first_name as string} ${data.last_name as string}`,
});

const SingleSelectStory = () => {
	const model = useMemo(createTestModel, []);
	const [selected, setSelected] = useState<string | null>(null);
	const handleSelect = useCallback((value: string | null) => {
		setSelected(value);
	}, []);
	return (
		<BackendSingleSelect
			model={model}
			modelToSelectorData={modelToSelectorData}
			selected={selected}
			onSelect={handleSelect}
			label="Select a person"
		/>
	);
};

export const SingleSelect: StoryObj = {
	render: () => <SingleSelectStory />,
};

const MultiSelectStory = () => {
	const model = useMemo(createTestModel, []);
	const [selected, setSelected] = useState<string[]>([]);
	const handleSelect = useCallback((values: string[]) => {
		setSelected(values);
	}, []);
	return (
		<BackendMultiSelect
			model={model}
			modelToSelectorData={modelToMultiSelectorData}
			selected={selected}
			onSelect={handleSelect}
			label="Select people"
		/>
	);
};

export const MultiSelect: StoryObj = {
	render: () => <MultiSelectStory />,
};

// ---------------------------------------------------------------------------
// CrudMultiSelect with prepareNewEntry: collect join-record metadata on add
// ---------------------------------------------------------------------------

/** Shape of the data flowing through the CRUD selector (join record + person). */
interface AssignmentData extends MultiSelectorData {
	/** id of the searched (person) model record */
	person_id?: string;
	/** join-record metadata collected via prepareNewEntry */
	assigned_from?: string;
	note?: string;
}

const ErrorComponent = (props: ErrorComponentProps) => (
	<div style={{ color: "red" }}>Error: {props.error.message}</div>
);

/** Result of the metadata dialog, or null if the user cancelled. */
interface AssignmentMeta {
	assigned_from: string;
	note: string;
}

const CrudMultiSelectStory = () => {
	// model used to search people
	const model = useMemo(createTestModel, []);
	// connector backing the M:N join collection (assignments)
	const connector = useMemo(
		() =>
			new MockConnector([
				{
					id: "j1",
					person_id: "1",
					label: "Alice Mueller",
					assigned_from: "2026-01-01",
					note: "founding member",
				},
			]),
		[],
	);

	// --- metadata dialog wiring -------------------------------------------
	const [dialog, setDialog] = useState<{ label: string } | null>(null);
	const [assignedFrom, setAssignedFrom] = useState("2026-06-19");
	const [note, setNote] = useState("");
	const resolverRef = useRef<((value: AssignmentMeta | null) => void) | null>(
		null,
	);

	const closeDialog = useCallback((result: AssignmentMeta | null) => {
		const resolve = resolverRef.current;
		resolverRef.current = null;
		setDialog(null);
		if (resolve) resolve(result);
	}, []);

	const handleConfirm = useCallback(() => {
		closeDialog({ assigned_from: assignedFrom, note });
	}, [assignedFrom, note, closeDialog]);

	const handleCancel = useCallback(() => closeDialog(null), [closeDialog]);

	// Collect join-record metadata for each newly added person. Resolving null
	// cancels the addition cleanly (no error, person not added).
	const prepareNewEntry = useCallback(
		(entry: AssignmentData): Promise<AssignmentData | null> => {
			setNote("");
			setAssignedFrom("2026-06-19");
			setDialog({ label: (entry.label as string) ?? "entry" });
			return new Promise<AssignmentMeta | null>((resolve) => {
				resolverRef.current = resolve;
			}).then((meta) =>
				meta
					? { ...entry, assigned_from: meta.assigned_from, note: meta.note }
					: null,
			);
		},
		[],
	);

	const serialize = useCallback(
		(data: AssignmentData): Record<string, unknown> => ({
			id: data.value,
			person_id: data.person_id,
			label: data.label,
			assigned_from: data.assigned_from,
			note: data.note,
		}),
		[],
	);

	const deserialize = useCallback(
		(record: Record<string, unknown>): AssignmentData => ({
			value: record.id as string,
			label: record.label as string,
			person_id: record.person_id as string,
			assigned_from: record.assigned_from as string,
			note: record.note as string,
		}),
		[],
	);

	const deserializeModel = useCallback(
		(record: Record<string, unknown>): Omit<AssignmentData, "value"> => ({
			label: `${record.first_name as string} ${record.last_name as string}`,
			person_id: record.id as string,
		}),
		[],
	);

	const getIdOfData = useCallback(
		(data: AssignmentData): string => data.person_id ?? data.value,
		[],
	);

	const [selected, setSelected] = useState<AssignmentData[]>([]);

	return (
		<>
			<CrudMultiSelect
				model={model}
				connector={connector}
				errorComponent={ErrorComponent}
				serialize={serialize}
				deserialize={deserialize}
				deserializeModel={deserializeModel}
				prepareNewEntry={prepareNewEntry}
				getIdOfData={getIdOfData}
				onChange={setSelected}
				label="Assign people"
			/>
			<ul>
				{selected.map((entry) => (
					<li key={entry.value}>
						{entry.label as string} — from {entry.assigned_from ?? "?"}
						{entry.note ? ` (${entry.note})` : ""}
					</li>
				))}
			</ul>
			<Dialog open={!!dialog} onClose={handleCancel}>
				<DialogTitle>Assign {dialog?.label}</DialogTitle>
				<DialogContent
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 16,
						paddingTop: 8,
					}}
				>
					<TextField
						label="Assigned from"
						type="date"
						value={assignedFrom}
						onChange={(ev) => setAssignedFrom(ev.target.value)}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
					<TextField
						label="Note"
						value={note}
						onChange={(ev) => setNote(ev.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancel}>Cancel</Button>
					<Button onClick={handleConfirm} variant="contained">
						Add
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

/**
 * CrudMultiSelect managing an M:N join collection. When a person is added,
 * `prepareNewEntry` opens a dialog to collect the join-record metadata
 * (assigned-from date and a note). Cancelling the dialog resolves `null`,
 * which aborts the addition cleanly — no error is shown and nothing is added.
 */
export const CrudMultiSelectPrepareNewEntry: StoryObj = {
	render: () => <CrudMultiSelectStory />,
};

// ---------------------------------------------------------------------------
// Truncated result set: the backend reports more matches than it returned
// ---------------------------------------------------------------------------

const TRUNCATED_LIMIT = 3;

const SingleSelectTruncatedStory = () => {
	const model = useMemo(createTestModel, []);
	const [selected, setSelected] = useState<string | null>(null);
	const handleSelect = useCallback((value: string | null) => {
		setSelected(value);
	}, []);
	return (
		<BackendSingleSelect
			model={model}
			modelToSelectorData={modelToSelectorData}
			selected={selected}
			onSelect={handleSelect}
			searchResultLimit={TRUNCATED_LIMIT}
			label="Select a person"
		/>
	);
};

export const SingleSelectTruncated: StoryObj = {
	name: "BackendSingleSelect — truncated result set",
	render: () => <SingleSelectTruncatedStory />,
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// the limited page of records is rendered...
		await expect(await body.findByText("Alice Mueller")).toBeVisible();
		const texts = body
			.getAllByRole("option")
			.map((option) => option.textContent ?? "");
		// ...plus one trailing entry naming how many records actually match
		await expect(texts).toHaveLength(TRUNCATED_LIMIT + 1);
		const notice = texts[texts.length - 1];
		await expect(notice).toContain(String(TRUNCATED_LIMIT));
		await expect(notice).toContain("8");
	},
};

// ---------------------------------------------------------------------------
// additionalOptions must not depend on the data source being queried
// ---------------------------------------------------------------------------

const ADDITIONAL_OPTIONS: BaseSelectorData[] = [
	{ value: "unassigned", label: "Unassigned" },
];

const SingleSelectForceQueryStory = () => {
	const model = useMemo(createTestModel, []);
	const [selected, setSelected] = useState<string | null>(null);
	const handleSelect = useCallback((value: string | null) => {
		setSelected(value);
	}, []);
	return (
		<BackendSingleSelect
			model={model}
			modelToSelectorData={modelToSelectorData}
			selected={selected}
			onSelect={handleSelect}
			forceQuery
			additionalOptions={ADDITIONAL_OPTIONS}
			label="Select a person"
		/>
	);
};

export const SingleSelectForceQueryAdditionalOptions: StoryObj = {
	name: "BackendSingleSelect — additionalOptions survive forceQuery",
	render: () => <SingleSelectForceQueryStory />,
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// the additional option needs no request, so it is offered right away
		await expect(await body.findByText("Unassigned")).toBeVisible();
		// while forceQuery keeps the backend records out until something is typed
		await expect(body.queryByText("Alice Mueller")).toBeNull();
	},
};

// ---------------------------------------------------------------------------
// BackendDataGridMultiSelect: a grid with a checkbox per row
// ---------------------------------------------------------------------------

let storyModelCounter = 0;

/**
 * MockConnector that also honours the `id` inSet/notInSet field filter, which
 * BackendDataGridMultiSelect needs (MockConnector ignores field filters). It reports only
 * totalRows, as the filtered count.
 */
class IdFilterConnector extends MockConnector {
	async index(params?: Partial<IDataGridLoadDataParameters>) {
		const ids = params?.fieldFilter?.id;
		if (!ids) return super.index(params);
		const [all] = await super.index({
			...params,
			fieldFilter: {},
			page: 1,
			rows: 1000,
		});
		const set = ids.value1 ? ids.value1.split(",") : [];
		const list = all.filter((row) =>
			ids.type === "inSet"
				? set.includes(row.id as string)
				: !set.includes(row.id as string),
		);
		const page = params?.page ?? 1;
		const size = params?.rows ?? 25;
		return [
			list.slice((page - 1) * size, page * size),
			{ totalRows: list.length },
		] as [Record<string, unknown>[], { totalRows: number }];
	}
}

const createGridModel = () =>
	new Model(
		"u52-story-grid-" + String(++storyModelCounter),
		createTestModel().fields,
		new IdFilterConnector(sampleData),
	) as unknown as ModelUnknown;

/**
 * axe for the grid stories: every violation fails the story, except the DataGrid's own
 * that are filed already
 */
const GRID_A11Y = {
	test: "error",
	config: {
		rules: [
			// the search field and the row checkboxes have no name (ISSUE-3492-ITEM-25, ISSUE-3493-ITEM-13)
			{ id: "label", enabled: false },
			// the indeterminate "All" checkbox (ISSUE-3482-ITEM-2)
			{ id: "aria-conditional-attr", enabled: false },
		],
	},
};

const rowCheckboxes = (canvasElement: HTMLElement) =>
	Array.from(
		canvasElement.querySelectorAll<HTMLInputElement>(
			"[class*=CcDataGrid-selectCheckbox] input",
		),
	);

const LabelledDataGridMultiSelectStory = () => {
	const model = useMemo(createGridModel, []);
	const [selected, setSelected] = useState<string[]>(["2", "5"]);
	return (
		<div style={{ height: 400 }} data-testid={"field-box"}>
			<BackendDataGridMultiSelect
				model={model}
				label={"Recipients"}
				selected={selected}
				onChange={setSelected}
			/>
		</div>
	);
};

/**
 * ISSUE-3510-ITEM-16: the label names the field (a group around the grid), the number of
 * selected rows is a status inside it that follows a tick, and the grid still fits into
 * the field's height below them
 */
export const Issue3510Item16LabelledFieldCountsSelection: StoryObj = {
	parameters: { a11y: GRID_A11Y },
	render: () => <LabelledDataGridMultiSelectStory />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const group = await canvas.findByRole(
			"group",
			{ name: "Recipients" },
			{ timeout: 3000 },
		);
		await waitFor(
			() => expect(rowCheckboxes(canvasElement).length).toBeGreaterThan(2),
			{ timeout: 5000 },
		);
		const status = within(group).getByRole("status");
		await expect(status).toHaveTextContent("Selected: 2");
		await expect(group).toHaveAccessibleDescription("Selected: 2");
		// the selected Bob and Eve lead, Alice is the first unselected row
		await userEvent.click(rowCheckboxes(canvasElement)[2]);
		await waitFor(() => expect(status).toHaveTextContent("Selected: 3"));
		const box = canvas.getByTestId("field-box").getBoundingClientRect();
		const footerElement = canvasElement.querySelector(
			"[class*=CcDataGrid-footer]",
		);
		if (!footerElement) throw new Error("no DataGrid footer rendered");
		const footer = footerElement.getBoundingClientRect();
		await expect(footer.bottom).toBeLessThanOrEqual(box.bottom);
	},
};

const SelectAllDataGridMultiSelectStory = () => {
	const model = useMemo(createGridModel, []);
	const [selected, setSelected] = useState<string[]>(["2"]);
	return (
		<div style={{ height: 600 }}>
			<BackendDataGridMultiSelect
				model={model}
				label={"Recipients"}
				selected={selected}
				onChange={setSelected}
				enableSelectAll
			/>
		</div>
	);
};

/**
 * ISSUE-3510-ITEM-12: "All" ticks every record (the 8 people), and the field's value
 * holds all their ids; unticking it clears the selection
 */
export const Issue3510Item12SelectAllSelectsEveryRecord: StoryObj = {
	parameters: { a11y: GRID_A11Y },
	render: () => <SelectAllDataGridMultiSelectStory />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const group = await canvas.findByRole(
			"group",
			{ name: "Recipients" },
			{ timeout: 3000 },
		);
		await waitFor(
			() => expect(rowCheckboxes(canvasElement).length).toBeGreaterThan(2),
			{ timeout: 5000 },
		);
		const status = within(group).getByRole("status");
		await expect(status).toHaveTextContent("Selected: 1");
		// the one in the selection column's header; the footer has one too
		const [all] = canvas.getAllByRole("checkbox", { name: "All" });
		await userEvent.click(all);
		await waitFor(() => expect(status).toHaveTextContent("Selected: 8"));
		await waitFor(() => expect(all).toBeChecked());
		for (const box of rowCheckboxes(canvasElement)) {
			await expect(box).toBeChecked();
		}
		await userEvent.click(all);
		await waitFor(() => expect(status).toHaveTextContent("Selected: 0"));
		for (const box of rowCheckboxes(canvasElement)) {
			await expect(box).not.toBeChecked();
		}
	},
};

// ---------------------------------------------------------------------------
// BackendSingleSelect with switchFilterName: a switch that filters the options
// ---------------------------------------------------------------------------

/** sampleData with Grace and Henry inactive */
const SWITCH_FILTER_DATA = sampleData.map((record) => ({
	...record,
	inactive: record.first_name === "Grace" || record.first_name === "Henry",
}));

/**
 * MockConnector that lists the inactive records only while the search sends the
 * additional filter `include_inactive: true`. It reports only totalRows, as the
 * filtered count.
 */
class InactiveFilterConnector extends MockConnector {
	async index(params?: Partial<IDataGridLoadDataParameters>) {
		const [all] = await super.index({ ...params, page: 1, rows: 1000 });
		const list =
			params?.additionalFilters?.include_inactive === true
				? all
				: all.filter((row) => !row.inactive);
		const page = params?.page ?? 1;
		const size = params?.rows ?? 25;
		return [
			list.slice((page - 1) * size, page * size),
			{ totalRows: list.length },
		] as [Record<string, unknown>[], { totalRows: number }];
	}
}

const createSwitchFilterModel = () =>
	new Model(
		"u52-story-switch-" + String(++storyModelCounter),
		createTestModel().fields,
		new InactiveFilterConnector(SWITCH_FILTER_DATA),
	) as unknown as ModelUnknown;

const SingleSelectSwitchFilterStory = () => {
	const model = useMemo(createSwitchFilterModel, []);
	const [selected, setSelected] = useState<string | null>(null);
	return (
		<BackendSingleSelect
			model={model}
			modelToSelectorData={modelToSelectorData}
			selected={selected}
			onSelect={setSelected}
			switchFilterName={"include_inactive"}
			switchLabel={"Show inactive"}
			label={"Select a person"}
		/>
	);
};

/**
 * ISSUE-3465-ITEM-7: with switchFilterName the field shows a switch, and turning it on
 * reloads the options with that filter set, here adding the inactive Grace and Henry
 */
export const Issue3465Item7SingleSelectSwitchFilter: StoryObj = {
	parameters: { a11y: { test: "error" } },
	render: () => <SingleSelectSwitchFilterStory />,
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		await expect(await body.findByText("Alice Mueller")).toBeVisible();
		await expect(body.queryByText("Henry Taylor")).toBeNull();
		const toggle = canvas.getByRole("switch", { name: "Show inactive" });
		await expect(toggle).not.toBeChecked();
		// a click on the label toggles the switch, and closes the list
		await userEvent.click(canvas.getByText("Show inactive"));
		await expect(toggle).toBeChecked();
		await userEvent.click(input);
		await expect(await body.findByText("Henry Taylor")).toBeVisible();
		await expect(body.getByText("Grace Lee")).toBeVisible();
	},
};

// ---------------------------------------------------------------------------
// CrudMultiSelectWithGroups on a LazyConnector: changes wait for the save
// ---------------------------------------------------------------------------

/** A team member as the selector holds it: value is the join row's id */
interface MemberData extends MultiSelectorData {
	/** id of the person (a TestModel record) */
	person_id: string;
}

/** The departments of TestModel's people, the groups whose pick adds all their people */
const createDepartmentModel = () =>
	new Model(
		"u52-story-departments-" + String(++storyModelCounter),
		createTestModel().fields,
		new MockConnector(
			Array.from(
				new Set(sampleData.map((person) => person.department as string)),
				(department) => ({ id: department, department }),
			),
		),
	) as unknown as ModelUnknown;

/** The team's join rows, in memory; reports every request that reaches them to the log */
class MemberConnector extends ApiConnector {
	private counter = 100;

	constructor(
		private rows: Record<string, unknown>[],
		private log: (request: string) => void,
	) {
		super();
	}

	setApiEndpoint(): void {}

	index(): Promise<[Record<string, unknown>[], ResponseMeta]> {
		this.log("GET members");
		return Promise.resolve([
			this.rows.map((row) => ({ ...row })),
			{ totalRows: this.rows.length, filteredRows: this.rows.length },
		]);
	}

	create(
		data: Record<string, unknown>,
	): Promise<ModelGetResponse<ModelUnknown>> {
		this.log(`POST members (person ${data.person_id as string})`);
		const record = { ...data, id: String(this.counter++) };
		this.rows.push(record);
		return Promise.resolve([record, {}]);
	}

	read(id: string): Promise<ModelGetResponse<ModelUnknown>> {
		return Promise.resolve([{ id }, {}]);
	}

	update(
		data: Record<string, unknown>,
	): Promise<ModelGetResponse<ModelUnknown>> {
		this.log(`PUT members/${data.id as string}`);
		return Promise.resolve([data, {}]);
	}

	delete(id: string): Promise<void> {
		this.log(`DELETE members/${id}`);
		this.rows = this.rows.filter((row) => row.id !== id);
		return Promise.resolve();
	}
}

// a new entry's value is "to-create-…": leave it out, the backend assigns the id
const serializeMember = (data: MemberData) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	person_id: data.person_id,
	label: data.label,
});
const deserializeMember = (record: Record<string, unknown>): MemberData => ({
	value: record.id as string,
	label: record.label as string,
	person_id: record.person_id as string,
});
const deserializeMemberModel = (record: ModelRecord<ModelUnknown>) => ({
	label: `${record.first_name as string} ${record.last_name as string}`,
	person_id: record.id as string,
});
const getIdOfMember = (data: MemberData) => data.person_id;
const convDepartment = (
	record: ModelRecord<ModelUnknown>,
): BaseSelectorData => ({
	value: record.id as string,
	label: record.department as string,
});
const getDepartmentMembers = ([
	department,
]: ModelGetResponse<ModelUnknown>): MemberData[] =>
	sampleData
		.filter((person) => person.department === department.department)
		.map((person) => ({
			value: "to-create-" + (person.id as string),
			label: `${person.first_name as string} ${person.last_name as string}`,
			person_id: person.id as string,
		}));

/**
 * A team edited through a LazyConnector, as a form does it: picks and removals are queued
 * until Save sends them. The request log shows what reaches the backend.
 */
const QueuedTeamStory = () => {
	const personModel = useMemo(createTestModel, []);
	const departmentModel = useMemo(createDepartmentModel, []);
	const [log, setLog] = useState<string[]>([]);
	const [saves, setSaves] = useState(0);
	const connector = useMemo(
		() =>
			new LazyConnector(
				new MemberConnector(
					[
						{ id: "1", person_id: "3", label: "Carol Jones" },
						{ id: "2", person_id: "4", label: "Dave Brown" },
					],
					(request) => setLog((prev) => [...prev, request]),
				),
				false,
			),
		[],
	);
	const handleSave = useCallback(() => {
		void connector.workQueue().then(() => setSaves((prev) => prev + 1));
	}, [connector]);
	return (
		<>
			{/* the entries float: keep Save below them */}
			<div style={{ display: "flow-root" }}>
				<CrudMultiSelectWithGroups<
					ModelUnknown,
					ModelUnknown,
					BaseSelectorData,
					MemberData
				>
					title={"Team"}
					searchInputLabel={"Add a person"}
					groupInputLabel={"Add a department"}
					groupModel={departmentModel}
					dataModel={personModel}
					connector={connector}
					errorComponent={ErrorComponent}
					convGroup={convDepartment}
					getGroupDataEntries={getDepartmentMembers}
					serialize={serializeMember}
					deserialize={deserializeMember}
					deserializeModel={deserializeMemberModel}
					getIdOfData={getIdOfMember}
					groupSearchDebounceTime={0}
					dataSearchDebounceTime={0}
					showDirtyState
				/>
			</div>
			<Button type={"button"} variant={"contained"} onClick={handleSave}>
				Save
			</Button>
			<p>
				Saved: <span data-testid={"saves"}>{saves}</span> times
			</p>
			<p>Requests sent:</p>
			<ol data-testid={"requests"}>
				{log.map((request, index) => (
					<li key={index}>{request}</li>
				))}
			</ol>
		</>
	);
};

/** each entry's text with its mark ("Grace LeeAdded"), in the order shown */
const teamEntries = (canvasElement: HTMLElement) =>
	within(canvasElement)
		.queryAllByRole("button", { name: /^(Remove|Restore) / })
		.map((button) => button.parentElement?.textContent);

/**
 * ISSUE-3505-ITEM-23: on a LazyConnector a pick is marked "Added", a removed entry stays
 * listed, struck through and marked "Removed", with a restore button instead of its remove
 * button, and with showDirtyState the title has the dirty marker. Nothing is sent before
 * Save. The story ends with the marks shown, so axe checks them.
 */
export const Issue3505Item23QueuedChangesAreMarked: StoryObj = {
	parameters: { a11y: { test: "error" } },
	render: () => <QueuedTeamStory />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await canvas.findByRole(
			"button",
			{ name: "Remove Carol Jones" },
			{ timeout: 5000 },
		);
		await expect(canvas.getByText("Team").querySelector("span")).toBeNull();

		await userEvent.click(
			canvas.getByRole("button", { name: "Remove Carol Jones" }),
		);
		await userEvent.click(canvas.getAllByRole("combobox")[1]);
		await userEvent.click(
			await within(document.body).findByRole(
				"option",
				{ name: "Grace Lee" },
				{ timeout: 5000 },
			),
		);
		await canvas.findByText("Added");

		await expect(teamEntries(canvasElement)).toEqual([
			"Dave Brown",
			"Grace LeeAdded",
			"Carol JonesRemoved",
		]);
		await expect(
			getComputedStyle(canvas.getByText("Carol Jones")).textDecorationLine,
		).toBe("line-through");
		await expect(
			getComputedStyle(canvas.getByText("Grace Lee")).textDecorationLine,
		).toBe("none");
		await expect(canvas.getByText("Team").querySelector("span")).not.toBeNull();
		await expect(
			canvas.getByRole("button", { name: "Restore Carol Jones" }),
		).toBeVisible();
		await expect(
			canvas.queryByRole("button", { name: "Remove Carol Jones" }),
		).toBeNull();
		await expect(
			Array.from(
				canvas.getByTestId("requests").querySelectorAll("li"),
				(item) => item.textContent,
			),
		).toEqual(["GET members"]);
	},
};

/**
 * ISSUE-3505-ITEM-23: a restored entry is selected again, without its marks, and Save sends
 * nothing for it
 */
export const Issue3505Item23RestoreSendsNothing: StoryObj = {
	parameters: { a11y: { test: "error" } },
	render: () => <QueuedTeamStory />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(
			await canvas.findByRole(
				"button",
				{ name: "Remove Carol Jones" },
				{ timeout: 5000 },
			),
		);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Restore Carol Jones" }),
		);
		await canvas.findByRole("button", { name: "Remove Carol Jones" });
		await expect(canvas.queryByText("Removed")).toBeNull();
		await expect(canvas.getByText("Team").querySelector("span")).toBeNull();

		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await waitFor(() =>
			expect(canvas.getByTestId("saves")).toHaveTextContent("1"),
		);
		await expect(
			Array.from(
				canvas.getByTestId("requests").querySelectorAll("li"),
				(item) => item.textContent,
			),
		).toEqual(["GET members"]);
		await expect(teamEntries(canvasElement)).toEqual([
			"Dave Brown",
			"Carol Jones",
		]);
	},
};
