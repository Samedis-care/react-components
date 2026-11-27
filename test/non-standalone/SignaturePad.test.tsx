import React, { useState } from "react";
import fs from "node:fs";
import path from "node:path";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	expectTypeOf,
	it,
	vi,
} from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { setFrameworkHistory } from "../../src/framework/History";
import DialogContextProvider, {
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import { waitForCcI18n } from "../waitForCcI18n";
import { createTheme, Theme, ThemeProvider } from "@mui/material";

import SignaturePad, {
	SignaturePadProps,
} from "../../src/non-standalone/SignaturePad/SignaturePad";
import type * as PackageRoot from "../../src";
import {
	SignDialog,
	SignPadDialogProps,
} from "../../src/non-standalone/Dialog/SignPadDialog";

// The real canvas wrapper cannot mount in jsdom (its CJS build does not
// interoperate with signature_pad's UMD), and jsdom has no 2d context. The fake
// keeps the parts SignPadDialog uses: the canvas ref, isEmpty() and clear(), and
// like the real wrapper it spreads canvasProps onto the <canvas>.
const pad = vi.hoisted(() => ({
	empty: true,
	clears: 0,
	touch: false,
	props: [] as Record<string, unknown>[],
}));

vi.mock("react-signature-pad-wrapper", async () => {
	const R = await import("react");
	class FakePad extends R.Component<Record<string, unknown>> {
		canvas = R.createRef<HTMLCanvasElement>();
		isEmpty() {
			return pad.empty;
		}
		clear() {
			pad.clears++;
			pad.empty = true;
		}
		render() {
			pad.props.push(this.props);
			return R.createElement("canvas", {
				ref: this.canvas,
				width: 300,
				height: 150,
				...(this.props.canvasProps as object | undefined),
			});
		}
	}
	return { default: FakePad };
});

// jsdom is a touch device ("ontouchstart" in window), which disables backdrop clicks
vi.mock("../../src/utils/isTouchDevice", () => ({ default: () => pad.touch }));

const SIG =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

beforeAll(async () => {
	setFrameworkHistory(createMemoryHistory());
	await waitForCcI18n();
});

beforeEach(() => {
	pad.empty = true;
	pad.clears = 0;
	pad.touch = false;
	pad.props.length = 0;
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const withDialogs = (ui: React.ReactNode) =>
	render(<DialogContextProvider>{ui}</DialogContextProvider>);

/** the tile root; SignPad's root is the only element with an onClick */
const tile = () => {
	const el = document.querySelector('[class*="CcSignPad-root"]');
	if (!(el instanceof HTMLElement)) throw new Error("tile missing");
	return el;
};

const openPad = () => fireEvent.click(tile());

const dialog = () => screen.getByRole("dialog");

const title = () => within(dialog()).getByRole("heading", { level: 2 });

const button = (name: string) => screen.getByRole("button", { name });

const canvasIn = (el: HTMLElement) => el.querySelector("canvas");

/** The part of a locale's translation.json with the sign dialog's texts */
interface SignPadTranslation {
	standalone: {
		"signature-pad": { dialog: Record<string, string | undefined> };
	};
}

const lastPadProps = () => pad.props[pad.props.length - 1];

/** pushes a SignDialog, as SignaturePad and SCF's auto-open do */
const Opener = (props: SignPadDialogProps) => {
	const [push] = useDialogContext();
	return <button onClick={() => push(<SignDialog {...props} />)}>open</button>;
};

describe("SignaturePad", () => {
	it("[ISSUE-3467-ITEM-17] aria-labelledby and aria-describedby given to SignaturePad name and describe its button", () => {
		const aria = {
			"aria-labelledby": "sig-label",
			"aria-describedby": "sig-error",
			"aria-invalid": true,
			required: true,
		};
		withDialogs(
			<>
				<span id="sig-label">Trainer signature</span>
				<span id="sig-error">Signature is required</span>
				<SignaturePad signature={null} setSignature={() => {}} {...aria} />
			</>,
		);
		// the label, then the button's own name, which tells whether it is signed
		const activator = screen.getByRole("button", {
			name: "Trainer signature Sign here digitally",
		});
		// a button cannot carry aria-required, so "Required" leads its description
		expect(activator).toHaveAccessibleDescription(
			"Required Signature is required",
		);
		expect(activator).toHaveAttribute("aria-invalid", "true");
		expect(activator).not.toHaveAttribute("aria-required");
	});
	it("[ISSUE-3467-ITEM-6] SignaturePad opens its dialog exactly while the tile is enabled: by its disabled prop, else by the theme's CcSignPad default", () => {
		const plain = createTheme();
		const disabledByTheme = createTheme({
			components: { CcSignPad: { defaultProps: { disabled: true } } },
		});
		const field = (theme: typeof plain, disabled?: boolean) => (
			<ThemeProvider theme={theme}>
				<DialogContextProvider>
					<SignaturePad
						signature={null}
						setSignature={() => {}}
						disabled={disabled}
					/>
				</DialogContextProvider>
			</ThemeProvider>
		);
		const { rerender } = render(field(plain, true));
		const activator = screen.getByRole("button");
		fireEvent.click(activator);
		expect(
			screen.queryByRole("dialog"),
			"dialog of a disabled field",
		).toBeNull();

		rerender(field(disabledByTheme));
		// the tile shows the theme's default as disabled, and SignaturePad agrees
		expect(activator).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(activator);
		expect(
			screen.queryByRole("dialog"),
			"dialog of a field disabled by the theme",
		).toBeNull();

		rerender(field(disabledByTheme, false));
		expect(activator).not.toHaveAttribute("aria-disabled");
		fireEvent.click(activator);
		expect(dialog()).toBeInTheDocument();
	});

	it("[ISSUE-3467-ITEM-11] className and classes given to SignaturePad style the tile, not the dialog", () => {
		withDialogs(
			<SignaturePad
				signature=""
				className="pad-cls"
				classes={{ root: "pad-root" }}
			/>,
		);
		expect(
			tile(),
			"the tile root lacks className and classes.root",
		).toHaveClass("pad-cls", "pad-root");
		openPad();
		const dialogRoot = document.querySelector(".MuiDialog-root");
		expect(dialogRoot).not.toHaveClass("pad-cls");
		expect(dialogRoot).not.toHaveClass("pad-root");
	});

	it("[ISSUE-3467-ITEM-11] canvasProps given to SignaturePad reach the canvas", () => {
		withDialogs(
			<SignaturePad
				signature=""
				canvasProps={{ "aria-label": "Draw your signature" }}
			/>,
		);
		openPad();
		expect(canvasIn(dialog())).toHaveAttribute(
			"aria-label",
			"Draw your signature",
		);
	});

	it("[ISSUE-3467-ITEM-11] classes.imageDiv given to SignaturePad styles the tile's image box, not the dialog's of the same slot name", () => {
		withDialogs(
			<SignaturePad signature={SIG} classes={{ imageDiv: "pad-img" }} />,
		);
		const tileImage = tile().querySelector("img");
		expect(tileImage?.parentElement).toHaveClass("pad-img");
		openPad();
		const stored = within(dialog()).getByRole("img", { name: "Signature" });
		expect(stored.parentElement).not.toHaveClass("pad-img");
	});

	it("[ISSUE-3467-ITEM-11] canvasProps given to a pushed SignDialog reach the canvas, which keeps its role and name unless they set their own", () => {
		withDialogs(
			<Opener signature="" canvasProps={{ className: "my-canvas" }} />,
		);
		fireEvent.click(screen.getByText("open"));
		const canvas = canvasIn(dialog());
		expect(canvas).toHaveClass("my-canvas");
		expect(within(dialog()).getByRole("img", { name: "Signature area" })).toBe(
			canvas,
		);
	});

	it("[ISSUE-3467-ITEM-11] SignaturePad's type takes neither openSignPad nor clearOnResize, and a tile click opens its own dialog", () => {
		const open = vi.fn();
		const props: React.ComponentProps<typeof SignaturePad> = {
			signature: "",
			// @ts-expect-error SignaturePad opens its own dialog
			openSignPad: open,
		};
		const resize: React.ComponentProps<typeof SignaturePad> = {
			signature: "",
			// @ts-expect-error the ink survives a resize, nothing to configure
			clearOnResize: true,
		};
		withDialogs(<SignaturePad {...resize} {...props} />);
		openPad();
		expect(dialog()).toBeInTheDocument();
		expect(open).not.toHaveBeenCalled();
	});

	it("[ISSUE-3467-ITEM-11] a class for the dialog goes through the CcSignPadDialog default props of a theme around the field", () => {
		const withSignDialogClass = (outer: Theme): Theme => ({
			...outer,
			components: {
				...outer.components,
				CcSignPadDialog: { defaultProps: { className: "my-sign-dialog" } },
			},
		});
		// an app's theme, as the Framework provides it
		withDialogs(
			<ThemeProvider theme={createTheme()}>
				<ThemeProvider theme={withSignDialogClass}>
					<SignaturePad signature="" className="pad-cls" />
				</ThemeProvider>
			</ThemeProvider>,
		);
		expect(tile()).not.toHaveClass("my-sign-dialog");
		openPad();
		const dialogRoot = document.querySelector(".MuiDialog-root");
		expect(dialogRoot).toHaveClass("my-sign-dialog");
		expect(dialogRoot).not.toHaveClass("pad-cls");
	});

	it("[ISSUE-3467-ITEM-10] the open dialog follows a signer name that arrives after it opened", () => {
		const Host = () => {
			const [name, setName] = useState<string | null>(null);
			return (
				<>
					<button onClick={() => setName("Bob")}>load name</button>
					<SignaturePad signature="" signerName={name} />
				</>
			);
		};
		withDialogs(<Host />);
		openPad();
		expect(title()).toHaveTextContent("Sign Here");
		// the modal makes the rest of the page inert for user-event, not for fireEvent
		fireEvent.click(screen.getByText("load name"));
		expect(title().textContent, "title after the name arrived").toBe(
			"Sign here (Bob)",
		);
	});
	it("[ISSUE-3467-ITEM-13] exports SignaturePad and its props type SignaturePadProps from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<typeof PackageRoot.SignaturePad>().toEqualTypeOf<
			typeof SignaturePad
		>();
		expectTypeOf<PackageRoot.SignaturePadProps>().toEqualTypeOf<SignaturePadProps>();
	});
});

describe("SignDialog in a dialog stack", () => {
	it("[ISSUE-3467-ITEM-8] Save closes the sign dialog, not a dialog that setSignature opened", () => {
		let push: ((dialog: React.ReactNode) => void) | undefined;
		const Grab = () => {
			push = useDialogContext()[0];
			return null;
		};
		const set = vi.fn(() =>
			push!(<div role="alert">saved, please check the record</div>),
		);
		withDialogs(
			<>
				<Grab />
				<Opener signature={SIG} setSignature={set} />
			</>,
		);
		fireEvent.click(screen.getByText("open"));
		fireEvent.click(button("Save Changes"));
		expect(set).toHaveBeenCalledTimes(1);
		expect(
			screen.queryByRole("alert"),
			"the dialog opened by setSignature was closed",
		).not.toBeNull();
		expect(
			screen.queryByRole("dialog"),
			"the sign dialog stayed open",
		).toBeNull();
	});

	it("[ISSUE-3467-ITEM-8] rendered without pushDialog, Save and Escape close no other dialog", () => {
		const set = vi.fn();
		const PushOther = () => {
			const [push] = useDialogContext();
			return (
				<button onClick={() => push(<div role="alert">other dialog</div>)}>
					other
				</button>
			);
		};
		withDialogs(
			<>
				<PushOther />
				<SignDialog signature={SIG} setSignature={set} />
			</>,
		);
		fireEvent.click(screen.getByText("other"));
		fireEvent.click(button("Save Changes"));
		expect(set).toHaveBeenCalledExactlyOnceWith(SIG);
		fireEvent.keyDown(dialog(), { key: "Escape" });
		// the open sign dialog hides the rest of the page from the role queries
		expect(screen.queryByText("other dialog")).not.toBeNull();
	});
});

describe("SignDialog name and onBlur", () => {
	it.each([
		["Save", () => fireEvent.click(button("Save Changes"))],
		["the close button", () => fireEvent.click(button("Close"))],
		["Escape", () => fireEvent.keyDown(dialog(), { key: "Escape" })],
	])("[ISSUE-3467-ITEM-9] calls onBlur once when closed by %s", (_, close) => {
		// what a Form's handleBlur reads: the name or data-name of currentTarget
		// (React clears currentTarget after dispatch, so record it in the handler)
		const names: (string | null)[] = [];
		const onBlur = vi.fn((evt: React.FocusEvent<HTMLElement>) => {
			names.push(
				evt.currentTarget.getAttribute("name") ??
					evt.currentTarget.getAttribute("data-name"),
			);
		});
		withDialogs(<Opener signature={SIG} name="sig" onBlur={onBlur} />);
		fireEvent.click(screen.getByText("open"));
		close();
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onBlur, "onBlur calls per close").toHaveBeenCalledTimes(1);
		expect(names).toEqual(["sig"]);
	});

	it("[ISSUE-3467-ITEM-9] the blur reported on close holds the field's value after it: the unchanged one, or the one Save just stored", async () => {
		const values: string[] = [];
		const onBlur = vi.fn((evt: React.FocusEvent<HTMLInputElement>) => {
			values.push(evt.currentTarget.value);
		});
		const set = vi.fn();
		// pushed, so the dialog's signature prop keeps the value it opened with
		withDialogs(
			<Opener signature={SIG} name="sig" setSignature={set} onBlur={onBlur} />,
		);
		fireEvent.click(screen.getByText("open"));
		fireEvent.click(button("Close"));
		fireEvent.click(screen.getByText("open"));
		fireEvent.click(button("Clear signature"));
		fireEvent.click(await screen.findByRole("button", { name: "Yes" }));
		await waitFor(() => expect(canvasIn(dialog())).not.toBeNull());
		fireEvent.click(button("Save Changes"));
		expect(set).toHaveBeenCalledExactlyOnceWith("");
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(values, "input values of the blurs reported on close").toEqual([
			SIG,
			"",
		]);
	});
});

describe("SignDialog accessibility", () => {
	it("[ISSUE-3467-ITEM-16] Tab from the close button goes to Save Changes, and the off-screen input is hidden from assistive technology", async () => {
		const user = userEvent.setup();
		withDialogs(<SignaturePad signature={SIG} name="sig" />);
		openPad();
		button("Close").focus();
		await user.tab();
		expect(document.activeElement, "focus after Tab from Close").toBe(
			button("Save Changes"),
		);
		// aria-hidden, type="hidden" and no input at all each leave no textbox
		expect(
			within(dialog()).queryByRole("textbox"),
			"the off-screen input is exposed to assistive technology",
		).toBeNull();
	});
	it("[ISSUE-3467-ITEM-16] over an empty canvas too, Tab skips the off-screen input, and closing still reports a blur named after the field", async () => {
		// what a Form's handleBlur reads: the name or data-name of currentTarget
		const names: (string | null)[] = [];
		const onBlur = vi.fn((evt: React.FocusEvent<HTMLElement>) => {
			names.push(
				evt.currentTarget.getAttribute("name") ??
					evt.currentTarget.getAttribute("data-name"),
			);
		});
		const user = userEvent.setup();
		withDialogs(<SignaturePad signature="" name="sig" onBlur={onBlur} />);
		openPad();
		expect(canvasIn(dialog())).not.toBeNull();
		button("Close").focus();
		await user.tab();
		expect(document.activeElement, "focus after Tab from Close").toBe(
			button("Save Changes"),
		);
		expect(within(dialog()).queryByRole("textbox")).toBeNull();
		fireEvent.click(button("Save Changes"));
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(names, "field names of the blurs reported on close").toContain(
			"sig",
		);
	});
	it("[ISSUE-3467-ITEM-18] the drawing area is an image named Signature area, and the dialog says how to sign", () => {
		withDialogs(<SignaturePad signature={null} />);
		openPad();
		expect(within(dialog()).getByRole("img", { name: "Signature area" })).toBe(
			canvasIn(dialog()),
		);
		expect(dialog()).toHaveAccessibleDescription(
			"Draw your signature in the signature area with a mouse, pen or finger.",
		);
	});
	it("[ISSUE-3467-ITEM-18] over a stored signature, the dialog says to clear it before signing again, and once cleared how to sign", async () => {
		withDialogs(<SignaturePad signature={SIG} />);
		openPad();
		expect(canvasIn(dialog())).toBeNull();
		expect(dialog()).toHaveAccessibleDescription(
			"The saved signature is shown. To sign again, clear it first.",
		);
		fireEvent.click(button("Clear signature"));
		fireEvent.click(await screen.findByRole("button", { name: "Yes" }));
		await waitFor(() =>
			expect(
				within(dialog()).getByRole("img", { name: "Signature area" }),
			).toBe(canvasIn(dialog())),
		);
		expect(dialog()).toHaveAccessibleDescription(
			"Draw your signature in the signature area with a mouse, pen or finger.",
		);
	});
	it("[ISSUE-3467-ITEM-18] every locale names the sign area and has both instructions", () => {
		const i18nDir = path.resolve(__dirname, "../../src/assets/i18n");
		const keys = ["sign-area", "instructions", "instructions-signed"];
		const missing = fs
			.readdirSync(i18nDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.flatMap((entry) => {
				const translation = JSON.parse(
					fs.readFileSync(
						path.join(i18nDir, entry.name, "translation.json"),
						"utf8",
					),
				) as SignPadTranslation;
				const texts = translation.standalone["signature-pad"].dialog;
				return keys
					.filter((key) => !texts[key]?.trim())
					.map((key) => `${entry.name}: ${key}`);
			});
		expect(missing).toEqual([]);
	});
	it("[ISSUE-3467-ITEM-19] the dialog's name comes from the title text alone, without the close button", () => {
		withDialogs(<SignaturePad signature="" signerName="Bob" />);
		openPad();
		const labelledBy = dialog().getAttribute("aria-labelledby")!;
		const label = document.getElementById(labelledBy)!;
		// jsdom leaves the button out of the name; Chromium says "Sign here (Bob) Close"
		expect(
			label.querySelector("button"),
			"the element naming the dialog contains the close button",
		).toBeNull();
		expect(label.textContent).toBe("Sign here (Bob)");
	});
});

describe("SignDialog with props changing while open", () => {
	it("[ISSUE-3467-ITEM-10] the open dialog closes when its pad unmounts", async () => {
		const Host = () => {
			const [show, setShow] = useState(true);
			return (
				<>
					<button onClick={() => setShow(false)}>hide</button>
					{show && <SignaturePad signature={SIG} />}
				</>
			);
		};
		withDialogs(<Host />);
		openPad();
		expect(dialog()).toBeInTheDocument();
		// the modal makes the rest of the page inert for user-event, not for fireEvent
		fireEvent.click(screen.getByText("hide"));
		await waitFor(() =>
			expect(document.querySelector('[class*="CcSignPad-root"]')).toBeNull(),
		);
		expect(
			screen.queryByRole("dialog"),
			"the sign dialog is still open after its pad unmounted",
		).toBeNull();
	});

	it("[ISSUE-3467-ITEM-10] Save in the open dialog stores through the current setSignature, and the dialog shows the current value", () => {
		const SIG2 = "data:image/png;base64,U0VDT05E";
		const setOld = vi.fn();
		const setNew = vi.fn();
		const { rerender } = withDialogs(
			<SignaturePad signature={SIG} setSignature={setOld} />,
		);
		openPad();
		rerender(
			<DialogContextProvider>
				<SignaturePad signature={SIG2} setSignature={setNew} />
			</DialogContextProvider>,
		);
		expect(
			within(dialog()).getByRole("img", { name: "Signature" }),
			"the stored signature the open dialog shows",
		).toHaveAttribute("src", SIG2);
		fireEvent.click(button("Save Changes"));
		expect(setOld, "the setSignature of the click").not.toHaveBeenCalled();
		expect(setNew).toHaveBeenCalledExactlyOnceWith(SIG2);
	});

	it("[ISSUE-3467-ITEM-10] a pad disabled while its dialog is open closes the dialog with nothing saved, returns focus to the tile and stays closed when enabled again", () => {
		const set = vi.fn();
		const { rerender } = withDialogs(
			<SignaturePad signature="" setSignature={set} />,
		);
		const activator = screen.getByRole("button");
		activator.focus();
		fireEvent.click(activator);
		expect(dialog()).toBeInTheDocument();
		pad.empty = false;
		rerender(
			<DialogContextProvider>
				<SignaturePad signature="" setSignature={set} disabled />
			</DialogContextProvider>,
		);
		expect(
			screen.queryByRole("dialog"),
			"the dialog of a disabled pad",
		).toBeNull();
		expect(set).not.toHaveBeenCalled();
		expect(document.activeElement, "focus after the dialog closed").toBe(
			activator,
		);
		rerender(
			<DialogContextProvider>
				<SignaturePad signature="" setSignature={set} />
			</DialogContextProvider>,
		);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("[ISSUE-3467-ITEM-10] contexts around the pad reach its dialog: a theme's CcSignPadDialog defaults", () => {
		const theme = createTheme({
			components: { CcSignPadDialog: { defaultProps: { penColor: "green" } } },
		});
		withDialogs(
			<ThemeProvider theme={theme}>
				<SignaturePad signature="" />
			</ThemeProvider>,
		);
		openPad();
		expect(lastPadProps().options).toEqual({ penColor: "green" });
	});

	it("[ISSUE-3467-ITEM-10] the Clear confirmation closes with its pad too", async () => {
		const Host = () => {
			const [show, setShow] = useState(true);
			return (
				<>
					<button onClick={() => setShow(false)}>hide</button>
					{show && <SignaturePad signature={SIG} />}
				</>
			);
		};
		withDialogs(<Host />);
		openPad();
		fireEvent.click(button("Clear signature"));
		await screen.findByRole("dialog", { name: "Clear signature" });
		fireEvent.click(screen.getByText("hide"));
		await waitFor(() =>
			expect(document.querySelector('[class*="CcSignPad-root"]')).toBeNull(),
		);
		expect(
			document.querySelectorAll('[role="dialog"]'),
			"dialogs left open after the pad unmounted",
		).toHaveLength(0);
	});

	it("[ISSUE-3467-ITEM-10] needs no DialogContextProvider: the dialog and its Clear confirmation render from the pad", async () => {
		const set = vi.fn();
		render(<SignaturePad signature={SIG} setSignature={set} />);
		openPad();
		fireEvent.click(button("Clear signature"));
		const confirm = await screen.findByRole("dialog", {
			name: "Clear signature",
		});
		fireEvent.click(within(confirm).getByRole("button", { name: "Yes" }));
		await waitFor(() => expect(canvasIn(dialog())).not.toBeNull());
		fireEvent.click(button("Save Changes"));
		expect(set).toHaveBeenCalledExactlyOnceWith("");
		expect(screen.queryByRole("dialog")).toBeNull();
	});
});

describe("SignDialog backdrop clicks", () => {
	beforeEach(() => {
		// only performance.now(), which dates the dialog's opening; MUI's timers stay real
		vi.useFakeTimers({ toFake: ["performance"] });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	/** a click on the container around the dialog box; MUI closes when mousedown and click both land there */
	const clickBackdrop = (detail = 1) => {
		const container = document.querySelector(".MuiDialog-container");
		if (!container) throw new Error("dialog container missing");
		fireEvent.mouseDown(container, { detail });
		fireEvent.click(container, { detail });
	};

	it("[ISSUE-3467-ITEM-7] a backdrop click right after opening, the second click of a double-click on the tile, keeps the dialog open; a later one closes it without saving", () => {
		const set = vi.fn();
		withDialogs(<SignaturePad signature="" setSignature={set} />);
		openPad();
		vi.advanceTimersByTime(100);
		clickBackdrop();
		expect(
			screen.queryByRole("dialog"),
			"the dialog after a backdrop click 100ms after opening",
		).toBeInTheDocument();
		vi.advanceTimersByTime(500);
		clickBackdrop();
		expect(
			screen.queryByRole("dialog"),
			"the dialog after a backdrop click 600ms after opening",
		).toBeNull();
		expect(set).not.toHaveBeenCalled();
	});

	it("[ISSUE-3467-ITEM-7] a backdrop click the browser counts as the second click of a double-click keeps the dialog open also later, on a slow double-click", () => {
		withDialogs(<SignaturePad signature="" />);
		openPad();
		vi.advanceTimersByTime(2000);
		clickBackdrop(2);
		expect(
			screen.queryByRole("dialog"),
			"the dialog after a backdrop click with detail 2",
		).toBeInTheDocument();
		clickBackdrop(1);
		expect(
			screen.queryByRole("dialog"),
			"the dialog after a single backdrop click",
		).toBeNull();
	});

	it("[ISSUE-3467-ITEM-7] a pushed SignDialog keeps ignoring the second click of the double-click that opened it, and closes on a later backdrop click", () => {
		withDialogs(<Opener signature="" />);
		fireEvent.click(screen.getByText("open"));
		clickBackdrop();
		expect(screen.queryByRole("dialog")).toBeInTheDocument();
		vi.advanceTimersByTime(600);
		clickBackdrop();
		expect(screen.queryByRole("dialog")).toBeNull();
	});
});
