/**
 * The URL to show a file value with
 * @param value A URL, or a Blob (e.g. a file the user picked)
 * @returns The URL itself, or an object URL for the Blob. Undefined while there is none:
 *          for no value, and on the first render with a new Blob.
 * @remarks The object URL is revoked once the value changes or the component unmounts
 */
declare const useObjectUrl: (value: string | Blob | null | undefined) => string | undefined;
export default useObjectUrl;
