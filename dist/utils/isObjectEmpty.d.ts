/**
 * Checks if the given object is empty (has no keys)
 * @param object The object to check
 */
declare const isObjectEmpty: (object: Record<string | number | symbol, unknown>) => boolean;
export default isObjectEmpty;
