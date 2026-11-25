/**
 * `Omit` for a union: the keys are left out of every member, so the union stays. A plain
 * `Omit` collapses the members into one object type, which loses the parts that differ
 * between them.
 *
 * Use it to derive a wrapper's props from props that are a union, such as the selectors'
 * (`BackendSingleSelectProps`, `MultiSelectProps`, …: with or without a switch). Props built
 * with `Omit` no longer fit back into the component. As an `interface` cannot extend a union,
 * the wrapper's props become a `type` with an intersection:
 * @example
 * type DeviceSelectorProps = DistributiveOmit<
 * 	BackendSingleSelectProps<DeviceModel>,
 * 	"model" | "modelToSelectorData"
 * > & { tenantId: string };
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/**
 * `Partial`, except that the properties in `K` keep the type of the union member they
 * belong to: a property that member requires (`switchLabel` with `displaySwitch`) stays
 * required. For a theme's `defaultProps` (`src/theme-def.ts`), and for test doubles and
 * stories that spread their props into the component.
 */
export type PartialExcept<T, K extends PropertyKey> = T extends unknown ? Partial<Omit<T, Extract<keyof T, K>>> & Pick<T, Extract<keyof T, K>> : never;
