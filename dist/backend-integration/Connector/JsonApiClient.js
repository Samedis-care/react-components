/* eslint-disable no-console */
import getCurrentLocale from "../../utils/getCurrentLocale";
import ccI18n from "../../i18n";
import AuthMode from "./AuthMode";
import addGetParams from "../../utils/addGetParams";
import BackendError from "./BackendError";
import NetworkError from "./NetworkError";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import fetchWithUploadProgress from "./fetchWithUploadProgress";
import { blobsToDataUris } from "./bodyFiles";
/**
 * Did the request fail because it was aborted?
 * @param error What the request failed with
 * @param signal The request's signal
 */
const isAbort = (error, signal) => !!signal?.aborted &&
    (error === signal.reason ||
        (error instanceof DOMException && error.name === "AbortError"));
// noinspection ExceptionCaughtLocallyJS
/**
 * A helper class to connect to JSON REST apis
 */
class JsonApiClient {
    handleAuthentication;
    handleResponse;
    handlePreRequest;
    handlePostRequest;
    exceptionHook;
    customRequestPerformer;
    constructor(authHandler, responseProcessor, preRequestHook, postRequestHook, exceptionHook, customRequestPerformer) {
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
    async get(url, args, auth = AuthMode.On, options) {
        return this.request("GET", url, args, null, auth, options);
    }
    /**
     * @see request
     */
    async post(url, args, body, auth = AuthMode.On, options) {
        return this.request("POST", url, args, body, auth, options);
    }
    /**
     * @see request
     */
    async put(url, args, body, auth = AuthMode.On, options) {
        return this.request("PUT", url, args, body, auth, options);
    }
    /**
     * @see request
     */
    async patch(url, args, body, auth = AuthMode.On, options) {
        return this.request("PATCH", url, args, body, auth, options);
    }
    /**
     * @see request
     */
    async delete(url, args, auth = AuthMode.On, options) {
        return this.request("DELETE", url, args, null, auth, options);
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
    async convertBody(body, headers) {
        if (!body)
            return null;
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
     */
    async request(method, url, args, body, auth, options = {}) {
        const { signal, onUploadProgress } = options;
        // no longer wanted, so don't start it (and don't run the hooks)
        signal?.throwIfAborted();
        const safeToLeave = method !== "GET" ? UnsafeToLeaveDispatch.lock(method + "-request") : null;
        if (this.handlePreRequest) {
            void (await this.handlePreRequest(method, url, args, body, auth, options));
        }
        try {
            const headers = {};
            // Handle localization
            headers["Accept-Language"] = getCurrentLocale(ccI18n);
            // Handle authentication
            if (auth !== AuthMode.Off) {
                headers.Authorization = await this.handleAuthentication(auth);
            }
            let response;
            if (this.customRequestPerformer) {
                response = await this.customRequestPerformer(method, url, args, headers, body, auth, options);
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
                            ? await fetchWithUploadProgress(urlWithArgs, init, onUploadProgress)
                            : await fetch(urlWithArgs, init);
                }
                catch (e) {
                    if (isAbort(e, signal))
                        throw e;
                    // Network error
                    console.error("Failed fetch", e);
                    throw new NetworkError(ccI18n.t("backend-integration.connector.json-api-client.network-error"));
                }
            }
            // Read response
            let responseText;
            try {
                responseText = await response.text();
            }
            catch (e) {
                if (isAbort(e, signal))
                    throw e;
                console.error("[JsonApiClient] Failed reading response", e);
                throw new NetworkError(ccI18n.t("backend-integration.connector.json-api-client.network-error"));
            }
            // Parse response
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            }
            catch (e) {
                // JSON parse error
                console.error("[JsonApiClient] Failed JSON parsing", e, responseText);
                throw new BackendError(ccI18n.t("backend-integration.connector.json-api-client.parse-error", {
                    STATUS_CODE: response.status,
                    STATUS_TEXT: response.statusText,
                }));
            }
            return (await this.handleResponse(response, responseData, method, url, args, body, auth, options));
        }
        catch (e) {
            if (this.exceptionHook && !isAbort(e, signal)) {
                this.exceptionHook(e);
            }
            throw e;
        }
        finally {
            if (this.handlePostRequest) {
                void (await this.handlePostRequest(method, url, args, body, auth, options));
            }
            if (safeToLeave) {
                safeToLeave();
            }
        }
    }
}
export default JsonApiClient;
