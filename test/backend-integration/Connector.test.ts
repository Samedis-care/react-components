import { describe, it, expect } from "vitest";
import NetworkError from "../../src/backend-integration/Connector/NetworkError";
import BackendError from "../../src/backend-integration/Connector/BackendError";

describe("NetworkError", () => {
	it("creates an error with the given message", () => {
		const error = new NetworkError("Connection failed");
		expect(error.message).toBe("Connection failed");
	});

	it("has name set to NetworkError", () => {
		const error = new NetworkError("timeout");
		expect(error.name).toBe("NetworkError");
	});

	it("is an instance of Error", () => {
		const error = new NetworkError("test");
		expect(error).toBeInstanceOf(Error);
	});

	it("is an instance of NetworkError", () => {
		const error = new NetworkError("test");
		expect(error).toBeInstanceOf(NetworkError);
	});
});

describe("BackendError", () => {
	it("creates an error with the given message", () => {
		const error = new BackendError("Not found");
		expect(error.message).toBe("Not found");
	});

	it("has name set to BackendError", () => {
		const error = new BackendError("error");
		expect(error.name).toBe("BackendError");
	});

	it("is an instance of Error", () => {
		const error = new BackendError("test");
		expect(error).toBeInstanceOf(Error);
	});

	it("is an instance of BackendError", () => {
		const error = new BackendError("test");
		expect(error).toBeInstanceOf(BackendError);
	});

	it("stores optional code", () => {
		const error = new BackendError("error", "ERR_404");
		expect(error.code).toBe("ERR_404");
	});

	it("stores optional meta data", () => {
		const meta = { field: "email", detail: "invalid format" };
		const error = new BackendError("Validation failed", "VALIDATION", meta);
		expect(error.meta).toEqual(meta);
	});

	it("takes status and headers from the optional response", () => {
		const response = new Response(null, {
			status: 503,
			headers: { "Retry-After": "30" },
		});
		const error = new BackendError(
			"Unavailable",
			undefined,
			undefined,
			response,
		);
		expect(error.status).toBe(503);
		expect(error.headers?.get("Retry-After")).toBe("30");
	});

	it("has undefined code, meta, status and headers when not provided", () => {
		const error = new BackendError("simple error");
		expect(error.code).toBeUndefined();
		expect(error.meta).toBeUndefined();
		expect(error.status).toBeUndefined();
		expect(error.headers).toBeUndefined();
	});

	it("supports any type as meta", () => {
		const errorWithArray = new BackendError("err", "CODE", [1, 2, 3]);
		expect(errorWithArray.meta).toEqual([1, 2, 3]);

		const errorWithString = new BackendError("err", "CODE", "string meta");
		expect(errorWithString.meta).toBe("string meta");

		const errorWithNull = new BackendError("err", "CODE", null);
		expect(errorWithNull.meta).toBeNull();
	});
});
