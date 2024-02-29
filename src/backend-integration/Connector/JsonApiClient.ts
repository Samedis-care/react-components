/* eslint-disable no-console */
import ccI18n from "../../i18n";
import AuthMode from "./AuthMode";
import addGetParams from "../../utils/addGetParams";
import BackendError from "./BackendError";
import NetworkError from "./NetworkError";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";

export type GetParams = Record<string, unknown> | null;
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
 */
export type RequestHook = (
	method: string,
	url: string,
	args: GetParams,
	body: unknown | null,
	auth: AuthMode,
) => Promise<void> | void;
/**
 * The response processor throws if the response is erroneous
 * @param method The HTTP Verb
 * @param url The url of the request
 * @param args The query parameters of the request
 * @param body The JSON body of the request
 * @param auth The authentication mode of the request
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
) => Promise<unknown> | unknown;

/**
 * Custom handler for requests (if not enabled defaults to fetch)
 * @param method The HTTP Verb
 * @param url The url of the request
 * @param args The query parameters of the request
 * @param headers The request headers
 * @param body The JSON body of the request
 * @param auth The authentication mode of the request
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
) => Promise<Response> | Response | undefined;

/**
 * Hook for exception handling (can be used to report to e.g. Sentry)
 * @param error The error which has happened
 * @remarks This cannot be used to handle errors generically! Also treat these errors as unhandled
 */
export type ExceptionHook = (error: Error) => void;

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
	): Promise<T> {
		return this.request<T>("GET", url, args, null, auth);
	}

	/**
	 * @see request
	 */
	public async post<T>(
		url: string,
		args: GetParams,
		body: Record<string, unknown>,
		auth: AuthMode = AuthMode.On,
	): Promise<T> {
		return this.request<T>("POST", url, args, body, auth);
	}

	/**
	 * @see request
	 */
	public async put<T>(
		url: string,
		args: GetParams,
		body: Record<string, unknown>,
		auth: AuthMode = AuthMode.On,
	): Promise<T> {
		return this.request<T>("PUT", url, args, body, auth);
	}

	/**
	 * @see request
	 */
	public async patch<T>(
		url: string,
		args: GetParams,
		body: Record<string, unknown>,
		auth: AuthMode = AuthMode.On,
	): Promise<T> {
		return this.request<T>("PATCH", url, args, body, auth);
	}

	/**
	 * @see request
	 */
	public async delete<T>(
		url: string,
		args: GetParams,
		auth: AuthMode = AuthMode.On,
	): Promise<T> {
		return this.request<T>("DELETE", url, args, null, auth);
	}

	/**
	 * Convert request body
	 * @param body The body data
	 * @param headers The headers (can be modified to add/remove headers)
	 * @return The body data passed to fetch
	 * @protected
	 */
	public convertBody(
		body: unknown | null,
		headers: Record<string, string>,
	): string | FormData | null {
		if (!body) return null;
		headers["Content-Type"] = "application/json";
		return JSON.stringify(body);
	}

	/**
	 * Performs an HTTP request with automatic authorization if desired
	 * @param method The HTTP Verb
	 * @param url The url of the request
	 * @param args The query parameters to pass
	 * @param body The JSON body to pass
	 * @param auth The authentication mode to use
	 */
	public async request<T>(
		method: string,
		url: string,
		args: GetParams,
		body: unknown | null,
		auth: AuthMode,
	): Promise<T> {
		const safeToLeave =
			method !== "GET" ? UnsafeToLeaveDispatch.lock(method + "-request") : null;

		if (this.handlePreRequest) {
			void (await this.handlePreRequest(method, url, args, body, auth));
		}

		try {
			const headers: Record<string, string> = {};

			// Handle localization
			headers["Accept-Language"] = ccI18n.language;

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
				);
			}
			if (!response) {
				// Handle URL GET arguments
				const urlWithArgs = addGetParams(url, args);
				// Handle POST data
				body = this.convertBody(body, headers);
				// Perform request
				try {
					response = await fetch(urlWithArgs, {
						body: body as FormData | string,
						headers,
						method,
					});
				} catch (e) {
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
							STATUS_CODE: response.status,
							STATUS_TEXT: response.statusText,
						},
					),
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
			)) as T;
		} catch (e) {
			if (this.exceptionHook) {
				this.exceptionHook(e as Error);
			}
			throw e;
		} finally {
			if (this.handlePostRequest) {
				void (await this.handlePostRequest(method, url, args, body, auth));
			}
			if (safeToLeave) {
				safeToLeave();
			}
		}
	}
}

export default JsonApiClient;
