import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import { Toast, ToastProps } from "../../src/standalone/Toast";
import ccI18n from "../../src/i18n";

type Spy = ReturnType<typeof vi.fn>;

const theme = createTheme();
/** theme.transitions.duration.leavingScreen of createTheme(): the close animation */
const EXIT_MS = 195;

const renderToast = (props: Partial<ToastProps> = {}, t: Theme = theme) => {
	const all: ToastProps = {
		open: true,
		message: "Saved.",
		onClose: vi.fn(),
		onExited: vi.fn(),
		...props,
	};
	const el = (p: ToastProps) => (
		<ThemeProvider theme={t}>
			<Toast {...p} />
		</ThemeProvider>
	);
	const result = render(el(all));
	return {
		...result,
		onClose: all.onClose as Spy,
		onExited: all.onExited as Spy,
		rerenderToast: (next: Partial<ToastProps>) =>
			result.rerender(el({ ...all, ...next })),
	};
};

/** Advances fake timers by ms in one act() */
const tick = (ms: number) =>
	act(() => {
		vi.advanceTimersByTime(ms);
	});

/**
 * Advances fake timers in steps: React flushes effects at the end of act(), so
 * a timer started by a re-render inside one big advance would not run in it
 */
const advance = (ms: number, step = 50) => {
	for (let left = ms; left > 0; left -= step) tick(Math.min(step, left));
};

beforeAll(async () => {
	await ccI18n.changeLanguage("en");
});

afterEach(async () => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

describe("Toast: bugs", () => {
	it("[ISSUE-3470-ITEM-2] leaves the DOM after closing also when no onExited is given", () => {
		vi.useFakeTimers();
		const { rerenderToast } = renderToast({
			onExited: undefined,
			autoHideDuration: null,
		});
		rerenderToast({ open: false });
		advance(EXIT_MS + 300);
		expect(screen.queryByRole("status")).toBeNull();
		expect(
			document.querySelectorAll(".MuiSnackbar-root").length,
			"Snackbar roots left after the close animation",
		).toBe(0);
	});

	it("[ISSUE-3470-ITEM-2] calls an onExited first passed while the toast is open, and leaves the DOM", () => {
		vi.useFakeTimers();
		const { rerenderToast } = renderToast({
			onExited: undefined,
			autoHideDuration: null,
		});
		const onExited = vi.fn();
		rerenderToast({ onExited });
		rerenderToast({ onExited, open: false });
		advance(EXIT_MS + 300);
		expect(onExited).toHaveBeenCalledTimes(1);
		expect(document.querySelectorAll(".MuiSnackbar-root").length).toBe(0);
	});
});
