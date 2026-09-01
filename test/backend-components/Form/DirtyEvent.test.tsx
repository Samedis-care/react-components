import { describe, it, expect, afterEach, beforeAll } from "vitest";
import React from "react";
import { render, act, waitFor, cleanup } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import Form, {
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import createTestModel from "../../../src/stories/test-utils/TestModel";
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

/**
 * Captures the live form context and every dirty event the form engine dispatches.
 * Rendered as the Form's page component, so it subscribes like a real form page does.
 */
const makeCapture = (sink: {
	ctx?: ReturnType<typeof useFormContext>;
	events: boolean[];
}) => {
	const Capture = () => {
		const ctx = useFormContext();
		sink.ctx = ctx;
		const { addEventListener, removeEventListener } = ctx;
		React.useEffect(() => {
			const listener = (event: { dirty: boolean }) =>
				sink.events.push(event.dirty);
			addEventListener("dirty", listener);
			return () => removeEventListener("dirty", listener);
		}, [addEventListener, removeEventListener]);
		return null;
	};
	return Capture as unknown as React.ComponentType<never>;
};

const renderForm = () => {
	const model = createTestModel();
	const connector = model.connector as unknown as MockConnector;
	const sink: {
		ctx?: ReturnType<typeof useFormContext>;
		events: boolean[];
	} = { events: [] };
	render(
		<Framework>
			<Form model={model} id={"1"} errorComponent={DefaultErrorComponent}>
				{makeCapture(sink)}
			</Form>
		</Framework>,
	);
	return { model, connector, sink };
};

describe("Form dirty events", () => {
	it("announces dirty state changes, without repeating the current state", async () => {
		const { sink } = renderForm();

		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Alice"));
		await act(async () => {});
		// the event reports changes only - a fresh subscriber reads the current state
		// off the context instead
		expect(sink.events).toStrictEqual([]);
		expect(sink.ctx!.dirty).toBe(false);

		act(() => sink.ctx!.setFieldValue("first_name", "Bob"));
		await waitFor(() => expect(sink.events).toStrictEqual([true]));

		// a second edit doesn't re-announce a state which didn't change
		act(() => sink.ctx!.setFieldValue("first_name", "Charlie"));
		await act(async () => {});
		expect(sink.events).toStrictEqual([true]);
	});

	it("announces a reset before React re-renders", async () => {
		const { sink } = renderForm();

		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Alice"));
		act(() => sink.ctx!.setFieldValue("first_name", "Bob"));
		await waitFor(() => expect(sink.events.at(-1)).toBe(true));

		act(() => {
			sink.ctx!.resetForm();
			// still inside the same synchronous block: nothing has re-rendered yet, so
			// the rendered dirty flag is stale. The event is not.
			expect(sink.events.at(-1)).toBe(false);
			expect(sink.ctx!.dirty).toBe(true);
		});
	});

	it("announces a successful submit before submit() resolves", async () => {
		const { sink } = renderForm();

		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Alice"));
		act(() => sink.ctx!.setFieldValue("first_name", "Bob"));
		await waitFor(() => expect(sink.events.at(-1)).toBe(true));

		// what a "submit, then navigate away" caller sees the moment its await returns
		let dirtyWhenSubmitResolved: boolean | undefined;
		await act(async () => {
			await sink.ctx!.submit();
			dirtyWhenSubmitResolved = sink.events.at(-1);
		});
		expect(dirtyWhenSubmitResolved).toBe(false);
	});
});
