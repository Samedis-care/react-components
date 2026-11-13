import "@testing-library/jest-dom/vitest";
import React, { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { computeAccessibleName } from "dom-accessibility-api";
import {
	Framework,
	useCloseThisDialog,
	useDialogContext,
} from "../../../src/framework";
import {
	configureErrorReporting,
	getErrorReportingConfig,
} from "../../../src/framework/ErrorReporting";
import FormDialog, {
	FormDialogDefaultRenderer,
	FormDialogDispatchContext,
	IsInFormDialogContext,
} from "../../../src/backend-components/Form/FormDialog";
import { BasicFormPageNestingContext } from "../../../src/backend-components/Form/BasicFormPage";
import {
	findLeavePrompt,
	leavePrompts,
	makePage,
	mountDialogPage,
	PushOnMount,
	saveButton,
	setupPageTests,
	wait,
} from "./pageFixture";

setupPageTests();

const FieldPage = makePage();

/**
 * A button "Open" that pushes the dialog
 */
const Opener = (props: { dialog: React.ReactNode }) => {
	const [pushDialog] = useDialogContext();
	return (
		<button type={"button"} onClick={() => pushDialog(props.dialog)}>
			Open
		</button>
	);
};

const renderPushed = (
	dialog: React.ReactNode,
	theme?: React.ComponentProps<typeof Framework>["defaultTheme"],
) => {
	const result = render(
		<Framework defaultTheme={theme}>
			<Opener dialog={dialog} />
		</Framework>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Open" }));
	return result;
};

describe("FullFormDialog", () => {
	it("closes on X and calls onClose once", async () => {
		const onClose = vi.fn();
		const { open } = mountDialogPage(FieldPage, { dialogProps: { onClose } });
		await open();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Edit person" })).toBeNull(),
		);
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
	});

	it("on a dirty form, No keeps the dialog and does not call onClose; Yes closes it and calls onClose once", async () => {
		const onClose = vi.fn();
		const { open } = mountDialogPage(FieldPage, { dialogProps: { onClose } });
		const input = await open();
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
		fireEvent.keyDown(screen.getByRole("dialog", { name: "Edit person" }), {
			key: "Escape",
		});
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByDisplayValue("AliceX")).toBe(input);

		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
		expect(screen.queryByRole("dialog", { name: "Edit person" })).toBeNull();
	});

	it("[ISSUE-3503-ITEM-11] a FullFormDialog with onClose={popDialog} closes only itself, not the dialog below it", async () => {
		const Inner = () => {
			const [, popDialog] = useDialogContext();
			return (
				<FormDialog dialogTitle={"Inner"} onClose={popDialog}>
					<div>inner content</div>
				</FormDialog>
			);
		};
		const OpenInner = () => {
			const [pushDialog] = useDialogContext();
			return (
				<button type={"button"} onClick={() => pushDialog(<Inner />)}>
					open inner
				</button>
			);
		};
		renderPushed(
			<FormDialog dialogTitle={"Outer"}>
				<OpenInner />
			</FormDialog>,
		);
		fireEvent.click(await screen.findByRole("button", { name: "open inner" }));
		const inner = await screen.findByRole("dialog", { name: "Inner" });
		fireEvent.click(within(inner).getByRole("button", { name: "Close" }));
		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Inner" })).toBeNull(),
		);
		await wait(20);
		expect(
			screen.queryByRole("dialog", { name: "Outer" }),
			"the outer dialog was closed too",
		).not.toBeNull();
	});

	it("[ISSUE-3503-ITEM-11] a FullFormDialog rendered without pushDialog can be closed", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const onClose = vi.fn();
		render(
			<Framework>
				<FormDialog dialogTitle={"Inline"} onClose={onClose}>
					<div>content</div>
				</FormDialog>
			</Framework>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await wait(20);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3503-ITEM-11] a FullFormDialog rendered without pushDialog closes through onClose and leaves an open pushed dialog alone", async () => {
		const onClose = vi.fn();
		render(
			<Framework>
				<PushOnMount
					dialog={
						<FormDialog dialogTitle={"Pushed"}>
							<div>pushed content</div>
						</FormDialog>
					}
				/>
				<FormDialog dialogTitle={"Inline"} onClose={onClose}>
					<div>inline content</div>
				</FormDialog>
			</Framework>,
		);
		await screen.findByRole("dialog", { name: "Pushed", hidden: true });
		const inline = screen.getByRole("dialog", { name: "Inline", hidden: true });
		fireEvent.click(
			within(inline).getByRole("button", { name: "Close", hidden: true }),
		);
		await wait(20);
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(
			screen.queryByRole("dialog", { name: "Pushed", hidden: true }),
			"the pushed dialog was closed",
		).not.toBeNull();
	});

	it("[ISSUE-3503-ITEM-11] a FullFormDialog rendered without pushDialog inside a pushed one closes only itself", async () => {
		const InlineInside = () => {
			const [open, setOpen] = useState(true);
			return open ? (
				<FormDialog dialogTitle={"Inline"} onClose={() => setOpen(false)}>
					<div>inline content</div>
				</FormDialog>
			) : (
				<div>INLINE CLOSED</div>
			);
		};
		renderPushed(
			<FormDialog dialogTitle={"Outer"}>
				<InlineInside />
			</FormDialog>,
		);
		const inline = await screen.findByRole("dialog", { name: "Inline" });
		fireEvent.click(within(inline).getByRole("button", { name: "Close" }));
		expect(await screen.findByText("INLINE CLOSED")).toBeInTheDocument();
		await wait(20);
		expect(
			screen.queryByRole("dialog", { name: "Outer" }),
			"the outer dialog was closed too",
		).not.toBeNull();
	});

	it("[ISSUE-3503-ITEM-11] a FullFormDialog rendered without pushDialog and without onClose reports that it cannot be closed", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		render(
			<Framework>
				<FormDialog dialogTitle={"Inline"}>
					<div>content</div>
				</FormDialog>
			</Framework>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await wait(20);
		const messages = error.mock.calls.map(([e]) =>
			e instanceof Error ? e.message : String(e),
		);
		expect(
			messages.filter((m) => /FullFormDialog.*onClose/.test(m)),
			"no error that names FullFormDialog and onClose",
		).toHaveLength(1);
		expect(screen.getByRole("dialog", { name: "Inline" })).toBeInTheDocument();
	});

	it("[ISSUE-3503-ITEM-11] a dialog pushed from onClose stays open with its own state, and the FullFormDialog closes", async () => {
		const Named = (props: { name: string; onClose?: () => void }) => (
			<FormDialog dialogTitle={props.name} onClose={props.onClose}>
				<input aria-label={`${props.name} field`} />
			</FormDialog>
		);
		const OpenFirst = () => {
			const [pushDialog] = useDialogContext();
			return (
				<button
					type={"button"}
					onClick={() =>
						pushDialog(
							<Named
								name={"First"}
								onClose={() => pushDialog(<Named name={"Second"} />)}
							/>,
						)
					}
				>
					Open
				</button>
			);
		};
		render(
			<Framework>
				<OpenFirst />
			</Framework>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		const first = await screen.findByRole("dialog", { name: "First" });
		fireEvent.change(within(first).getByRole("textbox"), {
			target: { value: "carry" },
		});
		fireEvent.click(within(first).getByRole("button", { name: "Close" }));
		const second = await screen.findByRole("dialog", { name: "Second" });
		await wait(20);
		expect(screen.queryByRole("dialog", { name: "First" })).toBeNull();
		expect(within(second).getByRole("textbox")).toHaveValue("");
	});

	it("[ISSUE-3503-ITEM-11] an error thrown by onClose is reported, and the dialog still closes", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const before = { ...getErrorReportingConfig() };
		const report = vi.fn();
		configureErrorReporting({ report, shouldReport: () => true });
		try {
			const failure = new Error("onClose failed");
			renderPushed(
				<FormDialog
					dialogTitle={"Failing"}
					onClose={() => {
						throw failure;
					}}
				>
					<div>content</div>
				</FormDialog>,
			);
			const dialog = await screen.findByRole("dialog", { name: "Failing" });
			fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
			await waitFor(() =>
				expect(screen.queryByRole("dialog", { name: "Failing" })).toBeNull(),
			);
			expect(report).toHaveBeenCalledWith(failure, {
				source: "FullFormDialog.onClose",
			});
		} finally {
			configureErrorReporting(before);
		}
	});

	it("[ISSUE-3503-ITEM-11] the content of a pushed FullFormDialog closes it with useCloseThisDialog, without onClose", async () => {
		const onClose = vi.fn();
		const CloseFromContent = () => {
			const close = useCloseThisDialog();
			return (
				<button type={"button"} onClick={close}>
					Done
				</button>
			);
		};
		renderPushed(
			<FormDialog dialogTitle={"Pushed"} onClose={onClose}>
				<CloseFromContent />
			</FormDialog>,
		);
		const dialog = await screen.findByRole("dialog", { name: "Pushed" });
		fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Pushed" })).toBeNull(),
		);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("[ISSUE-3503-ITEM-11] useCloseThisDialog throws in the content of a FullFormDialog rendered without pushDialog", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const CloseFromContent = () => {
			useCloseThisDialog();
			return <div>content</div>;
		};
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
		renderPushed(
			<FormDialog dialogTitle={"Outer"}>
				<FormDialog dialogTitle={"Inline"} onClose={() => {}}>
					<Catch>
						<CloseFromContent />
					</Catch>
				</FormDialog>
			</FormDialog>,
		);
		const inline = await screen.findByRole("dialog", { name: "Inline" });
		expect(await within(inline).findByText(/^caught: /)).toHaveTextContent(
			/useCloseThisDialog/,
		);
	});

	it("[ISSUE-3503-ITEM-15] the FullFormDialog and form page contexts are exported from the package root", async () => {
		const root = (await import("../../../src")) as Record<string, unknown>;
		expect(root.IsInFormDialogContext, "IsInFormDialogContext").toBe(
			IsInFormDialogContext,
		);
		expect(root.FormDialogDispatchContext, "FormDialogDispatchContext").toBe(
			FormDialogDispatchContext,
		);
		expect(root.FormDialogDefaultRenderer, "FormDialogDefaultRenderer").toBe(
			FormDialogDefaultRenderer,
		);
		expect(
			root.BasicFormPageNestingContext,
			"BasicFormPageNestingContext",
		).toBe(BasicFormPageNestingContext);
	}, 90000);

	describe("[ISSUE-3497-ITEM-14] an untitled FullFormDialog", () => {
		const TitleSetter = (props: { title: string }) => {
			const dispatch = React.useContext(FormDialogDispatchContext);
			React.useEffect(() => {
				dispatch?.setTitle(props.title);
			}, [dispatch, props.title]);
			return null;
		};
		const dialog = () => screen.getByRole("dialog");

		it("[ISSUE-3497-ITEM-14] has no heading and is not named by the close button", async () => {
			renderPushed(
				<FormDialog>
					<div>content</div>
				</FormDialog>,
			);
			await screen.findByText("content");
			expect({
				name: computeAccessibleName(dialog()),
				headings: within(dialog()).queryAllByRole("heading").length,
			}).toEqual({ name: "", headings: 0 });
			expect(
				within(dialog()).getByRole("button", { name: "Close" }),
			).toBeInTheDocument();
		});

		it("[ISSUE-3497-ITEM-14] is named by aria-label", async () => {
			renderPushed(
				<FormDialog aria-label={"Pick users"}>
					<div>content</div>
				</FormDialog>,
			);
			await screen.findByText("content");
			expect(dialog()).toHaveAccessibleName("Pick users");
			expect(within(dialog()).queryAllByRole("heading")).toHaveLength(0);
		});

		it("[ISSUE-3497-ITEM-14] a title, from the prop or set by the content, names it instead of aria-label", async () => {
			const { unmount } = renderPushed(
				<FormDialog aria-label={"Pick users"} dialogTitle={"My Title"}>
					<div>content</div>
				</FormDialog>,
			);
			await screen.findByText("content");
			expect(dialog()).toHaveAccessibleName("My Title");
			unmount();
			renderPushed(
				<FormDialog aria-label={"Pick users"}>
					<TitleSetter title={"Set Title"} />
				</FormDialog>,
			);
			await waitFor(() => expect(dialog()).toHaveAccessibleName("Set Title"));
			expect(within(dialog()).getByRole("heading")).toHaveTextContent(
				/^Set Title$/,
			);
		});
	});
});
