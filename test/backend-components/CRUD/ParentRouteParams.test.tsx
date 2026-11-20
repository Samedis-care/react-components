/**
 * A routed CRUD under a Route whose path has a param named like CRUD's record param (`id`):
 * the nearest Route's param wins, so the record page gets its own record.
 */
import { describe, expect, it } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Framework } from "../../../src/framework";
import { setFrameworkHistory } from "../../../src/framework/History";
import Routes from "../../../src/standalone/Routes/Routes";
import Route from "../../../src/standalone/Routes/Route";
import useParams from "../../../src/standalone/Routes/useParams";
import type { CrudFormProps } from "../../../src/backend-components/CRUD";
import type { PageProps } from "../../../src/backend-components/Form/Form";
import type { ModelUnknown } from "../../../src/backend-integration";
import {
	ALL,
	crudEl,
	LOAD,
	Page,
	peopleModel,
	SetPerms,
	setupCrudTests,
} from "./crudFixture";

setupCrudTests();

/** shows useParams() as JSON */
const Params = (props: { id: string }) => (
	<div data-testid={props.id}>{JSON.stringify(useParams())}</div>
);

/** the fixture's record page with the params it sees */
const ParamsPage = (props: PageProps<ModelUnknown, CrudFormProps>) => (
	<>
		<Params id={"page-params"} />
		<Page {...props} />
	</>
);

const paramsOf = (id: string) =>
	JSON.parse(screen.getByTestId(id).textContent ?? "null") as Record<
		string,
		string
	>;

describe("routed CRUD under a parent route", () => {
	it("[ISSUE-3475-ITEM-18] opens its own record under a parent route with an :id param", async () => {
		setFrameworkHistory(createMemoryHistory({ initialEntries: ["/t/T1/1"] }));
		render(
			<Framework>
				<SetPerms perms={ALL}>
					<Routes>
						{[
							<Route
								key={"t"}
								path={"/t/:id/*"}
								element={
									<>
										<Params id={"parent-params"} />
										{crudEl(peopleModel(), {}, undefined, ParamsPage)}
									</>
								}
							/>,
						]}
					</Routes>
				</SetPerms>
			</Framework>,
		);
		expect(
			await screen.findByDisplayValue("Alice", undefined, LOAD),
		).toBeInTheDocument();
		expect(screen.getByTestId("form-id").textContent).toBe("1");
		expect(paramsOf("page-params")).toEqual({ id: "1" });
		expect(paramsOf("parent-params")).toEqual({ id: "T1" });
	});
});
