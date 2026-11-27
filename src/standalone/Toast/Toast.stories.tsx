import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Box,
	Button,
	createTheme,
	Dialog,
	DialogActions,
	DialogTitle,
	ThemeProvider,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor, within } from "storybook/test";
import { Toast, ToastProps } from "./Toast";

// The toast renders in a portal, so query from the document body
const body = within(document.body);

const MOBILE = { viewport: { value: "mobile1", isRotated: false } };

const meta: Meta<typeof Toast> = {
	title: "Standalone/Toast",
	component: Toast,
	parameters: {
		a11y: { test: "error" },
	},
	args: {
		open: true,
		severity: "info",
		title: undefined,
		message: "3 devices were added to the project.",
		// stays open, so the docs page keeps showing it
		autoHideDuration: null,
		variant: "filled",
		onClose: fn(),
		onExited: fn(),
	},
	argTypes: {
		severity: {
			control: "select",
			options: ["success", "info", "warning", "error"],
		},
		variant: {
			control: "select",
			options: ["filled", "outlined", "standard"],
		},
		title: { control: "text" },
		message: { control: "text" },
		autoHideDuration: { control: "number" },
		// left unset, so the stories show the default position
		anchorOrigin: { control: "object" },
	},
};
export default meta;

type Story = StoryObj<typeof Toast>;

const elementOf = (el: Element | null | undefined): HTMLElement => {
	// TypeError: the Error story below shadows the global Error in this module
	if (!(el instanceof HTMLElement)) throw new TypeError("element missing");
	return el;
};

/** waits until the toast's enter animation (scale and fade in) has finished */
const entered = (alert: HTMLElement) =>
	waitFor(() =>
		expect({
			transform: alert.style.transform,
			transitions: alert
				.getAnimations()
				.filter((a) => a instanceof CSSTransition).length,
		}).toEqual({ transform: "none", transitions: 0 }),
	);

type Rgba = { r: number; g: number; b: number; a: number };
const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const parseRgba = (color: string): Rgba => {
	const p = (color.match(/[\d.]+/g) ?? []).map(Number);
	return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
};
/** fg composited over an opaque bg */
const over = (fg: Rgba, bg: Rgba): Rgba => ({
	r: fg.r * fg.a + bg.r * (1 - fg.a),
	g: fg.g * fg.a + bg.g * (1 - fg.a),
	b: fg.b * fg.a + bg.b * (1 - fg.a),
	a: 1,
});
const luminance = ({ r, g, b }: Rgba) =>
	[r, g, b]
		.map((v) => {
			const c = v / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		})
		.reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a: Rgba, b: Rgba) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

export const Info: Story = {
	play: async ({ args, userEvent }) => {
		const toast = await body.findByRole("status");
		// the text is written into the toast a frame after the toast is shown
		await waitFor(() =>
			expect(toast).toHaveTextContent("3 devices were added to the project."),
		);
		// bottom right unless the theme says otherwise
		await expect(toast.parentElement).toHaveClass(
			"MuiSnackbar-anchorOriginBottomRight",
		);
		await userEvent.click(within(toast).getByRole("button", { name: "Close" }));
		await expect(args.onClose).toHaveBeenCalledTimes(1);
	},
};

export const Success: Story = {
	args: {
		severity: "success",
		message: "Saved.",
	},
};

export const Warning: Story = {
	args: {
		severity: "warning",
		title: "Device left open",
		message: "Device 1042 is still open and can be finished later.",
	},
	play: async () => {
		await waitFor(() =>
			expect(body.getByRole("alert")).toHaveTextContent("Device left open"),
		);
	},
};

export const Error: Story = {
	args: {
		severity: "error",
		message: "This label belongs to another project.",
	},
	play: async () => {
		await waitFor(() =>
			expect(body.getByRole("alert")).toHaveTextContent(
				"This label belongs to another project.",
			),
		);
	},
};

export const ClosesAfterTimeout: Story = {
	args: {
		autoHideDuration: 50,
	},
	play: async ({ args }) => {
		await body.findByRole("status");
		await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
	},
};

export const Issue3470Item14EscapeClosesFromAnywhere: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Escape closes the toast wherever focus is, as MUI's Snackbar does: a keyboard user can uncover a control the toast covers without moving focus. On the toast itself it closes it once per press.",
			},
		},
	},
	render: (args) => (
		<>
			<Button variant={"contained"}>Save form</Button>
			<Toast {...args} />
		</>
	),
	play: async ({ args, canvas, userEvent }) => {
		const toast = await body.findByRole("status");
		const save = canvas.getByRole("button", { name: "Save form" });
		save.focus();
		await userEvent.keyboard("{Escape}");
		await expect(args.onClose).toHaveBeenCalledTimes(1);
		await expect(save).toHaveFocus();

		// the story keeps the toast open, so a second Escape closes it again
		within(toast).getByRole("button", { name: "Close" }).focus();
		await userEvent.keyboard("{Escape}");
		await expect(args.onClose).toHaveBeenCalledTimes(2);
	},
};

/** A dialog opened over the toast */
const ToastUnderDialog = (props: Pick<ToastProps, "onClose">) => {
	const { onClose } = props;
	const [dialogOpen, setDialogOpen] = useState(true);
	const closeDialog = useCallback(() => setDialogOpen(false), []);
	return (
		<>
			<Toast
				open
				severity={"success"}
				message={"Saved."}
				autoHideDuration={null}
				onClose={onClose}
			/>
			<Dialog open={dialogOpen} onClose={closeDialog}>
				<DialogTitle>Discard changes?</DialogTitle>
				<DialogActions>
					<Button onClick={closeDialog}>Keep editing</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export const Issue3470Item14EscapeInDialogClosesOnlyTheDialog: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Escape in an open dialog closes the dialog, not the toast: the dialog uses that Escape, so the toast stays.",
			},
		},
	},
	render: (args) => <ToastUnderDialog onClose={args.onClose} />,
	play: async ({ args, userEvent }) => {
		await body.findByRole("status");
		// the dialog's focus trap has moved focus into the dialog (onto its
		// container, around the element with the dialog role)
		const modal = elementOf(
			(await body.findByRole("dialog")).closest(".MuiDialog-root"),
		);
		await waitFor(() =>
			expect(modal).toContainElement(elementOf(document.activeElement)),
		);
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
		await expect(args.onClose).not.toHaveBeenCalled();
	},
};

export const StaysOnClickElsewhere: Story = {
	play: async ({ args, userEvent }) => {
		await body.findByRole("status");
		await userEvent.click(document.body);
		await expect(args.onClose).not.toHaveBeenCalled();
	},
};

// ─── Bugs ─────────────────────────────────────────────────────────────────────

const UNDER_TOAST_SX = { position: "fixed", right: 40, bottom: 32 } as const;

/** Rendered without onExited, as a plain controlled component */
const WithoutOnExited = (props: Pick<ToastProps, "onClose">) => {
	const { onClose } = props;
	const [open, setOpen] = useState(true);
	const close = useCallback(() => {
		setOpen(false);
		onClose();
	}, [onClose]);
	return (
		<>
			<Box sx={UNDER_TOAST_SX}>
				<Button variant={"outlined"}>Next page</Button>
			</Box>
			<Toast
				open={open}
				severity={"success"}
				message={"Saved."}
				autoHideDuration={null}
				onClose={close}
			/>
		</>
	);
};

export const Issue3470Item2ClosedToastLetsClicksThrough: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'Rendered without `onExited`, a closed toast leaves the page after its close animation, so clicks reach what lies under it, here "Next page".',
			},
		},
	},
	render: (args) => <WithoutOnExited onClose={args.onClose} />,
	play: async ({ args, canvas, userEvent }) => {
		const next = canvas.getByRole("button", { name: "Next page" });
		const r = next.getBoundingClientRect();
		const hit = () => {
			const el = document.elementFromPoint(
				r.left + r.width / 2,
				r.top + r.height / 2,
			);
			return el?.closest("button")?.textContent ?? el?.className ?? "nothing";
		};
		const toast = await body.findByRole("status");
		await entered(toast);
		// while it is shown, the toast lies over the button
		await expect(hit()).not.toBe("Next page");
		await userEvent.click(within(toast).getByRole("button", { name: "Close" }));
		await expect(args.onClose).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(body.queryByRole("status")).toBeNull());
		await waitFor(() =>
			expect(hit(), "what a click there hits").toBe("Next page"),
		);
	},
};

const CORNERS = [
	["success", { vertical: "top", horizontal: "left" }],
	["info", { vertical: "top", horizontal: "right" }],
	["warning", { vertical: "bottom", horizontal: "left" }],
	["error", { vertical: "bottom", horizontal: "right" }],
] as const;

/** One toast per severity, one in each corner */
const AllSeverities = (props: Pick<ToastProps, "onClose" | "variant">) => (
	<>
		{CORNERS.map(([severity, anchorOrigin]) => (
			<Toast
				key={severity}
				open
				severity={severity}
				variant={props.variant}
				anchorOrigin={anchorOrigin}
				title={`Title ${severity}`}
				message={`Message ${severity}`}
				autoHideDuration={null}
				onClose={props.onClose}
			/>
		))}
	</>
);

const allToasts = () =>
	Array.from(document.querySelectorAll<HTMLElement>(".MuiAlert-root"));

export const Issue3470Item10FilledTextContrast: Story = {
	parameters: {
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["color-contrast"] } },
		},
		docs: {
			description: {
				story:
					"In the default `filled` variant the text of every severity has the 4.5:1 that 14px text needs (axe `color-contrast`). MUI picks its white text against 3:1, so with the default palette the toast darkens the info fill (#0288d1, 3.86:1) and the warning fill (#ed6c02, 3.11:1) just enough; success and error keep MUI's fill.",
			},
		},
	},
	render: (args) => <AllSeverities onClose={args.onClose} />,
	play: async () => {
		await waitFor(() => expect(allToasts()).toHaveLength(4));
		for (const toast of allToasts()) await entered(toast);
	},
};

/** The alert's background as an opaque color */
const alertBackground = (alert: Element) =>
	over(parseRgba(getComputedStyle(alert).backgroundColor), WHITE);

/**
 * Measures the text contrast of every toast itself: axe skips an element with
 * a background image, which MUI's Paper sets in a dark palette
 */
const expectReadableText = async () => {
	await waitFor(() => expect(allToasts()).toHaveLength(4));
	const ratios: Record<string, string> = {};
	for (const toast of allToasts()) {
		await entered(toast);
		const bg = alertBackground(toast);
		const ratio = contrast(
			over(parseRgba(getComputedStyle(toast).color), bg),
			bg,
		);
		ratios[toast.textContent ?? ""] =
			ratio >= 4.5 ? "ok" : `${ratio.toFixed(2)}:1`;
	}
	await expect(ratios, "text contrast of each toast").toEqual({
		"Title successMessage success": "ok",
		"Title infoMessage info": "ok",
		"Title warningMessage warning": "ok",
		"Title errorMessage error": "ok",
	});
};

const darkTheme = createTheme({ palette: { mode: "dark" } });

export const Issue3470Item10FilledTextContrastDark: Story = {
	...Issue3470Item10FilledTextContrast,
	parameters: {
		...Issue3470Item10FilledTextContrast.parameters,
		docs: {
			description: {
				story:
					"MUI's default dark palette: the filled toasts reach 4.5:1 with MUI's own fills (`palette[severity].dark`), so they keep them.",
			},
		},
	},
	play: expectReadableText,
	decorators: [
		(Story) => (
			<ThemeProvider theme={darkTheme}>
				<Story />
			</ThemeProvider>
		),
	],
};

/** samedis.care's palette: its own error, warning and success colors */
const customPaletteTheme = createTheme({
	palette: {
		error: { main: "rgb(230, 45, 75)" },
		warning: { main: "#FFCF00" },
		success: { main: "#4caf50" },
	},
});

export const Issue3470Item10FilledTextContrastCustomPalette: Story = {
	...Issue3470Item10FilledTextContrast,
	parameters: {
		...Issue3470Item10FilledTextContrast.parameters,
		docs: {
			description: {
				story:
					"An app's own palette is measured the same way: white on the error red `rgb(230, 45, 75)` has 4.34:1, so that fill is darkened a little, as is MUI's info blue; the yellow warning and the green success carry dark text at 4.5:1 or more and stay.",
			},
		},
	},
	play: expectReadableText,
	decorators: [
		(Story) => (
			<ThemeProvider theme={customPaletteTheme}>
				<Story />
			</ThemeProvider>
		),
	],
};

/** "ok" for an outline of 2px or more with 3:1 against the alert, else what is there */
const focusRingOf = (button: Element, alert: Element) => {
	const cs = getComputedStyle(button);
	if (cs.outlineStyle === "none" || parseFloat(cs.outlineWidth) < 2)
		return `outline ${cs.outlineStyle} ${cs.outlineWidth}`;
	const bg = alertBackground(alert);
	const ratio = contrast(over(parseRgba(cs.outlineColor), bg), bg);
	return ratio >= 3 ? "ok" : `outline at ${ratio.toFixed(2)}:1`;
};

export const Issue3470Item11CloseButtonShowsFocusRing: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"A keyboard-focused close button shows a 2px ring in the toast's text color, at least 3:1 against the toast in every severity, next to MUI's pulsating focus ripple. The ring is an outline, which forced-colors mode keeps; it drops the ripple.",
			},
		},
	},
	render: (args) => (
		<>
			<Button>Before</Button>
			<AllSeverities onClose={args.onClose} />
		</>
	),
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(allToasts()).toHaveLength(4));
		canvas.getByRole("button", { name: "Before" }).focus();
		const rings: Record<string, string> = {};
		for (const alert of allToasts()) {
			await userEvent.tab();
			const close = within(alert).getByRole("button", { name: "Close" });
			await expect(close).toHaveFocus();
			await waitFor(() => expect(close).toHaveClass("Mui-focusVisible"));
			rings[alert.textContent ?? ""] = focusRingOf(close, alert);
		}
		await expect(rings, "focus ring of each close button").toEqual({
			"Title successMessage success": "ok",
			"Title infoMessage info": "ok",
			"Title warningMessage warning": "ok",
			"Title errorMessage error": "ok",
		});
	},
};

export const Issue3470Item11CloseButtonShowsFocusRingStandard: Story = {
	...Issue3470Item11CloseButtonShowsFocusRing,
	args: { variant: "standard" },
	parameters: {
		docs: {
			description: {
				story:
					"The `standard` variant: the ring takes the toast's text color here too.",
			},
		},
	},
	render: (args) => (
		<>
			<Button>Before</Button>
			<AllSeverities onClose={args.onClose} variant={args.variant} />
		</>
	),
};

export const Issue3470Item11CloseButtonShowsFocusRingOutlined: Story = {
	...Issue3470Item11CloseButtonShowsFocusRingStandard,
	args: { variant: "outlined" },
	parameters: {
		docs: {
			description: {
				story:
					"The `outlined` variant: the ring takes the toast's text color here too.",
			},
		},
	},
};

/** MUI's opt-in focus ring */
const focusVisibleTheme = createTheme({ focusVisible: true });

export const Issue3470Item11CloseButtonKeepsThemeFocusRing: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"With the theme's `focusVisible` option MUI draws its own ring, a 2px `primary.main` outline on a 4px `background.default` halo inside filled toasts, and the toast adds none of its own.",
			},
		},
	},
	render: Issue3470Item11CloseButtonShowsFocusRing.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(allToasts()).toHaveLength(4));
		canvas.getByRole("button", { name: "Before" }).focus();
		const rings: Record<string, string> = {};
		for (const alert of allToasts()) {
			await userEvent.tab();
			const close = within(alert).getByRole("button", { name: "Close" });
			await expect(close).toHaveFocus();
			await waitFor(() => expect(close).toHaveClass("Mui-focusVisible"));
			const cs = getComputedStyle(close);
			rings[alert.textContent ?? ""] =
				`${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor} on ${cs.boxShadow}`;
		}
		const muiRing =
			"2px solid rgb(25, 118, 210) on rgb(255, 255, 255) 0px 0px 0px 4px";
		await expect(rings, "focus ring of each close button").toEqual({
			"Title successMessage success": muiRing,
			"Title infoMessage info": muiRing,
			"Title warningMessage warning": muiRing,
			"Title errorMessage error": muiRing,
		});
	},
	decorators: [
		(Story) => (
			<ThemeProvider theme={focusVisibleTheme}>
				<Story />
			</ThemeProvider>
		),
	],
};

const LONG_WORD = "Gerätestammdatenverwaltungseinstellungsübersicht";
const LONG_URL =
	"https://example.com/download/staff_import.de.xlsx?token=" +
	"0123456789abcdef".repeat(8);

export const Issue3470Item12LongWordWrapsOnPhone: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"At 320px a word longer than a line of the toast (here a German compound) breaks where it has to: the toast stays within the screen, with its icon and the whole text in view.",
			},
		},
	},
	args: {
		severity: "error",
		message: `${LONG_WORD} could not be loaded.`,
	},
	play: async () => {
		const toast = await body.findByRole("alert");
		await entered(toast);
		const r = toast.getBoundingClientRect();
		await expect(
			{ left: r.left >= 0, right: r.right <= window.innerWidth },
			`toast from ${r.left} to ${r.right}px on a ${window.innerWidth}px screen`,
		).toEqual({ left: true, right: true });
	},
};

export const Issue3470Item12LongUrlWrapsOnDesktop: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"On a wide screen a long URL in the message wraps at the toast's 560px maximum, without a horizontal scrollbar in the message.",
			},
		},
	},
	args: {
		severity: "error",
		message: `Download failed: ${LONG_URL}`,
	},
	play: async () => {
		const toast = await body.findByRole("alert");
		await entered(toast);
		const message = elementOf(toast.querySelector(".MuiAlert-message"));
		await expect(
			message.scrollWidth - message.clientWidth,
			"message wider than its box (px)",
		).toBe(0);
	},
};

/** inline content that cannot wrap, e.g. a line of preformatted output */
const NO_WRAP_SX = { whiteSpace: "nowrap" } as const;

export const Issue3470Item12UnwrappableContentStaysOnPhone: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		// the line scrolls in MUI's message box, which has no focusable content
		// to scroll it with the keyboard (as on wider screens); this story checks
		// only that the toast stays within the screen
		a11y: {
			test: "error",
			config: {
				rules: [{ id: "scrollable-region-focusable", enabled: false }],
			},
		},
		docs: {
			description: {
				story:
					"At 320px a message with content that cannot wrap (here a line of server output in a `nowrap` element) still keeps the toast within the screen: that line scrolls sideways inside the message.",
			},
		},
	},
	render: (args) => (
		<Toast
			{...args}
			severity={"error"}
			message={
				<>
					Request failed:{" "}
					<Box component={"code"} sx={NO_WRAP_SX}>
						POST /api/v1/devices/0123456789abcdef0123456789abcdef
					</Box>
				</>
			}
		/>
	),
	play: Issue3470Item12LongWordWrapsOnPhone.play,
};

const BOTTOM_BAR_SX = {
	position: "fixed",
	left: 0,
	right: 0,
	bottom: 0,
	height: 56,
	display: "flex",
	justifyContent: "flex-end",
	alignItems: "center",
	gap: 1,
	px: 2,
	// a grey bar would put the text button below 4.5:1 and fail axe on its own
	bgcolor: "background.paper",
	borderTop: 1,
	borderColor: "divider",
} as const;

/** The part of el's box that the rect covers, 0 to 1 */
const coverage = (el: Element, rect: DOMRect) => {
	const r = el.getBoundingClientRect();
	const w = Math.max(
		0,
		Math.min(r.right, rect.right) - Math.max(r.left, rect.left),
	);
	const h = Math.max(
		0,
		Math.min(r.bottom, rect.bottom) - Math.max(r.top, rect.top),
	);
	return (w * h) / (r.width * r.height);
};

export const Issue3470Item14FocusedBottomBarNotHidden: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					'On a phone the toast is at the top of the screen, clear of the bottom 56px where pages put their action bars: a keyboard user who tabs to "Save form" sees it, and a tap on the button reaches it.',
			},
		},
	},
	render: (args) => (
		<>
			<Box sx={BOTTOM_BAR_SX}>
				<Button>Cancel</Button>
				<Button variant={"contained"}>Save form</Button>
			</Box>
			<Toast
				{...args}
				severity={"success"}
				message={"Device saved."}
				autoHideDuration={null}
			/>
		</>
	),
	play: async ({ canvas }) => {
		const toast = await body.findByRole("status");
		await entered(toast);
		const save = canvas.getByRole("button", { name: "Save form" });
		save.focus();
		await expect(save).toHaveFocus();
		const r = save.getBoundingClientRect();
		const hit = document.elementFromPoint(
			r.left + r.width / 2,
			r.top + r.height / 2,
		);
		const covered = coverage(save, toast.getBoundingClientRect());
		await expect(
			{
				fullyHidden: covered === 1,
				tapReachesButton: !!hit && save.contains(hit),
			},
			`${Math.round(covered * 100)}% of the focused button under the toast`,
		).toEqual({ fullyHidden: false, tapReachesButton: true });
	},
};

export const Issue3470Item14PhonesShowItAtTheTop: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"On a phone the toast is at the top, also where `anchorOrigin` puts it at the bottom: that applies from the sm breakpoint up.",
			},
		},
	},
	args: {
		anchorOrigin: { vertical: "bottom", horizontal: "left" },
	},
	play: async () => {
		const toast = await body.findByRole("status");
		await entered(toast);
		await expect(
			toast.getBoundingClientRect().top,
			"px between the top edge and the toast",
		).toBe(8);
	},
};

/** An app that keeps toasts at the bottom on phones */
const bottomOnPhonesTheme = createTheme({
	components: {
		CcToast: { defaultProps: { phoneVertical: "bottom" } },
	},
});

export const Issue3470Item14ThemeKeepsPhonesAtTheBottom: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					'The theme\'s `phoneVertical: "bottom"` (`components.CcToast.defaultProps`) shows toasts at the bottom on phones.',
			},
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider theme={bottomOnPhonesTheme}>
				<Story />
			</ThemeProvider>
		),
	],
	play: async () => {
		const toast = await body.findByRole("status");
		await entered(toast);
		await expect(
			window.innerHeight - toast.getBoundingClientRect().bottom,
			"px between the toast and the bottom edge",
		).toBe(8);
	},
};
