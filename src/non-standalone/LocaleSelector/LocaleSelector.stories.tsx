import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
	Button,
	createTheme,
	Stack,
	ThemeProvider,
	Typography,
} from "@mui/material";
import DialogContextProvider from "../../framework/DialogContextProvider";
import { useDialogContext } from "../../framework";
import LocaleSelectorDialog, {
	LocaleSelectorDialogProps,
} from "./LocaleSelectorDialog";
import { showLocaleSelectorDialog } from "./showLocaleSelectorDialog";
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
		// the search's status region; the dialog's other one, the busy overlay's, is
		// empty until a locale is picked
		const statuses = within(dialog)
			.getAllByRole("status")
			.filter((region) => region.textContent !== "");
		await expect(statuses).toHaveLength(1);
		const status = statuses[0];
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

export const Issue3499Item6FocusStaysInListWhenScrolled: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-6: the first row has keyboard focus, then the list scrolls (the wheel, a touch swipe, or the arrow and page keys, which scroll the list natively). The row is unrendered, and the list takes focus, so it does not fall out of the list to the dialog container.",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		const list = within(dialog).getByRole("list");
		const row = rowButton(dialog, 1);
		row.focus();
		await expect(row).toHaveFocus();
		list.scrollTop = 2000;
		// precondition: the focused row is no longer rendered
		await waitFor(() => expect(row.isConnected).toBe(false));
		await frames(2);
		await expect(list).toContainElement(
			document.activeElement as HTMLElement | null,
		);
	},
};

/**
 * Gives the first row keyboard focus and scrolls the list until that row is
 * unrendered
 * @returns The list and the first row's (now removed) control
 */
const scrollFocusedRowAway = async (dialog: HTMLElement) => {
	const list = within(dialog).getByRole("list");
	const row = rowButton(dialog, 1);
	row.focus();
	await expect(row).toHaveFocus();
	list.scrollTop = 2000;
	await waitFor(() => expect(row.isConnected).toBe(false));
	await waitFor(() => expect(list).toHaveFocus());
	return { list, row };
};

export const Issue3499Item6FocusReturnsToRowWhenScrolledBack: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-6: while the focused row is scrolled away, the list holds keyboard focus and shows the focus ring. Scrolled back, the row is rendered again and gets focus back.",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		const { list, row } = await scrollFocusedRowAway(dialog);
		await expect(list).toHaveAttribute("tabindex", "-1");
		const ring = getComputedStyle(list);
		await expect(`${ring.outlineStyle} ${ring.outlineWidth}`).toBe("solid 2px");
		const country = row.textContent ?? "";
		list.scrollTop = 0;
		await waitFor(() => expect(rowButton(dialog, 1)).toHaveFocus());
		// a new element for the same row
		await expect(rowButton(dialog, 1)).not.toBe(row);
		await expect(rowButton(dialog, 1)).toHaveTextContent(country);
	},
};

export const Issue3499Item6TabFromListGoesToRows: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-6: while the list holds focus for a row that is scrolled away, Shift+Tab goes back to the search box, and Tab goes on to the rows, not back to the close button.",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		let { list } = await scrollFocusedRowAway(dialog);
		await userEvent.tab({ shift: true });
		await expect(within(dialog).getByRole("textbox")).toHaveFocus();
		list.scrollTop = 0;
		await waitFor(() => rowButton(dialog, 1));
		({ list } = await scrollFocusedRowAway(dialog));
		await userEvent.tab();
		const focused = document.activeElement as HTMLElement | null;
		await expect(list).toContainElement(focused);
		await expect(focused).not.toBe(list);
		await expect(focused).toHaveAttribute("role", "button");
	},
};

export const Issue3499Item6FocusMovedOnStaysWhenScrolledBack: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-6: the list holds focus for a row that is scrolled away, then the user moves on to the search box. Scrolling the row back into view leaves focus in the search box.",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		const dialog = await openDialog(canvasElement);
		const { list } = await scrollFocusedRowAway(dialog);
		const input = within(dialog).getByRole("textbox");
		await userEvent.click(input);
		await expect(input).toHaveFocus();
		list.scrollTop = 0;
		await waitFor(() => expect(rowButton(dialog, 1)).toBeVisible());
		await frames(2);
		await expect(input).toHaveFocus();
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
		// the flags load with the first one shown
		await waitFor(() =>
			expect(
				dialog.querySelectorAll('[role="listitem"] img').length,
			).toBeGreaterThan(3),
		);
		const imgs = Array.from(
			dialog.querySelectorAll<HTMLImageElement>('[role="listitem"] img'),
		);
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

export const Issue3499Item17OnChange: Story = {
	args: { supportedLocales: SCF, onChange: fn(), onClose: fn() },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-17: picking a row calls `onChange` with the picked locale once it is applied, then `onClose`. The close button, Escape and the backdrop don't report a pick.",
			},
		},
	},
	render: (args) => <Opener {...args} />,
	play: async ({ args, canvasElement }) => {
		await reset();
		try {
			let dialog = await openDialog(canvasElement);
			await userEvent.keyboard("{Escape}");
			await waitFor(() => expect(page().queryByRole("dialog")).toBeNull());
			await expect(args.onClose).toHaveBeenCalledTimes(1);
			await expect(args.onChange).not.toHaveBeenCalled();
			dialog = await openDialog(canvasElement);
			await userEvent.type(within(dialog).getByRole("textbox"), "France");
			await waitFor(() =>
				expect(rowButton(dialog, 1)).toHaveTextContent(/France/),
			);
			await userEvent.click(rowButton(dialog, 1));
			await waitFor(() => expect(page().queryByRole("dialog")).toBeNull(), {
				timeout: 10000,
			});
			await expect(args.onChange).toHaveBeenCalledTimes(1);
			await expect(args.onChange).toHaveBeenCalledWith("fr-FR");
			await expect(args.onClose).toHaveBeenCalledTimes(2);
			await expect(ccI18n.language).toBe("fr-FR");
		} finally {
			await reset();
		}
	},
};

/** centers the buttons of a story */
const centered = { alignItems: "center" };

/**
 * A button that shows the dialog with showLocaleSelectorDialog and states the result
 */
const PromiseOpener = (props: LocaleSelectorDialogProps) => {
	const { supportedLocales } = props;
	const [pushDialog] = useDialogContext();
	const [result, setResult] = useState("");
	const open = useCallback(async () => {
		const locale = await showLocaleSelectorDialog(pushDialog, {
			supportedLocales,
		});
		setResult(locale === null ? "Dismissed" : `Picked ${locale}`);
	}, [pushDialog, supportedLocales]);
	return (
		<Stack spacing={2} sx={centered}>
			<Button variant="contained" onClick={open}>
				Open locale selector
			</Button>
			<Typography role={"status"}>{result}</Typography>
		</Stack>
	);
};

export const Issue3499Item17ShowLocaleSelectorDialog: Story = {
	args: { supportedLocales: SCF },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-17: `showLocaleSelectorDialog(pushDialog, props)` resolves to the picked locale once it is applied, or to `null` when the dialog is dismissed.",
			},
		},
	},
	render: (args) => <PromiseOpener {...args} />,
	play: async ({ canvasElement }) => {
		await reset();
		try {
			const status = within(canvasElement).getByRole("status");
			let dialog = await openDialog(canvasElement);
			await userEvent.click(
				within(dialog).getByRole("button", { name: "Close" }),
			);
			await waitFor(() => expect(status).toHaveTextContent(/^Dismissed$/));
			await expect(page().queryByRole("dialog")).toBeNull();
			dialog = await openDialog(canvasElement);
			await userEvent.type(within(dialog).getByRole("textbox"), "France");
			await waitFor(() =>
				expect(rowButton(dialog, 1)).toHaveTextContent(/France/),
			);
			await userEvent.click(rowButton(dialog, 1));
			await waitFor(() => expect(status).toHaveTextContent(/^Picked fr-FR$/), {
				timeout: 10000,
			});
			await expect(page().queryByRole("dialog")).toBeNull();
		} finally {
			await reset();
		}
	},
};

/** a theme that widens the dialog's visible box through its paper slot */
const widePaperTheme = createTheme({
	components: {
		CcLocaleSelectorDialog: {
			styleOverrides: { paper: { width: 600 } },
		},
	},
});

/** A button that pushes the dialog with the story's args, in the wide theme */
const WideOpener = (props: LocaleSelectorDialogProps) => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(<LocaleSelectorDialog {...props} />);
	}, [pushDialog, props]);
	return (
		<Button variant="outlined" onClick={open}>
			Open wide
		</Button>
	);
};

export const Issue3499Item17PaperSlot: Story = {
	args: { supportedLocales: SCF, classes: { paper: "app-paper" } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-17: the visible box is the `paper` slot. It is 400px wide from the `sm` breakpoint up; a theme changes that with `components.CcLocaleSelectorDialog.styleOverrides.paper` (600px here), and `classes.paper` lands on it.",
			},
		},
	},
	render: (args) => (
		<Stack spacing={2} sx={centered}>
			<Opener {...args} />
			<ThemeProvider theme={widePaperTheme}>
				<DialogContextProvider>
					<WideOpener {...args} />
				</DialogContextProvider>
			</ThemeProvider>
		</Stack>
	),
	play: async ({ canvasElement }) => {
		await reset();
		let dialog = await openDialog(canvasElement);
		await expect(dialog).toHaveClass("app-paper");
		await expect(dialog.getBoundingClientRect().width).toBe(400);
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(page().queryByRole("dialog")).toBeNull());
		await userEvent.click(
			within(canvasElement).getByRole("button", { name: "Open wide" }),
		);
		dialog = await page().findByRole("dialog");
		await waitForRows(dialog);
		await expect(dialog).toHaveClass("app-paper");
		await expect(dialog.getBoundingClientRect().width).toBe(600);
	},
};

export const Issue3499Item17PaperSlotOnPhone: Story = {
	args: { supportedLocales: SCF },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3499-ITEM-17: below the `sm` breakpoint the dialog stays full screen, also when the theme widens the `paper` slot (600px here).",
			},
		},
	},
	render: Issue3499Item17PaperSlot.render,
	play: async ({ canvasElement }) => {
		await reset();
		await userEvent.click(
			within(canvasElement).getByRole("button", { name: "Open wide" }),
		);
		const dialog = await page().findByRole("dialog");
		await waitForRows(dialog);
		const rect = dialog.getBoundingClientRect();
		await expect([rect.left, rect.width]).toEqual([
			0,
			document.documentElement.clientWidth,
		]);
	},
};
