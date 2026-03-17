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

	it("has undefined code and meta when not provided", () => {
		const error = new BackendError("simple error");
		expect(error.code).toBeUndefined();
		expect(error.meta).toBeUndefined();
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
