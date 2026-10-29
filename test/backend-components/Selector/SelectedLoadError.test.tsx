import {
	describe,
	it,
	expect,
	afterEach,
	beforeAll,
	beforeEach,
	vi,
} from "vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Framework } from "../../../src/framework";
import ccI18n from "../../../src/i18n";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "../../../src/backend-components/Selector/BackendMultiSelect";
import BackendSingleSelect, {
	BackendSingleSelectProps,
} from "../../../src/backend-components/Selector/BackendSingleSelect";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelUnknown,
	ModelVisibilityEdit,
	ModelVisibilityHidden,
} from "../../../src/backend-integration";
import BackendError from "../../../src/backend-integration/Connector/BackendError";
import Connector from "../../../src/backend-integration/Connector/Connector";
import ModelDataStore from "../../../src/backend-integration/Store";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { MultiSelectorData } from "../../../src/standalone";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(async () => {
	// the labels a test compares against are the library's translations
	await ccI18n.init();
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
});

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
	cleanup();
	ModelDataStore.clear();
	vi.restoreAllMocks();
});

const RECORDS = [{ id: "1", name: "Alice" }];

/**
 * A backend which has Alice and answers every other read with the given error
 */
class FailingConnector extends MockConnector {
	private readonly error: Error;

	constructor(error: Error) {
		super(RECORDS);
		this.error = error;
	}

	read(id: string) {
		if (id === "1") return super.read(id);
		throw this.error;
	}
}

let modelCounter = 0;
const makeModel = (connector: Connector): ModelUnknown =>
	new Model(
		// a model of its own per test, so no record stays cached from the last one
		`selected-load-error-${++modelCounter}`,
		{
			id: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "ID",
				visibility: {
					overview: ModelVisibilityHidden,
					edit: ModelVisibilityHidden,
					create: ModelVisibilityHidden,
				},
				customData: null,
			},
			name: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Name",
				visibility: {
					overview: ModelVisibilityEdit,
					edit: ModelVisibilityEdit,
					create: ModelVisibilityEdit,
				},
				customData: null,
			},
		},
		connector,
	);

const toSelectorData = (
	record: Record<string, unknown>,
): MultiSelectorData => ({
	value: record.id as string,
	label: record.name as string,
});

const notFound = () =>
	new BackendError(
		"Record not found",
		"record_not_found_error",
		undefined,
		new Response(null, { status: 404 }),
	);

const serverError = () =>
	new BackendError(
		"Internal server error",
		undefined,
		undefined,
		new Response(null, { status: 500 }),
	);

const renderMulti = (
	props: Partial<BackendMultiSelectProps<ModelUnknown, MultiSelectorData>> &
		Pick<BackendMultiSelectProps<ModelUnknown, MultiSelectorData>, "model">,
) => {
	const onSelect = vi.fn();
	render(
		<Framework>
			<BackendMultiSelect
				modelToSelectorData={toSelectorData}
				selected={["1", "2"]}
				onSelect={onSelect}
				{...props}
			/>
		</Framework>,
	);
	return { onSelect };
};

const renderSingle = (
	props: Partial<BackendSingleSelectProps<ModelUnknown>> &
		Pick<BackendSingleSelectProps<ModelUnknown>, "model">,
) => {
	const onSelect = vi.fn();
	render(
		<Framework>
			<BackendSingleSelect
				modelToSelectorData={toSelectorData}
				selected={"2"}
				onSelect={onSelect}
				{...props}
			/>
		</Framework>,
	);
	return { onSelect };
};

describe("BackendMultiSelect, a selected record that fails to load", () => {
	it("is an unknown entry if the batch did not return it", async () => {
		renderMulti({ model: makeModel(new MockConnector(RECORDS)) });

		expect(await screen.findByText("Unknown entry")).toBeInTheDocument();
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.queryByText(/RequestBatching/)).not.toBeInTheDocument();
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("record 2"),
			expect.objectContaining({ name: "RequestBatchingError" }),
		);
	});

	it("is an unknown entry if the backend answers 404", async () => {
		renderMulti({
			model: makeModel(new FailingConnector(notFound())),
			disableRequestBatching: true,
		});

		expect(await screen.findByText("Unknown entry")).toBeInTheDocument();
		expect(screen.queryByText("Record not found")).not.toBeInTheDocument();
	});

	it("says loading failed for any other error", async () => {
		renderMulti({
			model: makeModel(new FailingConnector(serverError())),
			disableRequestBatching: true,
		});

		expect(
			await screen.findByText("Error while fetching data"),
		).toBeInTheDocument();
		expect(screen.queryByText("Internal server error")).not.toBeInTheDocument();
	});

	it("can be removed", async () => {
		const { onSelect } = renderMulti({
			model: makeModel(new MockConnector(RECORDS)),
		});

		await userEvent.click(
			await screen.findByRole("button", { name: "Remove Unknown entry" }),
		);

		expect(onSelect).toHaveBeenCalledWith(
			["1"],
			[{ value: "1", label: "Alice" }],
		);
	});

	it("takes the owner's label", async () => {
		const onLoadError = vi.fn(() => "Own label");
		renderMulti({
			model: makeModel(new MockConnector(RECORDS)),
			onLoadError,
		});

		expect(await screen.findByText("Own label")).toBeInTheDocument();
		expect(onLoadError).toHaveBeenCalledWith(
			expect.objectContaining({ name: "RequestBatchingError" }),
		);
	});

	it("is dropped if the owner says so", async () => {
		const { onSelect } = renderMulti({
			model: makeModel(new MockConnector(RECORDS)),
			onLoadError: () => null,
		});

		await waitFor(() =>
			expect(onSelect).toHaveBeenCalledWith(
				["1"],
				[{ value: "1", label: "Alice" }],
			),
		);
		expect(screen.queryByText("Unknown entry")).not.toBeInTheDocument();
	});
});

describe("BackendSingleSelect, a selected record that fails to load", () => {
	it("is an unknown entry if the batch did not return it", async () => {
		renderSingle({ model: makeModel(new MockConnector(RECORDS)) });

		expect(
			await screen.findByDisplayValue("Unknown entry"),
		).toBeInTheDocument();
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("record 2"),
			expect.objectContaining({ name: "RequestBatchingError" }),
		);
	});

	it("is an unknown entry if the backend answers 404", async () => {
		renderSingle({
			model: makeModel(new FailingConnector(notFound())),
			disableRequestBatching: true,
		});

		expect(
			await screen.findByDisplayValue("Unknown entry"),
		).toBeInTheDocument();
	});

	it("says loading failed for any other error", async () => {
		renderSingle({
			model: makeModel(new FailingConnector(serverError())),
			disableRequestBatching: true,
		});

		expect(
			await screen.findByDisplayValue("Error while fetching data"),
		).toBeInTheDocument();
	});

	it("is unselected if the owner says so", async () => {
		const { onSelect } = renderSingle({
			model: makeModel(new MockConnector(RECORDS)),
			onLoadError: () => null,
		});

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith(null));
	});
});
