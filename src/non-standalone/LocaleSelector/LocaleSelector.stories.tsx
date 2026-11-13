import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, createTheme } from "@mui/material";
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
const rowButton = (dialog: HTMLElement, position: number) => {
	const button = dialog.querySelector<HTMLElement>(
		`[role="listitem"][aria-posinset="${position}"] [role="button"]`,
	);
	if (!button) throw new Error(`no row at position ${position}`);
	return button;
};

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

export const Issue3499Item3SearchBoxIsNamed: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3499-ITEM-3: the search box is named "Search" and shows it as its placeholder next to the magnifier (axe `label`). A status region, visually hidden, states the number of rows the search leaves or that none match, so screen readers announce the result.',
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		const input = within(dialog).getByRole("textbox");
		await expect(input).toHaveAccessibleName("Search");
		await expect(input).toHaveAttribute("placeholder", "Search");
		const status = within(dialog).getByRole("status");
		await expect(status).toHaveTextContent(/^Results: 220$/);
		await userEvent.type(input, "xyz");
		await expect(status).toHaveTextContent(
			/^No locales match your search query$/,
		);
	},
};

export const Issue3499Item4CountryReadableOnPhone: Story = {
	args: { supportedLocales: SCF },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
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
		if (!country) throw new Error("the first row shows no country");
		await expect(
			country.clientWidth,
			`"${country.textContent}" needs ${country.scrollWidth}px`,
		).toBeGreaterThanOrEqual(80);
	},
};

export const Issue3499Item4LongNamesWrapWithTextSpacing: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
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
			if (!input) throw new Error("the dialog has no search input");
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

export const Issue3499Item5RowFocusIsVisible: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		// the open dialog has other axe findings; this story is about the focus ring
		a11y: { test: "todo" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-5: Tab to the first row. The only focus cue is a 12% grey background (1.32:1 against the dialog), no outline, and nothing at all in forced-colors mode. Expected: a focus ring of at least 2px.",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		await userEvent.tab(); // close button
		await userEvent.tab(); // search box
		await userEvent.tab(); // first row
		const row = rowButton(dialog, 1);
		await expect(row).toHaveFocus();
		await waitFor(() => expect(row).toHaveClass("Mui-focusVisible"));
		const cs = getComputedStyle(row);
		const ring =
			(cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) ||
			cs.boxShadow !== "none";
		await expect(
			ring,
			`outline ${cs.outlineStyle} ${cs.outlineWidth}, box-shadow ${cs.boxShadow}`,
		).toBe(true);
	},
};

/** `[r, g, b, alpha]` of a computed `rgb()` or `rgba()` color */
const rgba = (color: string) => {
	const [r, g, b, alpha = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
	return [r, g, b, alpha];
};

/** WCAG contrast ratio of two opaque colors, given as `[r, g, b]` */
const contrast = (a: number[], b: number[]) => {
	const luminance = (color: number[]) => {
		const [r, g, bl] = color.slice(0, 3).map((value) => {
			const c = value / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
	};
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
};

export const Issue3499Item5RowFocusRingContrast: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		// the open dialog has other axe findings; this story is about the focus ring
		a11y: { test: "todo" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-5: the keyboard-focused row's ring is an outline, which forced-colors mode keeps (it drops background tints and box shadows), drawn inside the row so the scrolling list cannot clip it, and at least 3:1 against the row's focus background.",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		await userEvent.tab(); // close button
		await userEvent.tab(); // search box
		await userEvent.tab(); // first row
		const row = rowButton(dialog, 1);
		await waitFor(() => expect(row).toHaveClass("Mui-focusVisible"));
		// the focus background fades in
		await Promise.all(row.getAnimations().map((anim) => anim.finished));
		const style = getComputedStyle(row);
		await expect(style.outlineStyle).toBe("solid");
		const width = parseFloat(style.outlineWidth);
		await expect(width).toBeGreaterThanOrEqual(2);
		await expect(parseFloat(style.outlineOffset)).toBeLessThanOrEqual(-width);
		const paper = rgba(getComputedStyle(dialog).backgroundColor);
		const tint = rgba(style.backgroundColor);
		const behind = paper.map(
			(value, i) => tint[3] * tint[i] + (1 - tint[3]) * value,
		);
		await expect(
			contrast(rgba(style.outlineColor), behind),
			`${style.outlineColor} on ${style.backgroundColor} over ${getComputedStyle(dialog).backgroundColor}`,
		).toBeGreaterThanOrEqual(3);
	},
};

export const Issue3466Item8FlagsOutlined: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3466-ITEM-8: each row shows its flag as a `CountryFlag` 30px high in a 60x30 box, outlined in the theme's divider color like every flag of the library (not a fixed light grey border).",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		const imgs = Array.from(
			dialog.querySelectorAll<HTMLImageElement>('[role="listitem"] img'),
		);
		await expect(imgs.length).toBeGreaterThan(3);
		await waitFor(
			() =>
				expect(
					imgs.filter((img) => !img.complete || img.naturalWidth === 0),
				).toEqual([]),
			{ timeout: 10000 },
		);
		const divider = createTheme().palette.divider;
		const misfit = imgs
			.map((img) => {
				const style = getComputedStyle(img);
				const box = img.parentElement!.getBoundingClientRect();
				const rect = img.getBoundingClientRect();
				const ratio = img.naturalWidth / img.naturalHeight;
				const height = ratio > 2 ? 60 / ratio : 30;
				return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}` !==
					`solid 1px ${divider}` ||
					style.borderStyle !== "none" ||
					box.width !== 60 ||
					box.height !== 30 ||
					Math.abs(rect.height - height) > 0.5
					? `${img.getAttribute("src")?.slice(0, 40)}: ${style.outline} / ${style.border}, ${rect.width}x${rect.height} in ${box.width}x${box.height}`
					: null;
			})
			.filter((entry) => entry !== null);
		await expect(misfit).toEqual([]);
	},
};

/**
 * A button that renders the dialog from state, without pushDialog, as an app does
 * with an MUI Dialog
 */
const StateOpener = (props: LocaleSelectorDialogProps) => {
	const { onClose, ...dialogProps } = props;
	const [open, setOpen] = useState(false);
	const show = useCallback(() => setOpen(true), []);
	const close = useCallback(() => {
		onClose?.();
		setOpen(false);
	}, [onClose]);
	return (
		<>
			<Button variant="contained" onClick={show}>
				Open locale selector
			</Button>
			{open && <LocaleSelectorDialog {...dialogProps} onClose={close} />}
		</>
	);
};

export const Issue3499Item17RenderedFromState: Story = {
	args: { supportedLocales: SCF, onClose: fn() },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-17: rendered from state, without pushDialog, the close button and Escape call `onClose`, which closes the dialog by no longer rendering it, and focus returns to the button that opened it.",
			},
		},
	},
	render: (args) => <StateOpener {...args} />,
	play: async ({ args, canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Close" }),
		);
		await waitFor(() => expect(page().queryByRole("dialog")).toBeNull());
		await expect(args.onClose).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(opener(canvasElement)).toHaveFocus());
		await openDialog(canvasElement);
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(page().queryByRole("dialog")).toBeNull());
		await expect(args.onClose).toHaveBeenCalledTimes(2);
		await waitFor(() => expect(opener(canvasElement)).toHaveFocus());
	},
};
