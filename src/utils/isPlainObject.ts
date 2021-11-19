const isPlainObject = (o: unknown): boolean =>
	typeof o == "object" && o != null && o.constructor == Object;

export default isPlainObject;
