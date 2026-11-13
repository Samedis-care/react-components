import React from "react";
import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import FormField from "../../src/backend-components/Form/Field";
import { ModelDataTypeSignatureRenderer } from "../../src/backend-integration";
import {
	capture,
	editRequired,
	loaded,
	makeModel,
	mountForm,
	settle,
	setupFormTests,
	Sink,
	trySubmit,
} from "../backend-components/Form/formFixture";

setupFormTests();

describe("RendererSignature", () => {
	it("[ISSUE-3467-ITEM-17] a signature field's button is named by the field's label, described by its message, and marked required and invalid", async () => {
		const sink: Sink = {};
		mountForm(
			makeModel({}, undefined, {
				signature: {
					type: new ModelDataTypeSignatureRenderer(),
					getLabel: () => "Trainer signature",
					visibility: editRequired,
					customData: null,
					validate: (value: unknown) => (value ? null : "Please sign"),
				},
			}),
			capture(sink, () => <FormField name={"signature"} id={"sig"} />),
			{ id: null },
		);
		await loaded(sink, "");
		const button = document.getElementById("sig")!;
		expect(button).toHaveRole("button");
		// the legend's asterisk is hidden from assistive technology
		expect(button).toHaveAccessibleName(
			"Trainer signature Sign here digitally",
		);
		expect(button).toHaveAccessibleDescription("Required");
		expect(button).toHaveAttribute("aria-invalid", "false");

		act(() => sink.ctx!.setFieldValue("note", "x"));
		await settle();
		expect(await trySubmit(sink)).not.toBeNull();
		await settle();
		expect(button).toHaveAccessibleDescription("Required Please sign");
		expect(button).toHaveAttribute("aria-invalid", "true");
	});
});
