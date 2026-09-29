import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import { useBackendDataGridDeleteHandler } from "../../../src/backend-components/DataGrid";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelVisibilityEdit,
} from "../../../src/backend-integration";
import BackendError from "../../../src/backend-integration/Connector/BackendError";
import MockConnector from "../../../src/stories/test-utils/MockConnector";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
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

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const FILTER = { quickFilter: "", additionalFilters: {}, fieldFilter: {} };

const createModel = () => {
	const connector = new MockConnector([
		{ id: "1", title: "One" },
		{ id: "2", title: "Two" },
	]);
	const model = new Model(
		"delete-handler-" + Math.random().toString(16),
		{
			title: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Title",
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
	return { model, connector };
};

const renderDeleteHandler = (
	props: Partial<Parameters<typeof useBackendDataGridDeleteHandler>[0]>,
) => {
	const { model, connector } = createModel();
	const refreshGrid = vi.fn();
	const { result } = renderHook(
		() =>
			useBackendDataGridDeleteHandler(
				{
					model,
					enableDelete: true,
					// skip the confirmation dialog
					customDeleteConfirm: () => {},
					...props,
				},
				refreshGrid,
			),
		{
			wrapper: ({ children }: { children: React.ReactNode }) => (
				<Framework>{children}</Framework>
			),
		},
	);
	return { handleDelete: result.current!, connector, refreshGrid };
};

describe("useBackendDataGridDeleteHandler onDeleteSettled", () => {
	it("is called after a delete, once the grid refreshed", async () => {
		const onDeleteSettled = vi.fn();
		const { handleDelete, connector, refreshGrid } = renderDeleteHandler({
			onDeleteSettled,
		});
		const deleteMultiple = vi.spyOn(connector, "deleteMultiple");

		await act(() => handleDelete(false, ["1", "2"], FILTER));

		expect(deleteMultiple).toHaveBeenCalledWith(["1", "2"], expect.anything());
		expect(onDeleteSettled).toHaveBeenCalledExactlyOnceWith(
			false,
			["1", "2"],
			FILTER,
			undefined,
		);
		expect(refreshGrid.mock.invocationCallOrder[0]).toBeLessThan(
			onDeleteSettled.mock.invocationCallOrder[0],
		);
	});

	it("is called with the error of a failed delete, before the error is shown", async () => {
		const onDeleteSettled = vi.fn();
		const customDeleteErrorHandler = vi.fn();
		const { handleDelete, connector } = renderDeleteHandler({
			onDeleteSettled,
			customDeleteErrorHandler,
		});
		const error = new BackendError("conflict", "conflict");
		vi.spyOn(connector, "deleteMultiple").mockRejectedValue(error);

		await act(() => handleDelete(false, ["1"], FILTER));

		expect(onDeleteSettled).toHaveBeenCalledExactlyOnceWith(
			false,
			["1"],
			FILTER,
			error,
		);
		expect(customDeleteErrorHandler).toHaveBeenCalledWith(error);
		expect(onDeleteSettled.mock.invocationCallOrder[0]).toBeLessThan(
			customDeleteErrorHandler.mock.invocationCallOrder[0],
		);
	});

	it("isn't called when the user cancels the confirmation", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const onDeleteSettled = vi.fn();
		const { handleDelete, connector } = renderDeleteHandler({
			onDeleteSettled,
			customDeleteConfirm: () => {
				throw new Error("cancelled");
			},
		});
		const deleteMultiple = vi.spyOn(connector, "deleteMultiple");

		await act(() => handleDelete(false, ["1"], FILTER));

		expect(deleteMultiple).not.toHaveBeenCalled();
		expect(onDeleteSettled).not.toHaveBeenCalled();
	});

	it("doesn't turn an error thrown by the callback into a failed delete", async () => {
		const customDeleteErrorHandler = vi.fn();
		const { handleDelete } = renderDeleteHandler({
			onDeleteSettled: () => {
				throw new Error("callback bug");
			},
			customDeleteErrorHandler,
		});

		await expect(act(() => handleDelete(false, ["1"], FILTER))).rejects.toThrow(
			"callback bug",
		);
		expect(customDeleteErrorHandler).not.toHaveBeenCalled();
	});
});
