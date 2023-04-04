import { Model, PageVisibility } from "../backend-integration";
/**
 * Generate a localized excel import template for use with CRUD importer
 * @param model The model
 * @param fields The fields that are importable
 * @param fileName The download file name (xlsx)
 */
declare const generateLocalizedExcelImportTemplate: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(model: Model<KeyT, VisibilityT, CustomT>, fields: KeyT[], fileName: string) => File;
export default generateLocalizedExcelImportTemplate;
