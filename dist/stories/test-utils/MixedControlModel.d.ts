import { Model, ModelDataTypeBooleanCheckboxRendererMUI, ModelDataTypeBooleanSwitchRendererMUI, ModelDataTypeDateNullableRendererMUI, ModelDataTypeEnumRadioRendererMUI, ModelDataTypeEnumSelectRenderer, ModelDataTypeImageRenderer, ModelDataTypeStringRendererMUI } from "../../backend-integration";
/**
 * One record, one field per control family, for stories that need to see how something
 * behaves across the whole spread of renderers rather than on a text field alone.
 */
declare const sampleData: Record<string, unknown>[];
declare const createMixedControlModel: () => Model<{
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
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    notes: {
        type: ModelDataTypeStringRendererMUI;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    active: {
        type: ModelDataTypeBooleanCheckboxRendererMUI;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    notify: {
        type: ModelDataTypeBooleanSwitchRendererMUI;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    department: {
        type: ModelDataTypeEnumSelectRenderer<string>;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    priority: {
        type: ModelDataTypeEnumRadioRendererMUI<string>;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    avatar: {
        type: ModelDataTypeImageRenderer;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
    start_date: {
        type: ModelDataTypeDateNullableRendererMUI;
        getLabel: () => string;
        visibility: {
            overview: import("../..").ModelVisibility;
            edit: import("../..").ModelVisibility;
            create: import("../..").ModelVisibility;
        };
        customData: null;
    };
}, "id" | "active" | "avatar" | "first_name" | "notes" | "notify" | "department" | "priority" | "start_date">;
export { sampleData };
export default createMixedControlModel;
