import "@testing-library/jest-dom/vitest";
import React, { useEffect, useState } from "react";
import { describe, it, expect, vi } from "vitest";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Framework, useDialogContext } from "../../../src/framework";
import {
	FrameworkHistory,
	setFrameworkHistory,
} from "../../../src/framework/History";
import Form, {
	PageProps,
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import BasicFormPage, {
	BasicFormPageRendererProps,
	EnhancedCustomProps,
} from "../../../src/backend-components/Form/BasicFormPage";
import { ModelUnknown } from "../../../src/backend-integration";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import FormDialog from "../../../src/backend-components/Form/FormDialog";
import Routes from "../../../src/standalone/Routes/Routes";
import Route from "../../../src/standalone/Routes/Route";
import {
	backButton,
	findLeavePrompt,
	holdUpdates,
	LOAD,
	leavePrompts,
	makeDirty,
	makePage,
	makePeopleModel,
	mountDialogPage,
	mountPage,
	PeopleModel,
	saveButton,
	setupPageTests,
	TestCustomProps,
	unloadIsBlocked,
	wait,
} from "./pageFixture";

setupPageTests();

const FieldPage = makePage();

/**
 * Pushes a location and lets the blockers and the dialogs they push render
 */
const navigate = async (to: string) => {
	act(() => FrameworkHistory.push(to));
	await act(async () => {});
};

/**
 * Mounts the field page in a Form (record "1") as the element of a Route with this path,
 * under a memory history at the start location
 * @returns The history
 */
const mountRoutedPage = (path: string, start: string) => {
	const history = createMemoryHistory({ initialEntries: [start] });
	setFrameworkHistory(history);
	render(
		<Framework>
			<Routes>
				{[
					<Route
						key="page"
						path={path}
						element={
							<Form
								model={makePeopleModel()}
								id={"1"}
								errorComponent={DefaultErrorComponent}
								customProps={{ goBack: () => {} }}
							>
								{FieldPage}
							</Form>
						}
					/>,
				]}
			</Routes>
		</Framework>,
	);
	return history;
};

describe("Form page leave guard", () => {
	it("[ISSUE-3503-ITEM-2] leaving a routed record for one whose path starts the same (/rec/1 → /rec/10) asks first", async () => {
		const history = createMemoryHistory({ initialEntries: ["/rec/1"] });
		setFrameworkHistory(history);
		render(
			<Framework>
				<Routes>
					{[
						<Route
							key="rec"
							path="/rec/1/*"
							element={
								<Form
									model={makePeopleModel()}
									id={"1"}
									errorComponent={DefaultErrorComponent}
									customProps={{ goBack: () => {} }}
								>
									{FieldPage}
								</Form>
							}
						/>,
						<Route key="ten" path="/rec/10" element={<div>RECORD 10</div>} />,
					]}
				</Routes>
			</Framework>,
		);
		await makeDirty();
		await navigate("/rec/10");
		expect(screen.queryByText("RECORD 10")).toBeNull();
		expect(history.location.pathname).toBe("/rec/1");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-2] a record page on a :id/* route lets a path below its url through and asks for /rec/12 and /rec/1-archive", async () => {
		const history = mountRoutedPage("/rec/:id/*", "/rec/1");
		await makeDirty();
		await navigate("/rec/1/more");
		expect(history.location.pathname).toBe("/rec/1/more");
		expect(leavePrompts()).toHaveLength(0);
		await navigate("/rec/12");
		expect(history.location.pathname).toBe("/rec/1/more");
		expect(leavePrompts()).toHaveLength(1);
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		await navigate("/rec/1-archive");
		expect(history.location.pathname).toBe("/rec/1/more");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-2] a form page on the root route / asks before leaving it", async () => {
		const history = mountRoutedPage("/", "/");
		await makeDirty();
		await navigate("/other");
		expect(history.location.pathname).toBe("/");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-2] a form page on a route that renders at every path (/*) keeps its edit on a navigation, without asking", async () => {
		const history = mountRoutedPage("/*", "/page");
		await makeDirty();
		await navigate("/other");
		expect(history.location.pathname).toBe("/other");
		expect(leavePrompts()).toHaveLength(0);
		expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();
	});

	it("[ISSUE-3503-ITEM-3] a dirty form in a FullFormDialog: leaving gives one prompt or one alert, not both", async () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		const { open } = mountDialogPage(FieldPage);
		const input = await open();
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());
		await navigate("/other");
		await wait(20);
		expect(
			alert.mock.calls.length + leavePrompts().length,
			`alerts: ${alert.mock.calls.length}, leave prompts: ${leavePrompts().length}`,
		).toBe(1);
	});

	it("[ISSUE-3503-ITEM-3] two dirty form pages, one inside the other: leaving asks once", async () => {
		const InnerPage = makePage();
		const Inner = () => (
			<Form
				model={makePeopleModel()}
				id={"2"}
				errorComponent={DefaultErrorComponent}
				customProps={{ goBack: () => {} }}
				disableRouting
			>
				{InnerPage}
			</Form>
		);
		const OuterPage = makePage({}, <Inner />);
		mountPage(OuterPage);
		const outer = await screen.findByDisplayValue("Alice", undefined, LOAD);
		const inner = await screen.findByDisplayValue("Bob", undefined, LOAD);
		fireEvent.change(outer, { target: { value: "AliceX" } });
		fireEvent.change(inner, { target: { value: "BobX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());
		await wait(20);
		await navigate("/other");
		await findLeavePrompt();
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-3] two dirty form pages, one inside the other: after No both stay guarded, after Yes the page is left", async () => {
		const InnerPage = makePage();
		const innerModel = makePeopleModel();
		const Inner = () => (
			<Form
				model={innerModel}
				id={"2"}
				errorComponent={DefaultErrorComponent}
				customProps={{ goBack: () => {} }}
				disableRouting
			>
				{InnerPage}
			</Form>
		);
		const { history } = mountPage(makePage({}, <Inner />));
		const outer = await screen.findByDisplayValue("Alice", undefined, LOAD);
		const inner = await screen.findByDisplayValue("Bob", undefined, LOAD);
		fireEvent.change(outer, { target: { value: "AliceX" } });
		fireEvent.change(inner, { target: { value: "BobX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());

		await navigate("/other");
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		expect(history.location.pathname).toBe("/page");

		// the outer form is clean again, the inner one still has its edit
		fireEvent.change(outer, { target: { value: "Alice" } });
		await navigate("/other");
		expect(history.location.pathname, "the inner edit is guarded").toBe(
			"/page",
		);
		expect(leavePrompts()).toHaveLength(1);
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(history.location.pathname).toBe("/other"));
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3503-ITEM-3] a dirty form page and a dirty form in a FullFormDialog opened from it: leaving asks once", async () => {
		const InnerPage = makePage();
		const innerModel = makePeopleModel();
		const DialogForm = () => {
			const [, popDialog] = useDialogContext();
			return (
				<FormDialog dialogTitle={"Inner record"}>
					<Form
						model={innerModel}
						id={"2"}
						errorComponent={DefaultErrorComponent}
						customProps={{ goBack: popDialog }}
						disableRouting
					>
						{InnerPage}
					</Form>
				</FormDialog>
			);
		};
		const PushButton = () => {
			const [pushDialog] = useDialogContext();
			return (
				<button type={"button"} onClick={() => pushDialog(<DialogForm />)}>
					Open inner record
				</button>
			);
		};
		const { history } = mountPage(makePage({}, <PushButton />));
		await makeDirty();
		fireEvent.click(screen.getByRole("button", { name: "Open inner record" }));
		const inner = await screen.findByDisplayValue("Bob", undefined, LOAD);
		fireEvent.change(inner, { target: { value: "BobX" } });
		const dialog = screen.getByRole("dialog", { name: "Inner record" });
		await waitFor(() =>
			expect(
				within(dialog).getByRole("button", { name: "Save" }),
			).toBeEnabled(),
		);

		await navigate("/other");
		await findLeavePrompt();
		expect(leavePrompts()).toHaveLength(1);
		expect(history.location.pathname).toBe("/page");
	});

	it("[ISSUE-3503-ITEM-3] a navigation while the leave prompt is open adds no prompt, and Yes goes where the last one led", async () => {
		const { history } = mountPage(FieldPage);
		await makeDirty();
		await navigate("/first");
		await findLeavePrompt();
		await navigate("/second");
		expect(leavePrompts()).toHaveLength(1);
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(history.location.pathname).toBe("/second"));
		expect(history.index, "one history entry was added").toBe(1);
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3503-ITEM-3] Yes on a navigation that another history blocker stops keeps the form guarded", async () => {
		const { history } = mountPage(FieldPage);
		await makeDirty();
		const unblockOther = history.block(() => {});
		await navigate("/other");
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		expect(history.location.pathname).toBe("/page");

		unblockOther();
		await navigate("/other");
		expect(history.location.pathname).toBe("/page");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-3] Yes in the prompt of the footer's Back keeps the form guarded when goBack stays on the page", async () => {
		const goBack = vi.fn();
		const { history } = mountPage(FieldPage, { goBack });
		await makeDirty();
		fireEvent.click(backButton());
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));

		await navigate("/other");
		expect(history.location.pathname).toBe("/page");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-3] the inner page's Back, confirmed, asks once about the dirty outer page it leaves too; No keeps the inner form guarded", async () => {
		const goToList = () => FrameworkHistory.push("/list");
		const InnerPage = makePage();
		const innerModel = makePeopleModel();
		const Inner = () => (
			<Form
				model={innerModel}
				id={"2"}
				errorComponent={DefaultErrorComponent}
				customProps={{ goBack: goToList }}
				disableRouting
			>
				{InnerPage}
			</Form>
		);
		const { history } = mountPage(makePage({}, <Inner />));
		const outer = await screen.findByDisplayValue("Alice", undefined, LOAD);
		const inner = await screen.findByDisplayValue("Bob", undefined, LOAD);
		fireEvent.change(outer, { target: { value: "AliceX" } });
		fireEvent.change(inner, { target: { value: "BobX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());

		// the outer page's footer is hidden: this is the inner page's Back
		fireEvent.click(backButton());
		const innerPrompt = await findLeavePrompt();
		fireEvent.click(within(innerPrompt).getByRole("button", { name: "Yes" }));
		await waitFor(() => expect(leavePrompts()).not.toContain(innerPrompt));
		await findLeavePrompt();
		expect(leavePrompts(), "the outer page asks").toHaveLength(1);
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		expect(history.location.pathname).toBe("/page");

		// the outer form is clean again, the inner one still has its edit
		fireEvent.change(outer, { target: { value: "Alice" } });
		await navigate("/other");
		expect(history.location.pathname, "the inner edit is guarded").toBe(
			"/page",
		);
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-3] two dirty forms on one routed page: a navigation inside the page adds one history entry", async () => {
		const InnerPage = makePage();
		const innerModel = makePeopleModel();
		const Inner = () => (
			<Form
				model={innerModel}
				id={"2"}
				errorComponent={DefaultErrorComponent}
				customProps={{ goBack: () => {} }}
			>
				{InnerPage}
			</Form>
		);
		const OuterPage = makePage({}, <Inner />);
		const history = createMemoryHistory({ initialEntries: ["/rec/1"] });
		setFrameworkHistory(history);
		render(
			<Framework>
				<Routes>
					{[
						<Route
							key="rec"
							path="/rec/:id/*"
							element={
								<Form
									model={makePeopleModel()}
									id={"1"}
									errorComponent={DefaultErrorComponent}
									customProps={{ goBack: () => {} }}
								>
									{OuterPage}
								</Form>
							}
						/>,
					]}
				</Routes>
			</Framework>,
		);
		const outer = await screen.findByDisplayValue("Alice", undefined, LOAD);
		const inner = await screen.findByDisplayValue("Bob", undefined, LOAD);
		fireEvent.change(outer, { target: { value: "AliceX" } });
		fireEvent.change(inner, { target: { value: "BobX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());

		await navigate("/rec/1/more");
		expect(history.location.pathname).toBe("/rec/1/more");
		expect(history.index, "one history entry was added").toBe(1);
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3503-ITEM-4] a form made dirty by a child's mount effect is guarded", async () => {
		const MarkDirtyOnMount = () => {
			const { setCustomFieldDirty } = useFormContext<ModelUnknown>();
			useEffect(() => {
				setCustomFieldDirty("pending-upload", true);
			}, [setCustomFieldDirty]);
			return null;
		};
		const Page = makePage({}, <MarkDirtyOnMount />);
		const { history } = mountPage(Page);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		await waitFor(() => expect(saveButton()).toBeEnabled());
		expect(unloadIsBlocked(), "closing the tab is not guarded").toBe(true);
		await navigate("/other");
		expect(history.location.pathname).toBe("/page");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3503-ITEM-4] the footer's Back on a form made dirty by a child's mount effect asks first", async () => {
		const MarkDirtyOnMount = () => {
			const { setCustomFieldDirty } = useFormContext<ModelUnknown>();
			useEffect(() => {
				setCustomFieldDirty("pending-upload", true);
			}, [setCustomFieldDirty]);
			return null;
		};
		const Page = makePage({}, <MarkDirtyOnMount />);
		const { goBack } = mountPage(Page);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
		fireEvent.click(backButton());
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		expect(goBack).not.toHaveBeenCalled();
	});

	it("[ISSUE-3503-ITEM-4] a form page that mounts on a dirty form which a child's mount effect makes clean is left without asking", async () => {
		const PendingUpload = () => {
			const { setCustomFieldDirty } = useFormContext<ModelUnknown>();
			// a control which drops its pending changes when it mounts again
			useEffect(() => {
				setCustomFieldDirty("pending-upload", false);
			}, [setCustomFieldDirty]);
			return (
				<button
					type={"button"}
					onClick={() => setCustomFieldDirty("pending-upload", true)}
				>
					Add pending upload
				</button>
			);
		};
		const InnerPage = makePage({}, <PendingUpload />);
		const Page = (props: PageProps<PeopleModel, TestCustomProps>) => {
			const [shown, setShown] = useState(true);
			return (
				<>
					<button type={"button"} onClick={() => setShown((prev) => !prev)}>
						Toggle page
					</button>
					{shown && <InnerPage {...props} />}
				</>
			);
		};
		const { goBack, history } = mountPage(Page);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.click(screen.getByRole("button", { name: "Add pending upload" }));
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
		fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));
		await waitFor(() => expect(screen.queryByDisplayValue("Alice")).toBeNull());
		// the page mounts on the dirty form, and the control's mount effect makes it clean
		fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));
		await screen.findByDisplayValue("Alice");
		await waitFor(() =>
			expect(saveButton()).toHaveAttribute("aria-disabled", "true"),
		);
		expect(unloadIsBlocked(), "closing the tab is guarded").toBe(false);
		fireEvent.click(backButton());
		await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
		expect(leavePrompts()).toHaveLength(0);
		await navigate("/other");
		expect(history.location.pathname).toBe("/other");
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3500-ITEM-24] a form page on a route /rec/* asks before a path that an entry listed before it takes over (/rec/new)", async () => {
		const history = createMemoryHistory({ initialEntries: ["/rec"] });
		setFrameworkHistory(history);
		render(
			<Framework>
				<Routes>
					{[
						<Route key="new" path="/rec/new" element={<div>NEW RECORD</div>} />,
						<Route
							key="rec"
							path="/rec/*"
							element={
								<Form
									model={makePeopleModel()}
									id={"1"}
									errorComponent={DefaultErrorComponent}
									customProps={{ goBack: () => {} }}
								>
									{FieldPage}
								</Form>
							}
						/>,
					]}
				</Routes>
			</Framework>,
		);
		await makeDirty();
		await navigate("/rec/more");
		expect(history.location.pathname).toBe("/rec/more");
		expect(leavePrompts()).toHaveLength(0);
		await navigate("/rec/new");
		expect(screen.queryByText("NEW RECORD")).toBeNull();
		expect(history.location.pathname).toBe("/rec/more");
		expect(leavePrompts()).toHaveLength(1);
		expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();
	});

	it("[ISSUE-3500-ITEM-5] a disableRouting form in the catch-all entry of a page's Routes keeps its edit below the page, and asks before another entry takes over", async () => {
		const history = createMemoryHistory({ initialEntries: ["/account"] });
		setFrameworkHistory(history);
		const accountPages = (
			<Routes>
				{[
					<Route
						key="security"
						path="security/*"
						element={<div>SECURITY PAGE</div>}
					/>,
					<Route
						key="profile"
						path="*"
						element={
							<Form
								model={makePeopleModel()}
								id={"1"}
								errorComponent={DefaultErrorComponent}
								customProps={{ goBack: () => {} }}
								disableRouting
							>
								{FieldPage}
							</Form>
						}
					/>,
				]}
			</Routes>
		);
		render(
			<Framework>
				<Routes>
					{[
						<Route key="account" path="/account/*" element={accountPages} />,
						<Route key="other" path="/other" element={<div>OTHER PAGE</div>} />,
					]}
				</Routes>
			</Framework>,
		);
		await makeDirty();
		await navigate("/account/details");
		expect(history.location.pathname).toBe("/account/details");
		expect(leavePrompts()).toHaveLength(0);
		expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();

		await navigate("/account/security");
		expect(screen.queryByText("SECURITY PAGE")).toBeNull();
		expect(history.location.pathname).toBe("/account/details");
		expect(leavePrompts()).toHaveLength(1);
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));

		await navigate("/other");
		expect(screen.queryByText("OTHER PAGE")).toBeNull();
		expect(history.location.pathname).toBe("/account/details");
		expect(leavePrompts()).toHaveLength(1);
	});
});

describe("Form page leave guard while the form saves", () => {
	/**
	 * Makes the page dirty, clicks Save and waits until the form is read-only for the save
	 */
	const startSave = async () => {
		const input = await makeDirty();
		fireEvent.click(saveButton());
		await waitFor(() => expect(input).toBeDisabled());
	};

	it("[ISSUE-3473-ITEM-4] a navigation during a save asks and closing the tab is blocked; after No, a failed save is shown and the page stays guarded", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const model = makePeopleModel();
		const updates = holdUpdates(model);
		const { history } = mountPage(FieldPage, { model });
		await startSave();

		expect(unloadIsBlocked(), "closing the tab is not guarded").toBe(true);
		await navigate("/other");
		expect(history.location.pathname).toBe("/page");
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));

		updates.fail(new Error("Server said no"));
		const error = await screen.findByRole("dialog", { name: /error/i });
		expect(error).toHaveTextContent("Server said no");
		fireEvent.click(within(error).getByRole("button"));
		await waitFor(() =>
			expect(screen.getByDisplayValue("AliceX")).toBeEnabled(),
		);
		expect(unloadIsBlocked()).toBe(true);
		await navigate("/other");
		expect(history.location.pathname).toBe("/page");
		expect(leavePrompts()).toHaveLength(1);
	});

	it("[ISSUE-3473-ITEM-4] a successful save releases the guards it kept while it was pending", async () => {
		const model = makePeopleModel();
		const updates = holdUpdates(model);
		const { history } = mountPage(FieldPage, { model });
		await startSave();
		expect(unloadIsBlocked()).toBe(true);

		updates.release();
		await waitFor(() =>
			expect(screen.getByDisplayValue("AliceX")).toBeEnabled(),
		);
		expect(unloadIsBlocked()).toBe(false);
		await navigate("/other");
		expect(history.location.pathname).toBe("/other");
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3473-ITEM-4] the footer's goBack asks while the form saves", async () => {
		const Footer = (
			p: BasicFormPageRendererProps<EnhancedCustomProps<TestCustomProps>>,
		) => (
			<>
				<button type={"button"} onClick={() => void p.safeSubmit()}>
					Save
				</button>
				<button type={"button"} onClick={() => void p.customProps.goBack()}>
					Close
				</button>
			</>
		);
		const Page = (props: PageProps<PeopleModel, TestCustomProps>) => (
			<BasicFormPage
				{...props}
				form={<FormField name="first_name" />}
				childrenProps={{}}
			>
				{Footer}
			</BasicFormPage>
		);
		const model = makePeopleModel();
		const updates = holdUpdates(model);
		const { goBack } = mountPage(Page, { model });
		await startSave();

		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		expect(goBack).not.toHaveBeenCalled();

		updates.release();
		await waitFor(() =>
			expect(screen.getByDisplayValue("AliceX")).toBeEnabled(),
		);
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3473-ITEM-4] a form that is read-only for another reason takes no guard, also while it is busy", async () => {
		const Controls = () => {
			const { setFieldValue, addBusyReason } = useFormContext<ModelUnknown>();
			return (
				<>
					<button
						type={"button"}
						onClick={() => setFieldValue("first_name", "Changed")}
					>
						Change from code
					</button>
					<button type={"button"} onClick={() => addBusyReason("test")}>
						Get busy
					</button>
				</>
			);
		};
		const Page = makePage({}, <Controls />);
		const { history } = mountPage(Page, {
			formProps: { readOnlyReasons: { permission: "No permission" } },
		});
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.click(screen.getByRole("button", { name: "Change from code" }));
		await screen.findByDisplayValue("Changed");
		fireEvent.click(screen.getByRole("button", { name: "Get busy" }));
		await screen.findByRole("progressbar");

		expect(unloadIsBlocked()).toBe(false);
		await navigate("/other");
		expect(history.location.pathname).toBe("/other");
		expect(leavePrompts()).toHaveLength(0);
	});
});

describe("Form page leave guard: Yes leaves", () => {
	it("[ISSUE-3475-ITEM-21] a navigation out of a dirty form in a FullFormDialog asks first: No keeps the dialog open, Yes goes there and closes it", async () => {
		const { open, history } = mountDialogPage(FieldPage);
		const input = await open();
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());

		await navigate("/elsewhere");
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "No" }),
		);
		await waitFor(() => expect(leavePrompts()).toHaveLength(0));
		expect(history.location.pathname).toBe("/page");
		// the prompt's modal hides the page from assistive technology until its exit ends
		await waitFor(() =>
			expect(
				screen.getByRole("dialog", { name: "Edit person" }),
			).toContainElement(screen.getByDisplayValue("AliceX")),
		);

		await navigate("/elsewhere");
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(history.location.pathname).toBe("/elsewhere"));
		await waitFor(() => expect(screen.queryAllByRole("dialog")).toEqual([]));
	});

	it("[ISSUE-3497-ITEM-2] Yes in the prompt of a link out of a dirty routed form page goes there", async () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		const history = mountRoutedPage("/rec/:id/*", "/rec/1");
		await makeDirty();
		await navigate("/elsewhere");
		expect(history.location.pathname).toBe("/rec/1");
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(history.location.pathname).toBe("/elsewhere"));
		expect(alert).not.toHaveBeenCalled();
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3497-ITEM-2] Yes in the prompt of the footer's Back on a dirty form page runs goBack, which may navigate", async () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		const goBack = vi.fn(() => FrameworkHistory.push("/list"));
		const { history } = mountPage(FieldPage, { goBack });
		await makeDirty();
		fireEvent.click(backButton());
		fireEvent.click(
			within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
		);
		await waitFor(() => expect(history.location.pathname).toBe("/list"));
		expect(goBack).toHaveBeenCalledTimes(1);
		expect(alert).not.toHaveBeenCalled();
		expect(leavePrompts()).toHaveLength(0);
	});

	it("[ISSUE-3497-ITEM-2] a form in a FullFormDialog lets a navigation through while it is clean; once dirty it asks and closing the tab is blocked", async () => {
		const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
		const { open, history } = mountDialogPage(FieldPage);
		await open();
		await navigate("/clean");
		expect(history.location.pathname).toBe("/clean");
		expect(leavePrompts()).toHaveLength(0);

		// the navigation closed the dialog (ISSUE-3475-ITEM-21)
		const input = await open();
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());
		expect(unloadIsBlocked(), "closing the tab is not guarded").toBe(true);
		await navigate("/dirty");
		expect(history.location.pathname).toBe("/clean");
		expect(leavePrompts()).toHaveLength(1);
		expect(alert).not.toHaveBeenCalled();
	});
});
