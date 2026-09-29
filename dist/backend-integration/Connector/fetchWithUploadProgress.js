/**
 * Statuses the Response constructor refuses a body for
 */
const NULL_BODY_STATUSES = [101, 103, 204, 205, 304];
const parseHeaders = (raw) => {
    const headers = new Headers();
    raw
        .trim()
        .split(/[\r\n]+/)
        .forEach((line) => {
        const separator = line.indexOf(":");
        if (separator <= 0)
            return;
        try {
            headers.append(line.substring(0, separator).trim(), line.substring(separator + 1).trim());
        }
        catch {
            // a header fetch would not hand out either
        }
    });
    return headers;
};
/**
 * Sends a request like fetch does, but with XMLHttpRequest, which reports upload progress
 * @param url The URL
 * @param init The request
 * @param onUploadProgress Called as the body is uploaded
 * @returns The response, for every HTTP status (like fetch)
 * @throws The signal's reason if aborted, a TypeError if no response arrived (like fetch)
 */
const fetchWithUploadProgress = (url, init, onUploadProgress) => new Promise((resolve, reject) => {
    const { method, headers, body, signal } = init;
    // like fetch: rejects with whatever the signal was aborted with
    const abortReason = () => signal?.reason;
    if (signal?.aborted) {
        reject(abortReason());
        return;
    }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const settle = () => signal?.removeEventListener("abort", abort);
    xhr.open(method, url);
    // an ArrayBuffer hands the bytes to Response as they came
    xhr.responseType = "arraybuffer";
    Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, value));
    xhr.upload.addEventListener("progress", (evt) => {
        onUploadProgress({
            loaded: evt.loaded,
            total: evt.lengthComputable ? evt.total : null,
        });
    });
    xhr.addEventListener("load", () => {
        settle();
        let response;
        try {
            response = new Response(NULL_BODY_STATUSES.includes(xhr.status)
                ? null
                : xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders()),
            });
        }
        catch {
            reject(new TypeError(`Unsupported response status ${xhr.status}`));
            return;
        }
        resolve(response);
    });
    const fail = () => {
        settle();
        reject(new TypeError("Failed to send request"));
    };
    xhr.addEventListener("error", fail);
    xhr.addEventListener("timeout", fail);
    xhr.addEventListener("abort", () => {
        settle();
        reject(signal?.aborted
            ? abortReason()
            : new DOMException("The request was aborted", "AbortError"));
    });
    signal?.addEventListener("abort", abort, { once: true });
    xhr.send(body);
});
export default fetchWithUploadProgress;
