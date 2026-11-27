import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor } from "storybook/test";
import { Box, Button, Grid } from "@mui/material";
import { createMemoryHistory } from "history";
import { Framework, usePermissionContext } from "../../framework";
import CRUD, {
	CrudDispatch,
	CrudFormProps,
	useCrudDispatchContext,
} from "./index";
import FormField from "../Form/Field";
import DefaultFormPage from "../Form/DefaultFormPage";
import DefaultErrorComponent from "../Form/DefaultErrorComponent";
import createTestModel from "../../stories/test-utils/TestModel";
import { ModelUnknown } from "../../backend-integration";
import type { PageProps } from "../Form/Form";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<div style={{ width: "100vw", height: "100vh" }}>
			<Story />
		</div>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/CRUD",
	decorators: [FrameworkDecorator],
	parameters: { layout: "fullscreen" },
};

export default meta;

/**
 * axe for a story that ends on the grid: every violation fails the story,
 * except the grid's own, which are filed already
 */
const GRID_A11Y = {
	test: "error",
	options: {
		rules: {
			// the virtualized rows have no cells (ISSUE-3472-ITEM-11)
			"aria-required-children": { enabled: false },
			// the search field and the row checkboxes have no name (ISSUE-3492-ITEM-25, ISSUE-3493-ITEM-13)
			label: { enabled: false },
			// the header's select-all checkbox while some rows are selected is only
			// aria-checked="mixed", not indeterminate (ISSUE-3482-ITEM-2)
			"aria-conditional-attr": { enabled: false },
			// the captions of the disabled Edit and Delete buttons: inactive
			// controls, which WCAG 1.4.3 exempts
			"color-contrast": { enabled: false },
		},
	},
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CrudFormContent = (_props: PageProps<ModelUnknown, CrudFormProps>) => (
	<Grid container spacing={2}>
		<Grid size={{ xs: 6 }}>
			<FormField name="first_name" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="last_name" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="email" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="department" />
		</Grid>
	</Grid>
);

/**
 * The record page with DefaultFormPage's footer (Back, Save)
 */
const CrudFormPage = (props: PageProps<ModelUnknown, CrudFormProps>) => (
	<DefaultFormPage {...props}>
		<CrudFormContent {...props} />
	</DefaultFormPage>
);

const PermissionSetter = (props: { children: React.ReactNode }) => {
	const [, setPerms] = usePermissionContext();
	useEffect(() => {
		setPerms([
			"crud.delete",
			"crud.read",
			"crud.edit",
			"crud.new",
			"crud.export",
		]);
	}, [setPerms]);
	return <>{props.children}</>;
};

const CrudStoryContent = (props: { page?: typeof CrudFormContent }) => {
	const model = useMemo(createTestModel, []);
	return (
		<PermissionSetter>
			<CRUD
				model={model}
				formProps={{ errorComponent: DefaultErrorComponent }}
				gridProps={{}}
				deletePermission="crud.delete"
				readPermission="crud.read"
				editPermission="crud.edit"
				newPermission="crud.new"
				exportPermission="crud.export"
				disableRouting
			>
				{props.page ?? CrudFormContent}
			</CRUD>
		</PermissionSetter>
	);
};

export const FullCrud: StoryObj = {
	render: () => <CrudStoryContent />,
};

const ReadOnlyCrudContent = () => {
	const model = useMemo(createTestModel, []);
	return (
		<PermissionSetter>
			<CRUD
				model={model}
				formProps={{ errorComponent: DefaultErrorComponent }}
				gridProps={{}}
				deletePermission="no-permission"
				readPermission="crud.read"
				editPermission="no-permission"
				newPermission="no-permission"
				exportPermission="crud.export"
				disableRouting
			>
				{CrudFormContent}
			</CRUD>
		</PermissionSetter>
	);
};

export const ReadOnly: StoryObj = {
	render: () => <ReadOnlyCrudContent />,
};

/**
 * Reads the query of the grid behind the form, the way a "next record" button
 * would to stay within the rows the user sees
 */
const GridQueryProbe = () => {
	const { getGridQuery } = useCrudDispatchContext();
	const [query, setQuery] = useState("");
	const showQuery = useCallback(
		() => setQuery(JSON.stringify(getGridQuery() ?? null)),
		[getGridQuery],
	);
	return (
		<>
			<Button onClick={showQuery} variant={"contained"}>
				Show grid query
			</Button>
			<pre data-testid={"grid-query"}>{query}</pre>
		</>
	);
};

const GridQueryFormContent = () => (
	<Grid container spacing={2}>
		<Grid size={{ xs: 6 }}>
			<FormField name="first_name" />
		</Grid>
		<Grid size={{ xs: 12 }}>
			<GridQueryProbe />
		</Grid>
	</Grid>
);

// what the link opening the CRUD sets
const GRID_QUERY_GRID_PROPS = {
	overrideCustomData: { department: "Engineering" },
};

const GridQueryCrudContent = () => {
	const model = useMemo(createTestModel, []);
	return (
		<PermissionSetter>
			<CRUD
				model={model}
				formProps={{ errorComponent: DefaultErrorComponent }}
				gridProps={GRID_QUERY_GRID_PROPS}
				deletePermission="crud.delete"
				readPermission="crud.read"
				editPermission="crud.edit"
				newPermission="crud.new"
				exportPermission="crud.export"
				disableRouting
			>
				{GridQueryFormContent}
			</CRUD>
		</PermissionSetter>
	);
};

/**
 * The form gets the query of the grid behind it from the CRUD dispatch,
 * including what an override set - without any persistence provider
 */
export const GridQueryFromForm: StoryObj = {
	render: () => <GridQueryCrudContent />,
	play: async ({ canvas }) => {
		await userEvent.dblClick(await canvas.findByText("Alice"));
		await userEvent.click(
			await canvas.findByRole("button", { name: "Show grid query" }),
		);
		await expect(
			JSON.parse(canvas.getByTestId("grid-query").textContent ?? "") as unknown,
		).toEqual({
			quickFilter: "",
			additionalFilters: { department: "Engineering" },
			fieldFilter: {},
			sort: [],
		});
	},
};

const LocationProbe = () => (
	<div data-testid={"location"}>{useLocation().pathname}</div>
);

const RoutedCrudContent = () => {
	const model = useMemo(createTestModel, []);
	const history = useMemo(
		() => createMemoryHistory({ initialEntries: ["/people"] }),
		[],
	);
	return (
		<HistoryRouter history={history}>
			<PermissionSetter>
				<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
					<LocationProbe />
					<Box sx={{ flex: 1, minHeight: 0 }}>
						<Routes>
							{[
								<Route
									key={"people"}
									path={"/people/*"}
									element={
										<CRUD
											model={model}
											formProps={{ errorComponent: DefaultErrorComponent }}
											gridProps={{}}
											deletePermission="crud.delete"
											readPermission="crud.read"
											editPermission="crud.edit"
											newPermission="crud.new"
											exportPermission="crud.export"
										>
											{CrudFormPage}
										</CRUD>
									}
								/>,
							]}
						</Routes>
					</Box>
				</Box>
			</PermissionSetter>
		</HistoryRouter>
	);
};

/**
 * ISSUE-3507-ITEM-16: opening a record hides the focused Edit button with the grid, and
 * focus falls to the page; Back leaves it there instead of returning it to
 * Edit
 */
export const Issue3507Item16FocusMovesIntoRecordAndBack: StoryObj = {
	render: () => <CrudStoryContent page={CrudFormPage} />,
	parameters: { a11y: GRID_A11Y },
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(await canvas.findByText("Alice"));
		const edit = canvas.getByRole("button", { name: "Edit" });
		await waitFor(() => expect(edit).toBeEnabled());
		edit.focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByDisplayValue("Alice", undefined, { timeout: 5000 });
		// focus is in the record view: not on the page, not in the hidden grid
		await waitFor(() => expect(document.activeElement).not.toBe(document.body));
		const hiddenGrid = canvasElement.querySelector(".Mui-hidden");
		await expect(hiddenGrid?.contains(document.activeElement)).toBe(false);
		const back = canvas.getByRole("button", { name: "Back" });
		back.focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(canvas.getByText("Carol")).toBeVisible());
		// focus is back on the control that opened the record
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Edit" })).toHaveFocus(),
		);
	},
};

/**
 * ISSUE-3507-ITEM-16: routed, opening a record at `/people/1` moves the focus into
 * it as well, and Back to `/people` returns it to Edit
 */
export const Issue3507Item16RoutedFocusMovesIntoRecordAndBack: StoryObj = {
	render: () => <RoutedCrudContent />,
	parameters: { a11y: GRID_A11Y },
	play: async ({ canvas, canvasElement }) => {
		const location = () => canvas.getByTestId("location");
		await userEvent.click(await canvas.findByText("Alice"));
		const edit = canvas.getByRole("button", { name: "Edit" });
		await waitFor(() => expect(edit).toBeEnabled());
		edit.focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(location()).toHaveTextContent("/people/1"));
		const input = await canvas.findByDisplayValue("Alice", undefined, {
			timeout: 5000,
		});
		// the focus is on the record view's container, before its first field
		await expect(document.activeElement).not.toBe(document.body);
		await expect(document.activeElement?.contains(input)).toBe(true);
		const hiddenGrid = canvasElement.querySelector(".Mui-hidden");
		await expect(hiddenGrid?.contains(document.activeElement)).toBe(false);
		const back = canvas.getByRole("button", { name: "Back" });
		back.focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(location()).toHaveTextContent(/^\/people$/));
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Edit" })).toHaveFocus(),
		);
	},
};

type PlayContext = Parameters<NonNullable<StoryObj["play"]>>[0];

/**
 * Opens Alice's record with Enter on the footer's Edit
 * @returns The record page's first name field, and the element that has the focus then
 */
const openAliceByKeyboard = async (canvas: PlayContext["canvas"]) => {
	await userEvent.click(await canvas.findByText("Alice"));
	const edit = canvas.getByRole("button", { name: "Edit" });
	await waitFor(() => expect(edit).toBeEnabled());
	edit.focus();
	await userEvent.keyboard("{Enter}");
	const input = await canvas.findByDisplayValue("Alice", undefined, {
		timeout: 5000,
	});
	return { input, focused: document.activeElement as HTMLElement };
};

/**
 * ISSUE-3507-ITEM-16: the record view's container takes the focus without becoming a tab
 * stop: Tab goes on to its first field, and the container is not focusable after that
 */
export const Issue3507Item16TabFromRecordViewGoesToFirstField: StoryObj = {
	render: () => <CrudStoryContent page={CrudFormPage} />,
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const { input, focused } = await openAliceByKeyboard(canvas);
		await expect(focused).not.toBe(document.body);
		await expect(focused.contains(input)).toBe(true);
		await expect(focused).toHaveAttribute("tabindex", "-1");
		await userEvent.tab();
		await expect(input).toHaveFocus();
		await expect(focused).not.toHaveAttribute("tabindex");
	},
};

/**
 * ISSUE-3507-ITEM-16: a click into the record view, here on the space between its fields,
 * takes the focus from its container, as on a page without one; the browser then goes on
 * with Tab from the point clicked
 */
export const Issue3507Item16ClickInRecordViewLeavesItsContainer: StoryObj = {
	render: () => <CrudStoryContent page={CrudFormPage} />,
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const { input, focused } = await openAliceByKeyboard(canvas);
		await expect(focused.contains(input)).toBe(true);
		await expect(focused).toHaveAttribute("tabindex", "-1");
		const fields = input.closest<HTMLElement>(".MuiGrid-container");
		await expect(fields).not.toBeNull();
		await userEvent.click(fields!);
		await expect(focused).not.toHaveFocus();
		await expect(focused).not.toHaveAttribute("tabindex");
	},
};

const NoBackgroundGridContent = () => {
	const model = useMemo(createTestModel, []);
	return (
		<PermissionSetter>
			<CRUD
				model={model}
				formProps={{ errorComponent: DefaultErrorComponent }}
				gridProps={{}}
				deletePermission="crud.delete"
				readPermission="crud.read"
				editPermission="crud.edit"
				newPermission="crud.new"
				exportPermission="crud.export"
				disableRouting
				disableBackgroundGrid
			>
				{CrudFormPage}
			</CRUD>
		</PermissionSetter>
	);
};

/**
 * ISSUE-3507-ITEM-16: with disableBackgroundGrid the list is mounted anew after Back,
 * without the Edit that opened the record: the focus goes to the list's container
 */
export const Issue3507Item16NoBackgroundGridFocusReturnsToTheList: StoryObj = {
	render: () => <NoBackgroundGridContent />,
	parameters: { a11y: GRID_A11Y },
	play: async ({ canvas }) => {
		await userEvent.click(await canvas.findByText("Alice"));
		const edit = canvas.getByRole("button", { name: "Edit" });
		await waitFor(() => expect(edit).toBeEnabled());
		edit.focus();
		await userEvent.keyboard("{Enter}");
		const input = await canvas.findByDisplayValue("Alice", undefined, {
			timeout: 5000,
		});
		await expect(document.activeElement).not.toBe(document.body);
		await expect(document.activeElement?.contains(input)).toBe(true);
		const back = canvas.getByRole("button", { name: "Back" });
		back.focus();
		await userEvent.keyboard("{Enter}");
		const row = await canvas.findByText("Alice");
		await expect(document.activeElement).not.toBe(document.body);
		await expect(document.activeElement?.contains(row)).toBe(true);
	},
};

const OutsideControlsContent = () => {
	const model = useMemo(createTestModel, []);
	const crud = useRef<CrudDispatch>(null);
	const openAlice = useCallback(() => crud.current?.openView("1"), []);
	const showList = useCallback(() => crud.current?.showOverview(), []);
	return (
		<PermissionSetter>
			<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<Box>
					<Button onClick={openAlice}>Open Alice</Button>
					<Button onClick={showList}>Show list</Button>
				</Box>
				<Box sx={{ flex: 1, minHeight: 0 }}>
					<CRUD
						ref={crud}
						model={model}
						formProps={{ errorComponent: DefaultErrorComponent }}
						gridProps={{}}
						deletePermission="crud.delete"
						readPermission="crud.read"
						editPermission="crud.edit"
						newPermission="crud.new"
						exportPermission="crud.export"
						disableRouting
					>
						{CrudFormPage}
					</CRUD>
				</Box>
			</Box>
		</PermissionSetter>
	);
};

/**
 * ISSUE-3507-ITEM-16: a view switch started from a control outside the CRUD (its ref's
 * openView and showOverview) leaves the focus on that control
 */
export const Issue3507Item16FocusOutsideTheCrudStays: StoryObj = {
	render: () => <OutsideControlsContent />,
	parameters: { a11y: GRID_A11Y },
	play: async ({ canvas }) => {
		await canvas.findByText("Alice");
		const open = canvas.getByRole("button", { name: "Open Alice" });
		open.focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByDisplayValue("Alice", undefined, { timeout: 5000 });
		await expect(open).toHaveFocus();
		const showList = canvas.getByRole("button", { name: "Show list" });
		showList.focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(canvas.getByText("Carol")).toBeVisible());
		await expect(showList).toHaveFocus();
	},
};
