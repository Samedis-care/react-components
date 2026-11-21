import { describe, expect, it } from "vitest";
import React from "react";
import { act } from "@testing-library/react";
import FormField, {
	FormFieldContextType,
	useFormFieldContext,
} from "../../../src/backend-components/Form/Field";
import {
	ModelDataTypeStringRendererMUI,
	ModelRenderParams,
} from "../../../src/backend-integration";
import {
	capture,
	loaded,
	makeModel,
	mountForm,
	settle,
	setupFormTests,
	Sink,
} from "./formFixture";

setupFormTests();

/**
 * A string type that records the render params of every render
 */
const recordingType = () => {
	const type = new ModelDataTypeStringRendererMUI();
	const renders: ModelRenderParams<string>[] = [];
	const original = type.render.bind(type);
	type.render = (params: ModelRenderParams<string>) => {
		renders.push(params);
		return original(params);
	};
	return { type, renders };
};

describe("FormField: render params", () => {
	it("[ISSUE-3501-ITEM-22] initialValue of a dot-notation field is its server value", async () => {
		const { type, renders } = recordingType();
		const sink: Sink = {};
		mountForm(
			makeModel({ "address.city": { type } }),
			capture(sink, () => <FormField name={"address.city"} />),
		);
		await loaded(sink);
		const last = renders[renders.length - 1];
		expect(last.value).toBe("C1");
		expect(last.initialValue).toBe("C1");
	});
});

describe("FormField: FormFieldContext", () => {
	it("[ISSUE-3501-ITEM-22] a dot-notation field's initialValue in the context stays its server value while the user edits it", async () => {
		const seen: FormFieldContextType<unknown>[] = [];
		const Probe = () => {
			seen.push(useFormFieldContext());
			return null;
		};
		const type = new ModelDataTypeStringRendererMUI();
		type.render = () => <Probe />;
		const sink: Sink = {};
		mountForm(
			makeModel({ "address.city": { type } }),
			capture(sink, () => <FormField name={"address.city"} />),
		);
		await loaded(sink);
		expect(seen[seen.length - 1]).toMatchObject({
			value: "C1",
			initialValue: "C1",
		});
		act(() => sink.ctx!.setFieldValue("address.city", "Edited"));
		await settle();
		expect(seen[seen.length - 1]).toMatchObject({
			value: "Edited",
			initialValue: "C1",
		});
	});
});
