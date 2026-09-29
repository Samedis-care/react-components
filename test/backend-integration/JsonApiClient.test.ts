import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import JsonApiClient, {
	RequestOptions,
} from "../../src/backend-integration/Connector/JsonApiClient";
import AuthMode from "../../src/backend-integration/Connector/AuthMode";
import NetworkError from "../../src/backend-integration/Connector/NetworkError";

/**
 * Stands in for XMLHttpRequest: records the request, the test answers it
 */
class FakeXhr extends EventTarget {
	static instances: FakeXhr[] = [];
	upload = new EventTarget();
	responseType = "";
	status = 0;
	statusText = "";
	response: ArrayBuffer | null = null;
	method = "";
	url = "";
	headers: Record<string, string> = {};
	body: unknown = undefined;
	aborted = false;

	constructor() {
		super();
		FakeXhr.instances.push(this);
	}
	open(method: string, url: string) {
		this.method = method;
		this.url = url;
	}
	setRequestHeader(name: string, value: string) {
		this.headers[name] = value;
	}
	send(body: unknown) {
		this.body = body;
	}
	abort() {
		this.aborted = true;
		this.dispatchEvent(new Event("abort"));
	}
	getAllResponseHeaders() {
		return "content-type: application/json\r\nx-request-id: 42\r\n";
	}
	progress(loaded: number, total: number) {
		this.upload.dispatchEvent(
			new ProgressEvent("progress", { loaded, total, lengthComputable: true }),
		);
	}
	respond(status: number, data: unknown) {
		this.status = status;
		this.statusText = "OK";
		this.response = new TextEncoder().encode(JSON.stringify(data)).buffer;
		this.dispatchEvent(new Event("load"));
	}
}

const jsonResponse = (data: unknown) =>
	new Response(JSON.stringify(data), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});

/**
 * A fetch that never answers on its own, but rejects like fetch once its signal aborts
 */
const pendingFetch = () =>
	vi.fn(
		(_url: string, init: RequestInit) =>
			new Promise<Response>((_resolve, reject) => {
				init.signal?.addEventListener("abort", () =>
					reject(init.signal!.reason as Error),
				);
			}),
	);

const makeClient = () => {
	const responseProcessor = vi.fn((_response: Response, data: unknown) => data);
	const preRequest = vi.fn();
	const postRequest = vi.fn();
	const exceptionHook = vi.fn();
	const client = new JsonApiClient(
		() => "Bearer token",
		responseProcessor,
		preRequest,
		postRequest,
		exceptionHook,
	);
	return { client, responseProcessor, preRequest, postRequest, exceptionHook };
};

beforeEach(() => {
	FakeXhr.instances = [];
	vi.stubGlobal("XMLHttpRequest", FakeXhr);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("JsonApiClient.request", () => {
	it("sends with fetch, passing the signal, and hands the options to every hook", async () => {
		const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ ok: 1 })));
		vi.stubGlobal("fetch", fetchMock);
		const { client, responseProcessor, preRequest, postRequest } = makeClient();
		const options: RequestOptions = { signal: new AbortController().signal };

		await expect(
			client.post("/api/x", null, { a: 1 }, AuthMode.On, options),
		).resolves.toEqual({ ok: 1 });

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/x",
			expect.objectContaining({ method: "POST", signal: options.signal }),
		);
		expect(FakeXhr.instances).toHaveLength(0);
		expect(preRequest.mock.calls[0][5]).toBe(options);
		expect(postRequest.mock.calls[0][5]).toBe(options);
		expect(responseProcessor.mock.calls[0][7]).toBe(options);
	});

	it("sends with XMLHttpRequest when upload progress is asked for, and reports it", async () => {
		vi.stubGlobal("fetch", vi.fn());
		const { client } = makeClient();
		const onUploadProgress = vi.fn();

		const result = client.put(
			"/api/x/1",
			{ locale: "de" },
			{ a: 1 },
			AuthMode.On,
			{ onUploadProgress },
		);
		await vi.waitFor(() => expect(FakeXhr.instances).toHaveLength(1));
		const xhr = FakeXhr.instances[0];
		expect(xhr.method).toBe("PUT");
		expect(xhr.url).toBe("/api/x/1?locale=de");
		expect(xhr.headers.Authorization).toBe("Bearer token");
		expect(xhr.headers["Content-Type"]).toBe("application/json");
		expect(xhr.body).toBe(JSON.stringify({ a: 1 }));

		xhr.progress(50, 100);
		xhr.progress(100, 100);
		xhr.respond(200, { saved: true });

		await expect(result).resolves.toEqual({ saved: true });
		expect(onUploadProgress.mock.calls).toEqual([
			[{ loaded: 50, total: 100 }],
			[{ loaded: 100, total: 100 }],
		]);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("hands the handler the XMLHttpRequest response as a Response", async () => {
		const { client, responseProcessor } = makeClient();
		const result = client.post("/api/x", null, { a: 1 }, AuthMode.Off, {
			onUploadProgress: vi.fn(),
		});
		await vi.waitFor(() => expect(FakeXhr.instances).toHaveLength(1));
		FakeXhr.instances[0].respond(422, { error: "invalid" });
		await expect(result).resolves.toEqual({ error: "invalid" });

		const response = responseProcessor.mock.calls[0][0];
		expect(response.status).toBe(422);
		expect(response.headers.get("x-request-id")).toBe("42");
	});

	it("uses fetch for a request without a body, even with a progress callback", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => Promise.resolve(jsonResponse([]))),
		);
		const { client } = makeClient();
		await client.get("/api/x", null, AuthMode.On, {
			onUploadProgress: vi.fn(),
		});
		expect(fetch).toHaveBeenCalled();
		expect(FakeXhr.instances).toHaveLength(0);
	});

	it("does not start a request whose signal is already aborted", async () => {
		vi.stubGlobal("fetch", vi.fn());
		const { client, preRequest, exceptionHook } = makeClient();
		const controller = new AbortController();
		controller.abort();

		await expect(
			client.post("/api/x", null, { a: 1 }, AuthMode.On, {
				signal: controller.signal,
			}),
		).rejects.toBe(controller.signal.reason);
		expect(preRequest).not.toHaveBeenCalled();
		expect(fetch).not.toHaveBeenCalled();
		expect(exceptionHook).not.toHaveBeenCalled();
	});

	it("rejects an aborted fetch with the abort, not a NetworkError, and doesn't report it", async () => {
		vi.stubGlobal("fetch", pendingFetch());
		const { client, exceptionHook, postRequest } = makeClient();
		const controller = new AbortController();

		const result = client.post("/api/x", null, { a: 1 }, AuthMode.On, {
			signal: controller.signal,
		});
		await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
		controller.abort();

		await expect(result).rejects.toMatchObject({ name: "AbortError" });
		expect(exceptionHook).not.toHaveBeenCalled();
		expect(postRequest).toHaveBeenCalled();
	});

	it("aborts an upload in progress", async () => {
		const { client, exceptionHook } = makeClient();
		const controller = new AbortController();
		const reason = new Error("stalled");

		const result = client.post("/api/x", null, { a: 1 }, AuthMode.On, {
			signal: controller.signal,
			onUploadProgress: vi.fn(),
		});
		await vi.waitFor(() => expect(FakeXhr.instances).toHaveLength(1));
		controller.abort(reason);

		await expect(result).rejects.toBe(reason);
		expect(FakeXhr.instances[0].aborted).toBe(true);
		expect(exceptionHook).not.toHaveBeenCalled();
	});

	it("still reports a failed upload as NetworkError", async () => {
		const { client, exceptionHook } = makeClient();
		const result = client.post("/api/x", null, { a: 1 }, AuthMode.On, {
			onUploadProgress: vi.fn(),
		});
		await vi.waitFor(() => expect(FakeXhr.instances).toHaveLength(1));
		FakeXhr.instances[0].dispatchEvent(new Event("error"));

		await expect(result).rejects.toBeInstanceOf(NetworkError);
		expect(exceptionHook).toHaveBeenCalled();
	});
});

describe("JsonApiClient.convertBody", () => {
	it("sends a Blob in a JSON body as data URI, a File with its name", async () => {
		const { client } = makeClient();
		const converted = await client.convertBody(
			{
				data: {
					file: new File(["hello"], "a b.txt", { type: "text/plain" }),
					blob: new Blob(["hello"], { type: "text/plain" }),
					list: [new Blob([""], { type: "text/plain" })],
				},
			},
			{},
		);
		expect(JSON.parse(converted as string)).toEqual({
			data: {
				file: "data:text/plain;name=a%20b.txt;base64,aGVsbG8=",
				blob: "data:text/plain;base64,aGVsbG8=",
				list: ["data:text/plain;base64,"],
			},
		});
	});
});
