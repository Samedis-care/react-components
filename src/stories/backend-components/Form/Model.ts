import Model from "../../../backend-integration/Model/Model";
import { ModelDataTypeStringRendererMUI } from "../../../backend-integration/Model/Types/Renderers";
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
	},
	new FormStoryConnector()
);

export default FormStoryModel;
