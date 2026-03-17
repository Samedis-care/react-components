import { Model, ModelFieldName, PageVisibility } from "../../backend-integration";
declare const sampleData: Record<string, unknown>[];
declare const createTestModel: () => Model<ModelFieldName, PageVisibility, null>;
export { sampleData };
export default createTestModel;
