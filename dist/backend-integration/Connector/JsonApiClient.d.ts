import AuthMode from "./AuthMode";
export declare type GetParams = Record<string, unknown> | null;
/**
 * The authentication handler callback has to provide and/or obtain the authentication
 * @returns The Authentication header value
 * @throws If the user has no session
 */
export declare type AuthenticationHandlerCallback = (authMode: AuthMode) => Promise<string> | string;
/**
 * Can be used to show a loading status.
 * @param method The HTTP Verb
 * @param url The url of the request
 * @param args The query parameters of the request
 * @param body The JSON body of the request
 * @param auth The authentication mode of the request
 */
export declare type RequestHook = (method: string, url: string, args: GetParams, body: unknown | null, auth: AuthMode) => Promise<void> | void;
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
export declare type ResponseProcessor = (response: Response, responseData: unknown, method: string, url: string, args: GetParams, body: unknown | null, auth: AuthMode) => Promise<unknown> | unknown;
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
export declare type CustomRequestPerformer = (method: string, url: string, args: GetParams, headers: Record<string, string>, body: unknown | null, auth: AuthMode) => Promise<Response> | Response | undefined;
/**
 * Hook for exception handling (can be used to report to e.g. Sentry)
 * @param error The error which has happened
 * @remarks This cannot be used to handle errors generically! Also treat these errors as unhandled
 */
export declare type ExceptionHook = (error: Error) => void;
/**
 * A helper class to connect to JSON REST apis
 */
declare class JsonApiClient {
    handleAuthentication: AuthenticationHandlerCallback;
    handleResponse: ResponseProcessor;
    handlePreRequest?: RequestHook;
    handlePostRequest?: RequestHook;
    exceptionHook?: ExceptionHook;
    customRequestPerformer?: CustomRequestPerformer;
    constructor(authHandler: AuthenticationHandlerCallback, responseProcessor: ResponseProcessor, preRequestHook?: RequestHook, postRequestHook?: RequestHook, exceptionHook?: ExceptionHook, customRequestPerformer?: CustomRequestPerformer);
    /**
     * @see request
     */
    get<T>(url: string, args: GetParams, auth?: AuthMode): Promise<T>;
    /**
     * @see request
     */
    post<T>(url: string, args: GetParams, body: Record<string, unknown>, auth?: AuthMode): Promise<T>;
    /**
     * @see request
     */
    put<T>(url: string, args: GetParams, body: Record<string, unknown>, auth?: AuthMode): Promise<T>;
    /**
     * @see request
     */
    patch<T>(url: string, args: GetParams, body: Record<string, unknown>, auth?: AuthMode): Promise<T>;
    /**
     * @see request
     */
    delete<T>(url: string, args: GetParams, auth?: AuthMode): Promise<T>;
    /**
     * Convert request body
     * @param body The body data
     * @param headers The headers (can be modified to add/remove headers)
     * @return The body data passed to fetch
     * @protected
     */
    convertBody(body: unknown | null, headers: Record<string, string>): string | FormData | null;
    /**
     * Performs an HTTP request with automatic authorization if desired
     * @param method The HTTP Verb
     * @param url The url of the request
     * @param args The query parameters to pass
     * @param body The JSON body to pass
     * @param auth The authentication mode to use
     */
    request<T>(method: string, url: string, args: GetParams, body: unknown | null, auth: AuthMode): Promise<T>;
}
export default JsonApiClient;
