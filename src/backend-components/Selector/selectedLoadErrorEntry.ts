import type { BaseSelectorData, MultiSelectorData } from "../../standalone";

/**
 * Marks the entry listed for a selected id whose record failed to load
 */
const LOAD_ERROR = Symbol("selected record that failed to load");

/**
 * The entry listed for a selected id whose record failed to load
 * @param value The entry's id
 * @param label Its label (see getSelectedLoadErrorLabel)
 * @remarks A field that shows such an entry is marked as erroneous (`error`). The mark is
 *          not enumerable: `onSelect`'s `raw` reports the entry as the plain
 *          `{ value, label }` it is, and a copy of it is an ordinary entry.
 */
export const makeSelectedLoadErrorEntry = (
	value: string,
	label: string,
): MultiSelectorData =>
	Object.defineProperty({ value, label }, LOAD_ERROR, { value: true });

/**
 * Whether the entry is the one listed for a selected id whose record failed to load
 * @param entry A selected entry
 */
export const isSelectedLoadErrorEntry = (entry: BaseSelectorData): boolean =>
	LOAD_ERROR in entry;
