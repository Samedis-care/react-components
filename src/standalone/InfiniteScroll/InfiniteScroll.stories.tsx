import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeItems = (start: number, count: number) =>
	Array.from({ length: count }, (_, i) => start + i);

// ─── Stories ──────────────────────────────────────────────────────────────────

// Simpler approach: use a global style injected via a <style> tag in the story.
// This avoids the need to capture a class name at runtime.

const SCROLL_CLASS = "story-infinite-scroll";

const InjectScrollStyle = () => (
	<style>{`.${SCROLL_CLASS} { height: 300px; overflow: auto; width: 300px; }`}</style>
);

const BottomScrollStorySimple = () => {
	const [items, setItems] = useState<number[]>(() => makeItems(1, 20));

	const loadMoreBottom = useCallback(() => {
		setItems((prev) => [...prev, ...makeItems(prev.length + 1, 10)]);
	}, []);

	return (
		<Box sx={{ width: 300 }}>
			<InjectScrollStyle />
			<Typography variant="caption" sx={{ display: "block", mb: 1 }}>
				Scroll to the bottom to load more items. Total: {items.length}
			</Typography>
			<InfiniteScroll className={SCROLL_CLASS} loadMoreBottom={loadMoreBottom}>
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

export const LoadMoreOnBottom: StoryObj<typeof InfiniteScroll> = {
	render: () => <BottomScrollStorySimple />,
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

/**
 * Any axe violation fails these stories, except `scrollable-region-focusable`:
 * the rows contain nothing focusable, and the scroll container is not
 * focusable yet (ISSUE-3471-ITEM-9).
 */
const A11Y_EXCEPT_SCROLLER_FOCUS = {
	test: "error",
	config: { rules: [{ id: "scrollable-region-focusable", enabled: false }] },
};

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
		a11y: A11Y_EXCEPT_SCROLLER_FOCUS,
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
		a11y: A11Y_EXCEPT_SCROLLER_FOCUS,
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
