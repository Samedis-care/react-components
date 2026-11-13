import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, createTheme, ThemeProvider } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor, within } from "storybook/test";
import { Toast, ToastProps } from "./Toast";

// The toast renders in a portal, so query from the document body
const body = within(document.body);

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
		await expect(toast).toHaveTextContent(
			"3 devices were added to the project.",
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
		await expect(await body.findByRole("alert")).toHaveTextContent(
			"Device left open",
		);
	},
};

export const Error: Story = {
	args: {
		severity: "error",
		message: "This label belongs to another project.",
	},
	play: async () => {
		await expect(await body.findByRole("alert")).toHaveTextContent(
			"This label belongs to another project.",
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

export const EscapeOnlyWhenFocused: Story = {
	play: async ({ args, userEvent }) => {
		const toast = await body.findByRole("status");

		// Escape elsewhere (e.g. closing a dialog) leaves the toast alone
		await userEvent.keyboard("{Escape}");
		await expect(args.onClose).not.toHaveBeenCalled();

		within(toast).getByRole("button", { name: "Close" }).focus();
		await userEvent.keyboard("{Escape}");
		await expect(args.onClose).toHaveBeenCalledTimes(1);
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
