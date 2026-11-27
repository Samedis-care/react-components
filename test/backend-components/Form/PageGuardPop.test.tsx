import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect } from "vitest";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Tab } from "@mui/material";
import { createBrowserHistory } from "history";
import { Framework } from "../../../src/framework";
import { setFrameworkHistory } from "../../../src/framework/History";
import Form, { PageProps } from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import Routes from "../../../src/standalone/Routes/Routes";
import Route from "../../../src/standalone/Routes/Route";
import {
	RoutedTabPanelWrapper,
	RoutedTabs,
	useRoutedTabPanel,
} from "../../../src/non-standalone/RoutedTabs";
import {
	findLeavePrompt,
	leavePrompts,
	LOAD,
	makeDirty,
	makePage,
	makePeopleModel,
	PeopleModel,
	saveButton,
	setupPageTests,
	TestCustomProps,
	wait,
} from "./pageFixture";

// Browser Back is a POP navigation, which only a browser history reverts and retries
// asynchronously, and only a browser history keeps its location percent-encoded; this file
// uses jsdom's window history, so it stays on its own.
setupPageTests();

const FieldPage = makePage();

/**
 * Mounts the field page in a Form (record "1") as the element of a Route with this path,
 * under a browser history (jsdom's window history) at the start location
 * @returns The history, and a cleanup that unmounts and restores the window's location
 */
const mountBrowserRoutedPage = (path: string, start: string) => {
	const startUrl = window.location.pathname;
	window.history.replaceState(null, "", start);
	const history = createBrowserHistory();
	setFrameworkHistory(history);
	const { unmount } = render(
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
	const cleanup = async () => {
		unmount();
		await wait(20);
		window.history.replaceState(null, "", startUrl);
	};
	return { history, cleanup };
};

/**
 * A record page with routed tabs inside it (SCF TenantContractForm, IMF RoleForm)
 */
const TabsPage = (props: PageProps<PeopleModel, TestCustomProps>) => {
	const tab = useRoutedTabPanel();
	return (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
		>
			<RoutedTabs aria-label="Record">
				<Tab label="General" value="" />
				<Tab label="More" value="more" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("more", <div>MORE PANEL</div>),
					tab("", <FormField name="first_name" />),
				]}
			</RoutedTabPanelWrapper>
		</DefaultFormPage>
	);
};

describe("Form page leave guard with the browser history", () => {
	it("[ISSUE-3503-ITEM-1] browser Back between two routes inside a dirty form page goes back once and shows the earlier tab", async () => {
		const startUrl = window.location.pathname;
		window.history.replaceState(null, "", "/rec");
		const history = createBrowserHistory();
		setFrameworkHistory(history);
		let pops = 0;
		const onPop = () => pops++;
		const { unmount } = render(
			<Framework>
				<Routes>
					{[
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
									{TabsPage}
								</Form>
							}
						/>,
					]}
				</Routes>
			</Framework>,
		);
		try {
			await makeDirty();
			fireEvent.click(screen.getByRole("tab", { name: "More" }));
			await waitFor(() => expect(window.location.pathname).toBe("/rec/more"));
			expect(screen.getByText("MORE PANEL")).toBeInTheDocument();

			window.addEventListener("popstate", onPop);
			act(() => window.history.back());
			// bounded: while the bug is present, the history keeps reverting and retrying
			// the POP until the page unmounts (finally block)
			await wait(300);
			expect(pops, "popstate events after one browser Back").toBeLessThan(5);
			expect(history.location.pathname).toBe("/rec");
			expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();
		} finally {
			window.removeEventListener("popstate", onPop);
			unmount();
			await wait(20);
			window.history.replaceState(null, "", startUrl);
		}
	});

	it("[ISSUE-3503-ITEM-1] after browser Back and Forward inside a dirty form page, leaving the page still asks", async () => {
		const startUrl = window.location.pathname;
		window.history.replaceState(null, "", "/rec");
		const history = createBrowserHistory();
		setFrameworkHistory(history);
		const { unmount } = render(
			<Framework>
				<Routes>
					{[
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
									{TabsPage}
								</Form>
							}
						/>,
						<Route key="other" path="/other" element={<div>OTHER PAGE</div>} />,
					]}
				</Routes>
			</Framework>,
		);
		try {
			await makeDirty();
			fireEvent.click(screen.getByRole("tab", { name: "More" }));
			await waitFor(() => expect(window.location.pathname).toBe("/rec/more"));

			act(() => window.history.back());
			await waitFor(() => expect(history.location.pathname).toBe("/rec"));
			expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();

			act(() => window.history.forward());
			await waitFor(() => expect(history.location.pathname).toBe("/rec/more"));
			expect(screen.getByText("MORE PANEL")).toBeInTheDocument();

			act(() => history.push("/other"));
			expect(await findLeavePrompt()).toBeInTheDocument();
			expect(history.location.pathname).toBe("/rec/more");
			expect(screen.queryByText("OTHER PAGE")).not.toBeInTheDocument();
		} finally {
			unmount();
			await wait(20);
			window.history.replaceState(null, "", startUrl);
		}
	});

	it("[ISSUE-3503-ITEM-3] browser Back out of a page with two dirty forms asks once, and Yes goes back once", async () => {
		const startUrl = window.location.pathname;
		window.history.replaceState(null, "", "/list");
		const history = createBrowserHistory();
		setFrameworkHistory(history);
		history.push("/rec");
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
		const OuterPage = makePage({}, <Inner />);
		let pops = 0;
		const onPop = () => pops++;
		const { unmount } = render(
			<Framework>
				<Routes>
					{[
						<Route key="list" path="/list" element={<div>LIST PAGE</div>} />,
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
									{OuterPage}
								</Form>
							}
						/>,
					]}
				</Routes>
			</Framework>,
		);
		try {
			const outer = await screen.findByDisplayValue("Alice", undefined, LOAD);
			const inner = await screen.findByDisplayValue("Bob", undefined, LOAD);
			fireEvent.change(outer, { target: { value: "AliceX" } });
			fireEvent.change(inner, { target: { value: "BobX" } });
			await waitFor(() => expect(saveButton()).toBeEnabled());

			window.addEventListener("popstate", onPop);
			act(() => window.history.back());
			const prompt = await findLeavePrompt();
			await wait(20);
			expect(leavePrompts()).toHaveLength(1);
			expect(history.location.pathname).toBe("/rec");

			fireEvent.click(within(prompt).getByRole("button", { name: "Yes" }));
			expect(await screen.findByText("LIST PAGE")).toBeInTheDocument();
			// bounded: a guard that blocks again before the retried POP has arrived reverts it
			await wait(300);
			expect(pops, "popstate events after one browser Back").toBeLessThan(5);
			expect(history.location.pathname).toBe("/list");
			expect(window.location.pathname).toBe("/list");
		} finally {
			window.removeEventListener("popstate", onPop);
			unmount();
			await wait(20);
			window.history.replaceState(null, "", startUrl);
		}
	});

	it("[ISSUE-3503-ITEM-31] a dirty form page at an encoded url (/%C3%BCber/1) lets a navigation to the page written as text (/über/1/tab2) through, and asks before another record", async () => {
		const { history, cleanup } = mountBrowserRoutedPage(
			"/über/:id/*",
			"/%C3%BCber/1",
		);
		try {
			await makeDirty();
			act(() => history.push("/über/1/tab2"));
			await act(async () => {});
			expect(leavePrompts()).toHaveLength(0);
			expect(window.location.pathname).toBe("/%C3%BCber/1/tab2");
			expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();

			act(() => history.push("/über/2"));
			expect(await findLeavePrompt()).toBeInTheDocument();
			expect(window.location.pathname).toBe("/%C3%BCber/1/tab2");
		} finally {
			await cleanup();
		}
	});

	it("[ISSUE-3503-ITEM-31] a dirty form page of an id with a space (/rec/a%20b) lets a path built from the decoded id (/rec/a b/more) through, and asks before another id", async () => {
		const { history, cleanup } = mountBrowserRoutedPage(
			"/rec/:id/*",
			"/rec/a%20b",
		);
		try {
			await makeDirty();
			act(() => history.push("/rec/a b/more"));
			await act(async () => {});
			expect(leavePrompts()).toHaveLength(0);
			expect(window.location.pathname).toBe("/rec/a%20b/more");
			expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();

			act(() => history.push("/rec/a c"));
			expect(await findLeavePrompt()).toBeInTheDocument();
			expect(window.location.pathname).toBe("/rec/a%20b/more");
		} finally {
			await cleanup();
		}
	});
});
