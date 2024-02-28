import XLSX from "xlsx";
import { Model, ModelFieldName, PageVisibility } from "../backend-integration";

/**
 * Generate a localized excel import template for use with CRUD importer
 * @param model The model
 * @param fields The fields that are importable
 * @param fileName The download file name (xlsx)
 */
const generateLocalizedExcelImportTemplate = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
>(
	model: Model<KeyT, VisibilityT, CustomT>,
	fields: KeyT[],
	fileName: string,
) => {
	const book = XLSX.utils.book_new();
	const sheet = XLSX.utils.json_to_sheet([], {
		header: fields.map((field) => {
			const fieldDef = model.fields[field];
			return (fieldDef.getColumnLabel ?? fieldDef.getLabel)();
		}),
	});
	XLSX.utils.book_append_sheet(book, sheet);
	return new File(
		[
			XLSX.write(book, {
				type: "array",
				bookType: "xlsx",
			}) as ArrayBuffer,
		],
		fileName,
	);
};

export default generateLocalizedExcelImportTemplate;
