import React, { useState } from "react";
import fs from "node:fs";
import path from "node:path";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
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
import ccI18n from "../../src/i18n";
import { createTheme, ThemeProvider } from "@mui/material";

import SignaturePad from "../../src/non-standalone/SignaturePad/SignaturePad";
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
	await ccI18n.loadNamespaces("translation");
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
