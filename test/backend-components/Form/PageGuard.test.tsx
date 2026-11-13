import "@testing-library/jest-dom/vitest";
import React from "react";
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
import { Framework } from "../../../src/framework";
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
		const input = await open();
		await navigate("/clean");
		expect(history.location.pathname).toBe("/clean");
		expect(leavePrompts()).toHaveLength(0);

		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() => expect(saveButton()).toBeEnabled());
		expect(unloadIsBlocked(), "closing the tab is not guarded").toBe(true);
		await navigate("/dirty");
		expect(history.location.pathname).toBe("/clean");
		expect(leavePrompts()).toHaveLength(1);
		expect(alert).not.toHaveBeenCalled();
	});
});
