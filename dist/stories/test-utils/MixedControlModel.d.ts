import { Model } from "../../backend-integration";
/**
 * One record, one field per control family, for stories that need to see how something
 * behaves across the whole spread of renderers rather than on a text field alone.
 */
declare const sampleData: Record<string, unknown>[];
declare const createMixedControlModel: () => Model<"id" | "active" | "avatar" | "first_name" | "notes" | "notify" | "department" | "priority" | "start_date", {
    overview: import("../..").ModelVisibility;
    edit: import("../..").ModelVisibility;
    create: import("../..").ModelVisibility;
}, null>;
export { sampleData };
export default createMixedControlModel;
