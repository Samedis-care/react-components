import { describe, expect, it } from "vitest";
import type { DistributiveOmit, ModelUnknown, PartialExcept } from "../../src";
import type { BackendSingleSelectProps } from "../../src/backend-components/Selector/BackendSingleSelect";
import type { BaseSelectorData } from "../../src/standalone/Selector/BaseSelector";

// Type-level checks: tsc (tsconfig-test.json) fails on a wrong assignment, and on an
// expected error that does not occur. The runtime assertions only keep the values used.

/** Props with or without a switch, as the selectors have them */
type Props =
	| { name: string; switchFilterName?: undefined; switchLabel?: undefined }
	| { name: string; switchFilterName: string; switchLabel: string };

describe("DistributiveOmit and PartialExcept, exported from the package root", () => {
	it("DistributiveOmit keeps the members of a union apart", () => {
		const plain: DistributiveOmit<Props, "name"> = {};
		const withSwitch: DistributiveOmit<Props, "name"> = {
			switchFilterName: "inactive",
			switchLabel: "Show inactive",
		};
		// @ts-expect-error a switch still needs its label
		const missingLabel: DistributiveOmit<Props, "name"> = {
			switchFilterName: "inactive",
		};
		// a plain Omit collapses the members: the same object is accepted
		const collapsed: Omit<Props, "name"> = { switchFilterName: "inactive" };
		expect([plain, withSwitch, missingLabel, collapsed]).toHaveLength(4);
	});

	it("props built with DistributiveOmit fit back into the selector they wrap", () => {
		// a wrapper that brings its own model and data mapping, as apps write them
		type Own = "model" | "modelToSelectorData";
		const toData = (): BaseSelectorData => ({ value: "", label: "" });
		const viaDistributiveOmit = (
			props: DistributiveOmit<BackendSingleSelectProps<ModelUnknown>, Own>,
			model: ModelUnknown,
		): BackendSingleSelectProps<ModelUnknown> => ({
			...props,
			model,
			modelToSelectorData: toData,
		});
		const viaOmit = (
			props: Omit<BackendSingleSelectProps<ModelUnknown>, Own>,
			model: ModelUnknown,
		): BackendSingleSelectProps<ModelUnknown> =>
			// @ts-expect-error a plain Omit collapses the switch union: it no longer fits back
			({ ...props, model, modelToSelectorData: toData });
		expect([viaDistributiveOmit, viaOmit]).toHaveLength(2);
	});

	it("PartialExcept keeps a key required where its member requires it", () => {
		const nothing: PartialExcept<Props, "switchLabel"> = {};
		const labelled: PartialExcept<Props, "switchLabel"> = {
			switchFilterName: "inactive",
			switchLabel: "Show inactive",
		};
		// @ts-expect-error with a switch, switchLabel stays required
		const unlabelled: PartialExcept<Props, "switchLabel"> = {
			switchFilterName: "inactive",
		};
		expect([nothing, labelled, unlabelled]).toHaveLength(3);
	});
});
