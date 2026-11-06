/**
 * Step 2 of the unguided import wizard ("Connect data", useImportStep2Logic and
 * Step2ConnectData): the source columns, one script card per importable field, and the
 * debounced check of each typed conversion script with its status.
 */
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	MockInstance,
	vi,
} from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import Step2ConnectData from "../../../src/backend-components/CRUD/Import/Step2ConnectData";
import { ModelDataTypeEnumSelectRenderer } from "../../../src/backend-integration";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { LOAD, setupCrudTests } from "./crudFixture";
import {
	baseFields,
	EDIT,
	extraFields,
	importModel,
	initState,
	renderStepComponent,
} from "./importFixture";

setupCrudTests();

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
	// a failed check logs the result and the row
	consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
	vi.useRealTimers();
});

const DATA = [{ n: "Alice" }, { n: "Bob" }];

/** Lets the 1 s debounce of the script check run out */
const debounce = async (ms = 1100) => {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(ms);
	});
};

describe("Step2ConnectData", () => {
	const renderStep2 = (data: Record<string, unknown>[] = DATA) =>
		renderStepComponent(
			Step2ConnectData,
			importModel(new MockConnector([]), {
				...baseFields(),
				...extraFields(),
			}),
			initState(data),
		);

	it("[ISSUE-3508-ITEM-27] names each script field after the field it converts", async () => {
		const { container } = renderStep2();
		await screen.findByText("First Name (first_name)", undefined, LOAD);
		expect(screen.getByRole("textbox", { name: /First Name/ })).toBe(
			container.querySelector('textarea[name="first_name"]'),
		);
	});

	it("[ISSUE-3508-ITEM-27] gives every script field its own name, and the type it expects as its description", async () => {
		const { container } = renderStep2();
		await screen.findByText("First Name (first_name)", undefined, LOAD);
		const field = (name: string) =>
			container.querySelector<HTMLTextAreaElement>(`textarea[name="${name}"]`)!;
		for (const [name, label] of [
			["first_name", "First Name"],
			["email", "Email"],
			["count", "Count"],
			["active", "Active"],
			["born", "Born"],
			["dept", "Department"],
			["tags", "Tags"],
			["contact.email", "Contact email"],
			["code", "Code"],
		])
			expect(field(name)).toHaveAccessibleName(
				`${label}: Conversion Script (JavaScript)`,
			);
		expect(field("first_name")).toHaveAccessibleDescription("string");
		expect(field("count")).toHaveAccessibleDescription("number");
		expect(field("born")).toHaveAccessibleDescription("date");
		// an enum's values, as the script has to return them
		expect(field("dept")).toHaveAccessibleDescription(
			'enum "eng" (Engineering), "ops" (Operations)',
		);
		expect(field("tags")).toHaveAccessibleDescription('enum "a" (A), "b" (B)');
		expect(
			screen.getByText('"eng" (Engineering), "ops" (Operations)'),
		).toBeVisible();
	});

	it("[ISSUE-3508-ITEM-27] lists an enum's values as string literals, without dividers and invisible values, and names a field without a label by its key", async () => {
		const { container } = renderStepComponent(
			Step2ConnectData,
			importModel(new MockConnector([]), {
				status: {
					type: new ModelDataTypeEnumSelectRenderer(
						[
							{ value: "", getLabel: () => "None" },
							{ value: "open", getLabel: () => "Open" },
							{ value: "div", getLabel: () => "", isDivider: true },
							{ value: "old", getLabel: () => "Old", invisible: true },
							{ value: 'say "hi"', getLabel: () => 'say "hi"' },
						],
						"",
					),
					getLabel: () => "",
					visibility: EDIT,
					customData: null,
				},
			}),
			initState(DATA),
		);
		const field = await screen.findByRole(
			"textbox",
			{ name: "status: Conversion Script (JavaScript)" },
			LOAD,
		);
		expect(field).toBe(container.querySelector('textarea[name="status"]'));
		expect(field).toHaveAccessibleDescription(
			'enum "" (None), "open" (Open), "say \\"hi\\""',
		);
	});

	it("[ISSUE-3508-ITEM-28] marks a script that failed its check as invalid, with the error as its description", async () => {
		const { container } = renderStep2();
		await screen.findByText("Count (count)", undefined, LOAD);
		const count = container.querySelector<HTMLTextAreaElement>(
			'textarea[name="count"]',
		)!;
		fireEvent.change(count, { target: { value: 'record["n"]' } });
		await debounce();
		await waitFor(() =>
			expect(screen.getByTestId("ErrorOutlinedIcon")).toBeInTheDocument(),
		);
		expect(count).toHaveAttribute("aria-invalid", "true");
		expect(count).toHaveAccessibleDescription(/Validation failed/);
	});

	it("[ISSUE-3508-ITEM-28] tells each card's check result in a status message: no script, checking, valid or invalid", async () => {
		const { container } = renderStep2();
		await screen.findByText("Count (count)", undefined, LOAD);
		const status = (label: string) =>
			screen
				.getAllByRole("status")
				.find((el) => el.textContent?.startsWith(`${label}: `));
		expect(screen.getAllByRole("status")).toHaveLength(9);
		expect(status("First Name")).toHaveTextContent("First Name: no script");
		fireEvent.change(container.querySelector('textarea[name="first_name"]')!, {
			target: { value: 'record["n"]' },
		});
		fireEvent.change(container.querySelector('textarea[name="count"]')!, {
			target: { value: 'record["n"]' },
		});
		expect(status("First Name")).toHaveTextContent(
			"First Name: checking the script",
		);
		expect(status("Count")).toHaveTextContent("Count: checking the script");
		// the spinners are behind the status text, not unnamed progressbars
		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.getAllByRole("progressbar", { hidden: true })).toHaveLength(
			2,
		);
		await debounce();
		expect(status("First Name")).toHaveTextContent(
			"First Name: the script is valid",
		);
		expect(status("Count")).toHaveTextContent("Count: the script is invalid");
		expect(status("Email")).toHaveTextContent("Email: no script");
		expect(consoleError).toHaveBeenCalled();
	});

	it("[ISSUE-3508-ITEM-28] shows the error as the field's helper text, before its type in the description, until the script passes", async () => {
		const { container } = renderStep2();
		await screen.findByText("Count (count)", undefined, LOAD);
		const count = container.querySelector<HTMLTextAreaElement>(
			'textarea[name="count"]',
		)!;
		expect(count).toHaveAttribute("aria-invalid", "false");
		fireEvent.change(count, { target: { value: 'record["n"]' } });
		await debounce();
		const message =
			"Error: Validation failed: Result must be a number or null. For details see browser console.";
		expect(count).toHaveAttribute("aria-invalid", "true");
		expect(count).toHaveAccessibleDescription(`${message} number`);
		expect(screen.getByText(message)).toHaveClass("MuiFormHelperText-root");
		fireEvent.change(count, { target: { value: "5" } });
		await debounce();
		expect(count).toHaveAttribute("aria-invalid", "false");
		expect(count).toHaveAccessibleDescription("number");
		expect(screen.queryByText(message)).toBeNull();
	});

	it("[ISSUE-3508-ITEM-28] shows the status text as the tooltip of the status icon", async () => {
		const { container } = renderStep2();
		await screen.findByText("First Name (first_name)", undefined, LOAD);
		fireEvent.change(container.querySelector('textarea[name="first_name"]')!, {
			target: { value: 'record["n"]' },
		});
		await debounce();
		fireEvent.mouseOver(screen.getByTestId("CheckIcon"));
		expect(await screen.findByRole("tooltip")).toHaveTextContent(
			"First Name: the script is valid",
		);
	});
});
