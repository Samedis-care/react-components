/**
 * The multi selectors over a model of people (backendSelectorFixture): BackendMultiSelect
 * and its display cache useSelectedCache (shared with BackendMultipleSelect and
 * BackendMultiSelectWithTags): how the selected ids are resolved and listed.
 */
// first: BackendMultipleSelect cannot be the first components-care module imported (import cycle)
import "../../../src/standalone";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "../../../src/backend-components/Selector/BackendMultiSelect";
import BackendMultipleSelect from "../../../src/backend-components/Selector/BackendMultipleSelect";
import type { ModelUnknown } from "../../../src/backend-integration";
import type { MultiSelectorData } from "../../../src/standalone";
import { setupFormTests } from "../Form/formFixture";
import {
	combobox,
	conv,
	peopleModel,
	removeButtons,
	SelectorTestConnector,
} from "./backendSelectorFixture";

// jsdom has "ontouchstart" on window, so TextFieldWithHelp would add its touch Clear
// button next to Autocomplete's own one
vi.mock("../../../src/utils/isTouchDevice", () => ({ default: () => false }));

setupFormTests();

type Props = Partial<
	BackendMultiSelectProps<ModelUnknown, MultiSelectorData>
> & {
	model: ModelUnknown;
};

const field = (props: Props) => (
	<BackendMultiSelect<ModelUnknown, MultiSelectorData>
		modelToSelectorData={conv}
		label={"People"}
		searchDebounceTime={0}
		selected={[]}
		{...props}
	/>
);

const ui = (props: Props) => <Framework>{field(props)}</Framework>;

const lookups = (connector: SelectorTestConnector) =>
	connector.log.filter(
		(entry) => entry.startsWith("read:") || entry.includes(":ids="),
	);

// ---------------------------------------------------------------------------
// Bugs (each test asserts the correct behavior and fails until it is fixed)
// ---------------------------------------------------------------------------

describe("BackendMultiSelect bugs", () => {
	it("[ISSUE-3510-ITEM-6] an id that matches an additionalOptions entry is listed from that entry, without a lookup", async () => {
		const { model, connector } = peopleModel();
		render(
			ui({
				model,
				selected: ["none", "2"],
				additionalOptions: [{ value: "none", label: "No department" }],
			}),
		);
		await waitFor(() => expect(removeButtons()).toContain("Remove Bob"));
		expect(removeButtons()).toEqual(["Remove No department", "Remove Bob"]);
		expect(lookups(connector)).toEqual(["index::ids=2"]);
	});

	it("[ISSUE-3510-ITEM-6] an additionalOptions id is not dropped by onLoadError when the field mounts", async () => {
		const { model } = peopleModel();
		const onSelect = vi.fn();
		render(
			ui({
				model,
				selected: ["none", "2"],
				additionalOptions: [{ value: "none", label: "No department" }],
				onLoadError: () => null,
				onSelect,
			}),
		);
		await waitFor(() => expect(removeButtons()).toContain("Remove Bob"));
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("[ISSUE-3510-ITEM-6] a drop by onLoadError keeps an additionalOptions id and reports it with its entry", async () => {
		const { model, connector } = peopleModel();
		const onSelect = vi.fn();
		render(
			ui({
				model,
				selected: ["none", "9"],
				additionalOptions: [{ value: "none", label: "No department" }],
				onLoadError: () => null,
				onSelect,
				disableRequestBatching: true,
			}),
		);
		await waitFor(() => expect(onSelect).toHaveBeenCalled());
		expect(onSelect.mock.calls).toEqual([
			[["none"], [{ value: "none", label: "No department" }]],
		]);
		expect(lookups(connector)).toEqual(["read:9"]);
	});

	it("[ISSUE-3510-ITEM-6] BackendMultipleSelect shows an additionalOptions id from that entry, without a lookup", async () => {
		const { model, connector } = peopleModel();
		render(
			<Framework>
				<BackendMultipleSelect<ModelUnknown, MultiSelectorData>
					model={model}
					modelToSelectorData={conv}
					label={"Departments"}
					searchDebounceTime={0}
					selected={["none", "2"]}
					additionalOptions={[{ value: "none", label: "No department" }]}
				/>
			</Framework>,
		);
		await waitFor(() => expect(combobox().value).toMatch(/Bob/));
		expect(combobox().value.trim()).toBe("No department, Bob");
		expect(lookups(connector)).toEqual(["index::ids=2"]);
	});
});
