import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import RendererImage from "../../src/backend-integration/Model/Types/Renderers/RendererImage";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import ccI18n from "../../src/i18n";

/**
 * The image renderer where it only shows the picture: a read-only form field and a
 * grid cell. Grid cells built by BackendDataGrid are tested in
 * test/backend-components/DataGrid/Grid.test.tsx.
 */

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
});

afterEach(cleanup);

const STORED =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const PLACEHOLDER =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

const renderParams = (
	value: string,
	grid: boolean,
): ModelRenderParams<string | Blob> => ({
	field: "logo",
	value,
	initialValue: value,
	label: "Logo",
	touched: false,
	dirty: false,
	autoFocus: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable: false,
		readOnly: true,
		required: false,
		grid,
	},
	handleChange: vi.fn(),
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	values: {},
});

describe("ModelDataTypeImageRenderer", () => {
	it.each([
		["a read-only form field", false],
		["a grid cell", true],
	])(
		"[ISSUE-3506-ITEM-14] %s names a stored picture by the label and the placeholder 'No image present'",
		(_where, grid) => {
			const renderer = new RendererImage({ placeholder: PLACEHOLDER });

			render(renderer.render(renderParams(STORED, grid)));
			expect(screen.getByRole("img", { name: "Logo" })).toHaveAttribute(
				"src",
				STORED,
			);
			cleanup();

			render(renderer.render(renderParams("", grid)));
			expect(
				screen.getByRole("img", { name: "No image present" }),
			).toHaveAttribute("src", PLACEHOLDER);
		},
	);

	it.each([
		["a read-only form field", false],
		["a grid cell", true],
	])(
		"[ISSUE-3506-ITEM-14] %s without a placeholder says 'No image present' as text",
		(_where, grid) => {
			const renderer = new RendererImage();

			const { container } = render(renderer.render(renderParams("", grid)));
			expect(screen.queryByRole("img")).toBeNull();
			expect(container).toHaveTextContent(
				grid ? /^No image present$/ : /^LogoNo image present$/,
			);
		},
	);
});

describe("ModelDataTypeImageRenderer — editable", () => {
	it("[ISSUE-3490-ITEM-31] an empty field draws the placeholder where the picture would be, not as its value", () => {
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const renderer = new RendererImage({
			placeholder: PLACEHOLDER,
			variant: "modern",
		});

		const { container } = render(
			renderer.render({
				...renderParams("", false),
				visibility: {
					disabled: false,
					hidden: false,
					editable: true,
					readOnly: false,
					required: false,
					grid: false,
				},
			}),
		);
		// not announced as the field's picture
		expect(screen.queryByRole("img")).toBeNull();
		const img = container.querySelector("img");
		expect(img).toHaveAttribute("src", PLACEHOLDER);
		expect(img).toHaveAttribute("alt", "");
		// a click opens the file dialog, not the preview
		fireEvent.click(img!);
		expect(click).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("dialog")).toBeNull();
		click.mockRestore();
	});
});

describe("ModelDataTypeImageRenderer — placeholder from the record", () => {
	const COMPANY = "data:image/svg+xml,%3Csvg id='company'/%3E";
	const PERSON = "data:image/svg+xml,%3Csvg id='person'/%3E";
	const byType = (values: Record<string, unknown>) =>
		values.contact_type === "company"
			? COMPANY
			: values.contact_type === "person"
				? PERSON
				: undefined;
	const editable = {
		disabled: false,
		hidden: false,
		editable: true,
		readOnly: false,
		required: false,
		grid: false,
	};

	it("[FOLLOWUP-IMAGE-PLACEHOLDER-FN] an editable field draws the placeholder the function picks from the record's values", () => {
		const placeholder = vi.fn(byType);
		const renderer = new RendererImage({ placeholder, variant: "modern" });
		const { container, rerender } = render(
			renderer.render({
				...renderParams("", false),
				visibility: editable,
				values: { contact_type: "company" },
			}),
		);
		expect(placeholder).toHaveBeenCalledWith({ contact_type: "company" });
		expect(container.querySelector("img")).toHaveAttribute("src", COMPANY);
		expect(container.querySelector("img")).toHaveAttribute("alt", "");

		rerender(
			renderer.render({
				...renderParams("", false),
				visibility: editable,
				values: { contact_type: "person" },
			}),
		);
		expect(container.querySelector("img")).toHaveAttribute("src", PERSON);
	});

	it.each([
		["a read-only form field", false],
		["a grid cell", true],
	])(
		"[FOLLOWUP-IMAGE-PLACEHOLDER-FN] %s shows the picked placeholder, and 'No image present' as text when the function picks none",
		(_where, grid) => {
			const renderer = new RendererImage({ placeholder: byType });
			render(
				renderer.render({
					...renderParams("", grid),
					values: { contact_type: "person" },
				}),
			);
			expect(
				screen.getByRole("img", { name: "No image present" }),
			).toHaveAttribute("src", PERSON);
			cleanup();

			render(renderer.render({ ...renderParams("", grid), values: {} }));
			expect(screen.queryByRole("img")).toBeNull();
			expect(screen.getByText("No image present")).toBeInTheDocument();
		},
	);

	it("[FOLLOWUP-IMAGE-PLACEHOLDER-FN] placeholderValues are the fields that render the field again", () => {
		expect(
			new RendererImage({
				placeholder: byType,
				placeholderValues: ["contact_type"],
			}).settings,
		).toEqual({ updateHooks: ["contact_type"] });
		expect(new RendererImage({ placeholder: PLACEHOLDER }).settings).toBe(
			undefined,
		);
	});
});
