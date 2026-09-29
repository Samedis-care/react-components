import JsonApiClient from "./JsonApiClient";
declare class RailsApiClient extends JsonApiClient {
    /**
     * @remarks A body with a file (a Blob, or a data URI) is sent as multipart, with its
     *          files as file parts, as long as Rails' keys can express it. A Blob that is
     *          not a File is named `blob`, pass a File to name it.
     * @see JsonApiClient.convertBody
     */
    convertBody(body: unknown | null, headers: Record<string, string>): Promise<string | FormData | null>;
}
export default RailsApiClient;
