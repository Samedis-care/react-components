var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Model, ModelDataTypeDateNullableRendererMUI, ModelDataTypeImageRenderer, ModelDataTypeStringRendererMUI, ModelVisibilityDisabled, ModelVisibilityEdit, ModelVisibilityEditRequired, ModelVisibilityGridView, ModelVisibilityGridViewHidden, ModelVisibilityHidden, } from "../../../backend-integration";
import LocalStorageConnector from "../../backend-integration/LocalStorageConnector";
var TestModel = /** @class */ (function (_super) {
    __extends(TestModel, _super);
    function TestModel() {
        return _super.call(this, "test-model", {
            id: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: false,
                getLabel: function () { return ""; },
                visibility: {
                    overview: ModelVisibilityDisabled,
                    create: ModelVisibilityDisabled,
                    edit: ModelVisibilityHidden,
                },
                customData: null,
            },
            avatar: {
                type: new ModelDataTypeImageRenderer(),
                getLabel: function () { return "Avatar"; },
                visibility: {
                    overview: ModelVisibilityGridView,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                columnWidth: [150, 150],
                customData: null,
            },
            last_name: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Last Name"; },
                visibility: {
                    overview: ModelVisibilityGridView,
                    create: ModelVisibilityEditRequired,
                    edit: ModelVisibilityEditRequired,
                },
                customData: null,
            },
            first_name: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "First Name"; },
                visibility: {
                    overview: ModelVisibilityGridView,
                    create: ModelVisibilityEditRequired,
                    edit: ModelVisibilityEditRequired,
                },
                customData: null,
            },
            employee_no: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Employee No."; },
                visibility: {
                    overview: ModelVisibilityGridView,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
            account: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Account"; },
                visibility: {
                    overview: ModelVisibilityGridViewHidden,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
            joined: {
                type: new ModelDataTypeDateNullableRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Joined at"; },
                visibility: {
                    overview: ModelVisibilityGridViewHidden,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
            left: {
                type: new ModelDataTypeDateNullableRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Left at"; },
                visibility: {
                    overview: ModelVisibilityGridViewHidden,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
            email: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "E-Mail"; },
                visibility: {
                    overview: ModelVisibilityDisabled,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
            title: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Title"; },
                visibility: {
                    overview: ModelVisibilityGridViewHidden,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
            notes: {
                type: new ModelDataTypeStringRendererMUI({ multiline: true }),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Notes"; },
                visibility: {
                    overview: ModelVisibilityGridViewHidden,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
            mobile_number: {
                type: new ModelDataTypeStringRendererMUI(),
                filterable: true,
                sortable: true,
                getLabel: function () { return "Mobile Number"; },
                visibility: {
                    overview: ModelVisibilityGridViewHidden,
                    create: ModelVisibilityEdit,
                    edit: ModelVisibilityEdit,
                },
                customData: null,
            },
        }, new LocalStorageConnector("crud-story-model")) || this;
    }
    return TestModel;
}(Model));
var TestModelInstance = new TestModel();
export default TestModelInstance;
