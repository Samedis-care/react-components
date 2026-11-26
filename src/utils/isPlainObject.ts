/**
 * Is the value a plain object, a record of keys and values: an object literal,
 * the result of JSON.parse, or an object without a prototype
 * (Object.create(null))?
 *
 * Told by its prototype, not by its `constructor` property, which a record may
 * hold as an entry of its own (a field named "constructor").
 * @param o The value to check
 * @returns false for null, arrays, class instances (Date, Blob, Map, ...) and
 *          objects that inherit from another object than Object.prototype
 */
const isPlainObject = (o: unknown): o is Record<string, unknown> => {
	if (typeof o !== "object" || o === null) return false;
	const prototype: unknown = Object.getPrototypeOf(o);
	return prototype === Object.prototype || prototype === null;
};

export default isPlainObject;
