import { describe, expect, it, vi } from "vitest";
import React from "react";
import { act } from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import ValidationError from "../../../src/backend-components/Form/ValidationError";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import {
	ModelVisibilityDisabled,
	ModelVisibilityEditRequired,
	ModelVisibility,
} from "../../../src/backend-integration";
import validatePresence from "../../../src/utils/validations/validatePresence";
import {
	capture,
	inputOf,
	loaded,
	makeModel,
	mountForm,
	recordData,
	settle,
	setupFormTests,
	Sink,
	trySubmit,
} from "./formFixture";

setupFormTests();

describe("Form validation on submit", () => {
	it("[ISSUE-3501-ITEM-3] a field that another field's value enables after load is validated", async () => {
		const otherVisibility = (
			values: Record<string, unknown>,
		): ModelVisibility =>
			values.reason === "other"
				? ModelVisibilityEditRequired
				: ModelVisibilityDisabled;
		const connector = new MockConnector([]);
		const create = vi.spyOn(connector, "create");
		const validate = vi.fn(validatePresence);
		const sink: Sink = {};
		const { container } = mountForm(
			makeModel(
				{
					other: {
						validate,
						visibility: {
							overview: ModelVisibilityDisabled,
							edit: otherVisibility,
							create: otherVisibility,
						},
					},
				},
				connector,
			),
			capture(sink, () => (
				<>
					<FormField name={"reason"} />
					<FormField name={"other"} />
				</>
			)),
			{ id: null },
		);
		await loaded(sink, "");
		act(() => sink.ctx!.setFieldValue("title", "t"));
		act(() => sink.ctx!.setFieldValue("note", "n"));
		act(() => sink.ctx!.setFieldValue("reason", "other"));
		await settle();
		// the field is shown, required, and empty
		expect(inputOf(container, "other").required).toBe(true);
		expect(inputOf(container, "other").value).toBe("");
		const error = await trySubmit(sink);
		expect((error as ValidationError | null)?.result).toEqual({
			other: "The Other reason field is required",
		});
		expect(create).not.toHaveBeenCalled();
	});

	it("[ISSUE-3501-ITEM-3] in an edit form, a field that a change enables is validated, though the record was loaded with it disabled", async () => {
		const otherVisibility = (
			values: Record<string, unknown>,
		): ModelVisibility =>
			values.reason === "other"
				? ModelVisibilityEditRequired
				: ModelVisibilityDisabled;
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		const { container } = mountForm(
			makeModel(
				{
					other: {
						validate: validatePresence,
						visibility: {
							overview: ModelVisibilityDisabled,
							edit: otherVisibility,
							create: otherVisibility,
						},
					},
				},
				connector,
			),
			capture(sink, () => (
				<>
					<FormField name={"reason"} />
					<FormField name={"other"} />
				</>
			)),
		);
		// record 1 has reason "a", so its "other" is disabled when it loads
		await loaded(sink);
		expect(inputOf(container, "other")).toBeNull();
		act(() => sink.ctx!.setFieldValue("reason", "other"));
		await settle();
		expect(inputOf(container, "other").value).toBe("");
		const error = await trySubmit(sink);
		expect((error as ValidationError | null)?.result).toEqual({
			other: "The Other reason field is required",
		});
		expect(update).not.toHaveBeenCalled();
	});

	it("[ISSUE-3501-ITEM-3] a field disabled by the values is left out of the save, and switching it on and off again leaves the form clean", async () => {
		const otherVisibility = (
			values: Record<string, unknown>,
		): ModelVisibility =>
			values.reason === "other"
				? ModelVisibilityEditRequired
				: ModelVisibilityDisabled;
		const connector = new MockConnector([]);
		const create = vi.spyOn(connector, "create");
		const sink: Sink = {};
		mountForm(
			makeModel(
				{
					other: {
						getDefaultValue: () => "unused default",
						visibility: {
							overview: ModelVisibilityDisabled,
							edit: otherVisibility,
							create: otherVisibility,
						},
					},
				},
				connector,
			),
			capture(sink),
			{ id: null },
		);
		await loaded(sink, "");
		act(() => sink.ctx!.setFieldValue("reason", "other"));
		await settle();
		expect(sink.ctx!.values.other).toBe("unused default");
		act(() => sink.ctx!.setFieldValue("reason", ""));
		await settle();
		expect(sink.ctx!.dirty).toBe(false);
		act(() => sink.ctx!.setFieldValue("title", "t"));
		await settle();
		expect(await trySubmit(sink)).toBeNull();
		expect(create).toHaveBeenCalledTimes(1);
		expect(create.mock.calls[0][0]).toMatchObject({ title: "t" });
		expect(create.mock.calls[0][0]).not.toHaveProperty("other");
	});
});
