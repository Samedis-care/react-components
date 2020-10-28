import {
	Model,
	ModelDataTypeDateNullableRendererMUI,
	ModelDataTypeStringRendererMUI,
	ModelFieldName,
	ModelVisibilityDisabled,
	ModelVisibilityGridView,
	ModelVisibilityGridViewHidden,
	PageVisibility,
} from "../../../backend-integration";
import TestConnector from "./TestConnector";

class TestModel extends Model<ModelFieldName, PageVisibility, null> {
	constructor() {
		super(
			"test-model",
			{
				id: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: false,
					getLabel: () => "",
					visibility: {
						overview: ModelVisibilityDisabled,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				last_name: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "Last Name",
					visibility: {
						overview: ModelVisibilityGridView,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				first_name: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "First Name",
					visibility: {
						overview: ModelVisibilityGridView,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				employee_no: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "Employee No.",
					visibility: {
						overview: ModelVisibilityGridView,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				account: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "Account",
					visibility: {
						overview: ModelVisibilityGridViewHidden,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				joined: {
					type: new ModelDataTypeDateNullableRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "Joined at",
					visibility: {
						overview: ModelVisibilityGridViewHidden,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				left: {
					type: new ModelDataTypeDateNullableRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "Left at",
					visibility: {
						overview: ModelVisibilityGridViewHidden,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				email: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "E-Mail",
					visibility: {
						overview: ModelVisibilityDisabled,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				title: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "Title",
					visibility: {
						overview: ModelVisibilityGridViewHidden,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				notes: {
					type: new ModelDataTypeStringRendererMUI({ multiline: true }),
					filterable: true,
					sortable: true,
					getLabel: () => "Notes",
					visibility: {
						overview: ModelVisibilityGridViewHidden,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
				mobile_number: {
					type: new ModelDataTypeStringRendererMUI(),
					filterable: true,
					sortable: true,
					getLabel: () => "Mobile Number",
					visibility: {
						overview: ModelVisibilityGridViewHidden,
						create: ModelVisibilityDisabled,
						edit: ModelVisibilityDisabled,
					},
					customData: null,
				},
			},
			new TestConnector()
		);
	}
}

const TestModelInstance = new TestModel();

export default TestModelInstance;
