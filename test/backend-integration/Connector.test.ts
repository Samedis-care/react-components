import { describe, it, expect } from "vitest";
import NetworkError from "../../src/backend-integration/Connector/NetworkError";
import BackendError from "../../src/backend-integration/Connector/BackendError";
import PartialDeleteError from "../../src/backend-integration/Connector/PartialDeleteError";
import Connector from "../../src/backend-integration/Connector/Connector";

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

/**
 * A backend that refuses the deletes it is told to refuse, and holds the deletes of the
 * ids it is given a gate for until that gate opens
 */
class RefusingConnector extends Connector {
	public records = new Set(["1", "2", "3"]);
	public refuse = new Set<string>();
	public gates = new Map<string, Promise<void>>();

	async delete(id: string) {
		await this.gates.get(id);
		if (this.refuse.has(id)) throw new Error(`delete of ${id} refused`);
		this.records.delete(id);
	}

	index(): never {
		throw new Error("not used");
	}

	create(): never {
		throw new Error("not used");
	}

	read(): never {
		throw new Error("not used");
	}

	update(): never {
		throw new Error("not used");
	}
}

/** What a request rejected with, or null if it went through */
const rejectionOf = async (request: Promise<void> | void) => {
	try {
		await request;
		return null;
	} catch (e) {
		return e;
	}
};

describe("Connector.deleteMultiple", () => {
	it("deletes every id", async () => {
		const connector = new RefusingConnector();

		await connector.deleteMultiple(["1", "3"]);

		expect([...connector.records]).toEqual(["2"]);
	});

	it("rejects with a PartialDeleteError naming the ids it could not delete", async () => {
		const connector = new RefusingConnector();
		connector.refuse.add("2");

		const error = await rejectionOf(connector.deleteMultiple(["1", "2", "3"]));

		expect(error).toBeInstanceOf(PartialDeleteError);
		expect((error as PartialDeleteError).failedIds).toEqual(["2"]);
		expect((error as PartialDeleteError).message).toBe("delete of 2 refused");
		expect((error as PartialDeleteError).cause).toBeInstanceOf(Error);
		expect([...connector.records]).toEqual(["2"]);
	});

	it("settles every delete before it rejects", async () => {
		const connector = new RefusingConnector();
		connector.refuse.add("1");
		let release!: () => void;
		connector.gates.set(
			"3",
			new Promise<void>((resolve) => {
				release = resolve;
			}),
		);

		let settled = false;
		const request = Promise.resolve(
			connector.deleteMultiple(["1", "3"]),
		).finally(() => {
			settled = true;
		});
		await new Promise((resolve) => setTimeout(resolve, 0));

		// 1 was refused at once, but whether 3 is deleted is not known yet
		expect(settled).toBe(false);
		release();
		await expect(request).rejects.toThrow(PartialDeleteError);
		expect([...connector.records]).toEqual(["1", "2"]);
	});

	it("rejects with the first refusal itself when nothing could be deleted", async () => {
		const connector = new RefusingConnector();
		connector.refuse.add("1");
		connector.refuse.add("2");

		const error = await rejectionOf(connector.deleteMultiple(["1", "2"]));

		expect(error).not.toBeInstanceOf(PartialDeleteError);
		expect((error as Error).message).toBe("delete of 1 refused");
	});
});
