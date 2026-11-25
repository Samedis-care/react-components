import { ModelUnknown } from "../../../backend-integration";
import { CrudImporterState } from "./index";
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
declare const convertImportRow: (model: ModelUnknown, conversionScripts: CrudImporterState["conversionScripts"], row: Record<string, unknown>) => Record<string, unknown>;
export default convertImportRow;
