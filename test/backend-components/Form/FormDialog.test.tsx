import "@testing-library/jest-dom/vitest";
import React, { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import {
	act,
	cleanup,
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
	FormDialogRendererProps,
	IsInFormDialogContext,
} from "../../../src/backend-components/Form/FormDialog";
import useSetFormDialogTitle from "../../../src/backend-components/Form/useSetFormDialogTitle";
import useSetFormDialogTitleAction from "../../../src/backend-components/Form/useSetFormDialogTitleAction";
import { BasicFormPageNestingContext } from "../../../src/backend-components/Form/BasicFormPage";
import ccI18n, { langs } from "../../../src/i18n";
import {
	buttonNames,
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

	it("[ISSUE-3503-ITEM-18] the open-in-new action is a named button", () => {
		const link = vi.fn();
		render(
			<Framework>
				<FormDialog dialogTitle={"Edit person"} openInNewLink={link}>
					<div>content</div>
				</FormDialog>
			</Framework>,
		);
		const dialog = screen.getByRole("dialog", { name: /Edit person/ });
		const actions = within(dialog)
			.getAllByRole("button")
			.filter((b) => b.getAttribute("aria-label") !== "Close");
		expect(actions, "no button for the open-in-new action").toHaveLength(1);
		expect(actions[0]).toHaveAccessibleName(/\S/);
		fireEvent.click(actions[0]);
		expect(link).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3503-ITEM-18] the open-in-new button is outside the heading, before the close button, so the dialog is named by its title alone", () => {
		render(
			<Framework>
				<FormDialog dialogTitle={"Edit person"} openInNewLink={() => {}}>
					<div>content</div>
				</FormDialog>
			</Framework>,
		);
		const dialog = screen.getByRole("dialog");
		const button = within(dialog).getByRole("button", {
			name: "Open in new tab",
		});
		// jsdom leaves a button in the heading out of the name, Chromium does not
		const label = document.getElementById(
			dialog.getAttribute("aria-labelledby") ?? "",
		);
		expect({
			name: computeAccessibleName(dialog),
			buttonInLabel: !!label?.contains(button),
			buttons: within(dialog)
				.getAllByRole("button")
				.map((b) => b.getAttribute("aria-label")),
		}).toEqual({
			name: "Edit person",
			buttonInLabel: false,
			buttons: ["Open in new tab", "Close"],
		});
	});

	it("[ISSUE-3503-ITEM-18] without openInNewLink the title row has only the close button", () => {
		render(
			<Framework>
				<FormDialog dialogTitle={"Edit person"}>
					<div>content</div>
				</FormDialog>
			</Framework>,
		);
		expect(
			within(screen.getByRole("dialog"))
				.getAllByRole("button")
				.map((b) => b.getAttribute("aria-label")),
		).toEqual(["Close"]);
	});

	it("[ISSUE-3503-ITEM-18] the open-in-new button calls a link set through the dispatch, without arguments", () => {
		const fromProp = vi.fn();
		const fromDispatch = vi.fn();
		const SetLink = () => {
			const dispatch = React.useContext(FormDialogDispatchContext)!;
			React.useEffect(() => {
				dispatch.setOpenInNewLink(() => fromDispatch);
			}, [dispatch]);
			return null;
		};
		render(
			<Framework>
				<FormDialog dialogTitle={"Edit person"} openInNewLink={fromProp}>
					<SetLink />
				</FormDialog>
			</Framework>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open in new tab" }));
		expect(fromDispatch.mock.calls).toEqual([[]]);
		expect(fromProp).not.toHaveBeenCalled();
	});

	it("[ISSUE-3503-ITEM-18] the open-in-new button is named in the current language", async () => {
		const initial = ccI18n.language;
		try {
			await act(() => ccI18n.changeLanguage("de"));
			render(
				<Framework>
					<FormDialog
						dialogTitle={"Person bearbeiten"}
						openInNewLink={() => {}}
					>
						<div>content</div>
					</FormDialog>
				</Framework>,
			);
			expect(
				await screen.findByRole("button", { name: "In neuem Tab öffnen" }),
			).toBeInTheDocument();
		} finally {
			await act(() => ccI18n.changeLanguage(initial));
		}
	});

	it("[ISSUE-3503-ITEM-18] every locale names the open-in-new button", async () => {
		await ccI18n.loadLanguages(langs);
		const missing = langs.filter(
			(lng) =>
				!ccI18n.getResource(
					lng.split("-")[0],
					"translation",
					"backend-components.form.form-dialog.open-in-new-tab",
				),
		);
		expect(missing, "locales without the name").toEqual([]);
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

	describe("[FOLLOWUP-DIALOG-LATE-TITLE] a title the content sets after the dialog opened", () => {
		/**
		 * A promise and the function that resolves it, inside act
		 */
		const gate = () => {
			let open = () => {};
			const passed = new Promise<void>((resolve) => {
				open = resolve;
			});
			const pass = () =>
				act(async () => {
					open();
					await passed;
				});
			return { passed, pass };
		};
		/**
		 * Content that goes through its steps as the promises resolve, one after the other: a
		 * page that loads (no title, "Loading…"), then shows with its title, set through
		 * useSetFormDialogTitle as a form page does once its record has loaded. With more steps:
		 * the next page loads (no title again), then shows with its own title.
		 */
		const Pages = (props: { steps: Promise<void>[]; titles: string[] }) => {
			const { steps, titles } = props;
			const [step, setStep] = useState(0);
			React.useEffect(() => {
				let mounted = true;
				void steps[step]?.then(() => {
					if (mounted) setStep((prev) => prev + 1);
				});
				return () => {
					mounted = false;
				};
			}, [steps, step]);
			// odd steps show a loaded page
			const title = step % 2 === 1 ? titles[(step - 1) / 2] : null;
			useSetFormDialogTitle(title !== null, title);
			return title ? <p>{title} content</p> : <p>Loading…</p>;
		};
		/**
		 * Resolves in the next animation frame
		 */
		const nextFrame = () =>
			act(
				() =>
					new Promise<void>((resolve) =>
						requestAnimationFrame(() => resolve()),
					),
			);
		/**
		 * Pushes a FullFormDialog with Pages, waits until it has the focus and has been shown
		 * for a frame without a title
		 * @returns The dialog and the gates of its steps
		 */
		const openLoading = async (
			titles: string[],
			dialogProps: Partial<React.ComponentProps<typeof FormDialog>> = {},
		) => {
			const gates = titles.flatMap(() => [gate(), gate()]);
			renderPushed(
				<FormDialog {...dialogProps}>
					<Pages steps={gates.map((g) => g.passed)} titles={titles} />
				</FormDialog>,
			);
			await screen.findByText("Loading…");
			const dialog = screen.getByRole("dialog");
			// MUI's focus trap focuses the dialog (its paper) when it opens
			await waitFor(() => expect(dialog).toHaveFocus());
			await nextFrame();
			return { dialog, gates };
		};

		it("[FOLLOWUP-DIALOG-LATE-TITLE] the focus moves from the dialog to its title once the content sets it, so a screen reader reads the title", async () => {
			const { dialog, gates } = await openLoading(["Edit person"]);
			expect(dialog).toHaveAccessibleName("");
			await gates[0].pass();
			const heading = within(dialog).getByRole("heading", {
				name: "Edit person",
			});
			expect(dialog).toHaveAccessibleName("Edit person");
			expect(heading).toHaveFocus();
			// focusable by script, not a stop of Tab
			expect(heading).toHaveAttribute("tabindex", "-1");
		});

		it("[FOLLOWUP-DIALOG-LATE-TITLE] the title also takes the focus from a dialog named by aria-label", async () => {
			const { dialog, gates } = await openLoading(["Edit person"], {
				"aria-label": "Person",
			});
			expect(dialog).toHaveAccessibleName("Person");
			await gates[0].pass();
			expect(dialog).toHaveAccessibleName("Edit person");
			expect(
				within(dialog).getByRole("heading", { name: "Edit person" }),
			).toHaveFocus();
		});

		it("[FOLLOWUP-DIALOG-LATE-TITLE] a focus the user moved before the title came stays where it is", async () => {
			const { dialog, gates } = await openLoading(["Edit person"]);
			const close = within(dialog).getByRole("button", { name: "Close" });
			act(() => close.focus());
			await gates[0].pass();
			expect(dialog).toHaveAccessibleName("Edit person");
			expect(close).toHaveFocus();
		});

		it("[FOLLOWUP-DIALOG-LATE-TITLE] when the title goes away with the focus on it, the dialog gets the focus, and the next title takes it again", async () => {
			const { dialog, gates } = await openLoading(["Page 1", "Page 2"]);
			await gates[0].pass();
			expect(
				within(dialog).getByRole("heading", { name: "Page 1" }),
			).toHaveFocus();
			// the next page loads: no title, the heading is gone
			await gates[1].pass();
			expect(within(dialog).queryByRole("heading")).toBeNull();
			expect(dialog, "the focus fell to the page").toHaveFocus();
			await nextFrame();
			await gates[2].pass();
			expect(
				within(dialog).getByRole("heading", { name: "Page 2" }),
			).toHaveFocus();
		});

		it("[FOLLOWUP-DIALOG-LATE-TITLE] a dialog that opens with its title keeps the focus on itself, as MUI's Dialog does", async () => {
			const { unmount } = renderPushed(
				<FormDialog dialogTitle={"Edit person"}>
					<p>content</p>
				</FormDialog>,
			);
			const titled = await screen.findByRole("dialog", { name: "Edit person" });
			await waitFor(() => expect(titled).toHaveFocus());
			await nextFrame();
			expect(titled).toHaveFocus();
			unmount();

			// a title the content sets as it mounts shows before the dialog is first drawn
			const TitleOnMount = () => {
				useSetFormDialogTitle(true, "Set Title");
				return <p>content</p>;
			};
			renderPushed(
				<FormDialog>
					<TitleOnMount />
				</FormDialog>,
			);
			const setByContent = await screen.findByRole("dialog", {
				name: "Set Title",
			});
			await waitFor(() => expect(setByContent).toHaveFocus());
			await nextFrame();
			expect(setByContent).toHaveFocus();
		});

		it("[FOLLOWUP-DIALOG-LATE-TITLE] a dialog that never gets a title keeps the focus on itself and its aria-label", async () => {
			const { dialog } = await openLoading([], { "aria-label": "Pick users" });
			await nextFrame();
			expect(dialog).toHaveFocus();
			expect(dialog).toHaveAccessibleName("Pick users");
		});
	});
});

describe("[FOLLOWUP-DIALOG-TITLE-ACTION] controls the content sets in the title row", () => {
	const editMore = (
		<>
			<button type={"button"} aria-label={"Edit"} />
			<button type={"button"} aria-label={"More"} />
		</>
	);
	const help = <button type={"button"} aria-label={"Help"} />;

	/**
	 * Content that sets the title and the title-row controls, as a page that can open as a page
	 * or in a dialog does
	 */
	const Content = (props: {
		title?: string;
		action: React.ReactNode;
		enabled?: boolean;
		report?: (inDialog: boolean) => void;
	}) => {
		const { title, action, enabled, report } = props;
		useSetFormDialogTitle(!!title, title);
		const inDialog = useSetFormDialogTitleAction(enabled ?? true, action);
		report?.(inDialog);
		return <p>content</p>;
	};

	/**
	 * The names of the dialog's buttons, in DOM order
	 */
	const dialogButtons = () => buttonNames(screen.getByRole("dialog"));

	/**
	 * The element the dialog's aria-labelledby points at
	 */
	const dialogLabel = () =>
		document.getElementById(
			screen.getByRole("dialog").getAttribute("aria-labelledby") ?? "",
		);

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] shows them after the title, before Open in new tab and Close, outside the heading, so the title alone names the dialog", async () => {
		render(
			<Framework>
				<FormDialog openInNewLink={() => {}}>
					<Content title={"Edit person"} action={editMore} />
				</FormDialog>
			</Framework>,
		);
		const dialog = await screen.findByRole("dialog", { name: "Edit person" });
		const edit = within(dialog).getByRole("button", { name: "Edit" });
		// jsdom leaves a button in the heading out of the name, Chromium does not
		expect({
			name: computeAccessibleName(dialog),
			heading: within(dialog).getByRole("heading").textContent,
			actionInLabel: !!dialogLabel()?.contains(edit),
			buttons: dialogButtons(),
		}).toEqual({
			name: "Edit person",
			heading: "Edit person",
			actionInLabel: false,
			buttons: ["Edit", "More", "Open in new tab", "Close"],
		});
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] they go away when the content passes enabled=false or unmounts", async () => {
		const Dialog = (props: { mounted: boolean; enabled: boolean }) => (
			<Framework>
				<FormDialog dialogTitle={"Edit person"}>
					{props.mounted && (
						<Content action={editMore} enabled={props.enabled} />
					)}
				</FormDialog>
			</Framework>
		);
		const { rerender } = render(<Dialog mounted enabled />);
		await screen.findByRole("button", { name: "Edit" });
		rerender(<Dialog mounted enabled={false} />);
		expect(dialogButtons(), "enabled=false").toEqual(["Close"]);
		rerender(<Dialog mounted enabled />);
		expect(dialogButtons()).toEqual(["Edit", "More", "Close"]);
		rerender(<Dialog mounted={false} enabled />);
		expect(dialogButtons(), "unmounted").toEqual(["Close"]);
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] new controls replace the old ones", async () => {
		const Dialog = (props: { action: React.ReactNode }) => (
			<Framework>
				<FormDialog dialogTitle={"Edit person"}>
					<Content action={props.action} />
				</FormDialog>
			</Framework>
		);
		const { rerender } = render(<Dialog action={editMore} />);
		await screen.findByRole("button", { name: "Edit" });
		rerender(<Dialog action={help} />);
		expect(dialogButtons()).toEqual(["Help", "Close"]);
		rerender(<Dialog action={null} />);
		expect(dialogButtons(), "null").toEqual(["Close"]);
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] the titleAction prop shows them too; the content's win over it until they go away", async () => {
		const Dialog = (props: { mounted: boolean }) => (
			<Framework>
				<FormDialog dialogTitle={"Edit person"} titleAction={help}>
					{props.mounted && <Content action={editMore} />}
				</FormDialog>
			</Framework>
		);
		const { rerender } = render(<Dialog mounted={false} />);
		expect(dialogButtons(), "prop only").toEqual(["Help", "Close"]);
		rerender(<Dialog mounted />);
		await screen.findByRole("button", { name: "Edit" });
		expect(dialogButtons(), "content").toEqual(["Edit", "More", "Close"]);
		rerender(<Dialog mounted={false} />);
		expect(dialogButtons(), "content gone").toEqual(["Help", "Close"]);
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] the hook reports whether the controls went to a dialog, and sets nothing when disabled", async () => {
		const reports: boolean[] = [];
		const report = (inDialog: boolean) => reports.push(inDialog);
		render(<Content action={editMore} report={report} />);
		expect(reports.at(-1), "outside a dialog").toBe(false);
		expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
		cleanup();
		render(
			<Framework>
				<FormDialog dialogTitle={"Edit person"}>
					<Content action={editMore} enabled={false} report={report} />
				</FormDialog>
			</Framework>,
		);
		await screen.findByText("content");
		expect(reports.at(-1), "disabled").toBe(false);
		expect(dialogButtons()).toEqual(["Close"]);
		cleanup();
		render(
			<Framework>
				<FormDialog dialogTitle={"Edit person"}>
					<Content action={editMore} report={report} />
				</FormDialog>
			</Framework>,
		);
		await screen.findByRole("button", { name: "Edit" });
		expect(reports.at(-1), "in a dialog").toBe(true);
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] a custom renderer gets them as titleAction", async () => {
		const Renderer = (props: FormDialogRendererProps) => (
			<div role={"dialog"} aria-label={"Custom"}>
				<div data-testid={"row"}>{props.titleAction}</div>
				{props.children}
			</div>
		);
		render(
			<Framework>
				<FormDialog renderer={Renderer}>
					<Content action={editMore} />
				</FormDialog>
			</Framework>,
		);
		const row = await screen.findByTestId("row");
		expect(buttonNames(row)).toEqual(["Edit", "More"]);
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] when a control holding the focus goes away, the dialog gets the focus, rather than the page", async () => {
		const Dialog = (props: { action: React.ReactNode }) => (
			<Framework>
				<FormDialog dialogTitle={"Edit person"}>
					<Content action={props.action} />
				</FormDialog>
			</Framework>
		);
		const { rerender } = render(<Dialog action={editMore} />);
		const edit = await screen.findByRole("button", { name: "Edit" });
		act(() => edit.focus());
		expect(edit).toHaveFocus();
		// the content sets other controls, e.g. after Edit switched it to another mode
		rerender(<Dialog action={help} />);
		expect(
			screen.getByRole("dialog"),
			"the focus fell to the page",
		).toHaveFocus();
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] when the Open in new tab button goes away with the focus on it, the dialog gets the focus", async () => {
		const SetLink = (props: { link: boolean }) => {
			const dispatch = React.useContext(FormDialogDispatchContext)!;
			React.useEffect(() => {
				if (!props.link) return;
				dispatch.setOpenInNewLink(() => () => {});
				return () => dispatch.setOpenInNewLink(null);
			}, [dispatch, props.link]);
			return null;
		};
		const Dialog = (props: { link: boolean }) => (
			<Framework>
				<FormDialog dialogTitle={"Edit person"}>
					<SetLink link={props.link} />
				</FormDialog>
			</Framework>
		);
		const { rerender } = render(<Dialog link />);
		const button = await screen.findByRole("button", {
			name: "Open in new tab",
		});
		act(() => button.focus());
		rerender(<Dialog link={false} />);
		expect(
			screen.queryByRole("button", { name: "Open in new tab" }),
		).toBeNull();
		expect(
			screen.getByRole("dialog"),
			"the focus fell to the page",
		).toHaveFocus();
	});

	it("[FOLLOWUP-DIALOG-TITLE-ACTION] the hook is exported from the package root", async () => {
		const root = (await import("../../../src")) as Record<string, unknown>;
		expect(root.useSetFormDialogTitleAction).toBe(useSetFormDialogTitleAction);
	}, 90000);
});
