import React, { useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, within } from "storybook/test";
import {
	Avatar,
	Box,
	createTheme,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { BeachAccess, Group, PanTool } from "@mui/icons-material";
import MatrixGrid from "./MatrixGrid";
import { MatrixGridProps } from "./index";
import MatrixCellTile from "./MatrixCellTile";
import buildDateColumns from "./buildDateColumns";
import { matrixClasses } from "./matrixClasses";
import {
	MatrixCellContext,
	MatrixColumn,
	MatrixExtraRow,
	MatrixRangeSelection,
	MatrixRow,
	MatrixTileItem,
} from "./types";

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
			label={"Ward A duty roster"}
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
		occupiedAddAffordance: {
			control: "inline-radio",
			options: ["chip", "overlay"],
		},
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

export const AddOverlayOnOccupiedCells: Story = {
	args: { occupiedAddAffordance: "overlay" },
};

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

// ---- Grid structure ---------------------------------------------------------
// The stories below render MatrixGrid directly, with plain text cells and no
// MatrixCellTile, so what they check is the grid itself: the scroll target,
// the sticky parts, the aggregate row and the layout.

interface PlainCell {
	text: string;
}

const PLAIN_LABEL = "Ward B roster";

/** 90 days, wider than any test viewport; today mid-range so it can be centred */
const PLAIN_COLUMNS = buildDateColumns({
	from: "2026-01-01",
	to: "2026-03-31",
	locale: "en-GB",
	today: "2026-02-10",
	accent: "2026-02-12",
});

const PLAIN_ROWS: MatrixRow<PlainCell>[] = Array.from(
	{ length: 30 },
	(_, rowIndex) => ({
		key: `p${rowIndex + 1}`,
		label: `Person ${rowIndex + 1}`,
		cells: Object.fromEntries(
			PLAIN_COLUMNS.filter((_, i) => (i + rowIndex) % 3 === 0).map((column) => [
				column.key,
				{ text: "F" },
			]),
		),
	}),
);

const PLAIN_DEMAND: MatrixExtraRow = {
	key: "demand",
	header: "Open",
	label: "Open demand",
	getCellLabel: (columnKey) => `Open demand on ${columnKey}`,
	badges: { "2026-02-05": 2, "2026-02-11": 1, "2026-02-12": 0 },
};

/** stable selectors for the slots the play functions measure */
const PLAIN_CLASSES = {
	corner: "plain-corner",
	columnHeader: "plain-column-header",
	columnHeaderLabel: "plain-column-header-label",
	rowHeader: "plain-row-header",
	extraRowHeader: "plain-extra-row-header",
	badge: "plain-badge",
	extraCellAddHint: "plain-extra-cell-add-hint",
};

const renderPlainRowHeader = (row: MatrixRow<PlainCell>) => (
	<Typography noWrap sx={{ p: 1, fontSize: "0.8rem" }}>
		{row.label}
	</Typography>
);

const renderPlainCell = (cell: PlainCell | undefined) => (
	<Typography sx={{ textAlign: "center", lineHeight: "58px" }}>
		{cell?.text ?? ""}
	</Typography>
);

interface PlainRosterProps {
	/** Reported by the aggregate row */
	onExtraCellClick?: (columnKey: string) => void;
	/** Replaces the aggregate row */
	extraRow?: MatrixExtraRow;
	/** Replaces the 90-day window */
	columns?: MatrixColumn[];
}

const PlainRoster = (props: PlainRosterProps) => {
	const { onExtraCellClick, extraRow = PLAIN_DEMAND } = props;
	const extraRows = React.useMemo(
		() => [{ ...extraRow, onCellClick: onExtraCellClick }],
		[extraRow, onExtraCellClick],
	);
	return (
		<MatrixGrid<PlainCell>
			columns={props.columns ?? PLAIN_COLUMNS}
			rows={PLAIN_ROWS}
			extraRows={extraRows}
			label={PLAIN_LABEL}
			corner={"Ward B"}
			maxHeight={420}
			classes={PLAIN_CLASSES}
			renderRowHeader={renderPlainRowHeader}
			renderCell={renderPlainCell}
		/>
	);
};

const plainSlot = (
	canvasElement: HTMLElement,
	slot: keyof typeof PLAIN_CLASSES,
) =>
	Array.from(
		canvasElement.querySelectorAll<HTMLElement>(`.${PLAIN_CLASSES[slot]}`),
	);

// ---- Bug stories ------------------------------------------------------------
// Each one asserts the correct behavior and fails until the BUGS.md entry it
// is named after is fixed.

// ---- Cells and tiles --------------------------------------------------------
// The stories below render a small roster whose cells are MatrixCellTile and
// all accept one more entry, so the add chip (and in overlay mode the half
// hint) appears on every occupied cell: what they check is the body cells, the
// tiles and the pointer and keyboard interaction.

interface TileCell {
	items: MatrixTileItem[];
	/** draw two entries as a diagonal pair */
	diagonal?: boolean;
	/** stack a split pair */
	column?: boolean;
}

const TILE_LABEL = "Ward C roster";

/** 30 days: wider than the test viewport, so the grid scrolls both ways */
const TILE_COLUMNS: MatrixColumn[] = Array.from({ length: 30 }, (_, i) => ({
	key: `t${i + 1}`,
	label: i + 1,
}));

const EARLY: MatrixTileItem = {
	key: "early",
	label: "F",
	backgroundColor: "#2e7d32",
	textColor: "#ffffff",
};

const LATE: MatrixTileItem = {
	key: "late",
	label: "S",
	backgroundColor: "#1565c0",
	textColor: "#ffffff",
};

const TILE_ROWS: MatrixRow<TileCell>[] = [
	{
		key: "a",
		label: "Alice Weber",
		cells: {
			t2: {
				items: [
					{
						...EARLY,
						corners: {
							bottomRight: <span data-testid={"corner-br"}>{"!"}</span>,
						},
					},
				],
			},
			t3: { items: [EARLY, LATE] },
			t4: { items: [EARLY, LATE], diagonal: true },
			t5: { items: [{ ...EARLY, secondaryLabel: "ICU" }] },
		},
	},
	...[
		"Bruno Fischer",
		"Chiara Neumann",
		"Dimitri Klein",
		"Eva Sommer",
		"Frank Ludwig",
		"Greta Hahn",
		"Hanna Roth",
	].map((label, index) => ({ key: `p${index}`, label, cells: {} })),
];

/** stable selectors for the slots the play functions measure */
const TILE_CLASSES = {
	cell: "tile-cell",
	addHint: "tile-add-hint",
	addChip: "tile-add-chip",
	columnHeader: "tile-column-header",
	rowHeader: "tile-row-header",
};

const acceptEveryCell = () => true;

const renderTileRowHeader = (row: MatrixRow<TileCell>) => (
	<Typography noWrap sx={{ p: 1, fontSize: "0.8rem" }}>
		{row.label}
	</Typography>
);

interface TileRosterProps {
	/** Reported by a sweep, a click on a free cell and the add chip */
	onSelectRange?: (selection: MatrixRangeSelection) => void;
	/** Reported by a click on an entry */
	onItemClick?: (item: MatrixTileItem) => void;
	/** How an occupied cell offers "add" */
	occupiedAddAffordance?: "chip" | "overlay";
	/** Text of the hint, name of the chip */
	addLabel?: React.ReactNode;
	/** No range selection, so no chip and no hint */
	readOnly?: boolean;
	/** Replaces the roster's rows */
	rows?: MatrixRow<TileCell>[];
}

const TileRoster = (props: TileRosterProps) => {
	const { onItemClick } = props;
	const renderCell = useCallback(
		(cell: TileCell | undefined) => (
			<MatrixCellTile
				items={cell?.items ?? []}
				pairLayout={cell?.diagonal ? "diagonal" : "split"}
				splitDirection={cell?.column ? "column" : "row"}
				onItemClick={onItemClick}
			/>
		),
		[onItemClick],
	);
	return (
		<MatrixGrid<TileCell>
			columns={TILE_COLUMNS}
			rows={props.rows ?? TILE_ROWS}
			label={TILE_LABEL}
			corner={"Ward C"}
			maxHeight={300}
			classes={TILE_CLASSES}
			selectable={!props.readOnly}
			addLabel={props.addLabel ?? "Add"}
			occupiedAddAffordance={props.occupiedAddAffordance}
			isCellSelectable={acceptEveryCell}
			onSelectRange={props.onSelectRange}
			renderRowHeader={renderTileRowHeader}
			renderCell={renderCell}
		/>
	);
};

const tileScroller = (canvasElement: HTMLElement) =>
	within(canvasElement).getByRole("region", { name: TILE_LABEL });

/** the body cell at (row, column), in DOM order */
const tileCell = (canvasElement: HTMLElement, row: number, column: number) =>
	Array.from(
		canvasElement.querySelectorAll<HTMLElement>(`.${TILE_CLASSES.cell}`),
	)[row * TILE_COLUMNS.length + column];

// ---- Bug stories ------------------------------------------------------------
// Each one asserts the correct behavior and fails until the BUGS.md entry it
// is named after is fixed.

// WCAG contrast; fg may be translucent over an opaque bg
type Rgba = { r: number; g: number; b: number; a: number };

const parseColor = (color: string): Rgba => {
	const m = /rgba?\(([^)]+)\)/.exec(color);
	if (!m) throw new Error(`cannot parse color ${color}`);
	const [r, g, b, a = 1] = m[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.map(Number);
	return { r, g, b, a };
};

const over = (fg: Rgba, bg: Rgba): Rgba => ({
	r: fg.r * fg.a + bg.r * (1 - fg.a),
	g: fg.g * fg.a + bg.g * (1 - fg.a),
	b: fg.b * fg.a + bg.b * (1 - fg.a),
	a: 1,
});

const luminance = ({ r, g, b }: Rgba) => {
	const channel = (v: number) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (fg: Rgba, bg: Rgba) => {
	const [hi, lo] = [luminance(over(fg, bg)), luminance(bg)].sort(
		(x, y) => y - x,
	);
	return (hi + 0.05) / (lo + 0.05);
};

/** an element's background: its color with a one-color gradient layered over it */
const backgroundOf = (element: Element): Rgba => {
	const style = getComputedStyle(element);
	const base = parseColor(style.backgroundColor);
	const layer = /linear-gradient\((rgba?\([^)]+\))/.exec(
		style.backgroundImage,
	)?.[1];
	return layer ? over(parseColor(layer), base) : base;
};

/** ISSUE-3480-ITEM-15: the labels of the "current" and "accent" column headers are below 4.5:1. */
export const Issue3480Item15HeaderLabelsHaveContrast: Story = {
	render: (args) => <PlainRoster onExtraCellClick={args.onExtraCellClick} />,
	play: async ({ canvasElement }) => {
		const headers = plainSlot(canvasElement, "columnHeader");
		for (const variant of [
			matrixClasses.columnCurrent,
			matrixClasses.columnAccent,
		]) {
			const header = headers.find((candidate) =>
				candidate.classList.contains(variant),
			);
			if (!header) throw new Error(`no ${variant} column header`);
			const label = header.querySelector(`.${PLAIN_CLASSES.columnHeaderLabel}`);
			if (!label) throw new Error(`the ${variant} column header has no label`);
			const ratio = contrast(
				parseColor(getComputedStyle(label).color),
				backgroundOf(header),
			);
			// 0.8rem bold is normal-size text: 4.5:1
			await expect(ratio, variant).toBeGreaterThanOrEqual(4.5);
		}
	},
};

const ITEM_15_THEMES = [
	// samedis.care's warning color: its warning.dark has 2.9:1 on the tint
	createTheme({ palette: { warning: { main: "#FFCF00" } } }),
	createTheme({ palette: { mode: "dark" } }),
];

const ITEM_15_COLUMNS = buildDateColumns({
	from: "2026-02-08",
	to: "2026-02-14",
	locale: "en-GB",
	today: "2026-02-10",
	accent: "2026-02-12",
});

/** ISSUE-3480-ITEM-15: the same 4.5:1 with another warning color, and in dark mode. */
export const Issue3480Item15HeaderLabelsHaveContrastInOtherPalettes: Story = {
	render: (args) => (
		<>
			{ITEM_15_THEMES.map((theme, index) => (
				<ThemeProvider key={index} theme={theme}>
					<Box data-palette={index} sx={{ mb: 2 }}>
						<PlainRoster
							onExtraCellClick={args.onExtraCellClick}
							columns={ITEM_15_COLUMNS}
						/>
					</Box>
				</ThemeProvider>
			))}
		</>
	),
	play: async (context) => {
		const palettes = Array.from(
			context.canvasElement.querySelectorAll<HTMLElement>("[data-palette]"),
		);
		await expect(palettes).toHaveLength(ITEM_15_THEMES.length);
		for (const canvasElement of palettes)
			await Issue3480Item15HeaderLabelsHaveContrast.play?.({
				...context,
				canvasElement,
			});
	},
};

/** ISSUE-3481-ITEM-11: the focus ring of an entry is drawn inside its fill, in primary.main. */
export const Issue3481Item11EntryFocusRingStandsOut: Story = {
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<TileRoster
			onSelectRange={args.onSelectRange}
			onItemClick={args.onItemClick}
		/>
	),
	play: async ({ canvasElement }) => {
		const entry = tileCell(canvasElement, 0, 2).querySelector<HTMLElement>(
			"[role=button]",
		);
		if (!entry) throw new Error("no entry in the cell");
		entry.focus();
		await expect(entry.matches(":focus-visible")).toBe(true);
		const style = getComputedStyle(entry);
		await expect(style.outlineStyle).not.toBe("none");
		// a ring inside the entry has to stand out from the fill, one outside
		// from the grid behind it (WCAG 1.4.11: 3:1)
		const behind =
			parseFloat(style.outlineOffset) < 0
				? parseColor(style.backgroundColor)
				: backgroundOf(tileScroller(canvasElement));
		await expect(
			contrast(parseColor(style.outlineColor), behind),
		).toBeGreaterThanOrEqual(3);
	},
};

/** ISSUE-3481-ITEM-11: every ring keeps its contrast, whatever surrounds or fades the entry. */
const RING_ROWS: MatrixRow<TileCell>[] = [
	{
		key: "a",
		label: "Alice Weber",
		cells: {
			t2: { items: [{ ...LATE, highlighted: true }] },
			t3: { items: [{ ...EARLY, dimmed: true }] },
			t4: { items: [EARLY, LATE], diagonal: true },
			// the add chip on an entry filled with primary.main, the ring's color
			t5: { items: [{ ...LATE, backgroundColor: "#1976d2" }] },
		},
	},
];

export const Issue3481Item11EveryRingKeepsItsContrast: Story = {
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<TileRoster
			onSelectRange={args.onSelectRange}
			onItemClick={args.onItemClick}
			rows={RING_ROWS}
		/>
	),
	play: async ({ canvasElement }) => {
		const grid = backgroundOf(tileScroller(canvasElement));
		const checkRing = async (element: HTMLElement, name: string) => {
			element.focus();
			await expect(element.matches(":focus-visible"), name).toBe(true);
			const style = getComputedStyle(element);
			const outline = parseColor(style.outlineColor);
			// an element's opacity fades its outline too
			const ring = { ...outline, a: outline.a * Number(style.opacity) };
			const offset = parseFloat(style.outlineOffset);
			// outside the element, on the grid's background
			await expect(offset, name).toBeGreaterThanOrEqual(0);
			await expect(contrast(ring, grid), name).toBeGreaterThanOrEqual(3);
			// and a line of contrasting color between the ring and the element,
			// for whatever lies under the ring (a highlight, the entry under the
			// chip)
			const line =
				/(rgba?\([^)]+\)) [\d.]+px [\d.]+px [\d.]+px ([\d.]+)px( inset)?/.exec(
					style.boxShadow,
				);
			await expect(line, name).not.toBeNull();
			if (!line) throw new Error(`${name}: no contrast line in the box shadow`);
			const [, color, spread, inset] = line;
			await expect(
				inset ? offset === 0 : parseFloat(spread) >= offset,
				name,
			).toBe(true);
			await expect(
				contrast(ring, over(parseColor(color), grid)),
				name,
			).toBeGreaterThanOrEqual(3);
		};
		const entryIn = (column: number) => {
			const found = tileCell(
				canvasElement,
				0,
				column,
			).querySelector<HTMLElement>("[role=button]");
			if (!found) throw new Error(`no entry in column ${column}`);
			return found;
		};
		await checkRing(entryIn(1), "highlighted");
		await checkRing(entryIn(2), "dimmed");
		await checkRing(entryIn(3), "diagonal");
		const chip = tileCell(canvasElement, 0, 4).querySelector<HTMLElement>(
			`.${TILE_CLASSES.addChip}`,
		);
		if (!chip) throw new Error("no add chip in column 4");
		await checkRing(chip, "chip");
	},
};
