import {
	Model,
	ModelDataTypeDateNullableRendererMUI,
	ModelDataTypeImageRenderer,
	ModelDataTypeStringRendererMUI,
	ModelFieldName,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityEditRequired,
	ModelVisibilityGridView,
	ModelVisibilityGridViewHidden,
	ModelVisibilityHidden,
	PageVisibility,
} from "../../../backend-integration";
import LocalStorageConnector from "../../backend-integration/LocalStorageConnector";

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
						edit: ModelVisibilityHidden,
					},
					customData: null,
				},
				avatar: {
					type: new ModelDataTypeImageRenderer(),
					getLabel: () => "Avatar",
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
					getLabel: () => "Last Name",
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
					getLabel: () => "First Name",
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
					getLabel: () => "Employee No.",
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
					getLabel: () => "Account",
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
					getLabel: () => "Joined at",
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
					getLabel: () => "Left at",
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
					getLabel: () => "E-Mail",
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
					getLabel: () => "Title",
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
					getLabel: () => "Notes",
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
					getLabel: () => "Mobile Number",
					visibility: {
						overview: ModelVisibilityGridViewHidden,
						create: ModelVisibilityEdit,
						edit: ModelVisibilityEdit,
					},
					customData: null,
				},
			},
			new LocalStorageConnector("crud-story-model")
		);
	}
}

const TestModelInstance = new TestModel();

export default TestModelInstance;
