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
