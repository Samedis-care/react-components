/**
 * BackendSingleSelect over a model of people (backendSelectorFixture): the search request.
 */
// first: BackendSingleSelect cannot be the first components-care module imported (import cycle)
import "../../../src/standalone";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import BackendSingleSelect, {
	BackendSingleSelectProps,
} from "../../../src/backend-components/Selector/BackendSingleSelect";
import type { ModelUnknown } from "../../../src/backend-integration";
import { setupFormTests } from "../Form/formFixture";
import {
	conv,
	openList,
	peopleModel,
	typeText,
} from "./backendSelectorFixture";

setupFormTests();

type Props = Partial<BackendSingleSelectProps<ModelUnknown>> & {
	model: ModelUnknown;
};

const field = (props: Props) => (
	<BackendSingleSelect
		modelToSelectorData={conv}
		label={"Person"}
		searchDebounceTime={0}
		selected={null}
		{...props}
	/>
);

const ui = (props: Props) => <Framework>{field(props)}</Framework>;

describe("BackendSingleSelect bugs (debounced search)", () => {
	it("[ISSUE-3510-ITEM-19] a parent render between two keystrokes does not send the first search", async () => {
		vi.useFakeTimers();
		try {
			const { model, connector } = peopleModel();
			let bump!: () => void;
			const InlineProps = () => {
				const [, setCount] = useState(0);
				bump = () => setCount((count) => count + 1);
				// written inline, as apps do: a new array and a new function per render
				return field({
					model,
					searchDebounceTime: 300,
					sort: [{ field: "name", direction: 1 }],
					modelToSelectorData: (record) => conv(record),
				});
			};
			render(
				<Framework>
					<InlineProps />
				</Framework>,
			);
			await act(() => vi.advanceTimersByTimeAsync(1000));
			await openList();
			await act(() => vi.advanceTimersByTimeAsync(1000));
			connector.log.length = 0;
			await typeText("A");
			act(() => bump());
			await act(() => vi.advanceTimersByTimeAsync(100));
			await typeText("Al");
			await act(() => vi.advanceTimersByTimeAsync(1000));
			expect(connector.log).toEqual(["index:Al"]);
		} finally {
			vi.useRealTimers();
		}
	});

	it("[ISSUE-3510-ITEM-19] a search still waiting for its debounce is not sent after unmount", async () => {
		vi.useFakeTimers();
		try {
			const { model, connector } = peopleModel();
			const { unmount } = render(ui({ model, searchDebounceTime: 300 }));
			await act(() => vi.advanceTimersByTimeAsync(1000));
			await openList();
			await act(() => vi.advanceTimersByTimeAsync(1000));
			connector.log.length = 0;
			await typeText("A");
			unmount();
			await act(() => vi.advanceTimersByTimeAsync(1000));
			expect(connector.log).toEqual([]);
		} finally {
			vi.useRealTimers();
		}
	});
});
