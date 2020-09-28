import Model from "../../../backend-integration/Model/Model";
import {
	ModelDataTypeBooleanRendererMUI,
	ModelDataTypeDateNullableRendererMUI,
	ModelDataTypeStringRendererMUI,
} from "../../../backend-integration/Model/Types/Renderers";
import VisibilityDisabled from "../../../backend-integration/Model/Visibilities/VisibilityDisabled";
import VisibilityHidden from "../../../backend-integration/Model/Visibilities/VisibilityHidden";
import FormStoryConnector from "./Connector";
import VisibilityView from "../../../backend-integration/Model/Visibilities/VisibilityView";
import VisibilityEditRequired from "../../../backend-integration/Model/Visibilities/VisibilityEditRequired";
import VisibilityEdit from "../../../backend-integration/Model/Visibilities/VisibilityEdit";

const FormStoryModel = new Model(
	"form-story",
	{
		id: {
			type: new ModelDataTypeStringRendererMUI(),
			visibility: {
				overview: VisibilityDisabled,
				edit: VisibilityHidden,
				create: VisibilityDisabled,
			},
			getLabel: () => "ID",
			customData: null,
		},
		username: {
			type: new ModelDataTypeStringRendererMUI(),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityView,
				create: VisibilityEditRequired,
			},
			getLabel: () => "Username",
			customData: null,
		},
		first_name: {
			type: new ModelDataTypeStringRendererMUI(),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEditRequired,
				create: VisibilityEditRequired,
			},
			getLabel: () => "First name",
			customData: null,
		},
		middle_name: {
			type: new ModelDataTypeStringRendererMUI(),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "Middle Name",
			customData: null,
		},
		last_name: {
			type: new ModelDataTypeStringRendererMUI(),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEditRequired,
				create: VisibilityEditRequired,
			},
			getLabel: () => "Last Name",
			customData: null,
		},
		birthday: {
			type: new ModelDataTypeDateNullableRendererMUI(),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "Birthday",
			customData: null,
		},
		accept_tos: {
			type: new ModelDataTypeBooleanRendererMUI(),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "Accept TOS?",
			customData: null,
		},
	},
	new FormStoryConnector()
);

export default FormStoryModel;
