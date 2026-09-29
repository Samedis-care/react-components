/* eslint-disable no-console */
import getCurrentLocale from "../../utils/getCurrentLocale";
import ccI18n from "../../i18n";
import AuthMode from "./AuthMode";
import addGetParams from "../../utils/addGetParams";
import BackendError from "./BackendError";
import NetworkError from "./NetworkError";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import fetchWithUploadProgress, {
	RequestUploadProgress,
} from "./fetchWithUploadProgress";
import { blobsToDataUris } from "./bodyFiles";

export type { RequestUploadProgress };

export type GetParams = Record<string, unknown> | null;

/**
 * Options for a single request
 */
export interface RequestOptions {
	/**
	 * Aborts the request
	 * @remarks The request then rejects with the signal's reason (an `AbortError`
	 *          DOMException unless the signal was aborted with a reason of its own)
	 *          instead of a NetworkError, and the exception hook is not called: an abort
	 *          is asked for, it is not a failure.
	 */
	signal?: AbortSignal;
	/**
	 * Called as the request body is uploaded
	 * @remarks fetch reports no upload progress, so a request with a body and this
	 *          callback is sent with XMLHttpRequest instead. Listening to upload progress
	 *          makes a cross-origin request preflighted.
	 */
	onUploadProgress?: (progress: RequestUploadProgress) => void;
}
/**
 * The authentication handler callback has to provide and/or obtain the authentication
 * @returns The Authentication header value
 * @throws If the user has no session
 */
export type AuthenticationHandlerCallback = (
	authMode: AuthMode,
) => Promise<string> | string;
/**
 * Can be used to show a loading status.
 * @param method The HTTP Verb
 * @param url The url of the request
 * @param args The query parameters of the request
 * @param body The JSON body of the request
 * @param auth The authentication mode of the request
 * @param options The options of the request
 */
export type RequestHook = (
	method: string,
	url: string,
	args: GetParams,
	body: unknown | null,
	auth: AuthMode,
	options: RequestOptions,
) => Promise<void> | void;
/**
 * The response processor throws if the response is erroneous
 * @param method The HTTP Verb
 * @param url The url of the request
 * @param args The query parameters of the request
 * @param body The JSON body of the request
 * @param auth The authentication mode of the request
 * @param options The options of the request. Pass them on when retrying the request.
 * @param response The HTTP response
 * @param responseData The JSON response data
 */
export type ResponseProcessor = (
	response: Response,
	responseData: unknown,
	method: string,
	url: string,
	args: GetParams,
	body: unknown | null,
	auth: AuthMode,
	options: RequestOptions,
) => Promise<unknown> | unknown;

/**
 * Custom handler for requests (if not enabled defaults to fetch)
 * @param method The HTTP Verb
 * @param url The url of the request
 * @param args The query parameters of the request
 * @param headers The request headers
 * @param body The JSON body of the request
 * @param auth The authentication mode of the request
 * @param options The options of the request
 * @returns Response if successfully handled or undefined if fallback handler (fetch) should be used instead
 * @throws Can throw exception (like fetch)
 * @remarks Body conversion and query params are not applied here! You have to do that manually
 */
export type CustomRequestPerformer = (
	method: string,
	url: string,
	args: GetParams,
	headers: Record<string, string>,
	body: unknown | null,
	auth: AuthMode,
	options: RequestOptions,
) => Promise<Response> | Response | undefined;

/**
 * Hook for exception handling (can be used to report to e.g. Sentry)
 * @param error The error which has happened
 * @remarks This cannot be used to handle errors generically! Also treat these errors as unhandled
 */
export type ExceptionHook = (error: Error) => void;

/**
 * Did the request fail because it was aborted?
 * @param error What the request failed with
 * @param signal The request's signal
 */
const isAbort = (error: unknown, signal: AbortSignal | undefined): boolean =>
	!!signal?.aborted &&
	(error === signal.reason ||
		(error instanceof DOMException && error.name === "AbortError"));

// noinspection ExceptionCaughtLocallyJS
/**
 * A helper class to connect to JSON REST apis
 */
class JsonApiClient {
	handleAuthentication: AuthenticationHandlerCallback;
	handleResponse: ResponseProcessor;
	handlePreRequest?: RequestHook;
	handlePostRequest?: RequestHook;
	exceptionHook?: ExceptionHook;
	customRequestPerformer?: CustomRequestPerformer;

	constructor(
		authHandler: AuthenticationHandlerCallback,
		responseProcessor: ResponseProcessor,
		preRequestHook?: RequestHook,
		postRequestHook?: RequestHook,
		exceptionHook?: ExceptionHook,
		customRequestPerformer?: CustomRequestPerformer,
	) {
		this.handleAuthentication = authHandler;
		this.handleResponse = responseProcessor;
		this.handlePreRequest = preRequestHook;
		this.handlePostRequest = postRequestHook;
		this.exceptionHook = exceptionHook;
		this.customRequestPerformer = customRequestPerformer;
	}

	/**
	 * @see request
	 */
	public async get<T>(
		url: string,
		args: GetParams,
		auth: AuthMode = AuthMode.On,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>("GET", url, args, null, auth, options);
	}

	/**
	 * @see request
	 */
	public async post<T>(
		url: string,
		args: GetParams,
		body: Record<string, unknown>,
		auth: AuthMode = AuthMode.On,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>("POST", url, args, body, auth, options);
	}

	/**
	 * @see request
	 */
	public async put<T>(
		url: string,
		args: GetParams,
		body: Record<string, unknown>,
		auth: AuthMode = AuthMode.On,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>("PUT", url, args, body, auth, options);
	}

	/**
	 * @see request
	 */
	public async patch<T>(
		url: string,
		args: GetParams,
		body: Record<string, unknown>,
		auth: AuthMode = AuthMode.On,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>("PATCH", url, args, body, auth, options);
	}

	/**
	 * @see request
	 */
	public async delete<T>(
		url: string,
		args: GetParams,
		auth: AuthMode = AuthMode.On,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>("DELETE", url, args, null, auth, options);
	}

	/**
	 * Convert request body
	 * @param body The body data
	 * @param headers The headers (can be modified to add/remove headers)
	 * @return The body data passed to fetch
	 * @remarks JSON cannot carry a file, so a Blob in the body is sent as a data URI (a
	 *          File with its name as the `name` parameter)
	 * @protected
	 */
	public async convertBody(
		body: unknown | null,
		headers: Record<string, string>,
	): Promise<string | FormData | null> {
		if (!body) return null;
		headers["Content-Type"] = "application/json";
		return JSON.stringify(await blobsToDataUris(body));
	}

	/**
	 * Performs an HTTP request with automatic authorization if desired
	 * @param method The HTTP Verb
	 * @param url The url of the request
	 * @param args The query parameters to pass
	 * @param body The JSON body to pass
	 * @param auth The authentication mode to use
	 * @param options Abort signal and upload progress
	 * @throws NetworkError if no response arrived, BackendError with the response's
	 *         `status` and `headers` if the response isn't JSON (the response processor
	 *         isn't called then), and whatever the response processor throws
	 */
	public async request<T>(
		method: string,
		url: string,
		args: GetParams,
		body: unknown | null,
		auth: AuthMode,
		options: RequestOptions = {},
	): Promise<T> {
		const { signal, onUploadProgress } = options;
		// no longer wanted, so don't start it (and don't run the hooks)
		signal?.throwIfAborted();

		const safeToLeave =
			method !== "GET" ? UnsafeToLeaveDispatch.lock(method + "-request") : null;

		if (this.handlePreRequest) {
			void (await this.handlePreRequest(
				method,
				url,
				args,
				body,
				auth,
				options,
			));
		}

		try {
			const headers: Record<string, string> = {};

			// Handle localization
			headers["Accept-Language"] = getCurrentLocale(ccI18n);

			// Handle authentication
			if (auth !== AuthMode.Off) {
				headers.Authorization = await this.handleAuthentication(auth);
			}

			let response: Response | undefined;

			if (this.customRequestPerformer) {
				response = await this.customRequestPerformer(
					method,
					url,
					args,
					headers,
					body,
					auth,
					options,
				);
			}
			if (!response) {
				// Handle URL GET arguments
				const urlWithArgs = addGetParams(url, args);
				// Handle POST data
				const convertedBody = await this.convertBody(body, headers);
				// Perform request
				try {
					const init = { body: convertedBody, headers, method, signal };
					response =
						onUploadProgress && convertedBody != null
							? await fetchWithUploadProgress(
									urlWithArgs,
									init,
									onUploadProgress,
								)
							: await fetch(urlWithArgs, init);
				} catch (e) {
					if (isAbort(e, signal)) throw e;
					// Network error
					console.error("Failed fetch", e);
					throw new NetworkError(
						ccI18n.t(
							"backend-integration.connector.json-api-client.network-error",
						),
					);
				}
			}

			// Read response
			let responseText: string;
			try {
				responseText = await response.text();
			} catch (e) {
				if (isAbort(e, signal)) throw e;
				console.error("[JsonApiClient] Failed reading response", e);
				throw new NetworkError(
					ccI18n.t(
						"backend-integration.connector.json-api-client.network-error",
					),
				);
			}

			// Parse response
			let responseData: unknown;
			try {
				responseData = JSON.parse(responseText);
			} catch (e) {
				// JSON parse error
				console.error("[JsonApiClient] Failed JSON parsing", e, responseText);

				throw new BackendError(
					ccI18n.t(
						"backend-integration.connector.json-api-client.parse-error",
						{
							// HTTP/2 has no status text
							STATUS: `${response.status} ${response.statusText}`.trim(),
						},
					),
					undefined,
					undefined,
					response,
				);
			}

			return (await this.handleResponse(
				response,
				responseData,
				method,
				url,
				args,
				body,
				auth,
				options,
			)) as T;
		} catch (e) {
			if (this.exceptionHook && !isAbort(e, signal)) {
				this.exceptionHook(e as Error);
			}
			throw e;
		} finally {
			if (this.handlePostRequest) {
				void (await this.handlePostRequest(
					method,
					url,
					args,
					body,
					auth,
					options,
				));
			}
			if (safeToLeave) {
				safeToLeave();
			}
		}
	}
}

export default JsonApiClient;
