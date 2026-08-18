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
import { expect, within } from "storybook/test";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import { Framework } from "../../framework";
import createTestModel from "../../stories/test-utils/TestModel";
import MockConnector from "../../stories/test-utils/MockConnector";
import type { BaseSelectorData, MultiSelectorData } from "../../standalone";
import type { ErrorComponentProps } from "../Form";

// Lazy-import to avoid circular dependency at module evaluation time
const BackendSingleSelect = lazy(() => import("./BackendSingleSelect"));
const BackendMultiSelect = lazy(() => import("./BackendMultiSelect"));
const CrudMultiSelect = lazy(() => import("./CrudMultiSelect"));

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
			<CrudMultiSelect<string, never, null, AssignmentData>
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
						InputLabelProps={{ shrink: true }}
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
