import React from "react";
import {
	describe,
	it,
	expect,
	vi,
	afterEach,
	beforeAll,
	beforeEach,
} from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { setFrameworkHistory } from "../../src/framework/History";
import DialogContextProvider, {
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import ccI18n from "../../src/i18n";

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

const dialog = () => screen.getByRole("dialog");
const button = (name: string) => screen.getByRole("button", { name });

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
