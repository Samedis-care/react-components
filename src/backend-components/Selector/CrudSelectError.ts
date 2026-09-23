import { BaseSelectorData } from "../../standalone";

export interface CrudSelectFailure<DataT extends BaseSelectorData> {
	/**
	 * The entry whose write did not go through
	 */
	entry: DataT;
	/**
	 * What was attempted for it
	 */
	action: "create" | "update" | "delete";
	/**
	 * Why it failed
	 */
	error: Error;
}

export const isCrudSelectError = (e: Error): e is CrudSelectError => {
	return e.name === "CcCrudSelectError";
};

const labelOf = (entry: BaseSelectorData): string =>
	typeof entry.label === "string" ? entry.label : entry.label[0];

/**
 * The writes of a selection change which did not go through.
 * Every other write of the same change did, and is reflected in the selection.
 */
export default class CrudSelectError<
	DataT extends BaseSelectorData = BaseSelectorData,
> extends Error {
	failures: CrudSelectFailure<DataT>[];
	constructor(failures: CrudSelectFailure<DataT>[]) {
		super(
			failures
				.map((failure) => `${labelOf(failure.entry)}: ${failure.error.message}`)
				.join("; "),
		);
		this.name = "CcCrudSelectError";
		this.failures = failures;
	}
}
