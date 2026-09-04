import { Model, ModelDataTypeBooleanCheckboxRendererMUI, ModelDataTypeBooleanSwitchRendererMUI, ModelDataTypeDateNullableRendererMUI, ModelDataTypeEnumRadioRendererMUI, ModelDataTypeEnumSelectRenderer, ModelDataTypeImageRenderer, ModelDataTypeStringRendererMUI, ModelVisibilityDisabled, ModelVisibilityEdit, ModelVisibilityEditRequired, ModelVisibilityGridView, ModelVisibilityHidden, } from "../../backend-integration";
import MockConnector from "./MockConnector";
/**
 * One record, one field per control family, for stories that need to see how something
 * behaves across the whole spread of renderers rather than on a text field alone.
 */
const sampleData = [
    {
        id: "1",
        first_name: "Alice",
        notes: "Joined the team in March.\nWorks from the Berlin office.",
        active: true,
        notify: false,
        department: "engineering",
        priority: "normal",
        start_date: "2026-03-02",
        avatar: "",
    },
];
const departments = [
    { value: "engineering", getLabel: () => "Engineering" },
    { value: "marketing", getLabel: () => "Marketing" },
    { value: "sales", getLabel: () => "Sales" },
];
const priorities = [
    { value: "low", getLabel: () => "Low" },
    { value: "normal", getLabel: () => "Normal" },
    { value: "high", getLabel: () => "High" },
];
const createMixedControlModel = () => new Model("mixed-control-model-" + Date.now().toString(16), {
    id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "ID",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityHidden,
            create: ModelVisibilityDisabled,
        },
        customData: null,
    },
    first_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "First Name",
        visibility: {
            overview: ModelVisibilityGridView,
            edit: ModelVisibilityEditRequired,
            create: ModelVisibilityEditRequired,
        },
        customData: null,
    },
    notes: {
        // outlined variant: the label sits in a gap in the border
        type: new ModelDataTypeStringRendererMUI({ multiline: true, rows: 3 }),
        getLabel: () => "Notes",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityEdit,
            create: ModelVisibilityEdit,
        },
        customData: null,
    },
    active: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "Active",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityEdit,
            create: ModelVisibilityEdit,
        },
        customData: null,
    },
    notify: {
        type: new ModelDataTypeBooleanSwitchRendererMUI(),
        getLabel: () => "Send notifications",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityEdit,
            create: ModelVisibilityEdit,
        },
        customData: null,
    },
    department: {
        type: new ModelDataTypeEnumSelectRenderer(departments),
        getLabel: () => "Department",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityEditRequired,
            create: ModelVisibilityEditRequired,
        },
        customData: null,
    },
    priority: {
        type: new ModelDataTypeEnumRadioRendererMUI(priorities),
        getLabel: () => "Priority",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityEdit,
            create: ModelVisibilityEdit,
        },
        customData: null,
    },
    avatar: {
        // labels itself through a GroupBox legend, not a MUI FormLabel
        type: new ModelDataTypeImageRenderer(),
        getLabel: () => "Avatar",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityEdit,
            create: ModelVisibilityEdit,
        },
        customData: null,
    },
    start_date: {
        type: new ModelDataTypeDateNullableRendererMUI(),
        getLabel: () => "Start Date",
        visibility: {
            overview: ModelVisibilityDisabled,
            edit: ModelVisibilityEdit,
            create: ModelVisibilityEdit,
        },
        customData: null,
    },
}, new MockConnector(sampleData));
export { sampleData };
export default createMixedControlModel;
