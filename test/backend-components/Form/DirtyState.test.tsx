import { describe, it, expect, afterEach, beforeAll } from "vitest";
import React from "react";
import { render, act, waitFor, cleanup } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import Form, {
	useFormContext,
	useFormContextLite,
} from "../../../src/backend-components/Form/Form";
import DirtyStateProvider from "../../../src/backend-components/Form/DirtyStateProvider";
import {
	DirtyStateMarks,
	useDirtyState,
} from "../../../src/backend-components/Form/DirtyStateContext";
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

interface Sink {
	ctx?: ReturnType<typeof useFormContext>;
	lite?: ReturnType<typeof useFormContextLite>;
	marks?: DirtyStateMarks;
}

/**
 * Captures both halves on every render: what the form engine computed, and what the
 * controls below it are told to show
 */
const makeCapture = (sink: Sink) => {
	const Capture = () => {
		sink.ctx = useFormContext();
		sink.lite = useFormContextLite();
		sink.marks = useDirtyState();
		return null;
	};
	return Capture;
};

const renderForm = (
	showDirtyState: boolean,
	wrap?: (children: React.ReactNode) => React.ReactNode,
) => {
	const sink: Sink = {};
	const Capture = makeCapture(sink);
	const Children = () => (wrap ? wrap(<Capture />) : <Capture />);
	render(
		<Framework>
			<Form
				model={createTestModel()}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				showDirtyState={showDirtyState}
			>
				{Children as unknown as React.ComponentType<never>}
			</Form>
		</Framework>,
	);
	return sink;
};

const loaded = async (sink: Sink) => {
	await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Alice"));
	await act(async () => {});
};

describe("Form dirty state display", () => {
	it("marks nothing by default, however dirty the form is", async () => {
		const sink = renderForm(false);
		await loaded(sink);

		act(() => sink.ctx!.setFieldValue("first_name", "Bob"));
		await waitFor(() => expect(sink.ctx!.dirtyFields.first_name).toBe(true));

		// the form engine knows, the controls are not told
		expect(sink.marks).toStrictEqual({});
		// and the switch is readable from either context, for a control which displays
		// dirty state of its own
		expect(sink.ctx!.showDirtyState).toBe(false);
		expect(sink.lite!.showDirtyState).toBe(false);
	});

	it("marks the form's own dirty fields with showDirtyState", async () => {
		const sink = renderForm(true);
		await loaded(sink);
		expect(sink.marks!.first_name).toBe(false);
		expect(sink.ctx!.showDirtyState).toBe(true);
		expect(sink.lite!.showDirtyState).toBe(true);

		act(() => sink.ctx!.setFieldValue("first_name", "Bob"));
		await waitFor(() => expect(sink.marks!.first_name).toBe(true));
		expect(sink.marks!.last_name).toBe(false);

		// a diff, not a latch
		act(() => sink.ctx!.setFieldValue("first_name", "Alice"));
		await waitFor(() => expect(sink.marks!.first_name).toBe(false));
	});

	it("takes marks from the application, dirty or not", async () => {
		const marks = (formDirtyFields: DirtyStateMarks): DirtyStateMarks => ({
			...formDirtyFields,
			last_name: true,
		});
		const sink = renderForm(false, (children) => (
			<DirtyStateProvider marks={marks}>{children}</DirtyStateProvider>
		));
		await loaded(sink);

		// saved, so not dirty, and marked anyway
		expect(sink.marks!.last_name).toBe(true);
		expect(sink.ctx!.dirtyFields.last_name).toBe(false);
		expect(sink.marks!.first_name).toBe(false);

		// the form engine's own state reaches the callback even with showDirtyState off
		act(() => sink.ctx!.setFieldValue("first_name", "Bob"));
		await waitFor(() => expect(sink.marks!.first_name).toBe(true));
	});

	it("lets a nested provider override the marks of the one around it", async () => {
		const outer: DirtyStateMarks = { first_name: true, last_name: true };
		const inner: DirtyStateMarks = { last_name: true };
		const sink = renderForm(true, (children) => (
			<DirtyStateProvider marks={outer}>
				<DirtyStateProvider marks={inner}>{children}</DirtyStateProvider>
			</DirtyStateProvider>
		));
		await loaded(sink);

		expect(sink.marks).toStrictEqual(inner);
	});
});
