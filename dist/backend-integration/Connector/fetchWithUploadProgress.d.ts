/**
 * How far the upload of a request body has come
 */
export interface RequestUploadProgress {
    /**
     * Bytes sent so far
     */
    loaded: number;
    /**
     * Bytes to send in total, null if the browser cannot tell
     */
    total: number | null;
}
export interface FetchWithUploadProgressInit {
    method: string;
    headers: Record<string, string>;
    body: XMLHttpRequestBodyInit | null;
    signal?: AbortSignal;
}
/**
 * Sends a request like fetch does, but with XMLHttpRequest, which reports upload progress
 * @param url The URL
 * @param init The request
 * @param onUploadProgress Called as the body is uploaded
 * @returns The response, for every HTTP status (like fetch)
 * @throws The signal's reason if aborted, a TypeError if no response arrived (like fetch)
 */
declare const fetchWithUploadProgress: (url: string, init: FetchWithUploadProgressInit, onUploadProgress: (progress: RequestUploadProgress) => void) => Promise<Response>;
export default fetchWithUploadProgress;
