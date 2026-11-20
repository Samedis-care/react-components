/**
 * What CRUD derives from the permissions: the BackendDataGrid props (Delete, Export,
 * Edit/View, New, Import), the record form's read-only reason, and the routed views'
 * forbidden page.
 */
import { describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { CrudProps } from "../../../src/backend-components/CRUD";
import type { ModelUnknown } from "../../../src/backend-integration";
import {
	ALL,
	CP,
	crudEl,
	lastGrid,
	LOAD,
	peopleModel,
	renderPlain,
	setupCrudTests,
} from "./crudFixture";

setupCrudTests();

type GridProps = CrudProps<ModelUnknown>["gridProps"];

/**
 * Mounts a disableRouting CRUD with the permissions and waits for the stub grid
 * @returns The stub grid's latest props
 */
const gridPropsFor = async (
	perms: string[],
	extra: CP = {},
	withPage = true,
) => {
	renderPlain(
		crudEl(
			peopleModel(),
			{ disableRouting: true, ...extra },
			undefined,
			withPage ? undefined : false,
		),
		perms,
	);
	await screen.findByTestId("grid", undefined, LOAD);
	return lastGrid();
};

describe("the grid's New", () => {
	it("[ISSUE-3507-ITEM-1] without a record page, a function onAddNew still gives the grid its New", async () => {
		const onAddNew = vi.fn();
		const props = await gridPropsFor(ALL, { gridProps: { onAddNew } }, false);
		expect(typeof props.onAddNew).toBe("function");
		act(() => (props.onAddNew as () => void)());
		expect(onAddNew).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3507-ITEM-1] without a record page, newPermissionHint is not shown to a user who may create", async () => {
		const props = await gridPropsFor(
			ALL,
			{ newPermissionHint: "NO-NEW" },
			false,
		);
		expect(props.onAddNew).not.toBe("NO-NEW");
	});

	it("[ISSUE-3507-ITEM-1] without a record page and without onAddNew, a user who may create gets no New", async () => {
		const props = await gridPropsFor(ALL, {}, false);
		expect(props.onAddNew).toBeUndefined();
	});

	it("[ISSUE-3507-ITEM-1] without a record page, a string onAddNew is passed on as is", async () => {
		const props = await gridPropsFor(
			ALL,
			{ gridProps: { onAddNew: "NOT NOW" } },
			false,
		);
		expect(props.onAddNew).toBe("NOT NOW");
	});

	it("[ISSUE-3507-ITEM-1] without a record page, an onAddNew array gives the grid its buttons", async () => {
		const first = vi.fn();
		const gridProps: GridProps = {
			onAddNew: [
				{ label: "Add briefing", onClick: first },
				{ label: "Disabled", onClick: undefined, disableHint: "LATER" },
			],
		};
		const props = await gridPropsFor(ALL, { gridProps }, false);
		const buttons = props.onAddNew as {
			label: string;
			onClick?: () => void;
			disableHint?: string;
		}[];
		expect(buttons.map((b) => b.label)).toEqual(["Add briefing", "Disabled"]);
		expect(buttons[1].onClick).toBeUndefined();
		act(() => buttons[0].onClick!());
		expect(first).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3507-ITEM-1] without a record page, a user without the new permission gets newPermissionHint instead of onAddNew", async () => {
		const onAddNew = vi.fn();
		const props = await gridPropsFor(
			["crud.read"],
			{ gridProps: { onAddNew }, newPermissionHint: "NO-NEW" },
			false,
		);
		expect(props.onAddNew).toBe("NO-NEW");
	});

	it("[ISSUE-3507-ITEM-1] without a record page, a user without the new permission and no hint gets no New", async () => {
		const props = await gridPropsFor(
			["crud.read"],
			{ gridProps: { onAddNew: vi.fn<(showNew: () => void) => void>() } },
			false,
		);
		expect(props.onAddNew).toBeUndefined();
	});
});
