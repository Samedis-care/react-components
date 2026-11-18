/**
 * Use route params
 * Each value is percent-decoded: "foo bar" at "foo%20bar", see
 * `PathMatch.params`.
 */
declare const useParams: <T extends string = string>() => Partial<Record<T, string>>;
export default useParams;
