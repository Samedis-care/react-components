/* eslint-disable no-console */
import ccI18n from "../../i18n";
import AuthMode from "./AuthMode";
import { addGetParams } from "../../utils";
import { BackendError, NetworkError } from "./index";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
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
    async get(url, args, auth = AuthMode.On) {
        return this.request("GET", url, args, null, auth);
    }
    /**
     * @see request
     */
    async post(url, args, body, auth = AuthMode.On) {
        return this.request("POST", url, args, body, auth);
    }
    /**
     * @see request
     */
    async put(url, args, body, auth = AuthMode.On) {
        return this.request("PUT", url, args, body, auth);
    }
    /**
     * @see request
     */
    async patch(url, args, body, auth = AuthMode.On) {
        return this.request("PATCH", url, args, body, auth);
    }
    /**
     * @see request
     */
    async delete(url, args, auth = AuthMode.On) {
        return this.request("DELETE", url, args, null, auth);
    }
    /**
     * Convert request body
     * @param body The body data
     * @param headers The headers (can be modified to add/remove headers)
     * @return The body data passed to fetch
     * @protected
     */
    convertBody(body, headers) {
        if (!body)
            return null;
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
    async request(method, url, args, body, auth) {
        const safeToLeave = method !== "GET" ? UnsafeToLeaveDispatch.lock(method + "-request") : null;
        if (this.handlePreRequest) {
            void (await this.handlePreRequest(method, url, args, body, auth));
        }
        try {
            const headers = {};
            // Handle localization
            headers["Accept-Language"] = ccI18n.language;
            // Handle authentication
            if (auth !== AuthMode.Off) {
                headers.Authorization = await this.handleAuthentication(auth);
            }
            let response;
            if (this.customRequestPerformer) {
                response = await this.customRequestPerformer(method, url, args, headers, body, auth);
            }
            if (!response) {
                // Handle URL GET arguments
                const urlWithArgs = addGetParams(url, args);
                // Handle POST data
                body = this.convertBody(body, headers);
                // Perform request
                try {
                    response = await fetch(urlWithArgs, {
                        body: body,
                        headers,
                        method,
                    });
                }
                catch (e) {
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
            return (await this.handleResponse(response, responseData, method, url, args, body, auth));
        }
        catch (e) {
            if (this.exceptionHook) {
                this.exceptionHook(e);
            }
            throw e;
        }
        finally {
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
