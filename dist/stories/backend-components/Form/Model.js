var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import Model from "../../../backend-integration/Model/Model";
import { ModelDataTypeBooleanCheckboxRendererMUI, ModelDataTypeDateNullableRendererMUI, ModelDataTypeEnumRadioRendererMUI, ModelDataTypeEnumSelectRendererMUI, ModelDataTypeFilesRenderer, ModelDataTypeImageRenderer, ModelDataTypeStringRendererMUI, } from "../../../backend-integration/Model/Types/Renderers";
import VisibilityDisabled from "../../../backend-integration/Model/Visibilities/VisibilityDisabled";
import VisibilityHidden from "../../../backend-integration/Model/Visibilities/VisibilityHidden";
import FormStoryConnector from "./Connector";
import VisibilityView from "../../../backend-integration/Model/Visibilities/VisibilityView";
import VisibilityEditRequired from "../../../backend-integration/Model/Visibilities/VisibilityEditRequired";
import VisibilityEdit from "../../../backend-integration/Model/Visibilities/VisibilityEdit";
// Performance Testing
var generateTestEntry = function (label) { return ({
    type: new ModelDataTypeStringRendererMUI(),
    visibility: {
        overview: VisibilityView,
        edit: VisibilityView,
        create: VisibilityEditRequired,
    },
    getLabel: function () { return label; },
    customData: null,
}); };
export var performanceTestDataCount = 0;
var testData = {};
for (var i = 0; i < performanceTestDataCount; ++i) {
    testData["perf_" + i.toString()] = generateTestEntry("Performance Test " + i.toString());
}
// End Performance Testing
var FormStoryModel = new Model("form-story", __assign({ id: {
        type: new ModelDataTypeStringRendererMUI(),
        visibility: {
            overview: VisibilityDisabled,
            edit: VisibilityHidden,
            create: VisibilityDisabled,
        },
        getLabel: function () { return "ID"; },
        customData: null,
    }, username: {
        type: new ModelDataTypeStringRendererMUI(),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityView,
            create: VisibilityEditRequired,
        },
        getLabel: function () { return "Username"; },
        customData: null,
    }, first_name: {
        type: new ModelDataTypeStringRendererMUI(),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEditRequired,
            create: VisibilityEditRequired,
        },
        getLabel: function () { return "First name"; },
        customData: null,
    }, middle_name: {
        type: new ModelDataTypeStringRendererMUI(),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEdit,
            create: VisibilityEdit,
        },
        getLabel: function () { return "Middle Name"; },
        customData: null,
    }, last_name: {
        type: new ModelDataTypeStringRendererMUI(),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEditRequired,
            create: VisibilityEditRequired,
        },
        getLabel: function () { return "Last Name"; },
        customData: null,
    }, birthday: {
        type: new ModelDataTypeDateNullableRendererMUI(),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEditRequired,
            create: VisibilityEditRequired,
        },
        getLabel: function () { return "Birthday"; },
        customData: null,
        validate: function (value) {
            if (value === null)
                return "Birthday must be set";
            return null;
        },
    }, accept_tos: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEdit,
            create: VisibilityEdit,
        },
        getLabel: function () { return "Accept TOS?"; },
        customData: null,
    }, notes: {
        type: new ModelDataTypeStringRendererMUI({
            multiline: true,
        }),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEdit,
            create: VisibilityEdit,
        },
        getLabel: function () { return "Notes"; },
        customData: null,
    }, user_type: {
        type: new ModelDataTypeEnumRadioRendererMUI([
            { value: "normal", getLabel: function () { return "Normal"; } },
            { value: "special", getLabel: function () { return "Special"; } },
        ], true),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEdit,
            create: VisibilityEdit,
        },
        getLabel: function () { return "User Type"; },
        customData: null,
    }, locale: {
        type: new ModelDataTypeEnumSelectRendererMUI([
            { value: "en-US", getLabel: function () { return "English - United States (en-US)"; } },
            { value: "de-DE", getLabel: function () { return "German - Germany (de-DE)"; } },
        ]),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEdit,
            create: VisibilityEdit,
        },
        getLabel: function () { return "Locale"; },
        customData: null,
    }, profile_picture: {
        type: new ModelDataTypeImageRenderer(),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEdit,
            create: VisibilityEdit,
        },
        getLabel: function () { return "Profile Picture"; },
        customData: null,
    }, documents: {
        type: new ModelDataTypeFilesRenderer({ maxFiles: 3 }),
        visibility: {
            overview: VisibilityView,
            edit: VisibilityEdit,
            create: VisibilityEdit,
        },
        getLabel: function () { return "Documents"; },
        customData: null,
    } }, testData), new FormStoryConnector());
export default FormStoryModel;
