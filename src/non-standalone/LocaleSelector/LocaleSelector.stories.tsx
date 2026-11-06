import React, { useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@mui/material";
import DialogContextProvider from "../../framework/DialogContextProvider";
import { useDialogContext } from "../../framework";
import LocaleSelectorDialog, {
	LocaleSelectorDialogProps,
} from "./LocaleSelectorDialog";
import { setFrameworkHistory } from "../../framework/History";
import { createMemoryHistory } from "history";
import ccI18n from "../../i18n";

setFrameworkHistory(createMemoryHistory());

const DialogDecorator = (Story: React.ComponentType) => (
	<DialogContextProvider>
		<Story />
	</DialogContextProvider>
);

const meta: Meta<LocaleSelectorDialogProps> = {
	title: "non-standalone/LocaleSelector",
	decorators: [DialogDecorator],
	parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<LocaleSelectorDialogProps>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** what the samedis.care frontend passes (module level: a stable reference) */
const SCF = ["fr", "ru", "de", "en", "nl"];

const page = () => within(document.body);
const frames = (count: number) =>
	new Promise<void>((resolve) => {
		const step = (left: number) =>
			left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
		step(count);
	});

/** A button that pushes the dialog with the story's args */
const Opener = (props: LocaleSelectorDialogProps) => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(<LocaleSelectorDialog {...props} />);
	}, [pushDialog, props]);
	return (
		<Button variant="contained" onClick={open}>
			Open locale selector
		</Button>
	);
};

const opener = (canvasElement: HTMLElement) =>
	within(canvasElement).getByRole("button", { name: "Open locale selector" });

/**
 * Stories share the i18n instance with each other, so every play function
 * starts in en-US
 */
const reset = async () => {
	await ccI18n.changeLanguage("en-US");
};

/** waits for the rows: they appear after the lazy content and its namespace */
const waitForRows = async (dialog: HTMLElement) => {
	await waitFor(
		() => {
			if (!dialog.querySelector('[role="listitem"]'))
				throw new Error("no rows rendered");
		},
		{ timeout: 10000 },
	);
	await frames(4);
};

const openDialog = async (canvasElement: HTMLElement) => {
	await userEvent.click(opener(canvasElement));
	const dialog = await page().findByRole("dialog");
	await waitForRows(dialog);
	return dialog;
};

/** the row control at the given 1-based position of the filtered list */
const rowButton = (dialog: HTMLElement, position: number) =>
	dialog.querySelector<HTMLElement>(
		`[role="listitem"][aria-posinset="${position}"] [role="button"]`,
	);

// ─── Default (all locales) ───────────────────────────────────────────────────

const LocaleSelectorAllDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(<LocaleSelectorDialog />);
	}, [pushDialog]);
	return (
		<Button variant="contained" onClick={open}>
			Open Locale Selector (all locales)
		</Button>
	);
};

export const AllLocales: StoryObj = {
	render: () => <LocaleSelectorAllDemo />,
};

// ─── Filtered locales ────────────────────────────────────────────────────────

const LocaleSelectorFilteredDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(<LocaleSelectorDialog supportedLocales={["en", "de", "fr"]} />);
	}, [pushDialog]);
	return (
		<Button variant="contained" onClick={open}>
			Open Locale Selector (en, de, fr)
		</Button>
	);
};

export const FilteredLocales: StoryObj = {
	render: () => <LocaleSelectorFilteredDemo />,
};

// ─── Bugs ────────────────────────────────────────────────────────────────────

export const Issue3499Item4CountryReadableOnPhone: Story = {
	args: { supportedLocales: SCF },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		// the open dialog has other axe findings; this story is about the layout
		a11y: { test: "todo" },
		docs: {
			description: {
				story:
					'ISSUE-3499-ITEM-4: at 320px the dialog is 256px wide. The flag, the gaps and the fixed 120px language column leave 12px for the country, so every country shows as one letter (United States → "U").',
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		const country = rowButton(dialog, 1).querySelector<HTMLElement>(
			"span[title]",
		);
		await expect(
			country.clientWidth,
			`"${country.textContent}" needs ${country.scrollWidth}px`,
		).toBeGreaterThanOrEqual(80);
	},
};

export const Issue3499Item4LongNamesWrapWithTextSpacing: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		// the open dialog has other axe findings; this story is about the layout
		a11y: { test: "todo" },
		docs: {
			description: {
				story:
					'ISSUE-3499-ITEM-4: in the 400px dialog, with the UI in German and WCAG text spacing applied, long names such as "Sonderverwaltungsregion Hongkong" and "Niederländisch" wrap within their row instead of being cut, so the full text is visible without a tooltip.',
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await ccI18n.changeLanguage("de-DE");
		// WCAG 1.4.12 text spacing
		const style = document.createElement("style");
		style.textContent =
			"* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }";
		document.head.append(style);
		try {
			const dialog = await openDialog(canvasElement);
			const input = dialog.querySelector("input");
			for (const [query, name] of [
				["hongkong", "Sonderverwaltungsregion Hongkong"],
				["niederl", "Niederländisch"],
			]) {
				await userEvent.clear(input);
				await userEvent.type(input, query);
				await waitFor(() =>
					expect(
						rowButton(dialog, 1).querySelector(`span[title="${name}"]`),
					).not.toBeNull(),
				);
				await frames(4);
				const cut: string[] = [];
				for (const row of dialog.querySelectorAll<HTMLElement>(
					'[role="listitem"] [role="button"]',
				)) {
					const box = row.getBoundingClientRect();
					for (const span of row.querySelectorAll<HTMLElement>("span[title]")) {
						const rect = span.getBoundingClientRect();
						if (
							span.scrollWidth > span.clientWidth ||
							rect.top < box.top - 0.5 ||
							rect.bottom > box.bottom + 0.5
						)
							cut.push(span.textContent ?? "");
					}
				}
				await expect(cut).toEqual([]);
			}
		} finally {
			style.remove();
			await reset();
		}
	},
};
