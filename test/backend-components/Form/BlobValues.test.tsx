import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import Form, {
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FormAutoSave from "../../../src/backend-components/Form/FormAutoSave";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import {
	Model,
	ModelDataTypeImageRenderer,
	ModelDataTypeStringRendererMUI,
	ModelVisibilityEdit,
	ModelVisibilityGridView,
	ModelVisibilityHidden,
	ModelVisibilityDisabled,
} from "../../../src/backend-integration";
import MockConnector from "../../../src/stories/test-utils/MockConnector";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
});

afterEach(cleanup);

const createImageModel = () => {
	const connector = new MockConnector([{ id: "1", image: "" }]);
	const update = vi.spyOn(connector, "update");
	const model = new Model(
		"blob-values-" + Math.random().toString(16),
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
			image: {
				type: new ModelDataTypeImageRenderer(),
				getLabel: () => "Image",
				visibility: {
					overview: ModelVisibilityGridView,
					edit: ModelVisibilityEdit,
					create: ModelVisibilityEdit,
				},
				customData: null,
			},
		},
		connector,
	);
	return { model, update };
};

const renderForm = (model: Model<string, never, unknown>, autoSave = false) => {
	const sink: { ctx?: ReturnType<typeof useFormContext> } = {};
	const Children = () => {
		sink.ctx = useFormContext();
		return autoSave ? <FormAutoSave debounceTime={0} /> : null;
	};
	render(
		<Framework>
			<Form model={model} id={"1"} errorComponent={DefaultErrorComponent}>
				{Children as unknown as React.ComponentType<never>}
			</Form>
		</Framework>,
	);
	return sink;
};

const png = (name: string) => new File(["png"], name, { type: "image/png" });

describe("Form with a picked image (Blob) as value", () => {
	it("is dirty for a picked image, and submits the File itself", async () => {
		const { model, update } = createImageModel();
		const sink = renderForm(model as never);
		await waitFor(() => expect(sink.ctx?.values.id).toBe("1"));

		const image = png("a.png");
		act(() => sink.ctx!.setFieldValue("image", image));
		await waitFor(() => expect(sink.ctx!.dirty).toBe(true));
		expect(sink.ctx!.dirtyFields.image).toBe(true);

		await act(() => sink.ctx!.submit());
		expect(update).toHaveBeenCalledTimes(1);
		expect(update.mock.calls[0][0].image).toBe(image);
	});

	it("saves a second picked image automatically, though it looks like the first in JSON", async () => {
		const { model, update } = createImageModel();
		const sink = renderForm(model as never, true);
		await waitFor(() => expect(sink.ctx?.values.id).toBe("1"));

		const first = png("a.png");
		act(() => sink.ctx!.setFieldValue("image", first));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		// the server answers with the picked file, so it is the saved value now
		await waitFor(() => expect(sink.ctx!.dirty).toBe(false));

		const second = png("a.png");
		act(() => sink.ctx!.setFieldValue("image", second));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
		expect(update.mock.calls[1][0].image).toBe(second);
	});
});
