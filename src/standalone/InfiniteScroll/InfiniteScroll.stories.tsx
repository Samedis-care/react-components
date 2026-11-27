import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Box,
	CircularProgress,
	Paper,
	Typography,
	styled,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import InfiniteScroll from "./index";

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof InfiniteScroll> = {
	title: "standalone/InfiniteScroll",
	component: InfiniteScroll,
	parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof InfiniteScroll>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeItems = (start: number, count: number) =>
	Array.from({ length: count }, (_, i) => start + i);

/**
 * The scroll container needs a bounded height; it scrolls (overflow: auto) by
 * default
 */
const Scroller = styled(InfiniteScroll)({
	height: 300,
	width: 300,
});

const ZoomedScroller = styled(InfiniteScroll)({
	height: 301,
	width: 300,
});

const Row = styled("div")({
	height: 30,
	boxSizing: "border-box",
	padding: "0 8px",
	lineHeight: "30px",
	borderBottom: "1px solid #eee",
	fontSize: 14,
});

const FractionalRow = styled(Row)({ height: 33.3, lineHeight: "33.3px" });

const renderItems = (items: number[]) =>
	items.map((n) => <Row key={n}>Item {n}</Row>);

/** The scroll container is the parent of the rows */
const getScroller = (canvasElement: HTMLElement, firstRowText: string) => {
	const scroller = within(canvasElement).getByText(firstRowText).parentElement;
	if (!scroller) throw new Error("scroll container not found");
	return scroller;
};

/**
 * Has the fill check stopped, i.e. does the content overflow by more than the
 * default threshold of 250px?
 */
const isFilled = (scroller: HTMLElement) =>
	scroller.scrollHeight > scroller.clientHeight + 250;

// ─── Stories ──────────────────────────────────────────────────────────────────

const BottomScrollStory = ({ onLoadBottom }: { onLoadBottom?: () => void }) => {
	const [items, setItems] = useState<number[]>(() => makeItems(1, 20));

	const loadMoreBottom = useCallback(() => {
		onLoadBottom?.();
		setItems((prev) => [...prev, ...makeItems(prev.length + 1, 10)]);
	}, [onLoadBottom]);

	return (
		<Box sx={{ width: 300 }}>
			<Typography variant="caption" sx={{ display: "block", mb: 1 }}>
				Scroll to the bottom to load more items. Total: {items.length}
			</Typography>
			<Scroller loadMoreBottom={loadMoreBottom}>{renderItems(items)}</Scroller>
		</Box>
	);
};

export const LoadMoreOnBottom: StoryObj<typeof InfiniteScroll> = {
	render: () => <BottomScrollStory />,
};

const BIDIRECTIONAL_CLASS = "story-bidirectional-scroll";

const InjectBidirectionalStyle = () => (
	<style>{`.${BIDIRECTIONAL_CLASS} { height: 300px; overflow: auto; width: 300px; }`}</style>
);

const BidirectionalScrollStory = () => {
	const [items, setItems] = useState<number[]>(() => makeItems(10, 20));

	const loadMoreTop = useCallback(() => {
		setItems((prev) => {
			const first = prev[0];
			if (first <= 1) return prev;
			return [
				...makeItems(Math.max(1, first - 10), Math.min(10, first - 1)),
				...prev,
			];
		});
	}, []);

	const loadMoreBottom = useCallback(() => {
		setItems((prev) => [...prev, ...makeItems(prev[prev.length - 1] + 1, 10)]);
	}, []);

	return (
		<Box sx={{ width: 300 }}>
			<InjectBidirectionalStyle />
			<Typography variant="caption" sx={{ display: "block", mb: 1 }}>
				Scroll up or down to load more items. Total: {items.length}
			</Typography>
			<InfiniteScroll
				className={BIDIRECTIONAL_CLASS}
				loadMoreTop={loadMoreTop}
				loadMoreBottom={loadMoreBottom}
			>
				{items.map((n) => (
					<Box
						key={n}
						sx={{ p: 1, borderBottom: "1px solid #eee", fontSize: 14 }}
					>
						Item {n}
					</Box>
				))}
			</InfiniteScroll>
		</Box>
	);
};

export const BidirectionalScroll: StoryObj<typeof InfiniteScroll> = {
	render: () => <BidirectionalScrollStory />,
};

// ─── Hidden and 0px high containers ───────────────────────────────────────────

const ROW_SX = {
	height: 30,
	boxSizing: "border-box",
	px: 1,
	lineHeight: "30px",
	borderBottom: "1px solid #eee",
	fontSize: 14,
} as const;

/** The list runs out of data after this many items */
const DATA_SIZE = 200;

const HIDDEN_PANEL_CLASS = "story-hidden-panel-scroll";
const MAX_HEIGHT_CLASS = "story-max-height-scroll";
const FULL_HEIGHT_CLASS = "story-full-height-scroll";

const InjectContainerStyles = () => (
	<style>{`.${HIDDEN_PANEL_CLASS} { height: 300px; overflow: auto; width: 300px; }
.${MAX_HEIGHT_CLASS} { max-height: 300px; overflow: auto; width: 300px; }
.${FULL_HEIGHT_CLASS} { height: 100%; overflow: auto; width: 300px; }`}</style>
);

interface AppendingListProps {
	className: string;
	callBackDebounce?: number;
	onLoadBottom?: () => void;
}

/** Starts empty and appends 10 rows of 30px per call, until DATA_SIZE */
const AppendingListInner = ({
	className,
	callBackDebounce,
	onLoadBottom,
}: AppendingListProps) => {
	const [items, setItems] = useState<number[]>([]);
	const loadMoreBottom = useCallback(() => {
		onLoadBottom?.();
		setItems((prev) =>
			prev.length >= DATA_SIZE
				? prev
				: [...prev, ...makeItems(prev.length + 1, 10)],
		);
	}, [onLoadBottom]);

	return (
		<InfiniteScroll
			className={className}
			loadMoreBottom={loadMoreBottom}
			callBackDebounce={callBackDebounce}
		>
			{items.map((n) => (
				<Box key={n} sx={ROW_SX}>
					Item {n}
				</Box>
			))}
		</InfiniteScroll>
	);
};

/** Memoized, so that showing the panel does not render the list again */
const AppendingList = React.memo(AppendingListInner);

const HiddenPanelStory = ({ onLoadBottom }: { onLoadBottom?: () => void }) => {
	const [shown, setShown] = useState(false);
	const toggle = useCallback(() => setShown((prev) => !prev), []);

	return (
		<Box sx={{ width: 300 }}>
			<InjectContainerStyles />
			<button type="button" aria-expanded={shown} onClick={toggle}>
				Show the list
			</button>
			{/* an inactive panel that stays mounted */}
			<Box sx={{ display: shown ? "block" : "none" }}>
				<AppendingList
					className={HIDDEN_PANEL_CLASS}
					callBackDebounce={0}
					onLoadBottom={onLoadBottom}
				/>
			</Box>
		</Box>
	);
};

export const Issue3471Item4HiddenListFillsOnceShown: StoryObj<
	typeof InfiniteScroll
> = {
	args: { loadMoreBottom: fn() },
	render: (args) => <HiddenPanelStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"The list starts empty inside a panel with `display: none` that stays mounted, and showing the panel does not render the list again. Nothing is loaded while it is hidden; once it is shown, the 300px container is filled: 10 rows of 30px fill it exactly, so two pages are loaded.",
			},
		},
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		// with callBackDebounce={0}, a hidden list that kept loading would have
		// loaded all its data during mount
		await expect(args.loadMoreBottom).not.toHaveBeenCalled();

		await userEvent.click(
			canvas.getByRole("button", { name: "Show the list" }),
		);
		const scroller = (await canvas.findByText("Item 1")).parentElement;
		if (!scroller) throw new Error("scroll container not found");
		await waitFor(() =>
			expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight + 24),
		);
		await expect(args.loadMoreBottom).toHaveBeenCalledTimes(2);
	},
};

const MaxHeightStory = ({ onLoadBottom }: { onLoadBottom?: () => void }) => (
	<Box sx={{ width: 300 }}>
		<InjectContainerStyles />
		<AppendingList className={MAX_HEIGHT_CLASS} onLoadBottom={onLoadBottom} />
	</Box>
);

export const Issue3471Item4EmptyListWithMaxHeightFills: StoryObj<
	typeof InfiniteScroll
> = {
	args: { loadMoreBottom: fn() },
	render: (args) => <MaxHeightStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"A container bounded by `max-height: 300px` is 0px high while its list is empty, but it is displayed, so it is filled like any other: two pages of 10 rows of 30px.",
			},
		},
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = (await canvas.findByText("Item 1")).parentElement;
		if (!scroller) throw new Error("scroll container not found");
		await waitFor(() =>
			expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight + 24),
		);
		await expect(scroller.clientHeight).toBe(300);
		await expect(args.loadMoreBottom).toHaveBeenCalledTimes(2);
	},
};

// ─── Fractional scroll offsets ────────────────────────────────────────────────

const ZoomedStory = ({ onLoadBottom }: { onLoadBottom?: () => void }) => {
	const loadMoreBottom = useCallback(() => onLoadBottom?.(), [onLoadBottom]);
	return (
		<Box sx={{ zoom: 1.25 }}>
			<ZoomedScroller loadMoreBottom={loadMoreBottom}>
				{makeItems(1, 40).map((n) => (
					<FractionalRow key={n}>Item {n}</FractionalRow>
				))}
			</ZoomedScroller>
		</Box>
	);
};

export const Issue3471Item5LoadsAtBottomWhenZoomed: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => <ZoomedStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		docs: {
			description: {
				story:
					"The list is inside an ancestor with CSS `zoom: 1.25`, so at the bottom the browser reports a fractional `scrollTop` (e.g. 1031.2 in Chromium, while `scrollHeight - clientHeight` is 1031). An offset less than 1px from the bottom counts as the bottom, so scrolling to the end calls `loadMoreBottom`.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const scroller = getScroller(canvasElement, "Item 1");
		scroller.scrollTop = scroller.scrollHeight;
		// precondition: the zoom makes the bottom offset fractional
		await waitFor(() =>
			expect(Number.isInteger(scroller.scrollTop)).toBe(false),
		);
		await waitFor(() => expect(args.loadMoreBottom).toHaveBeenCalledTimes(1));
	},
};

// ─── Loading on top ───────────────────────────────────────────────────────────

const TOP_LOADING_CLASS = "story-top-loading-scroll";

const InjectTopLoadingStyle = () => (
	<style>{`.${TOP_LOADING_CLASS} { height: 300px; overflow: auto; width: 300px; }`}</style>
);

const RowButton = styled("button")({
	display: "block",
	width: "100%",
	height: 30,
	boxSizing: "border-box",
	textAlign: "left",
	fontSize: 14,
});

interface TopLoadingListProps {
	/** The number of the first row */
	first: number;
	/** The number of rows shown at first */
	count: number;
	/** Rows are buttons? */
	focusable?: boolean;
	/** Load at the bottom too? */
	withBottom?: boolean;
	onLoadTop?: () => void;
	onLoadBottom?: () => void;
}

/**
 * Rows of 30px. loadMoreTop adds 10 rows above, down to Row 1; loadMoreBottom,
 * if enabled, adds 10 rows below.
 */
const TopLoadingList = ({
	first,
	count,
	focusable,
	withBottom,
	onLoadTop,
	onLoadBottom,
}: TopLoadingListProps) => {
	const [items, setItems] = useState(() => makeItems(first, count));
	const loadMoreTop = useCallback(() => {
		onLoadTop?.();
		setItems((prev) =>
			prev[0] <= 1
				? prev
				: [
						...makeItems(Math.max(1, prev[0] - 10), Math.min(10, prev[0] - 1)),
						...prev,
					],
		);
	}, [onLoadTop]);
	const loadMoreBottom = useCallback(() => {
		onLoadBottom?.();
		setItems((prev) => [...prev, ...makeItems(prev[prev.length - 1] + 1, 10)]);
	}, [onLoadBottom]);

	return (
		<Box sx={{ width: 300 }}>
			<InjectTopLoadingStyle />
			<InfiniteScroll
				className={TOP_LOADING_CLASS}
				role="region"
				aria-label="Rows"
				loadMoreTop={loadMoreTop}
				loadMoreBottom={withBottom ? loadMoreBottom : undefined}
			>
				{items.map((n) =>
					focusable ? (
						<RowButton key={n} type="button">
							Row {n}
						</RowButton>
					) : (
						<Row key={n}>Row {n}</Row>
					),
				)}
			</InfiniteScroll>
		</Box>
	);
};

/** The scroll container's visible top and bottom edges, in viewport coordinates */
const getViewEdges = (scroller: HTMLElement) => {
	const top = scroller.getBoundingClientRect().top + scroller.clientTop;
	return { top, bottom: top + scroller.clientHeight };
};

export const Issue3471Item6OpensAtTheFirstRow: Story = {
	args: { loadMoreTop: fn(), loadMoreBottom: fn() },
	render: (args) => (
		<TopLoadingList
			first={100}
			count={20}
			withBottom
			onLoadTop={args.loadMoreTop}
			onLoadBottom={args.loadMoreBottom}
		/>
	),
	parameters: {
		docs: {
			description: {
				story:
					"The list starts with Row 100 to Row 119 and loads 10 rows above per `loadMoreTop` call. It opens at Row 100, fully visible at the top edge: once the rows fill the container, `loadMoreTop` is called, and the rows it adds stay out of view above Row 100, so scrolling up shows them.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = canvas.getByRole("region", { name: "Rows" });
		// the rows above were loaded at once
		await canvas.findByText("Row 90");
		const firstRow = canvas.getByText("Row 100").getBoundingClientRect();
		await expect(firstRow.top).toBe(getViewEdges(scroller).top);
		await expect(scroller.scrollTop).toBe(300);
		await expect(args.loadMoreTop).toHaveBeenCalledTimes(1);
		await expect(args.loadMoreBottom).not.toHaveBeenCalled();
	},
};

export const Issue3471Item6FocusedRowStaysInView: Story = {
	args: { loadMoreTop: fn(), loadMoreBottom: fn() },
	render: (args) => (
		<TopLoadingList
			first={100}
			count={20}
			focusable
			withBottom
			onLoadTop={args.loadMoreTop}
			onLoadBottom={args.loadMoreBottom}
		/>
	),
	parameters: {
		docs: {
			description: {
				story:
					"The rows are buttons. Tab reaches the scroll container, then the first row, which scrolls the list to its top and so loads 10 rows above it. The focused row stays where it is, fully visible at the top edge, with the new rows out of view above it.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = canvas.getByRole("region", { name: "Rows" });
		await userEvent.tab();
		await expect(scroller).toHaveFocus();
		await userEvent.tab();
		const focused = document.activeElement as HTMLElement;
		await expect(scroller).toContainElement(focused);
		// focusing the row scrolled the list to its top, which loads 10 rows above it
		await waitFor(() =>
			expect(Array.from(scroller.children).indexOf(focused)).toBe(10),
		);
		await expect(focused).toHaveFocus();
		const row = focused.getBoundingClientRect();
		const view = getViewEdges(scroller);
		await expect(row.top).toBeGreaterThanOrEqual(view.top);
		await expect(row.bottom).toBeLessThanOrEqual(view.bottom);
		await expect(scroller.scrollTop).toBe(300);
	},
};

export const Issue3471Item6FillsAListThatOnlyLoadsOnTop: Story = {
	args: { loadMoreTop: fn() },
	render: (args) => (
		<TopLoadingList first={96} count={5} onLoadTop={args.loadMoreTop} />
	),
	parameters: {
		docs: {
			description: {
				story:
					"A list that only grows upwards, like a chat history: it has `loadMoreTop` and no `loadMoreBottom`. It starts with the five newest rows, which do not fill the container, so it is filled through `loadMoreTop` until the rows overflow it by more than the default `threshold` of 250px, which takes two pages; the rows in view stay where they are, so the newest row stays in view at the bottom.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = canvas.getByRole("region", { name: "Rows" });
		await waitFor(() => expect(isFilled(scroller)).toBe(true), {
			timeout: 3000,
		});
		await expect(args.loadMoreTop).toHaveBeenCalledTimes(2);
		const newest = canvas.getByText("Row 100").getBoundingClientRect();
		const view = getViewEdges(scroller);
		await expect(newest.top).toBeGreaterThanOrEqual(view.top);
		await expect(newest.bottom).toBeLessThanOrEqual(view.bottom);
	},
};

// ─── Loading state and threshold ──────────────────────────────────────────────

export const Issue3471Item7LoadsBeforeTheBottom: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => <BottomScrollStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		docs: {
			description: {
				story:
					"20 rows of 30px in a 300px container. Scrolling down 60px leaves 240px of rows below the view, less than the default `threshold` of 250px, so `loadMoreBottom` is called before the user reaches the bottom.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const scroller = getScroller(canvasElement, "Item 1");
		// precondition: the 20 rows overflow the container by more than 250px
		await expect(scroller.scrollHeight - scroller.clientHeight).toBe(300);
		await expect(args.loadMoreBottom).not.toHaveBeenCalled();
		scroller.scrollTop = 60;
		await waitFor(() => expect(args.loadMoreBottom).toHaveBeenCalledTimes(1), {
			timeout: 3000,
		});
		await expect(scroller.scrollTop).toBe(60);
	},
};

/** The async list runs out of data after this many rows */
const ASYNC_DATA_SIZE = 60;
const ASYNC_PAGE_SIZE = 20;
/** How long a page takes to load, in ms */
const ASYNC_LOAD_TIME = 300;

const LoaderRow = styled(Row)({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
});

/**
 * Loads pages of 20 rows that take 300ms each, passes its loading state as
 * `loading`, shows a loader row while a page loads, and tells screen readers
 * in a polite status line outside the list what is happening
 */
const AsyncLoadingStory = ({ onLoadBottom }: { onLoadBottom?: () => void }) => {
	const [items, setItems] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const headingId = useId();
	const timer = useRef(0);
	useEffect(() => () => window.clearTimeout(timer.current), []);
	const done = items.length >= ASYNC_DATA_SIZE;

	const loadMoreBottom = useCallback(() => {
		onLoadBottom?.();
		setLoading(true);
		timer.current = window.setTimeout(() => {
			setItems((prev) => [
				...prev,
				...makeItems(prev.length + 1, ASYNC_PAGE_SIZE),
			]);
			setLoading(false);
		}, ASYNC_LOAD_TIME);
	}, [onLoadBottom]);

	return (
		<Box sx={{ width: 300 }}>
			<Typography
				id={headingId}
				variant="caption"
				sx={{ display: "block", mb: 1 }}
			>
				Rows
			</Typography>
			<Scroller
				role="region"
				aria-labelledby={headingId}
				loadMoreBottom={done ? undefined : loadMoreBottom}
				loading={loading}
			>
				{renderItems(items)}
				{loading && (
					<LoaderRow aria-hidden>
						<CircularProgress size={16} />
					</LoaderRow>
				)}
			</Scroller>
			<Typography role="status" variant="caption" sx={{ display: "block" }}>
				{loading
					? "Loading more rows…"
					: done
						? `All ${ASYNC_DATA_SIZE} rows are loaded.`
						: ""}
			</Typography>
		</Box>
	);
};

export const Issue3471Item7BusyWhileLoading: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => <AsyncLoadingStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		docs: {
			description: {
				story:
					"A list that loads pages of 20 rows, which take 300ms each, and passes its loading state as `loading`. While a page loads, the list is `aria-busy` and `loadMoreBottom` is not called again, however often the list is scrolled; a polite status line below the list says what is happening. After 60 rows `loadMoreBottom` is `undefined`.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = canvas.getByRole("region", { name: "Rows" });
		const status = canvas.getByRole("status");
		// the empty list is filled with one page, and is busy meanwhile
		await waitFor(() => expect(scroller).toHaveAttribute("aria-busy", "true"), {
			timeout: 3000,
		});
		await expect(status).toHaveTextContent("Loading more rows…");
		await canvas.findByText("Item 20", undefined, { timeout: 3000 });
		await expect(scroller).not.toHaveAttribute("aria-busy");
		await expect(args.loadMoreBottom).toHaveBeenCalledTimes(1);

		scroller.scrollTop = scroller.scrollHeight;
		await waitFor(() => expect(scroller).toHaveAttribute("aria-busy", "true"), {
			timeout: 3000,
		});
		// more scroll events at the bottom while the page loads
		scroller.dispatchEvent(new Event("scroll"));
		scroller.dispatchEvent(new Event("scroll"));
		await canvas.findByText("Item 40", undefined, { timeout: 3000 });
		await expect(scroller).not.toHaveAttribute("aria-busy");
		await expect(args.loadMoreBottom).toHaveBeenCalledTimes(2);

		scroller.scrollTop = scroller.scrollHeight;
		await waitFor(
			() => expect(status).toHaveTextContent("All 60 rows are loaded."),
			{ timeout: 3000 },
		);
		await expect(args.loadMoreBottom).toHaveBeenCalledTimes(3);
	},
};

// ─── Containers that change their size ────────────────────────────────────────

/**
 * A panel that is 300px or 750px high. The list in it takes the panel's
 * height and is memoized, so a taller panel resizes its container without
 * rendering it, as a height relative to the viewport (`50vh`) does on a window
 * resize or device rotation.
 */
const GrowingPanelStory = ({ onLoadBottom }: { onLoadBottom?: () => void }) => {
	const [tall, setTall] = useState(false);
	const toggle = useCallback(() => setTall((prev) => !prev), []);

	return (
		<Box sx={{ width: 300 }}>
			<InjectContainerStyles />
			<button type="button" aria-pressed={tall} onClick={toggle}>
				Tall panel
			</button>
			<Box sx={{ height: tall ? 750 : 300, outline: "1px solid #ccc" }}>
				<AppendingList
					className={FULL_HEIGHT_CLASS}
					onLoadBottom={onLoadBottom}
				/>
			</Box>
		</Box>
	);
};

export const Issue3471Item8FillsAContainerThatGrows: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => <GrowingPanelStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		docs: {
			description: {
				story:
					'The list fills a panel of 300px with two pages of 10 rows of 30px. "Tall panel" makes the panel 750px high without rendering the list, as `50vh` does when the window grows: the list notices that its container grew past its 20 rows and loads two more pages, until they overflow it by more than 250px again.',
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = (await canvas.findByText("Item 1")).parentElement;
		if (!scroller) throw new Error("scroll container not found");
		await waitFor(() => expect(isFilled(scroller)).toBe(true), {
			timeout: 3000,
		});
		await expect(args.loadMoreBottom).toHaveBeenCalledTimes(2);

		await userEvent.click(canvas.getByRole("button", { name: "Tall panel" }));
		await expect(scroller.clientHeight).toBe(750);
		await waitFor(() => expect(isFilled(scroller)).toBe(true), {
			timeout: 3000,
		});
		await expect(args.loadMoreBottom).toHaveBeenCalledTimes(4);
		await expect(canvas.getByText("Item 40")).toBeInTheDocument();
	},
};

// ─── Keyboard access and naming ───────────────────────────────────────────────

export const Issue3471Item9ScrollerReachableByKeyboard: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => <BottomScrollStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		docs: {
			description: {
				story:
					"The rows contain nothing focusable, so the scroll container is the list's tab stop (`tabIndex` is 0 by default). Tab reaches it in every browser, including Safari, which gives a scroll container no tab stop of its own; it shows the focus ring, and the arrow keys, Page Up/Down, Home and End then scroll it, which loads more at the bottom.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvasElement }) => {
		const scroller = getScroller(canvasElement, "Item 1");
		// precondition: the region scrolls and has no focusable content
		await expect(isFilled(scroller)).toBe(true);
		await expect(
			scroller.querySelector("a, button, input, select, textarea, [tabindex]"),
		).toBeNull();

		await userEvent.tab();
		await expect(scroller).toHaveFocus();
		// precondition: the browser shows keyboard focus
		await expect(scroller.matches(":focus-visible")).toBe(true);
		await expect(getComputedStyle(scroller).outlineStyle).toBe("solid");
		await expect(getComputedStyle(scroller).outlineWidth).toBe("2px");
	},
};

export const Issue3471Item9ClickInDialogKeepsFocusInList: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => (
		// like the paper of a Popover or Dialog, which holds focus (tabIndex -1)
		<Paper tabIndex={-1} sx={{ p: 2 }} data-testid="paper">
			<BottomScrollStory onLoadBottom={args.loadMoreBottom} />
		</Paper>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Inside a focusable ancestor (here a Paper with `tabIndex={-1}`, as in the Notifications popover or a dialog), a click on a row focuses the scroll container rather than the ancestor, so End, Page Down and the arrow keys scroll the list and load more.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvasElement }) => {
		const scroller = getScroller(canvasElement, "Item 1");
		await userEvent.click(within(canvasElement).getByText("Item 2"));
		// the scroll keys act on the focused element's scroll chain
		await expect(scroller).toContainElement(
			document.activeElement as HTMLElement | null,
		);
	},
};

// ─── Focusable rows ───────────────────────────────────────────────────────────

/** Content without focusable elements after the last row, e.g. empty schedule days */
const TrailingBlock = styled("div")({
	height: 200,
	padding: 8,
	boxSizing: "border-box",
	fontSize: 14,
});

/** More content without focusable elements than the default threshold of 250px */
const TallTrailingBlock = styled(TrailingBlock)({ height: 400 });

/**
 * 20 rows that are buttons of 30px in a 300px container, optionally followed
 * by 200px ("short") or 400px ("tall") of content without focusable elements;
 * loadMoreBottom adds 10 rows
 */
const FocusableRowsStory = ({
	onLoadBottom,
	trailing,
}: {
	onLoadBottom?: () => void;
	trailing?: "short" | "tall";
}) => {
	const [items, setItems] = useState<number[]>(() => makeItems(1, 20));

	const loadMoreBottom = useCallback(() => {
		onLoadBottom?.();
		setItems((prev) => [...prev, ...makeItems(prev.length + 1, 10)]);
	}, [onLoadBottom]);

	return (
		<Box sx={{ width: 300 }}>
			<button type="button">Before the list</button>
			<Scroller
				role="region"
				aria-label="Items"
				loadMoreBottom={loadMoreBottom}
			>
				{items.map((n) => (
					<RowButton key={n} type="button">
						Item {n}
					</RowButton>
				))}
				{trailing === "short" && (
					<TrailingBlock>Content without focusable elements</TrailingBlock>
				)}
				{trailing === "tall" && (
					<TallTrailingBlock>
						Content without focusable elements
					</TallTrailingBlock>
				)}
			</Scroller>
			<button type="button">After the list</button>
		</Box>
	);
};

export const TabThroughFocusableRows: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => <FocusableRowsStory onLoadBottom={args.loadMoreBottom} />,
	parameters: {
		docs: {
			description: {
				story:
					"The rows are buttons and the last one ends flush with the bottom. Tabbing through them scrolls the list down, which calls `loadMoreBottom` before the last row is reached; focus stays on the row while the page is appended, and the Tab after the last loaded row reaches the first new row.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		canvas.getByRole("button", { name: "Before the list" }).focus();
		// the scroll container, then each row, which is scrolled into view
		for (let i = 0; i < 21; i++) await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Item 20" })).toHaveFocus();
		await waitFor(() => expect(args.loadMoreBottom).toHaveBeenCalledTimes(1));
		await canvas.findByRole("button", { name: "Item 21" });
		await expect(canvas.getByRole("button", { name: "Item 20" })).toHaveFocus();
		await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Item 21" })).toHaveFocus();
	},
};

export const Issue3471Item11LoadsWhenTabbingPastTrailingContent: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => (
		<FocusableRowsStory onLoadBottom={args.loadMoreBottom} trailing="short" />
	),
	parameters: {
		docs: {
			description: {
				story:
					"The rows are buttons, followed by 200px without focusable elements, as a loader row, a footer or the empty days at the end of a schedule week. Tabbing to the last row does not scroll the list to its very bottom, but the next page is loaded before focus can leave the list, and the next Tab reaches the first new row.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		canvas.getByRole("button", { name: "Before the list" }).focus();
		for (let i = 0; i < 21; i++) await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Item 20" })).toHaveFocus();
		// reaching the last loaded row by keyboard loads the next page before focus can leave
		await waitFor(() => expect(args.loadMoreBottom).toHaveBeenCalledTimes(1));
		await canvas.findByRole("button", { name: "Item 21" });
		await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Item 21" })).toHaveFocus();
	},
};

export const Issue3471Item11LoadsWhenTabbingPastTallTrailingContent: Story = {
	args: { loadMoreBottom: fn() },
	render: (args) => (
		<FocusableRowsStory onLoadBottom={args.loadMoreBottom} trailing="tall" />
	),
	parameters: {
		docs: {
			description: {
				story:
					"The rows are buttons, followed by 400px without focusable elements, more than the default `threshold` of 250px. Tabbing to the last row leaves more than the threshold below the view, so scrolling does not load; focus on the last row the keyboard reaches does, and the next Tab reaches the first new row instead of leaving the list.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = canvas.getByRole("region", { name: "Items" });
		canvas.getByRole("button", { name: "Before the list" }).focus();
		for (let i = 0; i < 21; i++) await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Item 20" })).toHaveFocus();
		// precondition: scrolling did not load, and the list is scrolled as far as
		// it gets, with more than the threshold left below the view
		await expect(canvas.queryByRole("button", { name: "Item 21" })).toBeNull();
		await expect(
			scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop,
		).toBeGreaterThan(250);
		await waitFor(() => expect(args.loadMoreBottom).toHaveBeenCalledTimes(1));
		await canvas.findByRole("button", { name: "Item 21" });
		await expect(canvas.getByRole("button", { name: "Item 20" })).toHaveFocus();
		await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Item 21" })).toHaveFocus();
	},
};

// ─── Focusable rows after content without focusable elements ──────────────────

/**
 * Content without focusable elements before the rows of a page, e.g. a
 * schedule week's heading and the empty days before its first entry
 */
const LeadingBlock = styled("div")({
	height: 200,
	padding: 8,
	boxSizing: "border-box",
	fontSize: 14,
});

/** The rows of a page of `PagedRowsStory` */
const ROWS_PER_PAGE = 10;

/**
 * Pages of 10 rows that are buttons of 30px, each after 200px of content
 * without focusable elements, in a 300px container between two buttons. It
 * starts with pages 10 and 11 (Row 100 to Row 119); loadMoreTop adds the page
 * before the first one.
 */
const PagedRowsStory = ({ onLoadTop }: { onLoadTop?: () => void }) => {
	const [firstPage, setFirstPage] = useState(10);

	const loadMoreTop = useCallback(() => {
		onLoadTop?.();
		setFirstPage((prev) => prev - 1);
	}, [onLoadTop]);

	return (
		<Box sx={{ width: 300 }}>
			<button type="button">Before the list</button>
			<Scroller role="region" aria-label="Rows" loadMoreTop={loadMoreTop}>
				{makeItems(firstPage, 12 - firstPage).map((page) => (
					<React.Fragment key={page}>
						<LeadingBlock>
							Page {page}: content without focusable elements
						</LeadingBlock>
						{makeItems(page * ROWS_PER_PAGE, ROWS_PER_PAGE).map((n) => (
							<RowButton key={n} type="button">
								Row {n}
							</RowButton>
						))}
					</React.Fragment>
				))}
			</Scroller>
			<button type="button">After the list</button>
		</Box>
	);
};

export const Issue3471Item14LoadsWhenShiftTabbingPastLeadingContent: Story = {
	args: { loadMoreTop: fn() },
	render: (args) => <PagedRowsStory onLoadTop={args.loadMoreTop} />,
	parameters: {
		docs: {
			description: {
				story:
					"Each page starts with 200px without focusable elements, as a schedule week starts with its heading and the empty days before its first entry, followed by 10 rows that are buttons. The list opens at Row 100 with the page of Row 90 loaded above it. Shift+Tab from below up to Row 90, the first loaded row, scrolls it into view but not to the very top, so scrolling does not load; focus on the first row the keyboard reaches does, and the next Shift+Tab reaches the last row of the new page instead of leaving the list.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const scroller = canvas.getByRole("region", { name: "Rows" });
		// the list opens at Row 100, with the page above it loaded
		await canvas.findByRole("button", { name: "Row 90" });
		await expect(args.loadMoreTop).toHaveBeenCalledTimes(1);

		canvas.getByRole("button", { name: "After the list" }).focus();
		// up through each row, which is scrolled into view, to Row 90
		for (let i = 0; i < 30; i++) await userEvent.tab({ shift: true });
		const firstRow = canvas.getByRole("button", { name: "Row 90" });
		await expect(firstRow).toHaveFocus();
		// precondition: the list is not at its very top, the content of its first
		// page is above Row 90
		await expect(scroller.scrollTop).toBeGreaterThanOrEqual(1);
		// reaching the first loaded row by keyboard loads the page above it before
		// focus can leave the list
		await waitFor(() => expect(args.loadMoreTop).toHaveBeenCalledTimes(2));
		await canvas.findByRole("button", { name: "Row 89" });
		await expect(firstRow).toHaveFocus();
		// the new page is added out of view, the focused row stays in view
		const row = firstRow.getBoundingClientRect();
		const view = getViewEdges(scroller);
		await expect(row.top).toBeGreaterThanOrEqual(view.top);
		await expect(row.bottom).toBeLessThanOrEqual(view.bottom);
		await userEvent.tab({ shift: true });
		await expect(canvas.getByRole("button", { name: "Row 89" })).toHaveFocus();
	},
};
