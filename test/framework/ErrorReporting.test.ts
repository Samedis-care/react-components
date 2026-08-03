import { describe, it, expect, afterEach, vi } from "vitest";
import {
	CcErrorNames,
	captureError,
	configureErrorReporting,
	defaultErrorReporter,
	defaultShouldReportError,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";

const namedError = (name: string): Error => {
	const e = new Error(`test ${name}`);
	e.name = name;
	return e;
};

// the config is a module level singleton, so it leaks between tests
afterEach(() => {
	configureErrorReporting({
		shouldReport: defaultShouldReportError,
		report: defaultErrorReporter,
		logToConsole: false,
	});
	vi.restoreAllMocks();
});

describe("defaultShouldReportError", () => {
	it("doesn't report ValidationError", () => {
		expect(
			defaultShouldReportError(namedError(CcErrorNames.ValidationError), {
				source: "test",
			}),
		).toBe(false);
	});

	it("doesn't report NetworkError", () => {
		expect(
			defaultShouldReportError(namedError(CcErrorNames.NetworkError), {
				source: "test",
			}),
		).toBe(false);
	});

	it("reports BackendError", () => {
		expect(
			defaultShouldReportError(namedError(CcErrorNames.BackendError), {
				source: "test",
			}),
		).toBe(true);
	});

	it("reports RequestBatchingError", () => {
		expect(
			defaultShouldReportError(namedError(CcErrorNames.RequestBatchingError), {
				source: "test",
			}),
		).toBe(true);
	});

	it("reports code errors", () => {
		expect(
			defaultShouldReportError(new Error("boom"), { source: "test" }),
		).toBe(true);
		expect(
			defaultShouldReportError(new TypeError("boom"), { source: "test" }),
		).toBe(true);
	});

	it("honors context.ignoreNames", () => {
		expect(
			defaultShouldReportError(namedError(CcErrorNames.BackendError), {
				source: "test",
				ignoreNames: [CcErrorNames.BackendError],
			}),
		).toBe(false);
	});
});

describe("captureError", () => {
	it("passes error and context to the configured reporter", () => {
		const report = vi.fn();
		configureErrorReporting({ report });
		const error = new Error("boom");

		captureError(error, { source: "test.source", extra: { foo: "bar" } });

		expect(report).toHaveBeenCalledTimes(1);
		expect(report).toHaveBeenCalledWith(error, {
			source: "test.source",
			extra: { foo: "bar" },
		});
	});

	it("doesn't report errors rejected by the policy", () => {
		const report = vi.fn();
		configureErrorReporting({ report });

		captureError(namedError(CcErrorNames.ValidationError), { source: "test" });
		captureError(namedError(CcErrorNames.NetworkError), { source: "test" });

		expect(report).not.toHaveBeenCalled();
	});

	it("uses a custom shouldReport callback", () => {
		const report = vi.fn();
		configureErrorReporting({ report, shouldReport: () => true });

		captureError(namedError(CcErrorNames.NetworkError), { source: "test" });

		expect(report).toHaveBeenCalledTimes(1);
	});

	it("wraps non-Error values", () => {
		const report = vi.fn();
		configureErrorReporting({ report });

		captureError("something broke", { source: "test" });

		expect(report).toHaveBeenCalledTimes(1);
		const reported = report.mock.calls[0][0] as Error;
		expect(reported).toBeInstanceOf(Error);
		expect(reported.message).toContain("something broke");
	});

	it("doesn't throw when the reporter throws", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		configureErrorReporting({
			report: () => {
				throw new Error("reporter is broken");
			},
		});

		expect(() =>
			captureError(new Error("boom"), { source: "test" }),
		).not.toThrow();
		expect(consoleError).toHaveBeenCalled();
	});

	it("logs to console only when logToConsole is set", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		configureErrorReporting({ report: vi.fn() });

		captureError(new Error("boom"), { source: "test" });
		expect(consoleError).not.toHaveBeenCalled();

		configureErrorReporting({ logToConsole: true });
		captureError(new Error("boom"), { source: "test" });
		expect(consoleError).toHaveBeenCalledTimes(1);
	});

	it("logs errors which aren't reported when logToConsole is set", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const report = vi.fn();
		configureErrorReporting({ report, logToConsole: true });

		captureError(namedError(CcErrorNames.NetworkError), { source: "test" });

		expect(report).not.toHaveBeenCalled();
		expect(consoleError).toHaveBeenCalledTimes(1);
	});
});

describe("configureErrorReporting", () => {
	it("keeps unset keys at their current value", () => {
		const report = vi.fn();
		configureErrorReporting({ report });
		configureErrorReporting({ logToConsole: true });

		const config = getErrorReportingConfig();
		expect(config.report).toBe(report);
		expect(config.logToConsole).toBe(true);
		expect(config.shouldReport).toBe(defaultShouldReportError);
	});
});
