import { describe, it, expect } from "vitest";
import {
	ModelVisibilityView,
	ModelVisibilityEdit,
	ModelVisibilityEditRequired,
	ModelVisibilityEditReadOnly,
	ModelVisibilityDisabled,
	ModelVisibilityDisabledReadOnly,
	ModelVisibilityHidden,
	ModelVisibilityGridView,
	ModelVisibilityGridViewHidden,
	ModelVisibilityGridEdit,
	ModelVisibilityGridEditHidden,
	ModelVisibilityGridEditReadOnly,
	ModelVisibilityGridEditReadOnlyHidden,
} from "../../src/backend-integration/Model/Visibilities";
import { getVisibility } from "../../src/backend-integration/Model/Visibility";
import type { Visibility } from "../../src/backend-integration/Model/Visibility";

describe("Visibility constants", () => {
	it("VisibilityView is view-only, non-grid", () => {
		expect(ModelVisibilityView).toEqual({
			disabled: false,
			hidden: false,
			editable: false,
			readOnly: false,
			required: false,
			grid: false,
		});
	});

	it("VisibilityEdit is editable, non-grid", () => {
		expect(ModelVisibilityEdit).toEqual({
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: false,
			required: false,
			grid: false,
		});
	});

	it("VisibilityEditRequired is editable and required", () => {
		expect(ModelVisibilityEditRequired).toEqual({
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: false,
			required: true,
			grid: false,
		});
	});

	it("VisibilityEditReadOnly is editable and readOnly", () => {
		expect(ModelVisibilityEditReadOnly).toEqual({
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: true,
			required: false,
			grid: false,
		});
	});

	it("VisibilityDisabled has disabled true", () => {
		expect(ModelVisibilityDisabled).toEqual({
			disabled: true,
			hidden: false,
			editable: false,
			readOnly: false,
			required: false,
			grid: false,
		});
	});

	it("VisibilityDisabledReadOnly has disabled and readOnly true", () => {
		expect(ModelVisibilityDisabledReadOnly).toEqual({
			disabled: true,
			hidden: false,
			editable: false,
			readOnly: true,
			required: false,
			grid: false,
		});
	});

	it("VisibilityHidden has hidden true", () => {
		expect(ModelVisibilityHidden).toEqual({
			disabled: false,
			hidden: true,
			editable: false,
			readOnly: false,
			required: false,
			grid: false,
		});
	});

	it("VisibilityGridView is grid view", () => {
		expect(ModelVisibilityGridView).toEqual({
			disabled: false,
			hidden: false,
			editable: false,
			readOnly: false,
			required: false,
			grid: true,
		});
	});

	it("VisibilityGridViewHidden is grid view hidden", () => {
		expect(ModelVisibilityGridViewHidden).toEqual({
			disabled: false,
			hidden: true,
			editable: false,
			readOnly: false,
			required: false,
			grid: true,
		});
	});

	it("VisibilityGridEdit is grid editable", () => {
		expect(ModelVisibilityGridEdit).toEqual({
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: false,
			required: false,
			grid: true,
		});
	});

	it("VisibilityGridEditHidden is grid editable hidden", () => {
		expect(ModelVisibilityGridEditHidden).toEqual({
			disabled: false,
			hidden: true,
			editable: true,
			readOnly: false,
			required: false,
			grid: true,
		});
	});

	it("VisibilityGridEditReadOnly is grid editable readOnly", () => {
		expect(ModelVisibilityGridEditReadOnly).toEqual({
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: true,
			required: false,
			grid: true,
		});
	});

	it("VisibilityGridEditReadOnlyHidden is grid editable readOnly hidden", () => {
		expect(ModelVisibilityGridEditReadOnlyHidden).toEqual({
			disabled: false,
			hidden: true,
			editable: true,
			readOnly: true,
			required: false,
			grid: true,
		});
	});
});

describe("getVisibility", () => {
	it("returns the visibility object directly when not a function", () => {
		const vis: Visibility = {
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: false,
			required: false,
			grid: false,
		};
		expect(getVisibility(vis, {}, {})).toBe(vis);
	});

	it("calls the callback function with values and initialValues", () => {
		const vis: Visibility = {
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: false,
			required: true,
			grid: false,
		};
		const callback = (
			values: Record<string, unknown>,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			_initialValues: Record<string, unknown>,
		): Visibility => {
			if (values.status === "locked") {
				return { ...vis, readOnly: true };
			}
			return vis;
		};

		expect(getVisibility(callback, { status: "locked" }, {})).toEqual({
			...vis,
			readOnly: true,
		});
		expect(getVisibility(callback, { status: "open" }, {})).toBe(vis);
	});
});
