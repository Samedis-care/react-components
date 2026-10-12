import { Model, ModelDataTypeStringRendererMUI } from "../../backend-integration";
declare const sampleData: Record<string, unknown>[];
declare const createTestModel: () => Model<{
    id: {
        type: ModelDataTypeStringRendererMUI;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    first_name: {
        type: ModelDataTypeStringRendererMUI;
        getLabel: () => string;
        filterable: true;
        sortable: true;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    last_name: {
        type: ModelDataTypeStringRendererMUI;
        getLabel: () => string;
        filterable: true;
        sortable: true;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    email: {
        type: ModelDataTypeStringRendererMUI;
        getLabel: () => string;
        filterable: true;
        sortable: true;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    department: {
        type: ModelDataTypeStringRendererMUI;
        getLabel: () => string;
        filterable: true;
        sortable: true;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
}, "id" | "email" | "first_name" | "department" | "last_name">;
export { sampleData };
export default createTestModel;
