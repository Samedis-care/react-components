import { ModelFieldNames, ModelUnknown } from "../backend-integration";
/**
 * Generate a localized excel import template for use with CRUD importer
 * @param model The model
 * @param fields The fields that are importable
 * @param fileName The download file name (xlsx)
 */
declare const generateLocalizedExcelImportTemplate: <M extends ModelUnknown>(model: M, fields: ModelFieldNames<M>[], fileName: string) => File;
export default generateLocalizedExcelImportTemplate;
