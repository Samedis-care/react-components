import XLSX from "xlsx";
/**
 * Generate a localized excel import template for use with CRUD importer
 * @param model The model
 * @param fields The fields that are importable
 * @param fileName The download file name (xlsx)
 */
var generateLocalizedExcelImportTemplate = function (model, fields, fileName) {
    var book = XLSX.utils.book_new();
    var sheet = XLSX.utils.json_to_sheet([], {
        header: fields.map(function (field) {
            var _a;
            var fieldDef = model.fields[field];
            return ((_a = fieldDef.getColumnLabel) !== null && _a !== void 0 ? _a : fieldDef.getLabel)();
        }),
    });
    XLSX.utils.book_append_sheet(book, sheet);
    return new File([
        XLSX.write(book, {
            type: "array",
            bookType: "xlsx",
        }),
    ], fileName);
};
export default generateLocalizedExcelImportTemplate;
