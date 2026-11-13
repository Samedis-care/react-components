/**
 * CrudMultiSelect outside a form, read-only and with blocked writes. The searched model is
 * TestModel; a join row is { id, source_id }, its entry is labelled "L<source_id>". The
 * connector logs every write.
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CrudMultiSelect, {
	useCrudSelectContext,
} from "../../../src/backend-components/Selector/CrudMultiSelect";
import type { CrudSelectDispatch } from "../../../src/backend-components/Selector/useCrudSelect";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import type { Connector, ModelUnknown } from "../../../src/backend-integration";
import { Framework } from "../../../src/framework";
import createTestModel from "../../../src/stories/test-utils/TestModel";
import type { MultiSelectorData } from "../../../src/standalone";
import { settle, setupFormTests } from "../Form/formFixture";

setupFormTests();

interface JoinData extends MultiSelectorData {
	source_id: string;
}

/**
 * A join collection with the row j1 (source 1); every write is logged
 */
const makeBackend = () => {
	const calls: string[] = [];
	const rows = [{ id: "j1", source_id: "1" }];
	const connector = {
		index: vi.fn(() =>
			Promise.resolve([rows, { totalRows: 1, filteredRows: 1 }]),
		),
		create: vi.fn((data: Record<string, unknown>) => {
			calls.push("create:" + String(data.source_id));
			return Promise.resolve([{ ...data, id: "j2" }, {}]);
		}),
		update: vi.fn(),
		delete: vi.fn((id: string) => {
			calls.push("delete:" + id);
			return Promise.resolve();
		}),
	} as unknown as Connector;
	return { connector, calls };
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

const ErrorSink = (props: ErrorComponentProps) => (
	<div role={"alert"}>{props.error.message}</div>
);

const model = createTestModel();

/** what the select context says, as an end adornment sees it */
const ctxSink: { disabled?: boolean } = {};
const CaptureCtx = () => {
	ctxSink.disabled = useCrudSelectContext().disabled;
	return null;
};

const mountSelect = (
	connector: Connector,
	props: { readOnly?: boolean; blockWrites?: boolean },
) => {
	const ref = React.createRef<CrudSelectDispatch<JoinData>>();
	render(
		<Framework>
			<CrudMultiSelect<ModelUnknown, JoinData>
				ref={ref}
				label={"Members"}
				model={model}
				connector={connector}
				errorComponent={ErrorSink}
				serialize={serialize}
				deserialize={deserialize}
				deserializeModel={deserializeModel}
				getIdOfData={getIdOfData}
				endAdornment={<CaptureCtx />}
				searchDebounceTime={0}
				{...props}
			/>
		</Framework>,
	);
	return ref;
};

/** picks source 2 through the ref; resolves with the rejection, or null */
const pickThroughRef = async (
	ref: React.RefObject<CrudSelectDispatch<JoinData> | null>,
) => {
	let outcome: unknown = undefined;
	let pending: Promise<void> | undefined;
	act(() => {
		pending = ref
			.current!.addToSelection({
				value: "to-create-2",
				label: "L2",
				source_id: "2",
			})
			.then(
				() => {
					outcome = null;
				},
				(e: unknown) => {
					outcome = e;
				},
			);
	});
	await act(async () => {
		await pending;
	});
	await settle();
	return outcome;
};

describe("CrudMultiSelect", () => {
	it("[ISSUE-3505-ITEM-16] read-only: a focusable read-only search field, no remove buttons, and nothing is written", async () => {
		const be = makeBackend();
		const ref = mountSelect(be.connector, { readOnly: true });
		expect(await screen.findByText("L1")).toBeInTheDocument();
		await settle();
		const input = screen.getByRole("combobox", { name: "Members" });

		expect(input).not.toBeDisabled();
		expect(input).toHaveAttribute("readonly");
		expect(screen.queryByRole("button", { name: "Remove L1" })).toBeNull();
		expect(ctxSink.disabled).toBe(true);
		expect(await pickThroughRef(ref)).toBeInstanceOf(Error);
		expect(be.calls).toEqual([]);
		expect(screen.queryByText("L2")).toBeNull();
	});

	it("[ISSUE-3505-ITEM-16] blockWrites: the field stays as it is, but a removal or a pick writes nothing", async () => {
		const be = makeBackend();
		const ref = mountSelect(be.connector, { blockWrites: true });
		expect(await screen.findByText("L1")).toBeInTheDocument();
		await settle();
		const input = screen.getByRole("combobox", { name: "Members" });

		expect(input).toBeEnabled();
		expect(input).not.toHaveAttribute("readonly");
		expect(ctxSink.disabled).toBe(true);
		fireEvent.click(screen.getByRole("button", { name: "Remove L1" }));
		await settle();
		expect(await pickThroughRef(ref)).toBeInstanceOf(Error);
		expect(be.calls).toEqual([]);
		expect(screen.getByText("L1")).toBeInTheDocument();
		expect(screen.queryByText("L2")).toBeNull();
	});
});
