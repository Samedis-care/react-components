import { describe, it, expect, afterEach, beforeAll } from "vitest";
import React, { useState } from "react";
import { render, act, waitFor, cleanup } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import Form, {
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import createTestModel from "../../../src/stories/test-utils/TestModel";

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

type FormContext = ReturnType<typeof useFormContext>;

interface Sink {
	parent?: FormContext;
	nested?: FormContext;
	setDisableNestedSubmit?: (disable: boolean) => void;
}

/**
 * A parent form (record 1) with a nested form (record 2) whose disableNestedSubmit the
 * test switches
 */
const renderForms = (disableNestedSubmit: boolean) => {
	const model = createTestModel();
	const sink: Sink = {};
	const NestedCapture = () => {
		sink.nested = useFormContext();
		return null;
	};
	const ParentPage = () => {
		sink.parent = useFormContext();
		const [disable, setDisable] = useState(disableNestedSubmit);
		sink.setDisableNestedSubmit = setDisable;
		return (
			<Form
				model={model}
				id={"2"}
				nestedFormName={"child"}
				disableNestedSubmit={disable}
				errorComponent={DefaultErrorComponent}
			>
				{NestedCapture}
			</Form>
		);
	};
	render(
		<Framework>
			<Form model={model} id={"1"} errorComponent={DefaultErrorComponent}>
				{ParentPage as unknown as React.ComponentType<never>}
			</Form>
		</Framework>,
	);
	return { connector: model.connector, sink };
};

describe("Form nested with disableNestedSubmit", () => {
	it("doesn't mark the parent dirty", async () => {
		const { sink } = renderForms(true);

		await waitFor(() => expect(sink.nested?.values.first_name).toBe("Bob"));
		act(() => sink.nested!.setFieldValue("first_name", "Bobby"));
		await act(async () => {});

		expect(sink.nested!.dirty).toBe(true);
		expect(sink.parent!.dirty).toBe(false);
	});

	it("follows the flag: the parent is dirty while the nested form is submitted with it", async () => {
		const { sink } = renderForms(false);

		await waitFor(() => expect(sink.nested?.values.first_name).toBe("Bob"));
		act(() => sink.nested!.setFieldValue("first_name", "Bobby"));
		await waitFor(() => expect(sink.parent!.dirty).toBe(true));

		act(() => sink.setDisableNestedSubmit!(true));
		await act(async () => {});
		expect(sink.parent!.dirty).toBe(false);

		act(() => sink.setDisableNestedSubmit!(false));
		await act(async () => {});
		expect(sink.parent!.dirty).toBe(true);
	});

	it("leaves the parent clean once it saved, without saving the nested form", async () => {
		const { sink } = renderForms(true);

		await waitFor(() => expect(sink.nested?.values.first_name).toBe("Bob"));
		act(() => {
			sink.nested!.setFieldValue("first_name", "Bobby");
			sink.parent!.setFieldValue("first_name", "Alicia");
		});
		await act(async () => {
			await sink.parent!.submit();
		});
		await act(async () => {});

		expect(sink.parent!.values.first_name).toBe("Alicia");
		expect(sink.parent!.dirty).toBe(false);
		expect(sink.nested!.dirty).toBe(true);
	});
});
