/**
 * Use route params
 */
declare const useParams: <T extends string = string>() => Partial<Record<T, string>>;
export default useParams;
