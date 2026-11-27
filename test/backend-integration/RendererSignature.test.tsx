import React from "react";
import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import ccI18n from "../../src/i18n";
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
		// the label's asterisk is hidden from assistive technology
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

	it("[ISSUE-3467-ITEM-26] a read-only, unsigned signature field says it is not signed, as the field's non-editable view does, instead of asking to sign", async () => {
		const sink: Sink = {};
		mountForm(
			makeModel({}, undefined, {
				signature: {
					type: new ModelDataTypeSignatureRenderer(),
					getLabel: () => "Trainer signature",
					visibility: editRequired,
					customData: null,
				},
			}),
			capture(sink, () => <FormField name={"signature"} id={"sig"} />),
			{ id: null, readOnly: true },
		);
		await loaded(sink, "");
		const button = document.getElementById("sig")!;
		expect(button).toHaveAttribute("aria-disabled", "true");
		expect(button).toHaveTextContent(
			ccI18n.t("backend-integration.model.types.renderers.signature.not-set"),
		);
		expect(button).not.toHaveTextContent("Sign here digitally");
		expect(button).toHaveAccessibleName("Trainer signature Not signed");
	});

	it("[ISSUE-3467-ITEM-30] a signature field's label is a label element, not a legend outside a fieldset", async () => {
		const sink: Sink = {};
		mountForm(
			makeModel({}, undefined, {
				signature: {
					type: new ModelDataTypeSignatureRenderer(),
					getLabel: () => "Trainer signature",
					visibility: editRequired,
					customData: null,
				},
			}),
			capture(sink, () => <FormField name={"signature"} id={"sig"} />),
			{ id: null },
		);
		await loaded(sink, "");
		const label = document.getElementById("sig-label")!;
		// MUI's FormLabel with its own element: the field is one control, not a group
		expect(label.tagName).toBe("LABEL");
		expect(label).toHaveClass("MuiFormLabel-root");
		expect(label).toHaveTextContent("Trainer signature");
		// a legend names only the fieldset it opens
		const legends = Array.from(document.querySelectorAll("legend"));
		expect(
			legends.filter((legend) => legend.parentElement?.tagName !== "FIELDSET"),
		).toEqual([]);
		// and the label still names the tile's button
		expect(document.getElementById("sig")).toHaveAccessibleName(
			"Trainer signature Sign here digitally",
		);
	});
});
