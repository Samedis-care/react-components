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
 * Captures the live form context so tests can drive the form and read its
 * current values. Rendered as the Form's page component.
 */
const makeCapture = (sink: { ctx?: ReturnType<typeof useFormContext> }) => {
	const Capture = () => {
		sink.ctx = useFormContext();
		return null;
	};
	return Capture as unknown as React.ComponentType<never>;
};

const renderForm = () => {
	const model = createTestModel();
	const connector = model.connector as unknown as MockConnector;
	const sink: { ctx?: ReturnType<typeof useFormContext> } = {};
	render(
		<Framework>
			<Form model={model} id="1" errorComponent={DefaultErrorComponent}>
				{makeCapture(sink)}
			</Form>
		</Framework>,
	);
	return { model, connector, sink };
};

describe("Form updateUnmodified uses per-field dirty state", () => {
	it("updates a touched-but-unmodified field from fresh server data on refetch", async () => {
		const { connector, sink } = renderForm();

		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Alice"));

		// Field becomes touched WITHOUT the user changing its value. This mirrors
		// the validation side effect that marks fields touched to gate error display.
		act(() => sink.ctx!.setFieldTouched("first_name", true));

		// The record changes server-side, then a background refetch pulls it in.
		connector.update({ id: "1", first_name: "Alice2" });
		await act(async () => {
			await sink.ctx!.refetchForm();
		});

		// The user never modified the field, so the server update must be applied.
		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Alice2"));
	});

	it("preserves a user-modified field when server data changes on refetch", async () => {
		const { connector, sink } = renderForm();

		await waitFor(() => expect(sink.ctx?.values.first_name).toBe("Alice"));

		// User actually edits the field (makes it dirty).
		act(() => sink.ctx!.setFieldValue("first_name", "UserEdit"));

		// Concurrent server-side change + refetch.
		connector.update({ id: "1", first_name: "ServerEdit" });
		await act(async () => {
			await sink.ctx!.refetchForm();
		});

		// The user's edit must win.
		expect(sink.ctx?.values.first_name).toBe("UserEdit");
	});
});
