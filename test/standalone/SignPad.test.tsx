import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SignPad from "../../src/standalone/SignPad";
import ccI18n, { langs } from "../../src/i18n";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

// SignPad suspends until the components-care "translation" namespace is loaded
beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
	expect(ccI18n.hasLoadedNamespace("translation")).toBe(true);
});

const SIG =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const prompt = () => ccI18n.t("standalone.signature-pad.sign-here");

const rootOf = (container: HTMLElement) => {
	const root = container.firstElementChild;
	if (!(root instanceof HTMLElement)) throw new Error("tile root missing");
	return root;
};

describe("SignPad tile", () => {
	it("[ISSUE-3467-ITEM-5] the unsigned prompt asks to sign instead of saying the field is signed", async () => {
		// the past participle ("signed") in each locale that uses it today
		const signedWords: Record<string, RegExp> = {
			en: /\bsigned\b/i,
			es: /firmado/i,
			fr: /signé/i,
			it: /firmato/i,
			nl: /ondertekend/i,
			uz: /imzolangan/i,
		};
		await ccI18n.loadLanguages(langs);
		const wrong: string[] = [];
		for (const [lng, signed] of Object.entries(signedWords)) {
			const text = String(
				ccI18n.getResource(
					lng,
					"translation",
					"standalone.signature-pad.sign-here",
				),
			);
			if (signed.test(text)) wrong.push(`${lng}: ${text}`);
		}
		expect(wrong, "prompts that read as already signed").toEqual([]);
	});
	it("[ISSUE-3467-ITEM-5] an unsigned tile asks to sign", () => {
		render(<SignPad signature={null} />);
		expect(screen.getByText("Sign here digitally")).toBeInTheDocument();
	});
	it("[ISSUE-3467-ITEM-5] every locale has its own prompt", async () => {
		await ccI18n.loadLanguages(langs);
		const missing = langs.filter(
			(lng) =>
				!ccI18n.getResource(
					lng.split("-")[0],
					"translation",
					"standalone.signature-pad.sign-here",
				),
		);
		expect(missing, "locales without the prompt").toEqual([]);
	});
	it("[ISSUE-3467-ITEM-14] the tile is a keyboard-operable button named by its prompt", async () => {
		const user = userEvent.setup();
		const open = vi.fn();
		render(
			<>
				<button>before</button>
				<SignPad signature={null} openSignPad={open} openInfo={() => {}} />
			</>,
		);
		screen.getByRole("button", { name: "before" }).focus();
		await user.tab();
		const tile = document.activeElement as HTMLElement;
		expect(tile, "Tab from 'before' skips the tile").not.toBe(
			screen.getByRole("button", { name: "More information" }),
		);
		expect(tile).toBe(screen.getByRole("button", { name: /sign/i }));
		await user.keyboard("{Enter}");
		await user.keyboard(" ");
		expect(open).toHaveBeenCalledTimes(2);
		await user.tab();
		expect(
			screen.getByRole("button", { name: "More information" }),
		).toHaveFocus();
	});
	it("[ISSUE-3467-ITEM-14] the button's name is the prompt while unsigned and the signature once signed, with the signer when known", () => {
		const { rerender } = render(<SignPad signature={null} />);
		const button = screen.getByRole("button");
		expect(button).toHaveAccessibleName(prompt());

		rerender(<SignPad signature={null} signerName="  Alice Müller " />);
		expect(button).toHaveAccessibleName(`${prompt()} (Alice Müller)`);

		rerender(<SignPad signature={SIG} signerName="Alice Müller" />);
		expect(button).toHaveAccessibleName("Signature (Alice Müller)");

		rerender(<SignPad signature={SIG} signerName="   " />);
		expect(button).toHaveAccessibleName("Signature");
	});
	it("[ISSUE-3467-ITEM-14] the info button is a sibling of the tile's button, not inside it", () => {
		render(<SignPad signature={SIG} openInfo={() => {}} />);
		const info = screen.getByRole("button", { name: "More information" });
		const tile = screen.getByRole("button", { name: "Signature" });
		expect(tile.contains(info)).toBe(false);
		expect(info.contains(tile)).toBe(false);
	});
	it("[ISSUE-3467-ITEM-14] a click on the button, its prompt, its preview or the tile calls openSignPad once each", () => {
		const open = vi.fn();
		const { container, rerender } = render(
			<SignPad signature={null} openSignPad={open} />,
		);
		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByText(prompt()));
		fireEvent.click(rootOf(container));
		expect(open).toHaveBeenCalledTimes(3);

		rerender(<SignPad signature={SIG} openSignPad={open} />);
		fireEvent.click(container.querySelector("img")!);
		expect(open).toHaveBeenCalledTimes(4);
	});
	it("[ISSUE-3467-ITEM-14] the tile's button does not submit a surrounding form", async () => {
		const user = userEvent.setup();
		const submit = vi.fn((evt: React.FormEvent) => evt.preventDefault());
		render(
			<form onSubmit={submit}>
				<SignPad signature={null} />
			</form>,
		);
		await user.click(screen.getByRole("button"));
		screen.getByRole("button").focus();
		await user.keyboard("{Enter}");
		expect(submit).not.toHaveBeenCalled();
	});
	it("[ISSUE-3467-ITEM-15] a signed tile tells assistive technology that, and whose, it is", () => {
		render(<SignPad signature={SIG} signerName="Alice Müller" />);
		// today the preview has alt="" (role presentation) and the tile no text;
		// the preview's alt or the name of the activator (ISSUE-3467-ITEM-14) may carry it
		const saysSigned = (name: string) =>
			/signature|signed/i.test(name) && name.includes("Alice Müller");
		const named = [
			...screen.queryAllByRole("img", { name: saysSigned }),
			...screen.queryAllByRole("button", { name: saysSigned }),
		];
		expect(
			named,
			"no image or button named as Alice Müller's signature",
		).not.toHaveLength(0);
	});
	it("[ISSUE-3467-ITEM-15] a disabled tile exposes its disabled state", () => {
		const { container } = render(<SignPad signature={null} disabled />);
		expect(
			container.querySelector('[aria-disabled="true"], :disabled'),
			"no element of the disabled tile is aria-disabled",
		).not.toBeNull();
	});
	it("[ISSUE-3467-ITEM-15] the tile's button is aria-disabled exactly while the tile is disabled, signed or not, and stays focusable", () => {
		const { rerender } = render(<SignPad signature={null} />);
		const button = screen.getByRole("button");
		expect(button).not.toHaveAttribute("aria-disabled");

		rerender(<SignPad signature={null} disabled />);
		expect(button).toHaveAttribute("aria-disabled", "true");
		// no native disabled: a focused tile that gets disabled keeps the focus
		expect(button).toBeEnabled();

		rerender(<SignPad signature={SIG} signerName="Bob Smith" disabled />);
		expect(button).toHaveAttribute("aria-disabled", "true");
		expect(button).toHaveAccessibleName("Signature (Bob Smith)");

		rerender(<SignPad signature={SIG} signerName="Bob Smith" />);
		expect(button).not.toHaveAttribute("aria-disabled");
	});
	it("[ISSUE-3467-ITEM-15] a tile disabled by the theme's default props is aria-disabled, as its grey icon shows", () => {
		const theme = createTheme({
			components: { CcSignPad: { defaultProps: { disabled: true } } },
		});
		const { container } = render(
			<ThemeProvider theme={theme}>
				<SignPad signature={null} />
			</ThemeProvider>,
		);
		expect(container.querySelector("svg")).toHaveClass(
			"MuiSvgIcon-colorDisabled",
		);
		expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
	});
});
