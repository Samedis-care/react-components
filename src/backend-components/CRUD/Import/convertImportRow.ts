import { ModelUnknown } from "../../../backend-integration";
import deepAssign from "../../../utils/deepAssign";
import { dotToObject } from "../../../utils/dotUtils";
import { CrudImporterState, isFieldImportable } from "./index";
import normalizeImportValue from "./normalizeImportValue";

/**
 * Converts one row of the uploaded worksheet into the model record of the import: the
 * record step 3 validates and step 4 writes.
 *
 * Runs the conversion of every importable field (isFieldImportable) once and passes its
 * result through normalizeImportValue. A result of `undefined`, and a field without a
 * conversion, is left out of the record; every other result is kept, `null`, `""`, `0` and
 * `false` included. Dotted field names ("contact.email") are written nested.
 * @param model The model to import into
 * @param conversionScripts The conversion per field name
 * @param row The row of the worksheet
 * @returns The model record
 * @throws The error of a conversion that throws
 */
const convertImportRow = (
	model: ModelUnknown,
	conversionScripts: CrudImporterState["conversionScripts"],
	row: Record<string, unknown>,
): Record<string, unknown> => {
	const modelRecord: Record<string, unknown> = {};
	Object.entries(model.fields)
		.filter(([name, field]) => isFieldImportable(name, field))
		.forEach(([name, field]) => {
			const value = normalizeImportValue(
				field,
				conversionScripts[name]?.scriptFn(row),
			);
			if (value === undefined) return;
			deepAssign(modelRecord, dotToObject(name, value));
		});
	return modelRecord;
};

export default convertImportRow;
