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

	it("[ISSUE-3484-ITEM-3] keeps the sign of a negative number", () => {
		const onValue: ValueSpy = vi.fn();
		render(
			<Controlled initial={-5} onValue={onValue}>
				{(value, onChange) => (
					<IntegerInputField label="Count" value={value} onChange={onChange} />
				)}
			</Controlled>,
		);
		expect(field("Count")).toHaveValue("-5");
		fireEvent.change(field("Count"), { target: { value: "-56" } });
		// -56, or the minus refused visibly: never the flipped number
		expect(reported(onValue)).not.toContain(56);
	});

	it("[ISSUE-3484-ITEM-3] takes a minus typed key by key, and shows it until a digit follows", async () => {
		const user = userEvent.setup();
		const onValue: ValueSpy = vi.fn();
		renderCount(null, onValue);
		await user.type(field("Count"), "-");
		expect(field("Count")).toHaveValue("-");
		expect(reported(onValue)).toEqual([null]);
		await user.type(field("Count"), "1234");
		expect(reported(onValue)).toEqual([null, -1, -12, -123, -1234]);
		expect(field("Count")).toHaveValue("-1,234");
		await user.type(field("Count"), ".5");
		expect(reported(onValue).at(-1)).toBe(-1234);
	});

	it("[ISSUE-3484-ITEM-3] drops a lone minus on blur, and reads -0 as 0", async () => {
		const user = userEvent.setup();
		const onValue: ValueSpy = vi.fn();
		renderCount(null, onValue);
		await user.type(field("Count"), "-");
		tabThrough(field("Count"));
		expect(field("Count")).toHaveValue("");
		await user.type(field("Count"), "-0");
		expect(reported(onValue).at(-1)).toBe(0);
		expect(Object.is(reported(onValue).at(-1), -0)).toBe(false);
		expect(field("Count")).toHaveValue("-0");
		await user.type(field("Count"), "7");
		expect(reported(onValue).at(-1)).toBe(-7);
		expect(field("Count")).toHaveValue("-7");
	});

	it.each([
		["en", "\u22125", -5],
		["de", "-1.234", -1234],
		["de", "-7,5", -7],
		["en", "5-", 5],
	])(
		"[ISSUE-3484-ITEM-3] reads %s text %j as %j",
		async (lng, text, expected) => {
			await setLanguage(lng);
			const onValue: ValueSpy = vi.fn();
			renderCount(null, onValue);
			fireEvent.change(field("Count"), { target: { value: text } });
			expect(reported(onValue)).toEqual([expected]);
		},
	);

	it("[ISSUE-3484-ITEM-14] never shows a large value in exponent form", () => {
		render(<IntegerInputField label="Count" value={1e21} noFormat />);
		expect(field("Count").value).not.toMatch(/e/i);
	});

	describe("numbers beyond Number.MAX_SAFE_INTEGER", () => {
		const MAX = Number.MAX_SAFE_INTEGER;
		const NO_GROUPING: Intl.NumberFormatOptions = { useGrouping: false };
		/** the message for a number out of range, in en */
		const outOfRange = (options?: Intl.NumberFormatOptions) =>
			`Enter a number from ${fmt("en", -MAX, options)} to ${fmt("en", MAX, options)}`;

		it("[ISSUE-3484-ITEM-14] shows every digit of a large value, grouped or not", () => {
			const { rerender } = render(
				<IntegerInputField label="Count" value={1e21} noFormat />,
			);
			expect(field("Count")).toHaveValue("1000000000000000000000");
			rerender(<IntegerInputField label="Count" value={-1e21} noFormat />);
			expect(field("Count")).toHaveValue("-1000000000000000000000");
			rerender(<IntegerInputField label="Count" value={1e21} />);
			expect(field("Count")).toHaveValue("1,000,000,000,000,000,000,000");
		});

		it("[ISSUE-3484-ITEM-14] flags a digit typed past Number.MAX_SAFE_INTEGER instead of changing the digits", async () => {
			const user = userEvent.setup();
			const onValue: ValueSpy = vi.fn();
			renderCount(null, onValue);
			await user.type(field("Count"), "1234567890123456");
			expect(reported(onValue).at(-1)).toBe(1234567890123456);
			expect(field("Count")).toHaveAttribute("aria-invalid", "false");
			await user.type(field("Count"), "7");
			// not reported: the parent keeps the last number that fits
			expect(reported(onValue)).toHaveLength(16);
			expect(field("Count")).toHaveValue("1,234,567,890,123,4567");
			expect(field("Count")).toHaveAttribute("aria-invalid", "true");
			expect(field("Count")).toHaveAccessibleDescription(outOfRange());
		});

		it("[ISSUE-3484-ITEM-14] flags a digit typed after a large value instead of reading its exponent", async () => {
			const user = userEvent.setup();
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={1e21} onValue={onValue}>
					{(value, onChange) => (
						<IntegerInputField
							label="Count"
							value={value}
							onChange={onChange}
							noFormat
						/>
					)}
				</Controlled>,
			);
			await user.type(field("Count"), "5");
			expect(reported(onValue)).toEqual([]);
			expect(field("Count")).toHaveValue("10000000000000000000005");
			expect(field("Count")).toHaveAccessibleDescription(
				outOfRange(NO_GROUPING),
			);
		});

		it("[ISSUE-3484-ITEM-14] keeps the flagged text on blur, in place of the helper text, until a valid edit", async () => {
			const user = userEvent.setup();
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={1234567890123456} onValue={onValue}>
					{(value, onChange) => (
						<IntegerInputField
							label="Count"
							value={value}
							onChange={onChange}
							helperText="Pieces"
						/>
					)}
				</Controlled>,
			);
			expect(field("Count")).toHaveAccessibleDescription("Pieces");
			await user.type(field("Count"), "7");
			tabThrough(field("Count"));
			expect(field("Count")).toHaveValue("1,234,567,890,123,4567");
			expect(field("Count")).toHaveAttribute("aria-invalid", "true");
			expect(field("Count")).toHaveAccessibleDescription(outOfRange());
			await user.type(field("Count"), "{Backspace}");
			expect(reported(onValue)).toEqual([1234567890123456]);
			expect(field("Count")).toHaveValue("1,234,567,890,123,456");
			expect(field("Count")).toHaveAttribute("aria-invalid", "false");
			expect(field("Count")).toHaveAccessibleDescription("Pieces");
		});

		it("[ISSUE-3484-ITEM-14] a new value replaces the flagged text", () => {
			const { rerender } = render(
				<IntegerInputField label="Count" value={3} onChange={noop} />,
			);
			fireEvent.change(field("Count"), {
				target: { value: "12345678901234567" },
			});
			fireEvent.blur(field("Count"));
			expect(field("Count")).toHaveAttribute("aria-invalid", "true");
			// e.g. the form is reset, or the record is reloaded
			rerender(<IntegerInputField label="Count" value={9} onChange={noop} />);
			expect(field("Count")).toHaveValue("9");
			expect(field("Count")).toHaveAttribute("aria-invalid", "false");
			// and does not come back with the value it was typed over
			rerender(<IntegerInputField label="Count" value={3} onChange={noop} />);
			expect(field("Count")).toHaveValue("3");
			expect(field("Count")).toHaveAttribute("aria-invalid", "false");
		});

		it.each([
			["9007199254740991", 9007199254740991],
			["-9007199254740991", -9007199254740991],
			["9,007,199,254,740,991.5", 9007199254740991],
			["00009007199254740991", 9007199254740991],
			["9007199254740992", undefined],
			["-9007199254740992", undefined],
			["12345678901234567.5", undefined],
			["9".repeat(25), undefined],
		])("[ISSUE-3484-ITEM-14] reads text %j as %j", (text, expected) => {
			const onValue: ValueSpy = vi.fn();
			renderCount(null, onValue);
			fireEvent.change(field("Count"), { target: { value: text } });
			expect(reported(onValue)).toEqual(
				expected === undefined ? [] : [expected],
			);
			expect(field("Count")).toHaveAttribute(
				"aria-invalid",
				String(expected === undefined),
			);
			if (expected === undefined) expect(field("Count")).toHaveValue(text);
		});

		it("[ISSUE-3484-ITEM-14] names the range in the field's format, in the CC language", async () => {
			await setLanguage("de");
			const { rerender } = render(
				<IntegerInputField label="Count" value={null} onChange={noop} />,
			);
			fireEvent.change(field("Count"), {
				target: { value: "12345678901234567" },
			});
			expect(field("Count")).toHaveAccessibleDescription(
				`Gib eine Zahl von ${fmt("de", -MAX)} bis ${fmt("de", MAX)} ein`,
			);
			rerender(
				<IntegerInputField
					label="Count"
					value={null}
					onChange={noop}
					noFormat
				/>,
			);
			expect(field("Count")).toHaveAccessibleDescription(
				`Gib eine Zahl von ${fmt("de", -MAX, NO_GROUPING)} bis ${fmt("de", MAX, NO_GROUPING)} ein`,
			);
		});
	});
});

describe("CurrencyInput", () => {
	describe("commit", () => {
		it("[ISSUE-3484-ITEM-10] reports an emptied field once", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={3} onValue={onValue}>
					{(value, onChange) => (
						<CurrencyInput
							label="Amount"
							currency="EUR"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			fireEvent.focus(field("Amount"));
			fireEvent.change(field("Amount"), { target: { value: "" } });
			fireEvent.blur(field("Amount"));
			expect(reported(onValue)).toEqual([null]);
		});

		it("[ISSUE-3484-ITEM-10] the touch Clear empties the field, and the blur reports null once", () => {
			env.touch = true;
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={3} onValue={onValue}>
					{(value, onChange) => (
						<CurrencyInput
							label="Amount"
							currency="EUR"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			fireEvent.focus(field("Amount"));
			fireEvent.click(screen.getByRole("button", { name: "Clear" }));
			expect(field("Amount")).toHaveValue("");
			expect(reported(onValue)).toEqual([]);
			fireEvent.blur(field("Amount"));
			expect(reported(onValue)).toEqual([null]);
			expect(field("Amount")).toHaveValue("");
		});
	});

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

		it("[ISSUE-3484-ITEM-3] keeps the sign of a negative amount", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={-5} onValue={onValue}>
					{(value, onChange) => (
						<CurrencyInput
							label="Amount"
							currency="EUR"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			expect(field("Amount")).toHaveValue("-€5.00");
			fireEvent.change(field("Amount"), { target: { value: "-€5.50" } });
			fireEvent.blur(field("Amount"));
			// -5.5, or the minus refused visibly: never the flipped amount
			expect(reported(onValue)).not.toContain(5.5);
		});

		it.each(["en", "de", "es", "fr", "it", "nl", "ru", "uz", "de-CH", "it-CH"])(
			"[ISSUE-3484-ITEM-3] reads back a negative amount as %s shows it",
			async (lng) => {
				await setLanguage(lng);
				const onValue: ValueSpy = vi.fn();
				render(
					<Controlled initial={-1} onValue={onValue}>
						{(value, onChange) => (
							<CurrencyInput
								label="Amount"
								currency="EUR"
								value={value}
								onChange={onChange}
							/>
						)}
					</Controlled>,
				);
				const shown = fmt(lng, -1234.56, EUR);
				fireEvent.change(field("Amount"), { target: { value: shown } });
				fireEvent.blur(field("Amount"));
				expect(reported(onValue)).toEqual([-1234.56]);
				expect(field("Amount")).toHaveValue(shown);
			},
		);

		it("[ISSUE-3484-ITEM-3] takes a typed minus, and saves an amount that rounds to zero as 0", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={null} onValue={onValue}>
					{(value, onChange) => (
						<CurrencyInput
							label="Amount"
							currency="EUR"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			fireEvent.change(field("Amount"), { target: { value: "-19.99" } });
			fireEvent.blur(field("Amount"));
			expect(reported(onValue)).toEqual([-19.99]);
			expect(field("Amount")).toHaveValue("-€19.99");
			fireEvent.change(field("Amount"), { target: { value: "-0.001" } });
			fireEvent.blur(field("Amount"));
			expect(Object.is(reported(onValue).at(-1), 0)).toBe(true);
			expect(field("Amount")).toHaveValue("€0.00");
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

		it("[ISSUE-3484-ITEM-4] re-formats on a language switch and keeps the value on the next blur", async () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={1234.5} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			expect(field("Hours")).toHaveValue("1,234.5");
			await setLanguage("de");
			expect(field("Hours")).toHaveValue(fmt("de", 1234.5));
			tabThrough(field("Hours"));
			expect(reported(onValue).filter((value) => value !== 1234.5)).toEqual([]);
		});

		it("[ISSUE-3484-ITEM-4] shows a new format at once", () => {
			const { rerender } = render(
				<DecimalInputField
					label="Hours"
					value={7.25}
					onChange={noop}
					format={{ maximumFractionDigits: 0 }}
				/>,
			);
			expect(field("Hours")).toHaveValue("7");
			rerender(
				<DecimalInputField
					label="Hours"
					value={7.25}
					onChange={noop}
					format={{ maximumFractionDigits: 2 }}
				/>,
			);
			expect(field("Hours")).toHaveValue("7.25");
		});

		it("[ISSUE-3484-ITEM-4] shows the value the parent keeps after a commit", () => {
			// an app that clamps the number in onChange (at most 10)
			const Clamped = function Clamped() {
				const [value, setValue] = useState<number | null>(10);
				return (
					<DecimalInputField
						label="Hours"
						value={value}
						onChange={(_evt, next) =>
							setValue(next == null ? null : Math.min(next, 10))
						}
					/>
				);
			};
			render(<Clamped />);
			fireEvent.change(field("Hours"), { target: { value: "15" } });
			fireEvent.blur(field("Hours"));
			expect(field("Hours")).toHaveValue("10");
		});

		it("[ISSUE-3484-ITEM-4] shows the value again after a commit of text that parses to it", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={1.2} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			fireEvent.change(field("Hours"), { target: { value: "1.20" } });
			fireEvent.blur(field("Hours"));
			expect(reported(onValue)).toEqual([1.2]);
			expect(field("Hours")).toHaveValue("1.2");
		});

		it("[ISSUE-3484-ITEM-4] keeps the typed text over a new format while it is edited, and commits it", () => {
			const onChange = vi.fn<NumberChange>();
			const { rerender } = render(
				<DecimalInputField
					label="Hours"
					value={7.25}
					onChange={onChange}
					format={{ maximumFractionDigits: 0 }}
				/>,
			);
			fireEvent.change(field("Hours"), { target: { value: "8.5" } });
			rerender(
				<DecimalInputField
					label="Hours"
					value={7.25}
					onChange={onChange}
					format={{ maximumFractionDigits: 2 }}
				/>,
			);
			expect(field("Hours")).toHaveValue("8.5");
			fireEvent.blur(field("Hours"));
			expect(onChange.mock.calls.map(([, value]) => value)).toEqual([8.5]);
		});

		it("[ISSUE-3484-ITEM-4] a new value replaces the typed text, and the blur then commits nothing", () => {
			const onChange = vi.fn<NumberChange>();
			const { rerender } = render(
				<DecimalInputField label="Hours" value={1} onChange={onChange} />,
			);
			fireEvent.change(field("Hours"), { target: { value: "45" } });
			// e.g. the form is reset, or the record is reloaded
			rerender(
				<DecimalInputField label="Hours" value={0.12345} onChange={onChange} />,
			);
			expect(field("Hours")).toHaveValue("0.123");
			fireEvent.blur(field("Hours"));
			expect(onChange).not.toHaveBeenCalled();
			// the next edit is committed again
			fireEvent.change(field("Hours"), { target: { value: "2" } });
			fireEvent.blur(field("Hours"));
			expect(onChange.mock.calls.map(([, value]) => value)).toEqual([2]);
		});

		it("[ISSUE-3484-ITEM-4] the touch Clear empties the field, and a blur commits null once", () => {
			env.touch = true;
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={5} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			fireEvent.focus(field("Hours"));
			fireEvent.click(screen.getByRole("button", { name: "Clear" }));
			expect(field("Hours")).toHaveValue("");
			fireEvent.blur(field("Hours"));
			expect(reported(onValue)).toEqual([null]);
			expect(field("Hours")).toHaveValue("");
		});

		it("[ISSUE-3484-ITEM-4] renders a NaN value again without looping", () => {
			const { rerender } = render(
				<DecimalInputField label="Hours" value={NaN} onChange={noop} />,
			);
			rerender(<DecimalInputField label="Hours" value={NaN} onChange={noop} />);
			expect(field("Hours")).toBeInTheDocument();
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

		it("[ISSUE-3484-ITEM-3] keeps the sign of a stored negative number on a blur", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={-5} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			expect(field("Hours")).toHaveValue("-5");
			tabThrough(field("Hours"));
			expect(reported(onValue).filter((value) => value !== -5)).toEqual([]);
		});

		it.each([
			["en", "-3.5", -3.5],
			["en", "-5", -5],
			["en", "-.5", -0.5],
			["en", "-", null],
			["en", "-0", 0],
			["de", "-1.234,5", -1234.5],
			["de", "-7.5", -7.5],
		])(
			"[ISSUE-3484-ITEM-3] commits %s text %j as %j",
			async (lng, text, expected) => {
				await setLanguage(lng);
				const onValue: ValueSpy = vi.fn();
				render(
					<Controlled initial={1} onValue={onValue}>
						{(value, onChange) => (
							<DecimalInputField
								label="Hours"
								value={value}
								onChange={onChange}
							/>
						)}
					</Controlled>,
				);
				fireEvent.change(field("Hours"), { target: { value: text } });
				fireEvent.blur(field("Hours"));
				expect(reported(onValue)).toHaveLength(1);
				expect(Object.is(reported(onValue)[0], expected)).toBe(true);
			},
		);
	});
	describe("text that does not parse", () => {
		it("[ISSUE-3484-ITEM-7] neither reports NaN nor shows it for a lone separator", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={null} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			fireEvent.change(field("Hours"), { target: { value: "." } });
			fireEvent.blur(field("Hours"));
			expect(reported(onValue).filter((value) => Number.isNaN(value))).toEqual(
				[],
			);
			expect(field("Hours")).not.toHaveValue("NaN");
		});

		it.each([
			["en", "."],
			["en", ","],
			["de", ","],
			["de", "."],
		])(
			"[ISSUE-3484-ITEM-7] flags a lone separator in %s (%j), and reports nothing",
			async (lng, text) => {
				await setLanguage(lng);
				const onValue: ValueSpy = vi.fn();
				render(
					<Controlled initial={3} onValue={onValue}>
						{(value, onChange) => (
							<DecimalInputField
								label="Hours"
								value={value}
								onChange={onChange}
							/>
						)}
					</Controlled>,
				);
				fireEvent.change(field("Hours"), { target: { value: text } });
				fireEvent.blur(field("Hours"));
				expect(reported(onValue)).toEqual([]);
				expect(field("Hours")).toHaveValue(text);
				expect(field("Hours")).toHaveAttribute("aria-invalid", "true");
			},
		);

		it("[ISSUE-3484-ITEM-7] says in text why the number is invalid", () => {
			render(<DecimalInputField label="Hours" value={3} onChange={noop} />);
			const input = field("Hours");
			fireEvent.change(input, { target: { value: "." } });
			fireEvent.blur(input);
			expect(input).toHaveAccessibleDescription(
				`Enter a number, such as ${fmt("en", 1234.56)}`,
			);
		});

		it("[ISSUE-3484-ITEM-7] names a number in the field's format, in the CC language", async () => {
			await setLanguage("de");
			render(
				<DecimalInputField
					label="Hours"
					value={3}
					onChange={noop}
					format={{ useGrouping: false }}
				/>,
			);
			fireEvent.change(field("Hours"), { target: { value: "," } });
			fireEvent.blur(field("Hours"));
			expect(field("Hours")).toHaveAccessibleDescription(
				"Gib eine Zahl ein, z. B. 1234,56",
			);
		});

		it("[ISSUE-3484-ITEM-7] keeps the value and shows the message in place of the helper text until a valid edit", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={3} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
							helperText="Working hours"
						/>
					)}
				</Controlled>,
			);
			const input = field("Hours");
			expect(input).toHaveAccessibleDescription("Working hours");
			fireEvent.change(input, { target: { value: "." } });
			fireEvent.blur(input);
			// a Tab through the field keeps the text and its error
			tabThrough(input);
			expect(reported(onValue)).toEqual([]);
			expect(input).toHaveValue(".");
			expect(input).toHaveAttribute("aria-invalid", "true");
			// still invalid while it is edited, until the next blur, also when the
			// edit commits the value the field already holds
			fireEvent.change(input, { target: { value: "3" } });
			expect(input).toHaveAttribute("aria-invalid", "true");
			fireEvent.blur(input);
			expect(reported(onValue)).toEqual([3]);
			expect(input).toHaveValue("3");
			expect(input).toHaveAttribute("aria-invalid", "false");
			expect(input).toHaveAccessibleDescription("Working hours");
		});

		it("[ISSUE-3484-ITEM-7] commits an emptied field as null after the error", () => {
			const onValue: ValueSpy = vi.fn();
			render(
				<Controlled initial={3} onValue={onValue}>
					{(value, onChange) => (
						<DecimalInputField
							label="Hours"
							value={value}
							onChange={onChange}
						/>
					)}
				</Controlled>,
			);
			fireEvent.change(field("Hours"), { target: { value: "." } });
			fireEvent.blur(field("Hours"));
			fireEvent.change(field("Hours"), { target: { value: "" } });
			fireEvent.blur(field("Hours"));
			expect(reported(onValue)).toEqual([null]);
			expect(field("Hours")).toHaveValue("");
			expect(field("Hours")).toHaveAttribute("aria-invalid", "false");
		});

		it("[ISSUE-3484-ITEM-7] drops the parse error when a new value arrives", () => {
			const { rerender } = render(
				<DecimalInputField label="Hours" value={3} onChange={noop} />,
			);
			fireEvent.change(field("Hours"), { target: { value: "." } });
			fireEvent.blur(field("Hours"));
			expect(field("Hours")).toHaveAttribute("aria-invalid", "true");
			// e.g. the form is reset, or the record is reloaded
			rerender(<DecimalInputField label="Hours" value={9} onChange={noop} />);
			expect(field("Hours")).toHaveValue("9");
			expect(field("Hours")).toHaveAttribute("aria-invalid", "false");
			expect(field("Hours")).toHaveAccessibleDescription("");
		});
	});
});

describe("all three number inputs", () => {
	it("[ISSUE-3484-ITEM-23] shows no Clear button on a touch device while the input is disabled through slotProps.htmlInput", () => {
		env.touch = true;
		// SCF's display-only cost total (DeviceTaskCostFields)
		render(
			<CurrencyInput
				label="Total"
				currency="EUR"
				value={120}
				slotProps={{ htmlInput: { disabled: true } }}
			/>,
		);
		expect(field("Total")).toBeDisabled();
		expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
	});
});
