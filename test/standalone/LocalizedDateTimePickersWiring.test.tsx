import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { type Moment } from "moment";
import ccI18n from "../../src/i18n";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";

/**
 * How the three picker wrappers wire the draft hook (`usePickerDraft`) into MUI's
 * pickers, which of the consumer's props reach the field, and what the field
 * exposes to assistive technology.
 */
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";
import DateTimeInput from "../../src/standalone/UIKit/InputControls/DateTimeInput";

const theme = createTheme();

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider theme={theme}>
		<LocalizationProvider dateAdapter={AdapterMoment}>
			{children}
		</LocalizationProvider>
	</ThemeProvider>
);

afterEach(async () => {
	cleanup();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

const STORED = "2026-08-01T10:00";

/** The aria-invalid of every section, in order */
const invalidSections = () =>
	screen
		.getAllByRole("spinbutton")
		.map((section) => section.getAttribute("aria-invalid"));

describe("accessibility", () => {
	it.each([
		[
			"LocalizedKeyboardDatePicker",
			<LocalizedKeyboardDatePicker
				key="k"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
		[
			"LocalizedDatePicker",
			<LocalizedDatePicker
				key="d"
				label="Due"
				value={null}
				onChange={vi.fn()}
				slotProps={{ textField: { required: true } }}
			/>,
		],
		[
			"LocalizedDateTimePicker",
			<LocalizedDateTimePicker
				key="dt"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
	])(
		"[ISSUE-3474-ITEM-16] exposes required on every section of a %s",
		(_name, element) => {
			render(<Wrap>{element}</Wrap>);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
			}
		},
	);

	it.each([
		["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
		["LocalizedDatePicker", LocalizedDatePicker],
		["LocalizedDateTimePicker", LocalizedDateTimePicker],
	] as const)(
		"[ISSUE-3474-ITEM-16] leaves required off the sections of an optional %s",
		(_name, Picker) => {
			render(
				<Wrap>
					<Picker label="Due" value={null} onChange={vi.fn()} />
				</Wrap>,
			);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).not.toBeRequired();
			}
		},
	);

	it.each(["standard", "filled"] as const)(
		"[ISSUE-3474-ITEM-16] exposes required on every section of the %s variant",
		(variant) => {
			render(
				<Wrap>
					<LocalizedKeyboardDatePicker
						label="Due"
						value={null}
						onChange={vi.fn()}
						required
						slotProps={{ textField: { variant } }}
					/>
				</Wrap>,
			);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
			}
		},
	);

	it("[ISSUE-3474-ITEM-16] follows required when it changes after mount", () => {
		const picker = (required: boolean) => (
			<Wrap>
				<LocalizedKeyboardDatePicker
					label="Due"
					value={null}
					onChange={vi.fn()}
					required={required}
				/>
			</Wrap>
		);
		const { rerender } = render(picker(false));
		const requiredSections = () =>
			screen
				.getAllByRole("spinbutton")
				.map((section) => section.getAttribute("aria-required"));

		rerender(picker(true));
		expect(requiredSections()).toEqual(["true", "true", "true"]);
		rerender(picker(false));
		expect(requiredSections()).toEqual([null, null, null]);
	});

	it.each([
		["an object", { className: "caller-section" }],
		["a function", () => ({ className: "caller-section" })],
	])(
		"[ISSUE-3474-ITEM-16] keeps the caller's section content props given as %s",
		(_form, sectionContent) => {
			render(
				<Wrap>
					<LocalizedKeyboardDatePicker
						label="Due"
						value={null}
						onChange={vi.fn()}
						required
						slotProps={{
							textField: {
								slotProps: { input: { slotProps: { sectionContent } } },
							},
						}}
					/>
				</Wrap>,
			);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
				expect(section).toHaveClass("caller-section");
			}
		},
	);

	it.each([
		[
			"DateInput",
			<DateInput
				key="d"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
		[
			"DateTimeInput",
			<DateTimeInput
				key="dt"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
	])(
		"[ISSUE-3474-ITEM-16] exposes required on every section of a %s",
		(_name, element) => {
			render(<Wrap>{element}</Wrap>);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
			}
		},
	);

	it("[ISSUE-3474-ITEM-17] marks the focused section invalid, not only the group", () => {
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					label="Due"
					value={moment(STORED)}
					onChange={vi.fn()}
					error
				/>
			</Wrap>,
		);
		const year = screen.getByRole("spinbutton", { name: "Year" });
		focus(year);
		expect(year).toHaveAttribute("aria-invalid", "true");
	});

	it.each([
		[
			"LocalizedKeyboardDatePicker",
			<LocalizedKeyboardDatePicker
				key="k"
				label="Due"
				value={moment(STORED)}
				onChange={vi.fn()}
				error
			/>,
		],
		[
			"LocalizedDatePicker",
			<LocalizedDatePicker
				key="d"
				label="Due"
				value={moment(STORED)}
				onChange={vi.fn()}
				slotProps={{ textField: { error: true } }}
			/>,
		],
		[
			"LocalizedDateTimePicker",
			<LocalizedDateTimePicker
				key="dt"
				label="Due"
				value={moment(STORED)}
				onChange={vi.fn()}
				error
			/>,
		],
		[
			"DateInput",
			<DateInput
				key="di"
				label="Due"
				value={moment(STORED).toDate()}
				onChange={vi.fn()}
				error
			/>,
		],
		[
			"DateTimeInput",
			<DateTimeInput
				key="dti"
				label="Due"
				value={moment(STORED)}
				onChange={vi.fn()}
				error
			/>,
		],
	])(
		"[ISSUE-3474-ITEM-17] marks every section of a %s invalid while error is set",
		(_name, element) => {
			render(<Wrap>{element}</Wrap>);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toHaveAttribute("aria-invalid", "true");
			}
		},
	);

	it.each(PICKERS)(
		"[ISSUE-3474-ITEM-17] leaves the sections of a valid %s unmarked",
		(_name, Picker) => {
			render(
				<Wrap>
					<Picker label="Due" value={moment(STORED)} onChange={vi.fn()} />
				</Wrap>,
			);
			expect(invalidSections()).not.toContain("true");
		},
	);

	it("[ISSUE-3474-ITEM-17] follows error={false} over the picker's own validation, as the group does", () => {
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					label="Due"
					value={moment(STORED)}
					maxDate={moment(STORED).subtract(1, "day")}
					onChange={vi.fn()}
					error={false}
				/>
			</Wrap>,
		);
		expect(screen.getByRole("group")).toHaveAttribute("aria-invalid", "false");
		expect(invalidSections()).not.toContain("true");
	});

	it("[ISSUE-3474-ITEM-17] follows error when it changes after mount", () => {
		const picker = (error: boolean) => (
			<Wrap>
				<LocalizedKeyboardDatePicker
					label="Due"
					value={moment(STORED)}
					onChange={vi.fn()}
					error={error}
				/>
			</Wrap>
		);
		const { rerender } = render(picker(false));
		expect(invalidSections()).toEqual([null, null, null]);
		rerender(picker(true));
		expect(invalidSections()).toEqual(["true", "true", "true"]);
		rerender(picker(false));
		expect(invalidSections()).toEqual([null, null, null]);
	});

	it.each([
		["an object", { className: "caller-section" }],
		["a function", () => ({ className: "caller-section" })],
	])(
		"[ISSUE-3474-ITEM-17] keeps the caller's section content props given as %s",
		(_form, sectionContent) => {
			render(
				<Wrap>
					<LocalizedKeyboardDatePicker
						label="Due"
						value={moment(STORED)}
						onChange={vi.fn()}
						error
						slotProps={{
							textField: {
								slotProps: { input: { slotProps: { sectionContent } } },
							},
						}}
					/>
				</Wrap>,
			);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toHaveAttribute("aria-invalid", "true");
				expect(section).toHaveClass("caller-section");
			}
		},
	);

	const helperTextSlotProps = {
		textField: { helperText: "Pick a weekday" },
	} as const;
	const withHelperText: [string, React.ReactElement][] = [
		...PICKERS.map(([name, Picker]): [string, React.ReactElement] => [
			name,
			<Picker
				key={name}
				label="Due"
				value={moment(STORED)}
				onChange={vi.fn()}
				slotProps={helperTextSlotProps}
			/>,
		]),
		[
			"DateInput",
			<DateInput
				key="di"
				label="Due"
				value={moment(STORED).toDate()}
				onChange={vi.fn()}
				slotProps={helperTextSlotProps}
			/>,
		],
		[
			"DateTimeInput",
			<DateTimeInput
				key="dti"
				label="Due"
				value={moment(STORED)}
				onChange={vi.fn()}
				slotProps={helperTextSlotProps}
			/>,
		],
	];
	it.each(withHelperText)(
		"[ISSUE-3474-ITEM-17] makes the helper text of a %s the live region, not the field group",
		(_name, element) => {
			render(<Wrap>{element}</Wrap>);
			const group = screen.getByRole("group");
			const helperText = screen.getByText("Pick a weekday");
			expect(group).not.toHaveAttribute("aria-live");
			expect(helperText).toHaveAttribute("aria-live", "polite");
			// still the field's description
			expect(group).toHaveAccessibleDescription("Pick a weekday");
		},
	);

	it("[ISSUE-3474-ITEM-17] keeps an aria-live the caller set on the group or the helper text", () => {
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					label="Due"
					value={moment(STORED)}
					onChange={vi.fn()}
					slotProps={{
						textField: {
							helperText: "Pick a weekday",
							slotProps: {
								input: { "aria-live": "assertive" },
								formHelperText: { "aria-live": "off" },
							},
						},
					}}
				/>
			</Wrap>,
		);
		expect(screen.getByRole("group")).toHaveAttribute("aria-live", "assertive");
		expect(screen.getByText("Pick a weekday")).toHaveAttribute(
			"aria-live",
			"off",
		);
	});
});

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const;

/** What the whole field reads, sections joined with "|" */
const fieldText = () =>
	screen
		.getAllByRole("spinbutton")
		.map((section) => section.textContent)
		.join("|");
/** The month, day and year sections only, so the time of a DateTimePicker is left out */
const datePart = () => fieldText().split("|").slice(0, 3).join("|");
const focus = (element: Element) => {
	act(() => {
		(element as HTMLElement).focus();
	});
};
/** One day past maxDate: a whole date the picker rejects, so the wrapper holds it as a draft */
const makeDraft = () => {
	const day = screen.getAllByRole("spinbutton")[1];
	focus(day);
	act(() => {
		fireEvent.keyDown(day, { key: "ArrowUp" });
	});
};
const outside = () => screen.getByRole("button", { name: "outside" });
const openButton = () => screen.getByRole("button", { name: /choose date/i });

describe.each(PICKERS)("%s wiring", (_name, Picker) => {
	const ControlledWithError = (props: {
		onError?: (error: unknown, value: unknown) => void;
	}) => {
		const [value, setValue] = useState<Moment | null>(() => moment(STORED));
		return (
			<Picker
				label="Due"
				value={value}
				maxDate={moment(STORED).endOf("day")}
				onChange={setValue}
				onError={props.onError}
			/>
		);
	};

	it("[ISSUE-3474-ITEM-17] marks the sections invalid while the picker rejects what it shows", () => {
		const onError = vi.fn();
		render(
			<Wrap>
				<ControlledWithError onError={onError} />
			</Wrap>,
		);
		expect(invalidSections()).not.toContain("true");

		makeDraft();
		expect(screen.getByRole("group")).toHaveAttribute("aria-invalid", "true");
		for (const section of screen.getAllByRole("spinbutton")) {
			expect(section).toHaveAttribute("aria-invalid", "true");
		}
		// the consumer's onError still gets MUI's arguments
		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError.mock.calls[0][0]).toBe("maxDate");
		expect(moment(onError.mock.calls[0][1] as Moment).format()).toBe(
			moment(STORED).add(1, "day").format(),
		);

		act(() => {
			fireEvent.keyDown(screen.getAllByRole("spinbutton")[1], {
				key: "ArrowDown",
			});
		});
		expect(screen.getByRole("group")).toHaveAttribute("aria-invalid", "false");
		expect(invalidSections()).not.toContain("true");
		expect(onError).toHaveBeenCalledTimes(2);
		expect(onError.mock.calls[1][0]).toBeNull();
	});

	it("[ISSUE-3474-ITEM-17] calls the onError of the latest render", () => {
		const first = vi.fn();
		const second = vi.fn();
		const { rerender } = render(
			<Wrap>
				<ControlledWithError onError={first} />
			</Wrap>,
		);
		rerender(
			<Wrap>
				<ControlledWithError onError={second} />
			</Wrap>,
		);
		makeDraft();
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
	});

	const Controlled = (props: {
		onChange?: (value: Moment | null) => void;
		onError?: (error: unknown) => void;
		onOpen?: () => void;
		onAccept?: (value: Moment | null, context: unknown) => void;
		slotBlur?: () => void;
		publishIntermediateValues?: boolean;
	}) => {
		const [value, setValue] = useState<Moment | null>(() => moment(STORED));
		return (
			<>
				<Picker
					label="Due"
					value={value}
					maxDate={moment(STORED).endOf("day")}
					onChange={(newValue) => {
						setValue(newValue);
						props.onChange?.(newValue);
					}}
					onError={props.onError}
					onOpen={props.onOpen}
					onAccept={props.onAccept}
					publishIntermediateValues={props.publishIntermediateValues}
					slotProps={{ textField: () => ({ onBlur: props.slotBlur }) }}
				/>
				<button type="button">outside</button>
			</>
		);
	};

	it("[ISSUE-3474-ITEM-2] calls onBlur once when focus leaves through the open-picker button", () => {
		const slotBlur = vi.fn();
		render(
			<Wrap>
				<Controlled slotBlur={slotBlur} />
			</Wrap>,
		);
		makeDraft();
		// Tab from the last section goes to the button, the next Tab leaves the field
		focus(openButton());
		const blursOnTheWayIn = slotBlur.mock.calls.length;
		focus(outside());
		expect({
			shown: datePart(),
			blursOnTheWayIn,
			blursInAll: slotBlur.mock.calls.length,
		}).toEqual({ shown: "08|02|2026", blursOnTheWayIn: 0, blursInAll: 1 });
	});

	it("[ISSUE-3474-ITEM-2] keeps the draft and reports no blur while focus moves between the sections and to the open-picker button", () => {
		const slotBlur = vi.fn();
		render(
			<Wrap>
				<Controlled slotBlur={slotBlur} />
			</Wrap>,
		);
		makeDraft();
		focus(screen.getAllByRole("spinbutton")[0]);
		focus(openButton());
		expect({ shown: datePart(), blurs: slotBlur.mock.calls.length }).toEqual({
			shown: "08|02|2026",
			blurs: 0,
		});
	});

	it("[ISSUE-3474-ITEM-2] calls onBlur once when focus goes back from the open-picker button through the sections", () => {
		const slotBlur = vi.fn();
		render(
			<Wrap>
				<Controlled slotBlur={slotBlur} />
			</Wrap>,
		);
		makeDraft();
		focus(openButton());
		// Shift+Tab from the button goes back to the last section
		focus(screen.getAllByRole("spinbutton").at(-1) as HTMLElement);
		focus(outside());
		expect({ shown: datePart(), blurs: slotBlur.mock.calls.length }).toEqual({
			shown: "08|02|2026",
			blurs: 1,
		});
	});

	it("[ISSUE-3474-ITEM-2] reports no blur while the calendar is open, and one when focus leaves after it closed", async () => {
		const slotBlur = vi.fn();
		render(
			<Wrap>
				<Controlled slotBlur={slotBlur} />
			</Wrap>,
		);
		// a mouse press focuses the button before the click opens the calendar
		focus(openButton());
		act(() => {
			fireEvent.click(openButton());
		});
		const popup = await screen.findByRole("dialog");
		// the calendar takes focus when it opens
		await waitFor(() => {
			expect(popup).toContainElement(document.activeElement as HTMLElement);
		});
		act(() => {
			fireEvent.keyDown(document.activeElement as HTMLElement, {
				key: "Escape",
			});
		});
		// and hands it back to the button when it closes
		await waitFor(() => {
			expect(openButton()).toHaveFocus();
		});
		const blursWhileOpen = slotBlur.mock.calls.length;
		focus(outside());
		expect({
			blursWhileOpen,
			blursInAll: slotBlur.mock.calls.length,
		}).toEqual({ blursWhileOpen: 0, blursInAll: 1 });
	});

	it("[ISSUE-3474-ITEM-2] reports no blur while the mobile dialog is open, and one when focus leaves after it closed", async () => {
		// no media query matches, so the picker takes its mobile form
		vi.stubGlobal("matchMedia", (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}));
		const slotBlur = vi.fn();
		try {
			render(
				<Wrap>
					<Controlled slotBlur={slotBlur} />
				</Wrap>,
			);
			focus(openButton());
			act(() => {
				fireEvent.click(openButton());
			});
			const dialog = await screen.findByRole("dialog");
			expect(dialog.closest(".MuiDialog-root")).not.toBeNull();
			await waitFor(() => {
				expect(dialog).toContainElement(document.activeElement as HTMLElement);
			});
			act(() => {
				fireEvent.keyDown(document.activeElement as HTMLElement, {
					key: "Escape",
				});
			});
			await waitFor(() => {
				expect(openButton()).toHaveFocus();
			});
			const blursWhileOpen = slotBlur.mock.calls.length;
			focus(outside());
			expect({
				blursWhileOpen,
				blursInAll: slotBlur.mock.calls.length,
			}).toEqual({ blursWhileOpen: 0, blursInAll: 1 });
		} finally {
			vi.unstubAllGlobals();
		}
	});

	it("[ISSUE-3474-ITEM-2] keeps a blur handler the caller set on the input root", () => {
		const rootBlur = vi.fn();
		render(
			<Wrap>
				<Picker
					label="Due"
					value={moment(STORED)}
					onChange={vi.fn()}
					slotProps={{
						textField: {
							slotProps: {
								input: { slotProps: { root: { onBlur: rootBlur } } },
							},
						},
					}}
				/>
				<button type="button">outside</button>
			</Wrap>,
		);
		focus(screen.getAllByRole("spinbutton")[0]);
		focus(openButton());
		focus(outside());
		// it sees every blur inside the root, as MUI hands it over
		expect(rootBlur).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3474-ITEM-11] keeps a complete but rejected date, and its error, when focus leaves the field", () => {
		const onChange = vi.fn();
		const onError = vi.fn<(error: unknown) => void>();
		render(
			<Wrap>
				<Controlled onChange={onChange} onError={onError} />
			</Wrap>,
		);
		makeDraft();
		focus(outside());
		// as in MUI's own field: what was entered stays, marked invalid, and the
		// error is not withdrawn; the consumer still holds the accepted date
		expect({
			shown: datePart(),
			invalid: screen.getByRole("group").getAttribute("aria-invalid"),
			errors: onError.mock.calls.map((call) => call[0]),
			changes: onChange.mock.calls.length,
		}).toEqual({
			shown: "08|02|2026",
			invalid: "true",
			errors: ["maxDate"],
			changes: 0,
		});
	});

	it("[ISSUE-3474-ITEM-11] drops a rejected date when the calendar opens, and opens it on the accepted date", async () => {
		const onError = vi.fn<(error: unknown) => void>();
		render(
			<Wrap>
				<Controlled onError={onError} />
			</Wrap>,
		);
		makeDraft();
		// a mouse press focuses the button before the click opens the calendar
		focus(openButton());
		expect(datePart()).toBe("08|02|2026");
		act(() => {
			fireEvent.click(openButton());
		});
		const popup = await screen.findByRole("dialog");
		expect({
			shown: datePart(),
			selected: popup.querySelector("[role='gridcell'][aria-selected='true']")
				?.textContent,
			errors: onError.mock.calls.map((call) => call[0]),
		}).toEqual({
			shown: "08|01|2026",
			selected: "1",
			errors: ["maxDate", null],
		});
	});

	it("[ISSUE-3474-ITEM-1] renders an invalid value instead of looping", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			render(
				<Wrap>
					<Picker label="Due" value={moment.invalid()} onChange={vi.fn()} />
				</Wrap>,
			);
		} finally {
			consoleError.mockRestore();
		}
		expect(screen.getByRole("group", { name: "Due" })).toBeInTheDocument();
	});

	it("[ISSUE-3474-ITEM-1] shows an invalid value as an invalid field and reports invalidDate, as MUI does", () => {
		const onChange = vi.fn();
		const onError = vi.fn<(error: unknown) => void>();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			render(
				<Wrap>
					<Picker
						label="Due"
						value={moment.invalid()}
						onChange={onChange}
						onError={onError}
					/>
				</Wrap>,
			);
		} finally {
			consoleError.mockRestore();
		}
		expect({
			invalid: screen
				.getByRole("group", { name: "Due" })
				.getAttribute("aria-invalid"),
			errors: onError.mock.calls.map((call) => call[0]),
			changes: onChange.mock.calls.length,
		}).toEqual({ invalid: "true", errors: ["invalidDate"], changes: 0 });
	});
});

describe("leaving the field", () => {
	it.each([
		["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
		["LocalizedDateTimePicker", LocalizedDateTimePicker],
	] as const)(
		"[ISSUE-3474-ITEM-2] calls the onBlur prop of a %s once, with the event of the field group",
		(_name, Picker) => {
			const seen: { currentTarget: EventTarget | null; target: EventTarget }[] =
				[];
			const onBlur = vi.fn((event: React.FocusEvent) => {
				seen.push({ currentTarget: event.currentTarget, target: event.target });
			});
			render(
				<Wrap>
					<Picker
						label="Due"
						value={moment(STORED)}
						onChange={vi.fn()}
						onBlur={onBlur}
					/>
					<button type="button">outside</button>
				</Wrap>,
			);
			focus(screen.getAllByRole("spinbutton")[0]);
			focus(openButton());
			expect(onBlur).not.toHaveBeenCalled();
			focus(outside());
			expect(seen).toEqual([
				{ currentTarget: screen.getByRole("group"), target: openButton() },
			]);
		},
	);

	it.each([
		[
			"DateInput",
			"open-picker",
			(onBlur: () => void) => (
				<DateInput
					label="Due"
					value={new Date(STORED)}
					onChange={vi.fn()}
					maxDate={new Date("2026-08-01T12:00:00.000Z")}
					onBlur={onBlur}
				/>
			),
			openButton,
		],
		[
			"DateTimeInput",
			"info",
			(onBlur: () => void) => (
				<DateTimeInput
					label="Due"
					value={moment(STORED)}
					onChange={vi.fn()}
					maxDate={moment(STORED).endOf("day")}
					onBlur={onBlur}
					openInfo={vi.fn()}
				/>
			),
			() => screen.getByRole("button", { name: /info/i }),
		],
	] as const)(
		"[ISSUE-3474-ITEM-2] calls onBlur once when focus leaves a %s through its %s button",
		(_name, _button, input, button) => {
			const onBlur = vi.fn();
			render(
				<Wrap>
					{input(onBlur)}
					<button type="button">outside</button>
				</Wrap>,
			);
			makeDraft();
			focus(button());
			expect({ shown: datePart(), blurs: onBlur.mock.calls.length }).toEqual({
				shown: "08|02|2026",
				blurs: 0,
			});
			focus(outside());
			expect({ shown: datePart(), blurs: onBlur.mock.calls.length }).toEqual({
				shown: "08|02|2026",
				blurs: 1,
			});
		},
	);
});

describe("picker texts", () => {
	it("[ISSUE-3474-ITEM-7] use MUI's Italian texts for the library language it", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("it");
		});
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					value={moment(STORED)}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(
			screen.getByRole("button", { name: /^Scegli la data/ }),
		).toBeInTheDocument();
	});

	it.each([
		["it", "Anno", /^Scegli la data/],
		["es", "Año", /^Elige fecha/],
	])(
		"[ISSUE-3474-ITEM-7] names the sections and the button of every picker in the library language %s",
		async (language, year, openButton) => {
			await act(async () => {
				await ccI18n.changeLanguage(language);
			});
			for (const [, Picker] of PICKERS) {
				const { unmount } = render(
					<Wrap>
						<Picker value={moment(STORED)} onChange={vi.fn()} />
					</Wrap>,
				);
				expect(screen.getByRole("spinbutton", { name: year })).toBeVisible();
				expect(
					screen.getByRole("button", { name: openButton }),
				).toBeInTheDocument();
				unmount();
			}
		},
	);
});
