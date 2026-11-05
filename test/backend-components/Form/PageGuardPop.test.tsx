import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect } from "vitest";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
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
	makeDirty,
	makePeopleModel,
	PeopleModel,
	setupPageTests,
	TestCustomProps,
	wait,
} from "./pageFixture";

// Browser Back is a POP navigation, which only a browser history reverts and retries
// asynchronously; this file uses jsdom's window history, so it stays on its own.
setupPageTests();

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
});
