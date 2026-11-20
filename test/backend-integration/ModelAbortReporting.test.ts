import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelVisibilityEdit,
} from "../../src/backend-integration";
import MockConnector from "../../src/stories/test-utils/MockConnector";

// Model reports unexpected errors through the optional @sentry/react import; mocking it
// makes those reports observable
const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }));
vi.mock("@sentry/react", () => ({ captureException }));

const RECORDS = [
	{ id: "1", title: "One" },
	{ id: "2", title: "Two" },
	{ id: "3", title: "Three" },
];

/**
 * A connector whose index rejects with the given error, after calling beforeReject if given
 */
class FailingConnector extends MockConnector {
	private readonly error: Error;
	private readonly beforeReject: (() => void) | undefined;

	constructor(error: Error, beforeReject?: () => void) {
		super(RECORDS);
		this.error = error;
		this.beforeReject = beforeReject;
	}

	index(): Promise<never> {
		this.beforeReject?.();
		return Promise.reject(this.error);
	}
}

const createModel = (connector: MockConnector) =>
	new Model(
		"abort-reporting-" + Math.random().toString(16),
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

/**
 * Model takes captureException from the promise of its optional @sentry/react import, which
 * resolves after a first call could run. A report that must happen proves the wiring first,
 * so the tests that expect no report can't pass because Sentry was not loaded yet.
 */
beforeAll(async () => {
	await expect(
		createModel(new FailingConnector(new Error("warm-up"))).index({
			page: 1,
			rows: 10,
		}),
	).rejects.toThrow("warm-up");
	await vi.waitFor(() => expect(captureException).toHaveBeenCalled());
});

beforeEach(() => {
	captureException.mockClear();
});

describe("Model error reporting", () => {
	it("[ISSUE-3506-ITEM-19] reports an unexpected index error to Sentry", async () => {
		const error = new TypeError("Unexpected response");
		const model = createModel(new FailingConnector(error));

		await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
		expect(captureException).toHaveBeenCalledWith(error);
	});

	it("[ISSUE-3506-ITEM-19] doesn't report an index request whose signal was already aborted, and the abort reaches the caller", async () => {
		const controller = new AbortController();
		controller.abort();
		const error = controller.signal.reason as Error;
		const model = createModel(new FailingConnector(error));

		await expect(
			model.index({ page: 1, rows: 10, signal: controller.signal }),
		).rejects.toBe(error);
		expect(captureException).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] doesn't report an index request aborted while it was loading, whatever it then rejects with", async () => {
		const controller = new AbortController();
		const error = new TypeError("socket closed");
		const model = createModel(
			new FailingConnector(error, () => controller.abort()),
		);

		await expect(
			model.index({ page: 1, rows: 10, signal: controller.signal }),
		).rejects.toBe(error);
		expect(captureException).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] doesn't report an AbortError of a request that got no signal, and the abort reaches the caller", async () => {
		// an AbortError as fetch rejects with it; the signal is not passed on
		const controller = new AbortController();
		controller.abort();
		const error = controller.signal.reason as Error;
		const model = createModel(new FailingConnector(error));

		await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
		expect(captureException).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] doesn't report a fetchAll that was aborted", async () => {
		const controller = new AbortController();
		controller.abort();
		const error = controller.signal.reason as Error;
		const model = createModel(new FailingConnector(error));

		await expect(model.fetchAll({ signal: controller.signal })).rejects.toBe(
			error,
		);
		expect(captureException).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] reports an unexpected fetchAll error to Sentry", async () => {
		const error = new TypeError("Unexpected response");
		const model = createModel(new FailingConnector(error));

		await expect(model.fetchAll({})).rejects.toBe(error);
		expect(captureException).toHaveBeenCalledWith(error);
	});
});
