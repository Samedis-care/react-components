import { beforeAll, describe, expect, it } from "vitest";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelFieldDefinitionUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityEditRequired,
} from "../../src/backend-integration";
import { validatePresence } from "../../src/utils/validations";
import MockConnector from "../../src/stories/test-utils/MockConnector";
import ccI18n from "../../src/i18n";

beforeAll(async () => {
	// validatePresence looks its message up by name
	await ccI18n.loadNamespaces("translation");
});

let modelCounter = 0;

/**
 * A model with one text field, title, required in edit and create
 * @param validate The field's validate, if any
 */
const makeModel = (validate?: ModelFieldDefinitionUnknown["validate"]) =>
	new Model(
		"issue-3501-item-19-" + String(modelCounter++),
		{
			title: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Title",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityEditRequired,
					create: ModelVisibilityEditRequired,
				},
				validate,
				customData: null,
			},
		},
		new MockConnector([]),
	);

describe("[ISSUE-3501-ITEM-19] a required visibility marks the field, its validate refuses an empty value", () => {
	it("[ISSUE-3501-ITEM-19] Model.validate accepts an empty required field that has no validate", async () => {
		const model = makeModel();
		expect(await model.validate({ title: "" }, "create")).toEqual({});
		expect(await model.validate({ title: "" }, "edit")).toEqual({});
	});

	it("[ISSUE-3501-ITEM-19] validatePresence next to the required visibility refuses the empty value", async () => {
		const model = makeModel(validatePresence);
		expect(await model.validate({ title: "" }, "create")).toEqual({
			title: "The Title field is required",
		});
		expect(await model.validate({ title: "" }, "edit")).toEqual({
			title: "The Title field is required",
		});
		expect(await model.validate({ title: "T" }, "edit")).toEqual({});
	});
});
