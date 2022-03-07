/*
utils for object dot notation
what is the dot notation? this is best explained by example:

suppose you have an object:
```js
const a = {
  b: {
    c: {
      d: 1
    }
  }
}
```

now you want to access the number stored in d, in JS you would just do
`a.b.c.d`, but what about dynamic paths? You'd have to write a['b']['c']['d'],
but this of course is limited to a fixed depth. Here's where dot notation and these
utils come in handy. You can simply access the number by calling `getValueByDot("b.c.d", a)`

The following utils are for the conversion of nested objects to dot-notation based records and vice versa
 */

export const dotToObject = (
	field: string,
	value: unknown
): Record<string, unknown> => {
	const fieldParts = field.split(".").reverse();
	for (const fieldPart of fieldParts) {
		value = {
			[fieldPart]: value,
		};
	}
	return value as Record<string, unknown>;
};

export const getValueByDot = (
	field: string,
	data: Record<string, unknown>
): unknown => {
	const fieldParts = field.split(".");
	let value: unknown = data;
	for (let i = 0; i < fieldParts.length; ++i) {
		if (typeof value !== "object") return undefined;
		value = (value as Record<string, unknown>)[fieldParts[i]];
	}
	return value;
};

export const objectToDots = (
	obj: Record<string, unknown>
): Record<string, unknown> => {
	const ret: Record<string, unknown> = {};
	for (const key in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

		const value = obj[key];
		if (typeof value === "object") {
			const dots = objectToDots(value as Record<string, unknown>);
			Object.entries(dots).forEach(([dot, nestedValue]) => {
				ret[key + "." + dot] = nestedValue;
			});
		} else {
			ret[key] = value;
		}
	}
	return ret;
};

export const dotsToObject = (
	dots: Record<string, unknown>
): Record<string, unknown> => {
	const result: Record<string, unknown> = {};

	for (const key in dots) {
		if (!Object.prototype.hasOwnProperty.call(dots, key)) continue;

		const parts = key.split(".");
		let insertion = result;
		parts.forEach((part, idx) => {
			// set value
			if (idx == parts.length - 1) {
				insertion[part] = dots[key];
				return;
			}
			// or create nested object
			if (!(part in insertion)) {
				insertion[part] = {};
			}
			insertion = insertion[part] as Record<string, unknown>;
		});
	}

	return result;
};

export const dotSet = (
	field: string,
	value: Record<string, unknown>,
	data: unknown
): Record<string, unknown> => {
	const fieldParts = field.split(".");
	value = { ...value };
	const ret = value;
	for (let i = 0; i < fieldParts.length - 1; ++i) {
		if (typeof value[fieldParts[i]] !== "object") throw new Error("invalid");
		value = { ...(value[fieldParts[i]] as Record<string, unknown>) };
	}
	value[fieldParts[fieldParts.length - 1]] = data;
	return ret;
};
