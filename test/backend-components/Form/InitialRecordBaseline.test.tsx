import { describe, it, expect, afterEach, beforeAll } from "vitest";
import React, { useState } from "react";
import { render, act, waitFor, cleanup } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import Form, {
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import createTestModel from "../../../src/stories/test-utils/TestModel";
import { ModelUnknown } from "../../../src/backend-integration/Model/Model";

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

const NEW_PERSON = {
	last_name: "Doe",
	email: "jane@example.com",
	department: "Sales",
};

const makeCapture = (sink: { ctx?: FormContext }) => {
	const Capture = () => {
		sink.ctx = useFormContext();
		return null;
	};
	return Capture as unknown as React.ComponentType<never>;
};

describe("Form initialRecord", () => {
	it("is read on load: a new object with the same content doesn't touch the dirty baseline of a saved record", async () => {
		const model = createTestModel();
		const sink: { ctx?: FormContext; rerender?: () => void } = {};
		const Capture = makeCapture(sink);
		const Page = () => {
			const [, setRenders] = useState(0);
			sink.rerender = () => setRenders((prev) => prev + 1);
			return (
				<Form
					model={model}
					id={null}
					// a new object on every render, as written inline
					initialRecord={{ first_name: "Jane" }}
					errorComponent={DefaultErrorComponent}
				>
					{Capture}
				</Form>
			);
		};
		render(
			<Framework>
				<Page />
			</Framework>,
		);

		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Jane"));
		act(() => {
			for (const [field, value] of Object.entries(NEW_PERSON))
				sink.ctx!.setFieldValue(field, value);
		});
		await act(async () => {
			await sink.ctx!.submit();
		});
		expect(sink.ctx!.dirty).toBe(false);

		act(() => sink.rerender!());
		await act(async () => {});
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("is read on load: a later change doesn't make the form dirty", async () => {
		const model = createTestModel();
		const sink: { ctx?: FormContext; setFirstName?: (name: string) => void } =
			{};
		const Capture = makeCapture(sink);
		const Page = () => {
			const [firstName, setFirstName] = useState("Jane");
			sink.setFirstName = setFirstName;
			return (
				<Form
					model={model}
					id={null}
					initialRecord={{ first_name: firstName }}
					errorComponent={DefaultErrorComponent}
				>
					{Capture}
				</Form>
			);
		};
		render(
			<Framework>
				<Page />
			</Framework>,
		);

		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Jane"));
		act(() => sink.setFirstName!("John"));
		await act(async () => {});
		expect(sink.ctx!.values.first_name).toBe("Jane");
		expect(sink.ctx!.dirty).toBe(false);
	});

	it("leaves the parent clean once a nested create form saved and wrote its id into the parent", async () => {
		const model = createTestModel();
		const sink: { ctx?: FormContext } = {};
		const nestedSink: { ctx?: FormContext } = {};
		const NestedCapture = makeCapture(nestedSink);

		// creates a record and writes its id into the parent's department field, with an
		// initialRecord taken from the parent's values: rendered again by every parent change
		const NestedCreate = () => {
			const { values, setFieldValue } = useFormContext<ModelUnknown>();
			return (
				<Form
					model={model}
					id={null}
					nestedFormName={"create"}
					initialRecord={{ first_name: values.first_name as string }}
					onSubmit={(data) =>
						setFieldValue("department", data.id, undefined, true)
					}
					onlySubmitNestedIfMounted
					nestedSubmitBeforeParent
					errorComponent={DefaultErrorComponent}
				>
					{NestedCapture}
				</Form>
			);
		};
		const ParentPage = () => {
			sink.ctx = useFormContext();
			return <NestedCreate />;
		};
		render(
			<Framework>
				<Form model={model} id={"1"} errorComponent={DefaultErrorComponent}>
					{ParentPage as unknown as React.ComponentType<never>}
				</Form>
			</Framework>,
		);

		await waitFor(() =>
			expect(nestedSink.ctx?.values.first_name).toBe("Alice"),
		);
		act(() => {
			for (const [field, value] of Object.entries(NEW_PERSON))
				nestedSink.ctx!.setFieldValue(field, value);
		});
		await waitFor(() => expect(sink.ctx!.dirty).toBe(true));

		await act(async () => {
			await sink.ctx!.submit();
		});
		await act(async () => {});
		expect(sink.ctx!.values.department).toBe(nestedSink.ctx!.values.id);
		expect(nestedSink.ctx!.dirty).toBe(false);
		expect(sink.ctx!.dirty).toBe(false);
	});
});
