import Model, {
	ModelDef,
	ModelFieldDefinition,
	PageVisibility,
} from "../../../backend-integration/Model/Model";
import {
	ModelDataTypeBooleanRendererMUI,
	ModelDataTypeDateNullableRendererMUI,
	ModelDataTypeEnumRadioRendererMUI,
	ModelDataTypeEnumSelectRendererMUI,
	ModelDataTypeFilesRenderer,
	ModelDataTypeImageRenderer,
	ModelDataTypeStringRendererMUI,
} from "../../../backend-integration/Model/Types/Renderers";
import VisibilityDisabled from "../../../backend-integration/Model/Visibilities/VisibilityDisabled";
import VisibilityHidden from "../../../backend-integration/Model/Visibilities/VisibilityHidden";
import FormStoryConnector from "./Connector";
import VisibilityView from "../../../backend-integration/Model/Visibilities/VisibilityView";
import VisibilityEditRequired from "../../../backend-integration/Model/Visibilities/VisibilityEditRequired";
import VisibilityEdit from "../../../backend-integration/Model/Visibilities/VisibilityEdit";

// Performance Testing

const generateTestEntry = (
	label: string
): ModelFieldDefinition<string, PageVisibility, null> => ({
	type: new ModelDataTypeStringRendererMUI(),
	visibility: {
		overview: VisibilityView,
		edit: VisibilityView,
		create: VisibilityEditRequired,
	},
	getLabel: () => label,
	customData: null,
});

export const performanceTestDataCount = 0;
const testData: ModelDef<string, PageVisibility, null> = {};
for (let i = 0; i < performanceTestDataCount; ++i) {
	testData["perf_" + i.toString()] = generateTestEntry(
		"Performance Test " + i.toString()
	);
}

// End Performance Testing

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
		notes: {
			type: new ModelDataTypeStringRendererMUI(true),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "Notes",
			customData: null,
		},
		user_type: {
			type: new ModelDataTypeEnumRadioRendererMUI(
				[
					{ value: "normal", getLabel: () => "Normal" },
					{ value: "special", getLabel: () => "Special" },
				],
				true
			),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "User Type",
			customData: null,
		},
		locale: {
			type: new ModelDataTypeEnumSelectRendererMUI([
				{ value: "en-US", getLabel: () => "English - United States (en-US)" },
				{ value: "de-DE", getLabel: () => "German - Germany (de-DE)" },
			]),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "Locale",
			customData: null,
		},
		profile_picture: {
			type: new ModelDataTypeImageRenderer(),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "Profile Picture",
			customData: null,
		},
		documents: {
			type: new ModelDataTypeFilesRenderer({ maxFiles: 3 }),
			visibility: {
				overview: VisibilityView,
				edit: VisibilityEdit,
				create: VisibilityEdit,
			},
			getLabel: () => "Documents",
			customData: null,
		},
		...testData,
	},
	new FormStoryConnector()
);

export default FormStoryModel;
