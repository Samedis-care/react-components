import "@testing-library/jest-dom/vitest";
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
import {
	render,
	screen,
	cleanup,
	act,
	fireEvent,
} from "@testing-library/react";
import { createMemoryHistory } from "history";
import { setFrameworkHistory } from "../../src/framework/History";
import DialogContextProvider, {
	DialogContextType,
	useDialogContext,
} from "../../src/framework/DialogContextProvider";
import { useCloseThisDialog } from "../../src/framework/PushedDialogCloseContext";
import ccI18n from "../../src/i18n";

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
});
beforeEach(() => {
	setFrameworkHistory(createMemoryHistory());
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

let ctx: DialogContextType;
const Grab = () => {
	ctx = useDialogContext();
	return null;
};
const push = (dialog: React.ReactNode) =>
	act(() => {
		ctx[0](dialog);
	});

const closers: Record<string, () => void> = {};

/**
 * A dialog named `name` with a button that closes it through useCloseThisDialog
 */
const Closable = (props: { name: string }) => {
	const close = useCloseThisDialog();
	closers[props.name] = close;
	return (
		<div role={"dialog"} aria-label={props.name}>
			<button type={"button"} onClick={close}>
				{"Close " + props.name}
			</button>
		</div>
	);
};

/**
 * Shows the message of an error thrown while rendering its children
 */
class Catch extends React.Component<
	{ children: React.ReactNode },
	{ error: Error | null }
> {
	state = { error: null as Error | null };
	static getDerivedStateFromError(error: Error) {
		return { error };
	}
	render() {
		return this.state.error ? (
			<p>{"caught: " + this.state.error.message}</p>
		) : (
			this.props.children
		);
	}
}

describe("useCloseThisDialog", () => {
	it("[ISSUE-3503-ITEM-11] throws outside a dialog shown with pushDialog", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		render(
			<DialogContextProvider>
				<Catch>
					<Closable name={"Inline"} />
				</Catch>
			</DialogContextProvider>,
		);
		expect(screen.getByText(/^caught: /)).toHaveTextContent(
			/useCloseThisDialog.*pushDialog/,
		);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("[ISSUE-3503-ITEM-11] returns a function that closes the dialog it was pushed in, and only that one", () => {
		render(
			<DialogContextProvider>
				<Grab />
			</DialogContextProvider>,
		);
		push(<Closable name={"First"} />);
		push(<Closable name={"Second"} />);
		expect(screen.getAllByRole("dialog")).toHaveLength(2);

		fireEvent.click(screen.getByRole("button", { name: "Close First" }));
		expect(
			screen.queryByRole("dialog", { name: "First" }),
			"the dialog whose close was called is still open",
		).toBeNull();
		expect(
			screen.getByRole("dialog", { name: "Second" }),
			"the dialog pushed after it was closed",
		).toBeInTheDocument();

		// a second call does nothing, also with another dialog open
		act(() => closers.First());
		expect(screen.getByRole("dialog", { name: "Second" })).toBeInTheDocument();
	});

	it("[ISSUE-3503-ITEM-11] is exported from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		expect(root.useCloseThisDialog).toBe(useCloseThisDialog);
	}, 90000);
});
