import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelFieldDefinition,
	ModelVisibilityEdit,
	PageVisibility,
} from "../../src/backend-integration";
import {
	CcErrorNames,
	configureErrorReporting,
	defaultErrorReporter,
	ErrorReportingConfig,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";
import MockConnector from "../../src/stories/test-utils/MockConnector";

// the default reporter sends reports to the optional @sentry/react import; mocking it makes
// what reaches Sentry observable
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

/**
 * A connector with an index2 of its own, which rejects with the given error, after calling
 * beforeReject if given
 */
class FailingIndex2Connector extends MockConnector {
	private readonly error: Error;
	private readonly beforeReject: (() => void) | undefined;

	constructor(error: Error, beforeReject?: () => void) {
		super(RECORDS);
		this.error = error;
		this.beforeReject = beforeReject;
	}

	index2(): Promise<never> {
		this.beforeReject?.();
		return Promise.reject(this.error);
	}
}

/**
 * The connectors index2 can fail through: the polyfill, which loads through the
 * connector's index, and a connector's own index2
 */
const INDEX2_CONNECTORS = [
	{
		connector: "the index2 polyfill",
		create: (error: Error, beforeReject?: () => void) =>
			new FailingConnector(error, beforeReject),
	},
	{
		connector: "a connector's own index2",
		create: (error: Error, beforeReject?: () => void) =>
			new FailingIndex2Connector(error, beforeReject),
	},
];

/**
 * A connector whose index rejects with the given value, which is not an Error
 */
class NonErrorRejectingConnector extends MockConnector {
	private readonly rejection: unknown;

	constructor(rejection: unknown) {
		super(RECORDS);
		this.rejection = rejection;
	}

	index(): Promise<never> {
		// the connector under test breaks this rule on purpose
		// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
		return Promise.reject(this.rejection);
	}
}

/**
 * A connector whose read throws the given error
 */
class FailingReadConnector extends MockConnector {
	private readonly error: Error;

	constructor(error: Error) {
		super(RECORDS);
		this.error = error;
	}

	read(): never {
		throw this.error;
	}
}

type TitleField = ModelFieldDefinition<string, "title", PageVisibility, null>;

const createModel = (connector: MockConnector, field?: Partial<TitleField>) =>
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
				...field,
			},
		},
		connector,
	);

const namedError = (name: string): Error => {
	const error = new Error(`test ${name}`);
	error.name = name;
	return error;
};

// Model reports through captureError, so its reports reach the configured reporter. The
// reporting policy (shouldReport) stays the default unless a test sets its own.
const report = vi.fn();
let configBefore: ErrorReportingConfig;

beforeEach(() => {
	configBefore = { ...getErrorReportingConfig() };
	report.mockClear();
	captureException.mockClear();
	configureErrorReporting({ report });
});

afterEach(() => {
	// the config is a module level singleton, so it leaks between tests
	configureErrorReporting(configBefore);
	vi.restoreAllMocks();
});

describe("Model error reporting", () => {
	it("[ISSUE-3506-ITEM-19] reports an unexpected index error to Sentry", async () => {
		const error = new TypeError("Unexpected response");
		const model = createModel(new FailingConnector(error));

		await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
		expect(report).toHaveBeenCalledWith(error, expect.anything());
	});

	it("[ISSUE-3506-ITEM-19] doesn't report an index request whose signal was already aborted, and the abort reaches the caller", async () => {
		const controller = new AbortController();
		controller.abort();
		const error = controller.signal.reason as Error;
		const model = createModel(new FailingConnector(error));

		await expect(
			model.index({ page: 1, rows: 10, signal: controller.signal }),
		).rejects.toBe(error);
		expect(report).not.toHaveBeenCalled();
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
		expect(report).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] doesn't report an AbortError of a request that got no signal, and the abort reaches the caller", async () => {
		// an AbortError as fetch rejects with it; the signal is not passed on
		const controller = new AbortController();
		controller.abort();
		const error = controller.signal.reason as Error;
		const model = createModel(new FailingConnector(error));

		await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
		expect(report).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] doesn't report a fetchAll request whose signal was already aborted, and the abort reaches the caller", async () => {
		const controller = new AbortController();
		controller.abort();
		const error = controller.signal.reason as Error;
		const model = createModel(new FailingConnector(error));

		await expect(model.fetchAll({ signal: controller.signal })).rejects.toBe(
			error,
		);
		expect(report).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] doesn't report a fetchAll request aborted while it was loading, whatever it then rejects with", async () => {
		const controller = new AbortController();
		const error = new TypeError("socket closed");
		const model = createModel(
			new FailingConnector(error, () => controller.abort()),
		);

		await expect(model.fetchAll({ signal: controller.signal })).rejects.toBe(
			error,
		);
		expect(report).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] doesn't report an AbortError of a get, and the abort reaches the caller", async () => {
		const controller = new AbortController();
		controller.abort();
		const error = controller.signal.reason as Error;
		const model = createModel(new FailingReadConnector(error));

		await expect(model.getRaw("1")).rejects.toBe(error);
		expect(report).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-19] reports an unexpected get error to Sentry", async () => {
		const error = new TypeError("Unexpected response");
		const model = createModel(new FailingReadConnector(error));

		await expect(model.getRaw("1")).rejects.toBe(error);
		expect(report).toHaveBeenCalledWith(error, expect.anything());
	});

	it("[ISSUE-3506-ITEM-19] reports an unexpected fetchAll error to Sentry", async () => {
		const error = new TypeError("Unexpected response");
		const model = createModel(new FailingConnector(error));

		await expect(model.fetchAll({})).rejects.toBe(error);
		expect(report).toHaveBeenCalledWith(error, expect.anything());
	});

	it.each([
		{
			source: "Model.index",
			connector: (error: Error) => new FailingConnector(error),
			load: (model: ReturnType<typeof createModel>) =>
				model.index({ page: 1, rows: 10 }),
		},
		{
			source: "Model.fetchAll",
			connector: (error: Error) => new FailingConnector(error),
			load: (model: ReturnType<typeof createModel>) => model.fetchAll({}),
		},
		{
			source: "Model.getRaw",
			connector: (error: Error) => new FailingReadConnector(error),
			load: (model: ReturnType<typeof createModel>) => model.getRaw("1"),
		},
	])(
		"[ISSUE-3506-ITEM-21] reports an unexpected error to the configured reporter, with the source $source and the model",
		async ({ source, connector, load }) => {
			const error = new TypeError("Unexpected response");
			const model = createModel(connector(error));

			await expect(load(model)).rejects.toBe(error);
			expect(report).toHaveBeenCalledExactlyOnceWith(
				error,
				expect.objectContaining({
					source,
					extra: { model: model.modelId },
				}),
			);
		},
	);

	it("[ISSUE-3506-ITEM-21] the configured shouldReport decides whether a Model error is reported", async () => {
		const shouldReport = vi.fn(() => false);
		configureErrorReporting({ shouldReport });
		const error = new TypeError("Unexpected response");
		const model = createModel(new FailingConnector(error));

		await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
		expect(shouldReport).toHaveBeenCalledExactlyOnceWith(
			error,
			expect.objectContaining({ source: "Model.index" }),
		);
		expect(report).not.toHaveBeenCalled();
	});

	it.each([CcErrorNames.BackendError, CcErrorNames.NetworkError, "AbortError"])(
		"[ISSUE-3506-ITEM-21] a load failing with an error named %s is not reported by the default policy, but is when the app's shouldReport reports it",
		async (name) => {
			const error = namedError(name);
			const model = createModel(new FailingConnector(error));

			await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
			expect(report).not.toHaveBeenCalled();

			configureErrorReporting({ shouldReport: () => true });
			await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
			expect(report).toHaveBeenCalledExactlyOnceWith(
				error,
				expect.objectContaining({ source: "Model.index" }),
			);
		},
	);

	it("[ISSUE-3506-ITEM-21] a request whose signal was aborted is not reported, even when the app's shouldReport reports everything", async () => {
		const shouldReport = vi.fn(() => true);
		configureErrorReporting({ shouldReport });
		const controller = new AbortController();
		const error = new TypeError("socket closed");
		const model = createModel(
			new FailingConnector(error, () => controller.abort()),
		);

		await expect(
			model.index({ page: 1, rows: 10, signal: controller.signal }),
		).rejects.toBe(error);
		expect(shouldReport).not.toHaveBeenCalled();
		expect(report).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-21] a load that rejects with a value that is not an Error is reported, and the value reaches the caller", async () => {
		const rejection = { status: 500 };
		const model = createModel(new NonErrorRejectingConnector(rejection));

		await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(rejection);
		expect(report).toHaveBeenCalledExactlyOnceWith(
			expect.any(Error),
			expect.objectContaining({ source: "Model.index" }),
		);
	});

	it.each([
		{
			where: "a field's validate",
			field: (error: Error): Partial<TitleField> => ({
				validate: () => {
					throw error;
				},
			}),
		},
		{
			where: "its type's validate",
			field: (error: Error): Partial<TitleField> => {
				const type = new ModelDataTypeStringRendererMUI();
				type.validate = () => {
					throw error;
				};
				return { type };
			},
		},
		{
			where: "its visibility callback",
			field: (error: Error): Partial<TitleField> => ({
				visibility: {
					overview: ModelVisibilityEdit,
					edit: () => {
						throw error;
					},
					create: ModelVisibilityEdit,
				},
			}),
		},
	])(
		"[ISSUE-3506-ITEM-21] an error thrown by $where while validating reaches the configured reporter, with its source, model and field",
		async ({ field }) => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			const error = new TypeError("validation broke");
			const model = createModel(new MockConnector(RECORDS), field(error));

			await model.validate({ title: "x" }, "edit");
			expect(report).toHaveBeenCalledExactlyOnceWith(
				error,
				expect.objectContaining({
					source: "Model.validate",
					extra: { model: model.modelId, field: "title" },
				}),
			);
		},
	);

	it("[ISSUE-3506-ITEM-21] with the default reporter, a Model error still reaches Sentry, with its source", async () => {
		configureErrorReporting({ report: defaultErrorReporter });
		const error = new TypeError("Unexpected response");
		const model = createModel(new FailingConnector(error));

		await expect(model.index({ page: 1, rows: 10 })).rejects.toBe(error);
		await vi.waitFor(() =>
			expect(captureException).toHaveBeenCalledExactlyOnceWith(error, {
				extra: { ccSource: "Model.index", model: model.modelId },
			}),
		);
	});

	it.each(INDEX2_CONNECTORS)(
		"[ISSUE-3506-ITEM-22] reports an unexpected index2 error of $connector once, with the source Model.index2 and the model",
		async ({ create }) => {
			const error = new TypeError("Unexpected response");
			const model = createModel(create(error));

			await expect(model.index2({ offset: 0, rows: 10 })).rejects.toBe(error);
			expect(report).toHaveBeenCalledExactlyOnceWith(
				error,
				expect.objectContaining({
					source: "Model.index2",
					extra: { model: model.modelId },
				}),
			);
		},
	);

	it.each(INDEX2_CONNECTORS)(
		"[ISSUE-3506-ITEM-22] doesn't report an AbortError of $connector, and the abort reaches the caller",
		async ({ create }) => {
			// an AbortError as fetch rejects with it; the signal is not passed on
			const controller = new AbortController();
			controller.abort();
			const error = controller.signal.reason as Error;
			const model = createModel(create(error));

			await expect(model.index2({ offset: 0, rows: 10 })).rejects.toBe(error);
			expect(report).not.toHaveBeenCalled();
		},
	);

	it.each(INDEX2_CONNECTORS)(
		"[ISSUE-3506-ITEM-22] doesn't report an index2 request of $connector aborted while it was loading, whatever it then rejects with",
		async ({ create }) => {
			const controller = new AbortController();
			const error = new TypeError("socket closed");
			const model = createModel(create(error, () => controller.abort()));

			await expect(
				model.index2({ offset: 0, rows: 10, signal: controller.signal }),
			).rejects.toBe(error);
			expect(report).not.toHaveBeenCalled();
		},
	);
});
