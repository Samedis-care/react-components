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
	alertClasses,
	alertTitleClasses,
	Button,
	createTheme,
	Dialog,
	skeletonClasses,
	Theme,
	ThemeProvider,
} from "@mui/material";
import { Toast, ToastProps } from "../../src/standalone/Toast";
import ToastOutlet from "../../src/framework/ToastOutlet";
import { useDialogContext } from "../../src/framework/DialogContextProvider";
import { Framework } from "../../src/framework";
import {
	configureErrorReporting,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";
import ccI18n from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";
import ToastContextProvider, {
	ToastContextType,
	useToastContext,
} from "../../src/framework/ToastContextProvider";

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

/**
 * With fake timers: lets the two animation frames pass after which a toast's
 * title and message are in its live region (they are written into it a frame
 * after the region is in the page)
 */
const nextFrames = () => tick(50);

/**
 * With real timers: waits until a toast's title and message (or what stands in
 * for them while they load) are in its live region
 * @param role The toast's role: alert for errors and warnings, else status
 * @returns The toast's live region
 */
const textWritten = async (role: "status" | "alert" = "status") => {
	await waitFor(() =>
		expect(
			screen.getByRole(role).querySelector(`.${alertClasses.message}`),
		).not.toBeEmptyDOMElement(),
	);
	return screen.getByRole(role);
};

beforeAll(async () => {
	await waitForCcI18n();
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

/**
 * Renders a ToastContextProvider
 * @returns its showToast and closeToast
 */
const renderToasts = (strict = false): ToastContextType => {
	const actions: { current?: ToastContextType } = {};
	const Capture = () => {
		actions.current = useToastContext();
		return null;
	};
	const tree = (
		<ThemeProvider theme={theme}>
			<ToastContextProvider>
				<Capture />
			</ToastContextProvider>
		</ThemeProvider>
	);
	render(strict ? <React.StrictMode>{tree}</React.StrictMode> : tree);
	if (!actions.current) throw new Error("no ToastContext");
	return actions.current;
};

describe("Toast: toasts shown in one update", () => {
	/**
	 * The text of every toast in the page: errors and warnings are alerts, the
	 * others statuses
	 */
	const toastTexts = () =>
		[...screen.queryAllByRole("alert"), ...screen.queryAllByRole("status")].map(
			(el) => el.textContent,
		);

	it.each([
		["", false],
		[", also in StrictMode", true],
	])(
		"[ISSUE-3470-ITEM-25] two showToast calls in one act show the second toast, and a later toast still shows%s",
		(_name, strict) => {
			vi.useFakeTimers();
			const [showToast] = renderToasts(strict);
			act(() => {
				showToast({
					severity: "warning",
					message: "Device saved without a serial number.",
					autoHideDuration: null,
				});
				showToast({
					severity: "success",
					message: "Device saved.",
					autoHideDuration: null,
				});
			});
			nextFrames();
			// the warning is dropped without ever being in the page
			expect(toastTexts()).toEqual(["Device saved."]);

			act(() => {
				showToast({ message: "Label printed.", autoHideDuration: null });
			});
			advance(EXIT_MS + 300);
			expect(toastTexts()).toEqual(["Label printed."]);
		},
	);

	it("[ISSUE-3470-ITEM-25] a toast closed in the act that showed it does not block later toasts", () => {
		vi.useFakeTimers();
		const [showToast, closeToast] = renderToasts();
		act(() => {
			showToast({ message: "Saving device…", autoHideDuration: null });
			closeToast();
		});
		expect(toastTexts()).toEqual([]);

		// nothing to wait for
		act(() => {
			showToast({ message: "Device saved.", autoHideDuration: null });
		});
		nextFrames();
		expect(toastTexts()).toEqual(["Device saved."]);
	});

	it.each([
		["", false],
		[", also in StrictMode", true],
	])(
		"[ISSUE-3470-ITEM-25] a toast rendered closed calls onExited once right away, after it was shown its close transition does%s",
		(_name, strict) => {
			vi.useFakeTimers();
			const onExited = vi.fn();
			const onClose = vi.fn();
			const toast = (open: boolean, message: string) => {
				const el = (
					<ThemeProvider theme={theme}>
						<Toast
							open={open}
							message={message}
							autoHideDuration={null}
							onClose={onClose}
							onExited={onExited}
						/>
					</ThemeProvider>
				);
				return strict ? <React.StrictMode>{el}</React.StrictMode> : el;
			};
			const { rerender } = render(toast(false, "Device saved."));
			expect(onExited).toHaveBeenCalledTimes(1);
			expect(document.querySelectorAll(".MuiSnackbar-root").length).toBe(0);

			// still closed, with other content: nothing new to exit
			rerender(toast(false, "Label printed."));
			expect(onExited).toHaveBeenCalledTimes(1);

			// shown, then closed: its close transition calls it
			rerender(toast(true, "Label printed."));
			nextFrames();
			expect(screen.getByRole("status")).toHaveTextContent("Label printed.");
			rerender(toast(false, "Label printed."));
			expect(onExited).toHaveBeenCalledTimes(1);
			advance(EXIT_MS + 300);
			expect(onExited).toHaveBeenCalledTimes(2);
			expect(document.querySelectorAll(".MuiSnackbar-root").length).toBe(0);
		},
	);
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
				screen.queryByRole("button", { name: "Details" }) ??
					screen.queryByText(/^App crashed/),
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
		expect(await textWritten()).toHaveTextContent("Link copied.");
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
			// the message renders once it is written into the toast
			await waitFor(() => expect(report).toHaveBeenCalled());
			expect(screen.queryByText(/^App crashed/)).toBeNull();
			expect(report).toHaveBeenCalledTimes(1);
			expect(report).toHaveBeenCalledWith(
				failure,
				expect.objectContaining({ source: "ToastOutlet" }),
			);
			expect(screen.queryByRole("status")).toBeNull();

			fireEvent.click(screen.getByRole("button", { name: "Save" }));
			expect(await textWritten()).toHaveTextContent("Device saved.");
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
			await textWritten();
			// A closes to make way for B, which waits until A has left
			fireEvent.click(screen.getByRole("button", { name: "Save B" }));
			fireEvent.click(screen.getByRole("button", { name: "Break" }));
			expect(screen.queryByText(/^App crashed/)).toBeNull();
			expect(report).toHaveBeenCalledTimes(1);
			expect(await textWritten()).toHaveTextContent("B saved.");
		});
	});

	it("[ISSUE-3470-ITEM-3] with disableDefaultOutlet the toast renders at the ToastOutlet, inside the providers around it", async () => {
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
		await textWritten();
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

	it("[ISSUE-3470-ITEM-15] writes the toast's text into a live region that already exists", async () => {
		// the records delivered while the test waits, and those still queued
		const records: MutationRecord[] = [];
		const observer = new MutationObserver((delivered) => {
			records.push(...delivered);
		});
		observer.observe(document.body, {
			subtree: true,
			childList: true,
			characterData: true,
		});
		renderToast({ message: "Saved." });
		const region = screen.getByRole("status");
		await waitFor(() => expect(region).toHaveTextContent("Saved."));
		records.push(...observer.takeRecords());
		observer.disconnect();
		// a region inserted together with its text is often not announced
		const writtenIntoRegion = records.some(
			(r) =>
				region.contains(r.target) &&
				(r.type === "characterData" ||
					Array.from(r.addedNodes).some((n) =>
						n.textContent?.includes("Saved."),
					)),
		);
		expect(
			writtenIntoRegion,
			"the status element was inserted with its text already in it",
		).toBe(true);
	});

	it("[ISSUE-3470-ITEM-26] a toast whose message suspends leaves the app's content visible, and its message shows once loaded", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const details = lazyLater();
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const save = useCallback(
				() =>
					showToast({
						message: (
							<>
								Device saved. <details.Component />
							</>
						),
						autoHideDuration: null,
					}),
				[showToast],
			);
			return <button onClick={save}>Save device</button>;
		};
		renderInFramework(<SaveDevice />);
		const save = await screen.findByRole("button", { name: "Save device" });
		fireEvent.click(save);
		await textWritten();
		expect(save).toBeVisible();
		expect(screen.queryByRole("progressbar")).toBeNull();

		await details.load(() => <>Device 1042 is due for inspection.</>);
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent(
				"Device saved. Device 1042 is due for inspection.",
			),
		);
		expect(save).toBeVisible();
	});

	it("[ISSUE-3470-ITEM-26] a toast whose title suspends leaves the app's content visible, and its title shows once loaded", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const deviceName = lazyLater();
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const save = useCallback(
				() =>
					showToast({
						title: <deviceName.Component />,
						message: "Saved.",
						autoHideDuration: null,
					}),
				[showToast],
			);
			return <button onClick={save}>Save device</button>;
		};
		renderInFramework(<SaveDevice />);
		const save = await screen.findByRole("button", { name: "Save device" });
		fireEvent.click(save);
		await textWritten();
		expect(save).toBeVisible();

		await deviceName.load(() => <>Device 1042</>);
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("Device 1042Saved."),
		);
	});

	it.each([
		["the first toast", false],
		["a toast that replaced another one", true],
	])(
		"[ISSUE-3470-ITEM-26] %s, its message still loading, gives way to the next toast",
		async (_name, afterAnother) => {
			vi.spyOn(console, "error").mockImplementation(() => undefined);
			const loading = lazyLater();
			const SaveDevices = () => {
				const [showToast] = useToastContext();
				const saveA = useCallback(
					() => showToast({ message: "A saved.", autoHideDuration: null }),
					[showToast],
				);
				const saveB = useCallback(
					() =>
						showToast({
							message: (
								<>
									B saved. <loading.Component />
								</>
							),
							autoHideDuration: null,
						}),
					[showToast],
				);
				const saveC = useCallback(
					() => showToast({ message: "C saved.", autoHideDuration: null }),
					[showToast],
				);
				return (
					<>
						<button onClick={saveA}>Save A</button>
						<button onClick={saveB}>Save B</button>
						<button onClick={saveC}>Save C</button>
					</>
				);
			};
			renderInFramework(<SaveDevices />);
			const saveC = await screen.findByRole("button", { name: "Save C" });
			vi.useFakeTimers();
			if (afterAnother) {
				fireEvent.click(screen.getByRole("button", { name: "Save A" }));
				nextFrames();
				expect(screen.getByRole("status")).toHaveTextContent("A saved.");
			}
			fireEvent.click(screen.getByRole("button", { name: "Save B" }));
			// A has closed: B is the toast now, its message loading
			advance(EXIT_MS + 300);
			expect(saveC).toBeVisible();

			fireEvent.click(saveC);
			advance(EXIT_MS + 300);
			expect(screen.getByRole("status")).toHaveTextContent("C saved.");
		},
	);

	it("[ISSUE-3470-ITEM-26] a toast whose message fails to load is dropped and reported, and the app carries on", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const details = lazyLater();
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const save = useCallback(
				() =>
					showToast({
						message: <details.Component />,
						autoHideDuration: null,
					}),
				[showToast],
			);
			return <button onClick={save}>Save device</button>;
		};
		await withErrorReports(async (report) => {
			renderInFramework(<SaveDevice />);
			const save = await screen.findByRole("button", { name: "Save device" });
			fireEvent.click(save);
			await textWritten();
			expect(save).toBeVisible();

			const failure = new Error("Loading chunk DeviceDetails failed");
			await details.fail(failure);
			expect(screen.queryByText(/^App crashed/)).toBeNull();
			expect(report).toHaveBeenCalledTimes(1);
			expect(report).toHaveBeenCalledWith(
				failure,
				expect.objectContaining({ source: "ToastOutlet" }),
			);
			expect(screen.queryByRole("status")).toBeNull();
			expect(save).toBeVisible();
		});
	});

	it("[ISSUE-3470-ITEM-26] while a toast's title and message load, skeleton text lines hidden from screen readers stand in for them, and the loaded text replaces them in the same live region", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const deviceName = lazyLater();
		const details = lazyLater();
		const SaveDevice = () => {
			const [showToast] = useToastContext();
			const save = useCallback(
				() =>
					showToast({
						title: <deviceName.Component />,
						message: <details.Component />,
						autoHideDuration: null,
					}),
				[showToast],
			);
			return <button onClick={save}>Save device</button>;
		};
		renderInFramework(<SaveDevice />);
		fireEvent.click(await screen.findByRole("button", { name: "Save device" }));
		const toast = await textWritten();
		const title = () => toast.querySelector(`.${alertTitleClasses.root}`);
		// the Alert's message slot holds the title too
		const messageLines = () =>
			skeletonLines(toast.querySelector(`.${alertClasses.message}`)).filter(
				(line) => !title()?.contains(line),
			);
		expect(skeletonLines(title())).toHaveLength(1);
		expect(messageLines()).toHaveLength(2);
		for (const line of skeletonLines(toast)) {
			expect(line).toHaveClass(skeletonClasses.text);
			expect(line.closest("[aria-hidden='true']")).not.toBeNull();
		}
		// nothing for a screen reader to read yet
		expect(toast.textContent).toBe("");

		await deviceName.load(() => <>Device 1042</>);
		expect(title()).toHaveTextContent("Device 1042");
		expect(skeletonLines(title())).toHaveLength(0);
		expect(messageLines()).toHaveLength(2);

		await details.load(() => <>Saved.</>);
		expect(toast).toHaveTextContent("Device 1042Saved.");
		expect(skeletonLines(toast)).toHaveLength(0);
		// the live region that was in the page while the text loaded: the text
		// is added to it, which is what screen readers announce
		expect(screen.getByRole("status")).toBe(toast);
	});

	it("[ISSUE-3470-ITEM-26] a toast that replaced another one shows skeleton lines while its message loads, not the other toast's message, and gets its text in the same live region", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const details = lazyLater();
		const SaveDevices = () => {
			const [showToast] = useToastContext();
			const saveA = useCallback(
				() => showToast({ message: "A saved.", autoHideDuration: null }),
				[showToast],
			);
			const saveB = useCallback(
				() =>
					showToast({
						message: <details.Component />,
						autoHideDuration: null,
					}),
				[showToast],
			);
			return (
				<>
					<button onClick={saveA}>Save A</button>
					<button onClick={saveB}>Save B</button>
				</>
			);
		};
		renderInFramework(<SaveDevices />);
		const saveB = await screen.findByRole("button", { name: "Save B" });
		vi.useFakeTimers();
		fireEvent.click(screen.getByRole("button", { name: "Save A" }));
		nextFrames();
		const toast = screen.getByRole("status");
		expect(toast).toHaveTextContent("A saved.");

		fireEvent.click(saveB);
		// A has closed: B is the toast now, its message loading
		advance(EXIT_MS + 300);
		expect(screen.getByRole("status")).toBe(toast);
		expect(toast.textContent).toBe("");
		expect(skeletonLines(toast)).toHaveLength(2);

		await details.load(() => <>B saved.</>);
		expect(toast).toHaveTextContent("B saved.");
		expect(skeletonLines(toast)).toHaveLength(0);
		expect(screen.getByRole("status")).toBe(toast);
	});
});

describe("Toast: live region", () => {
	/** The slot of a toast's live region that holds its title and message */
	const textSlotOf = (region: HTMLElement) =>
		region.querySelector(`.${alertClasses.message}`);

	it.each([
		["", false],
		[", also in StrictMode", true],
	])(
		"[ISSUE-3470-ITEM-15] the first context toast, and one after the toasts before have left, get their text in a live region already in the page%s",
		(_name, strict) => {
			vi.useFakeTimers();
			const [showToast, closeToast] = renderToasts(strict);
			act(() => {
				showToast({
					severity: "error",
					message: "Device not saved.",
					autoHideDuration: null,
				});
			});
			const alert = screen.getByRole("alert");
			expect(textSlotOf(alert)).toBeEmptyDOMElement();
			nextFrames();
			expect(screen.getByRole("alert")).toBe(alert);
			expect(alert).toHaveTextContent("Device not saved.");

			act(() => {
				closeToast();
			});
			advance(EXIT_MS + 300);
			expect(screen.queryByRole("alert")).toBeNull();

			act(() => {
				showToast({ message: "Device saved.", autoHideDuration: null });
			});
			const status = screen.getByRole("status");
			expect(textSlotOf(status)).toBeEmptyDOMElement();
			nextFrames();
			expect(screen.getByRole("status")).toBe(status);
			expect(status).toHaveTextContent("Device saved.");
		},
	);

	it("[ISSUE-3470-ITEM-15] a context toast that replaces one of another severity gets the region's new role before its text", () => {
		vi.useFakeTimers();
		const [showToast] = renderToasts();
		act(() => {
			showToast({
				severity: "success",
				message: "Device saved.",
				autoHideDuration: null,
			});
		});
		nextFrames();
		const region = screen.getByRole("status");
		expect(region).toHaveTextContent("Device saved.");

		act(() => {
			showToast({
				severity: "error",
				message: "Label not printed.",
				autoHideDuration: null,
			});
		});
		// the saved toast closes with its text, then the error takes the region
		for (let ms = 0; ms < EXIT_MS + 300; ms += 10) {
			if (region.getAttribute("role") === "alert") break;
			tick(10);
		}
		expect(region).toHaveAttribute("role", "alert");
		expect(
			textSlotOf(region),
			"the text came with the new role",
		).toBeEmptyDOMElement();
		nextFrames();
		expect(screen.getByRole("alert")).toBe(region);
		expect(region).toHaveTextContent("Label not printed.");
	});

	it("[ISSUE-3470-ITEM-15] a context toast that replaces one with the same text writes the text anew", () => {
		vi.useFakeTimers();
		const [showToast] = renderToasts();
		const save = () =>
			act(() => {
				showToast({ message: "Device saved.", autoHideDuration: null });
			});
		save();
		nextFrames();
		const region = screen.getByRole("status");
		expect(region).toHaveTextContent("Device saved.");

		save();
		// the first toast closes with its text, then the second one opens
		for (let ms = 0; ms < EXIT_MS + 300; ms += 10) {
			if (!textSlotOf(region)?.hasChildNodes()) break;
			tick(10);
		}
		expect(
			textSlotOf(region),
			"the second toast's text was never written into the region",
		).toBeEmptyDOMElement();
		nextFrames();
		expect(screen.getByRole("status")).toBe(region);
		expect(region).toHaveTextContent("Device saved.");
	});

	it("[ISSUE-3470-ITEM-15] a toast whose severity changes its role while it is shown gets its text after the new role, and its close button keeps focus", () => {
		vi.useFakeTimers();
		const { rerenderToast } = renderToast({
			severity: "info",
			message: "Saving device…",
			autoHideDuration: null,
		});
		nextFrames();
		const region = screen.getByRole("status");
		const close = within(region).getByRole("button", { name: "Close" });
		act(() => {
			close.focus();
		});

		rerenderToast({ severity: "error", message: "Device not saved." });
		expect(region).toHaveAttribute("role", "alert");
		expect(
			textSlotOf(region),
			"the text came with the new role",
		).toBeEmptyDOMElement();
		nextFrames();
		expect(screen.getByRole("alert")).toBe(region);
		expect(region).toHaveTextContent("Device not saved.");
		expect(close).toHaveFocus();
	});
});

/** The skeleton lines in element */
const skeletonLines = (element: Element | null) =>
	Array.from(element?.querySelectorAll(`.${skeletonClasses.root}`) ?? []);

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

/**
 * A React.lazy component whose module loads (or fails to) when the test says so
 */
const lazyLater = () => {
	let settle:
		| {
				resolve: (module: { default: React.ComponentType }) => void;
				reject: (error: unknown) => void;
		  }
		| undefined;
	const Component = React.lazy(
		() =>
			new Promise<{ default: React.ComponentType }>((resolve, reject) => {
				settle = { resolve, reject };
			}),
	);
	const loading = () => {
		if (!settle) throw new Error("the lazy component has not rendered yet");
		return settle;
	};
	return {
		Component,
		load: (component: React.ComponentType) =>
			act(async () => {
				loading().resolve({ default: component });
				await Promise.resolve();
			}),
		fail: (error: unknown) =>
			act(async () => {
				loading().reject(error);
				await Promise.resolve();
			}),
	};
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
