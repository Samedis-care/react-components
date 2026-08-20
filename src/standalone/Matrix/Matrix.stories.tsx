import React, { useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, within } from "storybook/test";
import { Avatar, Box, Typography } from "@mui/material";
import { BeachAccess, Group, PanTool } from "@mui/icons-material";
import MatrixGrid, { MatrixGridProps } from "./MatrixGrid";
import MatrixCellTile from "./MatrixCellTile";
import buildDateColumns from "./buildDateColumns";
import { MatrixCellContext, MatrixRow, MatrixTileItem } from "./types";

/**
 * The demo domain: a duty roster. Everything domain-shaped (the people, the
 * colors, the glyphs, what an entry means) is assembled here, in the consumer,
 * and handed to the grid as render props.
 */
interface DemoEntry {
	id: string;
	code: string;
	target?: string;
	color: string;
	textColor: string;
	external?: boolean;
	fresh?: boolean;
	note?: boolean;
}

interface DemoCell {
	entries: DemoEntry[];
	absent?: boolean;
}

interface DemoPerson {
	id: string;
	name: string;
	guest?: boolean;
}

const PEOPLE: DemoPerson[] = [
	{ id: "u1", name: "Alice Weber" },
	{ id: "u2", name: "Bruno Fischer" },
	{ id: "u3", name: "Chiara Neumann" },
	{ id: "u4", name: "Dimitri Klein" },
	{ id: "u5", name: "Eva Sommer", guest: true },
];

const FROM = "2026-03-02";
const TO = "2026-03-22";
const TODAY = "2026-03-10";

const SHIFTS: DemoEntry[] = [
	{ id: "early", code: "F", color: "#2e7d32", textColor: "#ffffff" },
	{ id: "late", code: "S", color: "#1565c0", textColor: "#ffffff" },
	{ id: "night", code: "N", color: "#4527a0", textColor: "#ffffff" },
	{ id: "onCall", code: "RD", color: "#ef6c00", textColor: "#000000" },
];

/**
 * Deterministic demo data — no randomness, so the interaction test below can
 * rely on which cells are free.
 */
const buildDemoRows = (columnKeys: string[]): MatrixRow<DemoCell>[] =>
	PEOPLE.map((person, personIndex) => {
		const cells: Record<string, DemoCell> = {};
		columnKeys.forEach((key, dayIndex) => {
			const slot = (dayIndex + personIndex * 2) % 7;
			if (slot === 3) {
				cells[key] = { entries: [], absent: true };
				return;
			}
			if (slot > 3) return; // free day: no cell at all
			const shift = SHIFTS[(dayIndex + personIndex) % SHIFTS.length];
			const entries: DemoEntry[] = [
				{
					...shift,
					id: `${person.id}-${key}-a`,
					fresh: dayIndex === 12 && personIndex === 1,
					note: slot === 1,
					target: slot === 2 ? "ICU" : undefined,
				},
			];
			if (slot === 0 && dayIndex % 5 === 0)
				entries.push({
					...SHIFTS[(dayIndex + personIndex + 2) % SHIFTS.length],
					id: `${person.id}-${key}-b`,
					external: personIndex === 3,
				});
			cells[key] = { entries };
		});
		return {
			key: person.id,
			label: person.name,
			cells,
			selectable: !person.guest,
		};
	});

const toTileItem = (entry: DemoEntry): MatrixTileItem => ({
	key: entry.id,
	label: entry.code,
	secondaryLabel: entry.target,
	flow: "vertical",
	backgroundColor: entry.color,
	textColor: entry.textColor,
	dimmed: entry.external,
	highlighted: entry.fresh,
	tooltip: entry.target
		? `${entry.code} assigned to ${entry.target}`
		: entry.code,
	corners: {
		...(entry.target === undefined &&
			entry.code === "RD" && { bottomLeft: <PanTool sx={{ fontSize: 12 }} /> }),
		...(entry.note && {
			topRight: (
				<Box
					sx={{
						width: 0,
						height: 0,
						borderStyle: "solid",
						borderWidth: "0 9px 9px 0",
						borderColor: "transparent #e5ff00 transparent transparent",
					}}
				/>
			),
		}),
	},
});

interface DemoArgs extends Omit<
	MatrixGridProps<DemoCell>,
	| "columns"
	| "rows"
	| "corner"
	| "renderRowHeader"
	| "renderCell"
	| "renderCellWrapper"
	| "isCellSelectable"
	| "isCellOccupied"
	| "extraRows"
> {
	/** How two entries share one cell */
	pairLayout: "split" | "diagonal";
	/** Called with the clicked entry */
	onItemClick: (item: MatrixTileItem) => void;
	/** Make the entries drag handles and the cells drop targets */
	dragAndDrop: boolean;
	/** Show an aggregate row below the people */
	showExtraRow: boolean;
	/** Called with the column key when a cell of the aggregate row is clicked */
	onExtraCellClick: (columnKey: string) => void;
}

const DemoMatrix = (args: DemoArgs) => {
	const {
		pairLayout,
		onItemClick,
		dragAndDrop,
		showExtraRow,
		onExtraCellClick,
		...gridProps
	} = args;
	const columns = React.useMemo(
		() =>
			buildDateColumns({ from: FROM, to: TO, locale: "en-GB", today: TODAY }),
		[],
	);
	const rows = React.useMemo(
		() => buildDemoRows(columns.map((column) => column.key)),
		[columns],
	);

	const renderRowHeader = useCallback((row: MatrixRow<DemoCell>) => {
		const person = PEOPLE.find((entry) => entry.id === row.key);
		const [first, ...rest] = (person?.name ?? "").split(" ");
		return (
			<Box
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					px: 0.5,
					minWidth: 0,
				}}
				data-testid={`row-header-${row.key}`}
			>
				<Avatar sx={{ width: 30, height: 30, fontSize: 13, mb: 0.25 }}>
					{first[0]}
				</Avatar>
				<Typography
					noWrap
					sx={{ fontSize: "0.8rem", fontWeight: 700, color: "primary.main" }}
				>
					{first}
				</Typography>
				<Typography noWrap sx={{ fontSize: "0.6rem", color: "text.secondary" }}>
					{rest.join(" ")}
				</Typography>
				{person?.guest && (
					<Typography sx={{ fontSize: "0.55rem", color: "text.secondary" }}>
						{"guest"}
					</Typography>
				)}
			</Box>
		);
	}, []);

	const renderItem = useCallback(
		(item: MatrixTileItem, node: React.ReactNode) => (
			// A native drag handle stands in for whatever drag & drop library the
			// consumer uses — the grid and the tile know nothing about either.
			<Box
				draggable
				sx={{ width: "100%", height: "100%", cursor: "grab" }}
				data-testid={`drag-${item.key}`}
			>
				{node}
			</Box>
		),
		[],
	);

	const renderCell = useCallback(
		(cell: DemoCell | undefined, context: MatrixCellContext<DemoCell>) => (
			<Box
				sx={{ width: "100%", height: "100%" }}
				data-testid={`cell-${context.row.key}-${context.column.key}`}
			>
				<MatrixCellTile
					items={(cell?.entries ?? []).map(toTileItem)}
					pairLayout={pairLayout}
					placeholder={
						cell?.absent ? <BeachAccess sx={{ fontSize: 16 }} /> : undefined
					}
					onItemClick={onItemClick}
					renderItem={dragAndDrop ? renderItem : undefined}
				/>
			</Box>
		),
		[pairLayout, onItemClick, dragAndDrop, renderItem],
	);

	const renderCellWrapper = useCallback(
		(node: React.ReactNode) => (
			<Box
				sx={{
					width: "100%",
					height: "100%",
					"&:hover": { outline: "2px dashed", outlineOffset: -2 },
				}}
			>
				{node}
			</Box>
		),
		[],
	);

	// A cell holding only dimmed (someone else's) entries still takes a new one.
	const isCellSelectable = useCallback(
		(cell: DemoCell | undefined) =>
			!cell ||
			(!cell.absent && cell.entries.every((entry) => !!entry.external)),
		[],
	);
	const isCellOccupied = useCallback(
		(cell: DemoCell | undefined) => !!cell && cell.entries.length > 0,
		[],
	);

	return (
		<MatrixGrid<DemoCell>
			{...gridProps}
			columns={columns}
			rows={rows}
			corner={"Ward A"}
			renderRowHeader={renderRowHeader}
			renderCell={renderCell}
			renderCellWrapper={dragAndDrop ? renderCellWrapper : undefined}
			isCellSelectable={isCellSelectable}
			isCellOccupied={isCellOccupied}
			extraRows={
				showExtraRow
					? [
							{
								key: "open-demand",
								header: (
									<>
										<Group sx={{ fontSize: 16 }} />
										<Typography sx={{ fontSize: 9, fontWeight: 700 }}>
											{"open"}
										</Typography>
									</>
								),
								label: "Open demand",
								getCellLabel: (columnKey) => `Open demand on ${columnKey}`,
								badges: {
									"2026-03-05": 2,
									"2026-03-11": 1,
									"2026-03-12": 0,
									"2026-03-19": 4,
								},
								onCellClick: onExtraCellClick,
							},
						]
					: undefined
			}
		/>
	);
};

// The story's component is the demo wrapper, not MatrixGrid itself: the grid is
// generic and takes its data plus five render props, none of which a Storybook
// control can produce. The wrapper turns the args below into those props.
const meta: Meta<DemoArgs> = {
	title: "Standalone/Matrix",
	component: DemoMatrix,
	parameters: { layout: "padded" },
	args: {
		pairLayout: "split",
		dragAndDrop: false,
		showExtraRow: true,
		selectable: true,
		addLabel: "Add",
		columnWidth: 46,
		rowHeight: 58,
		rowHeaderWidth: 116,
		headerHeight: 42,
		maxHeight: 420,
		onSelectRange: fn(),
		onItemClick: fn(),
		onExtraCellClick: fn(),
		onRowHeaderActions: fn(),
	},
	argTypes: {
		pairLayout: { control: "inline-radio", options: ["split", "diagonal"] },
		extraRowsPosition: { control: "inline-radio", options: ["bottom", "top"] },
		scrollToColumn: {
			control: "select",
			options: [undefined, "2026-03-02", TODAY, "2026-03-22"],
		},
		columnWidth: { control: { type: "range", min: 30, max: 120, step: 2 } },
		rowHeight: { control: { type: "range", min: 30, max: 120, step: 2 } },
		rowHeaderWidth: { control: { type: "range", min: 60, max: 240, step: 4 } },
		headerHeight: { control: { type: "range", min: 24, max: 80, step: 2 } },
	},
	render: (args) => <DemoMatrix {...args} />,
};
export default meta;

type Story = StoryObj<DemoArgs>;

export const Default: Story = {};

export const DiagonalPairs: Story = {
	args: { pairLayout: "diagonal" },
};

export const ReadOnly: Story = {
	args: {
		selectable: false,
		onRowHeaderActions: undefined,
		showExtraRow: false,
	},
};

export const DragAndDrop: Story = {
	args: { dragAndDrop: true },
};

/**
 * Sweeping a range: press on a free cell, drag across two more, release. The
 * grid reports the range in column order, whichever way it was drawn.
 */
export const SweepStopsAtAnOccupiedCell: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// u1 is free on the 6th to the 8th and busy on the 9th
		const start = canvas.getByTestId("cell-u1-2026-03-06");
		const past = canvas.getByTestId("cell-u1-2026-03-10");
		await userEvent.pointer([
			{ target: start, keys: "[MouseLeft>]" },
			{ target: past },
			{ keys: "[/MouseLeft]" },
		]);
		await expect(args.onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({
				fromColumnKey: "2026-03-06",
				toColumnKey: "2026-03-08",
			}),
		);
	},
};

export const SweepARange: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const start = canvas.getByTestId("cell-u1-2026-03-06");
		const end = canvas.getByTestId("cell-u1-2026-03-08");
		await userEvent.pointer([
			{ target: start, keys: "[MouseLeft>]" },
			{ target: end },
			{ keys: "[/MouseLeft]" },
		]);
		await expect(args.onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({
				rowKey: "u1",
				fromColumnKey: "2026-03-06",
				toColumnKey: "2026-03-08",
				columnKeys: ["2026-03-06", "2026-03-07", "2026-03-08"],
			}),
		);
	},
};
