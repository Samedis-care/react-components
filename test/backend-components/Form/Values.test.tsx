import { describe, expect, it, vi } from "vitest";
import React, { useEffect } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import Form, {
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { Framework } from "../../../src/framework";
import { Model, ModelUnknown } from "../../../src/backend-integration";
import {
	capture,
	loaded,
	makeModel,
	mountForm,
	recordData,
	required,
	settle,
	setupFormTests,
	Sink,
	trySubmit,
} from "./formFixture";

setupFormTests();

describe("Form values: refetch and record changes", () => {
	it("[ISSUE-3501-ITEM-2] switching to a record that is already cached shows that record, not the previous one's edits", async () => {
		const model = makeModel();
		await model.getCached("2");
		const sink: Sink = {};
		const r = mountForm(model, capture(sink));
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "Edited for 1"));
		await settle();
		r.rerenderWith({ id: "2" });
		await waitFor(() => expect(sink.ctx!.values.id).toBe("2"));
		await settle();
		expect(sink.ctx!.values.title).toBe("T2");
		expect(sink.ctx!.values.loc).toEqual({ de: "x" });
		expect(sink.ctx!.touched.title).toBe(false);
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("[ISSUE-3501-ITEM-2] switching to another record drops the previous record's errors", async () => {
		const sink: Sink = {};
		const r = mountForm(
			makeModel({ title: { validate: required } }),
			capture(sink, () => <FormField name={"title"} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", ""));
		await waitFor(() => expect(sink.ctx!.errors.title).toBe("required"));
		r.rerenderWith({ id: "2" });
		await loaded(sink, "T2");
		// what leaving the field does
		act(() => sink.ctx!.setFieldTouched("title"));
		await settle();
		expect(sink.ctx!.errors.title).toBeUndefined();
		expect(screen.queryByText("required")).toBeNull();
	});

	it("[ISSUE-3501-ITEM-2] switching from a record to a new one starts from the default values, so saving creates a record", async () => {
		const connector = new MockConnector(recordData());
		const create = vi.spyOn(connector, "create");
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		const r = mountForm(makeModel(undefined, connector), capture(sink));
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("note", "Edited for 1"));
		await settle();
		r.rerenderWith({ id: null });
		await loaded(sink, "");
		expect(sink.ctx!.values).not.toHaveProperty("id");
		expect(sink.ctx!.values.note).toBe("");
		expect(sink.ctx!.dirty).toBe(false);
		act(() => sink.ctx!.setFieldValue("title", "New"));
		expect(await trySubmit(sink)).toBeNull();
		expect(update).not.toHaveBeenCalled();
		expect(create).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3501-ITEM-2] switching records mounts the page again and drops the custom state, as on a fresh mount", async () => {
		const model = makeModel();
		await model.getCached("2");
		const sink: Sink = {};
		let mounts = 0;
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			useEffect(() => {
				mounts++;
			}, []);
			return null;
		};
		const r = mountForm(model, Page);
		await loaded(sink);
		act(() => sink.ctx!.setCustomState<number>("tab", () => 2));
		expect(sink.ctx!.getCustomState("tab")).toBe(2);
		r.rerenderWith({ id: "2" });
		await loaded(sink, "T2");
		expect(mounts).toBe(2);
		expect(sink.ctx!.getCustomState("tab")).toBeUndefined();
	});

	it("[ISSUE-3501-ITEM-2] a create form given the id of the record it has just saved keeps its values and its page", async () => {
		const sink: Sink = {};
		let mounts = 0;
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			useEffect(() => {
				mounts++;
			}, []);
			return null;
		};
		const r = mountForm(makeModel(undefined, new MockConnector([])), Page, {
			id: null,
		});
		await loaded(sink, "");
		act(() => sink.ctx!.setFieldValue("title", "New"));
		expect(await trySubmit(sink)).toBeNull();
		expect(sink.ctx!.values.id).toBe("1");
		act(() => sink.ctx!.setFieldValue("note", "after the save"));
		await settle();
		r.rerenderWith({ id: "1" });
		await settle();
		expect(sink.ctx!.values.title).toBe("New");
		expect(sink.ctx!.values.note).toBe("after the save");
		expect(sink.ctx!.dirty).toBe(true);
		expect(mounts).toBe(1);
	});

	it("[ISSUE-3501-ITEM-2] another model starts the form over, the same model created again does not", async () => {
		const first = makeModel();
		const second = makeModel();
		await second.getCached("1");
		const sink: Sink = {};
		let mounts = 0;
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			useEffect(() => {
				mounts++;
			}, []);
			return null;
		};
		const el = (model: ModelUnknown) => (
			<Framework>
				<Form
					model={model}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={undefined}
					disableRouting
				>
					{Page}
				</Form>
			</Framework>
		);
		const r = render(el(first));
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "Edited"));
		await settle();
		// the same model id and cache keys, in a new object
		r.rerender(el(new Model(first.modelId, first.fields, first.connector)));
		await settle();
		expect(sink.ctx!.values.title).toBe("Edited");
		expect(mounts).toBe(1);
		r.rerender(el(second));
		await loaded(sink);
		expect(sink.ctx!.touched.title).toBe(false);
		expect(sink.ctx!.dirty).toBe(false);
		expect(mounts).toBe(2);
	});
});
