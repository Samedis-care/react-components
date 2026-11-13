/**
 * CrudMultiSelectWithGroups while it loads the join rows of its connector and after that
 * load failed. The searched model is TestModel (people "1".."8"); a join row is
 * { id, source_id }, its entry is labelled "L<source_id>".
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import CrudMultiSelectWithGroups from "../../../src/backend-components/Selector/CrudMultiSelectWithGroups";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import type { Connector, ModelUnknown } from "../../../src/backend-integration";
import type { ResponseMeta } from "../../../src/backend-integration/Connector/Connector";
import { Framework } from "../../../src/framework";
import createTestModel from "../../../src/stories/test-utils/TestModel";
import type {
	BaseSelectorData,
	MultiSelectorData,
} from "../../../src/standalone";
import { settle, setupFormTests } from "../Form/formFixture";
import {
	openList,
	pickOption,
	removeButtons,
	typeText,
} from "./backendSelectorFixture";

setupFormTests();

interface JoinData extends MultiSelectorData {
	source_id: string;
}

type Rows = Record<string, unknown>[];

/**
 * A join collection whose index answers once the test settles it
 */
const makeDeferredBackend = () => {
	let resolve: (result: [Rows, ResponseMeta]) => void = () => {};
	let reject: (error: Error) => void = () => {};
	const result = new Promise<[Rows, ResponseMeta]>(
		(resolveLoad, rejectLoad) => {
			resolve = resolveLoad;
			reject = rejectLoad;
		},
	);
	const connector = {
		index: vi.fn(() => result),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	} as unknown as Connector;
	return {
		connector,
		resolve: (rows: Rows) =>
			resolve([rows, { totalRows: rows.length, filteredRows: rows.length }]),
		reject: (error: Error) => reject(error),
	};
};

const serialize = (data: JoinData) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	source_id: data.source_id,
});
const deserialize = (record: Record<string, unknown>): JoinData => ({
	value: record.id as string,
	label: "L" + String(record.source_id),
	source_id: record.source_id as string,
});
const deserializeModel = (record: Record<string, unknown>) => ({
	label: String(record.first_name),
	source_id: record.id as string,
});
const getIdOfData = (data: JoinData) => data.source_id;
const convGroup = (record: Record<string, unknown>): BaseSelectorData => ({
	value: record.id as string,
	label: "Team of " + String(record.first_name),
});
const getGroupDataEntries = (): JoinData[] => [];

const ErrorSink = (props: ErrorComponentProps) => (
	<div role={"alert"}>{props.error.message}</div>
);

const model = createTestModel();

const mountGroups = (
	connector: Connector,
	deserializeRecord: (
		record: Record<string, unknown>,
	) => JoinData | Promise<JoinData> = deserialize,
) =>
	render(
		<Framework>
			<CrudMultiSelectWithGroups<
				ModelUnknown,
				ModelUnknown,
				BaseSelectorData,
				JoinData
			>
				title={"Members"}
				searchInputLabel={"Add a person"}
				groupModel={model}
				dataModel={model}
				connector={connector}
				errorComponent={ErrorSink}
				convGroup={convGroup}
				getGroupDataEntries={getGroupDataEntries}
				serialize={serialize}
				deserialize={deserializeRecord}
				deserializeModel={deserializeModel}
				getIdOfData={getIdOfData}
				groupSearchDebounceTime={0}
				dataSearchDebounceTime={0}
			/>
		</Framework>,
	);

/**
 * Whether the group search, the first field, is disabled. The person search below it
 * follows disabled only once MultiSelectWithoutGroup passes it on (ISSUE-3488-ITEM-6).
 */
const groupSearchDisabled = () =>
	(screen.getAllByRole("combobox")[0] as HTMLInputElement).disabled;

describe("CrudMultiSelectWithGroups", () => {
	it("[ISSUE-3505-ITEM-15] keeps its title and fields while it loads, locked and busy, and can be edited once loaded", async () => {
		const be = makeDeferredBackend();
		const { container } = mountGroups(be.connector);
		await settle();

		expect(screen.getByText("Members")).toBeInTheDocument();
		expect(groupSearchDisabled()).toBe(true);
		expect(screen.getByRole("status")).toHaveTextContent("Loading…");
		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();

		await act(async () => {
			be.resolve([{ id: "j1", source_id: "1" }]);
			await Promise.resolve();
		});
		await settle();

		expect(await screen.findByText("L1")).toBeInTheDocument();
		expect(groupSearchDisabled()).toBe(false);
		expect(screen.queryByRole("status")).toBeNull();
		expect(container.querySelector('[aria-busy="true"]')).toBeNull();
	});

	it("[ISSUE-3505-ITEM-15] keeps its title after a failed load and announces the failure in words that name it", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const be = makeDeferredBackend();
		mountGroups(be.connector);
		await settle();

		const failure = new Error("403 Forbidden: actors.reader missing");
		await act(async () => {
			be.reject(failure);
			await Promise.resolve();
		});
		await settle();

		expect(screen.getByText("Members")).toBeInTheDocument();
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Members could not be loaded.",
		);
		expect(screen.queryByText(/403 Forbidden/)).toBeNull();
		expect(warn).toHaveBeenCalledWith(expect.any(String), failure);
		expect(groupSearchDisabled()).toBe(true);
	});

	it("[ISSUE-3510-ITEM-20] a pick while a selected entry is still 'Loading…' neither updates nor removes its row", async () => {
		const create = vi.fn((data: Record<string, unknown>) =>
			Promise.resolve([{ ...data, id: "new-" + String(data.source_id) }, {}]),
		);
		const update = vi.fn();
		const remove = vi.fn();
		const connector = {
			index: vi.fn(() =>
				Promise.resolve([
					[{ id: "j1", source_id: "1" }],
					{ totalRows: 1, filteredRows: 1 },
				]),
			),
			create,
			update,
			delete: remove,
		} as unknown as Connector;
		// the selection loads at once, the field's entries of its rows wait
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		let calls = 0;
		const slowDeserialize = async (record: Record<string, unknown>) => {
			if (calls++ > 0) await held;
			return deserialize(record);
		};
		mountGroups(connector, slowDeserialize);
		await settle();
		expect(removeButtons()).toEqual(["Remove Loading…"]);

		const personInput = screen.getAllByRole<HTMLInputElement>("combobox")[1];
		await openList(personInput);
		await typeText("Bob", personInput);
		await pickOption("Bob");
		expect(create).toHaveBeenCalledWith({ id: undefined, source_id: "2" });
		expect(update).not.toHaveBeenCalled();
		expect(remove).not.toHaveBeenCalled();

		await act(async () => {
			release();
			await Promise.resolve();
		});
		await settle();
		// j1 is listed from its row once the field has built its entry
		expect(removeButtons()[0]).toBe("Remove L1");
	});
});
