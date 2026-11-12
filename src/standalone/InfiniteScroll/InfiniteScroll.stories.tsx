import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Paper, Typography, styled } from "@mui/material";
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
 * The scroll container needs a bounded height and overflow: auto. Styling it
 * with styled() still requires the className prop, hence className="".
 */
const Scroller = styled(InfiniteScroll)({
	height: 300,
	width: 300,
	overflow: "auto",
});

const Row = styled("div")({
	height: 30,
	boxSizing: "border-box",
	padding: "0 8px",
	lineHeight: "30px",
	borderBottom: "1px solid #eee",
	fontSize: 14,
});

const renderItems = (items: number[]) =>
	items.map((n) => <Row key={n}>Item {n}</Row>);

/** The scroll container is the parent of the rows */
const getScroller = (canvasElement: HTMLElement, firstRowText: string) => {
	const scroller = within(canvasElement).getByText(firstRowText).parentElement;
	if (!scroller) throw new Error("scroll container not found");
	return scroller;
};

/** Has the fill check stopped, i.e. does the content overflow by more than 24px? */
const isFilled = (scroller: HTMLElement) =>
	scroller.scrollHeight > scroller.clientHeight + 24;

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
			<Scroller className="" loadMoreBottom={loadMoreBottom}>
				{renderItems(items)}
			</Scroller>
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

const InjectContainerStyles = () => (
	<style>{`.${HIDDEN_PANEL_CLASS} { height: 300px; overflow: auto; width: 300px; }
.${MAX_HEIGHT_CLASS} { max-height: 300px; overflow: auto; width: 300px; }`}</style>
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
