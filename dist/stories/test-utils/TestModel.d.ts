import { Model } from "../../backend-integration";
declare const sampleData: Record<string, unknown>[];
declare const createTestModel: () => Model<"id" | "email" | "first_name" | "last_name" | "department", {
    overview: import("../..").ModelVisibility;
    edit: import("../..").ModelVisibility;
    create: import("../..").ModelVisibility;
}, null>;
export { sampleData };
export default createTestModel;
