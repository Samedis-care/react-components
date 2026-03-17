import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
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
