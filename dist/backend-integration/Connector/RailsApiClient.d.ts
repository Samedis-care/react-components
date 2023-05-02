import JsonApiClient from "./JsonApiClient";
declare class RailsApiClient extends JsonApiClient {
    convertBody(body: unknown | null, headers: Record<string, string>): string | FormData | null;
}
export default RailsApiClient;
