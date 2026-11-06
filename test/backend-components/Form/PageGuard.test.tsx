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
import { createMemoryHistory } from "history";
import { Framework } from "../../../src/framework";
import {
	FrameworkHistory,
	setFrameworkHistory,
} from "../../../src/framework/History";
import Form from "../../../src/backend-components/Form/Form";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import Routes from "../../../src/standalone/Routes/Routes";
import Route from "../../../src/standalone/Routes/Route";
import {
	findLeavePrompt,
	leavePrompts,
	makeDirty,
	makePage,
	makePeopleModel,
	setupPageTests,
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
