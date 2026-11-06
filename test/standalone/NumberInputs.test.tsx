import { afterEach, describe, expect, it, type Mock, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import CurrencyInput from "../../src/standalone/UIKit/InputControls/CurrencyInput";
import DecimalInputField from "../../src/standalone/UIKit/InputControls/DecimalInputField";
import ccI18n from "../../src/i18n";
import userEvent from "@testing-library/user-event";
import IntegerInputField from "../../src/standalone/UIKit/InputControls/IntegerInputField";

// jsdom has "ontouchstart" on window, so isTouchDevice() would be true and
// every field with a value would get a Clear button; the tests that need one
// switch it on
const env = vi.hoisted(() => ({ touch: false }));

vi.mock("../../src/utils/isTouchDevice", () => ({
	default: () => env.touch,
}));

afterEach(async () => {
	cleanup();
	vi.restoreAllMocks();
	env.touch = false;
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

const noop = () => {};

/** the inputs format and parse with the language of the CC i18n instance */
const setLanguage = (lng: string) =>
	act(async () => {
		await ccI18n.changeLanguage(lng);
	});

const EUR: Intl.NumberFormatOptions = { style: "currency", currency: "EUR" };

const JPY: Intl.NumberFormatOptions = { style: "currency", currency: "JPY" };

/** expected text, built with Intl so the non-breaking spaces match */
const fmt = (locale: string, num: number, options?: Intl.NumberFormatOptions) =>
	num.toLocaleString(locale, options);

const field = (name: string) =>
	screen.getByRole<HTMLInputElement>("textbox", { name });

type NumberChange = (
	evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
	value: number | null,
) => void;

type ValueSpy = Mock<(value: number | null, name: string) => void>;

/**
 * Keeps the value in state as a form does, and records every reported value
 * with the name of the event's target (the model renderers dispatch on it)
 */
const Controlled = function Controlled(props: {
	initial: number | null;
	onValue: ValueSpy;
	children: (value: number | null, onChange: NumberChange) => React.ReactNode;
}) {
	const { initial, onValue, children } = props;
	const [value, setValue] = useState(initial);
	const handleChange: NumberChange = (evt, next) => {
		onValue(next, evt.target.name);
		setValue(next);
	};
	return <>{children(value, handleChange)}</>;
};

const reported = (onValue: ValueSpy) =>
	onValue.mock.calls.map(([value]) => value);

/** focus and blur without typing: what tabbing through a form does */
const tabThrough = (input: HTMLElement) => {
	fireEvent.focus(input);
	fireEvent.blur(input);
};

describe("IntegerInputField", () => {
	it("[ISSUE-3484-ITEM-8] does not join the digits on both sides of a decimal separator", () => {
		const onValue: ValueSpy = vi.fn();
		render(
			<Controlled initial={null} onValue={onValue}>
				{(value, onChange) => (
					<IntegerInputField label="Count" value={value} onChange={onChange} />
				)}
			</Controlled>,
		);
		// pasted
		fireEvent.change(field("Count"), { target: { value: "1.5" } });
		expect(reported(onValue)).not.toContain(15);
	});

	/** an IntegerInputField whose value is kept in state, as a form does */
	const renderCount = (initial: number | null, onValue: ValueSpy) =>
		render(
			<Controlled initial={initial} onValue={onValue}>
				{(value, onChange) => (
					<IntegerInputField label="Count" value={value} onChange={onChange} />
				)}
			</Controlled>,
		);

	it("[ISSUE-3484-ITEM-8] keeps digits typed after a decimal separator out of the number, and drops them on blur", async () => {
		const user = userEvent.setup();
		const onValue: ValueSpy = vi.fn();
		renderCount(null, onValue);
		await user.type(field("Count"), "1.5");
		expect(reported(onValue)).toEqual([1, 1, 1]);
		// the typed text stays, so the 5 lands after the separator
		expect(field("Count")).toHaveValue("1.5");
		await user.type(field("Count"), "0");
		expect(reported(onValue).at(-1)).toBe(1);
		expect(field("Count")).toHaveValue("1.50");
		tabThrough(field("Count"));
		expect(field("Count")).toHaveValue("1");
		expect(reported(onValue).at(-1)).toBe(1);
	});

	it.each([
		["en", "1,234.56", 1234],
		["en", ".5", 0],
		["en", ".", null],
		["de", "7,5", 7],
		["de", "1.234,5", 1234],
		// the group separator, wherever it is: digits typed into a grouped number
		["de", "1.2345", 12345],
		["en", "12,34", 1234],
	])(
		"[ISSUE-3484-ITEM-8] reads %s text %j as %j",
		async (lng, text, expected) => {
			await setLanguage(lng);
			const onValue: ValueSpy = vi.fn();
			renderCount(null, onValue);
			fireEvent.change(field("Count"), { target: { value: text } });
			expect(reported(onValue)).toEqual([expected]);
		},
	);

	it("[ISSUE-3484-ITEM-8] truncates a fractional value on the first keystroke instead of appending to its digits", async () => {
		const user = userEvent.setup();
		const onValue: ValueSpy = vi.fn();
		renderCount(7.5, onValue);
		expect(field("Count")).toHaveValue("7.5");
		await user.type(field("Count"), "1");
		expect(reported(onValue)).toEqual([7]);
	});

	it("[ISSUE-3484-ITEM-8] shows the value the parent keeps instead of the typed fraction", () => {
		const onValue: ValueSpy = vi.fn();
		render(
			<Controlled initial={10} onValue={onValue}>
				{(value, onChange) => (
					<IntegerInputField
						label="Count"
						value={value}
						onChange={(evt, next) =>
							onChange(evt, next == null ? next : Math.min(next, 10))
						}
					/>
				)}
			</Controlled>,
		);
		fireEvent.change(field("Count"), { target: { value: "15.5" } });
		expect(reported(onValue)).toEqual([10]);
		expect(field("Count")).toHaveValue("10");
	});

	it("[ISSUE-3484-ITEM-8] still calls onBlur", () => {
		const onBlur = vi.fn();
		render(<IntegerInputField label="Count" value={1} onBlur={onBlur} />);
		tabThrough(field("Count"));
		expect(onBlur).toHaveBeenCalledTimes(1);
	});
});

describe("CurrencyInput", () => {
	describe("locales and currencies", () => {
		it("[ISSUE-3484-ITEM-1] reads back a grouped yen amount in Spanish", async () => {
			await setLanguage("es");
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={12345} onValue={onValue}>
					{(value, onChange) => (
						<CurrencyInput
							label="Amount"
							currency="JPY"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			expect(field("Amount")).toHaveValue(fmt("es", 12345, JPY));
			fireEvent.change(field("Amount"), {
				target: { value: fmt("es", 12346, JPY) },
			});
			fireEvent.blur(field("Amount"));
			expect(reported(onValue)).toEqual([12346]);
		});
	});
	describe("text that does not parse", () => {
		it("[ISSUE-3484-ITEM-20] says in text why the amount is invalid", () => {
			render(
				<CurrencyInput
					label="Amount"
					currency="EUR"
					value={3}
					onChange={noop}
				/>,
			);
			const input = field("Amount");
			fireEvent.change(input, { target: { value: "." } });
			fireEvent.blur(input);
			expect(input).toHaveAttribute("aria-invalid", "true");
			expect(input).toHaveAccessibleDescription(/\S/);
		});

		it("[ISSUE-3484-ITEM-20] drops the parse error when a new value arrives", () => {
			const { rerender } = render(
				<CurrencyInput
					label="Amount"
					currency="EUR"
					value={3}
					onChange={noop}
				/>,
			);
			fireEvent.change(field("Amount"), { target: { value: "." } });
			fireEvent.blur(field("Amount"));
			expect(field("Amount")).toHaveAttribute("aria-invalid", "true");
			// e.g. the form is reset, or the record is reloaded
			rerender(
				<CurrencyInput
					label="Amount"
					currency="EUR"
					value={9}
					onChange={noop}
				/>,
			);
			expect(field("Amount")).toHaveValue("€9.00");
			expect(field("Amount")).toHaveAttribute("aria-invalid", "false");
		});

		it("[ISSUE-3484-ITEM-20] names a number in the field's format, in the CC language", async () => {
			await setLanguage("de");
			render(
				<CurrencyInput
					label="Amount"
					currency="EUR"
					value={3}
					onChange={noop}
				/>,
			);
			fireEvent.change(field("Amount"), { target: { value: "," } });
			fireEvent.blur(field("Amount"));
			expect(field("Amount")).toHaveAccessibleDescription(
				`Gib eine Zahl ein, z. B. ${fmt("de", 1234.56, EUR)}`,
			);
		});

		it("[ISSUE-3484-ITEM-20] shows the message in place of the helper text until a valid edit", () => {
			render(
				<CurrencyInput
					label="Amount"
					currency="EUR"
					value={3}
					onChange={noop}
					helperText="Net amount"
				/>,
			);
			const input = field("Amount");
			expect(input).toHaveAccessibleDescription("Net amount");
			fireEvent.change(input, { target: { value: "." } });
			fireEvent.blur(input);
			expect(input).toHaveAccessibleDescription(
				`Enter a number, such as ${fmt("en", 1234.56, EUR)}`,
			);
			// still invalid while it is edited, until the next blur
			fireEvent.change(input, { target: { value: "5" } });
			expect(input).toHaveAttribute("aria-invalid", "true");
			fireEvent.blur(input);
			expect(input).toHaveAttribute("aria-invalid", "false");
			expect(input).toHaveAccessibleDescription("Net amount");
		});

		it("[ISSUE-3484-ITEM-20] drops the parse error on a currency or language switch", async () => {
			const { rerender } = render(
				<CurrencyInput
					label="Amount"
					currency="EUR"
					value={3}
					onChange={noop}
				/>,
			);
			fireEvent.change(field("Amount"), { target: { value: "." } });
			fireEvent.blur(field("Amount"));
			rerender(
				<CurrencyInput
					label="Amount"
					currency="JPY"
					value={3}
					onChange={noop}
				/>,
			);
			expect(field("Amount")).toHaveValue(fmt("en", 3, JPY));
			expect(field("Amount")).toHaveAttribute("aria-invalid", "false");
			expect(field("Amount")).toHaveAccessibleDescription("");

			fireEvent.change(field("Amount"), { target: { value: "." } });
			fireEvent.blur(field("Amount"));
			expect(field("Amount")).toHaveAttribute("aria-invalid", "true");
			await setLanguage("de");
			expect(field("Amount")).toHaveValue(fmt("de", 3, JPY));
			expect(field("Amount")).toHaveAttribute("aria-invalid", "false");
			expect(field("Amount")).toHaveAccessibleDescription("");
		});
	});
});

describe("DecimalInputField", () => {
	describe("locale and format changes", () => {
		it("[ISSUE-3484-ITEM-1] keeps a whole number the Italian locale shows grouped", async () => {
			await setLanguage("it");
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={12345} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			expect(field("Hours")).toHaveValue("12.345");
			tabThrough(field("Hours"));
			expect(reported(onValue).filter((value) => value !== 12345)).toEqual([]);
		});
	});
	describe("commit", () => {
		it("[ISSUE-3484-ITEM-2] keeps the value on a blur without an edit instead of rounding it to the shown digits", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={0.12345} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			expect(field("Hours")).toHaveValue("0.123");
			tabThrough(field("Hours"));
			expect(reported(onValue).filter((value) => value !== 0.12345)).toEqual(
				[],
			);
		});

		it("[ISSUE-3484-ITEM-6] calls onBlur", () => {
			const onBlur = vi.fn();
			render(
				<DecimalInputField
					label="Hours"
					value={1}
					onChange={noop}
					onBlur={onBlur}
				/>,
			);
			tabThrough(field("Hours"));
			expect(onBlur).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3484-ITEM-2] keeps the value on a blur without an edit with a format, and while read-only", () => {
			const onRounded: ValueSpy = vi.fn();
			const onReadOnly: ValueSpy = vi.fn();
			render(
				<>
					<Controlled initial={7.5} onValue={onRounded}>
						{(value, onChange) => (
							<DecimalInputField
								label="Rounded"
								format={{ maximumFractionDigits: 0 }}
								value={value}
								onChange={onChange}
							/>
						)}
					</Controlled>
					<Controlled initial={0.12345} onValue={onReadOnly}>
						{(value, onChange) => (
							<DecimalInputField
								label="Read-only"
								value={value}
								onChange={onChange}
								slotProps={{ input: { readOnly: true } }}
							/>
						)}
					</Controlled>
				</>,
			);
			expect(field("Rounded")).toHaveValue("8");
			tabThrough(field("Rounded"));
			expect(reported(onRounded).filter((value) => value !== 7.5)).toEqual([]);
			tabThrough(field("Read-only"));
			expect(reported(onReadOnly).filter((value) => value !== 0.12345)).toEqual(
				[],
			);
		});

		it("[ISSUE-3484-ITEM-2] commits an edit once, on the blur after it", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={0.12345} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			const input = field("Hours");
			fireEvent.focus(input);
			fireEvent.change(input, { target: { value: "7.5" } });
			expect(reported(onValue)).toEqual([]);
			fireEvent.blur(input);
			expect(reported(onValue)).toEqual([7.5]);
			tabThrough(input);
			expect(reported(onValue)).toEqual([7.5]);
			expect(input).toHaveValue("7.5");
		});

		it("[ISSUE-3484-ITEM-6] calls onBlur on every blur, before onChange after an edit", () => {
			const onBlur = vi.fn();
			const onChange = vi.fn();
			render(
				<DecimalInputField
					label="Hours"
					value={1}
					onChange={onChange}
					onBlur={onBlur}
				/>,
			);
			const input = field("Hours");
			fireEvent.focus(input);
			fireEvent.change(input, { target: { value: "2" } });
			fireEvent.blur(input);
			tabThrough(input);
			expect(onBlur).toHaveBeenCalledTimes(2);
			expect(onChange).toHaveBeenCalledTimes(1);
			expect(onBlur.mock.invocationCallOrder[0]).toBeLessThan(
				onChange.mock.invocationCallOrder[0],
			);
		});
	});
});
