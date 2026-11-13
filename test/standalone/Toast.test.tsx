import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import React, { useCallback, useContext, useState } from "react";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	act,
	within,
	waitFor,
} from "@testing-library/react";
import {
	Button,
	createTheme,
	Dialog,
	Theme,
	ThemeProvider,
} from "@mui/material";
import { Toast, ToastProps } from "../../src/standalone/Toast";
import ToastContextProvider, {
	useToastContext,
} from "../../src/framework/ToastContextProvider";
import ToastOutlet from "../../src/framework/ToastOutlet";
import { useDialogContext } from "../../src/framework/DialogContextProvider";
import { Framework } from "../../src/framework";
import {
	configureErrorReporting,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";
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

	it("[ISSUE-3470-ITEM-3] a toast's message can use the DialogContext like the rest of the app", async () => {
		// jsdom has no matchMedia, which the Framework's ThemeProvider needs
		if (!window.matchMedia) {
			window.matchMedia = (query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: () => {},
				removeListener: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false,
			});
		}
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const DetailsButton = () => {
			const [pushDialog] = useDialogContext();
			const open = useCallback(
				() => pushDialog(<Dialog open>Device 1042 details</Dialog>),
				[pushDialog],
			);
			return <Button onClick={open}>Details</Button>;
		};
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const save = useCallback(
				() =>
					showToast({
						message: (
							<>
								Device saved. <DetailsButton />
							</>
						),
						autoHideDuration: null,
					}),
				[showToast],
			);
			return <button onClick={save}>Save device</button>;
		};
		render(
			<AppErrorBoundary>
				<Framework>
					<SaveDevice />
				</Framework>
			</AppErrorBoundary>,
		);
		fireEvent.click(await screen.findByRole("button", { name: "Save device" }));
		await waitFor(() =>
			expect(
				screen.queryByRole("status") ?? screen.queryByText(/^App crashed/),
			).not.toBeNull(),
		);
		expect(screen.queryByText(/^App crashed/)).toBeNull();
		fireEvent.click(
			within(screen.getByRole("status")).getByRole("button", {
				name: "Details",
			}),
		);
		expect(await screen.findByText("Device 1042 details")).toBeInTheDocument();
	});

	it("[ISSUE-3470-ITEM-3] a pushed dialog can show a toast", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const CopyButton = () => {
			const [showToast] = useToastContext();
			const copy = useCallback(
				() => showToast({ message: "Link copied.", autoHideDuration: null }),
				[showToast],
			);
			return <Button onClick={copy}>Copy link</Button>;
		};
		const ShareDevice = () => {
			const [pushDialog] = useDialogContext();
			const share = useCallback(
				() =>
					pushDialog(
						<Dialog open>
							<CopyButton />
						</Dialog>,
					),
				[pushDialog],
			);
			return <button onClick={share}>Share device</button>;
		};
		renderInFramework(<ShareDevice />);
		fireEvent.click(
			await screen.findByRole("button", { name: "Share device" }),
		);
		expect(screen.queryByText(/^App crashed/)).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
		expect(await screen.findByRole("status")).toHaveTextContent("Link copied.");
	});

	it("[ISSUE-3470-ITEM-3] a toast whose content throws is dropped and reported, and the app and the next toasts carry on", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const failure = new Error("Device 1042 has no name");
		const Broken = (): React.ReactNode => {
			throw failure;
		};
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const saveBroken = useCallback(
				() => showToast({ message: <Broken />, autoHideDuration: null }),
				[showToast],
			);
			const save = useCallback(
				() => showToast({ message: "Device saved.", autoHideDuration: null }),
				[showToast],
			);
			return (
				<>
					<button onClick={saveBroken}>Save broken</button>
					<button onClick={save}>Save</button>
				</>
			);
		};
		await withErrorReports(async (report) => {
			renderInFramework(<SaveDevice />);
			fireEvent.click(
				await screen.findByRole("button", { name: "Save broken" }),
			);
			expect(screen.queryByText(/^App crashed/)).toBeNull();
			expect(report).toHaveBeenCalledTimes(1);
			expect(report).toHaveBeenCalledWith(
				failure,
				expect.objectContaining({ source: "ToastOutlet" }),
			);
			expect(screen.queryByRole("status")).toBeNull();

			fireEvent.click(screen.getByRole("button", { name: "Save" }));
			expect(await screen.findByRole("status")).toHaveTextContent(
				"Device saved.",
			);
		});
	});

	it("[ISSUE-3470-ITEM-3] a toast whose content throws while the next toast waits gives way to it", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const BreaksOnClick = () => {
			const [broken, setBroken] = useState(false);
			const breakIt = useCallback(() => setBroken(true), []);
			if (broken) throw new Error("Device 1042 was deleted");
			return <Button onClick={breakIt}>Break</Button>;
		};
		const SaveDevices = () => {
			const [showToast] = useToastContext();
			const saveA = useCallback(
				() =>
					showToast({
						message: (
							<>
								A saved. <BreaksOnClick />
							</>
						),
						autoHideDuration: null,
					}),
				[showToast],
			);
			const saveB = useCallback(
				() => showToast({ message: "B saved.", autoHideDuration: null }),
				[showToast],
			);
			return (
				<>
					<button onClick={saveA}>Save A</button>
					<button onClick={saveB}>Save B</button>
				</>
			);
		};
		await withErrorReports(async (report) => {
			renderInFramework(<SaveDevices />);
			fireEvent.click(await screen.findByRole("button", { name: "Save A" }));
			await screen.findByRole("status");
			// A closes to make way for B, which waits until A has left
			fireEvent.click(screen.getByRole("button", { name: "Save B" }));
			fireEvent.click(screen.getByRole("button", { name: "Break" }));
			expect(screen.queryByText(/^App crashed/)).toBeNull();
			expect(report).toHaveBeenCalledTimes(1);
			expect(await screen.findByRole("status")).toHaveTextContent("B saved.");
		});
	});

	it("[ISSUE-3470-ITEM-3] with disableDefaultOutlet the toast renders at the ToastOutlet, inside the providers around it", () => {
		const DeviceName = React.createContext("no device");
		const ShowName = () => <>{useContext(DeviceName)}</>;
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const save = useCallback(
				() =>
					showToast({
						message: (
							<>
								<ShowName /> saved.
							</>
						),
						autoHideDuration: null,
					}),
				[showToast],
			);
			return <button onClick={save}>Save device</button>;
		};
		render(
			<ThemeProvider theme={theme}>
				<ToastContextProvider disableDefaultOutlet>
					<SaveDevice />
					<DeviceName.Provider value={"Device 1042"}>
						<ToastOutlet />
					</DeviceName.Provider>
				</ToastContextProvider>
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Save device" }));
		expect(screen.getAllByRole("status").map((el) => el.textContent)).toEqual([
			"Device 1042 saved.",
		]);
	});

	it("[ISSUE-3470-ITEM-3] a ToastOutlet inside a provider that renders its toasts itself renders nothing", () => {
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const save = useCallback(
				() => showToast({ message: "Device saved.", autoHideDuration: null }),
				[showToast],
			);
			return <button onClick={save}>Save device</button>;
		};
		render(
			<ThemeProvider theme={theme}>
				<ToastContextProvider>
					<SaveDevice />
					<ToastOutlet />
				</ToastContextProvider>
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Save device" }));
		expect(screen.getAllByRole("status")).toHaveLength(1);
	});
});

/** Renders children in the Framework, inside an app error boundary */
const renderInFramework = (children: React.ReactNode) => {
	// jsdom has no matchMedia, which the Framework's ThemeProvider needs
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
	return render(
		<AppErrorBoundary>
			<Framework>{children}</Framework>
		</AppErrorBoundary>,
	);
};

/** Runs test with every captureError report going to the report spy */
const withErrorReports = async (test: (report: Spy) => Promise<void>) => {
	const before = { ...getErrorReportingConfig() };
	const report = vi.fn();
	configureErrorReporting({ report, shouldReport: () => true });
	try {
		await test(report);
	} finally {
		configureErrorReporting(before);
	}
};

/** Like an app's error boundary: shows that the app crashed instead of the app */
class AppErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ error: string | null }
> {
	state = { error: null as string | null };
	static getDerivedStateFromError(error: Error) {
		return { error: error.message };
	}
	render() {
		return this.state.error ? (
			<div>App crashed: {this.state.error}</div>
		) : (
			this.props.children
		);
	}
}
