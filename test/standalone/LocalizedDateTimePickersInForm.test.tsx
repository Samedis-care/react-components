import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Framework } from "../../src/framework";
import Form, { useFormContext } from "../../src/backend-components/Form/Form";
import FormField from "../../src/backend-components/Form/Field";
import DefaultErrorComponent from "../../src/backend-components/Form/DefaultErrorComponent";
import createMixedControlModel from "../../src/stories/test-utils/MixedControlModel";
import {
	Model,
	ModelDataTypeDateNullableRendererCC,
	ModelDataTypeDateNullableRendererMUI,
	ModelDataTypeDateTimeNullableRendererCC,
	ModelDataTypeStringRendererMUI,
	ModelFieldDefinitionUnknown,
	ModelUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityEditRequired,
	ModelVisibilityHidden,
} from "../../src/backend-integration";
import MockConnector from "../../src/stories/test-utils/MockConnector";
import { validatePresence } from "../../src/utils/validations";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";

/**
 * The pickers inside a model Form: `start_date` of the MixedControlModel is a
 * nullable date rendered by the Material-UI date renderer, which passes the
 * form's `handleBlur` on as the picker's `onBlur`. Form marks a field touched
 * from the blur event, by the element's name, data-name or id.
 */

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

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

type MixedModel = ReturnType<typeof createMixedControlModel>;

const renderForm = () => {
	const sink: { ctx?: ReturnType<typeof useFormContext<MixedModel>> } = {};
	const Content = () => {
		sink.ctx = useFormContext<MixedModel>();
		return (
			<>
				<div data-field="start_date">
					<FormField name="start_date" />
				</div>
				<div data-field="first_name">
					<FormField name="first_name" />
				</div>
				<button type="button">outside</button>
			</>
		);
	};
	const result = render(
		<Framework>
			<Form
				model={createMixedControlModel()}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={undefined}
				disableRouting
			>
				{Content}
			</Form>
		</Framework>,
	);
	return { ...result, sink };
};

const loaded = async (container: HTMLElement) => {
	await waitFor(() =>
		expect(container.querySelector('input[name="first_name"]')).toHaveValue(
			"Alice",
		),
	);
	await act(async () => {});
};

const focus = (element: Element | null) => {
	act(() => {
		(element as HTMLElement).focus();
	});
};

const blurWithoutNameErrors = (spy: { mock: { calls: unknown[][] } }) =>
	spy.mock.calls.filter((call) => /without name/.test(String(call[0])));

describe("pickers in a Form", () => {
	it("marks a text field touched when focus leaves it", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const { container, getByRole, sink } = renderForm();
		await loaded(container);

		focus(container.querySelector('input[name="first_name"]'));
		focus(getByRole("button", { name: "outside" }));

		expect(sink.ctx?.touched.first_name).toBe(true);
		expect(blurWithoutNameErrors(consoleError)).toEqual([]);
	});

	it("[ISSUE-3474-ITEM-3] marks a date field touched when focus leaves it, without logging an error", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const { container, getByRole, sink } = renderForm();
		await loaded(container);

		focus(
			container.querySelector('[data-field="start_date"] [role="spinbutton"]'),
		);
		focus(getByRole("button", { name: "outside" }));

		expect(blurWithoutNameErrors(consoleError)).toEqual([]);
		expect(sink.ctx?.touched.start_date).toBe(true);
	});
});

/**
 * Every editable date field a model renders, each empty and required: the
 * Material-UI date renderer (LocalizedKeyboardDatePicker), and the UIKit date
 * and date/time renderers (DateInput, DateTimeInput). All of them pass the
 * form's `handleBlur` on as the picker's `onBlur`.
 */
const DATE_FIELDS = [
	["the Material-UI date renderer", "picker_date", "Picker date"],
	["the UIKit date renderer (DateInput)", "input_date", "Input date"],
	[
		"the UIKit date/time renderer (DateTimeInput)",
		"input_date_time",
		"Input date time",
	],
] as const;

let dateModelCount = 0;

const createDateModel = () => {
	const edit = {
		overview: ModelVisibilityDisabled,
		edit: ModelVisibilityEditRequired,
		create: ModelVisibilityEditRequired,
	};
	const types = {
		picker_date: new ModelDataTypeDateNullableRendererMUI(),
		input_date: new ModelDataTypeDateNullableRendererCC(),
		input_date_time: new ModelDataTypeDateTimeNullableRendererCC(),
	};
	const fields: Record<string, ModelFieldDefinitionUnknown> = {
		id: {
			type: new ModelDataTypeStringRendererMUI(),
			getLabel: () => "ID",
			visibility: {
				overview: ModelVisibilityDisabled,
				edit: ModelVisibilityHidden,
				create: ModelVisibilityDisabled,
			},
			customData: null,
		},
		first_name: {
			type: new ModelDataTypeStringRendererMUI(),
			getLabel: () => "First Name",
			visibility: edit,
			customData: null,
		},
	};
	DATE_FIELDS.forEach(([, name, label]) => {
		fields[name] = {
			type: types[name],
			getLabel: () => label,
			visibility: edit,
			validate: validatePresence,
			customData: null,
		};
	});
	return new Model(
		"dates-in-form-" + String(dateModelCount++),
		fields,
		new MockConnector([
			{
				id: "1",
				first_name: "Alice",
				picker_date: null,
				input_date: null,
				input_date_time: null,
			},
		]),
	);
};

const renderDateForm = () => {
	const sink: { ctx?: ReturnType<typeof useFormContext<ModelUnknown>> } = {};
	const Content = () => {
		sink.ctx = useFormContext<ModelUnknown>();
		return (
			<>
				<div data-field="first_name">
					<FormField name="first_name" />
				</div>
				{DATE_FIELDS.map(([, name]) => (
					<div key={name} data-field={name}>
						<FormField name={name} />
					</div>
				))}
				<button type="button">outside</button>
			</>
		);
	};
	const result = render(
		<Framework>
			<Form
				model={createDateModel()}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={undefined}
				disableRouting
			>
				{Content}
			</Form>
		</Framework>,
	);
	return { ...result, sink };
};

/**
 * Lets the pickers open their desktop popup, which the media query stub of
 * this file otherwise turns into MUI's mobile dialog
 */
const withDesktopPopup = () => {
	vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
		matches: query.includes("pointer: fine"),
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}));
};

describe.each(DATE_FIELDS)("%s in a Form", (_name, field, label) => {
	const fieldOf = (container: HTMLElement) =>
		container.querySelector(`[data-field="${field}"]`) as HTMLElement;
	const requiredMessage = `The ${label} field is required`;

	it("[ISSUE-3474-ITEM-3] is marked touched when focus leaves its sections, and shows its required message, without logging an error", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const { container, getByRole, queryByText, sink } = renderDateForm();
		await loaded(container);
		// a change validates the whole form: the date's error is there, but not
		// shown while the date is untouched
		fireEvent.change(
			container.querySelector('input[name="first_name"]') as HTMLElement,
			{ target: { value: "Bob" } },
		);
		await waitFor(() => expect(sink.ctx?.errors[field]).toBe(requiredMessage));
		expect(queryByText(requiredMessage)).toBeNull();

		focus(fieldOf(container).querySelector('[role="spinbutton"]'));
		focus(getByRole("button", { name: "outside" }));
		await act(async () => {});

		expect(blurWithoutNameErrors(consoleError)).toEqual([]);
		expect(sink.ctx?.touched[field]).toBe(true);
		expect(queryByText(requiredMessage)).not.toBeNull();
	});

	it("[ISSUE-3474-ITEM-3] is marked touched when focus leaves from its open calendar, without logging an error", async () => {
		withDesktopPopup();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const { container, getByRole, sink } = renderDateForm();
		await loaded(container);

		// a mouse press focuses the button before the click opens the calendar
		const openButton = within(fieldOf(container)).getByRole("button", {
			name: /choose date/i,
		});
		focus(openButton);
		act(() => {
			fireEvent.click(openButton);
		});
		const popup = await screen.findByRole("dialog");
		// the desktop popup, which focus can leave, not the modal mobile dialog
		expect(popup.closest(".MuiPickerPopper-root")).not.toBeNull();
		await waitFor(() => {
			expect(popup).toContainElement(document.activeElement as HTMLElement);
		});
		expect(sink.ctx?.touched[field]).toBeFalsy();

		focus(getByRole("button", { name: "outside" }));

		expect(blurWithoutNameErrors(consoleError)).toEqual([]);
		expect(sink.ctx?.touched[field]).toBe(true);
	});

	/**
	 * Fills every section of the empty field from the keyboard, one ArrowUp
	 * each, which makes a whole date once the last section has a value
	 */
	const fillSections = (container: HTMLElement) => {
		const sections = within(fieldOf(container)).getAllByRole("spinbutton");
		for (const section of sections) {
			focus(section);
			act(() => {
				fireEvent.keyDown(section, { key: "ArrowUp" });
			});
		}
		return sections;
	};

	it("[ISSUE-3474-ITEM-12] takes a typed date into the form's values and dirty state once focus leaves the field", async () => {
		const { container, getByRole, sink } = renderDateForm();
		await loaded(container);

		fillSections(container);
		await act(async () => {});
		const whileInField = {
			value: sink.ctx?.values[field],
			dirty: sink.ctx?.dirty,
		};
		focus(getByRole("button", { name: "outside" }));
		await act(async () => {});

		expect({
			whileInField,
			hasValue: sink.ctx?.values[field] != null,
			dirty: sink.ctx?.dirty,
		}).toEqual({
			whileInField: { value: null, dirty: false },
			hasValue: true,
			dirty: true,
		});
	});

	it("[ISSUE-3474-ITEM-12] takes a typed date into the form's values on Enter, while focus stays in the field", async () => {
		const { container, sink } = renderDateForm();
		await loaded(container);

		const sections = fillSections(container);
		const last = sections[sections.length - 1];
		act(() => {
			fireEvent.keyDown(last, { key: "Enter" });
		});
		await act(async () => {});

		expect({
			hasValue: sink.ctx?.values[field] != null,
			dirty: sink.ctx?.dirty,
			focusInField: fieldOf(container).contains(document.activeElement),
		}).toEqual({ hasValue: true, dirty: true, focusInField: true });
	});
});

/**
 * The pickers on their own: the blur event names the field, so a handler that
 * reads the field from the event finds it
 */
const pickerTheme = createTheme();

describe.each([
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const)("%s's blur event", (_name, Picker) => {
	/** The data-name of each blur event's currentTarget, read while it is handled */
	const recordNames = () => {
		const names: (string | null)[] = [];
		const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
			names.push(event.currentTarget.getAttribute("data-name"));
		};
		return { names, onBlur };
	};
	const leaveField = (container: HTMLElement) => {
		focus(container.querySelector('[role="spinbutton"]'));
		focus(screen.getByRole("button", { name: "outside" }));
	};
	const hiddenInputName = (container: HTMLElement) =>
		(container.querySelector("input[aria-hidden]") as HTMLInputElement).name;

	it.each([
		["the picker's name", { name: "due" }, "due"],
		[
			"slotProps.textField.name, which takes precedence as in MUI",
			{ name: "due", slotName: "due_at" },
			"due_at",
		],
	])(
		"[ISSUE-3474-ITEM-3] names the field by %s, as the hidden input is named",
		(_case, props: { name: string; slotName?: string }, expected) => {
			const { names, onBlur } = recordNames();
			const { container } = render(
				<ThemeProvider theme={pickerTheme}>
					<LocalizationProvider dateAdapter={AdapterMoment}>
						<Picker
							label="Due"
							name={props.name}
							value={null}
							onChange={vi.fn()}
							slotProps={{
								textField: {
									onBlur,
									...(props.slotName ? { name: props.slotName } : {}),
								},
							}}
						/>
						<button type="button">outside</button>
					</LocalizationProvider>
				</ThemeProvider>,
			);

			leaveField(container);

			expect({ names, hiddenInput: hiddenInputName(container) }).toEqual({
				names: [expected],
				hiddenInput: expected,
			});
		},
	);
});
