/**
 * `Omit` for a union: the keys are left out of every member, so the union stays. A plain
 * `Omit` collapses the members into one object type, which loses the parts that differ
 * between them.
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
	? Omit<T, K>
	: never;

/**
 * `Partial`, except that the properties in `K` keep the type of the union member they
 * belong to: a property that member requires (`switchLabel` with `displaySwitch`) stays
 * required. For test doubles and stories that spread their props into the component.
 */
export type PartialExcept<T, K extends PropertyKey> = T extends unknown
	? Partial<Omit<T, Extract<keyof T, K>>> & Pick<T, Extract<keyof T, K>>
	: never;
