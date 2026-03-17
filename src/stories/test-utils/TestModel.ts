import {
	Model,
	ModelFieldName,
	ModelDataTypeStringRendererMUI,
	ModelVisibilityDisabled,
	ModelVisibilityEditRequired,
	ModelVisibilityGridView,
	ModelVisibilityHidden,
	PageVisibility,
} from "../../backend-integration";
import Connector from "../../backend-integration/Connector/Connector";
import MockConnector from "./MockConnector";

const sampleData: Record<string, unknown>[] = [
	{
		id: "1",
		first_name: "Alice",
		last_name: "Mueller",
		email: "alice@example.com",
		department: "Engineering",
	},
	{
		id: "2",
		first_name: "Bob",
		last_name: "Smith",
		email: "bob@example.com",
		department: "Marketing",
	},
	{
		id: "3",
		first_name: "Carol",
		last_name: "Jones",
		email: "carol@example.com",
		department: "Sales",
	},
	{
		id: "4",
		first_name: "Dave",
		last_name: "Brown",
		email: "dave@example.com",
		department: "Engineering",
	},
	{
		id: "5",
		first_name: "Eve",
		last_name: "Davis",
		email: "eve@example.com",
		department: "HR",
	},
	{
		id: "6",
		first_name: "Frank",
		last_name: "Wilson",
		email: "frank@example.com",
		department: "Engineering",
	},
	{
		id: "7",
		first_name: "Grace",
		last_name: "Lee",
		email: "grace@example.com",
		department: "Marketing",
	},
	{
		id: "8",
		first_name: "Henry",
		last_name: "Taylor",
		email: "henry@example.com",
		department: "Sales",
	},
];

const createTestModel = (): Model<ModelFieldName, PageVisibility, null> =>
	new Model(
		"test-model-" + Date.now().toString(16),
		{
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
				filterable: true,
				sortable: true,
				visibility: {
					overview: ModelVisibilityGridView,
					edit: ModelVisibilityEditRequired,
					create: ModelVisibilityEditRequired,
				},
				customData: null,
			},
			last_name: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Last Name",
				filterable: true,
				sortable: true,
				visibility: {
					overview: ModelVisibilityGridView,
					edit: ModelVisibilityEditRequired,
					create: ModelVisibilityEditRequired,
				},
				customData: null,
			},
			email: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Email",
				filterable: true,
				sortable: true,
				visibility: {
					overview: ModelVisibilityGridView,
					edit: ModelVisibilityEditRequired,
					create: ModelVisibilityEditRequired,
				},
				customData: null,
			},
			department: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Department",
				filterable: true,
				sortable: true,
				visibility: {
					overview: ModelVisibilityGridView,
					edit: ModelVisibilityEditRequired,
					create: ModelVisibilityEditRequired,
				},
				customData: null,
			},
		},
		new MockConnector(sampleData) as Connector<
			ModelFieldName,
			PageVisibility,
			null
		>,
	);

export { sampleData };
export default createTestModel;
